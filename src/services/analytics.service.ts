import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getSupabase } from '../config/supabase';

export interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  session_id?: string;
  device_info?: {
    platform: string;
    osVersion: string;
    deviceModel: string;
    appVersion: string;
  };
}

class AnalyticsService {
  private sessionId: string;
  private deviceInfo: AnalyticsEvent['device_info'];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.deviceInfo = this.getDeviceInfo();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo(): AnalyticsEvent['device_info'] {
    return {
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      deviceModel: Device.modelName || 'Unknown',
      appVersion: '1.0.0', // Get from app.json or constants
    };
  }

  /**
   * Track custom event
   */
  async trackEvent(eventType: string, data?: Record<string, any>): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data: userData } = await supabase.auth.getUser();

      await supabase.from('analytics_events').insert({
        user_id: userData.user?.id || null,
        event_type: eventType,
        event_data: data || {},
        session_id: this.sessionId,
        device_info: this.deviceInfo,
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Track screen view
   */
  async trackScreenView(screenName: string, params?: Record<string, any>): Promise<void> {
    await this.trackEvent('screen_view', {
      screen_name: screenName,
      ...params,
    });
  }

  /**
   * Track user action
   */
  async trackAction(action: string, context?: Record<string, any>): Promise<void> {
    await this.trackEvent('user_action', {
      action,
      ...context,
    });
  }

  /**
   * Track booking events
   */
  async trackBooking(action: 'created' | 'cancelled' | 'completed', bookingId: string): Promise<void> {
    await this.trackEvent(`booking_${action}`, {
      booking_id: bookingId,
    });
  }

  /**
   * Track queue events
   */
  async trackQueue(action: 'joined' | 'left' | 'served', queueId: string, shopId: string): Promise<void> {
    await this.trackEvent(`queue_${action}`, {
      queue_id: queueId,
      shop_id: shopId,
    });
  }

  /**
   * Track search
   */
  async trackSearch(query: string, resultsCount: number): Promise<void> {
    await this.trackEvent('search', {
      query,
      results_count: resultsCount,
    });
  }

  /**
   * Track errors
   */
  async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    await this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(metric: string, value: number, unit: string = 'ms'): Promise<void> {
    await this.trackEvent('performance', {
      metric,
      value,
      unit,
    });
  }

  /**
   * Reset session (call on app launch or user login)
   */
  resetSession(): void {
    this.sessionId = this.generateSessionId();
  }
}

export const analyticsService = new AnalyticsService();
