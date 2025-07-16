// app/layout.tsx
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

export const unstable_settings = {
    initialRouteName: "index", // set the initial route here
};

export default function RootLayout() {
    // 1. Load your custom font
    const [fontsLoaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });


    const colorScheme = useColorScheme();
    // 3. Don’t render anything until fonts & auth are ready
    if (!fontsLoaded) {
        return null;
    }


    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="index" options={{ title: 'Login' }}/>
                <Stack.Screen name="(tabs)/dashboard" options={{title: 'Dashboard'}} />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
