import { Ticket, TicketPriority, LibraryItem } from '@/types';

const API_KEY = () => import.meta.env.VITE_GEMINI_API_KEY as string;

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

async function callGemini(body: object): Promise<any> {
  const apiKey = API_KEY();
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) return data;
      const msg = data?.error?.message || '';
      console.warn(`Model ${model} failed:`, msg);
      if (!msg.includes('quota') && !msg.includes('RESOURCE_EXHAUSTED')) throw new Error(msg);
      // quota hit — try next model
    } catch (e: any) {
      if (!e.message?.includes('quota') && !e.message?.includes('RESOURCE_EXHAUSTED')) throw e;
    }
  }
  throw new Error('All Gemini models quota exceeded. Please create a new API key at aistudio.google.com');
}

async function call(prompt: string): Promise<string> {
  const apiKey = API_KEY();
  if (!apiKey || apiKey === 'your-gemini-api-key') return '⚠️ Gemini API key not configured.';
  try {
    const data = await callGemini({ contents: [{ parts: [{ text: prompt }] }] });
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
  } catch (err: any) {
    return `Error: ${err.message}`;
  }
}

async function callWithFile(prompt: string, base64: string, mimeType: string): Promise<string> {
  const data = await callGemini({
    contents: [{ parts: [
      { text: prompt },
      { inline_data: { mime_type: mimeType, data: base64 } },
    ]}],
  });
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function getPdfjsLib() {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
  return pdfjsLib;
}

// ─────────────────────────────────────────────────────────────────
// CAMPUS KNOWLEDGE BASE
// ─────────────────────────────────────────────────────────────────
const CAMPUS_KNOWLEDGE = `
You are Campus AI Buddy for Sri Venkateswara College of Engineering (SVCE).

CAMPUS INFORMATION:
- Timings: College 8:00 AM – 5:00 PM (Mon–Sat)
- Library: 9:00 AM – 8:00 PM | Canteen: 8:00 AM – 7:00 PM
- Departments: CSE, ECE, EEE, MECH, CIVIL, IT
- Principal Office: Block A, Ground Floor | Exam Cell: Block B, 2nd Floor

ACADEMIC RULES:
- Minimum 75% attendance required
- Internal assessment: 3 CAs + 1 model exam
- Semester exams by Anna University | CGPA: 10-point scale

Answer student questions naturally. Keep responses concise and friendly.
`;

export async function askCampusAI(question: string, history = '', libraryContext?: string): Promise<string> {
  const libText = libraryContext ? `\n\nAVAILABLE RESOURCES:\n${libraryContext}` : '';
  return call(`${CAMPUS_KNOWLEDGE}${libText}\n\nHistory:\n${history}\n\nStudent: ${question}`);
}

export async function askAboutDocument(docText: string, question: string): Promise<string> {
  return call(`You are an expert tutor. The student uploaded a document:\n\n---\n${docText.substring(0, 20000)}\n---\n\nAnswer this question based on the document:\n${question}`);
}

export async function askAboutLibraryItem(item: LibraryItem, question: string): Promise<string> {
  return call(`You are an expert tutor for engineering students.
Resource: ${item.title} | ${item.subject} | ${item.topic || ''}
Description: ${item.description || 'No description.'}
Answer the student's question using this context and your knowledge.
Question: ${question}`);
}

export async function analyzeTicket(ticket: Ticket): Promise<{ summary: string; priority: TicketPriority }> {
  const response = await call(`Analyze this support ticket and respond in JSON format {"summary":"...","priority":"medium"}:
Title: ${ticket.title} | Category: ${ticket.category} | Dept: ${ticket.dept}
Description: ${ticket.description}`);
  try {
    const match = response.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        summary: parsed.summary || response,
        priority: (['low','medium','high','urgent'].includes(parsed.priority) ? parsed.priority : 'medium') as TicketPriority,
      };
    }
  } catch {}
  return { summary: response, priority: 'medium' };
}

export async function extractDocText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  // TXT — read directly
  if (ext === 'txt') return file.text();

  if (ext === 'pdf') {
    // Method 1: Send PDF directly to Gemini via FileReader base64 (works for all PDFs)
    try {
      console.log('PDF Method 1: Direct Gemini...');
      const base64 = await fileToBase64(file);
      const text = await callWithFile(
        'Extract ALL text from this PDF. Return only the raw text content, preserve structure.',
        base64,
        'application/pdf'
      );
      console.log('Method 1 length:', text.length);
      if (text.trim().length > 30) return text;
    } catch (e) {
      console.warn('Method 1 failed:', e);
    }

    // Method 2: Render pages to canvas → send as images to Gemini
    try {
      console.log('PDF Method 2: Vision per page...');
      const pdfjsLib = await getPdfjsLib();
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      let allText = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
        const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
        const pageText = await callWithFile(`Extract all text from page ${i}.`, base64, 'image/jpeg');
        allText += pageText + '\n';
      }
      console.log('Method 2 length:', allText.trim().length);
      if (allText.trim().length > 30) return allText.trim();
    } catch (e) {
      console.warn('Method 2 failed:', e);
    }

    // Method 3: pdfjs text layer (text-based PDFs only, local worker)
    try {
      console.log('PDF Method 3: pdfjs text layer...');
      const pdfjsLib = await getPdfjsLib();
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      let text = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      console.log('Method 3 length:', text.trim().length);
      if (text.trim().length > 30) return text.trim();
    } catch (e) {
      console.warn('Method 3 failed:', e);
    }

    return 'Could not extract text from this PDF.';
  }

  // DOCX / PPT / other
  try {
    const base64 = await fileToBase64(file);
    return await callWithFile('Extract all text from this document. Return only raw text.', base64, file.type || 'application/octet-stream');
  } catch {
    return 'Could not extract text from this document.';
  }
}

export async function extractPdfText(file: File): Promise<string> {
  return extractDocText(file);
}
