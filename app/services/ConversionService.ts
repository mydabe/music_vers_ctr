import { db, storage, FieldValue } from "@/FirebaseConfig"
import { doc, collection, setDoc, serverTimestamp, updateDoc, onSnapshot, DocumentReference, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadAndWait(localUri: string): Promise<string> {
    console.log('Uploading doc...');
    const conversionRef = doc(collection(db, "conversions"));
    const jobId = conversionRef.id;
    await setDoc(conversionRef, {
        status: 'pending',
        pdfPath: '',
        createdAt: serverTimestamp(),
    });

    const fileName = localUri.split('/').pop()!;
    const pdfRef= ref(storage, `pdfs/${jobId}/${fileName}`);

    const resp = await fetch(localUri);
    const blob = await resp.blob();

    await uploadBytes(pdfRef, blob, {
        contentType: "application/pdf",
    });

    const gsUri = `gs://${pdfRef.bucket}/${pdfRef.fullPath}`;
    await updateDoc(conversionRef, {pdfPath: gsUri});

    await new Promise<void>((resolve, reject) => {
        const unsub = onSnapshot(
            conversionRef,
            (snap) => {
                const data = snap.data();
                if (!data) return;

                if (data.status === "done") {
                    unsub();
                    return resolve();
                }

                if (data.status === "error") {
                    unsub();
                    return reject(new Error(data.errorMessage));
                }
            },
            reject // This handles snapshot errors
        );
    });

    const snap = await getDoc(conversionRef);
    const { xmlPath } = snap.data()!;
    const storageRef = ref(storage, xmlPath);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;


}