//import liraries
import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TouchableHighlight,
} from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {Text, Divider, Modal} from '@ui-kitten/components';
import * as RNLocalize from 'react-native-localize';
// import moment from 'moment';
import moment from 'moment-timezone';
import * as constants from '../config/constants';
import {useSelector} from 'react-redux';
import {PropsService} from '@ui-kitten/components/devsupport';

// create a component
const DateTimePrograming = ({
  t,
  onChangeDate,
  dateDevice,
  setConfirmationModal,
}) => {
  const [date, setDate] = useState(new Date());
  const [showHeure, setShowHeure] = useState(false);
  const [showDate, setShowdate] = useState(false);
  const systemStatus = useSelector((state) => state.appReducer.systemStatus);
  const onChange = (event, selectedDate) => {
    if (Platform.OS === constants.PLATFORM_ANDROID) {
      setShowdate(false);
      setShowHeure(false);
    }
    let currentDate = selectedDate || date;
    setDate(currentDate);
    onChangeDate(currentDate, false);
    setConfirmationModal();
  };

  useEffect(() => {
    setDate(dateDevice);
  }, [dateDevice]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.textStyle} category="s1" appearance="hint">
            {t('Hour')}
          </Text>
          <TouchableOpacity
            disabled={
              systemStatus !== constants.SYSTEM_STATUS_READY &&
              systemStatus !== constants.SYSTEM_STATUS_TO_CHARGE
            }
            onPress={() => setShowHeure(true)}
            style={styles.touchableOpacity}>
            <Text
              status={
                systemStatus !== constants.SYSTEM_STATUS_READY &&
                systemStatus !== constants.SYSTEM_STATUS_TO_CHARGE
                  ? ''
                  : 'primary'
              }
              style={styles.textStyle}
              appearance="hint"
              category="h6">
              {moment(date).format('HH:mm')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.textStyle} category="s1" appearance="hint">
            {t('Date')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowdate(true)}
            disabled={
              systemStatus !== constants.SYSTEM_STATUS_READY &&
              systemStatus !== constants.SYSTEM_STATUS_TO_CHARGE
            }
            style={styles.touchableOpacity}>
            <Text
              status={
                systemStatus !== constants.SYSTEM_STATUS_READY &&
                systemStatus !== constants.SYSTEM_STATUS_TO_CHARGE
                  ? ''
                  : 'primary'
              }
              style={styles.textStyle}
              appearance="hint"
              category="h6">
              {moment(date).tz(RNLocalize.getTimeZone()).format('DD/MM/YYYY')}
            </Text>
          </TouchableOpacity>
          {Platform.OS === constants.PLATFORM_ANDROID && showDate && (
            <RNDateTimePicker
              testID="dateTimePicker"
              timeZoneOffsetInMinutes={0}
              value={date}
              mode={'date'}
              is24Hour={true}
              display="default"
              onChange={onChange}
            />
          )}
          {Platform.OS === constants.PLATFORM_ANDROID && showHeure && (
            <RNDateTimePicker
              timeZoneOffsetInMinutes={0}
              value={date}
              mode={'time'}
              is24Hour={true}
              display="spinner"
              onChange={onChange}
            />
          )}
          {Platform.OS === constants.PLATFORM_IOS && (
            <>
              <Modal
                supportedOrientations={['portrait', 'landscape']}
                onBackdropPress={() => setShowdate(false)}
                style={{
                  borderRadius: 15,
                  backgroundColor: 'white',
                  width: '40%',
                  flex: 1,
                  alignItems: 'center',
                }}
                backdropStyle={styles.backdrop}
                visible={showDate}>
                <View style={styles.modal_container}>
                  <RNDateTimePicker
                    mode={'date'}
                    value={date}
                    onChange={onChange}
                    display="default"
                    style={{maxHeight: 450, minWidth: 90}}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      padding: 10,
                    }}>
                    <Divider />
                    <TouchableHighlight
                      style={{padding: 10}}
                      activeOpacity={0.6}
                      underlayColor="#DDDDDD"
                      onPress={() => setShowdate(false)}>
                      <Text
                        style={styles.refresh_btn}
                        status="info"
                        category="s2"
                        appearance="hint">
                        OK
                      </Text>
                    </TouchableHighlight>
                  </View>
                </View>
              </Modal>
              <Modal
                supportedOrientations={['portrait', 'landscape']}
                onBackdropPress={() => setShowHeure(false)}
                style={{
                  borderRadius: 15,
                  backgroundColor: 'white',
                  width: '35%',
                  flex: 1,
                  alignItems: 'center',
                }}
                backdropStyle={styles.backdrop}
                visible={showHeure}>
                <View style={styles.modal_container}>
                  <RNDateTimePicker
                    mode={'time'}
                    value={date}
                    onChange={onChange}
                    display="default"
                    style={{width: 100, marginLeft: 35}}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      padding: 10,
                    }}>
                    <Divider />
                    <TouchableHighlight
                      style={{padding: 10}}
                      activeOpacity={0.6}
                      underlayColor="#DDDDDD"
                      onPress={() => setShowHeure(false)}>
                      <Text
                        style={styles.refresh_btn}
                        status="info"
                        category="s2"
                        appearance="hint">
                        OK
                      </Text>
                    </TouchableHighlight>
                  </View>
                </View>
              </Modal>
            </>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.regleAuto}
        disabled={
          systemStatus !== constants.SYSTEM_STATUS_READY &&
          systemStatus !== constants.SYSTEM_STATUS_TO_CHARGE
        }
        onPress={(e) => onChange(e, new Date())}>
        <Text
          style={styles.text_underline}
          category="s2"
          appearance="hint"
          status={
            systemStatus !== constants.SYSTEM_STATUS_READY &&
            systemStatus !== constants.SYSTEM_STATUS_TO_CHARGE
              ? ''
              : 'info'
          }>
          {t('date_auto')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  content: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  section: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableOpacity: {
    marginTop: 10,
    alignItems: 'center',
  },
  textStyle: {paddingBottom: 10},
  regleAuto: {
    padding: 10,
  },
  text_underline: {
    textDecorationLine: 'underline',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal_container: {
    flex: 1,
  },
  haeder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  normal_content: {
    flex: 1,
    minHeight: 450,
  },
  close_button: {
    borderRadius: 30,
    width: 20,
    height: 20,
  },
  refresh_btn: {
    textDecorationLine: 'underline',
  },
});

//make this component available to the app
export default DateTimePrograming;
