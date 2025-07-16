import { initializeApp }      from 'firebase-admin/app';
import { join }   from 'node:path';
import { readdir }  from 'node:fs/promises';
import { execFile }         from 'node:child_process';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from "node:fs";


initializeApp();           // <-- THIS is required in functions
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runAudiveris(pdfPath: string, outDir: string): Promise<void> {
    const baseDir = join(__dirname, '..', 'audiveris');
    const jarPath = join(baseDir, 'audiveris.jar');
    const libGlob = join(baseDir, 'lib', '*');

    console.log('baseDir exists:', fs.existsSync(baseDir));


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
        execFile('java', args, {
            cwd: baseDir,
            env: { ...process.env, PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' }
        }, (err, stdout, stderr) => {
            if (err) {
                console.error('Audiveris failed:', stderr);
                return reject(err);
            }
            console.log('Audiveris succeeded:', stdout);
            resolve();
        });
    });
}