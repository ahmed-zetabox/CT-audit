import React, {useEffect, useState} from 'react';
import {Layout, Tab, TabView, Text} from '@ui-kitten/components';
import {StyleSheet, Platform} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ModeAccesModal from '../components/modeAccessModal';
import Parameters from '../components/parameters';
import GlobalParameters from '../components/globalParameters';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import * as actionCreators from '../store/actions/index';
import {useTranslation} from 'react-i18next';
import Actionneur from '../components/Actionneur';
import {ErrorNoDevice} from '../components/ErrorNoDevice';
import Loader from '../components/Load';
import * as constants from '../config/constants';
import {ErrorServices} from '../components/ErrorServices';
import {
  changeIntervalToRead,
  ConvertAndSaveData,
  decoder,
  filterCharacteristics,
  initialIndex,
  saveParemetre,
  setIntervalForRead,
} from '../components/Common_functions';
import {setDataParamtr} from '../store/actions/coldwayAction';
import {UpdateSoftware} from '../components/UpdateSoftware';
import {MaintenanceNotifyState} from '../store/actions/maintenanceAction';

export const MaintenanceScreen = (props) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const status = useSelector((state) => state.bleReducer.status);
  const MaintModal = useSelector(
    (state) => state.maintenanceReducer.MaintModal,
  );
  useSelector((state) => state.maintenanceReducer.Maintenance_Notify);
  const ColdwayModal = useSelector(
    (state) => state.coldwayReducer.ColdwayModal,
  );
  const parametreColdway = useSelector(
    (state) => state.coldwayReducer.parametreColdway,
  );
  const servicesStatus = useSelector(
    (state) => state.bleReducer.servicesStatus,
  );
  const characteristics = useSelector(
    (state) => state.bleReducer.connectedService1Characteristics,
  );
  const diagModeStatus = useSelector((state) => state.appReducer.diagMode);
  const [isLoading, setIsLoading] = useState(true);
  const [isWifiLoading, setIsWifiLoading] = useState(true);
  const characteristics2 = useSelector(
    (state) => state.bleReducer.connectedService2Characteristics,
  );
  const defaultSettings = useSelector(
    (state) => state.maintenanceReducer.defaultSetting,
  );
  const coldwayIsLoding = useSelector(
    (state) => state.coldwayReducer.coldwayIsLoding,
  );

  const IbatNotif = useSelector((state) => state.maintenanceReducer.IbatNotif);
  const BatNotif = useSelector((state) => state.maintenanceReducer.BatNotif);
  const IfnoNotif = useSelector((state) => state.maintenanceReducer.IfnoNotif);
  const isParametersLoading = useSelector(
    (state) => state.appReducer.isParametersLoading,
  );

  const [actionneurs, setActionneur] = useState([
    {
      id: '1',
      title: 'relais2',
      value: false,
      extra: {},
    },
    {
      id: '2',
      title: 'Electrovanne',
      value: false,
      extra: {},
    },
    {
      id: '3',
      title: 'vcond',
      value: false,
      extra: {},
    },
    {
      id: '4',
      title: 'Chauffage',
      value: false,
      extra: {},
    },
    {
      id: '5',
      title: 'vreact',
      value: false,
      extra: {},
    },
    {
      id: '6',
      title: 'vevap',
      value: false,
      extra: {},
    },
  ]);
  let coldwayParem = [];

  const onDiagModeCheckedChange = async (diagValue) => {
    if (characteristics.length) {
      setIsLoading(true);
      const value = filterCharacteristics(characteristics, '7500');
      const result = await value.writeWithResponse(diagValue);
      setIsLoading(false);
      return result;
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      dispatch(actionCreators.fetchStorageMaint());
      return () => null;
    }, []),
  );
  useFocusEffect(
    React.useCallback(() => {
      if (diagModeStatus) {
        setIsLoading(true);
        resetActionneur();
        setIsLoading(false);
      }
      return resetActionneur();
    }, [diagModeStatus]),
  );

  useFocusEffect(
    React.useCallback(() => {
      console.log(
        'BatNotif&&IfnoNotif&&IbatNotif',
        BatNotif,
        IfnoNotif,
        IbatNotif,
      );
      if (
        characteristics2.length > 0 &&
        (MaintModal || ColdwayModal) &&
        coldwayIsLoding &&
        selectedIndex == 2 &&
        BatNotif &&
        IfnoNotif &&
        IbatNotif &&
        !isParametersLoading
      ) {
        if (coldwayParem.length == 0) {
          dispatch(setDataParamtr([]));
          initialIndex();
          notify = readParametrList();
        }

        if (notify) {
          return () => {
            console.log('im in end of notif'), notify.remove();
          };
        } else {
          null;
        }
      }
    }, [
      characteristics2,
      MaintModal,
      ColdwayModal,
      coldwayIsLoding,
      selectedIndex,
      BatNotif,
      IbatNotif,
      IfnoNotif,
      isParametersLoading,
    ]),
  );

  //lecture des parametre clodway
  const readParametrList = () => {
    dispatch(MaintenanceNotifyState(false));
    //lecture du nombre de paramètres total de menu coldway
    let nbrParametre;
    filterCharacteristics(characteristics2, '7c00')
      .read()
      .then(({value}) => {
        nbrParametre = decoder(value, 'dec');
      });
    //Réception par Notify changment de valeurs des paramètres du menu coldway
    const value = filterCharacteristics(characteristics2, '7c02');
    const notify = value.monitor((error, result) => {
      if (error) {
        dispatch(MaintenanceNotifyState(true));
        console.log('error', error);
      } else {
        coldwayParem = coldwayParem.concat(
          saveParemetre(decoder(result.value, 'hex'), coldwayParem.length),
        );
        console.log('Maintenance params received ', coldwayParem.length);

        changeIntervalToRead(nbrParametre, characteristics2);
        if (coldwayParem.length == nbrParametre) {
          dispatch(
            setDataParamtr(ConvertAndSaveData(coldwayParem, defaultSettings)),
          );
          notify.remove();
          coldwayParem = [];
          dispatch(MaintenanceNotifyState(true));
        }
      }
    });
    setIntervalForRead(characteristics2, decoder('08' + '00', 'hexToBase64'));
    return notify;
  };
  const resetActionneur = () => {
    actionneurs.map((item, index) => {
      if (item.value) {
        toggleHandler(false, index);
      }
    });
  };
  const toggleHandler = (value, index) => {
    const acts = [...actionneurs];
    acts[index].value = value;
    const binValue = acts
      .map((x) => (x.value ? 1 : 0))
      .reverse()
      .join('');
    const hexValue = decoder(binValue, 'binToHex');
    const base64Value = decoder(
      hexValue.length > 1 ? hexValue : hexValue.padStart(2, '0'),
      'hexToBase64',
    );
    setActionneur(acts);
    filterCharacteristics(characteristics, '7503').writeWithResponse(
      base64Value,
    );
  };
  const onAccessPointChange = async (accessPointValue) => {
    if (characteristics2.length) {
      const value = filterCharacteristics(characteristics2, '7d00');
      const result = await value.writeWithResponse(accessPointValue);
      return result;
    }
  };
  const renderTabTitle = (props, text) => (
    <Text
      {...props}
      numberOfLines={1}
      style={{...props.style, textAlign: 'center'}}>
      {text}
    </Text>
  );

  const connectedDevice = useSelector(
    (state) => state.bleReducer.connectedDevice,
  );
  useEffect(() => {
    status !== constants.STATUS_CONNECTED && navigation.navigate('Home');
  }, [status]);
  return (
    <Layout style={styles.container}>
      {MaintModal || ColdwayModal ? (
        <>
          {connectedDevice ? (
            servicesStatus === constants.SERVICES_STATUS_SUCCESS ? (
              <TabView
                selectedIndex={selectedIndex}
                onSelect={(index) => setSelectedIndex(index)}
                style={styles.container}>
                <Tab title={(props) => renderTabTitle(props, t('param'))}>
                  <Parameters selectedIndex={selectedIndex} />
                </Tab>
                <Tab title={(props) => renderTabTitle(props, t('Actuators'))}>
                  <Actionneur
                    isLoading={isLoading}
                    navigation={props.navigation}
                    actionneurs={actionneurs}
                    toggleHandler={toggleHandler}
                    selectedIndex={selectedIndex}
                    onDiagModeCheckedChange={onDiagModeCheckedChange}
                  />
                </Tab>
                <Tab title={(props) => renderTabTitle(props, t('gparam'))}>
                  {parametreColdway.length > 0 && !isParametersLoading ? (
                    <GlobalParameters data={parametreColdway} />
                  ) : (
                    <Loader />
                  )}
                </Tab>
                {Platform.OS === constants.PLATFORM_ANDROID && (
                  <Tab title={(props) => renderTabTitle(props, t('software'))}>
                    <UpdateSoftware
                      selectedIndex={selectedIndex}
                      onAccessPointChange={onAccessPointChange}
                      isWifiLoading={isWifiLoading}
                      connectedDevice={connectedDevice}
                      setIsWifiLoading={setIsWifiLoading}
                    />
                  </Tab>
                )}
              </TabView>
            ) : (
              <ErrorServices />
            )
          ) : (
            <ErrorNoDevice message={constants.NO_DATA_FOUND} />
          )}
        </>
      ) : (
        <ModeAccesModal supModal={MaintModal} name={'Maintenance'} />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textBtn: {
    textDecorationLine: 'underline',
    fontSize: 13,
    color: '#912045',
  },
  tabContainer: {
    paddingLeft: 20,
  },
  tabView: {
    backgroundColor: 'white',
  },

  item: {
    fontSize: 20,
  },
  table: {
    // paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'space-around',
  },
  textStyling: {
    fontSize: 12,
    color: '#1B1D3A',
  },
});
