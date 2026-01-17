import fs from "fs";
import * as pdf from "pdf-parse";

export const extractTextFromPDF = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error("CV file not found");
  }

  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);

  return data.text?.slice(0, 4000) || "";
};
