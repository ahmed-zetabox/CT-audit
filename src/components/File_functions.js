import RNFetchBlob from 'rn-fetch-blob';
import moment from 'moment';
import {NativeModules, Platform} from 'react-native';
import {SetDefaultSetting} from '../store/actions/maintenanceAction';
import * as constants from '../config/constants';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {CSV_STATIC_LINES, extractCycleTime} from './Common_functions';

let systemLanguage;
if (Platform.OS === constants.PLATFORM_ANDROID) {
  systemLanguage = NativeModules.I18nManager.localeIdentifier;
} else {
  systemLanguage = NativeModules.SettingsManager.settings.AppleLocale;
}
const languageCode = systemLanguage.substring(0, 2);

//Main FN of save & create Folders and files
export const SaveFile = async (params, path, fileName, resulType) => {
  try {
    const rootPath =
      Platform.OS === constants.PLATFORM_ANDROID
        ? RNFetchBlob.fs.dirs.DownloadDir
        : RNFetchBlob.fs.dirs.DocumentDir;
    if (Platform.OS === constants.PLATFORM_ANDROID) {
      const granted = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      if (granted === RESULTS.GRANTED) {
        const PATH_TO_CREATE = `${rootPath}/ColdTrace/${path}/${moment(
          new Date(),
        ).format('DD-MM-YYYY')}`;
        RNFetchBlob.fs.isDir(PATH_TO_CREATE).then((isDir) => {
          if (isDir) {
            writeFile(PATH_TO_CREATE, fileName, params, resulType);
          } else {
            createFolder(PATH_TO_CREATE);
            writeFile(PATH_TO_CREATE, fileName, params, resulType);
          }
        });
      }
    } else {
      const PATH_TO_CREATE = `${rootPath}/ColdTrace/${path}/${moment(
        new Date(),
      ).format('DD-MM-YYYY')}`;
      RNFetchBlob.fs.isDir(PATH_TO_CREATE).then((isDir) => {
        if (isDir) {
          writeFile(PATH_TO_CREATE, fileName, params, resulType);
        } else {
          createFolder(PATH_TO_CREATE);
          writeFile(PATH_TO_CREATE, fileName, params, resulType);
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};

export const SaveDefaultSettingFile = async (params, fileName) => {
  try {
    const rootPath =
      Platform.OS === constants.PLATFORM_ANDROID
        ? RNFetchBlob.fs.dirs.DownloadDir
        : RNFetchBlob.fs.dirs.DocumentDir;
    //save default settings file from app to phone in DocumentDir folder of android/ios
    const PATH_TO_CREATE = `${rootPath}/ColdTrace/Config/Default_Setting`;
    const pathToWrite = PATH_TO_CREATE + `/${fileName}`;
    RNFetchBlob.fs
      .writeFile(pathToWrite, params, 'utf8')
      .then(() => {
        RNFetchBlob.android.addCompleteDownload({
          title: fileName,
          description: 'Download complete',
          mime: 'application/txt',
          path: pathToWrite,
          showNotification: true,
        });
      })
      .catch((error) => console.log('error ss', error));
  } catch (e) {
    console.log('errrr', e);
  }
};

//read File from phone and return data in text format
export const readFile = async (pathToRead) => {
  return await RNFetchBlob.fs.readFile(pathToRead, 'utf8');
};
//create new folder if not existe
export const createFolder = async (fileName) => {
  const rootPath =
    Platform.OS === constants.PLATFORM_ANDROID
      ? RNFetchBlob.fs.dirs.DownloadDir
      : RNFetchBlob.fs.dirs.DocumentDir;
  const PATH_FOLDER = `${rootPath}/ColdTrace/${fileName}`;
  RNFetchBlob.fs.exists(PATH_FOLDER).then((exist) => {
    if (!exist) {
      RNFetchBlob.fs
        .mkdir(PATH_FOLDER)
        .then(() => {})
        .catch((error) => {
          console.log('error', error);
        });
    }
  });
};

//convert any object of data to csv format separated by ";"
export const JSONToCSVConvertor = (objArray) => {
  var array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  var str = '';
  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index in array[i]) {
      if (line != '') {
        line += languageCode == 'fr' ? ';' : ',';
      }
      line += array[i][index];
    }
    str += line + ',' + '\r\n';
  }
  return str;
};

export const csvJSON = (csv, numberOfProps) => {
  const lines = csv.split('\n');

  const result = [];

  const headers = [
    'cycleDateTime',
    'TUbat',
    'niveauUBAT',
    'niveauNH3',
    'tempTair',
    'tempAmb',
    'tempEvap',
    'tempReact',
    'codeAlarm',
    'descriptionAlarm',
    'workingState',
    'doorStatus',
    'fullTimestamp',
    'memoryIndex',
    'recordsNum',
    'cycleTimestamp',
    'indexDemand',
    'cycleTime',
  ];
  //Start reading index = (static lines) + properties number
  const startIndex = CSV_STATIC_LINES + numberOfProps;
  for (let i = startIndex; i < lines.length - 1; i++) {
    const obj = {};
    const currentLine = lines[i].split(languageCode === 'fr' ? ';' : ',');
    for (let j = 0; j < headers.length - 1; j++) {
      obj[headers[j]] = currentLine[j];
    }
    // Extract cycleTime (needed for chart loading)
    obj[headers[headers.length - 1]] = extractCycleTime(obj.fullTimestamp);
    result.push(obj);
  }
  return result;
};

export const extractOldHeadersFromCsv = (csv, numberOfProps) => {
  const lines = csv.split('\n');
  const result = [];
  //Start reading index = (static lines) + properties number
  const endIndex = CSV_STATIC_LINES + numberOfProps;
  for (let i = 0; i < endIndex - 1; i++) {
    const obj = {};
    const currentLine = lines[i].split(languageCode === 'fr' ? ';' : ',');
    for (let j = 0; j < 2; j++) {
      obj[j] = currentLine[j];
    }
    result.push(obj);
  }
  return result;
};

//save any type file from app to phone
export const writeFile = (path, fileName, base64File, resulType) => {
  const pathToWrite = path + `/${fileName}`;
  RNFetchBlob.fs
    .writeFile(pathToWrite, base64File, resulType)
    .then((result) => {
      if (Platform.OS === constants.PLATFORM_ANDROID) {
        if (resulType == 'base64') {
          RNFetchBlob.android.addCompleteDownload({
            title: fileName,
            description: 'Download complete',
            mime: 'image/png',
            path: pathToWrite,
            showNotification: true,
          });
        } else {
          RNFetchBlob.android.addCompleteDownload({
            title: fileName,
            description: 'Download complete',
            mime: 'application/txt',
            path: pathToWrite,
            showNotification: true,
          });
        }
      }
    })
    .catch((error) => console.error(error));
};

export const writeFileCSV = async (
  path,
  fileName,
  values,
  forceRewrite,
  serialKeyNumber,
  softVersion,
  cycleTypeLetter,
  dateInExcel,
  timeInExcel,
  coldWayStoredParams,
  connectedDeviceId,
  productionSetPoint,
  stopReason,
  oldHeaders,
) => {
  console.log('writeFileCSV stopReason ' + stopReason + ' ' + fileName);
  let csvString;
  if (oldHeaders.length === 0) {
    csvString = [
      ['Données infos générales du groupe:'],
      ['Désignation', 'Donnée'],
      ['Numéro Série', serialKeyNumber],
      ['Version software', softVersion],
      ['MAC address module ESP32', connectedDeviceId],
      ['MODE', cycleTypeLetter],
      ['Date de démarrage du cycle', dateInExcel],
      ['Heure de démarrage du cycle', timeInExcel],
      ['Consigne production', productionSetPoint],
      ['Données de paramètre:'],
      ['N° de tous les Paramètres', 'Valeurs de Tous les paramètres'],
      ...coldWayStoredParams.map((item) => [item.ref, item.value]),
      ['Données de fonctionnement:'],
      [
        'La date et l’heure du cycle',
        'TUBAT(V)',
        'Niveau UBAT(%)',
        'Niveau NH3(%)',
        'TCAISSE',
        'TAMB',
        'TEVAP',
        'TREACT',
        'Code alarme ou alerte',
        'Événement',
        'État fonctionnement',
        'Etat capteur porte',
        'R-Timestamp',
        'memory Index',
        'records Num',
        'Cycle timestamp',
        'indexDemand',
      ],
      ...values.map((item) => [
        item.cycleDateTime,
        item.TUbat,
        item.niveauUBAT,
        item.niveauNH3,
        item.tempTair,
        item.tempAmb,
        item.tempEvap,
        item.tempReact,
        item.codeAlarm,
        item.descriptionAlarm,
        item.workingState,
        item.doorStatus,
        item.fullTimestamp,
        item.memoryIndex,
        item.recordsNum,
        item.cycleTimestamp,
        item.indexDemand,
      ]),
      ["Fin: Cause de l'arrêt", stopReason],
    ];
  } else {
    console.log('writeFileCSV keeping old headers ');

    csvString = [
      ...oldHeaders.map((item) => [item[0], item[1]]),
      [
        'La date et l’heure du cycle',
        'TUBAT(V)',
        'Niveau UBAT(%)',
        'Niveau NH3(%)',
        'TCAISSE',
        'TAMB',
        'TEVAP',
        'TREACT',
        'Code alarme ou alerte',
        'Événement',
        'État fonctionnement',
        'Etat capteur porte',
        'R-Timestamp',
        'memory Index',
        'records Num',
        'Cycle timestamp',
        'indexDemand',
      ],
      ...values.map((item) => [
        item.cycleDateTime,
        item.TUbat,
        item.niveauUBAT,
        item.niveauNH3,
        item.tempTair,
        item.tempAmb,
        item.tempEvap,
        item.tempReact,
        item.codeAlarm,
        item.descriptionAlarm,
        item.workingState,
        item.doorStatus,
        item.fullTimestamp,
        item.memoryIndex,
        item.recordsNum,
        item.cycleTimestamp,
        item.indexDemand,
      ]),
      ["Fin: Cause de l'arrêt", stopReason],
    ];
  }

  csvString = csvString
    .map((e) => e.join(languageCode === 'fr' ? ';' : ','))
    .join('\n');

  const pathToWrite = path + `/${fileName}`;
  const exist = await RNFetchBlob.fs.exists(pathToWrite);
  if (!exist) {
    RNFetchBlob.fs
      .writeFile(pathToWrite, csvString, 'utf8')
      .then(() => {
        console.log('writeFileCSV done');
      })
      .catch((error) => {
        console.log('writeFileCSV error', error);
      });
  } else if (forceRewrite) {
    await RNFetchBlob.fs.unlink(pathToWrite).then(() => {
      console.log('writeFileCSV: unlink');
    });
    await RNFetchBlob.fs
      .writeFile(pathToWrite, csvString, 'utf8')
      .then(() => {
        console.log('writeFileCSV: file rewritten');
      })
      .catch((error) => {
        console.log('writeFileCSV: Error saving file', error);
      });
  }
};

export const writeListCycleFileCSV = async (
  path,
  fileName,
  values,
  forceRewirte,
) => {
  console.log('testTag writing ListCycleFileCSV');

  const csvString2 = [
    ['timestamp', 'type', 'memoryIndex', 'recordsNum'],
    ...values.map((item) => [
      item.timestamp,
      item.type,
      item.memoryIndex,
      item.recordsNum,
    ]),
  ]
    .map((e) => e.join(languageCode == 'fr' ? ';' : ','))
    .join('\n');
  const pathToWrite = path + `/${fileName}`;
  const exist = await RNFetchBlob.fs.exists(pathToWrite);
  if (!exist) {
    RNFetchBlob.fs
      .writeFile(pathToWrite, csvString2, 'utf8')
      .then(() => {})
      .catch((error) => {
        console.log(
          'testTag',
          'error writing ListCycleFileCSV ' + error.toString(),
        );
      });
  } else if (forceRewirte) {
    RNFetchBlob.fs.unlink(pathToWrite).then(() => {
      RNFetchBlob.fs
        .writeFile(pathToWrite, csvString2, 'utf8')
        .then(() => {})
        .catch((error) => {
          console.log(
            'testTag',
            'error rewriting ListCycleFileCSV ' + error.toString(),
          );
        });
    });
  }
};

const _getDefaultSettings = async (PATH_TO_READ) => {
  const json = await readFile(PATH_TO_READ)
    .then((DefaultSettings) => {
      var arrayLine = DefaultSettings.split('\n');
      var json = [];
      for (var i = 0; i < arrayLine.length; i++) {
        const arrayWord = arrayLine[i].split(';');
        json.push({
          ref: arrayWord[0],
          nomSetting: arrayWord[1],
          defaultValue: arrayWord[2],
          minValue: arrayWord[3],
          maxValue: arrayWord[4],
          précisionReglage: arrayWord[5],
          unite: arrayWord[6],
          comment: arrayWord[7],
        });
      }
      return json;
    })
    .catch((error) => console.log('error', error));
  return json;
};

export const saveDfSettings = (dispatch) => {
  console.log('saveDfSettings ');

  const rootPath =
    Platform.OS === constants.PLATFORM_ANDROID
      ? RNFetchBlob.fs.dirs.DownloadDir
      : RNFetchBlob.fs.dirs.DocumentDir;
  const PATH_TO_CREATE = `${rootPath}/ColdTrace/Config/Default_Setting/Default_parametres.txt`;
  const PATH_DFAULT_FILE = RNFetchBlob.fs.asset('Default_parametres.txt');
  RNFetchBlob.fs.exists(PATH_TO_CREATE).then((isDir) => {
    if (!isDir) {
      readFile(PATH_DFAULT_FILE).then((res) => {
        SaveDefaultSettingFile(res, 'Default_parametres.txt');
      });
      _getDefaultSettings(PATH_DFAULT_FILE).then((json) =>
        dispatch(SetDefaultSetting(json)),
      );
    } else {
      _getDefaultSettings(PATH_TO_CREATE).then((json) =>
        dispatch(SetDefaultSetting(json)),
      );
    }
  });
};

//Main FN of save & create Folders and files
export const SaveFileText = async (data) => {
  try {
    const rootPath =
      Platform.OS === constants.PLATFORM_ANDROID
        ? RNFetchBlob.fs.dirs.DownloadDir
        : RNFetchBlob.fs.dirs.DocumentDir;
    if (Platform.OS === constants.PLATFORM_ANDROID) {
      const granted = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      if (granted === RESULTS.GRANTED) {
        const PATH_TO_CREATE = `${rootPath}/ColdTrace/Log`;
        RNFetchBlob.fs.isDir(PATH_TO_CREATE).then((isDir) => {
          if (isDir) {
            const pathToWrite = PATH_TO_CREATE + '/log.txt';
            RNFetchBlob.fs.appendFile(pathToWrite, data);
          } else {
            RNFetchBlob.fs
              .mkdir(PATH_TO_CREATE)
              .then(() => {})
              .catch((error) => {
                console.log('error', error);
              });
            const pathToWrite = PATH_TO_CREATE + '/log.txt';
            RNFetchBlob.fs.appendFile(pathToWrite, data);
          }
        });
      }
    } else {
      const PATH_TO_CREATE = `${rootPath}/ColdTrace/Log`;
      RNFetchBlob.fs.isDir(PATH_TO_CREATE).then((isDir) => {
        if (isDir) {
          const pathToWrite = PATH_TO_CREATE + '/log.txt';
          RNFetchBlob.fs.appendFile(pathToWrite, data);
        } else {
          RNFetchBlob.fs
            .mkdir(PATH_TO_CREATE)
            .then(() => {})
            .catch((error) => {
              console.log('error', error);
            });
          const pathToWrite = PATH_TO_CREATE + '/log.txt';
          RNFetchBlob.fs.appendFile(pathToWrite, data);
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};
