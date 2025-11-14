import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, TouchableHighlight } from 'react-native';
import { Divider, Text, CheckBox, Modal } from '@ui-kitten/components';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import * as constants from '../config/constants';

export default CheckBoxView = ({
  value,
  translate,
  onChangeCheckBox,
  day,
  type,
  onChangeTime,
  dayIndex,
}) => {
  const [showTime, setShowTime] = useState(false);
  const [checked, setChecked] = useState(value.checked);
  const [Time, setTime] = useState(value.time);

  const ChangeTime = (event, selectedDate) => {
    if(Platform.OS===constants.PLATFORM_ANDROID){
    setShowTime(false);
  }
    let currentDate = selectedDate || value.time;
    setTime(currentDate);
    onChangeTime(type, dayIndex, currentDate);
  };

  const ChangeChecked = (value) => {
    setChecked(value);
    onChangeCheckBox(type, dayIndex, value);
  };
  
  useEffect(() => {
    onChangeCheckBox(type, dayIndex, checked, false);
    onChangeTime(type, dayIndex, Time, false);
  }, []);

  useEffect(() => {
    setChecked(value.checked);
    setTime(value.time);
  }, [value.checked, value.time]);

  return (
    <View style={styles.container}>
      <CheckBox checked={checked} onChange={ChangeChecked}>
        {`${translate(day)}`}
      </CheckBox>

      <TouchableOpacity
        onPress={() => {
          setShowTime(true);
        }}>
        <Text style={{textDecorationLine: 'underline'}}>
          {moment(Time).format('HH:mm')}
        </Text>
      </TouchableOpacity>
      {Platform.OS===constants.PLATFORM_ANDROID && showTime && (
        <RNDateTimePicker
          mode={'time'}
          value={Time}
          onChange={ChangeTime}
          is24Hour={true}
          display="spinner"
        />
      )}
        { Platform.OS===constants.PLATFORM_IOS && (
      <Modal   supportedOrientations={['portrait', 'landscape']}
      onBackdropPress={() => setShowTime(false)}
      style={{
        borderRadius: 15,
        backgroundColor: 'white',
        width: '50%',
        flex:1,
        alignItems:"center"
        }}
        backdropStyle={styles.backdrop}
       visible={showTime}
      >
         <View style={styles.modal_container}>
         <View style={{ alignItems: 'center', width:90}}>
     <RNDateTimePicker
           mode={'time'}
          value={Time}
          onChange={ChangeTime}
          display="default"
          style={{width:100,marginLeft:35}}
        />
        </View>
            <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              padding: 10,
            }}>
               <Divider />
                     <TouchableHighlight
                     style={{padding:10}}
          activeOpacity={0.6}
          underlayColor="#DDDDDD"
          onPress={()=>setShowTime(false)}>
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
      </Modal>)}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
  },
  button: {
    margin: 2,
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
    paddingVertical:15,
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
