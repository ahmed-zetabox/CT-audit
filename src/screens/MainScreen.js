import React, {useEffect} from 'react';
import {StackNavigation} from '../navigation/StackNavigation';
import Loader from '../components/Load';
import * as actionCreators from '../store/actions/index';
import {toggleDiagMode, toggleIsParamsLoading} from '../store/actions/index';
import {useDispatch, useSelector} from 'react-redux';
import {
  decoder,
  extractGMTDate,
  filterCharacteristics,
  readParametersList,
} from '../components/Common_functions';
import * as constants from '../config/constants';
import {Buffer} from 'buffer';
import moment from 'moment';
import {
  createFolder,
  writeListCycleFileCSV,
} from '../components/File_functions';
import {Platform} from 'react-native';
import SystemSetting from 'react-native-system-setting';
import RNFetchBlob from 'rn-fetch-blob';
import {PERMISSIONS, requestMultiple, RESULTS} from 'react-native-permissions';

const MainScreen = (props) => {
  const isAppInitilized = useSelector(
    (state) => state.appReducer.isAppInitialized,
  );
  const isParametersLoading = useSelector(
    (state) => state.appReducer.isParametersLoading,
  );
  const systemStatus = useSelector((state) => state.appReducer.systemStatus);
  const characteristics = useSelector(
    (state) => state.bleReducer.connectedService1Characteristics,
  );
  const characteristics2 = useSelector(
    (state) => state.bleReducer.connectedService2Characteristics,
  );
  const servicesStatus = useSelector(
    (state) => state.bleReducer.servicesStatus,
  );

  const isFolderLoading = useSelector(
    (state) => state.historiqueReducer.isFolderLoading,
  );
  const isFileLoading = useSelector(
    (state) => state.historiqueReducer.isFileLoading,
  );
  const connectedDevice = useSelector(
    (state) => state.bleReducer.connectedDevice,
  );
  const listOfCycles = useSelector(
    (state) => state.historiqueReducer.listOfCycle,
  );
  const defaultSettings = useSelector(
    (state) => state.maintenanceReducer.defaultSetting,
  );
  const dispatch = useDispatch();
  const requestLocationAndBlePermissions = () => {
    console.log('requestLocationAndBlePermissions');
    requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    ])
      .then((status) => {
        if (
          status[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] ===
            RESULTS.GRANTED ||
          status[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED
        ) {
          console.log('LOCATION permission granted');
          SystemSetting.isLocationEnabled().then((enable) => {
            SystemSetting.switchLocation(() => {});
          });
        } else {
          console.log('LOCATION permission denied');
        }

        if (
          status[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED &&
          status[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED
        ) {
          console.log('BLUETOOTH permission granted');
          SystemSetting.isBluetoothEnabled().then((enable) => {
            SystemSetting.switchBluetooth(() => {});
          });
        } else {
          console.log('BLUETOOTH permission denied');
        }
      })
      .catch(function (error) {
        console.log(
          'requestLocationAndBlePermissions promise error ' + error.message,
        );
        throw error;
      });
  };

  useEffect(() => {
    console.log('=== MainScreen useEffect START ===');
    dispatch(actionCreators.initilize());
    console.log('=== initilize() dispatched ===');
    requestLocationAndBlePermissions();
    console.log('=== requestLocationAndBlePermissions() called ===');
  }, []);

  useEffect(() => {
    if (
      characteristics.length &&
      characteristics2.length &&
      connectedDevice &&
      servicesStatus === constants.SERVICES_STATUS_SUCCESS
    ) {
      checkDiagMode();
      checkSystemStatus();
      initDeviceFolders();
      readIHM();
      readMCU();
      readESP32();
      readSERIAL();
    }
  }, [characteristics, servicesStatus, characteristics2, connectedDevice]);

  useEffect(() => {
    if (
      connectedDevice &&
      characteristics2.length > 0 &&
      !isFolderLoading &&
      !isFileLoading &&
      (systemStatus || systemStatus === constants.SYSTEM_STATUS_READY)
    ) {
      console.log('systemStatus ' + systemStatus);
      if (isParametersLoading) {
        readParametersList(characteristics2, dispatch, defaultSettings);
      }
    }
  }, [
    systemStatus,
    characteristics2,
    isParametersLoading,
    isFolderLoading,
    isFileLoading,
    connectedDevice,
  ]);

  useEffect(() => {
    if (
      characteristics2.length &&
      connectedDevice &&
      servicesStatus === constants.SERVICES_STATUS_SUCCESS &&
      isFolderLoading
    ) {
      syncHistory();
    }
  }, [connectedDevice, characteristics2, isFolderLoading]);

  const initDeviceFolders = () => {
    createFolder(connectedDevice.name);
  };
  useEffect(() => {
    if (connectedDevice) {
      const rootPath =
        Platform.OS === constants.PLATFORM_ANDROID
          ? RNFetchBlob.fs.dirs.DownloadDir
          : RNFetchBlob.fs.dirs.DocumentDir;
      const path = `${rootPath}/ColdTrace/${connectedDevice.name}/`;
      writeListCycleFileCSV(path, 'listCycles.csv', listOfCycles, true);
    }
  }, [listOfCycles, connectedDevice]);
  const toggleDiag = (value) => {
    return value === 1 ? true : false;
  };
  const readDiagMode = async () => {
    const value = filterCharacteristics(characteristics, '7501');
    const result = await value.read();
    return result;
  };
  const checkDiagMode = async () => {
    const result = await readDiagMode();
    dispatch(toggleDiagMode(toggleDiag(decoder(result.value, 'LE'))));
    if (result.isNotifiable) {
      result.monitor((error, res) => {
        if (error) {
          console.log('notify diag mode error', error);
        } else {
          dispatch(toggleDiagMode(toggleDiag(decoder(res.value, 'LE'))));
        }
      });
    }
  };
  const checkSystemStatus = async () => {
    const value = filterCharacteristics(characteristics, '7201');
    const result = await value.read();
    dispatch(actionCreators.changeSystemStatus(decoder(result.value, 'dec')));
    if (value.isNotifiable) {
      value.monitor((error, res) => {
        if (error) {
          console.log('system status error', error);
        } else {
          dispatch(
            actionCreators.changeSystemStatus(decoder(res.value, 'dec')),
          );
        }
      });
    }
  };

  const getCycleNumber = async () => {
    const result = await filterCharacteristics(characteristics2, '7800').read();
    const num = decoder(result.value, 'LE');
    return num;
  };
  const writeCycleOffset = async (cycleNum) => {
    const buff = Buffer.allocUnsafe(1);
    buff.writeIntLE(cycleNum);
    const value = decoder('01' + buff.toString('hex'), 'hexToBase64');
    const result = await filterCharacteristics(
      characteristics2,
      '7801',
    ).writeWithResponse(value);
    return result;
  };
  const readSavedCycle = async () => {
    const result = await filterCharacteristics(characteristics2, '7802').read();
    const hexValue = decoder(result.value, 'hex');
    const resultArray = decoder(hexValue, 'hexToArray');
    return [
      resultArray[2],
      decoder('' + resultArray[8] + resultArray[9], 'hexToDecimal16LE'),
      resultArray[7],
      Buffer.from(
        '' + resultArray[3] + resultArray[4] + resultArray[5] + resultArray[6],
        'hex',
      ).readInt32LE(),
    ];
  };

  const getCycleData = async () => {
    const cycleNumber = await getCycleNumber();
    if (cycleNumber - 1 >= 0) {
      for (let i = 0; i <= cycleNumber - 1; i++) {
        await writeCycleOffset(i);
        const [memoryIndex, recordsNum, cycleType, timestamp] =
          await readSavedCycle();
        await CreateTreeByCycle(memoryIndex, recordsNum, cycleType, timestamp);
        //const chartData = readRecords(memoryIndex, recordsNum);
      }
    }
  };
  const CreateTreeByCycle = async (
    memoryIndex,
    recordsNum,
    cycleType,
    timestamp,
  ) => {
    const date = moment(extractGMTDate(timestamp)).format('DD-MM-YYYY');
    createFolder(connectedDevice.name + '/' + date);
    const type =
      decoder(cycleType, 'hexToDecimal') != 4
        ? constants.CYCLE_PRODUCTION
        : constants.CYCLE_RECHARGE;
    const value = {
      timestamp,
      type,
      memoryIndex,
      recordsNum,
      value: [],
    };
    dispatch(actionCreators.addCycle(value));
  };
  const syncHistory = async () => {
    dispatch(actionCreators.toggleIsFolderLoading(true));
    await getCycleData();
    dispatch(actionCreators.toggleIsFolderLoading(false));
    // Refresh folders list in FolderDeviceItem
    dispatch(actionCreators.toggleIsDeviceLoading(false));
  };

  const readIHM = async () => {
    const result = await filterCharacteristics(characteristics, '7000').read();
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
  };
  const readMCU = async () => {
    const result = await filterCharacteristics(characteristics, '7001').read();
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
  };
  const readESP32 = async () => {
    const result = await filterCharacteristics(characteristics, '7002').read();
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
  };
  const readSERIAL = async () => {
    const result = await filterCharacteristics(characteristics, '7003').read();
    dispatch(actionCreators.setSerialKeyVersion(decoder(result.value, '32LE')));
  };
  console.log('=== MainScreen render, isAppInitilized:', isAppInitilized, '===');
  // TEMPORARY: Always show StackNavigation to bypass loader
  return <><StackNavigation /></>;
};

export default MainScreen;
