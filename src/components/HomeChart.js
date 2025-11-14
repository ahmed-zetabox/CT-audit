import React, {useMemo} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';
import {Divider, Icon, Text} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {LineCharte} from './LineCharte';
import Loader from './Load';

export const HomeChart = React.memo((props) => {
  const {t} = useTranslation();

  const calculateWidth = useMemo(() => {
    if (props.tempChart.length > 7) {
      return (
        Dimensions.get('window').width + 2 * Dimensions.get('window').width
      );
    } else {
      return Dimensions.get('window').width - 30;
    }
  }, [props.tempChart]);
  return (
    <View style={styles.ml_10}>
      <Text category="s1" appearance="hint">
        {t('Temperature')}
      </Text>
      <TouchableHighlight
        style={styles.expend_btn}
        underlayColor="white"
        onPress={() =>
          props.navigation.navigate('FullScreenTemp', {
            tempChart: props.tempChart,
          })
        }>
        <Icon fill="#272958" {...props} name="expand" />
      </TouchableHighlight>
      <Divider style={styles.mr_t_10} />
      {props.isChartLoading || props.isFolderLoading ? (
        <View style={{height: 150}}>
          <Loader />
        </View>
      ) : (
        <View style={{flex: 1}}>
          <LineCharte
            tempChart={props.tempChart}
            height={props.windowHeight > 640 && 200}
            isTempInterVisible={true}
            isTempAmbVisible={true}
            FormaX="HH"
            label="temperature"
            color="#272958"
            lineColor="#272958"
            width={calculateWidth}
          />
        </View>
      )}
    </View>
  );
});
const styles = StyleSheet.create({
  expend_btn: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderColor: '#272958',
    borderWidth: 1,
    zIndex: 2,
    right: 0,
    top: -5,
    width: 25,
    height: 25,
  },
  ml_10: {
    marginLeft: -10,
  },
  text_w: {
    width: 150,
    paddingBottom: 10,
  },
  mr_t_10: {
    marginTop: 10,
  },
});
