// services/SportradarAPI.ts - API Service
import { ProcessedGame, ApiAnalytics } from '../types/AppTypes';

const API_KEY = 'lGcQeGSVnA97jWyLZYR9dnmEvdlRJveiqVCukj8Q';

export class WorkingSportradarAPI {
  private headers = {
    'accept': 'application/json',
    'x-api-key': API_KEY
  };
  
  private analytics: ApiAnalytics = {
    api_calls: 0,
    response_times: [],
    errors: 0,
    last_updated: new Date().toISOString(),
    avg_response_time: 0,
    success_rate: '100'
  };

  async makeRequest(url: string, retries = 3): Promise<any> {
    const startTime = Date.now();
    this.analytics.api_calls++;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, { 
          headers: this.headers,
        });
        
        const responseTime = Date.now() - startTime;
        this.analytics.response_times.push(responseTime);
        
        if (response.ok) {
          return await response.json();
        } else if (i === retries - 1) {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        if (i === retries - 1) {
          this.analytics.errors++;
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
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
    try {
      const data = await this.makeRequest(
        'https://api.sportradar.com/nfl/official/trial/v7/en/games/2024/REG/schedule.json'
      );
      return this.processNFLData(data);
    } catch (error) {
      console.log('NFL API error:', error);
      return [];
    }
  }

  private async getNBAGames(): Promise<ProcessedGame[]> {
    try {
      const data = await this.makeRequest(
        'https://api.sportradar.com/nba/trial/v8/en/games/2024/REG/schedule.json'
      );
      return this.processNBAData(data);
    } catch (error) {
      console.log('NBA API error:', error);
      return [];
    }
  }

  private async getMLBGames(): Promise<ProcessedGame[]> {
    try {
      const data = await this.makeRequest(
        'https://api.sportradar.com/mlb/trial/v7/en/games/2024/REG/schedule.json'
      );
      return this.processMLBData(data);
    } catch (error) {
      console.log('MLB API error:', error);
      return [];
    }
  }

  private async getSoccerGames(): Promise<ProcessedGame[]> {
    try {
      const data = await this.makeRequest(
        'https://api.sportradar.com/soccer/trial/v4/en/competitions.json'
      );
      return this.processSoccerData(data);
    } catch (error) {
      console.log('Soccer API error:', error);
      return [];
    }
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
      bookmakers: this.generateEnhancedOdds(),
      trending: this.generateTrending()
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
      bookmakers: this.generateEnhancedOdds(),
      trending: this.generateTrending()
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
      bookmakers: this.generateEnhancedOdds(),
      trending: this.generateTrending()
    }));
  }

  private processSoccerData(data: any): ProcessedGame[] {
    if (!data?.competitions) return [];
    
    const teams = ['Arsenal', 'Liverpool', 'Manchester City', 'Chelsea', 'Tottenham', 'Manchester United'];
    
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
        bookmakers: this.generateEnhancedOdds(),
        trending: this.generateTrending()
      };
    });
  }

  private generateEnhancedOdds() {
    const bookmakers = [
      'DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'PointsBet', 
      'WynnBET', 'Barstool', 'FOX Bet', 'TwinSpires', 'BetRivers'
    ];
    
    const count = 4 + Math.floor(Math.random() * 6);
    return bookmakers.slice(0, count).map(name => ({
      name,
      home_odds: 1.50 + Math.random() * 1.2,
      away_odds: 1.50 + Math.random() * 1.2,
    }));
  }

  private generateTrending(): 'up' | 'down' | 'stable' {
    const rand = Math.random();
    if (rand < 0.33) return 'up';
    if (rand < 0.66) return 'down';
    return 'stable';
  }

  getAnalytics(): ApiAnalytics {
    return {
      ...this.analytics,
      avg_response_time: this.analytics.response_times.length > 0 
        ? this.analytics.response_times.reduce((a, b) => a + b, 0) / this.analytics.response_times.length 
        : 0,
      success_rate: this.analytics.api_calls > 0 
        ? ((this.analytics.api_calls - this.analytics.errors) / this.analytics.api_calls * 100).toFixed(1)
        : '100'
    };
  }
}