import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { tmpdir }           from 'node:os';
import { join, basename }   from 'node:path';
import { unlink, readdir }  from 'node:fs/promises';
import { execFile }         from 'node:child_process';
import { Storage }          from '@google-cloud/storage';

const storage = new Storage();
async function runAudiveris(pdfPath: string, outDir: string): Promise<void> {
    // Make sure cwd is where your JAR and lib/ folder live
    const jarDir = join(__dirname, '..', 'audiveris');
    const baseDir  = join(__dirname, '..', 'audiveris');          // e.g. .../functions/audiveris
    const jarPath  = join(baseDir, 'audiveris.jar');              // .../functions/audiveris/audiveris.jar
    const libGlob  = join(baseDir, 'lib', '*');

    const args = [
        '-Xmx3g',
        '-cp',
        // On macOS/Linux, classpath entries are colon-separated:
        `${jarPath}:${libGlob}`,
        'Audiveris',    // the main class name inside the JAR
        '-batch',
        '-export',
        '-output', outDir,
        pdfPath,
    ]

    console.log('Running Audiveris with args:', args.join(' '), 'in', jarDir);
    console.log('Contents of audiveris/:', await readdir(jarDir));
    console.log('Contents of audiveris/lib/:', await readdir(join(jarDir, 'lib')));

    return new Promise((resolve, reject) => {
        execFile(
            'java',
            args,
            { cwd: baseDir },   // Make sure cwd is the parent of jarPath & libGlob
            (err, stdout, stderr) => {
                if (err) {
                    console.error('Audiveris failed:', stderr);
                    return reject(err);
                }
                console.log('Audiveris succeeded:', stdout);
                resolve();
            }
        );
    });
}

export const pdfUpload = onObjectFinalized(
    {
        region: 'us-central1',
        memory: '512MiB',
        cpu: 1,
    },
    async event => {
        const { bucket, name } = event.data;
        console.log('EMULATOR PATH:', process.env.PATH);

        if (!name || !name.endsWith('.pdf')) return;

        console.log(`📥 New PDF arrived: gs://${bucket}/${name}`);

        // 1. Download PDF to /tmp
        const pdfName  = basename(name);
        const localPdf = join(tmpdir(), pdfName);
        await storage.bucket(bucket).file(name).download({ destination: localPdf });
        console.log(`Saved a local copy at ${localPdf}`);

        // 2. Inspect /tmp before conversion
        console.log('Contents of /tmp before OMR:', await readdir(tmpdir()));
        // 3. Run Audiveris
        await runAudiveris(localPdf, tmpdir());

        // 4. Inspect /tmp after conversion
        console.log('Contents of /tmp after OMR:', await readdir(tmpdir()));

        // 5. Upload the .mxl
        const xmlName = pdfName.replace(/\.pdf$/, '.mxl');
        const tmpXml  = join(tmpdir(), xmlName);
        console.log(`Uploading ${tmpXml} to storage as ${xmlName}`);
        await storage.bucket(bucket).upload(tmpXml, {
            destination: name.replace(/\.pdf$/, '.mxl'),
            contentType: 'application/vnd.recordare.musicxml+xml',
        });

        // 6. Clean up
        await Promise.all([unlink(localPdf), unlink(tmpXml)]);
        console.log('Cleanup complete');
    }
);

