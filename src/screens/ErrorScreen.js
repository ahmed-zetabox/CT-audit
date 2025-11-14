import React from 'react';
import {Layout, Text} from '@ui-kitten/components';
import {StyleSheet, TouchableHighlight, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import BugFixing from '../assets/img/BugFixing.svg';
import * as constants from '../config/constants';
import {useSelector} from 'react-redux';
export const ErrorScreen = (props) => {
  const screenOrientation = useSelector(
    (state) => state.appReducer.screenOrientation,
  );
  const {t} = useTranslation();

  return (
    <Layout style={[styles.container, props.modal && styles.radius_40]}>
      <BugFixing
        width={250}
        height={screenOrientation === constants.SCREEN_LANDSCAPE ? 150 : 250}
      />
      <Text category="s2" appearance="hint">
        {t('Error_screen')}
      </Text>
      <View style={styles.mt_20}>
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor="#DDDDDD"
          onPress={props.refreshComponent}>
          <Text
            style={styles.refresh_btn}
            status="info"
            category="s2"
            appearance="hint">
            {t('Refresh')}
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
