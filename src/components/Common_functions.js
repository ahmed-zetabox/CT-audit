import {Buffer} from 'buffer';
import moment from 'moment';
import {setDataParamtr} from '../store/actions/coldwayAction';
import {toggleIsParamsLoading} from '../store/actions';

export const prefixUUID = '0000';
export const suffixUUID = '-0000-1000-8000-00805f9b34fb';
export const BLE_BUFFER_SIZE = 32;
export const MAX_PARAM_PER_REQUEST = '08';
export const FIRST_AVAILABLE_PARAM_INDEX = '00';
export const BLE_CONNECTION_TIMEOUT = 5000;
export const CSV_STATIC_LINES = 13;
var index = 8;

export const descAlerts = [
  {code: 8, title: 'alert_8'},
  {code: 9, title: 'alert_9'},
  {code: 10, title: 'alert_10'},
  {code: 11, title: 'alert_11'},
  {code: 12, title: 'alert_12'},
  {code: 13, title: 'Non Utilisé'},
  {code: 14, title: 'Non Utilisé'},
  {code: 15, title: 'Non Utilisé'},
  {code: 0, title: 'alert_0'},
  {code: 1, title: 'alert_1'},
  {code: 2, title: 'alert_2'},
  {code: 3, title: 'alert_3'},
  {code: 4, title: 'alert_4'},
  {code: 5, title: 'alert_5'},
  {code: 6, title: 'alert_6'},
  {code: 7, title: 'alert_7'},
];

const workingStates = [
  'Transitoire Production de chaud 100% de puissance',
  'Transitoire Production de Chaud PWM',
  'Transitoire Production de froid bridé',
  'Transitoire Production de froid débridé',
  'Consigne Atteinte',
  'En recharge',
  'En Chauffe Collier en marche',
  'En chauffe Collier à l’arret regulation',
  'En chauffe Collier à l’arret bridage T° thermostat',
  'En refroidissement',
  'Etat inconnu',
];

const stopReasons = [
  'Appui sur bouton stop',
  'Défaut sonde TAir',
  'Appui bouton Power',
  'Détection NH3 vide',
  'Batterie Vide',
  'Défaut Thermostat de sécurité',
  'Défaut sonde réacteur',
  'Appui sur bouton Stop',
  'Sorti sur fin de Timer',
];

// Cycle types
export const STOP_CODE_EVENT = 0;
export const TEMPERATURE_CYCLE = 1;
export const PRODUCTION_CYCLE_START = 2;
export const RECHARGE_CYCLE_START = 4;
export const ERROR_EVENT = 5;
export const AMBIENT_PRODUCTION_CYCLE_START = 7;
export const HOT_COLD_PRODUCTION_CYCLE_START = 8;

//convert from °C to °F
export const converter = (value, unite) => {
  if (unite === '°C') {
    return value;
  } else {
    return parseFloat((value * 9) / 5 + 32);
  }
};

export const initialIndex = () => {
  console.log('im in');
  index = 8;
};

//convert from °F to °C
export function toCelsius(fahrenheit) {
  let res = (fahrenheit - 32) * (5 / 9);
  return parseFloat(res);
}

// convert from °C to °F
export function toFahrenheit(celsius) {
  let res = (celsius * 9) / 5 + 32;
  return parseFloat(res);
}

//en faire le demande de récupération des paramètres du coldway
export function setIntervalForRead(characteristics2, interval) {
  filterCharacteristics(characteristics2, '7c01').writeWithResponse(interval);
}

//Incrémentation de l'intervale de lecture les paramètres
export function changeIntervalToRead(nbrPar, characteristics2) {
  console.log('changeIntervalToRead index', index);
  if (index <= nbrPar - 8) {
    var intervalParam;
    if (index < 10) {
      intervalParam = decoder('0' + index, 'decToHex');
    } else {
      intervalParam = decoder(index, 'decToHex');
    }
    setIntervalForRead(
      characteristics2,
      decoder('08' + intervalParam, 'hexToBase64'),
    );
    index += 8;
    // console.log('nbrPar', intervalParam);
  } else if (index > nbrPar - 8 && index < nbrPar) {
    let mod = nbrPar % 8;
    let indexDecode = decoder(index, 'decToHex');
    setIntervalForRead(
      characteristics2,
      decoder('0' + mod + indexDecode, 'hexToBase64'),
    );
    index += mod;
    // console.log(' mod', mod);
  }
}

//Enregistrer les paramètres dans un Array
export function saveParemetre(value, lengthColdwayParem) {
  let length = lengthColdwayParem;
  let array = [];
  if (value.substring(3, 4) == 8) {
    for (let index = 8; index < value.length; index += 4) {
      let ref;
      if (length + 1 < 10) {
        ref = 'P0' + (length + 1);
      } else {
        ref = 'P' + (length + 1);
      }
      array.push({
        ref: ref,
        value: decoder(value.substr(index, 4), 'hexTo16LE'),
      });
      length++;
    }
  } else {
    for (let index = 8; index < 8 + 4 * value.substring(3, 4); index += 4) {
      let ref = 'P' + (length + 1);
      array.push({
        ref: ref,
        value: decoder(value.substr(index, 4), 'hexTo16LE'),
      });
      length++;
    }
  }
  return array;
}

export function getValue(ref, value, defaultSettings) {
  let res = 0;
  defaultSettings &&
    defaultSettings.map((defaultSetting) => {
      if (ref === defaultSetting.ref) {
        if (defaultSetting.précisionReglage === 'Dixième') {
          res = (value / 10).toFixed(1);
        } else if (defaultSetting.précisionReglage === 'Centième') {
          res = (value / 100).toFixed(2);
        } else {
          res = value;
        }
      }
    });
  return res;
}

//voir le précision reglage de chaque parametre et convert data array selon sà (divisé par 10 ou 100)
export const ConvertAndSaveData = (data, defaultSettings) => {
  let array = [];
  data &&
    data.map((itemData) => {
      array.push({
        ref: itemData.ref,
        value: getValue(itemData.ref, itemData.value, defaultSettings),
      });
    });
  return array;
};

export function setValue(ref, value, defaultSettings) {
  let res;
  defaultSettings &&
    defaultSettings.map((defaultSetting) => {
      if (ref == defaultSetting.ref) {
        if (defaultSetting.précisionReglage == 'Dixième') {
          res = value * 10;
        } else if (defaultSetting.précisionReglage == 'Centième') {
          res = value * 100;
        } else {
          res = value;
        }
      }
    });
  if (res == undefined) {
    res = value;
  }
  return res;
}

export function filterCharacteristics(characteristics, uuid) {
  return characteristics.find((value) => {
    return value.uuid === prefixUUID + uuid + suffixUUID;
  });
}

export function UInt16(value) {
  return value & 0xffff;
}

export function signedvalue(value) {
  let dec = parseInt(value, 16);
  if ((dec & 0x8000) > 0) {
    dec = dec - 0x10000;
  }
  return dec;
}

export function Int16(value) {
  const ref = UInt16(value);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

export const writeCycleOffset = async (cycleNum, characteristics2) => {
  const buff = Buffer.allocUnsafe(1);
  buff.writeIntLE(cycleNum);
  const value = decoder('01' + buff.toString('hex'), 'hexToBase64');
  return await filterCharacteristics(
    characteristics2,
    '7801',
  ).writeWithResponse(value);
};

export const readSavedCycle = async (characteristics2) => {
  const result = await filterCharacteristics(characteristics2, '7802').read();
  const hexValue = decoder(result.value, 'hex');
  const resultArray = decoder(hexValue, 'hexToArray');

  const productionSetPoint = decoder(
    resultArray[10] + resultArray[11],
    'hexToDecimal16LE',
  );

  const unixTimestamp =
    resultArray[3] + resultArray[4] + resultArray[5] + resultArray[6];

  const recordsNumber = decoder(
    resultArray[8] + resultArray[9],
    'hexToDecimal16LE',
  );

  const serialKeyNumber = decoder(
    resultArray[16] + resultArray[17] + resultArray[18] + resultArray[19],
    'hexToDecimal32LE',
  );

  return [
    unixTimestamp,
    resultArray[2],
    recordsNumber,
    resultArray[7],
    productionSetPoint / 10,
    serialKeyNumber,
  ];
};

export function extractCycleTimestamps(hexArray) {
  // Extract the full timestamp
  const fullTimestamp = Buffer.from(
    '' + hexArray[0] + hexArray[1] + hexArray[2] + hexArray[3],
    'hex',
  ).readInt32LE();

  // Extract time
  const cycleTime = extractCycleTime(fullTimestamp);
  console.log('extractCycleTime ' + fullTimestamp + ' cycleTime ' + cycleTime);

  const cycleDateTime = extractDateTimeFormat(fullTimestamp);
  return {fullTimestamp, cycleTime, cycleDateTime};
}

// Extract Date in DD/MM/YYYY HH:mm format
export function extractDateTimeFormat(fullTimestamp) {
  const cycleDateSecondFormat = moment(extractGMTDate(fullTimestamp))
    .format('DD MM YYYY')
    .replace(/ /g, '/');
  return cycleDateSecondFormat + ' ' + extractCycleTime(fullTimestamp);
}

export function extractCycleTime(timestamp) {
  return moment(extractGMTDate(timestamp)).format('HH:mm');
}

export function extractGMTDate(timestamp) {
  const newDate = new Date(timestamp * 1000);
  newDate.setTime(newDate.getTime() + newDate.getTimezoneOffset() * 60 * 1000);
  return newDate;
}

export function extractRecordInfos(result, stopReason) {
  let updatedStopReason = stopReason;
  const hexValue = decoder(result.value, 'hex');
  const resultArray = decoder(hexValue, 'hexToArray');
  // Extract record index
  const recordIndex = Buffer.from(
    resultArray[18] + resultArray[19],
    'hex',
  ).readInt16LE();
  let recordType = parseInt(resultArray[4], 16);
  if (recordType === STOP_CODE_EVENT) {
    let stopCode = parseInt(resultArray[5], 16);
    if (stopCode >= 0 && stopCode <= 8) {
      updatedStopReason = stopReasons[stopCode];
    }
    console.log(
      'updatedStopReason ' + updatedStopReason + ' stopCode ' + stopCode,
    );
  }
  console.log(
    'extractRecordInfos ' +
      hexValue +
      ' recordType ' +
      recordType +
      ' recordIndex ' +
      recordIndex,
  );
  return {hexValue, resultArray, recordIndex, recordType, updatedStopReason};
}

export function extractAlarmsAndEvents(hexArray, t, doorStatus) {
  let codeAlarm = '';
  let descriptionAlarm = '';
  let doorStatusUpdated = doorStatus;
  const cycleType = Buffer(hexArray[4], 'hex').readIntLE();
  if (cycleType === ERROR_EVENT) {
    codeAlarm = Buffer.from(hexArray[5], 'hex').readIntLE();
    if (codeAlarm === 13 && Buffer(hexArray[6], 'hex').readIntLE() === 0) {
      descriptionAlarm = t('Door_open');
      doorStatusUpdated = 'open';
    } else if (
      codeAlarm === 13 &&
      Buffer(hexArray[6], 'hex').readIntLE() === 1
    ) {
      descriptionAlarm = t('Door_close');
      doorStatusUpdated = 'closed';
    } else {
      if (descAlerts.find((item) => item.code === codeAlarm)) {
        descriptionAlarm = t(
          descAlerts.find((item) => item.code === codeAlarm).title,
        );
      }
    }
  }
  return {codeAlarm, descriptionAlarm, doorStatusUpdated};
}

export function extractTempValues(hexArray, esp32Version) {
  const TUbat = Buffer.from(hexArray[5], 'hex').readIntLE() / 10;
  let niveauUBAT;
  if (parseFloat(esp32Version) <= 1.28) {
    niveauUBAT = Buffer.from(hexArray[6], 'hex').readIntLE();
  }
  const tempTair =
    Buffer.from(hexArray[8] + hexArray[9], 'hex').readInt16LE() / 10;
  const tempAmb =
    Buffer.from(hexArray[14] + hexArray[15], 'hex').readInt16LE() / 10;
  const tempEvap =
    Buffer.from(hexArray[12] + hexArray[13], 'hex').readInt16LE() / 10;
  const tempReact =
    Buffer.from(hexArray[10] + hexArray[11], 'hex').readInt16LE() / 10;
  const niveauNH3 = Buffer.from(hexArray[7], 'hex').readIntLE();
  return {TUbat, niveauUBAT, tempTair, tempAmb, tempEvap, tempReact, niveauNH3};
}

export function extractWorkingState(
  workingStateHex,
  recordTypeHex,
  esp32Version,
) {
  let workingState = '';
  const recordType = parseInt(recordTypeHex, 16);
  if (recordType === TEMPERATURE_CYCLE) {
    if (parseFloat(esp32Version) > 1.28) {
      const workingStateIndex = parseInt(workingStateHex, 16);
      if (workingStateIndex >= 0 && workingStateIndex <= 9) {
        workingState = workingStates[workingStateIndex];
      } else if (workingStateIndex === 255) {
        workingState = workingStates[10];
      }
    }
  }
  return workingState;
}

export function extractCycleTypeLetter(cycleTypeHex) {
  const cycleType = decoder(cycleTypeHex, 'hexToDecimal');
  let cycleTypeLetter = '';
  switch (cycleType) {
    case 2:
      cycleTypeLetter = 'F';
      break;
    case 4:
      cycleTypeLetter = 'R';
      break;
    case 7:
      cycleTypeLetter = 'A';
      break;
    case 8:
      cycleTypeLetter = 'M';
      break;
  }
  return cycleTypeLetter;
}

//Extract date in YYMMDD format from track folder
export function getFormattedFileDate(trackFolder) {
  //Get Date /storage/emulated/0/DCIM/ColdTrace/ROLL_STRIP_191056/DD-MM-YYYY -> 210609 YYYYMMDD
  const formattedDate = trackFolder.substring(
    trackFolder.lastIndexOf('/') + 1,
    trackFolder.length,
  );
  const fileDate = moment(moment(formattedDate, 'DD-MM-YYYY').toDate()).format(
    'YYYY MM DD',
  );
  //Transform date from YYYY MM DD to YYMMDD format
  return fileDate.replace(/ /g, '').substring(2, fileDate.length);
}

export function decoder(value, type) {
  switch (type) {
    case 'LE':
      return Buffer.from(value, 'base64').readIntLE();
    case 'hexTo16LE':
      return Buffer.from(value, 'hex').readInt16LE();
    case '16LE':
      return Buffer.from(value, 'base64').readInt16LE();
    case '32LE':
      return Buffer.from(value, 'base64').readInt32LE();
    case 'dec':
      return parseInt('0x' + Buffer.from(value, 'base64').toString('hex'));
    case 'hex':
      return Buffer.from(value, 'base64').toString('hex');
    case 'bin16':
      return parseInt(Buffer.from(value, 'base64').toString('hex'), 16)
        .toString(2)
        .padStart(16, '0')
        .split('');
    case 'bin':
      return parseInt(Buffer.from(value, 'base64').toString('hex'), 16)
        .toString(2)
        .padStart(8, '0')
        .split('');
    case 'binToHex':
      return parseInt(value, 2).toString(16).toUpperCase();
    case 'decToHex':
      return value.toString(16);
    case 'hexToBase64':
      return Buffer.from(value, 'hex').toString('base64');
    case 'bin2':
      return parseInt(Buffer.from(value, 'base64').toString('hex'), 16)
        .toString(2)
        .split('')
        .reverse();
    case 'decimalToHex':
      return value.toString(16).padStart(2, '0');
    case 'hexToDecimal':
      return parseInt(value, 16);
    case 'hexToArray':
      let array = [];
      for (let i = 0; i < value.length - 1; i += 2) {
        array.push(value[i] + '' + value[i + 1]);
      }
      return array;
    case 'hexToBin':
      return ('00000000' + parseInt(value, 16).toString(2)).substr(-8);
    case 'hexToDecimal16LE':
      return Buffer.from(value, 'hex').readInt16LE();
    case 'hexToDecimal32LE':
      return Buffer.from(value, 'hex').readInt32LE();
    default:
      return null;
  }
}

export function extractDateFromFile(fileName) {
  const firstSeparator = fileName.indexOf('-');
  return fileName.substring(
    fileName.indexOf('-') + 1,
    fileName.indexOf('-', firstSeparator + 1),
  );
}

export function extractTimeFromFile(fileName) {
  const firstSeparator = fileName.indexOf('-');
  return fileName.substring(
    fileName.indexOf('-', firstSeparator + 1) + 1,
    fileName.lastIndexOf('-'),
  );
}

// Convert from YYMMDD to YYYY MM DD
export function convertDateToFullFormat(fileDate) {
  const year = '20' + fileDate.substring(0, 2);
  const month = fileDate.substring(2, 4);
  const day = fileDate.substring(4, 6);
  return year + ' ' + month + ' ' + day;
}

// Convert from HHmm  to HH mm
export function convertTimeToFullFormat(fileTime) {
  const hour = fileTime.substring(0, 2);
  const minute = fileTime.substring(2, 4);
  return hour + ' ' + minute;
}

// Extract date in YYYY MM DD HH mm format
export function extractFormattedDateFromFileName(fileName) {
  // Get date
  const fileDate = extractDateFromFile(fileName);
  //convert date from YYMMDD to YYYY MM DD
  const formattedDate = convertDateToFullFormat(fileDate);
  // Get time
  const fileTime = extractTimeFromFile(fileName);
  //convert time from HHmm to HH mm
  const formattedTime = convertTimeToFullFormat(fileTime);

  return formattedDate + ' ' + formattedTime;
}

// Sort Files
export function sortFileNamesInAntiChronologicalOrder(folderList) {
  return folderList.sort((firstFileName, secondFileName) => {
    return (
      moment(
        extractFormattedDateFromFileName(secondFileName),
        'YYYY MM DD HH mm',
      ).toDate() -
      moment(
        extractFormattedDateFromFileName(firstFileName),
        'YYYY MM DD HH mm',
      ).toDate()
    );
  });
}

// Read ColdWay parameters list and save them into redux store
export const readParametersList = (
  characteristics2,
  dispatch,
  defaultSettings,
) => {
  initialIndex();
  let coldWayParams = [];
  let parametersNumber;
  // Get the total number of lecture ColdWay params
  filterCharacteristics(characteristics2, '7c00')
    .read()
    .then(({value}) => {
      parametersNumber = decoder(value, 'dec');
    });

  // Listen to changes of ColdWay params
  const value = filterCharacteristics(characteristics2, '7c02');
  const notify = value.monitor((error, result) => {
    if (error) {
      console.log('0x7c02 notify error', error);
    } else {
      coldWayParams = coldWayParams.concat(
        saveParemetre(decoder(result.value, 'hex'), coldWayParams.length),
      );
      console.log('MainScreen params received ', coldWayParams.length);
      console.log('readParametersList ' + parametersNumber);

      changeIntervalToRead(parametersNumber, characteristics2);
      if (coldWayParams.length === parametersNumber) {
        console.log('params loaded ');
        dispatch(
          setDataParamtr(ConvertAndSaveData(coldWayParams, defaultSettings)),
        );
        notify.remove();
        coldWayParams = [];
        dispatch(toggleIsParamsLoading(false));
      }
    }
  });
  setIntervalForRead(
    characteristics2,
    decoder(MAX_PARAM_PER_REQUEST + FIRST_AVAILABLE_PARAM_INDEX, 'hexToBase64'),
  );
  return notify;
};
