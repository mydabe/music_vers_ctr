import React, {useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ListRenderItem,
    StyleSheet,
    FlatList,
    ListRenderItemInfo,
    Button
} from 'react-native';
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/FirebaseConfig'
import { getAuth } from 'firebase/auth';
import { router } from "expo-router";
import DocumentPicker, { types } from "react-native-document-picker"
import {getDocumentAsync} from "expo-document-picker";
import { uploadAndWait } from "@/app/services/ConversionService";


export default function DashboardView() {
    const scores = ['hit', 'me']
    const [scoresUploaded, setScoresUploaded] = useState<string[]>([]);

    const newUpload = async () => {
        try {
            const res = await DocumentPicker.pickSingle({
                type: [types.pdf],
                copyTo: 'cachesDirectory', // Optional, for upload reliability
            });

            const { uri, name, size, type: mimeType } = res;

            const xmlURL = await uploadAndWait(uri);
            console.log("Document uploaded", xmlURL);
            // RENDER HERE

        } catch (err: any) {
            if (DocumentPicker.isCancel(err)) {
                console.log('Document picking cancelled');
            } else {
                console.error('Unexpected error:', err);
            }
        }

    }


    const handleSignOut = () =>  {
        console.log('signOut');
        signOut(auth);
        router.replace("/")
    }



    const renderScoreItem : ListRenderItem<string> = ({ item }) => {
        return (
            <View style={styles.listItemContainer}>
                <Text style={styles.listItemTitle}>
                    {item}
                </Text>
                <Button title='Upload PDF' onPress={newUpload} >
                </Button>

            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList data={scores} renderItem={renderScoreItem}>
            </FlatList>
            <Button title='Sign Out' onPress={handleSignOut}>
            </Button>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 500,
        backgroundColor: 'transparent',
        alignItems: 'flex-start',
        flexDirection: 'row',
    },
    listItemContainer: {
        height: 100,
        flexBasis:  50,
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        backgroundColor: 'aquamarine'
    },
    listItemTitle: {
        color: 'white',
        fontSize: 35,
    }
})