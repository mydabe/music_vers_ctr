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
import { getAuth, signOut } from 'firebase/auth'
import { router } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import {getDocumentAsync} from "expo-document-picker";
import storage from '@react-native-firebase/storage'
import { uploadAndWait } from "@/app/services/ConversionService";


export default function DashboardView() {
    const scores = ['hit', 'me']
    const [scoresUploaded, setScoresUploaded] = useState<string[]>([]);

    const newUpload = async () => {
        const doc = await getDocumentAsync({
            type: ['application/pdf'],
            copyToCacheDirectory: true,
        });

        if (doc.canceled) {
            console.log('Document canceled', doc);
            return;
        }

        const [{ uri, name, size, mimeType }] = doc.assets;
        try {
            const xmlURL = await uploadAndWait(uri)
            // RENDER HERE
        }
        catch (err: any) {
            console.error(err);
        }

    }
    const auth = getAuth();
    const handleSignOut = async () => {
        console.log(auth);
        try {
            await signOut(auth);
            // After sign-out, send the user back to login ("/")
            router.replace('/');
        } catch (e: any) {
            console.error('Failed to sign out:', e);
            // Optionally show an alert/toast here
        }
    };


    const renderScoreItem : ListRenderItem<string> = ({ item }) => {
        return (
            <View style={styles.listItemContainer}>
                <Text style={styles.listItemTitle}>
                    {item}
                </Text>
                <Button title='Upload PDF' onPress={newUpload}>
                </Button>
                <Button title='Sign Out' onPress={handleSignOut}>
                </Button>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList data={scores} renderItem={renderScoreItem}>
            </FlatList>
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