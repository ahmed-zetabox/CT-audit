//import liraries
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SaveFile, readFile } from './File_functions';
import { ButtonGroup, Button } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import DocumentPicker from 'react-native-document-picker';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { SetGlobalSetting } from '../store/actions/maintenanceAction';
import ToastComponent from '../components/toastComponent';
import Import from '../assets/img/icon-coldtrace-01'
import Export from '../assets/img/icon-coldtrace-02'
import Save from '../assets/img/icon-coldtrace-03'
import Restore from '../assets/img/icon-coldtrace-04'
import * as constants from '../config/constants';
// create a component
const ExportImportView = (props) => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const defaultSettings = useSelector(
    (state) => state.maintenanceReducer.defaultSetting,
  );
  const connectedDevice = useSelector(
    (state) => state.bleReducer.connectedDevice,
  );
  //convert and parse object to text separated by commas

  const ConvertToTxT = (objArray) => {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    for (var i = 0; i < array.length; i++) {
      var line = '';
      line = array[i].ref + ';' + array[i].value;
      str += line + ';' + '\r\n';
    }
    return str;
  };

  //convert text from file to json
  const ConvertTxtToJson = (string) => {
    var arrayString = string.split('\n');
    var json = [];
    for (var i = 0; i < arrayString.length; i++) {
      const arrayWord = arrayString[i].split(';');
      json.push({ ref: arrayWord[0], value: arrayWord[1] });
    }
    return json;
  };

  const exportFileFn = () => {
    ToastComponent.showToastSuccess(t('toast_success'), t('message_exported'));
    SaveFile(
      ConvertToTxT(props.data),
      `${connectedDevice.name}/parametres/`,
      `parametres-${moment().format('DD_H_mm')}.txt`,
      'utf8',
    );
  };

  const pickFile = async () => {
    props.imortIsLoading(true)
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.plainText],
      });
      let newRes = res.uri;
      if (Platform.OS === constants.PLATFORM_IOS) {
        newRes = newRes.replace('file:', '');
      };
      readFile(newRes)
        .then((result) => {
          dispatch(SetGlobalSetting(ConvertTxtToJson(result)));
        })
        .then(() => {
          props.setConfirmationModal(true);
          ToastComponent.showToastSuccess(t('toast_success'), t('message_imported'));
        })
        .catch((error) => { console.log('error', error) });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
    props.imortIsLoading(false)
  };


  return (
    <View style={styles.container}>
      <ButtonGroup appearance="outline" status="info" style={styles.button_grp}>
        <Button
          onPress={() => {
            exportFileFn();
          }}
          style={{ flex: 1, paddingBottom: 0, paddingTop: 0 }}>
          <Export />
        </Button>
        <Button
          onPress={() => {
            pickFile();
          }}
          style={{ flex: 1, paddingBottom: 0, paddingTop: 0 }}>
          <Import />
        </Button>
        <Button
          onPress={() => {
            props.restaurer();
          }}
          style={{ flex: 1, paddingBottom: 0, paddingTop: 0 }}>
          <Restore />
        </Button>
        <Button
          onPress={() => {
            props.onSend();
          }}
          style={{ flex: 1, paddingBottom: 0, paddingTop: 0 }}>
          <Save />
        </Button>
      </ButtonGroup>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    // backgroundColor: '#edf2f7',
  },
  button_grp: {
    width: '100%',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonText: { textDecorationLine: 'underline' },
});

//make this component available to the app
export default ExportImportView;
