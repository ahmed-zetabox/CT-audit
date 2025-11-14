import * as actionTypes from './actionTypes';
import * as constants from '../../config/constants';
import * as actionCreators from './index';
import {resetDevice, startScan} from './index';
import {instantCode} from '../actions/maintenanceAction';
import {instantCodeSup} from '../actions/supervisorAction';
import {instantCodeColdway} from '../actions/coldwayAction';
import moment from 'moment';
import {saveDfSettings} from '../../components/File_functions';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {NativeModules, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PermissionFile = NativeModules.PermissionFile;

const appInit = (data) => {
  return {
    type: actionTypes.APP_INIT,
    payload: data,
  };
};

export function setTempUniti(param) {
  return {
    type: actionTypes.TEMPUNITI,
    unite: param,
  };
}
export function setIhmVersion(param) {
  return {
    type: actionTypes.IHM_VERSION,
    payload: param,
  };
}
export function setMcuVersion(param) {
  return {
    type: actionTypes.MCU_Version,
    payload: param,
  };
}
export function setEsp32Version(param) {
  return {
    type: actionTypes.ESP32_VERSION,
    payload: param,
  };
}
export function setSerialKeyVersion(param) {
  return {
    type: actionTypes.SERIAL_VERSION,
    payload: param,
  };
}
export function setGlobalTempUniti(param) {
  return {
    type: actionTypes.GLOBALTEMPUNITI,
    GlobalSettingsUnite: param,
  };
}

export const changeBluetoothStatus = (data) => {
  return {
    type: actionTypes.BLUETOOTH_PERMISSION_STATUS,
    payload: data,
  };
};

export const changeLocationStatus = (data) => {
  return {
    type: actionTypes.LOCATION_PERMISSION_STATUS,
    payload: data,
  };
};

export const changeScreenOrientation = (data) => {
  return {
    type: actionTypes.CHANGE_SCREEN_ORIENTATION,
    payload: data,
  };
};

export const toggleScanModalVisible = (data) => {
  return {
    type: actionTypes.IS_SCAN_MODAL_VISIBLE,
    payload: data,
  };
};
export const toggleDiagMode = (data) => {
  return {
    type: actionTypes.TOGGLE_DIAG_MODE,
    payload: data,
  };
};
export const changeSystemStatus = (data) => {
  return {
    type: actionTypes.CHANGE_SYSTEM_STATUS,
    payload: data,
  };
};

export function toggleIsParamsEdited(data) {
  return {
    type: actionTypes.TOGGLE_IS_PARAMS_EDITED,
    payload: data,
  };
}
export function toggleIsParamsProgrammingEdited(data) {
  return {
    type: actionTypes.TOGGLE_IS_PARAMS_PROGRAMMING_EDITED,
    payload: data,
  };
}
export function toggleIsParamsSimpleSettingsEdited(data) {
  return {
    type: actionTypes.TOGGLE_IS_PARAMS_SIMPLE_SETTINGS_EDITED,
    payload: data,
  };
}
export function resetIsParamsEdited() {
  return {
    type: actionTypes.TOGGLE_IS_PARAMS_EDITED,
    payload: {
      status: constants.CLDW_PARAMS_STATUS_Clear,
      path: null,
    },
  };
}
export function resetIsParamsProgrammingEdited() {
  return {
    type: actionTypes.TOGGLE_IS_PARAMS_PROGRAMMING_EDITED,
    payload: {
      status: constants.CLDW_PARAMS_STATUS_Clear,
      path: null,
    },
  };
}
export function resetIsParamsSimpleSettingsEdited() {
  return {
    type: actionTypes.TOGGLE_IS_PARAMS_SIMPLE_SETTINGS_EDITED,
    payload: {
      status: constants.CLDW_PARAMS_STATUS_Clear,
      path: null,
    },
  };
}
export function toggleIsParamsLoading(data) {
  return {
    type: actionTypes.TOGGLE_IS_PARAMS_LOADING,
    payload: data,
  };
}

const _CheckManageAllFilesPermission = (dispatch) => {
  console.log('testTag _CheckManageAllFilesPermission');

  return PermissionFile.checkAndGrantPermission(
    (err) => {
      console.log(
        'testTag manage all files not granted error ' + err.toString(),
      );
      return false;
    },
    (res) => {
      initApp(dispatch, true);
    },
  );
};

const _CheckPermissionStorage = async () => {
  const permissionStorage = await check(
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  );
  if (!permissionStorage) {
    const granted = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    return granted === RESULTS.GRANTED;
  }
  return true;
};

const _getUnitTemp = async () => {
  return await AsyncStorage.getItem('unitTempSettings');
};

export const initilize = () => {
  return async (dispatch) => {
    console.log('initialize ' + Platform.Version);
    if (Platform.OS === constants.PLATFORM_ANDROID) {
      if (Platform.Version >= 30) {
        _CheckManageAllFilesPermission(dispatch);
      } else {
        await _CheckPermissionStorage().then((PermissionStorage) => {
          initApp(dispatch, PermissionStorage);
        });
      }
    } else {
      // For iOS platform
      await initApp(dispatch, true);
    }
  };
};

export const initApp = async (dispatch, permissionStorage) => {
  let permission = true;
  if (Platform.OS === constants.PLATFORM_ANDROID) {
    // Check bluetooth and location permissions for Android only
    permission = await checkAllPermissions();
  }
  const unit = await _getUnitTemp();
  dispatch(actionCreators.fetchStorageMaint());
  dispatch(actionCreators.setTempUniti(unit === 1 ? '°F' : '°C'));
  dispatch(actionCreators.fetchStorageSup());
  dispatch(actionCreators.fetchStorageColdway());
  dispatch(changeLocationStatus(permission));
  dispatch(toggleBluetooth(true));
  if (permissionStorage) {
    saveDfSettings(dispatch);
  }
  if (permission) {
    dispatch(actionCreators.startScan());
  }
  dispatch(appInit(true));
};

export const toggleBluetooth = (status) => {
  return (dispatch, getState, DeviceManager) => {
    if (status) {
      DeviceManager.enable();
      dispatch(startScan());
    } else {
      DeviceManager.disable();
      dispatch(resetDevice());
      dispatch(actionCreators.changeStatus(constants.STATUS_DISCONNECTED));
    }
  };
};
export const toggleLocation = () => {
  return async (dispatch, getState, DeviceManager) => {
    const permission = await checkAllPermissions();
    dispatch(changeLocationStatus(permission));
    if (permission) {
      dispatch(startScan());
    }
  };
};

export const checkAllPermissions = async () => {
  console.log('checkAllPermissions');
  let accessFineLocationPermission = await check(
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  );
  let accessCoarseLocationPermission = await check(
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
  );

  if (
    accessFineLocationPermission !== RESULTS.GRANTED &&
    accessCoarseLocationPermission !== RESULTS.GRANTED
  ) {
    accessFineLocationPermission = await request(
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );
    if (accessFineLocationPermission !== RESULTS.GRANTED) {
      accessCoarseLocationPermission = await request(
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      );
      if (accessCoarseLocationPermission !== RESULTS.GRANTED) {
        return false;
      } else {
        if (Platform.Version >= 31) {
          return checkAndRequestBleAndWritePermissions();
        } else {
          return checkAndRequestReadWritePermissions();
        }
      }
    } else {
      if (Platform.Version >= 31) {
        return checkAndRequestBleAndWritePermissions();
      } else {
        return checkAndRequestReadWritePermissions();
      }
    }
  } else {
    if (Platform.Version > 31) {
      return checkAndRequestBleAndWritePermissions();
    } else {
      return checkAndRequestReadWritePermissions();
    }
  }
};

export const checkAndRequestBleAndWritePermissions = async () => {
  console.log('checkAndRequestBleAndWritePermissions');
  let bluetoothScanPermission = await check(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
  if (bluetoothScanPermission !== RESULTS.GRANTED) {
    bluetoothScanPermission = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
    if (bluetoothScanPermission !== RESULTS.GRANTED) {
      return false;
    } else {
      return checkAndRequestBluetoothConnectAndWritePermissions();
    }
  } else {
    return checkAndRequestBluetoothConnectAndWritePermissions();
  }
};

export const checkAndRequestBluetoothConnectAndWritePermissions = async () => {
  console.log('checkAndRequestBluetoothConnectAndWritePermissions');

  let bluetoothConnectPermission = await check(
    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  );
  if (bluetoothConnectPermission !== RESULTS.GRANTED) {
    bluetoothConnectPermission = await request(
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    );
    if (bluetoothConnectPermission === RESULTS.GRANTED) {
      return checkAndRequestReadWritePermissions();
    } else {
      return false;
    }
  } else {
    return checkAndRequestReadWritePermissions();
  }
};

export const checkAndRequestReadWritePermissions = async () => {
  console.log('checkAndRequestReadWritePermissions');

  let writePermission = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
  if (writePermission !== RESULTS.GRANTED) {
    writePermission = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    if (writePermission === RESULTS.GRANTED) {
      return checkAndRequestReadPermission();
    } else {
      return false;
    }
  } else {
    return checkAndRequestReadPermission();
  }
};

export const checkAndRequestReadPermission = async () => {
  console.log('checkAndRequestReadPermission');
  let readPermission = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
  if (readPermission !== RESULTS.GRANTED) {
    console.log('checkAndRequestReadPermission requesting ...');
    readPermission = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    return readPermission === RESULTS.GRANTED;
  } else {
    return true;
  }
};

/**maintenance code managing */
const _getDataMaint = async () => {
  const storageVal = await AsyncStorage.getItem('codeMaintenanceDate');
  if (storageVal === 'permanant') {
    return true;
  } else {
    if (storageVal && new Date(JSON.parse(storageVal)) > moment()) {
      return true;
    } else {
      return false;
    }
  }
};

export const fetchStorageMaint = () => {
  return async (dispatch) => {
    const maintLogged = await _getDataMaint();
    dispatch(instantCode(maintLogged));
  };
};

/**supervisor code managing */
const _getDataSup = async () => {
  const storageVal = await AsyncStorage.getItem('codeSupervisorDate');
  if (storageVal === 'permanant') {
    return true;
  } else {
    if (storageVal && new Date(JSON.parse(storageVal)) > moment()) {
      return true;
    } else {
      return false;
    }
  }
};

export const fetchStorageSup = () => {
  return async (dispatch) => {
    const supLogged = await _getDataSup();
    dispatch(instantCodeSup(supLogged));
  };
};

/**coldway code managing */
const _getDataColdway = async () => {
  const storageVal = await AsyncStorage.getItem('codeColdwayDate');
  if (storageVal === 'permanant') {
    return true;
  } else {
    if (storageVal && new Date(JSON.parse(storageVal)) > moment()) {
      return true;
    } else {
      return false;
    }
  }
};

export const fetchStorageColdway = () => {
  return async (dispatch) => {
    const ColdwayLogged = await _getDataColdway();
    dispatch(instantCodeColdway(ColdwayLogged));
  };
};
