export interface LegalPreset {
  id: string;
  label: string;
  documentType: string;
  partiesInvolved: string;
  keyTerms: string;
  effectiveDate: string;
  jurisdiction: string;
  protectiveStance: string;
  sampleDocument: string;
}

export const DOCUMENT_TYPE_SUGGESTIONS: string[] = [
  'Mutual Non-Disclosure Agreement (NDA)',
  'Employment Agreement',
  'Independent Contractor / Service Contract',
  'Commercial Lease Agreement',
  'SaaS Master Services Agreement (MSA)',
  'Intellectual Property Assignment Agreement',
  'Consulting Retainer Agreement',
  'Founder Equity & Vesting Agreement',
];

export const JURISDICTION_OPTIONS: string[] = [
  'State of Delaware, United States',
  'State of New York, United States',
  'State of California, United States',
  'State of Texas, United States',
  'England and Wales, United Kingdom',
  'Province of Ontario, Canada',
  'Republic of Singapore',
];

export const STANCE_OPTIONS: string[] = [
  'Balanced & Mutual',
  'Pro-Disclosing / Pro-Employer',
  'Pro-Receiving / Pro-Contractor',
  'Strict Institutional Compliance',
];

export interface ClauseSnippet {
  id: string;
  label: string;
  clauseText: string;
}

export const QUICK_CLAUSE_SNIPPETS: ClauseSnippet[] = [
  {
    id: 'confidentiality-2yr',
    label: '+ 2-Year Confidentiality',
    clauseText: 'Strict confidentiality obligations surviving for 2 years following termination; exclusions for publicly available or independently developed information.',
  },
  {
    id: 'non-solicitation',
    label: '+ 12-Month Non-Solicitation',
    clauseText: 'Neither party shall solicit or hire key employees, contractors, or active clients of the other party during the term and for 12 months thereafter.',
  },
  {
    id: 'ip-assignment',
    label: '+ Work-for-Hire IP Assignment',
    clauseText: 'All deliverables, source code, inventions, and work product created under this agreement shall be deemed "work made for hire" and irrevocably assigned to the Hiring Party upon payment.',
  },
  {
    id: 'notice-30d',
    label: '+ 30-Day Notice Period',
    clauseText: 'Either party may terminate this Agreement for convenience upon 30 days prior written notice, or immediately upon uncured material breach after a 15-day cure period.',
  },
  {
    id: 'arbitration',
    label: '+ Binding Arbitration',
    clauseText: 'Any dispute arising under this Agreement shall be resolved by confidential binding arbitration administered by JAMS/AAA in the governing jurisdiction.',
  },
  {
    id: 'late-fee',
    label: '+ Net-30 & Late Interest',
    clauseText: 'Invoices are payable Net-30 days from receipt; overdue undisputed balances accrue interest at 1.5% per month or the maximum rate permitted by law.',
  },
];

export const LEGAL_PRESETS: LegalPreset[] = [
  {
    id: 'employment-agreement',
    label: 'Employment Agreement',
    documentType: 'Employment Agreement',
    partiesInvolved: 'Vanguard Horizon Technologies, Inc., a Delaware corporation ("Employer"), and Jordan Vance ("Employee")',
    keyTerms: 'Base salary of $145,000 per annum payable bi-weekly ($6,041.67/month); Position: Lead Systems Architect; Annual performance bonus up to 15% of base salary; Confidentiality obligation for 3 years post-termination; 30 days written notice period for termination without cause; 20 days paid time off per calendar year; Work-for-hire intellectual property assignment.',
    effectiveDate: '2026-10-01',
    jurisdiction: 'State of Delaware, United States',
    protectiveStance: 'Balanced & Mutual',
    sampleDocument: `EXECUTIVE EMPLOYMENT AGREEMENT

This Executive Employment Agreement (this "Agreement") is entered into and made effective as of October 1, 2026 (the "Effective Date"), by and between Vanguard Horizon Technologies, Inc., a Delaware corporation with its principal place of business in Wilmington, Delaware ("Employer" or the "Company"), and Jordan Vance, an individual residing in the United States ("Employee"). Employer and Employee may each be referred to herein individually as a "Party" and collectively as the "Parties."

WHEREAS, Employer desires to employ Employee in the capacity of Lead Systems Architect, and Employee desires to accept such employment upon the terms, covenants, and conditions set forth in this Agreement; and

WHEREAS, the Parties wish to establish clear standards governing compensation, proprietary rights, confidentiality obligations, and termination procedures.

NOW, THEREFORE, in consideration of the mutual covenants, promises, and obligations set forth herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:

1. DEFINITIONS

1.1 "Base Salary" means the annualized fixed gross compensation payable to Employee pursuant to Section 2.3 of this Agreement, excluding discretionary bonuses, equity grants, or benefit allowances.

1.2 "Cause" means (a) Employee's willful and continued failure to substantially perform assigned duties after fifteen (15) days written notice; (b) commission of an act of fraud, embezzlement, or material dishonesty against the Company; or (c) a material, uncured breach of the confidentiality or intellectual property provisions of this Agreement.

1.3 "Confidential Information" means all non-public, proprietary, technical, financial, strategic, or operational data disclosed by Employer to Employee, including without limitation system architectures, source code, algorithms, customer lists, pricing models, and product roadmaps.

1.4 "Work Product" means all inventions, software, designs, documentation, discoveries, and works of authorship conceived, developed, or reduced to practice by Employee, alone or with others, during the Term that relate to Employer's business or utilize Employer's resources.

2. OBLIGATIONS

2.1 Position and Duties. Employer hereby employs Employee as Lead Systems Architect, and Employee accepts such employment. Employee shall report directly to the Chief Technology Officer and shall diligently perform all architectural, engineering leadership, and technical oversight duties customary for such role.

2.2 Devotion of Time. During the Term, Employee shall devote Employee's full business time, attention, skill, and best efforts to the faithful performance of duties hereunder and shall not engage in any competing commercial activity without prior written consent of the Employer.

2.3 Compensation and Benefits.
(a) Base Salary: Employer shall pay Employee a Base Salary of One Hundred Forty-Five Thousand Dollars ($145,000.00) per annum (equivalent to approximately $12,083.33 per month), payable in regular bi-weekly installments in accordance with Employer's standard payroll practices and subject to applicable tax withholdings.
(b) Performance Bonus: Employee shall be eligible to receive an annual discretionary performance bonus of up to fifteen percent (15%) of Base Salary, contingent upon achievement of individual and corporate milestones established by the Board of Directors.
(c) Paid Time Off: Employee shall accrue twenty (20) days of paid time off ("PTO") per calendar year, in addition to recognized Company holidays.

2.4 Confidentiality Obligations. Employee acknowledges access to Confidential Information and covenants that, during the Term and for a period of three (3) years following termination of employment for any reason, Employee shall hold all Confidential Information in strict confidence and shall not disclose, publish, or utilize such information outside the scope of employment.

2.5 Intellectual Property Assignment. All Work Product shall be the sole and exclusive property of Employer and shall be deemed "work made for hire" to the fullest extent permitted by law. To the extent any Work Product does not qualify as a work made for hire, Employee hereby irrevocably assigns, transfers, and conveys to Employer all right, title, and interest worldwide in and to such Work Product.

3. TERM & TERMINATION

3.1 Term of Employment. Employee's employment under this Agreement shall commence on the Effective Date and shall continue on an indefinite basis until terminated by either Party in accordance with this Section 3 (the "Term").

3.2 Termination with Notice. Either Employer or Employee may terminate this Agreement without Cause at any time by providing at least thirty (30) days prior written notice to the other Party. Employer reserves the right, in its sole discretion, to place Employee on paid garden leave or pay Base Salary in lieu of all or part of the thirty (30) day notice period.

3.3 Termination for Cause. Employer may terminate Employee's employment immediately upon written notice for Cause, in which event Employee shall be entitled only to accrued and unpaid Base Salary and vested benefits through the effective date of termination.

3.4 Return of Company Property. Upon the expiration or termination of employment for any reason, Employee shall immediately return to Employer all hardware, security credentials, documents, records, and tangible or electronic copies containing Confidential Information.

4. GOVERNING LAW

4.1 Governing Law. This Agreement, and all claims or causes of action (whether in contract, tort, or statute) that may be based upon, arise out of, or relate to this Agreement, shall be governed by and construed in accordance with the internal laws of the State of Delaware, United States, without giving effect to any choice or conflict of law provision.

4.2 Dispute Resolution and Venue. Any controversy or claim arising out of or relating to this Agreement shall be brought exclusively in the state or federal courts located in New Castle County, Delaware, and each Party irrevocably submits to the personal jurisdiction of such courts.

5. GENERAL PROVISIONS

5.1 Entire Agreement. This Agreement constitutes the sole and entire agreement of the Parties with respect to the subject matter hereof and supersedes all prior understandings, offer letters, or representations, whether written or oral.

5.2 Amendments and Waivers. No amendment, modification, or waiver of any provision of this Agreement shall be effective unless set forth in a written instrument signed by both Parties.

5.3 Severability. If any term or provision of this Agreement is held invalid, illegal, or unenforceable in any jurisdiction, such invalidity shall not affect any other term or provision of this Agreement.

IN WITNESS WHEREOF, the Parties hereto have executed this Executive Employment Agreement as of the Effective Date first written above.

EMPLOYER:
VANGUARD HORIZON TECHNOLOGIES, INC.

By: ________________________________________
Name: Eleanor Sterling
Title: Chief Executive Officer
Date: ______________________________________


EMPLOYEE:
JORDAN VANCE

By: ________________________________________
Name: Jordan Vance
Title: Lead Systems Architect
Date: ______________________________________`,
  },
  {
    id: 'mutual-nda',
    label: 'Mutual NDA',
    documentType: 'Mutual Non-Disclosure Agreement (NDA)',
    partiesInvolved: 'Aetheris Quantum Labs LLC ("First Party") and Meridian Capital Partners LP ("Second Party")',
    keyTerms: 'Purpose: Evaluation of a potential Series B strategic investment and joint technology licensing partnership; Confidentiality survival period: 3 years from disclosure; Strict prohibition on reverse engineering of proprietary prototypes; Mandatory destruction or return of confidential materials within 10 business days of written request; Equitable injunctive relief without bond in event of breach.',
    effectiveDate: '2026-10-01',
    jurisdiction: 'State of New York, United States',
    protectiveStance: 'Balanced & Mutual',
    sampleDocument: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (this "Agreement") is entered into and made effective as of October 1, 2026 (the "Effective Date"), by and between Aetheris Quantum Labs LLC ("First Party") and Meridian Capital Partners LP ("Second Party"). First Party and Second Party may each be referred to herein as a "Disclosing Party" with respect to Confidential Information it discloses, a "Receiving Party" with respect to Confidential Information it receives, or collectively as the "Parties."

WHEREAS, the Parties desire to engage in discussions concerning a potential Series B strategic investment and joint technology licensing partnership (the "Permitted Purpose"); and

WHEREAS, in connection with the Permitted Purpose, each Party may disclose certain confidential and proprietary technical, financial, and commercial information to the other Party.

NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the Parties agree as follows:

1. DEFINITIONS

1.1 "Confidential Information" means any non-public data, trade secrets, financial models, technical specifications, hardware prototypes, source code, customer records, or business strategies disclosed by a Disclosing Party to a Receiving Party, whether orally, visually, or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information.

1.2 "Representatives" means a Party's directors, officers, employees, legal counsel, financial advisors, and accountants who have a strict need to know Confidential Information for the Permitted Purpose and are bound by written confidentiality obligations no less restrictive than those herein.

1.3 "Exclusions" means information that the Receiving Party can demonstrate by contemporaneous written records: (a) was publicly known at the time of disclosure through no breach of this Agreement; (b) was rightfully in the Receiving Party's possession free of any obligation of confidence prior to disclosure; or (c) was independently developed by the Receiving Party without reference to the Disclosing Party's Confidential Information.

2. OBLIGATIONS

2.1 Duty of Care and Non-Disclosure. The Receiving Party shall hold all Confidential Information in strict confidence using at least the same degree of care it uses to protect its own most sensitive proprietary information, but in no event less than a reasonable standard of care. The Receiving Party shall not disclose Confidential Information to any third party other than its authorized Representatives.

2.2 Restriction on Use and Reverse Engineering. The Receiving Party shall use Confidential Information solely for the Permitted Purpose. Neither Party shall decompile, disassemble, reverse engineer, or attempt to derive the composition or underlying structure of any prototypes, software, or samples provided hereunder.

2.3 Compelled Disclosure. If the Receiving Party is legally compelled by subpoena or court order to disclose any Confidential Information, it shall provide prompt prior written notice to the Disclosing Party so that the Disclosing Party may seek a protective order.

2.4 Return or Destruction of Materials. Within ten (10) business days of receipt of a written request from the Disclosing Party, the Receiving Party shall return or permanently destroy all tangible and electronic copies of Confidential Information and certify such destruction in writing.

3. TERM & TERMINATION

3.1 Term of Agreement. This Agreement shall govern all disclosures made from the Effective Date for a period of two (2) years, unless terminated earlier by either Party upon thirty (30) days prior written notice.

3.2 Survival of Confidentiality Obligations. Notwithstanding the expiration or termination of this Agreement, the Receiving Party's obligations of confidentiality and non-use with respect to any Confidential Information disclosed prior to termination shall survive for a period of three (3) years from the date of disclosure (and indefinitely with respect to statutory trade secrets).

4. GOVERNING LAW

4.1 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of laws principles.

4.2 Equitable Relief and Venue. Each Party acknowledges that any breach of this Agreement may cause irreparable harm for which monetary damages alone would be inadequate. Accordingly, the Disclosing Party shall be entitled to seek immediate injunctive or equitable relief without the necessity of posting a bond, in the state or federal courts located in New York County, New York.

IN WITNESS WHEREOF, the Parties have caused this Mutual Non-Disclosure Agreement to be executed by their duly authorized representatives as of the Effective Date.

FIRST PARTY:
AETHERIS QUANTUM LABS LLC

By: ________________________________________
Name: Dr. Marcus Chen
Title: Managing Member
Date: ______________________________________


SECOND PARTY:
MERIDIAN CAPITAL PARTNERS LP

By: ________________________________________
Name: Victoria Kensington
Title: General Partner
Date: ______________________________________`,
  },
  {
    id: 'service-contract',
    label: 'Service Contract',
    documentType: 'Independent Contractor / Service Contract',
    partiesInvolved: 'Northstar Commerce Group Inc. ("Client") and Studio Kestrel Digital LLC ("Contractor")',
    keyTerms: 'Monthly retainer fee of $8,500 payable on the 1st of each month; Scope: Full-stack cloud architecture modernization and API security auditing; Independent contractor status (no employee benefits or tax withholding); Client owns all custom deliverables upon full payment; Contractor retains rights to pre-existing background tools with perpetual license to Client; 30 days written termination notice.',
    effectiveDate: '2026-10-01',
    jurisdiction: 'State of California, United States',
    protectiveStance: 'Balanced & Mutual',
    sampleDocument: `INDEPENDENT CONTRACTOR SERVICES AGREEMENT

This Independent Contractor Services Agreement (this "Agreement") is entered into and made effective as of October 1, 2026 (the "Effective Date"), by and between Northstar Commerce Group Inc. ("Client") and Studio Kestrel Digital LLC ("Contractor"). Client and Contractor are referred to individually as a "Party" and collectively as the "Parties."

WHEREAS, Client desires to retain Contractor to perform specialized cloud architecture modernization and API security auditing services, and Contractor agrees to perform such services upon the terms and conditions set forth herein.

NOW, THEREFORE, in consideration of the mutual covenants and promises set forth below, the Parties agree as follows:

1. DEFINITIONS

1.1 "Background Technology" means all pre-existing software libraries, frameworks, methodologies, and know-how owned or developed by Contractor prior to or independently of this Agreement.

1.2 "Deliverables" means all custom code, architectural blueprints, security audit reports, and documentation expressly created by Contractor for Client pursuant to Section 2.1.

1.3 "Services" means the full-stack cloud architecture modernization, infrastructure hardening, and API security auditing services performed by Contractor hereunder.

2. OBLIGATIONS

2.1 Scope of Services. Contractor shall perform the Services in a timely, workmanlike, and professional manner consistent with highest industry standards.

2.2 Compensation and Invoicing. Client shall pay Contractor a fixed monthly retainer of Eight Thousand Five Hundred Dollars ($8,500.00), due and payable on the first (1st) business day of each calendar month. Undisputed invoices not paid within fifteen (15) days of the due date shall accrue late interest at 1.5% per month.

2.3 Independent Contractor Relationship. Contractor's relationship with Client is solely that of an independent contractor. Nothing in this Agreement shall be construed to create a partnership, joint venture, or employer-employee relationship. Contractor shall be solely responsible for all federal, state, and local taxes, social security contributions, and insurance.

2.4 Intellectual Property Ownership. Upon receipt of full payment for the applicable period, Contractor hereby assigns to Client all right, title, and interest in and to the custom Deliverables. Contractor retains exclusive ownership of all Background Technology, and hereby grants Client a perpetual, non-exclusive, royalty-free, worldwide license to use any Background Technology incorporated into the Deliverables.

3. TERM & TERMINATION

3.1 Term. This Agreement shall commence on the Effective Date and continue on a month-to-month basis until terminated in accordance with Section 3.2.

3.2 Termination Notice. Either Party may terminate this Agreement for convenience upon thirty (30) days prior written notice to the other Party. Either Party may terminate immediately upon written notice if the other Party commits a material breach that remains uncured for ten (10) days after written notice thereof.

4. GOVERNING LAW

4.1 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the State of California, United States, without reference to conflict of law principles.

4.2 Limitation of Liability. Except for breaches of confidentiality or intellectual property obligations, neither Party's aggregate liability under this Agreement shall exceed the total fees paid by Client to Contractor during the six (6) months preceding the claim.

IN WITNESS WHEREOF, the Parties have executed this Independent Contractor Services Agreement as of the Effective Date.

CLIENT:
NORTHSTAR COMMERCE GROUP INC.

By: ________________________________________
Name: David Thorne
Title: VP of Engineering
Date: ______________________________________


CONTRACTOR:
STUDIO KESTREL DIGITAL LLC

By: ________________________________________
Name: Elena Rostova
Title: Principal Consultant
Date: ______________________________________`,
  },
  {
    id: 'commercial-lease',
    label: 'Lease Agreement',
    documentType: 'Commercial Lease Agreement',
    partiesInvolved: 'Harborview Ironside Properties REIT ("Landlord") and Lumina Diagnostics Corp. ("Tenant")',
    keyTerms: 'Premises: Suite 400 (4,200 rentable sq. ft.) at 880 Seaport Boulevard; Base Rent: $14,700 per month due on the 1st of each month; Security Deposit: $29,400 (2 months rent); Lease Term: 36 months with one 24-month renewal option; Annual rent escalation of 3%; Permitted Use: Corporate office and dry research workspace.',
    effectiveDate: '2026-10-01',
    jurisdiction: 'State of New York, United States',
    protectiveStance: 'Balanced & Mutual',
    sampleDocument: `COMMERCIAL OFFICE LEASE AGREEMENT

This Commercial Office Lease Agreement (this "Lease") is made and entered into as of October 1, 2026 (the "Effective Date"), by and between Harborview Ironside Properties REIT ("Landlord") and Lumina Diagnostics Corp. ("Tenant"). Landlord and Tenant are collectively referred to herein as the "Parties."

WHEREAS, Landlord is the owner of record of the commercial building located at 880 Seaport Boulevard (the "Building"); and

WHEREAS, Landlord desires to lease to Tenant, and Tenant desires to lease from Landlord, Suite 400 comprising approximately 4,200 rentable square feet (the "Premises"), upon the terms and covenants set forth herein.

NOW, THEREFORE, in consideration of the mutual covenants and rent reserved herein, the Parties agree as follows:

1. DEFINITIONS

1.1 "Base Rent" means the monthly fixed rental obligation of Fourteen Thousand Seven Hundred Dollars ($14,700.00) during the initial Lease Year, subject to annual adjustments under Section 2.2.

1.2 "Lease Year" means each consecutive twelve (12) month period commencing on the Effective Date.

1.3 "Permitted Use" means general executive office administration and non-hazardous dry research workspace, and no other purpose without Landlord's prior written consent.

2. OBLIGATIONS

2.1 Payment of Base Rent. Tenant covenants to pay Landlord the Base Rent of $14,700.00 per month in advance on or before the first (1st) day of each calendar month throughout the Term, without offset or deduction.

2.2 Annual Escalation and Security Deposit. Base Rent shall increase by three percent (3.0%) at the commencement of each subsequent Lease Year. Upon execution of this Lease, Tenant shall deposit with Landlord the sum of Twenty-Nine Thousand Four Hundred Dollars ($29,400.00) as a Security Deposit to secure Tenant's faithful performance hereunder.

2.3 Maintenance, Repairs, and Alterations. Landlord shall maintain the structural roof, exterior walls, and common HVAC systems of the Building in good working order. Tenant shall maintain the interior of the Premises in clean condition and shall not make structural alterations without Landlord's prior written approval.

3. TERM & TERMINATION

3.1 Lease Term and Renewal. The initial term of this Lease shall be thirty-six (36) months commencing on the Effective Date (the "Term"). Provided Tenant is not in default, Tenant shall have one (1) option to renew this Lease for an additional twenty-four (24) months upon ninety (90) days prior written notice.

3.2 Default and Remedies. If Tenant fails to pay Base Rent within five (5) business days after written notice of delinquency, or fails to cure any non-monetary default within thirty (30) days after written notice, Landlord may exercise all remedies available at law or in equity, including termination of possession.

4. GOVERNING LAW

4.1 Governing Law and Venue. This Lease shall be governed by, construed, and enforced in accordance with the laws of the State of New York, United States, and any action arising hereunder shall be adjudicated in the courts of the county in which the Premises are situated.

IN WITNESS WHEREOF, Landlord and Tenant have duly executed this Commercial Office Lease Agreement as of the Effective Date.

LANDLORD:
HARBORVIEW IRONSIDE PROPERTIES REIT

By: ________________________________________
Name: Arthur Pendelton
Title: Senior Managing Director
Date: ______________________________________


TENANT:
LUMINA DIAGNOSTICS CORP.

By: ________________________________________
Name: Dr. Priya Nair
Title: Chief Operating Officer
Date: ______________________________________`,
  },
];
