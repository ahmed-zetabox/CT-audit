import React from 'react';
import { AppTopNavigation } from '../navigation/TopNavigation';
import { AppNavigator } from '../navigation/BottomNavigation';


export const DashboardScreen = ({ navigation }) => {
  return (
    <>
          <AppTopNavigation navigation={navigation} />
          <AppNavigator />
    </>
  );
};

