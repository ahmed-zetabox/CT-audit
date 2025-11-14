import * as actionTypes from './actionTypes';
import moment from 'moment';
import {
  AMBIENT_PRODUCTION_CYCLE_START,
  BLE_BUFFER_SIZE,
  decoder,
  extractAlarmsAndEvents,
  extractCycleTimestamps,
  extractCycleTypeLetter,
  extractGMTDate,
  extractRecordInfos,
  extractTempValues,
  extractWorkingState,
  filterCharacteristics,
  getFormattedFileDate,
  HOT_COLD_PRODUCTION_CYCLE_START,
  PRODUCTION_CYCLE_START,
  readSavedCycle,
  RECHARGE_CYCLE_START,
  STOP_CODE_EVENT,
  writeCycleOffset,
} from '../../components/Common_functions';
import {Buffer} from 'buffer';
import {
  createFolder,
  csvJSON,
  extractOldHeadersFromCsv,
  readFile,
  writeFileCSV,
} from '../../components/File_functions';
import * as constants from '../../config/constants';
import * as actionCreators from './index';
import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';

export const addProduction = (data) => {
  return {
    type: actionTypes.ADD_PRODUCTION,
    payload: data,
  };
};
export const addRecharge = (data) => {
  return {
    type: actionTypes.ADD_RECHARGE,
    payload: data,
  };
};
export const addCycle = (data) => {
  return {
    type: actionTypes.ADD_CYCLE,
    payload: data,
  };
};
export const resetCycle = (data) => {
  return {
    type: actionTypes.RESET_CYCLE,
    payload: data,
  };
};
export const addCreatedFile = (data) => {
  return {
    type: actionTypes.ADD_CREATED_FILE,
    payload: data,
  };
};
export const toggleIsFolderLoading = (data) => {
  return {
    type: actionTypes.TOGGLE_IS_FOLDER_LOADING,
    payload: data,
  };
};
export const toggleIsFileLoading = (data) => {
  return {
    type: actionTypes.TOGGLE_IS_FILE_LOADING,
    payload: data,
  };
};
export const toggleChartLoading = (data) => {
  return {
    type: actionTypes.TOGGLE_IS_CHART_LOADING,
    payload: data,
  };
};
export const setSelectedDate = (data) => {
  return {
    type: actionTypes.SET_SELECTED_DATE,
    payload: data,
  };
};
export const setRecordsNum = (data) => {
  return {
    type: actionTypes.SET_RECORD_NUM,
    payload: data,
  };
};

export const setIndexRecord = (data) => {
  return {
    type: actionTypes.SET_INDEX_RECORD,
    payload: data,
  };
};

export const triggerListFolders = (data) => {
  return {
    type: actionTypes.TRIGGER_LIST_FOLDERS,
    payload: data,
  };
};

export const setSelectedFolder = (data) => {
  return {
    type: actionTypes.SET_SELECTED_FOLDER,
    payload: data,
  };
};

export const toggleIsDeviceLoading = (data) => {
  return {
    type: actionTypes.TOGGLE_IS_DEVICE_LOADING,
    payload: data,
  };
};

function saveCycle(
  trackFolder,
  fullFileName,
  currentChart,
  serialKeyNumber,
  softVersion,
  cycleTypeLetter,
  dateInExcel,
  timeInExcel,
  getState,
  productionSetPoint,
  updatedStopReason,
  dispatch,
  i,
  filteredCycleWithIndex,
  t,
  isTimeout,
  oldHeaders,
) {
  if (getState().bleReducer.connectedDevice != null) {
    // Save cycle into a file
    writeFileCSV(
      trackFolder,
      fullFileName,
      currentChart,
      true,
      serialKeyNumber,
      softVersion,
      cycleTypeLetter,
      dateInExcel,
      timeInExcel,
      getState().coldwayReducer.parametreColdway,
      getState().bleReducer.connectedDevice.id,
      productionSetPoint,
      updatedStopReason,
      oldHeaders,
    ).then(() => {
      if (!isTimeout) {
        // Download next cycle if it exists
        if (i < filteredCycleWithIndex.length - 1) {
          try {
            downloadCycle(
              filteredCycleWithIndex,
              i + 1,
              getState,
              trackFolder,
              dispatch,
              t,
            );
          } catch (e) {
            console.log('downloadCycle failed ' + e.message);
          }
        } else {
          dispatch(toggleIsFileLoading(false));
          dispatch(triggerListFolders(true));
          console.log('CSV file created');
        }
      } else {
        // ReDownload cycle if there is a timeout
        try {
          downloadCycle(
            filteredCycleWithIndex,
            i,
            getState,
            trackFolder,
            dispatch,
            t,
          );
        } catch (e) {
          console.log('downloadCycle failed ' + e.message);
        }
      }
    });
  }
}

function handleTimeOut(
  countDownTimerId,
  monitorCyclePromise,
  dispatch,
  trackFolder,
  fullFileName,
  currentChart,
  serialKeyNumber,
  softVersion,
  cycleTypeLetter,
  dateInExcel,
  timeInExcel,
  getState,
  productionSetPoint,
  updatedStopReason,
  i,
  filteredCycleWithIndex,
  t,
  oldHeaders,
) {
  // Remove old countdown if it exists
  if (countDownTimerId !== -1) {
    clearTimeout(countDownTimerId);
  }

  // Check for timeout
  return setTimeout(() => {
    console.log('testTag Download temperature timeout');
    monitorCyclePromise.remove();
    // Reset the folder state
    dispatch(actionCreators.setRecordsNum(0));
    dispatch(actionCreators.setIndexRecord(0));
    // Save current progress and proceed to next cycle if it exists
    saveCycle(
      trackFolder,
      fullFileName,
      currentChart,
      serialKeyNumber,
      softVersion,
      cycleTypeLetter,
      dateInExcel,
      timeInExcel,
      getState,
      productionSetPoint,
      updatedStopReason,
      dispatch,
      i,
      filteredCycleWithIndex,
      t,
      true,
      oldHeaders,
    );
  }, 5000);
}

// Temperature records notification event listener
function monitorCycle(
  getState,
  startFrom,
  t,
  currentChart,
  dispatch,
  trackFolder,
  timestamp,
  fullFileName,
  oldRecordIndex,
  cycleTypeHex,
  cycleTypeLetter,
  softVersion,
  dateInExcel,
  timeInExcel,
  productionSetPoint,
  serialKeyNumber,
  filteredCycleWithIndex,
  i,
  recordsNum,
  oldHeaders,
) {
  let doorStatus = '';
  let stopReason = '';
  let countDownTimerId = -1;
  let recordDownloaded = 0;
  // Monitor characteristics
  const monitorCyclePromise = filterCharacteristics(
    getState().bleReducer.connectedService2Characteristics,
    '7808',
  ).monitor((error, result) => {
    if (error) {
      console.log(
        'testTag HistoryAction 7808: result ' + result + ' error',
        error,
      );
      monitorCyclePromise.remove();
    } else if (result) {
      let {hexValue, resultArray, recordIndex, recordType, updatedStopReason} =
        extractRecordInfos(result, stopReason);
      countDownTimerId = handleTimeOut(
        countDownTimerId,
        monitorCyclePromise,
        dispatch,
        trackFolder,
        fullFileName,
        currentChart,
        serialKeyNumber,
        softVersion,
        cycleTypeLetter,
        dateInExcel,
        timeInExcel,
        getState,
        productionSetPoint,
        updatedStopReason,
        i,
        filteredCycleWithIndex,
        t,
        oldHeaders,
      );

      // Remove duplicate records
      if (oldRecordIndex === recordIndex) {
        console.log('duplicated record ' + recordIndex);
        return;
      }
      oldRecordIndex = recordIndex;

      // Send write if record downloaded is multiple of BLE_BUFFER_SIZE is reached
      if (
        recordDownloaded !== 0 &&
        (recordDownloaded + 1) % BLE_BUFFER_SIZE === 0
      ) {
        writeCompleteCycleDemand(
          filteredCycleWithIndex[i].cycle.memoryIndex,
          recordIndex + 1,
          getState().bleReducer.connectedService2Characteristics,
        );
      }

      // Filter cycle start events (0,2,4,7,8) from csv file
      if (
        recordType !== PRODUCTION_CYCLE_START &&
        recordType !== RECHARGE_CYCLE_START &&
        recordType !== AMBIENT_PRODUCTION_CYCLE_START &&
        recordType !== HOT_COLD_PRODUCTION_CYCLE_START &&
        recordType !== STOP_CODE_EVENT
      ) {
        console.log(
          'testTag extractedRecordIndex ' +
            recordIndex +
            ' downloading ' +
            (recordDownloaded + startFrom) +
            '/' +
            recordsNum +
            ' value ' +
            hexValue,
        );
        let values = extractCycleTemp(
          resultArray,
          t,
          doorStatus,
          getState().appReducer.esp32Version,
        );
        if (values) {
          //Save to chart
          currentChart.push({
            ...values,
            memoryIndex: filteredCycleWithIndex[i].cycle.memoryIndex,
            recordsNum: recordsNum,
            cycleTimestamp: filteredCycleWithIndex[i].cycle.timestamp,
            indexDemand: recordIndex,
          });
        }
        if ((recordIndex + 1) % 10 === 0) {
          //Show Progress each 10 lines
          dispatch(actionCreators.setIndexRecord(recordIndex + 1));
        }
      }
      if (recordIndex === recordsNum - 1) {
        console.log('testTag All lines are received');
        clearTimeout(countDownTimerId);
        dispatch(actionCreators.setRecordsNum(0));
        dispatch(actionCreators.setIndexRecord(0));
        // Stop Monitoring
        monitorCyclePromise.remove();

        saveCycle(
          trackFolder,
          fullFileName,
          currentChart,
          serialKeyNumber,
          softVersion,
          cycleTypeLetter,
          dateInExcel,
          timeInExcel,
          getState,
          productionSetPoint,
          updatedStopReason,
          dispatch,
          i,
          filteredCycleWithIndex,
          t,
          false,
          oldHeaders,
        );
      }
      recordDownloaded++;
    }
  });
}

async function downloadCycle(
  filteredCycleWithIndex,
  i,
  getState,
  trackFolder,
  dispatch,
  t,
) {
  // Indexing starts from 0 to the (number of records -1)
  let startFrom = 0;
  let currentChart = [];
  let oldHeaders = [];

  // Hex to dec
  const cycleMemoryIndex = parseInt(
    filteredCycleWithIndex[i].cycle.memoryIndex,
    16,
  );
  await writeCycleOffset(
    cycleMemoryIndex,
    getState().bleReducer.connectedService2Characteristics,
  );

  console.log('writeCycleOffset done ' + cycleMemoryIndex);

  const [
    unixTimestamp,
    memoryIndex,
    recordsNumber,
    cycleTypeHex,
    productionSetPoint,
    serialKeyNumber,
  ] = await readSavedCycle(
    getState().bleReducer.connectedService2Characteristics,
  );

  const recordsNum = filteredCycleWithIndex[i].cycle.recordsNum;

  console.log('readSavedCycle done ' + recordsNum);

  const cycleTypeLetter = extractCycleTypeLetter(cycleTypeHex);

  const filteredDate = getFormattedFileDate(trackFolder);

  const newDate = new Date(filteredCycleWithIndex[i].cycle.timestamp * 1000);
  newDate.setTime(newDate.getTime() + newDate.getTimezoneOffset() * 60 * 1000);
  const cycleTime = moment(newDate).format('HH:mm');
  //Get time HH:mm -> HHmm
  const fileTime = cycleTime.replace(':', '');
  //Compose CSV file name
  const fullFileName =
    getState().appReducer.serialKeyVersion +
    '-' +
    filteredDate +
    '-' +
    fileTime +
    '-' +
    cycleTypeLetter +
    '.csv';

  try {
    //Check if the csv file already downloaded
    const exist = await RNFetchBlob.fs.exists(trackFolder + '/' + fullFileName);
    if (exist) {
      //Read csv file
      const valueChart = await readFile(trackFolder + '/' + fullFileName);
      //Get the number of props to skip when reading csv file
      const defaultSettings = getState().maintenanceReducer.defaultSetting;
      const defaultSettingsLastRef =
        defaultSettings[defaultSettings.length - 2].ref;
      const numberOfProps = parseInt(
        defaultSettingsLastRef.substring(1, defaultSettingsLastRef.length),
      );

      console.log('numberOfProps ' + numberOfProps);
      currentChart = csvJSON(valueChart, numberOfProps);
      oldHeaders = extractOldHeadersFromCsv(valueChart, numberOfProps);

      if (currentChart.length > 0) {
        const indexDemand = currentChart[currentChart.length - 1].indexDemand;
        if (indexDemand) {
          startFrom = Number(indexDemand) + 1;
        } else {
          currentChart = [];
        }
      }
    }
  } catch (error) {
    console.log('error', error);
  }

  console.log('start downloading from ' + startFrom);
  //Check if cycle is not fully downloaded
  if (startFrom < recordsNum) {
    console.log(
      'HistoryAction filterCycle downloading from ' +
        startFrom +
        ' to ' +
        recordsNum,
    );

    dispatch(actionCreators.setRecordsNum(recordsNum));
    dispatch(actionCreators.setIndexRecord(startFrom));
    // Software version to add in the Excel file
    const softVersion =
      'V' +
      getState().appReducer.mcuVersion +
      '-V' +
      getState().appReducer.esp32Version;
    //Date to insert in the Excel file (DD/MM/YYYY format)
    const dateInExcel = moment(newDate).format('DD MM YYYY').replace(/ /g, '/');
    //Time to insert in the Excel file
    const timeInExcel = moment(newDate).format('HH:mm:ss');

    monitorCycle(
      getState,
      startFrom,
      t,
      currentChart,
      dispatch,
      trackFolder,
      cycleTime,
      fullFileName,
      -2,
      cycleTypeHex,
      cycleTypeLetter,
      softVersion,
      dateInExcel,
      timeInExcel,
      productionSetPoint,
      serialKeyNumber,
      filteredCycleWithIndex,
      i,
      recordsNum,
      oldHeaders,
    );
    //First write characteristics
    await writeCompleteCycleDemand(
      filteredCycleWithIndex[i].cycle.memoryIndex,
      startFrom,
      getState().bleReducer.connectedService2Characteristics,
    );
  } else {
    dispatch(triggerListFolders(true));
    dispatch(toggleIsFileLoading(false));
  }
}

// Download all cycles in a track folder
export const filterCycle = (timestamp, trackFolder, t) => {
  return async (dispatch, getState, DeviceManager) => {
    console.log('testTag filterCycle ' + timestamp + ' ' + trackFolder);
    // Inform the app that a file is being downloaded
    dispatch(toggleIsFileLoading(true));
    // Inform the app which file is being selected
    dispatch(setSelectedDate(timestamp));
    // Inform the app which folder is being selected
    dispatch(setSelectedFolder(trackFolder));
    //Get the cycle along with its index in the list of cycles
    const filteredCycleWithIndex = [];
    let indexCycle = 0;

    getState().historiqueReducer.listOfCycle.map((value) => {
      if (
        moment(extractGMTDate(value.timestamp)).format('DD-MM-YYYY') ===
        timestamp
      ) {
        console.log('testTag filteredCycleWithIndex ' + indexCycle);
        filteredCycleWithIndex.push({
          index: indexCycle,
          cycle: value,
        });
      }
      indexCycle++;
    });
    try {
      await downloadCycle(
        filteredCycleWithIndex,
        0,
        getState,
        trackFolder,
        dispatch,
        t,
      );
    } catch (e) {
      console.log('downloadCycle failed ' + e.message);
    }
  };
};
const writeCompleteCycleDemand = async (
  memoryIndex,
  record,
  characteristics2,
) => {
  const buff = Buffer.allocUnsafe(2);
  buff.writeInt16LE(record);
  const value = memoryIndex + '00' + buff.toString('hex');
  console.log('record: ' + record + ' sending ' + value);
  const result = await filterCharacteristics(
    characteristics2,
    '7807',
  ).writeWithResponse(decoder(value, 'hexToBase64'));
  return result;
};

const extractCycleTemp = (hexArray, t, doorStatus, esp32Version) => {
  const {fullTimestamp, cycleTime, cycleDateTime} =
    extractCycleTimestamps(hexArray);

  const workingState = extractWorkingState(
    hexArray[6],
    hexArray[4],
    esp32Version,
  );

  const {TUbat, niveauUBAT, tempTair, tempAmb, tempEvap, tempReact, niveauNH3} =
    extractTempValues(hexArray, esp32Version);

  let {codeAlarm, descriptionAlarm, doorStatusUpdated} = extractAlarmsAndEvents(
    hexArray,
    t,
    doorStatus,
  );

  return {
    cycleDateTime: cycleDateTime,
    cycleTime: cycleTime,
    TUbat: TUbat,
    niveauUBAT: niveauUBAT,
    niveauNH3: niveauNH3,
    tempTair: tempTair,
    tempAmb: tempAmb,
    tempEvap: tempEvap,
    tempReact: tempReact,
    codeAlarm: codeAlarm,
    descriptionAlarm: descriptionAlarm,
    fullTimestamp: fullTimestamp,
    workingState: workingState,
    doorStatus: doorStatusUpdated,
  };
};

const getCycleNumber = async (characteristics2) => {
  const result = await filterCharacteristics(characteristics2, '7800').read();
  return decoder(result.value, 'LE');
};

export const refreshCycleData = async (dispatch, getState, t) => {
  console.log('refreshCycleData');
  const characteristics2 =
    getState().bleReducer.connectedService2Characteristics;
  const cycleNumber = await getCycleNumber(characteristics2);
  console.log('refreshCycleData done cycleNumber: ' + cycleNumber);

  if (cycleNumber - 1 >= 0) {
    await writeCycleOffset(cycleNumber - 1, characteristics2);
    console.log('writeCycleOffset done ' + (cycleNumber - 1));

    const [
      unixTimestamp,
      memoryIndex,
      recordsNum,
      cycleTypeHex,
      productionSetPoint,
      serialKeyNumber,
    ] = await readSavedCycle(characteristics2);
    console.log('readSavedCycle done ' + recordsNum);

    const cycleTimestamp = Buffer.from(unixTimestamp, 'hex').readInt32LE();

    const gmtDate = extractGMTDate(cycleTimestamp);

    //Get Cycle date in DD-MM-YYYY format
    const cycleDate = moment(gmtDate).format('DD-MM-YYYY');

    const timestamp = moment(gmtDate).format('HH:mm');

    const rootPath =
      Platform.OS === constants.PLATFORM_ANDROID
        ? RNFetchBlob.fs.dirs.DownloadDir
        : RNFetchBlob.fs.dirs.DocumentDir;
    //Transform date from DD-MM-YYYY format to YYYY MM DD format
    const fileDate = moment(moment(cycleDate, 'DD-MM-YYYY').toDate()).format(
      'YYYY MM DD',
    );
    //Transform date from YYYY MM DD to YYMMDD format
    const filteredDate = fileDate
      .replace(/ /g, '')
      .substring(2, fileDate.length);
    //Get time HH:mm -> HHmm
    const fileTime = timestamp.replace(':', '');
    //Get CycleType letter reference
    let cycleTypeLetter = extractCycleTypeLetter(cycleTypeHex);

    //Compose CSV file name
    const fileName =
      getState().appReducer.serialKeyVersion +
      '-' +
      filteredDate +
      '-' +
      fileTime +
      '-' +
      cycleTypeLetter +
      '.csv';
    //CSV download path in device
    const path = `${rootPath}/ColdTrace/${
      getState().bleReducer.connectedDevice.name
    }/${cycleDate}`;
    //Check if the csv file already downloaded
    const exist = await RNFetchBlob.fs.exists(path + `/${fileName}`);
    // Indexing starts from 0 to the (number of records -1)
    let startFrom = 0;
    let currentChart = [];
    if (exist) {
      console.log('chart exist');
      //Read csv file
      const value = await readFile(path + `/${fileName}`);
      //Get the number of props to skip when reading csv file
      const defaultSettings = getState().maintenanceReducer.defaultSetting;
      const defaultSettingsLastRef =
        defaultSettings[defaultSettings.length - 2].ref;
      const numberOfProps = parseInt(
        defaultSettingsLastRef.substring(1, defaultSettingsLastRef.length),
      );

      console.log('numberOfProps ' + numberOfProps);
      currentChart = csvJSON(value, numberOfProps);
      if (currentChart.length > 0) {
        console.log('current chart length ' + currentChart.length);
        const indexDemand = currentChart[currentChart.length - 1].indexDemand;
        if (indexDemand) {
          startFrom = Number(indexDemand) + 1;
        } else {
          currentChart = [];
        }
      }
    }
    // Check if chart is not fully downloaded
    if (startFrom < recordsNum) {
      console.log(
        'Starting from ' + startFrom + ' records number ' + recordsNum,
      );
      // Software version to add in the Excel file
      const softVersion =
        'V' +
        getState().appReducer.mcuVersion +
        '-V' +
        getState().appReducer.esp32Version;
      // Date to insert in the Excel file ( format)
      // Transform date from YYYY MM DD format to DD/MM/YYYY format
      const dateInExcel = moment(moment(fileDate, 'YYYY MM DD').toDate())
        .format('DD MM YYYY')
        .replace(/ /g, '/');
      // Time to insert in the Excel file
      const timeInExcel = moment(gmtDate).format('HH:mm:ss');

      // Start monitoring notify events
      monitorChart(
        recordsNum,
        cycleTimestamp,
        currentChart,
        memoryIndex,
        path,
        timestamp,
        fileName,
        -2,
        cycleTypeHex,
        cycleTypeLetter,
        softVersion,
        dateInExcel,
        timeInExcel,
        productionSetPoint,
        serialKeyNumber,
        dispatch,
        getState,
        t,
      );
      // Trigger notify with a write request
      await writeCompleteCycleDemand(memoryIndex, startFrom, characteristics2);
    } else {
      console.log('All lines exist already');
      // Refresh folders list in FolderDeviceItem
      dispatch(actionCreators.toggleIsDeviceLoading(false));
      // Refresh files list in FolderDateItem
      dispatch(actionCreators.triggerListFolders(true));
    }
  } else {
    console.log('No records found');
    // Refresh folders list in FolderDeviceItem
    dispatch(actionCreators.toggleIsDeviceLoading(false));
    // Refresh files list in FolderDateItem
    dispatch(actionCreators.triggerListFolders(true));
  }
};

// Temperature records notification event listener
function monitorChart(
  cycleRecordsNum,
  cycleTimeStamp,
  currentChart,
  cycleMemoryIndex,
  trackFolder,
  timestamp,
  fullFileName,
  oldRecordIndex,
  cycleTypeHex,
  cycleTypeLetter,
  softVersion,
  dateInExcel,
  timeInExcel,
  productionSetPoint,
  serialKeyNumber,
  dispatch,
  getState,
  t,
) {
  let doorStatus = '';
  let stopReason = '';
  let countDownTimerId = -1;
  let recordDownloaded = 0;

  function saveFile(updatedStopReason) {
    // Refresh folders list in FolderDeviceItem
    dispatch(actionCreators.toggleIsDeviceLoading(false));
    // Refresh files list in FolderDateItem
    dispatch(actionCreators.triggerListFolders(true));
    //Stop Monitoring
    monitorChartPromise.remove();

    if (getState().bleReducer.connectedDevice != null) {
      //Save cycle into a file
      writeFileCSV(
        trackFolder,
        fullFileName,
        currentChart,
        true,
        serialKeyNumber,
        softVersion,
        cycleTypeLetter,
        dateInExcel,
        timeInExcel,
        getState().coldwayReducer.parametreColdway,
        getState().bleReducer.connectedDevice.id,
        productionSetPoint,
        updatedStopReason,
      );
    }
  }

  const monitorChartPromise = filterCharacteristics(
    getState().bleReducer.connectedService2Characteristics,
    '7808',
  ).monitor((error, result) => {
    if (error) {
      console.log('HistoryAction 7808: result ' + result + ' error', error);
      monitorChartPromise.remove();
    } else if (result) {
      // Remove old countdown if it exists
      if (countDownTimerId !== -1) {
        clearTimeout(countDownTimerId);
      }

      // Check for timeout
      countDownTimerId = setTimeout(() => {
        console.log('Download chart failed: no response');
        saveFile(updatedStopReason);
        // Restart download
        refreshCycleData(dispatch, getState, t);
      }, 5000);

      let {hexValue, resultArray, recordIndex, recordType, updatedStopReason} =
        extractRecordInfos(result, stopReason);

      // Remove duplicate records
      if (oldRecordIndex === recordIndex) {
        console.log('duplicated record ' + recordIndex);
        return;
      }
      oldRecordIndex = recordIndex;

      //Send write if record downloaded is multiple of BLE_BUFFER_SIZE is reached
      if (
        recordDownloaded !== 0 &&
        (recordDownloaded + 1) % BLE_BUFFER_SIZE === 0
      ) {
        writeCompleteCycleDemand(cycleMemoryIndex, recordIndex + 1);
      }

      // Filter cycle start events (0,2,4,7,8) from csv file
      if (
        recordType !== PRODUCTION_CYCLE_START &&
        recordType !== RECHARGE_CYCLE_START &&
        recordType !== AMBIENT_PRODUCTION_CYCLE_START &&
        recordType !== HOT_COLD_PRODUCTION_CYCLE_START &&
        recordType !== STOP_CODE_EVENT
      ) {
        let values = extractCycleTemp(
          resultArray,
          t,
          doorStatus,
          getState().appReducer.esp32Version,
        );
        if (values) {
          //Save to chart
          currentChart.push({
            ...values,
            memoryIndex: cycleMemoryIndex,
            recordsNum: cycleRecordsNum,
            cycleTimestamp: cycleTimeStamp,
            indexDemand: recordIndex,
          });
        }
      }
      if (recordIndex === cycleRecordsNum - 1) {
        console.log('All lines are received');
        clearTimeout(countDownTimerId);
        saveFile(updatedStopReason);
      }
      recordDownloaded++;
    }
  });
}

export const syncHistory = (t) => {
  return async (dispatch, getState, DeviceManager) => {
    dispatch(actionCreators.toggleIsFolderLoading(true));
    // Download last available cycle data
    await refreshCycleData(dispatch, getState, t);
  };
};
