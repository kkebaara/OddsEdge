// components/Header.tsx - App Header Component
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '../types/AppTypes';

interface HeaderProps {
  user: User | null;
  gamesCount: number;
  arbitrageCount: number;
  watchlistCount: number;
  onProfilePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  gamesCount,
  arbitrageCount,
  watchlistCount,
  onProfilePress
}) => {
  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>OddsEdge Pro</Text>
          <Text style={styles.subtitle}>Advanced Sports Betting Intelligence</Text>
        </View>
        
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.name.charAt(0) || 'U'}
            </Text>
          </View>
          {user?.isPremium && (
            <View style={styles.premiumIndicator}>
              <Text style={styles.premiumIndicatorText}>🏆</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{gamesCount}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, arbitrageCount > 0 && styles.alertStatValue]}>
            {arbitrageCount}
          </Text>
          <Text style={styles.statLabel}>Arbitrages</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>100%</Text>
          <Text style={styles.statLabel}>API Success</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{watchlistCount}</Text>
          <Text style={styles.statLabel}>Watchlist</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  subtitle: {
    fontSize: 14,
    color: '#8892b0',
    marginTop: 4,
  },
  profileButton: {
    position: 'relative',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#233554',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  premiumIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumIndicatorText: {
    fontSize: 10,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#00d4aa',
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertStatValue: {
    color: '#ff6b6b',
  },
  statLabel: {
    color: '#8892b0',
    fontSize: 12,
    marginTop: 2,
  },
});