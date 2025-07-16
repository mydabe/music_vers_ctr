import { initializeApp }      from 'firebase-admin/app';
import { onObjectFinalized } from 'firebase-functions/v2/storage';

initializeApp();           // <-- THIS is required in functions



export const pdfUpload = onObjectFinalized(
    {
        region: 'us-central1',
        memory: '512MiB',
        cpu: 1,
    },
    async event => {
        const {bucket, name} = event.data!
        await fetch("https://b81d-73-203-8-239.ngrok-free.app", {
            method: 'POST',
            body: JSON.stringify({'bucket': bucket, 'name': name}),
        }
    );

    }
);


