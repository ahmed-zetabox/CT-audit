import React from 'react';
import {Layout, Text} from '@ui-kitten/components';
import {StyleSheet, TouchableHighlight, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import ServicesErrorImg from '../assets/img/ServicesError.svg';
import * as constants from '../config/constants';
import {useDispatch, useSelector} from 'react-redux';
import * as actionCreators from '../store/actions';
export const ErrorServices = (props) => {
  const dispatch = useDispatch();
  const screenOrientation = useSelector(
    (state) => state.appReducer.screenOrientation,
  );
  const {t} = useTranslation();
  const setScanVisible = (data) => {
    dispatch(actionCreators.toggleScanModalVisible(data));
  };
  return (
    <Layout style={[styles.container, props.modal && styles.radius_40]}>
      <ServicesErrorImg
        width={250}
        height={screenOrientation === constants.SCREEN_LANDSCAPE ? 150 : 250}
      />
      <View style={styles.mt_20}>
        <Text category="s2" appearance="hint">
          {t('Services_error')}
        </Text>
      </View>
      <View style={styles.mt_20}>
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor="#DDDDDD"
          onPress={() => setScanVisible(true)}>
          <Text
            style={styles.refresh_btn}
            status="info"
            category="s2"
            appearance="hint">
            {t('Available_Devices')}
          </Text>
        </TouchableHighlight>
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
  },
});
