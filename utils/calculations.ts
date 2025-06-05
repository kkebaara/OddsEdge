// utils/calculations.ts - Utility Functions
import { ProcessedGame, ArbitrageOpportunity } from '../types/AppTypes';

export const findBestOdds = (game: ProcessedGame) => {
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

export const calculateArbitrage = (homeOdds: number, awayOdds: number) => {
  const impliedProb = (1 / homeOdds) + (1 / awayOdds);
  return {
    isArbitrage: impliedProb < 1,
    profit: impliedProb < 1 ? ((1 / impliedProb) - 1) * 100 : 0,
  };
};

export const calculateArbitrageStakes = (
  homeOdds: number, 
  awayOdds: number, 
  totalStake: number
) => {
  const impliedProbHome = 1 / homeOdds;
  const impliedProbAway = 1 / awayOdds;
  const totalImpliedProb = impliedProbHome + impliedProbAway;
  
  const stakeHome = (totalStake * impliedProbHome) / totalImpliedProb;
  const stakeAway = (totalStake * impliedProbAway) / totalImpliedProb;
  
  return {
    home: stakeHome,
    away: stakeAway,
    guaranteedReturn: Math.min(stakeHome * homeOdds, stakeAway * awayOdds),
    profit: Math.min(stakeHome * homeOdds, stakeAway * awayOdds) - totalStake
  };
};

export const formatOdds = (odds: number, format: 'decimal' | 'american' | 'fractional') => {
  switch (format) {
    case 'american':
      return odds >= 2.0 ? `+${Math.round((odds - 1) * 100)}` : `-${Math.round(100 / (odds - 1))}`;
    case 'fractional':
      const numerator = Math.round((odds - 1) * 100);
      const denominator = 100;
      const gcd = getGCD(numerator, denominator);
      return `${numerator / gcd}/${denominator / gcd}`;
    default:
      return odds.toFixed(2);
  }
};

export const calculateImpliedProbability = (odds: number): number => {
  return (1 / odds) * 100;
};

export const calculatePotentialReturn = (stake: number, odds: number): number => {
  return stake * odds;
};

export const calculateProfit = (stake: number, odds: number): number => {
  return (stake * odds) - stake;
};

export const formatTime = (dateString: string): string => {
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

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculateROI = (totalStaked: number, totalReturns: number): number => {
  if (totalStaked === 0) return 0;
  return ((totalReturns - totalStaked) / totalStaked) * 100;
};

export const findArbitrageOpportunities = (games: ProcessedGame[]): ArbitrageOpportunity[] => {
  const opportunities: ArbitrageOpportunity[] = [];

  games.forEach(game => {
    const bestOdds = findBestOdds(game);
    const arbitrage = calculateArbitrage(bestOdds.home.odds, bestOdds.away.odds);

    if (arbitrage.isArbitrage) {
      const stakes = calculateArbitrageStakes(bestOdds.home.odds, bestOdds.away.odds, 100);
      
      opportunities.push({
        game,
        home_odds: bestOdds.home.odds,
        away_odds: bestOdds.away.odds,
        home_bookmaker: bestOdds.home.bookmaker,
        away_bookmaker: bestOdds.away.bookmaker,
        profit_percentage: arbitrage.profit,
        required_stakes: {
          home: stakes.home,
          away: stakes.away
        }
      });
    }
  });

  return opportunities.sort((a, b) => b.profit_percentage - a.profit_percentage);
};

export const calculateKellyBet = (
  probability: number, 
  odds: number, 
  bankroll: number
): number => {
  const q = 1 - probability;
  const b = odds - 1;
  const kellyFraction = (probability * b - q) / b;
  
  // Cap Kelly bet at 25% of bankroll for safety
  const maxFraction = 0.25;
  const safeFraction = Math.min(kellyFraction, maxFraction);
  
  return safeFraction > 0 ? bankroll * safeFraction : 0;
};

export const isValueBet = (
  estimatedProbability: number, 
  bookmakerOdds: number, 
  minEdge: number = 0.05
): boolean => {
  const impliedProbability = 1 / bookmakerOdds;
  const edge = estimatedProbability - impliedProbability;
  return edge > minEdge;
};

// Helper function to calculate Greatest Common Divisor
const getGCD = (a: number, b: number): number => {
  return b === 0 ? a : getGCD(b, a % b);
};

// Validation functions
export const isValidOdds = (odds: number): boolean => {
  return odds > 1 && odds < 1000 && !isNaN(odds);
};

export const isValidStake = (stake: number, maxStake: number = 10000): boolean => {
  return stake > 0 && stake <= maxStake && !isNaN(stake);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};