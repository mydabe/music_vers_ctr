// app/_layout.tsx
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { useColorScheme } from '@/hooks/useColorScheme';
import {getAuth, onAuthStateChanged, signOut, User} from 'firebase/auth';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

export const unstable_settings = {
    // we’ll override initialRouteName dynamically below
    initialRouteName: '(tabs)/index',
};


export default function RootLayout() {
    // 1. Load your custom font
    const [fontsLoaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    // 2. Track auth state
    const [user, setUser]       = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    useEffect(() => {
        const auth = getAuth();
        const unsub = onAuthStateChanged(auth, u => {
            setUser(u);
            setAuthLoading(false);
        });
        return unsub;
    }, []);

    const colorScheme = useColorScheme();
    // 3. Don’t render anything until fonts & auth are ready
    if (!fontsLoaded || authLoading) {
        return null;
    }


    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
                screenOptions={{ headerShown: false }}
                // Make sure the initial screen is index (login) or (tabs)
                initialRouteName={user ? '(tabs)' : 'index'}
            >
                {user ? (
                    // Logged-in: wire up your tabs group and any post-login screens
                    <>
                        <Stack.Screen name="(tabs)/index" />
                        <Stack.Screen name="sign_out" options={{ title: 'Sign Out' }} />
                    </>
                ) : (
                    // Not logged-in: only register the login screen
                    <Stack.Screen name="index" options={{ title: 'Login' }} />
                )}
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
