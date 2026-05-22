"use client";

/**
 * Client-side resume file -> plain text extraction for the ATS Analyzer.
 *
 * Parsing runs entirely in the browser, so the uploaded file never leaves the
 * user's machine. The extracted text is placed into an editable textarea and
 * the user reviews it before submitting it to the `analyzeATS` server action.
 *
 * Supported formats: PDF, DOCX, TXT, Markdown.
 */

export const ACCEPTED_RESUME_TYPES = ".pdf,.docx,.txt,.md";
export const MAX_RESUME_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const MIN_USABLE_TEXT_LENGTH = 30;

function getExtension(fileName) {
  const match = /\.([a-z0-9]+)$/i.exec(fileName || "");
  return match ? match[1].toLowerCase() : "";
}

async function extractPdf(file) {
  // pdfjs-dist is browser-only and heavy, so load it lazily.
  const pdfjs = await import("pdfjs-dist");

  // Resolve the worker from the installed package so it stays version-matched
  // and self-hosted (no runtime CDN dependency).
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;

  const pages = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    let pageText = "";
    for (const item of content.items) {
      pageText += item.str;
      pageText += item.hasEOL ? "\n" : " ";
    }
    pages.push(pageText.trim());
  }

  return pages.join("\n\n");
}

async function extractDocx(file) {
  // mammoth resolves to its browser build inside the client bundle.
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value || "";
}

async function extractPlainText(file) {
  return file.text();
}

/**
 * Extracts plain text from an uploaded resume file.
 * Throws an Error with a user-friendly message on any failure.
 *
 * @param {File} file - the file selected or dropped by the user
 * @returns {Promise<string>} extracted, normalized resume text
 */
export async function extractTextFromFile(file) {
  if (!file) throw new Error("No file selected.");

  if (file.size > MAX_RESUME_FILE_BYTES) {
    throw new Error("File is too large. Please upload a file under 5 MB.");
  }

  const ext = getExtension(file.name);
  if (!["pdf", "docx", "txt", "md"].includes(ext)) {
    throw new Error(
      "Unsupported file type. Please upload a PDF, DOCX, TXT or MD file."
    );
  }

  let text = "";
  try {
    if (ext === "pdf") text = await extractPdf(file);
    else if (ext === "docx") text = await extractDocx(file);
    else text = await extractPlainText(file);
  } catch (error) {
    console.error("Resume extraction error:", error);
    throw new Error(
      "Could not read this file. Please try a different file or paste your resume text manually."
    );
  }

  const cleaned = (text || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length < MIN_USABLE_TEXT_LENGTH) {
    throw new Error(
      "We couldn't extract readable text from this file. If it's a scanned or image-based PDF, please paste your resume text manually."
    );
  }

  return cleaned;
}
