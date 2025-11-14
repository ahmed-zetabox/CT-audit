import {
  HOME_SETTING,
  HOME_ALARM,
  DEVICE_INFO,
  TEMP_INTER,
  TEMP_AMBIANT,
  TEMP_EVAPORATEUR,
  TEMP_REACTEUR,
} from './actionTypes';

export function SetAlarm(data) {
  return {
    type: HOME_ALARM,
    homeAlarm: data,
  };
}

export function SetHomeSetting(data) {
  return {
    type: HOME_SETTING,
    homeSting: data,
  };
}

export function SetTempReacteur(data) {
  return {
    type: TEMP_REACTEUR,
    tempReacteur: data,
  };
}

export function SetTempEvaporateur(data) {
  return {
    type: TEMP_EVAPORATEUR,
    tempEvaporateur: data,
  };
}

export function SetTempAmbiant(data) {
  return {
    type: TEMP_AMBIANT,
    tempAmbiant: data,
  };
}

export function SetTempInter(data) {
  return {
    type: TEMP_INTER,
    tempInter: data,
  };
}
