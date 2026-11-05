// App.tsx — root provider tree
//
// Ordem importa:
// 1. QueryClientProvider (server state via TanStack Query)
// 2. ThemeProvider (estado global app via Context)
// 3. NavigationContainer (+ deep linking)
// 4. RootStack (screens)

import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { ThemeProvider } from '@/contexts/ThemeContext';
import RootStack, { type RootStackParamList } from '@/routes/RootStack';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

// Deep link (bônus):
//   expo://detail/603                           (dev build — scheme "expo" registrado no app.json)
//   aula02://detail/603                         (dev build — scheme próprio do app)
//   exp://<ip>:8081/--/detail/603               (Expo Go — Linking.createURL)
//   http://localhost:8081/detail/603            (web)
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'expo://', 'aula02://'],
  config: {
    // Cold start por deep link monta [Tabs, Detail] em vez de só [Detail]
    // → header tem botão voltar e o back do Android volta pra lista.
    initialRouteName: 'Tabs',
    screens: {
      Tabs: {
        screens: {
          Home: '',
          Favorites: 'favoritos',
          Settings: 'ajustes',
        },
      },
      Detail: {
        path: 'detail/:id',
        parse: { id: Number },
      },
    },
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavigationContainer linking={linking}>
          <RootStack />
          <StatusBar style="auto" />
        </NavigationContainer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
