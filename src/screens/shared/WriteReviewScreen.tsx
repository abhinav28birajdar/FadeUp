/**
 * Write Review Screen
 * Allows customers to write reviews after completing a booking
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

// Mock data
const mockBooking = {
  id: 'BK123',
  shop: {
    id: '1',
    name: "Mike's Barber Shop",
  },
  barber: {
    id: '1',
    name: 'Mike Anderson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  },
  services: ['Fade Haircut', 'Beard Trim'],
  date: new Date(),
};

const ratingLabels = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

export const WriteReviewScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ bookingId: string }>();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImages = async () => {
    if (photos.length >= 5) {
      Alert.alert('Limit Reached', 'You can add up to 5 photos.');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - photos.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setPhotos([...photos, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating to submit your review.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    Alert.alert('Thank You!', 'Your review has been submitted successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Write Review
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Booking Info */}
          <View style={[styles.bookingCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.bookingInfo}>
              <Image
                source={{ uri: mockBooking.barber.avatar }}
                style={styles.barberAvatar}
              />
              <View style={styles.bookingDetails}>
                <Text style={[styles.shopName, { color: theme.colors.text.primary }]}>
                  {mockBooking.shop.name}
                </Text>
                <Text style={[styles.barberName, { color: theme.colors.text.secondary }]}>
                  with {mockBooking.barber.name}
                </Text>
                <Text style={[styles.services, { color: theme.colors.text.muted }]}>
                  {mockBooking.services.join(' • ')}
                </Text>
              </View>
            </View>
          </View>

          {/* Rating Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              How was your experience?
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? '#FFB800' : theme.colors.neutral[300]}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text
                style={[
                  styles.ratingLabel,
                  {
                    color:
                      rating >= 4
                        ? theme.colors.success[500]
                        : rating >= 3
                        ? theme.colors.warning[500]
                        : theme.colors.error[500],
                  },
                ]}
              >
                {ratingLabels[rating - 1]}
              </Text>
            )}
          </View>

          {/* Comment Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Share more details (optional)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.neutral[200],
                },
              ]}
              placeholder="Tell us about your experience... What did you like? What could be improved?"
              placeholderTextColor={theme.colors.text.muted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={[styles.characterCount, { color: theme.colors.text.muted }]}>
              {comment.length}/500
            </Text>
          </View>

          {/* Photos Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Add photos (optional)
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text.muted }]}>
              Show off your fresh cut!
            </Text>
            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={[
                      styles.removePhotoBtn,
                      { backgroundColor: theme.colors.error[500] },
                    ]}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 5 && (
                <TouchableOpacity
                  style={[
                    styles.addPhotoBtn,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.neutral[300],
                    },
                  ]}
                  onPress={handlePickImages}
                >
                  <Ionicons
                    name="camera-outline"
                    size={28}
                    color={theme.colors.text.muted}
                  />
                  <Text style={[styles.addPhotoText, { color: theme.colors.text.muted }]}>
                    Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.colors.surface,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor:
                rating === 0 || isSubmitting
                  ? theme.colors.neutral[300]
                  : theme.colors.primary[500],
            },
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.submitText}>Submitting...</Text>
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>Submit Review</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  bookingCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
  },
  bookingDetails: {},
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  barberName: {
    fontSize: 14,
    marginBottom: 4,
  },
  services: {
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 140,
    lineHeight: 22,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WriteReviewScreen;
