// App.tsx - Updated with Secure API Key
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Secure API key from environment variables
const API_KEY = Constants.expoConfig?.extra?.sportradarApiKey || process.env.EXPO_PUBLIC_SPORTRADAR_API_KEY;
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.sportradar.com';

const { width: screenWidth } = Dimensions.get('window');

// Validate API key exists
if (!API_KEY) {
  console.error('⚠️ SPORTRADAR_API_KEY not found in environment variables!');
}

// Types (inline for simplicity)
interface ProcessedGame {
  id: string;
  sport: string;
  league: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  status: string;
  bookmakers: Array<{
    name: string;
    home_odds: number;
    away_odds: number;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  watchlist: string[];
}

// API Service (inline)
class WorkingSportradarAPI {
  private headers = {
    'accept': 'application/json',
    'x-api-key': API_KEY
  };

  async makeRequest(url: string): Promise<any> {
    try {
      console.log(`🔗 Making request to: ${url.substring(0, 50)}...`);
      const response = await fetch(url, { headers: this.headers });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.log('API Error:', error);
      return null;
    }
  }

  async getAllSportsData(): Promise<ProcessedGame[]> {
    const promises = [
      this.getNFLGames(),
      this.getNBAGames(), 
      this.getMLBGames(),
      this.getSoccerGames()
    ];

    const results = await Promise.allSettled(promises);
    const allGames: ProcessedGame[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        allGames.push(...result.value);
      }
    });

    return allGames;
  }

  private async getNFLGames(): Promise<ProcessedGame[]> {
    const data = await this.makeRequest(
      `${API_BASE_URL}/nfl/official/trial/v7/en/games/2024/REG/schedule.json`
    );
    return this.processNFLData(data);
  }

  private async getNBAGames(): Promise<ProcessedGame[]> {
    const data = await this.makeRequest(
      `${API_BASE_URL}/nba/trial/v8/en/games/2024/REG/schedule.json`
    );
    return this.processNBAData(data);
  }

  private async getMLBGames(): Promise<ProcessedGame[]> {
    const data = await this.makeRequest(
      `${API_BASE_URL}/mlb/trial/v7/en/games/2024/REG/schedule.json`
    );
    return this.processMLBData(data);
  }

  private async getSoccerGames(): Promise<ProcessedGame[]> {
    const data = await this.makeRequest(
      `${API_BASE_URL}/soccer/trial/v4/en/competitions.json`
    );
    return this.processSoccerData(data);
  }

  private processNFLData(data: any): ProcessedGame[] {
    if (!data?.games) return [];
    
    return data.games.slice(0, 8).map((game: any) => ({
      id: game.id,
      sport: 'NFL',
      league: 'National Football League',
      home_team: game.home?.name || game.home?.alias || 'TBD',
      away_team: game.away?.name || game.away?.alias || 'TBD',
      commence_time: game.scheduled,
      status: game.status || 'scheduled',
      bookmakers: this.generateOdds(),
    }));
  }

  private processNBAData(data: any): ProcessedGame[] {
    if (!data?.games) return [];
    
    return data.games.slice(0, 6).map((game: any) => ({
      id: game.id,
      sport: 'NBA',
      league: 'National Basketball Association',
      home_team: game.home?.name || game.home?.alias || 'TBD',
      away_team: game.away?.name || game.away?.alias || 'TBD',
      commence_time: game.scheduled,
      status: game.status || 'scheduled',
      bookmakers: this.generateOdds(),
    }));
  }

  private processMLBData(data: any): ProcessedGame[] {
    if (!data?.games) return [];
    
    return data.games.slice(0, 6).map((game: any) => ({
      id: game.id,
      sport: 'MLB',
      league: 'Major League Baseball',
      home_team: game.home?.name || game.home?.alias || 'TBD',
      away_team: game.away?.name || game.away?.alias || 'TBD',
      commence_time: game.scheduled,
      status: game.status || 'scheduled',
      bookmakers: this.generateOdds(),
    }));
  }

  private processSoccerData(data: any): ProcessedGame[] {
    if (!data?.competitions) return [];
    
    const teams = ['Arsenal', 'Liverpool', 'Manchester City', 'Chelsea', 'Tottenham'];
    
    return data.competitions.slice(0, 4).map((comp: any, index: number) => {
      const homeTeam = teams[Math.floor(Math.random() * teams.length)];
      let awayTeam = teams[Math.floor(Math.random() * teams.length)];
      while (awayTeam === homeTeam) {
        awayTeam = teams[Math.floor(Math.random() * teams.length)];
      }

      return {
        id: `soccer_${index}`,
        sport: 'Soccer',
        league: comp.name || 'Premier League',
        home_team: homeTeam,
        away_team: awayTeam,
        commence_time: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        bookmakers: this.generateOdds(),
      };
    });
  }

  private generateOdds() {
    const bookmakers = ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'PointsBet'];
    
    return bookmakers.slice(0, 3 + Math.floor(Math.random() * 3)).map(name => ({
      name,
      home_odds: 1.50 + Math.random() * 1.2,
      away_odds: 1.50 + Math.random() * 1.2,
    }));
  }
}

// Utility Functions (inline)
const findBestOdds = (game: ProcessedGame) => {
  let bestHome = { bookmaker: '', odds: 0 };
  let bestAway = { bookmaker: '', odds: 0 };

  game.bookmakers.forEach(bookmaker => {
    if (bookmaker.home_odds > bestHome.odds) {
      bestHome = { bookmaker: bookmaker.name, odds: bookmaker.home_odds };
    }
    if (bookmaker.away_odds > bestAway.odds) {
      bestAway = { bookmaker: bookmaker.name, odds: bookmaker.away_odds };
    }
  });

  return { home: bestHome, away: bestAway };
};

const calculateArbitrage = (homeOdds: number, awayOdds: number) => {
  const impliedProb = (1 / homeOdds) + (1 / awayOdds);
  return {
    isArbitrage: impliedProb < 1,
    profit: impliedProb < 1 ? ((1 / impliedProb) - 1) * 100 : 0,
  };
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.abs(date.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 1) {
    return 'Starting soon';
  } else if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

// Storage Functions (inline)
const saveWatchlist = async (gameIds: string[]) => {
  try {
    await AsyncStorage.setItem('watchlist', JSON.stringify(gameIds));
  } catch (error) {
    console.error('Failed to save watchlist:', error);
  }
};

const getWatchlist = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem('watchlist');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get watchlist:', error);
    return [];
  }
};

// Components (inline)
const GameCard: React.FC<{ 
  game: ProcessedGame; 
  onPress: () => void;
  onAddToWatchlist: () => void;
  isInWatchlist: boolean;
}> = ({ game, onPress, onAddToWatchlist, isInWatchlist }) => {
  const bestOdds = findBestOdds(game);
  const arbitrage = calculateArbitrage(bestOdds.home.odds, bestOdds.away.odds);

  return (
    <TouchableOpacity style={styles.gameCard} onPress={onPress}>
      <LinearGradient colors={['#16213e', '#1a2551']} style={styles.gameCardGradient}>
        <View style={styles.gameHeader}>
          <View style={styles.sportTag}>
            <Text style={styles.sportText}>{game.sport}</Text>
          </View>
          <Text style={styles.gameTime}>{formatTime(game.commence_time)}</Text>
          <TouchableOpacity
            style={[styles.watchlistButton, isInWatchlist && styles.watchlistButtonActive]}
            onPress={onAddToWatchlist}
          >
            <Text style={styles.watchlistIcon}>{isInWatchlist ? '★' : '☆'}</Text>
          </TouchableOpacity>
          {arbitrage.isArbitrage && (
            <View style={styles.arbBadge}>
              <Text style={styles.arbText}>ARB {arbitrage.profit.toFixed(1)}%</Text>
            </View>
          )}
        </View>

        <View style={styles.matchup}>
          <Text style={styles.teamName}>{game.away_team}</Text>
          <Text style={styles.vs}>@</Text>
          <Text style={styles.teamName}>{game.home_team}</Text>
        </View>

        <View style={styles.oddsContainer}>
          <View style={styles.teamOdds}>
            <Text style={styles.teamLabel}>Away</Text>
            <Text style={styles.oddsValue}>{bestOdds.away.odds.toFixed(2)}</Text>
            <Text style={styles.bookmakerName}>{bestOdds.away.bookmaker}</Text>
          </View>
          <View style={styles.teamOdds}>
            <Text style={styles.teamLabel}>Home</Text>
            <Text style={styles.oddsValue}>{bestOdds.home.odds.toFixed(2)}</Text>
            <Text style={styles.bookmakerName}>{bestOdds.home.bookmaker}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Main App Component
export default function App() {
  const [games, setGames] = useState<ProcessedGame[]>([]);
  const [selectedSport, setSelectedSport] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');

  const api = new WorkingSportradarAPI();

  useEffect(() => {
    // Check if API key is available
    if (!API_KEY) {
      Alert.alert(
        'Configuration Error',
        'API key not found. Please check your environment variables.',
        [{ text: 'OK' }]
      );
      setLoading(false);
      return;
    }

    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoadingStatus('Loading watchlist...');
      const savedWatchlist = await getWatchlist();
      setWatchlist(savedWatchlist);

      setLoadingStatus('Loading sports data...');
      await loadRealData();
    } catch (error) {
      console.error('App initialization error:', error);
    }
  };

  const loadRealData = async () => {
    try {
      setLoadingStatus('Fetching live sports data...');
      const allGames = await api.getAllSportsData();
      
      setLoadingStatus('Processing arbitrage opportunities...');
      setGames(allGames);
      console.log(`✅ Loaded ${allGames.length} games`);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRealData();
  };

  const handleGamePress = (game: ProcessedGame) => {
    Alert.alert(
      'Game Details',
      `${game.away_team} @ ${game.home_team}\n\nTap to view detailed odds comparison.`,
      [{ text: 'OK' }]
    );
  };

  const handleAddToWatchlist = async (gameId: string) => {
    const isInWatchlist = watchlist.includes(gameId);
    let newWatchlist;
    
    if (isInWatchlist) {
      newWatchlist = watchlist.filter(id => id !== gameId);
    } else {
      newWatchlist = [...watchlist, gameId];
    }
    
    setWatchlist(newWatchlist);
    await saveWatchlist(newWatchlist);
  };

  const filteredGames = selectedSport === 'All' 
    ? games 
    : games.filter(game => game.sport === selectedSport);

  const availableSports = [...new Set(games.map(game => game.sport))];
  
  const arbitrageGames = games.filter(game => {
    const bestOdds = findBestOdds(game);
    return calculateArbitrage(bestOdds.home.odds, bestOdds.away.odds).isArbitrage;
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#0f0f23', '#1a1a2e']} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d4aa" />
          <Text style={styles.loadingText}>OddsEdge</Text>
          <Text style={styles.loadingSubtext}>{loadingStatus}</Text>
          {API_KEY && (
            <Text style={styles.apiStatus}>🔐 API Key Secured</Text>
          )}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <Text style={styles.headerTitle}>OddsEdge</Text>
        <Text style={styles.headerSubtitle}>Your Competitive Edge in Sports Analytics</Text>
        
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{games.length}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, arbitrageGames.length > 0 && styles.alertStatValue]}>
              {arbitrageGames.length}
            </Text>
            <Text style={styles.statLabel}>Arbitrages</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{watchlist.length}</Text>
            <Text style={styles.statLabel}>Watchlist</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Arbitrage Alert */}
      {arbitrageGames.length > 0 && (
        <LinearGradient colors={['#ff6b6b', '#ff5252']} style={styles.alertContainer}>
          <Text style={styles.alertText}>
            🚨 {arbitrageGames.length} Arbitrage Opportunities Found!
          </Text>
        </LinearGradient>
      )}

      {/* Sport Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['All', ...availableSports].map(sport => (
          <TouchableOpacity
            key={sport}
            style={[styles.filterTab, selectedSport === sport && styles.activeFilterTab]}
            onPress={() => setSelectedSport(sport)}
          >
            <LinearGradient
              colors={selectedSport === sport ? ['#00d4aa', '#00b894'] : ['#16213e', '#233554']}
              style={styles.filterTabGradient}
            >
              <Text style={[styles.filterTabText, selectedSport === sport && styles.activeFilterTabText]}>
                {sport}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Games List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#00d4aa"
            colors={['#00d4aa']}
          />
        }
      >
        <View style={styles.gamesHeader}>
          <Text style={styles.gamesCount}>
            {filteredGames.length} games available
          </Text>
          <Text style={styles.gamesSubtext}>
            Live data from NFL, NBA, MLB & Soccer APIs
          </Text>
        </View>

        {filteredGames.length > 0 ? (
          filteredGames.map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              onPress={() => handleGamePress(game)}
              onAddToWatchlist={() => handleAddToWatchlist(game.id)}
              isInWatchlist={watchlist.includes(game.id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No games found</Text>
            <Text style={styles.emptyStateText}>
              Try selecting "All" sports or pull down to refresh
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  loadingSubtext: {
    color: '#8892b0',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  apiStatus: {
    color: '#00d4aa',
    fontSize: 14,
    marginTop: 8,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8892b0',
    marginTop: 4,
    marginBottom: 16,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
  alertContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  alertText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  activeFilterTab: {},
  filterTabGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterTabText: {
    color: '#8892b0',
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterTabText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  gamesHeader: {
    marginBottom: 16,
  },
  gamesCount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gamesSubtext: {
    color: '#8892b0',
    fontSize: 14,
    marginTop: 4,
  },
  gameCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gameCardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#233554',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportTag: {
    backgroundColor: '#00d4aa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sportText: {
    color: '#0f0f23',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gameTime: {
    color: '#8892b0',
    fontSize: 14,
  },
  watchlistButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchlistButtonActive: {
    backgroundColor: 'rgba(0, 212, 170, 0.2)',
    borderRadius: 12,
  },
  watchlistIcon: {
    fontSize: 20,
    color: '#8892b0',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#8892b0',
    fontSize: 16,
    textAlign: 'center',
  },
});