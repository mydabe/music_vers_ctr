import { initializeApp }      from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { tmpdir }           from 'node:os';
import { join, basename }   from 'node:path';
import { unlink, readdir }  from 'node:fs/promises';
import { execFile }         from 'node:child_process';
import { Storage }          from '@google-cloud/storage';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


initializeApp();           // <-- THIS is required in functions
const db = getFirestore();
const storage = new Storage();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runAudiveris(pdfPath: string, outDir: string): Promise<void> {
    const baseDir = join(__dirname, '..', 'audiveris');
    const jarPath = join(baseDir, 'audiveris.jar');
    const libGlob = join(baseDir, 'lib', '*');

    const args = [
        '-Xmx3g',
        '-cp',
        `${jarPath}:${libGlob}`,
        'Audiveris',
        '-batch',
        '-export',
        '-output', outDir,
        pdfPath,
    ];

    console.log('Running Audiveris with args:', args.join(' '), 'in', baseDir);
    console.log('Contents of audiveris/:', await readdir(baseDir));
    console.log('Contents of audiveris/lib/:', await readdir(join(baseDir, 'lib')));

    return new Promise((resolve, reject) => {
        execFile('java', args, { cwd: baseDir }, (err, stdout, stderr) => {
            if (err) {
                console.error('Audiveris failed:', stderr);
                return reject(err);
            }
            console.log('Audiveris succeeded:', stdout);
            resolve();
        });
    });
}

export const pdfUpload = onObjectFinalized(
    {
        region: 'us-central1',
        memory: '512MiB',
        cpu: 1,
    },
    async event => {
        console.log('Running event...');
        const { bucket, name } = event.data!;
        if (!name.endsWith('.pdf')) return;
        console.log(`📥 New PDF arrived: gs://${bucket}/${name}`);

        // Extract jobId from the path: pdfs/{jobId}/{filename}.pdf
        const [, jobId] = name.split('/');
        console.log(name)
        console.log('Running PDF arrived:', jobId);
        const conversionRef = db.collection('conversions').doc(jobId);

        try {
            // 1) Mark as processing
            await conversionRef.update({ status: 'processing' });

            // 2) Download PDF to /tmp
            const pdfName  = basename(name);
            const localPdf = join(tmpdir(), pdfName);
            await storage.bucket(bucket).file(name).download({ destination: localPdf });
            console.log(`Saved a local copy at ${localPdf}`);

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
        } catch (err: any) {
            console.error('Conversion error:', err);
            await conversionRef.update({
                status:       'error',
                errorMessage: err.message,
                failedAt:     FieldValue.serverTimestamp(),
            });
            throw err;
        }
    }
);


