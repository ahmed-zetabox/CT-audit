import React from 'react';
import { List } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import { ErrorNoData } from './ErrorNoData';
import { BleListItem } from './BleListItem';
import * as constants from '../config/constants';
import { useTranslation } from 'react-i18next';

export const BleList = (props) => {
  const [t] = useTranslation();

  const renderItem = ({ item }) => {
    return (
      <BleListItem
        device={item}
        connectDevice={props.connectDevice}
        status={props.status}
        disconnectDevice={props.disconnectDevice}
        connectedDevice={props.connectedDevice}
        t={t}
      />
    );
  };

  return (
    <>
      { props.bleList && props.bleList.length ? (
          <View>
            <List
              style={[styles.container, styles.white_bg]}
              data={props.bleList}
              renderItem={renderItem}
            />
          </View>
        ) : (
            <ErrorNoData
              navigation={props.navigation}
              setVisible={props.setVisible}
              message={t(constants.NO_DEVICE_FOUND)}
            />
          )}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    maxHeight: 450,
  },
  white_bg: {
    backgroundColor: '#FFFFFF',
  },
});
