import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

const CONFIG_KEY = 'app_secure_config';

class ConfigManager {
  private config: AppConfig | null = null;
  private isWeb = Platform.OS === 'web';

  async saveConfig(config: AppConfig): Promise<void> {
    try {
      const configString = JSON.stringify(config);
      
      if (this.isWeb) {
        await AsyncStorage.setItem(CONFIG_KEY, configString);
      } else {
        await SecureStore.setItemAsync(CONFIG_KEY, configString);
      }
      
      this.config = config;
    } catch (error) {
      console.error('Failed to save config:', error);
      throw new Error('Failed to save configuration');
    }
  }

  async loadConfig(): Promise<AppConfig | null> {
    try {
      let configString: string | null;
      
      if (this.isWeb) {
        configString = await AsyncStorage.getItem(CONFIG_KEY);
      } else {
        configString = await SecureStore.getItemAsync(CONFIG_KEY);
      }
      
      if (configString) {
        this.config = JSON.parse(configString);
        return this.config;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load config:', error);
      return null;
    }
  }

  async clearConfig(): Promise<void> {
    try {
      if (this.isWeb) {
        await AsyncStorage.removeItem(CONFIG_KEY);
      } else {
        await SecureStore.deleteItemAsync(CONFIG_KEY);
      }
      
      this.config = null;
    } catch (error) {
      console.error('Failed to clear config:', error);
      throw new Error('Failed to clear configuration');
    }
  }

  getCachedConfig(): AppConfig | null {
    return this.config;
  }

  async isConfigured(): Promise<boolean> {
    const config = await this.loadConfig();
    return config !== null && !!config.supabaseUrl && !!config.supabaseAnonKey;
  }
}

export const configManager = new ConfigManager();
