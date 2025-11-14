import * as actionTypes from '../actions/actionTypes';
import * as constants from '../../config/constants';

const initialState = {
  isAppInitialized: false,
  isUserLogged: false,
  language: 'en',
  isScanModalVisible: true,
  screenOrientation: constants.SCREEN_NORMAL,
  bluetoothPermissionStatus: false,
  locationPermissionStatus: false,
  unite: '°C',
  GlobalSettingsUnite: '°C',
  diagMode: false,
  systemStatus: null,
  ihmVersion: '--',
  mcuVersion: '--',
  esp32Version: '--',
  serialKeyVersion: '--',
  isParamsEdited: {
    status: constants.CLDW_PARAMS_STATUS_Clear,
    path: null,
  },
  isParamsSimpleSettingsEdited: {
    status: constants.CLDW_PARAMS_STATUS_Clear,
    path: null,
  },
  isParamsProgrammingEdited: {
    status: constants.CLDW_PARAMS_STATUS_Clear,
    path: null,
  },
  isParametersLoading: true,
};
const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.APP_INIT:
      return {
        ...state,
        isAppInitialized: action.payload,
      };
    case actionTypes.USER_LOGGED:
      return {
        ...state,
        isUserLogged: action.payload,
      };
    case actionTypes.CHANGE_SCREEN_ORIENTATION:
      return {
        ...state,
        screenOrientation: action.payload,
      };
    case actionTypes.BLUETOOTH_PERMISSION_STATUS:
      return {
        ...state,
        bluetoothPermissionStatus: action.payload,
      };
    case actionTypes.LOCATION_PERMISSION_STATUS:
      return {
        ...state,
        locationPermissionStatus: action.payload,
      };
    case actionTypes.TEMPUNITI:
      return {
        ...state,
        unite: action.unite,
      };
    case actionTypes.GLOBALTEMPUNITI:
      return {
        ...state,
        GlobalSettingsUnite: action.GlobalSettingsUnite,
      };
    case actionTypes.IS_SCAN_MODAL_VISIBLE:
      return {
        ...state,
        isScanModalVisible: action.payload,
      };
    case actionTypes.TOGGLE_DIAG_MODE:
      return {
        ...state,
        diagMode: action.payload,
      };
    case actionTypes.CHANGE_SYSTEM_STATUS:
      return {
        ...state,
        systemStatus: action.payload,
      };
    case actionTypes.IHM_VERSION:
      return {
        ...state,
        ihmVersion: action.payload,
      };
    case actionTypes.MCU_Version:
      return {
        ...state,
        mcuVersion: action.payload,
      };
    case actionTypes.ESP32_VERSION:
      return {
        ...state,
        esp32Version: action.payload,
      };
    case actionTypes.SERIAL_VERSION:
      return {
        ...state,
        serialKeyVersion: action.payload,
      };
    case actionTypes.TOGGLE_IS_PARAMS_EDITED:
      return {
        ...state,
        isParamsEdited: action.payload,
      };
    case actionTypes.TOGGLE_IS_PARAMS_PROGRAMMING_EDITED:
      return {
        ...state,
        isParamsProgrammingEdited: action.payload,
      };
    case actionTypes.TOGGLE_IS_PARAMS_SIMPLE_SETTINGS_EDITED:
      return {
        ...state,
        isParamsSimpleSettingsEdited: action.payload,
      };
    case actionTypes.TOGGLE_IS_PARAMS_LOADING:
      return {
        ...state,
        isParametersLoading: action.payload,
      };
  }
  return state;
};
export default appReducer;
