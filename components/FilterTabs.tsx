// components/FilterTabs.tsx - Sport Filter Component
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FilterTabsProps {
  selectedSport: string;
  onSportSelect: (sport: string) => void;
  availableSports: string[];
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  selectedSport,
  onSportSelect,
  availableSports,
}) => {
  const allSports = ['All', ...availableSports];

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'NFL': return '🏈';
      case 'NBA': return '🏀';
      case 'MLB': return '⚾';
      case 'NHL': return '🏒';
      case 'Soccer': return '⚽';
      default: return '🏆';
    }
  };

  const getSportCount = (sport: string) => {
    if (sport === 'All') {
      return availableSports.reduce((total, s) => total + 1, 0);
    }
    return 1; // This would be dynamic in a real app
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {allSports.map(sport => (
          <TouchableOpacity
            key={sport}
            style={styles.tabContainer}
            onPress={() => onSportSelect(sport)}
          >
            <LinearGradient
              colors={selectedSport === sport ? ['#00d4aa', '#00b894'] : ['#16213e', '#233554']}
              style={styles.tabGradient}
            >
              <View style={styles.tabContent}>
                <Text style={styles.sportIcon}>
                  {getSportIcon(sport)}
                </Text>
                <Text style={[
                  styles.tabText, 
                  selectedSport === sport && styles.activeTabText
                ]}>
                  {sport}
                </Text>
                {sport !== 'All' && (
                  <View style={[
                    styles.countBadge,
                    selectedSport === sport && styles.activeCountBadge
                  ]}>
                    <Text style={[
                      styles.countText,
                      selectedSport === sport && styles.activeCountText
                    ]}>
                      {getSportCount(sport)}
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  tabContainer: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  tabGradient: {
    borderRadius: 20,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sportIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tabText: {
    color: '#8892b0',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  countBadge: {
    backgroundColor: 'rgba(136, 146, 176, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  countText: {
    color: '#8892b0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeCountText: {
    color: '#fff',
  },
});