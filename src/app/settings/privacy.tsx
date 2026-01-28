import React from 'react';
import { View } from 'react-native';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';

export default function PrivacyScreen() {
    return (
        <Container><View style={{ padding: 20 }}><ThemedText>Privacy Policy</ThemedText></View></Container>
    );
}
