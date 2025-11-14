import React from 'react';
import { StyleSheet, View } from 'react-native';
import NoDeviceconnected from '../assets/img/noDeviceconnected.svg';
import { Text, Layout } from '@ui-kitten/components';
import { useSelector } from 'react-redux';
import * as constants from '../config/constants';
import { useTranslation } from 'react-i18next';

export const ErrorNoDevice = (props) => {
  const { t } = useTranslation();
  const screenOrientation = useSelector(
    (state) => state.appReducer.screenOrientation,
  );
  return (
    <Layout style={styles.container}>
      <NoDeviceconnected
        width={250}
        height={screenOrientation === constants.SCREEN_LANDSCAPE ? 150 : 250}
      />
      <View style={styles.mt_20}>
        <Text category="s2" appearance="hint">
          {t('No_device')}
        </Text>
      </View>
    </Layout>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mt_20: {
    marginTop: 20,
  },
});
