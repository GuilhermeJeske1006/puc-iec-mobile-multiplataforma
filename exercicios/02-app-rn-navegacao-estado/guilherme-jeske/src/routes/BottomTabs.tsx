// src/routes/BottomTabs.tsx
//
// BÔNUS — Bottom Tabs: Filmes + Favoritos (lista persistida no MMKV) + Ajustes.
// Doc: https://reactnavigation.org/docs/bottom-tab-navigator

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import MovieList from '@/screens/MovieList';
import FavoritesScreen from '@/screens/FavoritesScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { useFavoritesStore } from '@/store/favoritesStore';

export type TabParamList = {
  Home: undefined;
  Favorites: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcon = (emoji: string) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
  };

export default function BottomTabs() {
  // Badge com a quantidade de favoritos — re-renderiza só quando o length muda.
  const favCount = useFavoritesStore((s) => s.ids.length);

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={MovieList}
        options={{ title: 'Filmes', tabBarIcon: tabIcon('🎬') }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favoritos',
          tabBarIcon: tabIcon('❤️'),
          tabBarBadge: favCount > 0 ? favCount : undefined,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Ajustes', tabBarIcon: tabIcon('⚙️') }}
      />
    </Tab.Navigator>
  );
}
