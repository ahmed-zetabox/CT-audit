import { Icon, Modal, Text, Button } from '@ui-kitten/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

export const ConfirmationPopup=(props)=>{
    const [t, i18n] = useTranslation();
    return(
<Modal
        visible={props.visible}
        style={styles.modal}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => props.setVisible(false)}>
        <View style={styles.container}>
          <View
            style={{flexDirection: 'row', padding: 20, alignItems: 'center'}}>
            <Icon style={styles.icon} fill="#F56565" name="info-outline" />
            <Text style={{padding: 5}} category="s2" appearance="hint">
              {props.msg}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              padding: 10,
            }}>
            <Button
              style={{maxWidth: 100, marginRight: 20}}
              onPress={() => props.setVisible(false)}
              size="small"
              appearance="outline">
              {t('cancel')}
            </Button>
            <Button
              style={{maxWidth: 100}}
              onPress={() => {
                props.action();
                if(!props.type)
                 props.setVisible(false);
              }}
              size="small">
              {props.type? t('leave'): t('send')}
            </Button>
          </View>
        </View>
      </Modal>
    )
}

const styles = StyleSheet.create({
    icon: {
      width: 20,
      height: 20,
    },
    container: {
      flex: 1,
    },
    backdrop: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
      borderRadius: 15,
      backgroundColor: 'white',
      width: '95%',
    },
  });