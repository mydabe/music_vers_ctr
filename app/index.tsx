import {View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions} from 'react-native';
import React, { useState } from 'react';
import { auth } from '../FirebaseConfig';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth'
import { Stack } from "expo-router";

export const unstable_settings = {
    initialRouteName: "initial-route", // set the initial route here
};


export default function Index(){
    console.log(Dimensions.get('screen'))
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
            <View style={styles.container_two}>
            <Text style={[styles.sign_in_text]}>
                Sign In
            </Text>
            <View style={[styles.container_three, styles.shiftInput]}>
            <TextInput placeholder='email' value={email} onChangeText={setEmail}/>
            <TextInput placeholder='password' value={password} onChangeText={setPassword}/>
            </View>
            <TouchableOpacity onPress={signIn}>
                <Text style={[styles.shiftLogin, styles.loginText]}> Login: </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={signUp}>
                <Text> Make Account </Text>
            </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
        container: {
            height: 1200,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
            pointerEvents: "none"
        },
        container_two: {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'dodgerblue',
            width: '50%',
            height: 400,
            pointerEvents: "none"
        },
        container_three: {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "aqua",
            height: 75,
            position: "absolute",
            width: 100
        },
        sign_in_text: {
            textAlign: 'center',
            fontSize: 45,
            fontWeight: 'bold',
            color: 'black',
            height: 275
        },
        loginText: {
            fontSize: 25,
            fontWeight: 'normal',
            color: "white",
            pointerEvents: "none"

        },
        shiftLogin: {
            transform: [{translateX:-150}, {translateY: -220}]
        },

        shiftInput: {
            transform: [{translateY: -60}]
        },
        email_input: {
            fontSize: 20,
            color: 'black'
        }
    }
)