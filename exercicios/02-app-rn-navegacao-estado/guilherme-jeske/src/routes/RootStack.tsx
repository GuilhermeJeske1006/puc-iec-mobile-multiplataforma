// src/routes/RootStack.tsx
//
// CAMADA ROUTES — navegação do app.
// Doc: https://reactnavigation.org/docs/native-stack-navigator
//
// Estrutura:
//   RootStack
//   ├── Tabs (BottomTabs: Home + Favoritos)  ← sem header próprio, cada aba tem o seu
//   └── Detail                               ← empilha POR CIMA das abas
//
// Deep link (ver App.tsx): expo://detail/<id> → Detail { id }

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import MovieDetail from '@/screens/MovieDetail';
import BottomTabs, { type TabParamList } from '@/routes/BottomTabs';

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  // title é opcional: via deep link só temos o id (o título vem da query).
  Detail: { id: number; title?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        // Garante header back button visível em web e nativo
        headerBackVisible: true,
        headerBackTitle: 'Voltar',
      }}
    >
      <Stack.Screen name="Tabs" component={BottomTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="Detail"
        component={MovieDetail}
        options={({ route }) => ({
          title: route.params.title ?? 'Detalhe',
          headerBackTitle: 'Voltar',
        })}
      />
    </Stack.Navigator>
  );
}
