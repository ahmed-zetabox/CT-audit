import React from 'react';
import {
  Text,
  Layout,
  Divider,
  TopNavigation,
  TopNavigationAction,
  Icon,
} from '@ui-kitten/components';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SettingsList} from '../components/SettingsList';
import * as app from '../../app.json';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import * as constants from '../config/constants';
import {readESP32, readIHM, readMCU, readSERIAL} from '../store/actions';
import * as actionCreators from '../store/actions';

export const SettingsScreen = (props) => {
  const [t] = useTranslation();
  const BackIcon = (props) => (
    <Icon fill="#FFFFFF" {...props} name="arrow-back" />
  );
  const BackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => props.navigation.goBack()}
    />
  );
  const dispatch = useDispatch();
  const connectedDevice = useSelector(
    (state) => state.bleReducer.connectedDevice,
  );
  const servicesStatus = useSelector(
    (state) => state.bleReducer.servicesStatus,
  );
  const characteristics = useSelector(
    (state) => state.bleReducer.connectedService1Characteristics,
  );
  useFocusEffect(
    React.useCallback(() => {
      if (
        characteristics.length &&
        connectedDevice &&
        servicesStatus === constants.SERVICES_STATUS_SUCCESS
      ) {
        dispatch(readIHM());
        dispatch(readMCU());
        dispatch(readESP32());
        dispatch(readSERIAL());
      }
      return () => null;
    }, [connectedDevice, servicesStatus, characteristics]),
  );

  return (
    <Layout style={styles.container}>
      {props.route.params && (
        <TopNavigation
          style={{backgroundColor: '#1B1D3A'}}
          accessoryLeft={BackAction}
        />
      )}
      <View style={styles.pd_15}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text category="s1" appearance="hint">
            {t('general_settings')}
          </Text>
          <Text appearance="hint" category="s2">
            {t('Version') + ' ' + app.version}
          </Text>
        </View>
        <Divider style={styles.mr_t_10} />
      </View>
      <SettingsList />
    </Layout>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pd_15: {
    padding: 15,
  },
  mr_t_10: {
    marginTop: 10,
  },
});
