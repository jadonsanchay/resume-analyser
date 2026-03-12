import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { ApiError } from "./apiResponse.js";

const PARSED_DIR = "parsed";

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = await fs.readFile(filePath);

  if (ext === ".pdf") {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (ext === ".docx" || ext === ".doc") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new ApiError(400, `Unsupported file type: ${ext}`);
}

function structureResume(rawText, originalName) {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    originalFile: originalName,
    parsedAt: new Date().toISOString(),
    rawText,
    lines,
    totalLines: lines.length,
  };
}

export async function parseResume(file) {
  const rawText = await extractText(file.path);
  const structured = structureResume(rawText, file.originalname);

  await fs.mkdir(PARSED_DIR, { recursive: true });

  const baseName = path.basename(file.filename, path.extname(file.filename));
  const jsonPath = path.join(PARSED_DIR, `${baseName}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(structured, null, 2));

  return { jsonPath, data: structured };
}
