import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

// 1. Importa o TabNavigator que acabamos de criar
// (Estou assumindo que você o salvou em './TabNavigator.tsx', no mesmo diretório)
import { TabNavigator } from './TabNavigator';

/**
 * Este é o componente Navegador Raiz.
 * Ele envolve todos os outros navegadores no NavigationContainer.
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      {/* 2. Renderiza o seu navegador de abas principal */}
      <TabNavigator />
      
      {/* Mantém a barra de status */}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}