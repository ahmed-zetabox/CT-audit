import * as actionTypes from '../actions/actionTypes';
import * as constants from '../../config/constants';
const initialState = {
  BLEList: [],
  connectedDevice: null,
  connectedDeviceServices: [],
  connectedService1Characteristics: [],
  connectedService2Characteristics: [],
  servicesStatus: constants.SERVICES_STATUS_SUCCESS,
  status: constants.STATUS_DISCONNECTED,
  error_toast: false,
};
const bleReducer = (state = initialState, action) => {
  switch (action.type) {
    // need also condition => !action.payload.isConnectable ||
    case actionTypes.ADD_BLE:
      if (
        state.BLEList.some((device) => device.id === action.payload.id) ||
        action.payload.name === null ||
        !action.payload.name.includes(constants.PREFIX_BLE_NAME)
      ) {
        return state;
      } else {
        return {
          ...state,
          BLEList: [...state.BLEList, action.payload],
        };
      }
    case actionTypes.CONNECTED_DEVICE:
      return {
        ...state,
        connectedDevice: action.payload,
      };
    case actionTypes.CHANGE_STATUS:
      return {
        ...state,
        status: action.payload,
      };
    case actionTypes.CONNECTED_SERVICES:
      return {
        ...state,
        connectedDeviceServices: action.payload,
      };
    case actionTypes.DELETE_DEVICE:
      return {
        ...state,
        BLEList: state.BLEList.filter((el) => el.id != action.payload),
      };
    case actionTypes.CONNECTED_CHARACTERISTICS:
      return {
        ...state,
        connectedService1Characteristics: action.payload,
      };
    case actionTypes.CONNECTED_2CHARACTERISTICS:
      return {
        ...state,
        connectedService2Characteristics: action.payload,
      };
    case actionTypes.SERVICES_STATUS:
      return {
        ...state,
        servicesStatus: action.payload,
      };
    case actionTypes.DELETE_BLE:
      return {
        ...state,
        BLEList: [],
      };
    case actionTypes.CLEAR_DISCONNECTED_DEVICES:
      if (state.connectedDevice) {
        const connectedDevice = state.BLEList.find((device) => {
          return device.id === state.connectedDevice.id;
        });
        return {
          ...state,
          BLEList: [connectedDevice],
        };
      } else {
        return {
          ...state,
          BLEList: [],
        };
      }
    case actionTypes.ERRORTOAST:
      return {
        ...state,
        error_toast: action.payload,
      };
  }
  return state;
};
export default bleReducer;
