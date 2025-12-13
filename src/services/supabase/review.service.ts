import { getSupabase } from '../../config/supabase';
import type { Review } from '../../types';

export class ReviewService {
  /**
   * Submit a new review for a booking
   */
  async submitReview(
    bookingId: string,
    shopId: string,
    customerId: string,
    barberId: string | null,
    rating: number,
    comment: string
  ): Promise<Review> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        shop_id: shopId,
        customer_id: customerId,
        barber_id: barberId,
        rating,
        comment,
      })
      .select('*')
      .single();

    if (error) throw error;
    return this.mapReviewFromDb(data);
  }

  /**
   * Get reviews for a specific shop
   */
  async getShopReviews(shopId: string, limit = 20): Promise<Review[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:customer_id (
          full_name,
          avatar_url
        )
      `)
      .eq('shop_id', shopId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(this.mapReviewFromDb);
  }

  /**
   * Get reviews by a specific user
   */
  async getUserReviews(userId: string): Promise<Review[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        shops (
          name,
          address
        )
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapReviewFromDb);
  }

  /**
   * Respond to a review (shop owner only)
   */
  async respondToReview(reviewId: string, response: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('reviews')
      .update({
        response,
        responded_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (error) throw error;
  }

  /**
   * Get average rating for a shop
   */
  async getShopAverageRating(shopId: string): Promise<number> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('shops')
      .select('average_rating')
      .eq('id', shopId)
      .single();

    if (error) throw error;
    return data?.average_rating || 0;
  }

  /**
   * Check if user can review a booking
   */
  async canReviewBooking(bookingId: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    // Check if booking exists and is completed
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('status')
      .eq('id', bookingId)
      .single();

    if (bookingError || booking?.status !== 'completed') {
      return false;
    }

    // Check if review already exists
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (reviewError) return false;
    return !existingReview;
  }

  /**
   * Map database review to app Review type
   */
  private mapReviewFromDb(data: any): Review {
    return {
      id: data.id,
      bookingId: data.booking_id,
      shopId: data.shop_id,
      customerId: data.customer_id,
      barberId: data.barber_id,
      rating: data.rating,
      comment: data.comment,
      response: data.response,
      respondedAt: data.responded_at ? new Date(data.responded_at) : undefined,
      isVisible: data.is_visible,
      customerName: data.profiles?.full_name || 'Anonymous',
      customerAvatar: data.profiles?.avatar_url,
      shopName: data.shops?.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const reviewService = new ReviewService();
