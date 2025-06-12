import React, {useState} from 'react';
import {View, Text, TouchableOpacity, ListRenderItem, StyleSheet, FlatList, ListRenderItemInfo} from 'react-native';
import { router } from "expo-router";



export default function DashboardView() {
    const scores = ['hit', 'me']
    const [scoresUploaded, setScoresUploaded] = useState<string[]>([]);

    const renderScoreItem : ListRenderItem<string> = ({ item }) => {
        return (
            <View style={styles.listItemContainer}>
                <Text style={styles.listItemTitle}>
                    {item}
                </Text>
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
        width: 100,
        backgroundColor: 'aquamarine'
    },
    listItemTitle: {
        color: 'white',
        fontSize: 35,
    }
})