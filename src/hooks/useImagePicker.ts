import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export function useImagePicker() {
    const [isUploading, setIsUploading] = useState(false);

    const requestPermissions = async () => {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return cameraStatus.status === 'granted' && libraryStatus.status === 'granted';
    };

    const pickImage = async (options?: ImagePicker.ImagePickerOptions) => {
        return ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
            ...options,
        });
    };

    const takePhoto = async (options?: ImagePicker.ImagePickerOptions) => {
        return ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
            ...options,
        });
    };

    const uploadToStorage = async (uri: string, path: string) => {
        setIsUploading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const stRef = ref(storage, path);
            await uploadBytes(stRef, blob);
            const url = await getDownloadURL(stRef);
            return url;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        pickImage,
        takePhoto,
        uploadToStorage,
        requestPermissions,
        isUploading
    };
}
