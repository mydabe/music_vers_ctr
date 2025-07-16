import express from 'express';
import { runAudiveris } from './services/audiveris_helper.js';
import {basename, join} from "node:path";
import {tmpdir} from "node:os";
import {FieldValue, getFirestore} from "firebase-admin/firestore";
import {unlink} from "node:fs/promises";
import {Storage} from "@google-cloud/storage";


const app = express();
const db = getFirestore();
const storage = new Storage();

app.use(express.json());
app.post('/convert', async (req, res) => {
    console.log('Running event...');
    const { bucket, name } = req.body
    if (!name.endsWith('.pdf')) res.status(400).send("Document received was not a PDF file");
    console.log(`📥 New PDF arrived: gs://${bucket}/${name}`);

    // Extract jobId from the path: pdfs/{jobId}/{filename}.pdf
    const [, jobId] = name.split('/');
    const conversionRef = db.collection('conversions').doc(jobId);
    try {
        // 1) Mark as processing
        await conversionRef.update({ status: 'processing' });

        // 2) Download PDF to /tmp
        const pdfName  = basename(name);
        const localPdf = join(tmpdir(), pdfName);
        await storage.bucket(bucket).file(name).download({ destination: localPdf });

        // 3) Run Audiveris
        await runAudiveris(localPdf, tmpdir());

        // 4) Upload the .mxl
        const xmlName = pdfName.replace(/\.pdf$/, '.mxl');
        const tmpXml  = join(tmpdir(), xmlName);
        console.log(`Uploading ${tmpXml} to storage as ${xmlName}`);
        await storage.bucket(bucket).upload(tmpXml, {
            destination: name.replace(/\.pdf$/, '.mxl'),
            contentType: 'application/vnd.recordare.musicxml+xml',
        });

        // 5) Mark done
        await conversionRef.update({
            status:      'done',
            xmlPath:     `gs://${bucket}/${name.replace(/\.pdf$/, '.mxl')}`,
            completedAt: FieldValue.serverTimestamp(),
        });

        // 6) Clean up
        await Promise.all([unlink(localPdf), unlink(tmpXml)]);
        res.status(200).send("Conversion complete!");
    } catch (err: any) {
        console.error('Conversion error:', err);
        await conversionRef.update({
            status:       'error',
            errorMessage: err.message,
            failedAt:     FieldValue.serverTimestamp(),
        });
        res.status(400).send("Conversion error" + err);
    }
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});