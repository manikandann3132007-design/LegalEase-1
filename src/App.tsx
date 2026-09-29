/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  Wand2,
  RotateCcw,
  FileSpreadsheet,
  SlidersHorizontal,
  History,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import {
  DOCUMENT_TYPE_SUGGESTIONS,
  JURISDICTION_OPTIONS,
  STANCE_OPTIONS,
  QUICK_CLAUSE_SNIPPETS,
  LEGAL_PRESETS,
  LegalPreset,
} from './data/legalPresets';
import { RichLegalPreview } from './components/RichLegalPreview';
import { ClauseCompletenessTracker } from './components/ClauseCompletenessTracker';
import { downloadAsTxt, downloadAsDocx } from './utils/exportDocument';
import {
  synthesizeStructuredLegalContract,
  applyFallbackRefinement,
} from './utils/legalSynthesisFallback';

interface SavedDraft {
  id: string;
  title: string;
  documentType: string;
  partiesInvolved: string;
  keyTerms: string;
  effectiveDate: string;
  jurisdiction: string;
  documentText: string;
  updatedAt: string;
}

const STORAGE_KEY = 'legalease_saved_drafts_v1';

export default function App() {
  const initialPreset = LEGAL_PRESETS[0];

  // Form Input State
  const [documentType, setDocumentType] = useState<string>(initialPreset.documentType);
  const [partiesInvolved, setPartiesInvolved] = useState<string>(initialPreset.partiesInvolved);
  const [keyTerms, setKeyTerms] = useState<string>(initialPreset.keyTerms);
  const [effectiveDate, setEffectiveDate] = useState<string>(initialPreset.effectiveDate);
  const [jurisdiction, setJurisdiction] = useState<string>(initialPreset.jurisdiction);
  const [protectiveStance, setProtectiveStance] = useState<string>(initialPreset.protectiveStance);

  // Document Output & Live Editable State
  const [documentText, setDocumentText] = useState<string>(initialPreset.sampleDocument);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string>('2026-09-29T08:00:00.000Z');

  // UI & Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refinementInput, setRefinementInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Workspace View Controls
  const [workspaceMode, setWorkspaceMode] = useState<'split' | 'preview' | 'editor'>('split');
  const [paperTheme, setPaperTheme] = useState<'parchment-light' | 'obsidian-dark'>('parchment-light');
  const [showDraftHistory, setShowDraftHistory] = useState<boolean>(false);

  // Saved Drafts in LocalStorage
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore storage errors
    }
    return LEGAL_PRESETS.map((preset) => ({
      id: preset.id,
      title: `${preset.label} — ${preset.partiesInvolved.split('(')[0].trim()}`,
      documentType: preset.documentType,
      partiesInvolved: preset.partiesInvolved,
      keyTerms: preset.keyTerms,
      effectiveDate: preset.effectiveDate,
      jurisdiction: preset.jurisdiction,
      documentText: preset.sampleDocument,
      updatedAt: '2026-10-01',
    }));
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDrafts));
    } catch {
      // Ignore storage errors
    }
  }, [savedDrafts]);

  // Document Metrics (Tabular Numerals)
  const metrics = useMemo(() => {
    const trimmed = documentText.trim();
    if (!trimmed) {
      return { words: 0, chars: 0, clauses: 0, sections: 0 };
    }
    const words = trimmed.split(/\s+/).length;
    const chars = trimmed.length;
    const lines = trimmed.split('\n');
    const clauses = lines.filter((l) => /^\s*\d+\.\d+/.test(l)).length;
    const sections = lines.filter(
      (l) => /^\s*\d+\.\s+[A-Z]/.test(l) && !/^\s*\d+\.\d+/.test(l)
    ).length;
    return { words, chars, clauses, sections };
  }, [documentText]);

  const showTemporaryStatus = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => {
      setStatusNotice((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleLoadPreset = (preset: LegalPreset) => {
    setErrorMessage(null);
    setDocumentType(preset.documentType);
    setPartiesInvolved(preset.partiesInvolved);
    setKeyTerms(preset.keyTerms);
    setEffectiveDate(preset.effectiveDate);
    setJurisdiction(preset.jurisdiction);
    setProtectiveStance(preset.protectiveStance);
    setDocumentText(preset.sampleDocument);
    showTemporaryStatus(`Loaded preset: ${preset.label}`);
  };

  const handleResetBlank = () => {
    setErrorMessage(null);
    setDocumentType('Non-Disclosure Agreement (NDA)');
    setPartiesInvolved('John Doe (Employer) and Jane Smith (Employee)');
    setKeyTerms('Monthly salary $5,000; Confidentiality for 2 years; Notice period 30 days');
    setEffectiveDate('2026-10-01');
    setJurisdiction('State of Delaware, United States');
    setProtectiveStance('Balanced & Mutual');
    showTemporaryStatus('Form populated with starter parameters — click Generate Document');
  };

  const handleAppendClauseSnippet = (clauseText: string) => {
    setKeyTerms((prev) => {
      const cleanPrev = prev.trim();
      if (!cleanPrev) return clauseText;
      const separator = cleanPrev.endsWith(';') || cleanPrev.endsWith('.') ? ' ' : '; ';
      return `${cleanPrev}${separator}${clauseText}`;
    });
  };

  const handleSaveCurrentDraft = (textToSave: string) => {
    const firstParty = partiesInvolved.split('and')[0]?.replace(/\(.*\)/, '').trim() || 'Counterparty';
    const newDraft: SavedDraft = {
      id: `draft-${Date.now()}`,
      title: `${documentType} — ${firstParty.slice(0, 32)}`,
      documentType,
      partiesInvolved,
      keyTerms,
      effectiveDate,
      jurisdiction,
      documentText: textToSave,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setSavedDrafts((prev) => [newDraft, ...prev.slice(0, 14)]);
  };

  const handleGenerateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!documentType.trim() || !partiesInvolved.trim()) {
      setErrorMessage('Please specify both the Document Type and the Parties Involved.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: documentType.trim(),
          partiesInvolved: partiesInvolved.trim(),
          keyTerms: keyTerms.trim(),
          effectiveDate,
          jurisdiction,
          protectiveStance,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate document with Gemini AI.');
      }

      if (data.documentText) {
        setDocumentText(data.documentText);
        setLastGeneratedAt(data.generatedAt || new Date().toISOString());
        handleSaveCurrentDraft(data.documentText);
        showTemporaryStatus('Legal agreement generated and saved to Draft History');
      }
    } catch {
      const fallbackDoc = synthesizeStructuredLegalContract({
        documentType: documentType.trim(),
        partiesInvolved: partiesInvolved.trim(),
        keyTerms: keyTerms.trim(),
        effectiveDate,
        jurisdiction,
        protectiveStance,
      });
      setDocumentText(fallbackDoc);
      setLastGeneratedAt(new Date().toISOString());
      handleSaveCurrentDraft(fallbackDoc);
      showTemporaryStatus('Legal agreement generated via resilient fallback engine');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineDocument = async (customInstruction?: string) => {
    const instructionToRun = (customInstruction ?? refinementInput).trim();
    if (!instructionToRun || !documentText.trim()) return;

    setErrorMessage(null);
    setIsRefining(true);
    try {
      const response = await fetch('/api/refine-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDocument: documentText,
          instruction: instructionToRun,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to refine legal document.');
      }

      if (data.documentText) {
        setDocumentText(data.documentText);
        setLastGeneratedAt(data.generatedAt || new Date().toISOString());
        setRefinementInput('');
        handleSaveCurrentDraft(data.documentText);
        showTemporaryStatus(`Applied revision: "${instructionToRun.slice(0, 42)}"`);
      }
    } catch {
      const revisedDoc = applyFallbackRefinement(documentText, instructionToRun);
      setDocumentText(revisedDoc);
      setLastGeneratedAt(new Date().toISOString());
      setRefinementInput('');
      handleSaveCurrentDraft(revisedDoc);
      showTemporaryStatus(`Applied revision: "${instructionToRun.slice(0, 42)}"`);
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(documentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage('Clipboard access was denied by the browser.');
    }
  };

  const handleDeleteDraft = (id: string) => {
    setSavedDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleInsertRecommendedClause = (clauseTitle: string, clauseBody: string) => {
    setDocumentText((prev) => {
      const lines = prev.split('\n');
      // Find the highest major section number and sub-clause number to assign the next logical clause number
      let lastMajorSection = 5;
      let lastMinorNumber = 0;

      for (const line of lines) {
        const match = line.trim().match(/^(\d+)\.(\d+)\s+/);
        if (match) {
          const maj = parseInt(match[1], 10);
          const min = parseInt(match[2], 10);
          if (maj > lastMajorSection || (maj === lastMajorSection && min > lastMinorNumber)) {
            lastMajorSection = maj;
            lastMinorNumber = min;
          }
        }
      }

      const nextClauseNumber = `${lastMajorSection}.${lastMinorNumber + 1}`;
      const formattedClause = `${nextClauseNumber} ${clauseTitle}. ${clauseBody}`;

      const witnessIdx = prev.indexOf('IN WITNESS WHEREOF');
      if (witnessIdx !== -1) {
        const before = prev.slice(0, witnessIdx).trimEnd();
        const after = prev.slice(witnessIdx);
        return `${before}\n\n${formattedClause}\n\n${after}`;
      }

      return `${prev.trimEnd()}\n\n${formattedClause}`;
    });

    showTemporaryStatus(`Inserted clause: ${clauseTitle}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Clean Nav Links) — Zone 3 (Primary Actions) */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setShowDraftHistory(false);
          }}
          className="font-display text-2xl font-bold tracking-tight text-slate-50 whitespace-nowrap"
        >
          LegalEase
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          {LEGAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleLoadPreset(preset)}
              className={`hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap cursor-pointer ${
                documentType === preset.documentType ? 'text-amber-400' : ''
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowDraftHistory((prev) => !prev)}
            className={`hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap cursor-pointer ${
              showDraftHistory ? 'text-amber-400' : ''
            }`}
          >
            Saved Drafts ({savedDrafts.length})
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetBlank}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 border border-slate-700/80 rounded-lg hover:bg-slate-800/70 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            Quick Sample Fill
          </button>
          <button
            type="button"
            onClick={() => downloadAsDocx(documentText, documentType)}
            disabled={!documentText.trim()}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 disabled:opacity-40 transition-colors whitespace-nowrap cursor-pointer"
          >
            Export .DOCX
          </button>
        </div>
      </header>

      {/* Hero / Workspace Identity Banner */}
      <section className="no-print border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-[#0B0F19] px-6 py-5">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span>Corporate & Commercial Drafting Desk</span>
              <span aria-hidden="true">·</span>
              <span>Gemini Legal Engine</span>
              <span aria-hidden="true">·</span>
              <span>Standardized Clause Numbering</span>
            </div>
            <h1
              className="font-display text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              LegalEase — AI-Powered Legal Document Generator
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Generate, customize, and export formal legal agreements with structured definitions, obligations, governing law clauses, and live inline editing.
            </p>
          </div>

          {/* Live Document Telemetry (Unboxed Tabular Metadata) */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono-num">
            <span>{metrics.sections} Sections</span>
            <span aria-hidden="true">·</span>
            <span>{metrics.clauses} Numbered Clauses</span>
            <span aria-hidden="true">·</span>
            <span>{metrics.words.toLocaleString()} Words</span>
            <span aria-hidden="true">·</span>
            <span>{metrics.chars.toLocaleString()} Characters</span>
          </div>
        </div>
      </section>

      {/* Optional Saved Drafts Drawer */}
      {showDraftHistory && (
        <section className="no-print border-b border-slate-800 bg-slate-900/80 px-6 py-4">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-slate-200">
                  Saved Draft History ({savedDrafts.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDraftHistory(false)}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
            {savedDrafts.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                No saved drafts yet. Generate a document to save it automatically.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {savedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-3.5 rounded-lg border border-slate-800 bg-[#0F1626] flex flex-col justify-between gap-2 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-100 truncate">
                        {draft.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-num mt-1 flex items-center gap-1.5">
                        <span>{draft.effectiveDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{draft.jurisdiction}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => {
                          setDocumentType(draft.documentType);
                          setPartiesInvolved(draft.partiesInvolved);
                          setKeyTerms(draft.keyTerms);
                          setEffectiveDate(draft.effectiveDate);
                          setJurisdiction(draft.jurisdiction);
                          setDocumentText(draft.documentText);
                          setShowDraftHistory(false);
                          showTemporaryStatus(`Restored draft: ${draft.title}`);
                        }}
                        className="text-xs font-medium text-amber-400 hover:text-amber-300 cursor-pointer"
                      >
                        Load into Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDraft(draft.id)}
                        aria-label="Delete saved draft"
                        className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Two-Column Workbench Canvas */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Input Form & Parameters (5 cols on lg) */}
        <section className="no-print lg:col-span-5 bg-[#111827] border border-slate-800/90 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                1. Contract Specifications
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Define parties, commercial terms, and governing law
              </p>
            </div>
            <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
          </div>

          {/* Preset Quick-Loader Bar */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Quick-Load Legal Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-900/90 rounded-lg border border-slate-800/80">
              {LEGAL_PRESETS.map((preset) => {
                const isActive = documentType === preset.documentType;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleLoadPreset(preset)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap truncate cursor-pointer ${
                      isActive
                        ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleGenerateDocument} className="space-y-4">
            {/* Document Type: Dropdown + Custom Text Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="document-type-input"
                  className="block text-xs font-semibold text-slate-200"
                >
                  Document Type
                </label>
                <span className="text-[11px] text-slate-400">
                  Select preset or type custom
                </span>
              </div>

              <div className="space-y-2">
                <select
                  aria-label="Predefined Document Types"
                  value={
                    DOCUMENT_TYPE_SUGGESTIONS.includes(documentType)
                      ? documentType
                      : '__custom__'
                  }
                  onChange={(e) => {
                    if (e.target.value !== '__custom__') {
                      setDocumentType(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0B0F19] border border-slate-700/90 rounded-lg text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
                >
                  {DOCUMENT_TYPE_SUGGESTIONS.map((type) => (
                    <option key={type} value={type} className="bg-[#0B0F19] text-slate-100">
                      {type}
                    </option>
                  ))}
                  <option value="__custom__" className="bg-[#0B0F19] text-amber-300">
                    Custom Agreement Type...
                  </option>
                </select>

                <input
                  id="document-type-input"
                  type="text"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  placeholder="e.g., Mutual NDA, Employment Agreement, Service Contract, Lease Agreement"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0B0F19] border border-slate-700/90 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Parties Involved */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="parties-involved-input"
                  className="block text-xs font-semibold text-slate-200"
                >
                  Parties Involved
                </label>
                <span className="text-[11px] text-slate-400">
                  Full legal names & roles
                </span>
              </div>
              <textarea
                id="parties-involved-input"
                rows={3}
                value={partiesInvolved}
                onChange={(e) => setPartiesInvolved(e.target.value)}
                placeholder='e.g., "John Doe (Employer) and Jane Smith (Employee)"'
                required
                className="w-full px-3.5 py-2.5 text-sm bg-[#0B0F19] border border-slate-700/90 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed resize-y"
              />
            </div>

            {/* Key Terms & Clauses */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="key-terms-input"
                  className="block text-xs font-semibold text-slate-200"
                >
                  Key Terms & Clauses
                </label>
                <span className="text-[11px] text-slate-400">
                  Elaborated into formal legal clauses
                </span>
              </div>
              <textarea
                id="key-terms-input"
                rows={4}
                value={keyTerms}
                onChange={(e) => setKeyTerms(e.target.value)}
                placeholder='e.g., "Monthly salary $5,000; Confidentiality for 2 years; Notice period 30 days"'
                className="w-full px-3.5 py-2.5 text-sm bg-[#0B0F19] border border-slate-700/90 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed resize-y"
              />

              {/* Interactive Quick-Insert Clause Buttons */}
              <div className="mt-2">
                <div className="text-[11px] text-slate-400 mb-1.5">
                  Click to append standard protective provisions:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CLAUSE_SNIPPETS.map((snippet) => (
                    <button
                      key={snippet.id}
                      type="button"
                      onClick={() => handleAppendClauseSnippet(snippet.clauseText)}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-amber-300 border border-slate-700/80 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {snippet.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Effective Date & Governing Law Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="effective-date-input"
                  className="block text-xs font-semibold text-slate-200 mb-1.5"
                >
                  Effective Date
                </label>
                <input
                  id="effective-date-input"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-[#0B0F19] border border-slate-700/90 rounded-lg text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="jurisdiction-select"
                  className="block text-xs font-semibold text-slate-200 mb-1.5"
                >
                  Governing Law (Section 4)
                </label>
                <select
                  id="jurisdiction-select"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0B0F19] border border-slate-700/90 rounded-lg text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
                >
                  {JURISDICTION_OPTIONS.map((j) => (
                    <option key={j} value={j} className="bg-[#0B0F19] text-slate-100">
                      {j}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drafting Stance Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Drafting Stance
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {STANCE_OPTIONS.map((stance) => (
                  <button
                    key={stance}
                    type="button"
                    onClick={() => setProtectiveStance(stance)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left truncate transition-colors cursor-pointer ${
                      protectiveStance === stance
                        ? 'bg-amber-400/15 border-amber-400/50 text-amber-300'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {stance}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-rose-100">Drafting Notice</div>
                  <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Primary Action Button: Generate Document */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 px-5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-colors cursor-pointer"
              >
                <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>
                  {isGenerating
                    ? 'Drafting Formal Legal Agreement with Gemini AI...'
                    : 'Generate Document'}
                </span>
              </button>
            </div>

            {/* Structure Assurance Footnote */}
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              Includes formal Title, Preamble & Recitals,{' '}
              <span className="text-slate-300">1. Definitions</span>,{' '}
              <span className="text-slate-300">2. Obligations</span>,{' '}
              <span className="text-slate-300">3. Term & Termination</span>,{' '}
              <span className="text-slate-300">4. Governing Law</span>, hierarchical clause numbers, and Signature Blocks.
            </div>
          </form>
        </section>

        {/* RIGHT PANEL: Preview & Live Editor Section (7 cols on lg) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* Action & View Mode Toolbar */}
          <div className="no-print bg-[#111827] border border-slate-800/90 rounded-xl p-4 flex flex-col gap-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Segmented View Selector */}
              <div className="flex items-center gap-1 p-1 bg-[#0B0F19] rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('split')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    workspaceMode === 'split'
                      ? 'bg-slate-800 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Split View (Preview + Live Editor)
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('preview')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    workspaceMode === 'preview'
                      ? 'bg-slate-800 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Rich Folio Preview
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('editor')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    workspaceMode === 'editor'
                      ? 'bg-slate-800 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Full Live Editor
                </button>
              </div>

              {/* Export Options & Utilities */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPaperTheme((prev) =>
                      prev === 'parchment-light' ? 'obsidian-dark' : 'parchment-light'
                    )
                  }
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#0B0F19] hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  {paperTheme === 'parchment-light' ? 'Dark Folio' : 'Parchment Folio'}
                </button>

                <button
                  type="button"
                  onClick={handleCopyText}
                  disabled={!documentText.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#0B0F19] hover:bg-slate-800 border border-slate-700/80 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  disabled={!documentText.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#0B0F19] hover:bg-slate-800 border border-slate-700/80 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadAsTxt(documentText, documentType)}
                  disabled={!documentText.trim()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-600/80 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>.TXT</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadAsDocx(documentText, documentType)}
                  disabled={!documentText.trim()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>.DOCX</span>
                </button>
              </div>
            </div>

            {/* AI Counsel Revision Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRefineDocument();
                  }
                }}
                placeholder='Ask Gemini Counsel to revise draft (e.g., "Add mutual indemnification and a 15-day cure period")...'
                className="flex-1 px-3 py-2 text-xs bg-[#0B0F19] border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => handleRefineDocument()}
                disabled={isRefining || !refinementInput.trim()}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 border border-slate-700 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
              >
                {isRefining ? 'Revising Draft...' : 'Apply AI Revision'}
              </button>
            </div>

            {/* Status Toast Notice */}
            {statusNotice && (
              <div className="text-xs text-emerald-300 font-medium flex items-center justify-between pt-1">
                <span>{statusNotice}</span>
                <span className="font-mono-num text-[11px] text-slate-400">
                  Synced {new Date(lastGeneratedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>

          {/* Loading Skeleton Overlay when Generating */}
          {isGenerating && (
            <div className="no-print bg-[#111827] border border-amber-500/30 rounded-xl p-6 space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Gemini Legal Engine — Synthesizing Contract Clauses...
                </span>
                <span className="text-xs font-mono-num text-slate-400">
                  Structuring Sections 1–5
                </span>
              </div>
              <div className="h-6 bg-slate-800 rounded w-2/3 mx-auto" />
              <div className="space-y-2 pt-2">
                <div className="h-3.5 bg-slate-800/90 rounded w-full" />
                <div className="h-3.5 bg-slate-800/90 rounded w-11/12" />
                <div className="h-3.5 bg-slate-800/90 rounded w-4/5" />
              </div>
            </div>
          )}

          {/* Visual Clause Completeness Progress Bar & Counter Above the Editor */}
          <ClauseCompletenessTracker
            documentType={documentType}
            documentText={documentText}
            activeSubClauseCount={metrics.clauses}
            activeSectionCount={metrics.sections}
            onInsertClause={handleInsertRecommendedClause}
          />

          {/* Live Editable Area (Shown in 'split' and 'editor' modes) */}
          {(workspaceMode === 'split' || workspaceMode === 'editor') && (
            <div className="no-print bg-[#111827] border border-slate-800/90 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-semibold text-slate-100">
                    Live Editable Area
                  </h2>
                  <span className="text-xs text-slate-400">
                    · Edits sync immediately with Rich Preview & exports
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const matched = LEGAL_PRESETS.find((p) => p.documentType === documentType);
                    if (matched) {
                      setDocumentText(matched.sampleDocument);
                      showTemporaryStatus('Reverted text to template baseline');
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Text</span>
                </button>
              </div>

              <textarea
                id="live-document-editor"
                aria-label="Live Editable Legal Document Text"
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                rows={workspaceMode === 'editor' ? 28 : 12}
                placeholder="Generated legal contract will appear here for real-time inline editing..."
                className="w-full p-4 text-sm font-mono-num leading-relaxed bg-[#0B0F19] text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-400/80 resize-y"
              />
            </div>
          )}

          {/* Rich Document Preview (Shown in 'split' and 'preview' modes) */}
          {(workspaceMode === 'split' || workspaceMode === 'preview') && (
            <div className="bg-[#111827] border border-slate-800/90 rounded-xl p-5 flex flex-col gap-3">
              <div className="no-print flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    Rich Document Preview
                  </h2>
                  <p className="text-xs text-slate-400">
                    Formatted legal folio with section headings, numbered clauses, and signature blocks
                  </p>
                </div>
                <div className="text-xs font-mono-num text-slate-400">
                  Ready for .TXT / .DOCX Export
                </div>
              </div>

              <RichLegalPreview
                documentText={documentText}
                documentType={documentType}
                effectiveDate={effectiveDate}
                jurisdiction={jurisdiction}
                paperTheme={paperTheme}
              />
            </div>
          )}
        </section>
      </main>

      {/* Quiet Legal Disclaimer Footer */}
      <footer className="no-print mt-auto border-t border-slate-800/80 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            LegalEase AI Document Generator · Automated contract drafts are provided for informational and drafting convenience and do not constitute formal legal representation.
          </span>
          <span className="font-mono-num">UTF-8 · OpenXML (.DOCX) & Plain Text (.TXT)</span>
        </div>
      </footer>
    </div>
  );
}
