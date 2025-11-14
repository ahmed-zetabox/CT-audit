import {
  COLDWAY_MODAL,
  COLDWAY_PARAMETRE,
  COLDWAY_ISLOADING,
} from './actionTypes';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function coldwayIsLoding(bool) {
  return {
    type: COLDWAY_ISLOADING,
    coldwayIsLoding: bool,
  };
}

export function instantCodeColdway(bool) {
  return {
    type: COLDWAY_MODAL,
    ColdwayModal: bool,
  };
}

export function setDataParamtr(data) {
  return {
    type: COLDWAY_PARAMETRE,
    parametreColdway: data,
  };
}

const savePermanant = async (data) => {
  try {
    await AsyncStorage.setItem('codeColdwayDate', data);
  } catch (error) {
    // Error saving data
  }
};

export function showColdwayModal(bool, type) {
  return async (dispatch) => {
    if (type === 'instant') {
      await savePermanant(JSON.stringify(moment().add(5, 'days')));
    } else {
      await savePermanant('permanant');
    }
    dispatch(instantCodeColdway(bool));
  };
}
