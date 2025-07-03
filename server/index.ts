import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import multer from 'multer';

import { pdf } from "pdf-to-img";

import userRoutes from './routes/userRoutes'
// Import database connection
import { pool } from './helper/db.js';
import pdfRoutes from './routes/pdfRoutes';
// Initialize environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT: number = Number(process.env.PORT) || 5001;


app.use(cors());
app.use(express.json());
// API routes
app.use('/api/auth', userRoutes);
app.use('/api/pdf',pdfRoutes);

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));