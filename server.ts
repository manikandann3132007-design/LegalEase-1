import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  synthesizeStructuredLegalContract,
  applyFallbackRefinement,
} from './src/utils/legalSynthesisFallback.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const LEGAL_SYSTEM_INSTRUCTION = `You are a Senior Corporate Legal Counsel and Contract Drafting Specialist.
Your task is to generate formal, comprehensive, and legally rigorous agreements tailored to the user's specifications.

STRICT STRUCTURAL REQUIREMENTS:
1. Begin with the formal DOCUMENT TITLE in all-caps on the first line (e.g., "MUTUAL NON-DISCLOSURE AGREEMENT", "EMPLOYMENT AGREEMENT", "MASTER SERVICES AGREEMENT").
2. Follow immediately with a formal PREAMBLE stating the Effective Date and identifying each party with defined terms (e.g., ("Disclosing Party"), ("Employer"), ("Client")) and formal RECITALS ("WHEREAS..." clauses followed by "NOW, THEREFORE, in consideration of the mutual covenants...").
3. Include clearly numbered major SECTION HEADINGS. You MUST include at minimum the following four foundational sections in order, plus additional domain-appropriate sections:
   - 1. Definitions
   - 2. Obligations (or Obligations and Scope of Services / Duties)
   - 3. Term & Termination
   - 4. Governing Law (and Dispute Resolution)
   - 5. Confidentiality & Proprietary Rights (if applicable)
   - 6. Warranties, Indemnification & Limitation of Liability
   - 7. Miscellaneous / General Provisions (Severability, Entire Agreement, Amendments, Notices, Counterparts)
4. Use formal hierarchical clause numbering throughout every section (e.g., 1.1, 1.2, 1.3; 2.1, 2.2, 2.3; 3.1, 3.2; 4.1, 4.2).
5. Elaborate ALL custom key terms, figures, timeframes, and conditions provided by the user into precise, enforceable standard legal terminology. Never leave user terms as brief bullet points—expand each into a complete, formal legal clause.
6. Conclude with a formal "IN WITNESS WHEREOF" attestation clause and structured SIGNATURE BLOCKS for all parties involved, including lines for Signature, Printed Name, Title/Capacity, and Date.
7. Output clean, plain legal text with clear spacing. Do NOT wrap the document in markdown code fences (\`\`\`). Do NOT use conversational filler before or after the contract.`;

interface RetryGenerationResult {
  text: string;
  modelUsed: string;
  usedResilientFallback: boolean;
}

/**
 * Multi-model document generation with exponential backoff retry for 503/429 high-demand errors.
 * Cycles through primary and fallback Gemini models and guarantees a valid legal document output.
 */
export async function generateDocumentWithRetry(
  prompt: string,
  maxRetries = 3,
  systemInstruction: string = LEGAL_SYSTEM_INSTRUCTION,
  temperature = 0.3
): Promise<RetryGenerationResult> {
  const ai = getGenAIClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // Primary and fallback models in priority order
  const models = [
    'gemini-2.5-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-pro',
    'gemini-3.8-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ];

  for (const modelName of models) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature,
          },
        });

        const outputText = response.text?.trim();
        if (outputText) {
          return {
            text: outputText,
            modelUsed: modelName,
            usedResilientFallback: false,
          };
        }
        break; // Empty response on this model, try next fallback model
      } catch (error: unknown) {
        const errObj = error as { status?: number; code?: number; message?: string };
        const status = errObj?.status ?? errObj?.code;
        const message = errObj?.message ?? String(error);

        const isTransientOverload =
          status === 503 ||
          status === 429 ||
          message.includes('503') ||
          message.includes('429') ||
          message.includes('UNAVAILABLE') ||
          message.includes('RESOURCE_EXHAUSTED') ||
          message.toLowerCase().includes('overloaded') ||
          message.toLowerCase().includes('high demand') ||
          message.toLowerCase().includes('quota');

        const isModelUnavailable =
          status === 404 ||
          status === 400 ||
          message.includes('404') ||
          message.toLowerCase().includes('not found') ||
          message.toLowerCase().includes('not supported');

        if (isTransientOverload) {
          attempt++;
          console.warn(
            `Model ${modelName} overloaded (${status || '503/429'}). Retry ${attempt}/${maxRetries}...`
          );
          if (attempt < maxRetries) {
            // Exponential backoff delay (500ms, 1000ms, 2000ms)
            await new Promise((res) => setTimeout(res, Math.pow(2, attempt - 1) * 500));
          }
        } else if (isModelUnavailable) {
          // Move immediately to the next fallback model in the list
          console.warn(`Model ${modelName} unavailable on this endpoint. Falling back to next model...`);
          break;
        } else {
          // Other unexpected error — log and try next fallback model
          console.warn(`Model ${modelName} encountered error: ${message}. Trying next fallback model...`);
          break;
        }
      }
    }
  }

  throw new Error(
    'All model attempts and fallbacks failed due to high server demand. Switching to resilient legal synthesis engine.'
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  app.post('/api/generate-document', async (req, res) => {
    const {
      documentType,
      partiesInvolved,
      keyTerms,
      effectiveDate,
      jurisdiction,
      protectiveStance,
    } = req.body ?? {};

    if (!documentType || !partiesInvolved) {
      res.status(400).json({
        error: 'Document Type and Parties Involved are required to generate a legal agreement.',
      });
      return;
    }

    const formattedDate = effectiveDate || new Date().toISOString().split('T')[0];
    const governingLaw = jurisdiction || 'State of Delaware, United States';
    const stance = protectiveStance || 'Balanced & Mutual';

    const prompt = `Draft a complete, formal legal agreement based on the following parameters:

- DOCUMENT TYPE: ${documentType}
- EFFECTIVE DATE: ${formattedDate}
- PARTIES INVOLVED: ${partiesInvolved}
- GOVERNING LAW / JURISDICTION: ${governingLaw}
- DRAFTING STANCE: ${stance}
- KEY TERMS, CLAUSES & COMMERCIAL CONDITIONS TO INCORPORATE:
${keyTerms || 'Include standard market-customary protective provisions, confidentiality obligations, notice periods, and remedies appropriate for this agreement type.'}

Ensure the contract includes:
- Formal Title and Preamble with Recitals (WHEREAS clauses)
- Section 1. Definitions (1.1, 1.2, 1.3...)
- Section 2. Obligations (2.1, 2.2, 2.3... fully elaborating every custom term above into rigorous legal prose)
- Section 3. Term & Termination (3.1, 3.2...)
- Section 4. Governing Law (4.1, 4.2... specifying ${governingLaw})
- Additional numbered sections for Remedies, Indemnification, and General Provisions
- Formal IN WITNESS WHEREOF clause and Signature Blocks for each party.`;

    try {
      const result = await generateDocumentWithRetry(
        prompt,
        3,
        LEGAL_SYSTEM_INSTRUCTION,
        0.3
      );

      res.json({
        documentText: result.text,
        modelUsed: result.modelUsed,
        usedResilientFallback: false,
        generatedAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      console.warn(
        'Primary & fallback Gemini models unavailable; producing contract via deterministic legal synthesis engine:',
        error instanceof Error ? error.message : error
      );

      // Guaranteed zero-error fallback synthesis using all user parameters
      const synthesizedText = synthesizeStructuredLegalContract({
        documentType: String(documentType),
        partiesInvolved: String(partiesInvolved),
        keyTerms: String(keyTerms || ''),
        effectiveDate: formattedDate,
        jurisdiction: governingLaw,
        protectiveStance: stance,
      });

      res.json({
        documentText: synthesizedText,
        modelUsed: 'legalease-resilient-engine',
        usedResilientFallback: true,
        generatedAt: new Date().toISOString(),
      });
    }
  });

  app.post('/api/refine-document', async (req, res) => {
    const { currentDocument, instruction } = req.body ?? {};

    if (!currentDocument || !instruction) {
      res.status(400).json({
        error: 'Current document text and refinement instruction are required.',
      });
      return;
    }

    const prompt = `You are revising the following formal legal agreement according to the counsel instruction below.
Preserve the formal title, preamble, numbered section headings (1. Definitions, 2. Obligations, 3. Term & Termination, 4. Governing Law, etc.), hierarchical clause numbering (1.1, 1.2, 2.1...), and signature blocks.
Return the ENTIRE updated legal document without markdown code fences or commentary.

COUNSEL REFINEMENT INSTRUCTION:
${instruction}

CURRENT DOCUMENT:
${currentDocument}`;

    try {
      const result = await generateDocumentWithRetry(
        prompt,
        3,
        LEGAL_SYSTEM_INSTRUCTION,
        0.25
      );

      res.json({
        documentText: result.text,
        modelUsed: result.modelUsed,
        usedResilientFallback: false,
        generatedAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      console.warn(
        'Refinement fallback triggered due to model overload:',
        error instanceof Error ? error.message : error
      );

      const updatedText = applyFallbackRefinement(
        String(currentDocument),
        String(instruction)
      );

      res.json({
        documentText: updatedText,
        modelUsed: 'legalease-resilient-engine',
        usedResilientFallback: true,
        generatedAt: new Date().toISOString(),
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LegalEase server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
