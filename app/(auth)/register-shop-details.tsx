import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ModernCard } from '../../src/components/ModernCard';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { getCurrentUserLocation, requestLocationPermissions } from '../../src/utils/location';

export default function RegisterShopDetailsScreen() {
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [facebookHandle, setFacebookHandle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  const handleAutoDetectLocation = async () => {
    setLocationLoading(true);
    
    try {
      const permissions = await requestLocationPermissions();
      
      if (permissions?.status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to auto-detect your shop location');
        return;
      }

      const location = await getCurrentUserLocation();
      
      if (location) {
        setLatitude(location.latitude.toString());
        setLongitude(location.longitude.toString());
        Alert.alert('Success', `Location detected: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
      } else {
        Alert.alert('Error', 'Could not detect location. Please enter manually.');
      }
    } catch (error) {
      console.error('Location detection error:', error);
      Alert.alert('Error', 'Failed to detect location. Please enter manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmitShop = async () => {
    // Validation
    if (!shopName || !address || !latitude || !longitude) {
      Alert.alert('Error', 'Please fill in shop name, address, and location coordinates');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Error', 'Please enter valid latitude and longitude coordinates');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setLoading(true);
    
    try {
      // Create shop
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .insert({
          name: shopName.trim(),
          address: address.trim(),
          description: description.trim() || null,
          owner_id: user.id,
          latitude: lat,
          longitude: lng,
          phone_number: phoneNumber.trim() || null,
          social_instagram: instagramHandle.trim() || null,
          social_facebook: facebookHandle.trim() || null,
          image_url: imageUrl.trim() || null,
          average_rating: null,
        })
        .select()
        .single();

      if (shopError) {
        Alert.alert('Shop Creation Error', shopError.message);
        console.error('Shop creation error:', shopError);
        return;
      }

      // Update user profile with shop_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ shop_id: shopData.id })
        .eq('id', user.id);

      if (updateError) {
        Alert.alert('Profile Update Error', 'Shop created but failed to link to profile');
        console.error('Profile update error:', updateError);
        return;
      }

      Alert.alert('Success', 'Shop registered successfully!');
      router.replace('/(shopkeeper)/dashboard');
    } catch (error) {
      console.error('Shop registration error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    fieldName: string,
    keyboardType: any = 'default',
    multiline = false
  ) => (
    <MotiView
      animate={{
        borderColor: focusedField === fieldName ? '#827092' : '#52525B',
      }}
      >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#A1A1AA"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocusedField(fieldName)}
        onBlur={() => setFocusedField(null)}
        keyboardType={keyboardType}
        autoCapitalize="words"
        autoCorrect={false}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`bg-dark-background/50 p-4 rounded-xl text-primary-light border border-dark-border ${
          multiline ? 'h-20' : ''
        }`}
      />
    </MotiView>
  );

  return (
    <ScrollView 
      className="flex-1 bg-dark-background"
      contentContainerStyle={{ 
        flexGrow: 1, 
        paddingHorizontal: 24,
        paddingVertical: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="mb-8"
      >
        <Text className="text-primary-light text-4xl font-bold text-center">
          Register Your Shop
        </Text>
        <Text className="text-secondary-light text-lg text-center mt-2">
          Tell us about your business!
        </Text>
      </MotiView>

      <View className="space-y-6">
        {/* Basic Shop Info */}
        <ModernCard delay={200}>
          <Text className="text-primary-light text-xl font-bold mb-4">
            Basic Information
          </Text>
          <View className="space-y-3">
            {renderInput('Shop Name', shopName, setShopName, 'shopName')}
            {renderInput('Address', address, setAddress, 'address')}
            {renderInput('Description (Optional)', description, setDescription, 'description', 'default', true)}
            {renderInput('Image URL (Optional)', imageUrl, setImageUrl, 'imageUrl')}
          </View>
        </ModernCard>

        {/* Contact Information */}
        <ModernCard delay={300}>
          <Text className="text-primary-light text-xl font-bold mb-4">
            Contact Information
          </Text>
          <View className="space-y-3">
            {renderInput('Phone Number', phoneNumber, setPhoneNumber, 'phoneNumber', 'phone-pad')}
            {renderInput('Instagram Handle (Optional)', instagramHandle, setInstagramHandle, 'instagram')}
            {renderInput('Facebook Handle (Optional)', facebookHandle, setFacebookHandle, 'facebook')}
          </View>
        </ModernCard>

        {/* Location */}
        <ModernCard delay={400}>
          <Text className="text-primary-light text-xl font-bold mb-4">
            Shop Location
          </Text>
          
          <Pressable
            onPress={handleAutoDetectLocation}
            disabled={locationLoading}
            className="mb-4"
          >
            {({ pressed }) => (
              <MotiView
                animate={{
                  scale: pressed ? 0.96 : 1,
                }}
                className="bg-brand-secondary py-3 px-4 rounded-xl items-center"
              >
                {locationLoading ? (
                  <ActivityIndicator color="#F3F4F6" />
                ) : (
                  <Text className="text-primary-light text-base font-semibold">
                    📍 Auto-Detect My Location
                  </Text>
                )}
              </MotiView>
            )}
          </Pressable>

          {latitude && longitude && (
            <View className="mb-4 p-3 bg-brand-primary/20 rounded-lg">
              <Text className="text-secondary-light text-sm text-center">
                Detected: {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
              </Text>
            </View>
          )}

          <View className="space-y-3">
            {renderInput('Latitude', latitude, setLatitude, 'latitude', 'numeric')}
            {renderInput('Longitude', longitude, setLongitude, 'longitude', 'numeric')}
          </View>
        </ModernCard>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmitShop}
          disabled={loading}
          className="w-full"
        >
          {({ pressed }) => (
            <MotiView
              animate={{
                scale: pressed ? 0.96 : 1,
              }}
              className="bg-status-completed py-5 rounded-2xl shadow-xl items-center"
            >
              {loading ? (
                <ActivityIndicator color="#F3F4F6" />
              ) : (
                <Text className="text-primary-light text-2xl font-bold">
                  Submit Shop Details
                </Text>
              )}
            </MotiView>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

