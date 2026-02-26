import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Dimensions, Platform, ScrollView, StyleSheet, View} from 'react-native';
import {Divider, Text} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {ErrorNoDevice} from '../components/ErrorNoDevice';
import * as constants from '../config/constants';
import {
  AMBIENT_PRODUCTION_CYCLE_START,
  BLE_BUFFER_SIZE,
  converter,
  decoder,
  descAlerts,
  extractAlarmsAndEvents,
  extractCycleTimestamps,
  extractCycleTypeLetter,
  extractGMTDate,
  extractRecordInfos,
  extractTempValues,
  extractWorkingState,
  filterCharacteristics,
  HOT_COLD_PRODUCTION_CYCLE_START,
  PRODUCTION_CYCLE_START,
  readSavedCycle,
  RECHARGE_CYCLE_START,
  STOP_CODE_EVENT,
  writeCycleOffset,
} from '../components/Common_functions';
import {HomeAlarms} from '../components/HomeAlarms';
import {HomeChart} from '../components/HomeChart';
import {HomeTemp} from '../components/HomeTemp';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import Loader from '../components/Load';
import {ErrorServices} from '../components/ErrorServices';
import {Buffer} from 'buffer';
import moment from 'moment';
import * as actionCreators from '../store/actions/index';
import {
  csvJSON,
  extractOldHeadersFromCsv,
  readFile,
  writeFileCSV,
} from '../components/File_functions';
import RNFetchBlob from 'rn-fetch-blob';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {SYSTEM_STATUS_HOT_AND_COLD} from '../config/constants';

export const HomeScreen = (props) => {
  const {t, i18n} = useTranslation();
  const [, updateState] = useState();
  const [currentCycleType, setCurrentCycleType] = useState();
  const [currentCyclePath, setCurrentCyclePath] = useState({
    path: null,
    fileName: null,
  });
  const dispatch = useDispatch();
  const [tempChart, setTempChart] = useState([]);
  const [fullDate, setFullDate] = useState(null);
  const [cycleTotalNumber, setCycleTotalNumber] = useState(null);
  const forceUpdate = useCallback(() => updateState({}), []);
  const windowHeight = Dimensions.get('window').height;
  const [deviceName, setDeviceName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [tempCaise, setTempCaise] = useState(0);
  const [tempConsigne, setTempConsigne] = useState(0);
  const [niveauJauge, setNiveauJauge] = useState(0);
  const [listAlerts, setListAlerts] = useState([]);

  //Ble reducer
  const status = useSelector((state) => state.bleReducer.status);
  const characteristics = useSelector(
    (state) => state.bleReducer.connectedService1Characteristics,
  );
  const characteristics2 = useSelector(
    (state) => state.bleReducer.connectedService2Characteristics,
  );
  const connectedDevice = useSelector(
    (state) => state.bleReducer.connectedDevice,
  );
  const servicesStatus = useSelector(
    (state) => state.bleReducer.servicesStatus,
  );
  //History Reducer
  const isChartLoading = useSelector(
    (state) => state.historiqueReducer.isChartLoading,
  );
  const listOfCycles = useSelector(
    (state) => state.historiqueReducer.listOfCycle,
  );
  const isFolderLoading = useSelector(
    (state) => state.historiqueReducer.isFolderLoading,
  );
  const isFileLoading = useSelector(
    (state) => state.historiqueReducer.isFileLoading,
  );
  //App Reducer
  const systemStatus = useSelector((state) => state.appReducer.systemStatus);
  const uniteTemp = useSelector((state) => state.appReducer.unite);
  const mcuVersion = useSelector((state) => state.appReducer.mcuVersion);
  const esp32Version = useSelector((state) => state.appReducer.esp32Version);
  const serialKeyVersion = useSelector(
    (state) => state.appReducer.serialKeyVersion,
  );
  const isParametersLoading = useSelector(
    (state) => state.appReducer.isParametersLoading,
  );

  //Maintenance Reducer
  const defaultSettings = useSelector(
    (state) => state.maintenanceReducer.defaultSetting,
  );
  // ColdWay Reducer
  const coldWayStoredParams = useSelector(
    (state) => state.coldwayReducer.parametreColdway,
  );

  const isFocused = useIsFocused();
  const convertedTempCaisse = useMemo(() => {
    return parseFloat(converter(tempCaise, uniteTemp)).toFixed(1) + uniteTemp;
  }, [tempCaise, uniteTemp]);
  const convertedTempConsigne = useMemo(() => {
    return (
      parseFloat(converter(tempConsigne, uniteTemp)).toFixed(1) + uniteTemp
    );
  }, [tempConsigne, uniteTemp]);

  const refreshComponent = () => {
    forceUpdate();
  };

  var coldWayParams = [];

  useEffect(() => {
    if (connectedDevice && connectedDevice.name) {
      setDeviceName(connectedDevice.name);
      setCurrentCyclePath({
        path: null,
        fileName: null,
      });
    }
  }, [connectedDevice]);
  useEffect(() => {
    if (status === 'Disconnected') {
      setTempChart([]);
    }
    setIsLoading(true);
  }, [status]);

  useEffect(() => {
    if (
      characteristics.length > 0 &&
      characteristics2.length > 0 &&
      isFocused
    ) {
      Promise.all([
        getTempCaise(filterCharacteristics(characteristics, '7301')),
        getNiveauJauge(filterCharacteristics(characteristics, '7200')),
        getAlerts(filterCharacteristics(characteristics, '7400')),
        getTempConsigne(filterCharacteristics(characteristics2, '7b01')),
      ])
        .then((values) => {
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
        });
    }
  }, [characteristics, characteristics2, isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      if (characteristics.length > 0 && characteristics2.length > 0) {
        const res1 = setTempCaiseNotify(
          filterCharacteristics(characteristics, '7301'),
        );
        const res2 = setNiveauJaugeNotify(
          filterCharacteristics(characteristics, '7200'),
        );
        const res3 = setAlertsNotify(
          filterCharacteristics(characteristics, '7400'),
        );
        const res4 = setCycleNumberNotify(
          filterCharacteristics(characteristics2, '7800'),
        );
        const res5 = setTempConsigneNotify(
          filterCharacteristics(characteristics2, '7b01'),
        );
        return () => {
          res1.remove(),
            res2.remove(),
            res3.remove(),
            res4.remove(),
            res5.remove();
        };
      }
    }, [characteristics, characteristics2]),
  );
  useFocusEffect(
    React.useCallback(() => {
      if (
        characteristics.length > 0 &&
        characteristics2.length > 0 &&
        !isChartLoading &&
        !isFolderLoading
      ) {
        const res4 = setCycleDataNotify(
          filterCharacteristics(characteristics2, '7805'),
          tempChart,
          currentCycleType,
        );
        return () => {
          res4.remove();
        };
      }
    }, [
      characteristics,
      characteristics2,
      isChartLoading,
      isFolderLoading,
      tempChart,
      currentCyclePath,
    ]),
  );

  useEffect(() => {
    if (
      characteristics2.length > 0 &&
      !isFolderLoading &&
      !isFileLoading &&
      isFocused &&
      (systemStatus || systemStatus === constants.SYSTEM_STATUS_READY)
    ) {
      dispatch(actionCreators.toggleChartLoading(true));
      if (!isParametersLoading) {
        // Load chart after params
        getCycleData()
          .then(
            () => {},
            () => {
              console.log('toggleChartLoading false 2');
              dispatch(actionCreators.toggleChartLoading(false));
            },
          )
          .catch(() => {
            console.log('toggleChartLoading false 3');
            dispatch(actionCreators.toggleChartLoading(false));
          });
      }
    }
  }, [
    characteristics2,
    isFolderLoading,
    isFocused,
    cycleTotalNumber,
    isFileLoading,
    isParametersLoading,
  ]);
  useEffect(() => {
    if (!isChartLoading && !isFolderLoading && currentCycleType) {
      saveCurrentCycle(tempChart);
    }
  }, [isChartLoading, tempChart, currentCycleType]);
  const refreshAlertList = (alerts) => {
    let arrayAlerts = [];
    alerts.reverse().map((alert, index) => {
      if (alert == 1) {
        arrayAlerts.push({
          code: descAlerts[index].code,
          title: descAlerts[index].title,
          date: new Date(),
        });
      }
    });
    return arrayAlerts;
  };

  const removeDefaultFromChart = useMemo(() => {
    return tempChart.filter((item) => !item.codeAlarm);
  }, [tempChart]);
  const getAlerts = async (value) => {
    const result = await value.read();
    const alerts = decoder(result.value, 'bin16');
    setListAlerts(refreshAlertList(alerts));
  };
  const setAlertsNotify = (value) => {
    if (value.isNotifiable) {
      const res = value.monitor((error, res) => {
        if (error) {
          console.log('error', error);
        } else {
          const alerts = decoder(res.value, 'bin16');
          setListAlerts(refreshAlertList(alerts));
        }
      });
      return res;
    }
  };
  const getNiveauJauge = async (value) => {
    const result = await value.read();
    setNiveauJauge(decoder(result.value, 'dec'));
  };
  const setNiveauJaugeNotify = (value) => {
    if (value.isNotifiable) {
      const res = value.monitor((error, res) => {
        if (error) {
          console.log('error', error);
        } else {
          setNiveauJauge(decoder(res.value, 'dec'));
        }
      });
      return res;
    }
  };
  const getTempConsigne = async (value) => {
    const result = await value.read();
    setTempConsigne(decoder(result.value, '16LE') / 10);
  };
  const getTempCaise = async (value) => {
    const result = await value.read();
    setTempCaise(decoder(result.value, '16LE') / 10);
  };
  const setTempCaiseNotify = (value) => {
    if (value.isNotifiable) {
      const res = value.monitor((error, res) => {
        if (error) {
          console.log('error', error);
        } else if (res) {
          setTempCaise(decoder(res.value, '16LE') / 10);
        }
      });
      return res;
    }
  };

  const setTempConsigneNotify = (value) => {
    if (value.isNotifiable) {
      const res = value.monitor((error, res) => {
        if (error) {
          console.log('error', error);
        } else if (res) {
          setTempConsigne(decoder(res.value, '16LE') / 10);
        }
      });
      return res;
    }
  };

  const setCycleNumberNotify = (value) => {
    if (value.isNotifiable) {
      const res = value.monitor((error, res) => {
        if (error) {
          console.log('error', error);
        } else {
          setCycleTotalNumber(decoder(res.value, 'LE'));
        }
      });
      return res;
    }
  };
  const getCycleNumber = async () => {
    const result = await filterCharacteristics(characteristics2, '7800').read();
    return decoder(result.value, 'LE');
  };

  const writeCompleteCycleDemand = async (memoryIndex, record) => {
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

  const extractCycleTemp = (hexArray, doorStatus) => {
    const {fullTimestamp, cycleTime, cycleDateTime} =
      extractCycleTimestamps(hexArray);

    const workingState = extractWorkingState(
      hexArray[6],
      hexArray[4],
      esp32Version,
    );

    const {
      TUbat,
      niveauUBAT,
      tempTair,
      tempAmb,
      tempEvap,
      tempReact,
      niveauNH3,
    } = extractTempValues(hexArray, esp32Version);

    let {codeAlarm, descriptionAlarm, doorStatusUpdated} =
      extractAlarmsAndEvents(hexArray, t, doorStatus);

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

  const getCycleData = async () => {
    console.log('getCycleData');
    const cycleNumber = await getCycleNumber();
    console.log('getCycleNumber done ' + cycleNumber);

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
      setFullDate(cycleDate);

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
        serialKeyVersion +
        '-' +
        filteredDate +
        '-' +
        fileTime +
        '-' +
        cycleTypeLetter +
        '.csv';
      //CSV download path in device
      const path = `${rootPath}/ColdTrace/${connectedDevice.name}/${cycleDate}`;
      //Check if the csv file already downloaded
      const exist = await RNFetchBlob.fs.exists(path + `/${fileName}`);
      // Indexing starts from 0 to the (number of records -1)
      let startFrom = 0;
      let currentChart = [];
      let oldHeaders = [];
      if (exist) {
        console.log('chart exist');
        //Read csv file
        const value = await readFile(path + `/${fileName}`);
        //Get the number of props to skip when reading csv file
        const defaultSettingsLastRef =
          defaultSettings[defaultSettings.length - 2].ref;
        const numberOfProps = parseInt(
          defaultSettingsLastRef.substring(1, defaultSettingsLastRef.length),
        );

        console.log('numberOfProps ' + numberOfProps);
        currentChart = csvJSON(value, numberOfProps);
        oldHeaders = extractOldHeadersFromCsv(value, numberOfProps);
        /*        for (let i = 0; i < oldHeaders.length; i++) {
          console.log('oldHeaders ' + oldHeaders[i][0] + oldHeaders[i][1]);
        }*/
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
      dispatch(actionCreators.toggleChartLoading(true));
      // Check if chart is not fully downloaded
      if (startFrom < recordsNum) {
        console.log(
          'Starting from ' + startFrom + ' records number ' + recordsNum,
        );
        // Software version to add in the Excel file
        const softVersion = 'V' + mcuVersion + '-V' + esp32Version;
        //Date to insert in the Excel file ( format)
        //Transform date from YYYY MM DD format to DD/MM/YYYY format
        const dateInExcel = moment(moment(fileDate, 'YYYY MM DD').toDate())
          .format('DD MM YYYY')
          .replace(/ /g, '/');
        //Time to insert in the Excel file
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
          oldHeaders,
        );
        // Trigger notify with a write request
        await writeCompleteCycleDemand(
          memoryIndex,
          startFrom,
          characteristics2,
        );
      } else {
        //All lines are received
        dispatch(actionCreators.toggleChartLoading(false));
        setTempChart(currentChart);
      }
    } else {
      // No records found
      dispatch(actionCreators.toggleChartLoading(false));
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
    oldHeaders,
  ) {
    let doorStatus = '';
    let stopReason = '';
    let countDownTimerId = -1;
    let recordDownloaded = 0;

    function saveAndLoadChart(updatedStopReason) {
      dispatch(actionCreators.toggleChartLoading(false));
      setTempChart(currentChart);
      //Stop Monitoring
      monitorChartPromise.remove();
      setCurrentCycleType(cycleTypeHex);

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
        coldWayStoredParams,
        connectedDevice.id,
        productionSetPoint,
        updatedStopReason,
        oldHeaders,
      );
    }

    const monitorChartPromise = filterCharacteristics(
      characteristics2,
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
          saveAndLoadChart(updatedStopReason);
          // Restart download
          dispatch(actionCreators.toggleChartLoading(true));
          getCycleData();
        }, 5000);

        let {
          hexValue,
          resultArray,
          recordIndex,
          recordType,
          updatedStopReason,
        } = extractRecordInfos(result, stopReason);

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
          let values = extractCycleTemp(resultArray, doorStatus);
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
          saveAndLoadChart(updatedStopReason);
        }
        recordDownloaded++;
      }
    });
  }
  const setCycleDataNotify = (value, chartArray, type) => {
    const newChart = [...chartArray];
    let doorStatus = '';
    if (value.isNotifiable) {
      return value.monitor((error, res) => {
        if (error) {
          console.log('error', error);
        } else if (res && type) {
          const hexValue = decoder(res.value, 'hex');
          const resultArray = decoder(hexValue, 'hexToArray');
          const returnedValue = extractCycleTemp(resultArray, doorStatus);
          newChart.push(returnedValue);
          setTempChart(newChart);
        }
      });
    }
  };
  const saveCurrentCycle = async (newChart) => {
    try {
      if (newChart.length) {
        //Get cycle time
        const cycleDate = new Date(newChart[0].cycleTimestamp * 1000);
        cycleDate.setTime(
          cycleDate.getTime() + cycleDate.getTimezoneOffset() * 60 * 1000,
        );
        const cycleTime = moment(cycleDate).format('HH:mm');
        //Get time HH:mm -> HHmm
        const fileTime = cycleTime.replace(':', '');
        //Transform date from DD-MM-YYYY format to YYYY MM DD format
        const fileDate = moment(cycleDate).format('YYYY MM DD');
        //Transform date from YYYY MM DD to YYMMDD format
        const filteredDate = fileDate
          .replace(/ /g, '')
          .substring(2, fileDate.length);
        //Get CycleType letter reference
        let cycleTypeLetter = extractCycleTypeLetter(currentCycleType);

        //Compose CSV file name
        const fileName =
          serialKeyVersion +
          '-' +
          filteredDate +
          '-' +
          fileTime +
          '-' +
          cycleTypeLetter +
          '.csv';
        const rootPath =
          Platform.OS === constants.PLATFORM_ANDROID
            ? RNFetchBlob.fs.dirs.DownloadDir
            : RNFetchBlob.fs.dirs.DocumentDir;
        const path = `${rootPath}/ColdTrace/${connectedDevice.name}/${fullDate}`;
        setCurrentCyclePath({
          path: path + '/' + fileName,
          fileName: fileName,
        });
      } else {
        setCurrentCyclePath({
          path: null,
          fileName: constants.SERVICES_STATUS_ERROR,
        });
      }
    } catch (error) {
      console.log('my error', error);
      setCurrentCyclePath({
        path: null,
        fileName: constants.SERVICES_STATUS_ERROR,
      });
    }
  };

  const renderSystemStatus = useMemo(() => {
    switch (systemStatus) {
      case constants.SYSTEM_STATUS_READY:
        return (
          <Text category="s2" status="success">
            {t('Ready')}
          </Text>
        );
      case constants.SYSTEM_STATUS_TO_CHARGE:
        return (
          <Text category="s2" status="warning">
            {t('recharge')}
          </Text>
        );
      case constants.SYSTEM_STATUS_FRESH:
        return (
          <Text category="s2" status="success">
            {t('working')}
          </Text>
        );
      case constants.SYSTEM_STATUS_AMBIENT:
        return (
          <Text category="s2" status="success">
            {t('working')}
          </Text>
        );
      case constants.SYSTEM_STATUS_CHARGE:
        return (
          <Text category="s2" status="warning">
            {t('charging')}
          </Text>
        );
      case constants.SYSTEM_STATUS_COOLING:
        return (
          <Text category="s2" status="warning">
            {t('cooling')}
          </Text>
        );
      case constants.SYSTEM_STATUS_DEFAULT:
        return (
          <Text category="s2" status="danger">
            {t('default')}
          </Text>
        );
      case constants.SYSTEM_STATUS_HOT_AND_COLD:
        return (
          <Text category="s2" status="success">
            {t('hot_cold')}
          </Text>
        );
      default:
        return (
          <Text category="s2" status="danger">
            {t('Error')}
          </Text>
        );
    }
  }, [systemStatus, i18n.language]);
  return (
    <ErrorBoundary refreshComponent={refreshComponent}>
      {connectedDevice ? (
        servicesStatus === constants.SERVICES_STATUS_SUCCESS ? (
          isLoading ? (
            <Loader />
          ) : (
            <ScrollView style={styles.scroll_container}>
              <View style={styles.container}>
                <View
                  style={[
                    styles.header_align,
                    windowHeight > 640 && styles.mt_20,
                  ]}>
                  <Text category="c2" style={styles.header_text_status}>
                    {deviceName}
                  </Text>
                  <View style={styles.header_bar} />
                  <Text category="c2" style={styles.header_text_status}>
                    {t('common:System_status') + ': '}
                    {renderSystemStatus}
                  </Text>
                </View>
                <Divider style={styles.divider_st} />
                <HomeTemp
                  convertedTempCaisse={convertedTempCaisse}
                  convertedTempConsigne={convertedTempConsigne}
                  niveauJauge={niveauJauge}
                  windowHeight={windowHeight}
                />
                <HomeChart
                  tempChart={removeDefaultFromChart}
                  windowHeight={windowHeight}
                  navigation={props.navigation}
                  isChartLoading={isChartLoading}
                  isFolderLoading={isFolderLoading}
                />
                <HomeAlarms
                  windowHeight={windowHeight}
                  listAlerts={listAlerts}
                  currentCyclePath={currentCyclePath}
                  deviceName={connectedDevice.name}
                />
              </View>
            </ScrollView>
          )
        ) : (
          <ErrorServices />
        )
      ) : (
        <ErrorNoDevice message={constants.NO_DATA_FOUND} />
      )}
    </ErrorBoundary>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  scroll_container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  divider_st: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.4)',
    marginTop: 4,
  },
  header_text_status: {
    color: '#808080',
  },
  header_bar: {
    width: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.4)',
  },
  header_align: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mt_10: {
    marginTop: 10,
  },
  mt_20: {
    marginTop: 20
  }
});
