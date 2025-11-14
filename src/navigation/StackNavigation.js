import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {DashboardScreen} from '../screens/DashboardScreen';
import {ScanModal} from '../components/ScanModal';
import {FullScreenTemp} from '../components/FullScreenTemp';
import {HistoryInChart} from '../components/HistoryInChart';
import HistoryScreen from '../screens/HistoryScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {SafeAreaProvider} from 'react-native-safe-area-context';

export const StackNavigation = () => {
  const Stack = createStackNavigator();
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Dashboard"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="FullScreenTemp" component={FullScreenTemp} />
          <Stack.Screen name="HistoryInChart" component={HistoryInChart} />
          <Stack.Screen name="Scan" component={ScanModal} />
          <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
