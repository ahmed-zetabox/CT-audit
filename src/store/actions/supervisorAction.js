import {SUPERVISOR_MODAL, unite, SUPERVISOR_DATE_DETVICE} from './actionTypes';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function instantCodeSup(bool) {
  return {
    type: SUPERVISOR_MODAL,
    SupModal: bool,
  };
}

export function GetDate(date) {
  return {
    type: SUPERVISOR_DATE_DETVICE,
    date: date,
  };
}

export function setUnite(param) {
  return {
    type: unite,
    unite: param,
  };
}
const savePermanant = async (date) => {
  try {
    await AsyncStorage.setItem('codeSupervisorDate', date);
  } catch (error) {
    // Error saving data
  }
};

export function showSupModal(bool, type) {
  return async (dispatch) => {
    if (type === 'instant') {
      await savePermanant(JSON.stringify(moment().add(5, 'days')));
    } else {
      await savePermanant('permanant');
    }
    dispatch(instantCodeSup(bool));
  };
}
