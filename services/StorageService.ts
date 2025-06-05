// services/StorageService.ts - Data Storage Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, BetSlip } from '../types/AppTypes';

export class StorageService {
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  static async saveBetSlip(betSlip: BetSlip): Promise<void> {
    try {
      const existing = await this.getBetSlips();
      existing.push(betSlip);
      await AsyncStorage.setItem('betSlips', JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to save bet slip:', error);
    }
  }

  static async getBetSlips(): Promise<BetSlip[]> {
    try {
      const data = await AsyncStorage.getItem('betSlips');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get bet slips:', error);
      return [];
    }
  }

  static async saveWatchlist(gameIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem('watchlist', JSON.stringify(gameIds));
    } catch (error) {
      console.error('Failed to save watchlist:', error);
    }
  }

  static async getWatchlist(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem('watchlist');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get watchlist:', error);
      return [];
    }
  }

  static async saveUserPreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  static async getUserPreferences(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem('userPreferences');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return null;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  }
}