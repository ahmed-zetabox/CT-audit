import React from 'react';
import {Layout, Text} from '@ui-kitten/components';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import NotifyMsg from '../assets/img/notifyMsg.svg';
import * as constants from '../config/constants';
import {useSelector} from 'react-redux';
export const ErrorDiagMode = (props) => {
  const screenOrientation = useSelector(
    (state) => state.appReducer.screenOrientation,
  );
  const {t} = useTranslation();
  return (
    <Layout style={[styles.container, props.modal && styles.radius_40]}>
      <NotifyMsg
        width={250}
        height={screenOrientation === constants.SCREEN_LANDSCAPE ? 150 : 250}
      />
      <View style={styles.mt_20}>
        <Text category="s2" appearance="hint" style={{textAlign: 'center'}}>
          {t(props.message)}
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
  refresh_btn: {
    textDecorationLine: 'underline',
  },
  radius_40: {
    borderRadius: 40,
  },
  mt_20: {
    marginTop: 20,
    paddingLeft: 50,
    paddingRight: 50,
  },
});
