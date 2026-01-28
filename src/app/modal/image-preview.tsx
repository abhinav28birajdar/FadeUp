import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { Colors } from '../../constants/colors';
import { X } from 'lucide-react-native';

export default function ImagePreviewModal() {
    const router = useRouter();
    const { uri } = useLocalSearchParams();

    return (
        <Container style={styles.container}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
                <X size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.content}>
                {uri ? (
                    <Image source={{ uri: uri as string }} style={styles.image} resizeMode="contain" />
                ) : (
                    <View style={styles.placeholder} />
                )}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.black,
    },
    closeBtn: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '80%',
    },
    placeholder: {
        width: 200,
        height: 200,
        backgroundColor: Colors.surface,
    }
});
