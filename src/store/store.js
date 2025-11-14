import React from 'react';
import {applyMiddleware, combineReducers, compose, createStore} from 'redux';
import thunk from 'redux-thunk';
import appReducer from './reducers/appReducer';
import bleReducer from './reducers/bleReducer';
import supervisorReducer from './reducers/supervisorReducer';
import maintenanceReducer from './reducers/maintenanceReducer';
import coldwayReducer from './reducers/coldwayReducer';
import historiqueReducer from './reducers/historiqueReducer';
import {BleManager} from 'react-native-ble-plx';

const DeviceManager = new BleManager();

const rootReducer = combineReducers({
  appReducer,
  bleReducer,
  supervisorReducer,
  maintenanceReducer,
  coldwayReducer,
  historiqueReducer,
});
const combineEnhancer =
  (typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;
export const store = createStore(
  rootReducer,
  combineEnhancer(applyMiddleware(thunk.withExtraArgument(DeviceManager))),
);
