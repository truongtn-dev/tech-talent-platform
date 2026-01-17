import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

export const extractTextFromPDF = async (filePath) => {
  let parser;
  try {
    // Handle Remote URL (Cloudinary)
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      parser = new PDFParse({ url: filePath });
    }
    // Handle Local File
    else {
      if (!fs.existsSync(filePath)) {
        throw new Error(`CV file not found at path: ${filePath}`);
      }
      const buffer = fs.readFileSync(filePath);
      parser = new PDFParse({ data: buffer });
    }

    const result = await parser.getText();
    // Clean up if necessary (v2 might require destroy)
    if (parser.destroy) await parser.destroy();

    return result.text?.slice(0, 4000) || "";
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    // Return empty string instead of crashing, so application can proceed (albeit with less matching data)
    return "";
  }
};
