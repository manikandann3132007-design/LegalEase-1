export interface ContractParameters {
  documentType: string;
  partiesInvolved: string;
  keyTerms: string;
  effectiveDate: string;
  jurisdiction: string;
  protectiveStance: string;
}

/**
 * Parses individual key terms (separated by semicolons, newlines, or bullets)
 * and elaborates each into a formal, numbered legal sub-clause.
 */
function elaborateKeyTermsIntoClauses(keyTermsRaw: string, startClauseIndex = 3): string[] {
  const rawItems = keyTermsRaw
    .split(/[;\n]+/)
    .map((item) => item.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  if (rawItems.length === 0) {
    return [
      `2.${startClauseIndex} Standard of Performance. Each Party shall perform its respective duties and obligations under this Agreement in good faith, in a timely and professional manner, and in full compliance with all applicable federal, state, and local laws and regulations.`,
    ];
  }

  return rawItems.map((term, idx) => {
    const clauseNum = `2.${startClauseIndex + idx}`;
    const lower = term.toLowerCase();

    if (lower.includes('salary') || lower.includes('retainer') || lower.includes('fee') || lower.includes('rent') || lower.includes('$') || lower.includes('payment') || lower.includes('compensation')) {
      return `${clauseNum} Compensation and Financial Terms. In consideration of the full and faithful performance of the obligations hereunder, the Parties expressly covenant and agree to the following financial provision: ${term}. All monetary payments shall be remitted in lawful currency of the United States in accordance with customary commercial accounting practices and subject to any applicable statutory withholdings.`;
    }

    if (lower.includes('confidential') || lower.includes('nda') || lower.includes('secret') || lower.includes('non-disclosure')) {
      return `${clauseNum} Confidentiality and Non-Disclosure Covenant. With respect to proprietary disclosures, the Parties stipulate as follows: ${term}. During such period, the Receiving Party shall exercise at least the same degree of care used to safeguard its own most sensitive proprietary assets, and in no event less than a reasonable standard of commercial care.`;
    }

    if (lower.includes('notice') || lower.includes('terminat') || lower.includes('cure') || lower.includes('month') || lower.includes('year') || lower.includes('day')) {
      return `${clauseNum} Timeframes, Notice, and Duration Covenants. The Parties expressly agree to be bound by the following temporal and procedural requirement: ${term}. Time is of the essence with respect to all notice periods, milestones, and compliance windows specified herein.`;
    }

    if (lower.includes('ip') || lower.includes('intellectual property') || lower.includes('work-for-hire') || lower.includes('work made for hire') || lower.includes('ownership') || lower.includes('deliverable')) {
      return `${clauseNum} Intellectual Property and Proprietary Rights. Regarding work product and proprietary assets: ${term}. Each Party agrees to execute any further instruments of assignment or registration reasonably necessary to perfect and enforce such proprietary rights worldwide.`;
    }

    // General custom term elaboration
    const cleanSentence = term.endsWith('.') ? term : `${term}.`;
    return `${clauseNum} Specific Commercial Covenant. The Parties expressly stipulate, covenant, and agree as follows: ${cleanSentence} This provision constitutes a material inducement for the Parties to enter into this Agreement and shall be enforceable to the fullest extent permitted by law.`;
  });
}

/**
 * Extracts clean party names and roles for signature blocks.
 */
function parsePartiesForSignatures(partiesInvolved: string): { label: string; name: string; role: string }[] {
  const parts = partiesInvolved
    .split(/\s+and\s+|\s*;\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return parts.slice(0, 2).map((part, idx) => {
      const roleMatch = part.match(/\(([^)]+)\)/);
      const role = roleMatch
        ? roleMatch[1].replace(/["']/g, '').trim().toUpperCase()
        : idx === 0
          ? 'FIRST PARTY'
          : 'SECOND PARTY';
      const cleanName = part.replace(/\([^)]*\)/g, '').replace(/,\s*$/, '').trim();
      return {
        label: role,
        name: cleanName.toUpperCase(),
        role: roleMatch ? roleMatch[1].replace(/["']/g, '').trim() : 'Authorized Signatory',
      };
    });
  }

  return [
    {
      label: 'FIRST PARTY',
      name: partiesInvolved.toUpperCase() || 'FIRST CONTRACTING PARTY',
      role: 'Authorized Signatory',
    },
    {
      label: 'SECOND PARTY',
      name: 'COUNTERPARTY REPRESENTATIVE',
      role: 'Authorized Signatory',
    },
  ];
}

/**
 * Synthesizes a complete, formally structured legal contract when remote AI models
 * are unreachable or overloaded (503/429), ensuring zero-error execution.
 */
export function synthesizeStructuredLegalContract(params: ContractParameters): string {
  const title = (params.documentType || 'LEGAL AGREEMENT').trim().toUpperCase();
  const effectiveDate = params.effectiveDate || new Date().toISOString().split('T')[0];
  const parties = params.partiesInvolved || 'First Contracting Party ("Party A") and Second Contracting Party ("Party B")';
  const jurisdiction = params.jurisdiction || 'State of Delaware, United States';
  const stance = params.protectiveStance || 'Balanced & Mutual';
  const elaboratedClauses = elaborateKeyTermsIntoClauses(params.keyTerms || '', 3);
  const signers = parsePartiesForSignatures(parties);

  return `${title}

This ${params.documentType || 'Legal Agreement'} (this "Agreement") is entered into and made effective as of ${effectiveDate} (the "Effective Date"), by and between ${parties} (each individually a "Party" and collectively the "Parties").

WHEREAS, the Parties desire to establish a formal, binding legal relationship governing their respective rights, duties, covenants, and commercial obligations under the framework of a ${params.documentType || 'commercial agreement'}; and

WHEREAS, each Party represents that it possesses full corporate or individual authority to enter into and perform this Agreement in accordance with a ${stance.toLowerCase()} allocation of commercial risk.

NOW, THEREFORE, in consideration of the mutual covenants, promises, representations, and warranties set forth herein, and for other good and valuable consideration, the receipt and legal sufficiency of which are hereby acknowledged, the Parties agree as follows:

1. DEFINITIONS

1.1 "Affiliate" means, with respect to any Party, any entity that directly or indirectly controls, is controlled by, or is under common control with such Party.

1.2 "Applicable Law" means all federal, state, provincial, municipal, or international statutes, codes, ordinances, rules, and judicial orders in effect within the ${jurisdiction}.

1.3 "Confidential Information" means all non-public, proprietary, technical, financial, commercial, or operational information disclosed by one Party ("Disclosing Party") to the other Party ("Receiving Party"), whether disclosed orally, visually, electronically, or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.

1.4 "Effective Date" means ${effectiveDate}, the date upon which this Agreement becomes legally binding and enforceable upon the Parties.

2. OBLIGATIONS

2.1 Scope of Principal Obligations. Each Party shall diligently, faithfully, and timely discharge all duties, deliverables, and undertakings assumed by such Party pursuant to the terms of this Agreement, in strict accordance with the highest prevailing industry standards.

2.2 Mutual Cooperation and Good Faith. The Parties shall cooperate in good faith and provide such timely approvals, notices, and information as may be reasonably required to effectuate the intent and commercial purpose of this Agreement.

${elaboratedClauses.join('\n\n')}

2.${elaboratedClauses.length + 3} Protection of Confidential Information. The Receiving Party shall: (a) hold all Confidential Information in strict confidence; (b) not disclose Confidential Information to any third party without the prior written consent of the Disclosing Party; and (c) use Confidential Information solely for the performance of this Agreement.

3. TERM & TERMINATION

3.1 Term of Agreement. This Agreement shall commence on the Effective Date (${effectiveDate}) and shall remain in full force and effect until completed or terminated in accordance with the provisions of this Section 3 (the "Term").

3.2 Termination for Convenience or Notice. Unless otherwise specified in Section 2, either Party may terminate this Agreement upon thirty (30) days prior written notice to the other Party, provided that all accrued financial and transition obligations through the effective date of termination are satisfied in full.

3.3 Termination for Material Breach. Either Party may terminate this Agreement immediately upon written notice if the other Party commits a material breach of any covenant, obligation, or warranty hereunder and fails to cure such breach within fifteen (15) days after receiving written notice specifying the nature of the breach.

3.4 Effect of Termination and Survival. Upon expiration or termination of this Agreement, each Party shall promptly return or certify the permanent destruction of all tangible and electronic records containing the other Party's Confidential Information. Sections 1, 2 (with respect to accrued obligations and confidentiality), 3.4, 4, and 5 shall survive any termination or expiration of this Agreement.

4. GOVERNING LAW

4.1 Governing Law. This Agreement, and all claims, disputes, or causes of action (whether in contract, tort, or statute) that may be based upon, arise out of, or relate to this Agreement or the negotiation, execution, or performance hereof, shall be governed by and construed in accordance with the internal laws of the ${jurisdiction}, without giving effect to any choice or conflict of law provision or rule.

4.2 Jurisdiction and Dispute Resolution. The Parties hereby irrevocably submit to the exclusive jurisdiction of the competent state and federal courts located within the ${jurisdiction} for the adjudication of any dispute arising hereunder. Prior to initiating formal litigation, senior executives of the Parties shall confer in good faith for a period of ten (10) business days to seek an amicable resolution.

4.3 Equitable Remedies. Each Party acknowledges that a breach of the confidentiality or proprietary rights provisions of this Agreement may cause irreparable harm for which monetary damages alone would be an inadequate remedy, and that the non-breaching Party shall be entitled to seek immediate injunctive or equitable relief without the necessity of posting bond.

5. GENERAL PROVISIONS

5.1 Entire Agreement. This Agreement constitutes the sole and entire agreement of the Parties with respect to the subject matter contained herein and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral.

5.2 Amendments and Waivers. No amendment, modification, or supplement to this Agreement shall be binding unless executed in writing by duly authorized representatives of both Parties. No waiver by any Party of any default or breach shall operate as a waiver of any subsequent default or breach.

5.3 Severability. If any term or provision of this Agreement is determined to be invalid, illegal, or unenforceable in any jurisdiction, such invalidity, illegality, or unenforceability shall not affect any other term or provision of this Agreement.

5.4 Counterparts and Electronic Signatures. This Agreement may be executed in two or more counterparts, each of which shall be deemed an original, and all of which together shall constitute one and the same instrument. Electronic or digital signatures shall have the same legal force and effect as original ink signatures.

IN WITNESS WHEREOF, the Parties hereto have caused this ${params.documentType || 'Agreement'} to be duly executed as of the Effective Date first written above.

${signers
  .map(
    (s) => `${s.label}:
${s.name}

By: ________________________________________
Name: ${s.name}
Title: ${s.role}
Date: ${effectiveDate}`
  )
  .join('\n\n\n')}`;
}

/**
 * Applies a structured counsel revision instruction to an existing legal document
 * when remote AI models are unreachable or overloaded.
 */
export function applyFallbackRefinement(currentDocument: string, instruction: string): string {
  const cleanInstruction = instruction.trim();
  if (!cleanInstruction) return currentDocument;

  const clauseHeading = `AMENDMENT / SUPPLEMENTAL PROVISION`;
  const elaboratedAddition = `Supplemental Covenant (${new Date().toISOString().slice(0, 10)}): Pursuant to explicit counsel instruction, the Parties further stipulate, covenant, and agree as follows: ${
    cleanInstruction.endsWith('.') ? cleanInstruction : `${cleanInstruction}.`
  } In the event of any conflict between this supplemental provision and any prior clause of this Agreement, this supplemental provision shall govern and control.`;

  // Insert right before "IN WITNESS WHEREOF" if present
  const witnessIndex = currentDocument.indexOf('IN WITNESS WHEREOF');
  if (witnessIndex !== -1) {
    const before = currentDocument.slice(0, witnessIndex).trimEnd();
    const after = currentDocument.slice(witnessIndex);
    return `${before}\n\n6. ${clauseHeading}\n\n6.1 ${elaboratedAddition}\n\n${after}`;
  }

  return `${currentDocument.trimEnd()}\n\n6. ${clauseHeading}\n\n6.1 ${elaboratedAddition}`;
}
