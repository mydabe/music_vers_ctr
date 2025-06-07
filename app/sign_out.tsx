import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {auth} from '@/FirebaseConfig';
import {getAuth} from 'firebase/auth'
import {router} from 'expo-router'

export default function SignOutScreen() {
    getAuth().onAuthStateChanged((user) => {
        if (!user) {
            router.replace('/')
        }
    })

    return (
        <View style={styles.container}>
            <Text> Sign Out </Text>
            <TouchableOpacity onPress={() => auth.signOut()}>
                <Text>Sign Out</Text>
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