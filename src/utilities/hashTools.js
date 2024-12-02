import fs from "fs";
import crypto from "crypto";

export const generateFileHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
};

export const generateFolderHash = (folderPath) => {
  const hashSum = crypto.createHash("sha256");
  hashSum.update(folderPath);
  return hashSum.digest("hex");
};
