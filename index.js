/**
 * @format
 */

import {AppRegistry} from 'react-native';
import './i18n';
import App from './App';
import {name as appName} from './app.json';
//new LogBox
require('react-native').unstable_enableLogBox()
AppRegistry.registerComponent(appName, () => App);
