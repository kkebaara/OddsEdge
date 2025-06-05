// services/NotificationService.ts - Push Notification Service
import * as Notifications from 'expo-notifications';
import { ProcessedGame } from '../types/AppTypes';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  static async scheduleArbitrageAlert(game: ProcessedGame, profit: number): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Arbitrage Opportunity!',
          body: `${game.away_team} @ ${game.home_team} - ${profit.toFixed(1)}% guaranteed profit!`,
          data: { 
            gameId: game.id, 
            type: 'arbitrage',
            profit: profit,
            sport: game.sport 
          },
          sound: true,
        },
        trigger: null, // Immediate notification
      });
    } catch (error) {
      console.error('Failed to schedule arbitrage alert:', error);
    }
  }

  static async scheduleGameReminder(game: ProcessedGame): Promise<void> {
    try {
      const gameTime = new Date(game.commence_time);
      const reminderTime = new Date(gameTime.getTime() - 30 * 60 * 1000); // 30 min before

      if (reminderTime > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Game Starting Soon',
            body: `${game.away_team} @ ${game.home_team} starts in 30 minutes`,
            data: { 
              gameId: game.id, 
              type: 'reminder',
              sport: game.sport 
            },
            sound: true,
          },
          trigger: { date: reminderTime },
        });
      }
    } catch (error) {
      console.error('Failed to schedule game reminder:', error);
    }
  }

  static async scheduleOddsChangeAlert(game: ProcessedGame, oldOdds: number, newOdds: number): Promise<void> {
    try {
      const changePercent = ((newOdds - oldOdds) / oldOdds * 100).toFixed(1);
      const direction = newOdds > oldOdds ? 'increased' : 'decreased';
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📈 Odds Changed',
          body: `${game.home_team} odds ${direction} by ${Math.abs(parseFloat(changePercent))}%`,
          data: { 
            gameId: game.id, 
            type: 'odds_change',
            oldOdds,
            newOdds,
            sport: game.sport 
          },
          sound: false,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to schedule odds change alert:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  static async cancelNotificationsByType(type: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === type) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Failed to cancel notifications by type:', error);
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  static async handleNotificationReceived(notification: Notifications.Notification): Promise<void> {
    console.log('Notification received:', notification);
    
    const { type, gameId, sport } = notification.request.content.data || {};
    
    // Handle different notification types
    switch (type) {
      case 'arbitrage':
        console.log(`Arbitrage alert for game ${gameId} in ${sport}`);
        break;
      case 'reminder':
        console.log(`Game reminder for ${gameId}`);
        break;
      case 'odds_change':
        console.log(`Odds changed for game ${gameId}`);
        break;
      default:
        console.log('Unknown notification type');
    }
  }

  static async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
    console.log('Notification response:', response);
    
    const { type, gameId } = response.notification.request.content.data || {};
    
    // Navigate to appropriate screen based on notification type
    // This would integrate with your navigation system
    switch (type) {
      case 'arbitrage':
        // Navigate to game detail with arbitrage highlighted
        console.log(`Navigate to arbitrage details for game ${gameId}`);
        break;
      case 'reminder':
        // Navigate to game detail
        console.log(`Navigate to game ${gameId}`);
        break;
      default:
        console.log('No specific action for notification type');
    }
  }
}