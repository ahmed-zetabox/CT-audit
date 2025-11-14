import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Input, Button, Icon } from '@ui-kitten/components';
import { useDispatch } from 'react-redux';
import { showSupModal } from '../store/actions/supervisorAction';
import { showMaintModal } from '../store/actions/maintenanceAction';
import { showColdwayModal } from '../store/actions/coldwayAction';
import { useTranslation } from 'react-i18next';
import ToastComponent from '../components/toastComponent';

export default ModeAccesModal = (props) => {
  const [code, setCode] = useState('');
  const [disable, setDisable] = useState(true);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
 
  const AlertIcon = (props) => <Icon {...props} name="alert-circle-outline" />;

  const InputLabel = (text) => (
    <Text status="primary" category="label">
      {text}
    </Text>
  );

  // save type of password into asyncStorage to unlock pages
  const submit = async (supModal) => {
    if (code.length == 0) {
      ToastComponent.showToastError(t('toast_error'),t('Error_Empty_Field'));
    } else {
      if (props.name == 'Supervisor') {
        code === '4321'
          ? dispatch(showSupModal(!supModal, 'instant'))
          : code === '1234'
            ? dispatch(showSupModal(!supModal, 'permanant'))
            : ToastComponent.showToastError(t('toast_error'),t('Error_code'));
      } else if (props.name == 'Maintenance') {
        code === '0951'
          ? dispatch(showMaintModal(!supModal, 'instant'))
          : code === '1590'
            ? dispatch(showMaintModal(!supModal, 'permanant'))
            : ToastComponent.showToastError(t('toast_error'),t('Error_code'));
      } else if (props.name == 'Coldway') {
        code === '8366'
          ? dispatch(showColdwayModal(!supModal, 'instant'))
          : code === '6638'
            ? dispatch(showColdwayModal(!supModal, 'permanant'))
            : ToastComponent.showToastError(t('toast_error'),t('Error_code'));
      }
    }
  };


  return (
    <ScrollView
      contentContainerStyle={{ flex: 1 }}
      keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.text}>{t('Message_code')}</Text>
        {props.name == 'Supervisor' && <Text style={styles.notice}>{t('notice')}</Text>}
        <Input
          value={code}
          style={{ marginTop: 50 }}
          label={() => InputLabel(t('Password'))}
          placeholder={t('Input_code')}
          keyboardType={"number-pad"}
          secureTextEntry={true}
          captionIcon={AlertIcon}
          caption={t('Enter_password_to_access')}
          onChangeText={(text) => {
            let newText = '';
            let numbers = '0123456789';

            for (var i = 0; i < text.length; i++) {
              if (numbers.indexOf(text[i]) > -1) {
                newText = newText + text[i];
                setDisable(true);
              } else {
                // your call back function
                // alert("please enter numbers only");
                console.warn('please enter numbers only');
              }
            }
            setCode(newText);
            if (newText.length > 0) {
              setDisable(false);
            }
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Button
          //status="primary"
          disabled={disable}
          style={styles.btn_submit}
          onPress={() => submit(props.supModal)}>
          {t('Submit_code')}
        </Button>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 4,
    paddingLeft: 50,
    paddingRight: 50,

    justifyContent: 'center',
  },
  pt_10: {
    paddingTop: 10,
  },
  pt_5: {
    paddingTop: 5,
  },
  text: {
    color: '#1B1D3A',
    fontSize: 20,
  },
  notice: {
    marginTop: 20,
    color: '#1B1D3A',
    fontSize: 12,
  },
  btn_submit: {
    padding: 10,
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
