import { exec } from "child_process";
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import path, { join } from "path";
import { pdf } from "pdf-to-img";
import Tesseract from 'tesseract.js';
import os from 'os';
import * as tmp from 'tmp';
import fs from 'fs/promises';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SOADetails } from "../models/PDFDetails";

const genAI = new GoogleGenerativeAI("AIzaSyDS8eeD5jMe7qP79UoBPCNWvXrCw3thKDA");
const MAX_CHUNK_SIZE = 3000; 

async function runGeminiQuery(prompt:string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

export const chunkText = (text: string, maxLength: number): string[] => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxLength;

    if (end >= text.length) {
      chunks.push(text.slice(start));
      break;
    }

    const lastNewline = text.lastIndexOf('\n', end);
    if (lastNewline > start && lastNewline > start + maxLength * 0.8) { // Prefer breaking at newlines, but not too far back
      end = lastNewline;
    }

    chunks.push(text.slice(start, end));
    start = end;
  }

  return chunks;
};export const unlockPdf = (inputPath: string, outputPath: string, password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const command = `qpdf --password=${password} --decrypt "${inputPath}" "${outputPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(stderr)
        return reject(stderr);
      }
      resolve(outputPath);
    });
  });
};

export async function extractFromPages(fullText: string): Promise<any[]> {
  const pages = fullText.split(/\f|\n{3,}/); // crude page delimiter
  const results: any[] = []; // Explicitly type results as an array of any objects

  for (const page of pages) {
    const chunks = chunkText(page, MAX_CHUNK_SIZE);

    for (const chunk of chunks) {
      // Inside extractFromPages, within the loop for each chunk:

      const prompt = `You are an expert at reading bank statements. From the following bank statement text, extract all relevant details.
      Return ONLY a single valid JSON object. 
       convert statement_date, and payment_due_date as MM/dd/YYYY
       convert previous_balance, credit_limit, total_balance_due, and statement_balance to currency but in string and remove letters like $ or P or PHP.
       if the card_number has XXXXX find another card_number that is valid
       Example of desired output structure (you should extract actual data from the text):
      [
        {
          "account_holder_name": "John Doe",
          "card_number": "XXXX-XXXX-XXXX-1234",
          "account_type": "Credit Card",
          "billing_address": "123 Main St, Anytown, USA",
          "statement_date": "2024-01-01",
          "previous_balance": 1000.00,
          "statement_balance": 1000.00,
          "payments": 300.00,
          "credit_limit":11000,
          "total_balance_due": 1200.00,
          "minimum_payment_due": 50.00,
          "bank_name":"Bank Name",
          "payment_due_date": "2024-02-20"
        },
      ]

      Here is the bank statement text:
      """
      ${chunk}
      """`;

      // ... rest of your try-catch block for running Gemini query and parsing
      
      try {
        const aiOutput = await runGeminiQuery(prompt);
        // Robust JSON extraction
        const jsonMatch = aiOutput.match(/\[\s*\{[\s\S]*?\}\s*\]/); 
        if (jsonMatch && jsonMatch[0]) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            // Ensure parsed is an array, and push its elements into results
            if (Array.isArray(parsed)) {
              results.push(...parsed);
            } else {
              console.warn('AI output parsed but was not an array of objects as expected. AI Output:', aiOutput);
              // If it's a single object (not an array), wrap it in an array before pushing
              // if (typeof parsed === 'object' && parsed !== null) {
              //     results.push(parsed);
              // }
            }
          } catch (e) {
            console.error('Failed to parse JSON from AI output:', e, 'AI Output:', aiOutput);
          }
        } else {
          console.warn('No valid JSON array found in AI output for chunk:', chunk, 'AI Output:', aiOutput);
        }
      } catch (error) {
        console.error('Error during Gemini query or processing for chunk:', chunk.substring(0, 100) + '...', 'Error:', error);
      }
    }
  }

  return results;
}
const isValidCardNumber = (cardNumber: string): boolean =>{
  // Remove non-digits
  const cleaned = cardNumber.replace(/[^0-9]/g, '');
  // Basic format check (13–19 digits)
  return /^\d{13,19}$/.test(cleaned);
}
const isNonEmpty = (value: any): boolean =>{
  return typeof value === 'string' ? value.trim() !== '' : value != null;
}

export async function convertPdfToImagesAndExtractText(pdfPath: string): Promise<SOADetails> {
  try {
    const document = await pdf(pdfPath, { scale: 3 });

    let fullText = '';

    for await (const image of document) {
      const { data: { text } } = await Tesseract.recognize(image, 'eng');
      fullText += text + '\n';
    }

    const extractedData = await extractFromPages(fullText);

    console.log(extractedData)
    const summary:SOADetails = {
      account_holder_name: "",
      account_type: "",
      billing_address: "",
      card_number: "",
      payment_due_date: "",
      statement_date: "",
      minimum_payment_due: "",
      statement_balance: "",
      bank_name: "",
      credit_limit: "",
      previous_balance: "",
    };
    for (const item of extractedData) {
      if (isNonEmpty(item.account_holder_name) && !summary.account_holder_name) {
        summary.account_holder_name = item.account_holder_name;
      }
      
      if (isNonEmpty(item.card_number) && !summary.card_number && isValidCardNumber(item.card_number)) {
        summary.card_number = item.card_number;
      }
      
      if (isNonEmpty(item.account_type) && !summary.account_type) {
        summary.account_type = item.account_type;
      }
      
      if (isNonEmpty(item.billing_address) && !summary.billing_address) {
        summary.billing_address = item.billing_address;
      }
      
      if (isNonEmpty(item.statement_date) && !summary.statement_date) {
        summary.statement_date = item.statement_date;
      }
      
      if (isNonEmpty(item.payment_due_date) && !summary.payment_due_date) {
        summary.payment_due_date = item.payment_due_date;
      }
      
      if (isNonEmpty(item.minimum_payment_due) && !summary.minimum_payment_due) {
        summary.minimum_payment_due = item.minimum_payment_due;
      }
      
      if (isNonEmpty(item.statement_balance) && !summary.statement_balance) {
        summary.statement_balance = item.statement_balance;
      }
      
      if (isNonEmpty(item.previous_balance) && !summary.previous_balance) {
        summary.previous_balance = item.previous_balance;
      }
      
      if (isNonEmpty(item.bank_name) && !summary.bank_name) {
        summary.bank_name = item.bank_name;
      }
      
      if (isNonEmpty(item.credit_limit) && !summary.credit_limit) {
        summary.credit_limit = item.credit_limit;
      }
    }
    
    return summary;
  } catch (error) {
    console.error('Error during PDF to image/text conversion:', error);
    throw error;
  }
}
  