import React, {Suspense, useEffect} from 'react';
import {Text,View,TouchableOpacity,StyleSheet} from 'react-native'
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import {default as theme} from './custom-theme.json'; // <-- Import app theme
import 'react-native-gesture-handler';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {Provider} from 'react-redux';
import MainScreen from './src/screens/MainScreen';
import {store} from './src/store/store';
import Toast from 'react-native-toast-message'
import GeneralStatusBarColor from './src/components/GeneralStatusBarColor';
import SplashScreen from 'react-native-splash-screen'
import { toastConfig } from './src/components/customToast';
 export default () => {
  useEffect(()=>{
    SplashScreen.hide()
  },[])

  return (
    <Provider store={store}>
      <Suspense fallback={<Text>Load...</Text>}>
      <GeneralStatusBarColor barStyle="light-content" backgroundColor={"#1B1D3A"}  />
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{...eva.light, ...theme}}>
        <MainScreen />
        <Toast  config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
      </ApplicationProvider>
      </Suspense>
    </Provider>
  );
};
 
