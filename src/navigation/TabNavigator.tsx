import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importando as telas que você acabou de criar
// (Estou usando 'src/screen/' (singular) baseado na sua estrutura de 'menu.tsx')
import ReportScreen from '../screen/ReportScreen';
import RoutesScreen from '../screen/RoutesScreen';
import ParkScreen from '../screen/ParkScreen';

// --- Placeholder para a Tela de Mapa ---
// (Você deve substituir isso pelo seu 'menu.tsx' ou uma tela de mapa dedicada)
import { View, Text, StyleSheet } from 'react-native';
function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela do Mapa (Guardião)</Text>
    </View>
  );
}
// ----------------------------------------

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  // Cor dos ícones confirmada pelo seu TabsNavegation.tsx
  const iconColor = '#f4511e'; 
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert';
          
          // Lógica de ícones baseada no seu TabsNavegation.tsx
          if (route.name === 'Guardião') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          } else if (route.name === 'Rotas') {
            iconName = focused ? 'navigate' : 'navigate-outline';
          } else if (route.name === 'Reporte') {
            iconName = focused ? 'alert-circle' : 'alert-circle-outline';
          } else if (route.name === 'Estacione') {
            iconName = focused ? 'car' : 'car-outline';
          }

          return <Ionicons name={iconName} size={size} color={iconColor} />;
        },
        tabBarActiveTintColor: iconColor,
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Vamos remover o header padrão
      })}
    >
      {/* Abas confirmadas pelo seu TabsNavegation.tsx */}
      <Tab.Screen name="Guardião" component={MapScreen} />
      <Tab.Screen name="Rotas" component={RoutesScreen} />
      <Tab.Screen name="Reporte" component={ReportScreen} />
      <Tab.Screen name="Estacione" component={ParkScreen} />
    </Tab.Navigator>
  );
}

// Estilos para o placeholder MapScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});