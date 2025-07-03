import express from 'express';
import { convertPDF } from '../controllers/pdfController';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-pdf', upload.single('file'),convertPDF);

export default router;
