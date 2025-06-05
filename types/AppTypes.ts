// types/AppTypes.ts - TypeScript Type Definitions
export interface User {
    id: string;
    name: string;
    email: string;
    isPremium: boolean;
    watchlist: string[];
    preferences: UserPreferences;
    stats: UserStats;
  }
  
  export interface UserPreferences {
    notifications: {
      arbitrage: boolean;
      odds_changes: boolean;
      game_reminders: boolean;
    };
    default_stake: number;
    preferred_odds_format: 'decimal' | 'american' | 'fractional';
    favorite_sports: string[];
  }
  
  export interface UserStats {
    total_bets: number;
    profit_loss: number;
    roi: number;
    arbitrage_found: number;
    win_rate: number;
  }
  
  export interface ProcessedGame {
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
    historical_odds?: Array<{
      timestamp: string;
      home_odds: number;
      away_odds: number;
    }>;
    trending?: 'up' | 'down' | 'stable';
  }
  
  export interface BetSlip {
    id: string;
    game_id: string;
    team: string;
    odds: number;
    stake: number;
    potential_return: number;
    bookmaker: string;
    bet_type: 'moneyline' | 'spread' | 'total';
    timestamp: string;
  }
  
  export interface ArbitrageOpportunity {
    game: ProcessedGame;
    home_odds: number;
    away_odds: number;
    home_bookmaker: string;
    away_bookmaker: string;
    profit_percentage: number;
    required_stakes: {
      home: number;
      away: number;
    };
  }
  
  export interface ApiAnalytics {
    api_calls: number;
    response_times: number[];
    errors: number;
    last_updated: string;
    avg_response_time: number;
    success_rate: string;
  }