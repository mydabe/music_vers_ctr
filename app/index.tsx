import {View, Text, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import React, { useState } from 'react';
import { auth } from '../FirebaseConfig';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth'
import { Stack } from "expo-router";

export const unstable_settings = {
    initialRouteName: "initial-route", // set the initial route here
};


export default function Index(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = async () => {
        try {
            const user = await signInWithEmailAndPassword(auth, email, password);
            if (user) router.replace('/(tabs)')
        }
        catch (error) {
            console.log(error);
            alert("Failed to sign in");
        }
    }
    const signUp = async () => {
        try {
            const user = await createUserWithEmailAndPassword(auth, email, password);
            if (user) router.replace('/sign_out')

        }
        catch (error) {
            console.log(error);
            alert("Failed to sign in");
        }
    }

    return(
        <View style={styles.container}>
            <Text> Login </Text>
            <TextInput placeholder='email' value={email} onChangeText={setEmail}/>
            <TextInput placeholder='password' value={password} onChangeText={setPassword}/>
            <TouchableOpacity onPress={signIn}>
                <Text> Login </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={signUp}>
                <Text> Make Account </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'dodgerblue',
    }
})