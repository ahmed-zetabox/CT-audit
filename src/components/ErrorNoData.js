import React   from 'react';
import {StyleSheet, TouchableHighlight, View} from 'react-native';
import DataNotFound from '../assets/img/no_data.svg';
import {Text, Layout} from '@ui-kitten/components';
import {useSelector} from 'react-redux';
import * as constants from '../config/constants';
import {useTranslation} from 'react-i18next';

export const ErrorNoData = (props) => {
  const [t] = useTranslation();
  const screenOrientation = useSelector(
    (state) => state.appReducer.screenOrientation,
  );

  return (
    <Layout style={styles.container}>
      <DataNotFound
        width={250}
        height={screenOrientation === constants.SCREEN_LANDSCAPE ? 150 : 250}
      />
      <Text category="s2" appearance="hint">
        {props.message}
      </Text>
      <View style={styles.mt_20}>
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor="#DDDDDD"
          onPress={() => {
            props.navigation.navigate('SettingsScreen', true),
              props.setVisible(false);
          }}>
          <Text
            style={styles.refresh_btn}
            status="info"
            category="s2"
            appearance="hint">
            {t('check')}
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
    borderRadius: 40,
  },
  btn_submit: {
    padding: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  mt_20: {
    marginTop: 20,
  },
  refresh_btn: {
    textDecorationLine: 'underline',
  },
});
