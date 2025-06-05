// components/GameCard.tsx - Game Card Component
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ProcessedGame, User } from '../types/AppTypes';
import { findBestOdds, calculateArbitrage, formatTime } from '../utils/calculations';

interface GameCardProps {
  game: ProcessedGame;
  onPress: () => void;
  onAddToWatchlist: () => void;
  isInWatchlist: boolean;
  user: User | null;
}

export const GameCard: React.FC<GameCardProps> = ({ 
  game, 
  onPress, 
  onAddToWatchlist, 
  isInWatchlist, 
  user 
}) => {
  const bestOdds = findBestOdds(game);
  const arbitrage = calculateArbitrage(bestOdds.home.odds, bestOdds.away.odds);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getTrendingColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '#00d4aa';
      case 'down': return '#ff6b6b';
      default: return '#8892b0';
    }
  };

  const getTrendingIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#16213e', '#1a2551']}
          style={styles.cardGradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.gameInfo}>
              <View style={styles.sportTag}>
                <Text style={styles.sportText}>{game.sport}</Text>
              </View>
              <Text style={styles.leagueText}>{game.league}</Text>
              {game.trending && (
                <View style={[styles.trendingIndicator, { borderColor: getTrendingColor(game.trending) }]}>
                  <Text style={[styles.trendingIcon, { color: getTrendingColor(game.trending) }]}>
                    {getTrendingIcon(game.trending)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.gameTime}>{formatTime(game.commence_time)}</Text>
              <TouchableOpacity
                style={[styles.watchlistButton, isInWatchlist && styles.watchlistButtonActive]}
                onPress={onAddToWatchlist}
              >
                <Text style={[styles.watchlistIcon, isInWatchlist && styles.watchlistIconActive]}>
                  {isInWatchlist ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
              {arbitrage.isArbitrage && (
                <View style={styles.arbBadge}>
                  <Text style={styles.arbText}>ARB {arbitrage.profit.toFixed(1)}%</Text>
                </View>
              )}
            </View>
          </View>

          {/* Teams Matchup */}
          <View style={styles.matchup}>
            <Text style={styles.teamName}>{game.away_team}</Text>
            <Text style={styles.vs}>@</Text>
            <Text style={styles.teamName}>{game.home_team}</Text>
          </View>

          {/* Odds Display */}
          <View style={styles.oddsContainer}>
            <View style={styles.teamOdds}>
              <Text style={styles.teamLabel}>Away</Text>
              <View style={styles.bestOdds}>
                <Text style={styles.oddsValue}>
                  {bestOdds.away.odds > 0 ? bestOdds.away.odds.toFixed(2) : 'N/A'}
                </Text>
                <Text style={styles.bookmakerName}>{bestOdds.away.bookmaker}</Text>
              </View>
            </View>

            <View style={styles.teamOdds}>
              <Text style={styles.teamLabel}>Home</Text>
              <View style={styles.bestOdds}>
                <Text style={styles.oddsValue}>
                  {bestOdds.home.odds > 0 ? bestOdds.home.odds.toFixed(2) : 'N/A'}
                </Text>
                <Text style={styles.bookmakerName}>{bestOdds.home.bookmaker}</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.bookmakerCount}>
              {game.bookmakers.length} bookmaker{game.bookmakers.length !== 1 ? 's' : ''}
            </Text>
            {user?.isPremium && (
              <Text style={styles.premiumFeature}>📈 Premium analytics</Text>
            )}
            {game.status === 'live' && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>🔴 LIVE</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#233554',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gameInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportTag: {
    backgroundColor: '#00d4aa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  sportText: {
    color: '#0f0f23',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leagueText: {
    color: '#8892b0',
    fontSize: 12,
    marginRight: 8,
    flex: 1,
  },
  trendingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  gameTime: {
    color: '#8892b0',
    fontSize: 14,
    marginBottom: 4,
  },
  watchlistButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  watchlistButtonActive: {
    backgroundColor: 'rgba(0, 212, 170, 0.2)',
    borderRadius: 12,
  },
  watchlistIcon: {
    fontSize: 20,
    color: '#8892b0',
  },
  watchlistIconActive: {
    color: '#00d4aa',
  },
  arbBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  arbText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  teamName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  vs: {
    color: '#8892b0',
    fontSize: 16,
    marginHorizontal: 12,
  },
  oddsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamOdds: {
    flex: 1,
    alignItems: 'center',
  },
  teamLabel: {
    color: '#8892b0',
    fontSize: 14,
    marginBottom: 8,
  },
  bestOdds: {
    alignItems: 'center',
  },
  oddsValue: {
    color: '#00d4aa',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bookmakerName: {
    color: '#8892b0',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#233554',
  },
  bookmakerCount: {
    color: '#8892b0',
    fontSize: 12,
  },
  premiumFeature: {
    color: '#00d4aa',
    fontSize: 12,
  },
  liveBadge: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});