import React from 'react';

interface RichLegalPreviewProps {
  documentText: string;
  documentType: string;
  effectiveDate: string;
  jurisdiction: string;
  paperTheme: 'parchment-light' | 'obsidian-dark';
}

export const RichLegalPreview: React.FC<RichLegalPreviewProps> = ({
  documentText,
  documentType,
  effectiveDate,
  jurisdiction,
  paperTheme,
}) => {
  const lines = documentText.replace(/\r\n/g, '\n').split('\n');

  const isLightPaper = paperTheme === 'parchment-light';

  // Helper to highlight defined terms in quotes and WHEREAS / NOW, THEREFORE
  const formatLegalInline = (text: string) => {
    // Match RECITAL keywords at start of line
    const recitalMatch = text.match(/^(WHEREAS,|NOW, THEREFORE,|IN WITNESS WHEREOF,)(.*)$/);
    if (recitalMatch) {
      return (
        <>
          <span className="font-semibold tracking-wide uppercase text-[0.92em]">
            {recitalMatch[1]}
          </span>
          {recitalMatch[2]}
        </>
      );
    }

    // Highlight quoted defined terms like ("Employer") or "Confidential Information"
    const parts = text.split(/("[^"]{2,45}")/g);
    return parts.map((part, idx) => {
      if (part.startsWith('"') && part.endsWith('"')) {
        return (
          <span
            key={idx}
            className={
              isLightPaper
                ? 'font-semibold text-slate-900'
                : 'font-semibold text-amber-200/95'
            }
          >
            {part}
          </span>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  return (
    <div
      className={`print-only-folio relative rounded-lg border transition-colors duration-150 ${
        isLightPaper
          ? 'bg-[#FAF8F5] text-slate-900 border-slate-300 shadow-sm'
          : 'bg-[#0F1626] text-slate-100 border-slate-800/90'
      }`}
    >
      {/* Top Folio Margin Header */}
      <div
        className={`px-7 py-3.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs font-mono-num ${
          isLightPaper
            ? 'border-slate-200/90 text-slate-500 bg-[#F3EFEA]/60'
            : 'border-slate-800/80 text-slate-400 bg-slate-900/40'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>INSTRUMENT: {documentType.toUpperCase()}</span>
          <span aria-hidden="true">·</span>
          <span>EFFECTIVE: {effectiveDate || 'TBD'}</span>
        </div>
        <div>
          <span>JURISDICTION: {jurisdiction}</span>
        </div>
      </div>

      {/* Main Legal Document Body */}
      <div className="p-7 sm:p-10 font-legal leading-relaxed text-[15px] space-y-3.5">
        {lines.map((rawLine, idx) => {
          const line = rawLine.trim().replace(/^\*\*|\*\*$/g, '');

          if (!line) {
            return <div key={idx} className="h-1.5" />;
          }

          // 1. Formal Document Title (First non-empty line or all-caps title at top)
          if (idx === 0 || (idx < 3 && /^[A-Z\s\-&(),]{8,}$/.test(line))) {
            return (
              <div
                key={idx}
                className={`pb-5 mb-5 border-b-2 text-center ${
                  isLightPaper ? 'border-slate-800/80' : 'border-amber-500/40'
                }`}
              >
                <h2
                  className={`font-display text-2xl sm:text-[28px] font-bold tracking-wide uppercase ${
                    isLightPaper ? 'text-slate-950' : 'text-slate-50'
                  }`}
                >
                  {line}
                </h2>
              </div>
            );
          }

          // 2. Major Numbered Section Heading (e.g., "1. DEFINITIONS" or "2. Obligations")
          const sectionMatch = line.match(/^(\d+\.)\s+([A-Z][A-Za-z0-9\s,&\-/()]+)$/);
          if (sectionMatch && !/^\d+\.\d+/.test(line) && line.length < 95) {
            return (
              <div
                key={idx}
                className={`pt-5 pb-1.5 border-b ${
                  isLightPaper ? 'border-slate-200' : 'border-slate-800/80'
                }`}
              >
                <h3
                  className={`font-sans-ui text-sm sm:text-[15px] font-semibold tracking-wider uppercase flex items-baseline gap-2.5 ${
                    isLightPaper ? 'text-slate-900' : 'text-amber-400'
                  }`}
                >
                  <span className="font-mono-num">{sectionMatch[1]}</span>
                  <span>{sectionMatch[2]}</span>
                </h3>
              </div>
            );
          }

          // 3. Numbered Sub-Clause (e.g., "1.1 ...", "2.3 ...")
          const clauseMatch = line.match(/^(\d+\.\d+(?:\.\d+)?)\s+(.*)$/);
          if (clauseMatch) {
            const clauseNum = clauseMatch[1];
            const clauseRest = clauseMatch[2];

            // Check if clause starts with a short sub-heading ending in period (e.g., "2.1 Position and Duties. Employer hereby...")
            const subTitleMatch = clauseRest.match(/^([A-Z][A-Za-z\s,&\-/]{2,42}\.)\s+(.*)$/);

            return (
              <div key={idx} className="flex items-baseline gap-3 pl-1">
                <span
                  className={`font-mono-num text-xs font-medium shrink-0 select-none ${
                    isLightPaper ? 'text-slate-500' : 'text-amber-400/80'
                  }`}
                >
                  {clauseNum}
                </span>
                <p
                  className={`flex-1 ${
                    isLightPaper ? 'text-slate-800' : 'text-slate-200'
                  }`}
                >
                  {subTitleMatch ? (
                    <>
                      <span
                        className={`font-semibold ${
                          isLightPaper ? 'text-slate-950' : 'text-white'
                        }`}
                      >
                        {subTitleMatch[1]}{' '}
                      </span>
                      {formatLegalInline(subTitleMatch[2])}
                    </>
                  ) : (
                    formatLegalInline(clauseRest)
                  )}
                </p>
              </div>
            );
          }

          // 4. Lettered Sub-items like (a), (b), (c)
          const letterMatch = line.match(/^(\([a-z0-9]+\))\s+(.*)$/);
          if (letterMatch) {
            return (
              <div key={idx} className="flex items-baseline gap-2.5 pl-7">
                <span
                  className={`font-mono-num text-xs shrink-0 ${
                    isLightPaper ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {letterMatch[1]}
                </span>
                <p className={isLightPaper ? 'text-slate-800' : 'text-slate-200'}>
                  {formatLegalInline(letterMatch[2])}
                </p>
              </div>
            );
          }

          // 5. Signature Block Lines ("By: ____", "Name:", "Title:", "Date:", or Party Header in all caps at end)
          if (/^(By:|Name:|Title:|Date:|EMPLOYER:|EMPLOYEE:|FIRST PARTY:|SECOND PARTY:|CLIENT:|CONTRACTOR:|LANDLORD:|TENANT:|DISCLOSING PARTY:|RECEIVING PARTY:)/i.test(line)) {
            const isRoleHeader = /:$/.test(line);
            return (
              <div
                key={idx}
                className={`font-mono-num text-xs sm:text-[13px] ${
                  isRoleHeader
                    ? `pt-4 font-semibold tracking-wider uppercase ${
                        isLightPaper ? 'text-slate-900' : 'text-amber-300'
                      }`
                    : isLightPaper
                      ? 'text-slate-700'
                      : 'text-slate-300'
                }`}
              >
                {line}
              </div>
            );
          }

          // 6. Standard Paragraph / Preamble / Recitals
          return (
            <p
              key={idx}
              className={`leading-[1.72] ${
                isLightPaper ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              {formatLegalInline(line)}
            </p>
          );
        })}
      </div>
    </div>
  );
};
