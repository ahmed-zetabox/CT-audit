import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import ProgressCircle from 'react-native-progress-circle';

export const HomeTemp = React.memo((props) => {
  const { t } = useTranslation();
  return (
    <View
      style={[
        styles.text_title,
        props.windowHeight > 640 && styles.text_title_cnd,
      ]}>
      <View style={styles.item_center}>
        <Text category="s1" appearance="hint">
          {t('Box_temp')}
        </Text>
        <Text category="h5" style={styles.pt_20}>
          {props.convertedTempCaisse}
        </Text>
      </View>
      <View style={styles.item_center}>
        <Text category="s1" appearance="hint">
          {t('Level_gauge')}
        </Text>
        <View style={styles.pt_20}>
          <ProgressCircle
            percent={props.niveauJauge}
            radius={47}
            borderWidth={6}
            color="#3399FF"
            shadowColor="#e7e7e7"
            bgColor="#fff">
            <Text category="s1" style={{ fontSize: 20 }}>
              {`${props.niveauJauge}%`}
            </Text>
          </ProgressCircle>
        </View>
      </View>
      <View style={styles.item_center}>
        <Text category="s1" appearance="hint">
          {t('OrderT')}
        </Text>
        <Text category="h5" style={styles.pt_20}>
          {props.convertedTempConsigne}
        </Text>
      </View>
    </View>
  );
});
const styles = StyleSheet.create({
  text_title: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text_title_cnd: {
    marginTop: 20,
    marginBottom: 10,
  },
  header_clr: {
    color: '#969696',
  },
  pt_20: {
    paddingTop: 20,
  },
  mt_20: {
    marginTop: 20,
  },
  mb_10: {
    marginBottom: 10,
  },
  item_center: {
    alignItems: 'center',
  },
});
