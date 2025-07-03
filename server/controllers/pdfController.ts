import { RequestHandler } from "express";
import path from 'path';
import fs from 'fs';
import {unlockPdf,convertPdfToImagesAndExtractText} from "../helper/PDFHelper"
import {ListOfSOADetails, SOADetails} from "../models/PDFDetails"
export const convertPDF : RequestHandler = async (req, res) => {
  const file = req.file;
  const { password } = req.body;
  if (!file || !password) {
    res.status(400).json({ error: 'Missing file or password' });
    return;
  }

  const inputPath = path.resolve(file.path);
  const outputPath = path.resolve('uploads', `unlocked-${file.filename}.pdf`);

  try {
    await unlockPdf(inputPath, outputPath, password);
    const extractedData = await convertPdfToImagesAndExtractText(outputPath);
   
    res.json({ data: extractedData, message: 'PDF processed successfully.' });
  
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unlock or process PDF' });
  } finally {
    fs.unlink(inputPath, () => {}); // Remove original locked file
    fs.unlink(outputPath, () => {}); // Remove unlocked file after processing
  }
}