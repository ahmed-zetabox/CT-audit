import React from 'react';
import {View, Text} from 'react-native';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import {default as theme} from './custom-theme.json';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {Provider} from 'react-redux';
import {store} from './src/store/store';
import GeneralStatusBarColor from './src/components/GeneralStatusBarColor';
import MainScreen from './src/screens/MainScreen';

const App = () => {
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
