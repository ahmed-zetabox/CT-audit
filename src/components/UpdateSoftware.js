import React, { useEffect } from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import * as constants from '../config/constants';
import WifiManager from 'react-native-wifi-reborn';
import * as actionCreators from '../store/actions/index';
import Loader from './Load';
import {WebView} from 'react-native-webview';
import {useDispatch, useSelector} from 'react-redux';
import {Icon, Text} from '@ui-kitten/components';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
export const UpdateSoftware = (props) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const connectToWifi = () => {
    if (props.connectedDevice) {
      const macArray = props.connectedDevice.id.split(':');
      WifiManager.connectToProtectedSSID(
        constants.ACCESS_POINT_SSID + macArray[3] + macArray[4] + macArray[5],
        constants.ACCESS_POINT_PWD +
          macArray[0] +
          macArray[1] +
          macArray[2] +
          macArray[3] +
          macArray[4] +
          macArray[5],
        true,
      ).then(
        () => {
          props.setIsWifiLoading(false);
        },
        (error) => {
          connectToWifi();
        },
      );
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      if (props.selectedIndex === 3) {
        props.onAccessPointChange(constants.ACCESS_POINT_ON_BASE64).then(
          () => {
            connectToWifi();
          },
          () => {
            props.setIsWifiLoading(false);
          },
        );
      }
      return () => {
        if (props.selectedIndex === 3) {
          props.onAccessPointChange(constants.ACCESS_POINT_OFF_BASE64);
          props.setIsWifiLoading(true);
          dispatch(actionCreators.readESP32());
        }
      };
    }, [props.selectedIndex]),
  );

  return (
    <>
      <View
        style={{
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 4,
          padding: 4,
          backgroundColor: '#EDF2F7',
        }}>
        <Icon
          fill="#902038"
          style={{height: 28, width: 28, marginRight: 4}}
          name="alert-triangle-outline"
        />
        <Text category="s2" appearance="hint" status="info" style={{maxWidth:320}}>
          {t('update_warning')}
        </Text>
      </View>
      {props.isWifiLoading ? (
        <Loader />
      ) : (
        <WebView
          source={{uri: 'http://192.168.100.1/'}}
        />
      )}
    </>
  );
};
