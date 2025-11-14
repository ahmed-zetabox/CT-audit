import React, { useCallback, useState, useEffect } from 'react';
import {
  Button,
  Divider,
  Icon,
  Modal,
  Spinner,
  Text,
  Layout,
} from '@ui-kitten/components';
import { Platform, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BleList } from './BleList';
import * as constants from '../config/constants';
import * as actionCreators from '../store/actions';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import toastComponent from './toastComponent';
import SystemSetting from 'react-native-system-setting';

export const ScanModal = (props) => {
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [isDisabled, setIsDisabled] = useState(false)
  const screenOrientation = useSelector(
    (state) => state.appReducer.screenOrientation,
  );
  const bleList = useSelector((state) => state.bleReducer.BLEList);
  const status = useSelector((state) => state.bleReducer.status);
  const connectedDevice = useSelector(
    (state) => state.bleReducer.connectedDevice,
  );
  const connectHandler = (device) => {
    dispatch(actionCreators.connectDevice(device));
  };
  const error_toast = useSelector((state) => state.bleReducer.error_toast);

  const disconnectHandler = (device) => {
    dispatch(actionCreators.disconnectDevice(device));
  };
  const refreshComponent = () => {
    forceUpdate();
  };

  useEffect(() => {
    if (error_toast) {
      toastComponent.showToastError(t('toast_warning'), t('disconected_error'));
    }
  }, [error_toast]);


  useEffect(() => {
    if (status == constants.STATUS_CONNECTED) {
      props.setVisible(false);
    }
  }, [status]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const enable = await SystemSetting.isLocationEnabled()
      if (status == constants.STATUS_SCANNING && bleList.length == 0 && enable) {
        toastComponent.showToastInfo(t('check_ble'))
      }
    }, 15000);
    if (status != constants.STATUS_SCANNING || bleList.length != 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [status, bleList]);

  const goToDisabled = () => {
    if (Platform.OS === 'android') {
      setIsDisabled(true)
      setTimeout(function () { setIsDisabled(false) }, 15000);
    }
  }

  const refreshList = () => {
    dispatch(actionCreators.deleteBleList())
    dispatch(actionCreators.startScan())
    goToDisabled()
  }

  const CloseIcon = (props) => <Icon {...props} name="close-outline" />;
  const RefreshIcon = (props) => <Icon {...props} name="refresh-outline" />;

  return (
    <Layout>
      <Modal
        supportedOrientations={['portrait', 'landscape']}
        onBackdropPress={() => props.setVisible(false)}
        style={styles.modal}
        backdropStyle={styles.backdrop}
        visible={props.visible}>
        <View style={styles.container}>
          <View style={styles.haeder}>
            <View>
              <Text category="s1" appearance="hint">
                {t('Available_Devices')}
              </Text>
              <View style={styles.status_text}>
                {status !== constants.STATUS_DISCONNECTED &&
                  status !== constants.STATUS_CONNECTED && (
                    <Spinner status="info" size="tiny" />
                  )}
                <Text
                  style={styles.pr_5}
                  status={
                    status !== constants.STATUS_DISCONNECTED ? 'info' : 'basic'
                  }
                  category="s2">
                  {t(status)}
                  {status !== constants.STATUS_DISCONNECTED &&
                    status !== constants.STATUS_CONNECTED && (
                      <Text category="s2" status="info">
                        ...
                      </Text>
                    )}
                </Text>
              </View>
            </View>
            <View
              style={{
                position: 'relative',
                zIndex: 2,
                right: 0,
                marginTop: -45,
                marginRight: -14,
              }}>
              <Button
                size="small"
                status="info"
                style={styles.close_button}
                accessoryLeft={CloseIcon}
                onPress={() => props.setVisible(false)}
              />
            </View>
          </View>
          <Divider />
          <View
            style={
              screenOrientation === constants.SCREEN_LANDSCAPE
                ? styles.landscape_content
                : styles.normal_content
            }>
            <ErrorBoundary refreshComponent={refreshComponent} modal={true}>
              <BleList
                disconnectDevice={disconnectHandler}
                connectDevice={connectHandler}
                status={status}
                connectedDevice={connectedDevice}
                bleList={bleList}
                navigation={props.navigation}
                setVisible={props.setVisible}
              />
            </ErrorBoundary>
          </View>
        </View>
      </Modal>
    </Layout>
  );
};
const styles = StyleSheet.create({
  modal: {
    borderRadius: 15,
    backgroundColor: 'white',
    width: '95%',
  },
  container: {
    flex: 1,
  },
  haeder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  normal_content: {
    flex: 1,
    minHeight: 450,
  },
  landscape_content: {
    flex: 1,
    minHeight: 200,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  status_text: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pr_5: {
    paddingLeft: 5,
  },
  close_button: {
    borderRadius: 30,
    width: 20,
    height: 20,
  },
});
