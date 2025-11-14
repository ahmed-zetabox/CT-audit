import * as actionTypes from './actionTypes';
import * as constants from '../../config/constants';
import * as actionCreators from './index';
import {Platform} from 'react-native';
import {toggleIsParamsLoading} from './index';
import {BLE_CONNECTION_TIMEOUT} from '../../components/Common_functions';

const addBle = (data) => {
  return {
    type: actionTypes.ADD_BLE,
    payload: data,
  };
};

export const deleteBleList = () => {
  return {
    type: actionTypes.DELETE_BLE,
  };
};

export const clearDisconnectedDevicesFromBleList = () => {
  return {
    type: actionTypes.CLEAR_DISCONNECTED_DEVICES,
  };
};

const connectedDevice = (data) => {
  return {
    type: actionTypes.CONNECTED_DEVICE,
    payload: data,
  };
};

const errorToast = (data) => {
  return {
    type: actionTypes.ERRORTOAST,
    payload: data,
  };
};

const changeStatus = (data) => {
  return {
    type: actionTypes.CHANGE_STATUS,
    payload: data,
  };
};

const connectedDeviceServices = (data) => ({
  type: actionTypes.CONNECTED_SERVICES,
  payload: data,
});

const changeServicesStatus = (data) => {
  return {
    type: actionTypes.SERVICES_STATUS,
    payload: data,
  };
};

const onDelete = (data) => ({
  type: actionTypes.DELETE_DEVICE,
  payload: data,
});

const connectedService1Characteristics = (data) => ({
  type: actionTypes.CONNECTED_CHARACTERISTICS,
  payload: data,
});

const connectedService2Characteristics = (data) => ({
  type: actionTypes.CONNECTED_2CHARACTERISTICS,
  payload: data,
});

const scan = (val) => {
  return (dispatch, getState, DeviceManager) => {
    if (getState().bleReducer.status !== constants.STATUS_CONNECTED) {
      dispatch(changeStatus(constants.STATUS_SCANNING));
      DeviceManager.startDeviceScan(
        null,
        {allowDuplicates: true},
        (error, device) => {
          if (error) {
            if (error.errorCode !== 600) {
              dispatch(changeStatus(constants.STATUS_DISCONNECTED));
              dispatch(deleteBleList());
            }
            setTimeout(() => {
              dispatch(scan('setTimeout'));
            }, 5000);
          } else {
            if (device !== null) {
              dispatch(changeStatus(constants.STATUS_SCANNING));
              dispatch(addBle(device));
            }
          }
        },
      );
    }
  };
};

export const startScan = () => {
  return (dispatch, getState, DeviceManager) => {
    const subscription = DeviceManager.onStateChange((state) => {
      if (state === constants.POWERED_ON) {
        dispatch(actionCreators.changeBluetoothStatus(true));
        dispatch(scan('startScan'));
      } else {
        dispatch(changeStatus(constants.STATUS_DISCONNECTED));
        dispatch(scan('startScan'));
        dispatch(actionCreators.changeBluetoothStatus(false));
      }
    }, true);
  };
};

const onDisconnect = (device) => {
  return async (dispatch, getState, DeviceManager) => {
    dispatch(errorToast(false));
    DeviceManager.onDeviceDisconnected(device.id, (error, device) => {
      if (error) {
        console.log('on Disconnect', error);
      }
      // Refresh list
      dispatch(deleteBleList());
      dispatch(actionCreators.setIhmVersion('--'));
      dispatch(actionCreators.setMcuVersion('--'));
      dispatch(actionCreators.setEsp32Version('--'));
      dispatch(actionCreators.setSerialKeyVersion('--'));
      // Reset folder and file state
      dispatch(actionCreators.toggleIsFolderLoading(false));
      dispatch(actionCreators.toggleIsFileLoading(false));

      dispatch(resetDevice());
      dispatch(changeStatus(constants.STATUS_DISCONNECTED));
      dispatch(startScan());
      dispatch(actionCreators.resetCycle());
      dispatch(errorToast(true));
      dispatch(actionCreators.toggleIsFolderLoading(true));
      dispatch(actionCreators.resetIsParamsEdited());
    });
  };
};

export const connectDevice = (device) => {
  return async (dispatch, getState, DeviceManager) => {
    if (
      getState().bleReducer.status === constants.STATUS_SCANNING ||
      getState().bleReducer.status === constants.STATUS_DISCONNECTED
    ) {
      dispatch(changeStatus(constants.STATUS_CONNECTING));
      await stopScan(DeviceManager);
      await device
        .connect({timeout: BLE_CONNECTION_TIMEOUT})
        .then((device) => {
          dispatch(changeStatus(constants.STATUS_DISCOVERING));
          let allCharacteristics =
            device.discoverAllServicesAndCharacteristics();
          dispatch(connectedDevice(device));
          return allCharacteristics;
        })
        .then((device) => {
          let services = device.services(device.id);
          return services;
        })
        .then(
          (services) => {
            if (checkServicesValid(services)) {
              dispatch(changeServicesStatus(constants.SERVICES_STATUS_SUCCESS));
              DeviceManager.characteristicsForDevice(
                device.id,
                services[
                  Platform.OS === 'android'
                    ? constants.ANDROID_SERVICE_INDEX_1
                    : constants.IOS_SERVICE_INDEX_1
                ].uuid,
              ).then((res) => {
                dispatch(connectedService1Characteristics(res));
              });

              DeviceManager.characteristicsForDevice(
                device.id,
                services[
                  Platform.OS === 'android'
                    ? constants.ANDROID_SERVICE_INDEX_2
                    : constants.IOS_SERVICE_INDEX_2
                ].uuid,
              ).then((res) => {
                dispatch(connectedService2Characteristics(res));
              });
            } else {
              dispatch(changeServicesStatus(constants.SERVICES_STATUS_ERROR));
            }

            dispatch(connectedDeviceServices(services));
            dispatch(changeStatus(constants.STATUS_CONNECTED));
            dispatch(onDisconnect(device));
          },
          (error) => {
            resetDevice(dispatch);
            dispatch(startScan());
          },
        );
    }
  };
};
const checkServicesValid = (services) => {
  if (
    services[
      Platform.OS === 'android'
        ? constants.ANDROID_SERVICE_INDEX_1
        : constants.IOS_SERVICE_INDEX_1
    ] &&
    services[
      Platform.OS === 'android'
        ? constants.ANDROID_SERVICE_INDEX_1
        : constants.IOS_SERVICE_INDEX_1
    ].uuid === constants.SERVICE_UUID_1 &&
    services[
      Platform.OS === 'android'
        ? constants.ANDROID_SERVICE_INDEX_2
        : constants.IOS_SERVICE_INDEX_2
    ] &&
    services[
      Platform.OS === 'android'
        ? constants.ANDROID_SERVICE_INDEX_2
        : constants.IOS_SERVICE_INDEX_2
    ].uuid === constants.SERVICE_UUID_2
  ) {
    return true;
  }
  return false;
};
export const stopScan = async (DeviceManager) => {
  await DeviceManager.stopDeviceScan();
};
export const resetDevice = () => {
  return (dispatch, getState, DeviceManager) => {
    dispatch(toggleIsParamsLoading(true));
    dispatch(connectedDevice(null));
    dispatch(connectedDeviceServices([]));
  };
};
export const disconnectDevice = (device) => {
  return (dispatch, getState, DeviceManager) => {
    if (device) {
      DeviceManager.cancelDeviceConnection(device.id).then(
        () => {},
        (error) => {
          console.log('disconnectDevice', error);
        },
      );
    }
  };
};
