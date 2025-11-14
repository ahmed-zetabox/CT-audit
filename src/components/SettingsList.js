import React, {useEffect, useState} from 'react';
import {IndexPath, List} from '@ui-kitten/components';
import {StyleSheet, Platform} from 'react-native';
import * as constants from '../config/constants';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import * as actionCreators from '../store/actions';
import SystemSetting from 'react-native-system-setting';
import {SettingsListItem} from './SettingsListItem';
import {filterCharacteristics} from './Common_functions';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const settings = [
  {
    title: 'Bluetooth',
    description: 'settings_bluetooth_info',
    type: constants.SETTINGS_BLUETOOTH,
    icon: 'bluetooth-outline',
    extra: {
      button_title: 'open configuration',
      platform: [constants.PLATFORM_ANDROID],
    },
  },
  {
    title: 'position',
    description: 'settings_position_info',
    type: constants.SETTINGS_POSITION,
    icon: 'pin-outline',
    extra: {
      button_title: 'open configuration',
      platform: [constants.PLATFORM_ANDROID],
    },
  },
  {
    title: 'Global_position',
    description: 'settings_position_global_info',
    type: constants.SETTINGS_POSITION_GLOBAL,
    icon: 'map-outline',
    extra: {
      button_title: 'open_configuration',
      platform: [constants.PLATFORM_ANDROID],
    },
  },
  {
    title: 'language',
    description: 'settings_language_info',
    type: constants.SETTINGS_LANGUAGE,
    icon: 'globe-2-outline',
    extra: {
      platform: [constants.PLATFORM_ANDROID, constants.PLATFORM_IOS],
    },
  },
  {
    title: 'unit',
    description: 'Temperature setting',
    type: constants.SETTINGS_UNITE,
    icon: 'thermometer-plus-outline',
    extra: {
      platform: [constants.PLATFORM_ANDROID, constants.PLATFORM_IOS],
    },
  },
  {
    title: 'ihm_version',
    description: '',
    type: constants.SETTINGS_IHM,
    icon: 'info-outline',
    extra: {
      platform: [constants.PLATFORM_ANDROID, constants.PLATFORM_IOS],
    },
  },
  {
    title: 'mcu_version',
    description: '',
    type: constants.SETTINGS_MCU,
    icon: 'info-outline',
    extra: {
      platform: [constants.PLATFORM_ANDROID, constants.PLATFORM_IOS],
    },
  },
  {
    title: 'eSP32_version',
    description: '',
    type: constants.SETTINGS_ESP32,
    icon: 'info-outline',
    extra: {
      platform: [constants.PLATFORM_ANDROID, constants.PLATFORM_IOS],
    },
  },
  {
    title: 'Serial_number',
    description: '',
    type: constants.SETTINGS_SERIAL,
    icon: 'info-outline',
    extra: {
      platform: [constants.PLATFORM_ANDROID, constants.PLATFORM_IOS],
    },
  },
];
const Languages = [
  {
    value: 'fr',
  },
  {
    value: 'en',
  },
  {
    value: 'pt',
  },
  {
    value: 'de',
  },
  {
    value: 'es',
  },
  {
    label: 'italien',
    value: 'it',
  },
];
export const SettingsList = () => {
  const [t, i18n] = useTranslation();
  const bluetoothPermissionStatus = useSelector(
    (state) => state.appReducer.bluetoothPermissionStatus,
  );
  const diagModeStatus = useSelector((state) => state.appReducer.diagMode);
  const status = useSelector((state) => state.bleReducer.status);
  const locationPermissionStatus = useSelector(
    (state) => state.appReducer.locationPermissionStatus,
  );
  const [selectedIndex, setSelectedIndex] = React.useState(
    new IndexPath(Languages.findIndex((lang) => lang.value === i18n.language)),
  );
  const unite = useSelector((state) => state.appReducer.unite);
  const characteristics = useSelector(
    (state) => state.bleReducer.connectedService1Characteristics,
  );
  const ihmVersion = useSelector((state) => state.appReducer.ihmVersion);
  const mcuVersion = useSelector((state) => state.appReducer.mcuVersion);
  const esp32Version = useSelector((state) => state.appReducer.esp32Version);
  const serialKeyVersion = useSelector(
    (state) => state.appReducer.serialKeyVersion,
  );
  const [activeUnite, setActiveUnite] = useState(unite);
  const [activeBle, setStatusBle] = useState(bluetoothPermissionStatus);
  const [diagMode, setDiagMode] = useState(diagModeStatus);
  const [activeLocation, setStatusLocation] = useState(
    locationPermissionStatus,
  );
  const dispatch = useDispatch();
  useEffect(() => {
    setStatusLocation(locationPermissionStatus);
  }, [locationPermissionStatus]);

  useEffect(() => {
    setStatusBle(bluetoothPermissionStatus);
  }, [bluetoothPermissionStatus]);

  useEffect(() => {
    setDiagMode(diagModeStatus);
  }, [diagModeStatus]);

  const onBluetoothCheckedChange = (isChecked) => {
    setStatusBle(isChecked);
    dispatch(actionCreators.toggleBluetooth(isChecked));
  };
  const onLocationCheckedChange = (isChecked) => {
    dispatch(actionCreators.toggleLocation());
  };

  const onDiagModeCheckedChange = (isChecked) => {
    if (characteristics.length) {
      const value = filterCharacteristics(characteristics, '7500');
      const base64Value = isChecked
        ? constants.DIAG_BASE64_ON
        : constants.DIAG_BASE64_OFF;
      value.writeWithResponse(base64Value).then((result) => {
        setDiagMode(isChecked);
      });
    }
  };
  const requestLocationPermission = async () => {
    try {
      const granted = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

      if (granted === RESULTS.GRANTED) {
        SystemSetting.isLocationEnabled().then((enable) => {
          SystemSetting.switchLocation(() => {
            console.log('switch location successfully');
          });
        });
      } else {
        console.log('LOCATION permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const changeLanguage = (Language) => {
    i18n.changeLanguage(Language);
  };
  const displayValue = Languages[selectedIndex.row].value;
  const selectLangHandler = (index) => {
    setSelectedIndex(index);
    const langValue = Languages[index - 1].value;
    changeLanguage(langValue);
  };

  const unitChangeHandler = async (index) => {
    setActiveUnite(index === 0 ? '°C' : '°F');
    dispatch(actionCreators.setTempUniti(index === 0 ? '°C' : '°F'));
    await AsyncStorage.setItem('unitTempSettings', index.toString());
  };

  const renderItem = ({item}) => (
    <SettingsListItem
      item={item}
      onBluetoothCheckedChange={onBluetoothCheckedChange}
      onLocationCheckedChange={onLocationCheckedChange}
      onDiagModeCheckedChange={onDiagModeCheckedChange}
      requestLocationPermission={requestLocationPermission}
      selectLangHandler={selectLangHandler}
      selectedIndex={selectedIndex}
      displayValue={displayValue}
      Languages={Languages}
      activeLocation={activeLocation}
      activeBle={activeBle}
      activeUnite={activeUnite}
      diagMode={diagMode}
      unitChangeHandler={unitChangeHandler}
      unite={unite}
      status={status}
      t={t}
      ihm={ihmVersion}
      mcu={mcuVersion}
      esp32={esp32Version}
      serial={serialKeyVersion}
    />
  );
  return (
    <List
      style={styles.white_bg}
      data={settings.filter((item) =>
        item.extra.platform.includes(Platform.OS),
      )}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  white_bg: {
    backgroundColor: '#FFFFFF',
  },
});
