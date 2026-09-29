import React, { useState, useMemo } from 'react';
import { Check, Plus, ChevronDown, ChevronUp, Scale } from 'lucide-react';

export interface RecommendedClauseSpec {
  id: string;
  label: string;
  sectionHint: string;
  keywords: RegExp;
  defaultClauseTitle: string;
  defaultClauseBody: string;
}

interface DocumentTypeBenchmark {
  categoryName: string;
  recommendedTotal: number;
  clauses: RecommendedClauseSpec[];
}

const COMMON_FOUNDATION_CLAUSES: RecommendedClauseSpec[] = [
  {
    id: 'definitions',
    label: 'Formal Definitions (Sec. 1)',
    sectionHint: '1. Definitions',
    keywords: /\b1\.\s*DEFINITIONS\b|\b1\.1\b.*means\b/i,
    defaultClauseTitle: 'Defined Terms and Interpretation',
    defaultClauseBody:
      'Capitalized terms used in this Agreement shall have the meanings ascribed to them in Section 1 or elsewhere herein, and rules of strict construction shall not be applied against either drafting Party.',
  },
  {
    id: 'confidentiality',
    label: 'Confidentiality & Non-Disclosure',
    sectionHint: '2. Obligations',
    keywords: /confidential information|strict confidence|non-disclosure/i,
    defaultClauseTitle: 'Confidentiality and Non-Disclosure',
    defaultClauseBody:
      'Each Party agrees to hold the other Party’s Confidential Information in strict confidence for a period of three (3) years following disclosure and not to disclose such information to any unauthorized third party.',
  },
  {
    id: 'term-termination',
    label: 'Term & Termination Notice (Sec. 3)',
    sectionHint: '3. Term & Termination',
    keywords: /\b3\.\s*TERM\b|termination|prior written notice/i,
    defaultClauseTitle: 'Termination and Cure Period',
    defaultClauseBody:
      'Either Party may terminate this Agreement upon thirty (30) days prior written notice for convenience, or immediately upon written notice if the other Party fails to cure a material breach within fifteen (15) days of notice.',
  },
  {
    id: 'governing-law',
    label: 'Governing Law & Venue (Sec. 4)',
    sectionHint: '4. Governing Law',
    keywords: /governing law|governed by and construed|jurisdiction/i,
    defaultClauseTitle: 'Governing Law and Judicial Venue',
    defaultClauseBody:
      'This Agreement shall be governed by and construed in accordance with the internal laws of the Governing Jurisdiction specified herein, without giving effect to conflict of law principles.',
  },
  {
    id: 'indemnification',
    label: 'Indemnification & Liability Cap',
    sectionHint: '5. General Provisions',
    keywords: /indemnif|limitation of liability|aggregate liability|harmless/i,
    defaultClauseTitle: 'Mutual Indemnification and Limitation of Liability',
    defaultClauseBody:
      'Each Party shall indemnify, defend, and hold harmless the other Party from third-party claims arising from gross negligence or willful misconduct. Neither Party shall be liable for indirect, incidental, or consequential damages.',
  },
  {
    id: 'entire-agreement',
    label: 'Entire Agreement & Severability',
    sectionHint: '5. General Provisions',
    keywords: /entire agreement|severability|supersedes all prior/i,
    defaultClauseTitle: 'Entire Agreement, Amendments, and Severability',
    defaultClauseBody:
      'This Agreement constitutes the entire agreement between the Parties concerning the subject matter hereof, may only be amended by a signed writing, and any invalid provision shall be severed without affecting the remainder.',
  },
  {
    id: 'signatures',
    label: 'Attestation & Signature Blocks',
    sectionHint: 'Execution',
    keywords: /IN WITNESS WHEREOF|By:\s*_{4,}/i,
    defaultClauseTitle: 'Counterparts and Electronic Execution',
    defaultClauseBody:
      'IN WITNESS WHEREOF, the Parties have executed this Agreement via authorized representatives as of the Effective Date. Electronic signatures shall carry the same legal effect as original ink signatures.',
  },
];

export function getBenchmarkForDocumentType(documentType: string): DocumentTypeBenchmark {
  const lower = documentType.toLowerCase();

  if (lower.includes('employment')) {
    return {
      categoryName: 'Employment Agreement Standard',
      recommendedTotal: 15,
      clauses: [
        {
          id: 'emp-duties',
          label: 'Position, Scope & Reporting Duties',
          sectionHint: '2.1',
          keywords: /position and duties|employ|report directly|best efforts/i,
          defaultClauseTitle: 'Position and Executive Duties',
          defaultClauseBody:
            'Employer hereby employs Employee in the designated capacity, and Employee shall devote full business time, skill, and best efforts to the faithful performance of assigned responsibilities.',
        },
        {
          id: 'emp-comp',
          label: 'Base Salary & Payroll Schedule',
          sectionHint: '2.3',
          keywords: /base salary|compensation|per annum|bi-weekly|monthly|withholding/i,
          defaultClauseTitle: 'Compensation and Benefits',
          defaultClauseBody:
            'Employer shall pay Employee the agreed Base Salary in regular installments in accordance with standard payroll practices, subject to statutory tax withholdings, plus accrued Paid Time Off.',
        },
        {
          id: 'emp-ip',
          label: 'Work-for-Hire IP Assignment',
          sectionHint: '2.5',
          keywords: /work product|work made for hire|intellectual property|irrevocably assigns/i,
          defaultClauseTitle: 'Intellectual Property and Work Product Assignment',
          defaultClauseBody:
            'All Work Product conceived or developed by Employee during the Term relating to Employer’s business shall be deemed "work made for hire" and is hereby irrevocably assigned to Employer.',
        },
        {
          id: 'emp-return',
          label: 'Return of Company Property',
          sectionHint: '3.4',
          keywords: /return of company property|return to employer|credentials|hardware/i,
          defaultClauseTitle: 'Return of Company Property',
          defaultClauseBody:
            'Upon termination of employment for any reason, Employee shall immediately return all Company hardware, security keys, documents, and electronic records containing Confidential Information.',
        },
        {
          id: 'emp-nonsolicit',
          label: 'Non-Solicitation Covenant',
          sectionHint: '2.6',
          keywords: /non-solicitation|solicit or hire|induce any employee/i,
          defaultClauseTitle: 'Non-Solicitation of Personnel and Clients',
          defaultClauseBody:
            'During the Term and for twelve (12) months following termination, Employee shall not directly or indirectly solicit or induce any employee or contractor of Employer to terminate their engagement.',
        },
        ...COMMON_FOUNDATION_CLAUSES,
      ],
    };
  }

  if (lower.includes('nda') || lower.includes('non-disclosure') || lower.includes('confidential')) {
    return {
      categoryName: 'Mutual NDA Standard',
      recommendedTotal: 11,
      clauses: [
        {
          id: 'nda-exclusions',
          label: 'Standard Confidentiality Exclusions',
          sectionHint: '1.3',
          keywords: /exclusions|publicly known|independently developed|rightfully in/i,
          defaultClauseTitle: 'Exclusions from Confidential Information',
          defaultClauseBody:
            'Confidential Information shall not include information that is publicly available through no fault of the Receiving Party, already lawfully in its possession, or independently developed without reference to disclosed materials.',
        },
        {
          id: 'nda-reverse',
          label: 'Restriction on Reverse Engineering',
          sectionHint: '2.2',
          keywords: /reverse engineer|decompile|disassemble|permitted purpose/i,
          defaultClauseTitle: 'Restriction on Use and Reverse Engineering',
          defaultClauseBody:
            'The Receiving Party shall use Confidential Information solely for the Permitted Purpose and shall not decompile, disassemble, or reverse engineer any software, samples, or prototypes.',
        },
        {
          id: 'nda-compelled',
          label: 'Compelled Disclosure / Subpoena Notice',
          sectionHint: '2.3',
          keywords: /compelled disclosure|subpoena|court order|protective order/i,
          defaultClauseTitle: 'Legally Compelled Disclosure',
          defaultClauseBody:
            'If the Receiving Party is required by judicial order or subpoena to disclose Confidential Information, it shall give prompt prior written notice to allow the Disclosing Party to seek a protective order.',
        },
        {
          id: 'nda-destruction',
          label: 'Return or Certified Destruction',
          sectionHint: '2.4',
          keywords: /return or destroy|permanently destroy|certify such destruction/i,
          defaultClauseTitle: 'Return or Certified Destruction of Materials',
          defaultClauseBody:
            'Within ten (10) business days of written request, the Receiving Party shall return or permanently destroy all tangible and electronic copies of Confidential Information and certify destruction in writing.',
        },
        {
          id: 'nda-injunctive',
          label: 'Equitable & Injunctive Relief',
          sectionHint: '4.2',
          keywords: /injunctive|equitable relief|irreparable harm|without.*bond/i,
          defaultClauseTitle: 'Irreparable Harm and Equitable Relief',
          defaultClauseBody:
            'Each Party acknowledges that a breach of confidentiality may cause irreparable harm for which monetary damages are inadequate, entitling the Disclosing Party to seek immediate injunctive relief without bond.',
        },
        ...COMMON_FOUNDATION_CLAUSES,
      ],
    };
  }

  if (lower.includes('contractor') || lower.includes('service') || lower.includes('consulting') || lower.includes('msa')) {
    return {
      categoryName: 'Commercial Services / MSA Standard',
      recommendedTotal: 11,
      clauses: [
        {
          id: 'srv-scope',
          label: 'Scope of Services & Workmanlike Standard',
          sectionHint: '2.1',
          keywords: /scope of services|workmanlike|deliverables|professional manner/i,
          defaultClauseTitle: 'Scope of Services and Performance Warranty',
          defaultClauseBody:
            'Contractor shall perform the Services and deliver all Deliverables in a timely, diligent, and workmanlike manner consistent with highest commercial industry standards.',
        },
        {
          id: 'srv-payment',
          label: 'Invoicing, Retainer & Late Interest',
          sectionHint: '2.2',
          keywords: /retainer|invoic|payable|late interest|fee/i,
          defaultClauseTitle: 'Compensation, Invoicing, and Late Payment',
          defaultClauseBody:
            'Client shall pay Contractor the agreed compensation in accordance with the invoicing schedule. Undisputed overdue balances shall accrue interest at 1.5% per month.',
        },
        {
          id: 'srv-ic-status',
          label: 'Independent Contractor & Tax Status',
          sectionHint: '2.3',
          keywords: /independent contractor|employer-employee|taxes|withholding/i,
          defaultClauseTitle: 'Independent Contractor Relationship',
          defaultClauseBody:
            'Contractor is an independent contractor and not an employee or agent of Client. Contractor is solely responsible for all federal, state, and local taxes, insurance, and benefits.',
        },
        {
          id: 'srv-ip',
          label: 'Deliverables Ownership & Background IP',
          sectionHint: '2.4',
          keywords: /background technology|assigns to client|royalty-free|deliverables/i,
          defaultClauseTitle: 'Intellectual Property and Background Technology License',
          defaultClauseBody:
            'Upon full payment, Contractor assigns to Client all rights in custom Deliverables, while retaining ownership of pre-existing Background Technology with a perpetual royalty-free license to Client.',
        },
        ...COMMON_FOUNDATION_CLAUSES,
      ],
    };
  }

  if (lower.includes('lease') || lower.includes('rental') || lower.includes('tenant')) {
    return {
      categoryName: 'Commercial Lease Standard',
      recommendedTotal: 10,
      clauses: [
        {
          id: 'lease-rent',
          label: 'Base Rent, Escalation & Security Deposit',
          sectionHint: '2.1–2.2',
          keywords: /base rent|security deposit|escalation|calendar month/i,
          defaultClauseTitle: 'Base Rent, Escalation, and Security Deposit',
          defaultClauseBody:
            'Tenant shall pay Landlord the monthly Base Rent in advance on the first day of each month, subject to the agreed annual escalation and secured by the Security Deposit.',
        },
        {
          id: 'lease-maintenance',
          label: 'Premises Maintenance & Alterations',
          sectionHint: '2.3',
          keywords: /maintenance|repairs|alterations|hvac|structural/i,
          defaultClauseTitle: 'Maintenance, Repairs, and Structural Alterations',
          defaultClauseBody:
            'Landlord shall maintain structural elements and common building systems, while Tenant shall maintain the interior Premises in good order and make no structural alterations without consent.',
        },
        {
          id: 'lease-default',
          label: 'Default, Cure Windows & Remedies',
          sectionHint: '3.2',
          keywords: /default|delinquency|possession|remedies/i,
          defaultClauseTitle: 'Events of Default and Landlord Remedies',
          defaultClauseBody:
            'If Tenant fails to pay rent within five (5) business days of written notice or fails to cure a non-monetary default within thirty (30) days, Landlord may exercise all statutory and equitable remedies.',
        },
        ...COMMON_FOUNDATION_CLAUSES,
      ],
    };
  }

  // Default Comprehensive Commercial Contract Benchmark
  return {
    categoryName: 'Commercial Contract Standard',
    recommendedTotal: 12,
    clauses: [
      {
        id: 'gen-obligations',
        label: 'Principal Commercial Obligations (Sec. 2)',
        sectionHint: '2.1',
        keywords: /\b2\.\s*OBLIGATIONS\b|duties|undertakings|covenants/i,
        defaultClauseTitle: 'Principal Commercial Obligations',
        defaultClauseBody:
          'Each Party shall perform its respective covenants, deliverables, and commercial undertakings in good faith and in compliance with all applicable laws.',
      },
      {
        id: 'gen-financial',
        label: 'Consideration & Payment Terms',
        sectionHint: '2.2',
        keywords: /consideration|payment|compensation|fee|salary|dollar|\$/i,
        defaultClauseTitle: 'Consideration and Financial Settlement',
        defaultClauseBody:
          'All financial consideration payable hereunder shall be remitted timely in lawful currency in accordance with the agreed schedule.',
      },
      {
        id: 'gen-ip',
        label: 'Proprietary & Intellectual Property Rights',
        sectionHint: '2.4',
        keywords: /intellectual property|proprietary|ownership|work product|license/i,
        defaultClauseTitle: 'Proprietary Rights and Ownership',
        defaultClauseBody:
          'Each Party retains title to its pre-existing intellectual property, and any custom deliverables created hereunder shall vest in accordance with the agreed commercial terms.',
      },
      ...COMMON_FOUNDATION_CLAUSES,
    ],
  };
}

interface ClauseCompletenessTrackerProps {
  documentType: string;
  documentText: string;
  activeSubClauseCount: number;
  activeSectionCount: number;
  onInsertClause: (clauseTitle: string, clauseBody: string) => void;
}

export const ClauseCompletenessTracker: React.FC<ClauseCompletenessTrackerProps> = ({
  documentType,
  documentText,
  activeSubClauseCount,
  activeSectionCount,
  onInsertClause,
}) => {
  const [expandedChecklist, setExpandedChecklist] = useState<boolean>(false);

  const benchmark = useMemo(
    () => getBenchmarkForDocumentType(documentType),
    [documentType]
  );

  // Evaluate which recommended clauses are present in the live document
  const evaluatedChecklist = useMemo(() => {
    return benchmark.clauses.map((spec) => ({
      ...spec,
      isPresent: spec.keywords.test(documentText),
    }));
  }, [benchmark, documentText]);

  const matchedCoreCount = evaluatedChecklist.filter((c) => c.isPresent).length;
  const totalCoreChecklist = evaluatedChecklist.length;

  // Calculate active numbered legal clauses vs recommended target for the chosen document type
  const recommendedClauseTarget = benchmark.recommendedTotal;
  const activeClauses = activeSubClauseCount;

  // Coverage percentage blends numbered clause density with core checklist coverage
  const numberedRatio =
    recommendedClauseTarget > 0
      ? Math.min(1, activeClauses / recommendedClauseTarget)
      : 0;
  const checklistRatio =
    totalCoreChecklist > 0 ? matchedCoreCount / totalCoreChecklist : 0;

  // Primary counter ratio: Active clauses vs Recommended clauses
  const rawCoveragePercent =
    documentText.trim().length === 0
      ? 0
      : Math.min(100, Math.round((numberedRatio * 0.5 + checklistRatio * 0.5) * 100));

  const missingClauses = evaluatedChecklist.filter((c) => !c.isPresent);

  // Color semantics based on completeness
  const barColorClass =
    rawCoveragePercent >= 90
      ? 'bg-emerald-400'
      : rawCoveragePercent >= 65
        ? 'bg-amber-400'
        : 'bg-rose-400';

  const statusLabel =
    rawCoveragePercent >= 95 && missingClauses.length === 0
      ? 'Comprehensive Coverage'
      : rawCoveragePercent >= 75
        ? 'Substantial Coverage'
        : rawCoveragePercent > 0
          ? 'Partial Draft — Clauses Recommended'
          : 'Awaiting Clauses';

  const statusTextColor =
    rawCoveragePercent >= 90
      ? 'text-emerald-300'
      : rawCoveragePercent >= 65
        ? 'text-amber-300'
        : 'text-rose-300';

  return (
    <div className="no-print bg-[#111827] border border-slate-800/90 rounded-xl p-4 flex flex-col gap-3">
      {/* Top Row: Title, Active vs Recommended Counter, Status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                Contract Completeness & Clause Density
              </h3>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                · {benchmark.categoryName}
              </span>
            </div>
          </div>
        </div>

        {/* Tabular Counter Readout */}
        <div className="flex items-center gap-3 font-mono-num text-xs">
          <div className="px-2.5 py-1 rounded-md bg-[#0B0F19] border border-slate-800 text-slate-200">
            <span className="font-semibold text-amber-300">{activeClauses}</span>
            <span className="text-slate-500"> / </span>
            <span className="font-semibold text-slate-100">{recommendedClauseTarget}</span>
            <span className="text-slate-400 ml-1.5">Active / Recommended Clauses</span>
          </div>

          <div className="hidden sm:block px-2.5 py-1 rounded-md bg-[#0B0F19] border border-slate-800 text-slate-300">
            <span className="font-semibold text-emerald-300">{matchedCoreCount}</span>
            <span className="text-slate-500">/{totalCoreChecklist}</span>
            <span className="text-slate-400 ml-1">Core Provisions</span>
          </div>

          <span className={`font-semibold ${statusTextColor}`}>
            {rawCoveragePercent}%
          </span>
        </div>
      </div>

      {/* Visual Segmented + Continuous Progress Bar */}
      <div className="space-y-1.5">
        <div
          role="progressbar"
          aria-valuenow={rawCoveragePercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Contract Clause Completeness Progress"
          className="w-full h-2.5 bg-[#0B0F19] border border-slate-800 rounded-md overflow-hidden p-0.5"
        >
          <div
            className={`h-full rounded-sm transition-all duration-300 ${barColorClass}`}
            style={{ width: `${Math.max(rawCoveragePercent, documentText.trim() ? 4 : 0)}%` }}
          />
        </div>

        {/* Sub-bar Metadata & Expand Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-2 font-mono-num">
            <span className={statusTextColor}>{statusLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{activeSectionCount} Major Sections</span>
            <span aria-hidden="true">·</span>
            <span>
              {missingClauses.length === 0
                ? 'All recommended core provisions verified'
                : `${missingClauses.length} recommended provision${missingClauses.length === 1 ? '' : 's'} missing`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExpandedChecklist((prev) => !prev)}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>
              {expandedChecklist
                ? 'Hide Clause Audit'
                : `Audit Recommended Clauses (${matchedCoreCount}/${totalCoreChecklist})`}
            </span>
            {expandedChecklist ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Missing Clause Alert Bar (When not expanded and clauses are missing) */}
      {!expandedChecklist && missingClauses.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400">
            Click to insert missing recommended clauses for <strong className="text-slate-200 font-medium">{documentType}</strong>:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {missingClauses.slice(0, 3).map((missing) => (
              <button
                key={missing.id}
                type="button"
                onClick={() =>
                  onInsertClause(missing.defaultClauseTitle, missing.defaultClauseBody)
                }
                className="px-2.5 py-1 text-[11px] font-medium bg-[#0B0F19] hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{missing.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Full Clause Audit Grid */}
      {expandedChecklist && (
        <div className="pt-3 border-t border-slate-800/90 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Real-time verification of recommended provisions for <strong className="text-slate-200">{documentType}</strong>
            </span>
            <span className="font-mono-num">
              Click any missing provision to append a formal numbered clause
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {evaluatedChecklist.map((item) => (
              <div
                key={item.id}
                className={`px-3 py-2 rounded-lg border flex items-center justify-between gap-2 text-xs ${
                  item.isPresent
                    ? 'bg-[#0B0F19]/70 border-slate-800 text-slate-200'
                    : 'bg-amber-950/15 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.isPresent ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-xs bg-amber-400 shrink-0" />
                  )}
                  <span className="truncate font-medium">{item.label}</span>
                </div>

                {item.isPresent ? (
                  <span className="text-[11px] font-mono-num text-emerald-400/90 shrink-0">
                    Active
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onInsertClause(item.defaultClauseTitle, item.defaultClauseBody)
                    }
                    className="px-2 py-0.5 text-[11px] font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Insert</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
