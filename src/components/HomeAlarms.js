import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {
  Divider,
  Icon,
  List,
  ListItem,
  Text,
  Modal,
  Button,
  Spinner,
} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import Mailer from 'react-native-mail';
import * as constants from '../config/constants';
import RNFetchBlob from 'rn-fetch-blob';
import {useSelector} from 'react-redux';
import moment from 'moment';
import * as app from '../../app.json';
import { ConfirmationPopup } from './ConfirmationPopup';

export const HomeAlarms = React.memo((props) => {
  const {t} = useTranslation();
  const ihmVersion = useSelector((state) => state.appReducer.ihmVersion);
  const mcuVersion = useSelector((state) => state.appReducer.mcuVersion);
  const esp32Version = useSelector((state) => state.appReducer.esp32Version);
  const serialKeyVersion = useSelector(
    (state) => state.appReducer.serialKeyVersion,
  );
  const [visible, setVisible] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [attachment, setAttachment] = useState([]);
  useEffect(() => {
    if (props.currentCyclePath.fileName && props.currentCyclePath.fileName != constants.SERVICES_STATUS_ERROR && props.currentCyclePath.path) {
      setAttachment([
        {
          path: `${Platform.OS===constants.PLATFORM_ANDROID ? RNFetchBlob.fs.dirs.DownloadDir:RNFetchBlob.fs.dirs.DocumentDir}/ColdTrace/Config/Default_Setting/Default_parametres.txt`,
          type: 'csv',
          name: 'Default_parametres',
        },
        {
          path: props.currentCyclePath.path,
          type: 'csv',
          name: props.currentCyclePath.fileName,
        },
      ]);
    }
  }, [props.currentCyclePath]);
  const renderItem = ({item, index}) => (
    <ListItem
      onPress={() => {
        if (props.currentCyclePath.fileName) {
          [1, 2, 7].includes(item.code) && setVisible(true);
          setSelectedAlarm(item);
        }
      }}
      accessoryLeft={() => (
        <Icon style={styles.icon} fill="#000" name="bell-outline" />
      )}
      title={t(item.title)}
      accessoryRight={() => {
        if ([1, 2, 7].includes(item.code)) {
          if (
            props.currentCyclePath.fileName === constants.SERVICES_STATUS_ERROR
          )
            return (
              <Icon
                style={styles.icon}
                fill="#F56565"
                name="close-circle-outline"
              />
            );
          else if (props.currentCyclePath.fileName)
            return (
              <Icon style={styles.icon} fill="#902038" name="email-outline" />
            );
          else return <Spinner status="info" size="tiny" />;
        } else {
          return <></>;
        }
      }}
    />
  );

  const sendMAil = () => {
    Mailer.mail(
      {
        subject: `COLDTRACE –${props.deviceName}`,
        recipients: [app.email],
        body: `<p>${t('error')}: ${selectedAlarm.code}</p>
                <p>${t('date')}:${moment(selectedAlarm.date).format(
          'DD/MM/YYYY HH:MM',
        )}</p>
                   <p>Version IHM:${ihmVersion} </p>
                    <p>Version MCU:${mcuVersion} </p>
                     <p>Version ESP32:${esp32Version} </p>
                      <p>Version SERIAL KEY:${serialKeyVersion} </p>
                      <p>Version App:${app.version} </p>`,
        isHTML: true,
        attachments: attachment,
      },
      (error, event) => {
        console.log('error mail', error);
      },
    );
  };
  return (
    <View style={props.windowHeight > 640 ? styles.mt_30 : styles.mt_10}>
      <Text category="s1" appearance="hint">
        {t('Alarms')}
      </Text>
      <Divider style={styles.mt_10} />
      {props.listAlerts.length ? (
        <List
          keyExtractor={(item) => item.code}
          data={props.listAlerts}
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.mt_10}>
          <Text appearance="hint">{t('noAlerts')}</Text>
        </View>
      )}
      <ConfirmationPopup action={sendMAil} setVisible={setVisible} visible={visible} msg={t('Send_email_confirmation')}/>

    </View>
  );
});
const styles = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
  },
  container: {
    flex: 1,
  },
  mt_30: {
    marginTop: 30,
  },
  mt_10: {
    marginTop: 10,
  },
  text_w: {
    width: 150,
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
