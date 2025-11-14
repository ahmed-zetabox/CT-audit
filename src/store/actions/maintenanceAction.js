import {
  MAINTENANCE_MODAL,
  TENSION_SETTING,
  TEMP_SETTING,
  GLOBAL_SETTING,
  DEFAULT_SETTING,
  MAINTENANCE_STATE,
  INFO_NOTIF_STATE,
  IBAT_NOTIF_STATE,
  BAT_NOTIF_STATE,
} from './actionTypes';
import moment from 'moment';
import {
  decoder,
  filterCharacteristics,
} from '../../components/Common_functions';
import * as actionCreators from './index';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function SetDefaultSetting(data) {
  return {
    type: DEFAULT_SETTING,
    defaultSetting: data,
  };
}

export function SetTensionSetting(data) {
  return {
    type: TENSION_SETTING,
    tensionSetting: data,
  };
}

export function SetTempSetting(data) {
  return {
    type: TEMP_SETTING,
    tempSetting: data,
  };
}

export function instantCode(bool) {
  return {
    type: MAINTENANCE_MODAL,
    MaintModal: bool,
  };
}
export function MaintenanceNotifyState(bool) {
  return {
    type: MAINTENANCE_STATE,
    Maintenance_Notify: bool,
  };
}
export function BatNotifyState(bool) {
  return {
    type: BAT_NOTIF_STATE,
    BatNotif: bool,
  };
}
export function InfoNotifyState(bool) {
  return {
    type: INFO_NOTIF_STATE,
    IfnoNotif: bool,
  };
}

export function IbatNotifyState(bool) {
  return {
    type: IBAT_NOTIF_STATE,
    IbatNotif: bool,
  };
}
export function SetGlobalSetting(data) {
  return {
    type: GLOBAL_SETTING,
    globalSetting: data,
  };
}

const savePermanant = async (data) => {
  try {
    await AsyncStorage.setItem('codeMaintenanceDate', data);
  } catch (error) {
    // Error saving data
  }
};

export function showMaintModal(bool, type) {
  return async (dispatch) => {
    if (type === 'instant') {
      await savePermanant(JSON.stringify(moment().add(5, 'days')));
    } else {
      await savePermanant('permanant');
    }
    dispatch(instantCode(bool));
  };
}

export const readIHM = () => {
  return (dispatch, getState, DeviceManager) => {
    filterCharacteristics(
      getState().bleReducer.connectedService1Characteristics,
      '7000',
    )
      .read()
      .then((result) => {
        const hexResult = decoder(result.value, 'hex');
        const hexArray = decoder(hexResult, 'hexToArray');
        const majorVersion = decoder(hexArray[0], 'hexToDecimal');
        const minorVersion = decoder(hexArray[1], 'hexToDecimal');
        dispatch(
          actionCreators.setIhmVersion(
            majorVersion +
              '.' +
              (minorVersion < 10 ? '0' + minorVersion : minorVersion),
          ),
        );
      });
  };
};
export const readMCU = () => {
  return (dispatch, getState, DeviceManager) => {
    filterCharacteristics(
      getState().bleReducer.connectedService1Characteristics,
      '7001',
    )
      .read()
      .then((result) => {
        const hexResult = decoder(result.value, 'hex');
        const hexArray = decoder(hexResult, 'hexToArray');
        const majorVersion = decoder(hexArray[0], 'hexToDecimal');
        const minorVersion = decoder(hexArray[1], 'hexToDecimal');
        dispatch(
          actionCreators.setMcuVersion(
            majorVersion +
              '.' +
              (minorVersion < 10 ? '0' + minorVersion : minorVersion),
          ),
        );
      });
  };
};
export const readESP32 = () => {
  return (dispatch, getState, DeviceManager) => {
    filterCharacteristics(
      getState().bleReducer.connectedService1Characteristics,
      '7002',
    )
      .read()
      .then((result) => {
        const hexResult = decoder(result.value, 'hex');
        const hexArray = decoder(hexResult, 'hexToArray');
        const majorVersion = decoder(hexArray[0], 'hexToDecimal');
        const minorVersion = decoder(hexArray[1], 'hexToDecimal');
        dispatch(
          actionCreators.setEsp32Version(
            majorVersion +
              '.' +
              (minorVersion < 10 ? '0' + minorVersion : minorVersion),
          ),
        );
      });
  };
};
export const readSERIAL = () => {
  return (dispatch, getState, DeviceManager) => {
    filterCharacteristics(
      getState().bleReducer.connectedService1Characteristics,
      '7003',
    )
      .read()
      .then((result) => {
        dispatch(
          actionCreators.setSerialKeyVersion(decoder(result.value, '32LE')),
        );
      });
  };
};
