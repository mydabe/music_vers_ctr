import firestore from '@react-native-firebase/firestore';
import storage   from '@react-native-firebase/storage';

export async function uploadAndWait(localUri: string): Promise<string> {
    const conversionRef = firestore().collection('conversions').doc();
    const jobId = conversionRef.id;
    await conversionRef.set({
        status: 'pending',
        pdfPath: '',
        createdAt: firestore.FieldValue.serverTimestamp(),
    });

    const fileName = localUri.split('/').pop()!;
    const pdfRef     = storage().ref(`pdfs/${jobId}/${fileName}`);
        /*** Switch ONLY storing SVG and drawings later ***/

    await pdfRef.putFile(localUri);

    const gsUri = `gs://${pdfRef.bucket}/${pdfRef.fullPath}`;
    await conversionRef.update({ pdfPath: gsUri });

    await new Promise<void>((resolve, reject) => {
        const unsub = conversionRef.onSnapshot(snap => {
            const data = snap.data()!;
            if (data.status === 'done')  { unsub(); return resolve(); }
            if (data.status === 'error') { unsub(); return reject(new Error(data.errorMessage)); }
        }, reject);
    });

    const { xmlPath } = (await conversionRef.get()).data()!;
    return storage().refFromURL(xmlPath).getDownloadURL();


}