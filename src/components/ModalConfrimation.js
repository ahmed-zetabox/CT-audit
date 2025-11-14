import React from 'react';
import { StyleSheet, View,Dimensions } from 'react-native';
import { Button, Card, Modal, Text } from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
export default  ModalConfirmation = (props) => {
    const [t] = useTranslation();
    let width= Dimensions.get('window').width
  return (
      <Modal
        visible={props.visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => props.setVisible(false)}>
        <Card  style={{width:width-width/5}} disabled={true}>
         <Text style={{marginBottom:10}} category="p1">{props.message}</Text>
          <View style={{flexDirection:"row",justifyContent:"space-around",alignItems:"center"}}>
          <Button onPress={() => props.setVisible(false)}>
            {t("cancel")}
          </Button>
          <Button onPress={() => {
              props.setVisible(false),
              props.onPress()
              
              }}>
            {t("valide")}
          </Button>
          </View>
        </Card>
      </Modal>
  );
};

const styles = StyleSheet.create({
 
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});