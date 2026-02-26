import React, {useState, useEffect} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import {default as theme} from './custom-theme.json';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {Provider} from 'react-redux';
import {store} from './src/store/store';
import GeneralStatusBarColor from './src/components/GeneralStatusBarColor';
import MainScreen from './src/screens/MainScreen';
import i18n from './i18n'; // Initialize i18n

const App = () => {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    // Wait for i18n to be fully initialized
    const checkI18n = () => {
      if (i18n.isInitialized) {
        setI18nReady(true);
      } else {
        // Check again in 50ms if not ready
        setTimeout(checkI18n, 50);
      }
    };
    checkI18n();
  }, []);

  if (!i18nReady) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1B1D3A'}}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{color: '#fff', marginTop: 10}}>Loading translations...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{...eva.light, ...theme}}>
        <GeneralStatusBarColor
          barStyle="light-content"
          backgroundColor={"#1B1D3A"}
        />
        <View style={{flex: 1}}>
          <MainScreen />
        </View>
      </ApplicationProvider>
    </Provider>
  );
};

export default App;
