import React, {useCallback, useEffect, useState} from 'react';
import {Layout, Text} from '@ui-kitten/components';
import {StyleSheet, View, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSelector,useDispatch} from 'react-redux';
import {filterCharacteristics, decoder} from './Common_functions';
import Loader from './Load';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import * as constants from '../config/constants';
import {BatNotifyState,InfoNotifyState,IbatNotifyState} from '../store/actions/maintenanceAction';

export default Parameters = (props) => {
  const {t, i18n} = useTranslation();
  const Maintenance_Notify = useSelector(
    (state) => state.maintenanceReducer.Maintenance_Notify,
  );
  const characteristics = useSelector(
    (state) => state.bleReducer.connectedService1Characteristics,
  );
  const coldwayIsLoding = useSelector(
    (state) => state.coldwayReducer.coldwayIsLoding,
  );
  const dispatch = useDispatch();

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const [ubatValue, setUbatValue] = useState();
  const [battryStatus, setBattryStatus] = useState();
  const [ibatValue, setIbatValue] = useState();
  const [tempCaise, setTempCaise] = useState();
  const [tempEvap, setTempEvap] = useState();
  const [tempReacteur, setTempReacteur] = useState();
  const [tempAmbiant, setTempAmbiant] = useState();
  const [StatTCaisse, setStatCaisse] = useState();
  const [StatTEvap, setStatEvap] = useState();
  const [StatTReact, setStatReact] = useState();
  const [StatTAmbiant, setStatAmbiant] = useState();
  const [infoNumrique, setInfoNumrique] = useState({
    reserve: 1,
    contactPort: 1,
    alimUSB: 1,
    alim15V: 1,
    alimRelais: 1,
  });
  const [isLoading, setIsLoading] = useState(true);


  useFocusEffect(
      React.useCallback(() => {
        const cleanFN = async () => {
          if (characteristics.length > 0 && props.selectedIndex == 0) {
            setIsLoading(true);

            await getBattryStatus(filterCharacteristics(characteristics, '7103'));
            await getUBAT(filterCharacteristics(characteristics, '7101'));
            await getIBAT(filterCharacteristics(characteristics, '7102'));
            await getTemperatur(
                filterCharacteristics(characteristics, '7301'),
                filterCharacteristics(characteristics, '7303'),
                filterCharacteristics(characteristics, '7305'),
                filterCharacteristics(characteristics, '7307'),
                filterCharacteristics(characteristics, '7302'),
                filterCharacteristics(characteristics, '7304'),
                filterCharacteristics(characteristics, '7306'),
                filterCharacteristics(characteristics, '7308'),
            );
            await getInfoNum(filterCharacteristics(characteristics, '7502'));
            setIsLoading(false);
          }
        };
        cleanFN();
        return () => null;
      }, [characteristics, props.selectedIndex]),
  );

  useFocusEffect(
    React.useCallback(() => {
   let res
      if (characteristics.length > 0 && isLoading == false && Maintenance_Notify  && props.selectedIndex==0) {
       res = NotifTeTemperatur(
          filterCharacteristics(characteristics, '7301'),
          filterCharacteristics(characteristics, '7303'),
          filterCharacteristics(characteristics, '7305'),
          filterCharacteristics(characteristics, '7307'),
          filterCharacteristics(characteristics, '7302'),
          filterCharacteristics(characteristics, '7304'),
          filterCharacteristics(characteristics, '7306'),
          filterCharacteristics(characteristics, '7308'),
          filterCharacteristics(characteristics, '7101'),
          filterCharacteristics(characteristics, '7103'),
          filterCharacteristics(characteristics, '7102'),
          filterCharacteristics(characteristics, '7502'),
        );

        return () => {
            res.Ambiant.remove(),
            res.Caisse.remove(),
            res.Evap.remove(),
            res.React.remove(),
            res.statAmbiant.remove(),
            res.statCaise.remove(),
            res.statEvap.remove(),
            res.statReact.remove();
            res.Ubat.remove();
            res.Bat.remove(),
            res.Ibat.remove();
            res.Info.remove();
        }

      }if(props.selectedIndex!=0 && res){
        console.log('im out');
            res.Ambiant.remove(),
            res.Caisse.remove(),
            res.Evap.remove(),
            res.React.remove(),
            res.statAmbiant.remove(),
            res.statCaise.remove(),
            res.statEvap.remove(),
            res.statReact.remove();
            res.Ubat.remove();
            res.Bat.remove(),
            res.Ibat.remove();
            res.Info.remove();
      }
    }, [characteristics, isLoading,Maintenance_Notify,props.selectedIndex]),
  );

  const getUBAT = async (UBAT) => {
    const result = await UBAT.read();
    setUbatValue(decoder(result.value, 'dec') / 10);
  };

  const getBattryStatus = async (BattryStatus) => {
    const res = await BattryStatus.read();
    setBattryStatus(decoder(res.value, 'hex'));
  };

  const getIBAT = async (IBAT) => {
    const result = await IBAT.read();
    setIbatValue(decoder(result.value, '16LE'));
  };
  const NotifTeTemperatur = (
    tCaisse,
    tEvap,
    tReact,
    tAmbiant,
    StatCaise,
    StatEvap,
    StatReact,
    StatAmbiant,
    ubat,
    bat,
    ibat,
    info,
  ) => {
    dispatch(BatNotifyState(false))
    dispatch(IbatNotifyState(false))
    dispatch(InfoNotifyState(false))
    const Caisse = tCaisse.monitor((error, res) => {
      if (error) {
        console.log('error', error);
      } else if (res) {
        setTempCaise(decoder(res.value, '16LE') / 10);
        console.log('tCaisse', decoder(res.value, '16LE') / 10);
      }
    });

    const Evap = tEvap.monitor((error, res) => {
      if (error) {
        console.log('error', error);
      } else if (res) {
        setTempEvap(decoder(res.value, '16LE') / 10);
        console.log('tEvap', decoder(res.value, '16LE') / 10);
      }
    });

    const React = tReact.monitor((error, res) => {
      if (error) {
        console.log('error', error);
      } else if (res) {
        setTempReacteur(decoder(res.value, '16LE') / 10);
      }
    });

    const Ambiant = tAmbiant.monitor((error, res) => {
      if (error) {
        console.log('error', error);
      } else if (res) {
        setTempAmbiant(decoder(res.value, '16LE') / 10);
      }
    });

    const statCaise = StatCaise.monitor((error, res) => {
      if (error) {
        console.log('error', error);
      } else if (res) {
        setStatCaisse(decoder(res.value, 'dec'));
      }
    });

    const statEvap = StatEvap.monitor((error, res) => {
      if (error) {
        console.log('error', error);
      } else if (res) {
        setStatEvap(decoder(res.value, 'dec'));
      }
    });

    const statReact = StatReact.monitor((error, res) => {
      if (error) {
        console.log('error', error);
      } else if (res) {
        setStatReact(decoder(res.value, 'dec'));
      }
    });

    const Ubat = ubat.monitor((error, res) => {
      if (error) {
        console.log('error', error);
      } else {
        setUbatValue(decoder(res.value, 'dec') / 10);
      }
    });

    const Bat = bat.monitor((error, result) => {
      if (error) {
        dispatch(BatNotifyState(true))
        console.log('error', error);
      } if(result)  {

        setBattryStatus(decoder(result.value, 'hex'));
      }
    });

    const Ibat = ibat.monitor((error, res) => {
      if (error) {
        dispatch(IbatNotifyState(true))
        console.log('error', error);
      } if(res) {

        setIbatValue(decoder(res.value, '16LE'));
      }
    });

    const Info = info.monitor((error, res) => {
      if (error) {
        dispatch(InfoNotifyState(true))
        console.log('error', error);
      } if(res)  {

        let array = decoder(res.value, 'bin2');
        setInfoNumrique({
          reserve: array[0],
          contactPort: array[1],
          alimUSB: array[2],
          alim15V: array[3],
          alimRelais: array[4],
        });
      }
    });
    const statAmbiant = StatAmbiant.monitor((error, res) => {
      if (error) {
        console.log('error', error);
      } else if (res) {
        setStatAmbiant(decoder(res.value, 'dec'));
      }
    });

    return {
      Caisse,
      Evap,
      React,
      Ambiant,
      statCaise,
      statEvap,
      statReact,
      statAmbiant,
      Ubat,
      Bat,
      Ibat,
      Info,
    };
  };

  const getTemperatur = async (
    tCaisse,
    tEvap,
    tReact,
    tAmbiant,
    StatCaise,
    StatEvap,
    StatReact,
    StatAmbiant,
  ) => {
    const resultStatCaise = await StatCaise.read();
    setStatCaisse(decoder(resultStatCaise.value, 'dec'));

    const resultStatEvap = await StatEvap.read();
    setStatEvap(decoder(resultStatEvap.value, 'dec'));

    const resultStatReact = await StatReact.read();
    setStatReact(decoder(resultStatReact.value, 'dec'));

    const resultStatAmbiant = await StatAmbiant.read();
    setStatAmbiant(decoder(resultStatAmbiant.value, 'dec'));

    const resultCaisse = await tCaisse.read();
    setTempCaise(decoder(resultCaisse.value, '16LE') / 10);

    const resultEvap = await tEvap.read();
    setTempEvap(decoder(resultEvap.value, '16LE') / 10);

    const resultReact = await tReact.read();
    setTempReacteur(decoder(resultReact.value, '16LE') / 10);

    const resultAmb = await tAmbiant.read();
    setTempAmbiant(decoder(resultAmb.value, '16LE') / 10);
  };

  const getInfoNum = async (infoNum) => {
    await infoNum.read().then((res) => {
      let array = decoder(res.value, 'bin2');
      setInfoNumrique({
        reserve: array[0],
        contactPort: array[1],
        alimUSB: array[2],
        alim15V: array[3],
        alimRelais: array[4],
      });
    });
  };

  const refreshComponent = () => {
    forceUpdate();
  };
  return (
    <ErrorBoundary
      refreshComponent={refreshComponent}>
      {isLoading ? (
        <Loader />
      ) : (
        <ScrollView>
          <Layout style={styles.tabContainer}>
            <View style={{paddingLeft: 20, marginTop: 10}}>
              <Text
                style={{
                  color: '#8cb7cd',
                  width: 150,
                  paddingBottom: 10,
                  fontWeight: 'bold',
                }}
                category="h6">
                {t('voltage')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  paddingRight: 10,
                  marginTop: 10,
                  justifyContent: 'space-between',
                }}>
                <View style={{paddingLeft: 10}}>
                  <Text style={styles.LeftTextStyling}>
                    {t('Battery_status')}
                  </Text>
                  <Text style={styles.LeftTextStyling}>{t('UBAT')}</Text>
                  <Text style={styles.LeftTextStyling}>{t('Power_IBAT')}</Text>
                </View>
                <View style={{paddingRight: 10}}>
                  <Text style={styles.rightTextStyling}>
                    {battryStatus == '0b'
                      ? t('error')
                      : battryStatus == '0c'
                      ? t('In_charge')
                      : battryStatus == '0d'
                      ? t('Disconnected')
                      : battryStatus == '0e'
                      ? t('Discharged')
                      : battryStatus == '0f'
                      ? t('Charge')
                      : t('Overvoltage')}
                  </Text>
                  <Text style={styles.rightTextStyling}>
                    {ubatValue.toFixed(1) + 'V'}
                  </Text>
                  <Text style={styles.rightTextStyling}>
                    {ibatValue + 'mA'}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                borderBottomColor: '#e5e5e5',
                borderBottomWidth: 1,
                marginTop: 10,
              }}
            />
            <View style={{paddingLeft: 20, marginTop: 10}}>
              <Text
                style={{
                  color: '#8cb7cd',
                  width: 150,
                  paddingBottom: 10,
                  fontWeight: 'bold',
                }}
                category="h6">
                {t('common:Temperature')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingRight: 20,
                  paddingLeft: 10,
                }}>
                <Text style={styles.LeftTextStyling}>{t('TAIR')}</Text>
                <Text style={styles.rightTextStyling}>
                  {StatTCaisse == '0'
                    ? tempCaise.toFixed(1) + ' °C'
                    : StatTCaisse == '1'
                    ? 'CC'
                    : 'CO'}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingRight: 20,
                  paddingLeft: 10,
                }}>
                <Text style={styles.LeftTextStyling}>{t('TEVAP')}</Text>
                <Text style={styles.rightTextStyling}>
                  {StatTEvap == '0'
                    ? tempEvap.toFixed(1) + ' °C'
                    : StatTEvap == '1'
                    ? 'CC'
                    : 'CO'}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingRight: 20,
                  paddingLeft: 10,
                }}>
                <Text style={styles.LeftTextStyling}>{t('TREACT')}</Text>
                <Text style={styles.rightTextStyling}>
                  {StatTReact == '0'
                    ? tempReacteur.toFixed(1) + ' °C'
                    : StatTReact == '1'
                    ? 'CC'
                    : 'CO'}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingRight: 20,
                  paddingLeft: 10,
                }}>
                <Text style={styles.LeftTextStyling}>{t('AMBIANTE')}</Text>
                <Text style={styles.rightTextStyling}>
                  {StatTAmbiant == '0'
                    ? tempAmbiant.toFixed(1) + ' °C'
                    : StatTAmbiant == '1'
                    ? 'CC'
                    : 'CO'}
                </Text>
              </View>
            </View>
            <View
              style={{
                borderBottomColor: '#e5e5e5',
                borderBottomWidth: 1,
                marginTop: 10,
              }}
            />
            <View style={{paddingLeft: 20, marginTop: 10}}>
              <Text
                style={{
                  color: '#8cb7cd',
                  paddingBottom: 10,
                  fontWeight: 'bold',
                }}
                category="h6">
                {t('common:Informations_num')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingRight: 10,
                  marginTop: 10,
                }}>
                <View
                  style={{paddingLeft: 10, justifyContent: 'space-between'}}>
                  <Text style={styles.LeftTextStyling}>{t('Alim15V')} </Text>
                  <Text style={styles.LeftTextStyling}>{t('AlimRelais')}</Text>
                  <Text style={styles.LeftTextStyling}>{t('AlimUSB')} </Text>
                  <Text style={styles.LeftTextStyling}>
                    {t('Contact_porte')}
                  </Text>
                  <Text style={styles.LeftTextStyling}>{t('Reserve')}</Text>
                </View>
                <View style={{paddingRight: 10}}>
                  <Text style={styles.rightTextStyling}>
                    {infoNumrique.alim15V == 1 ? t('on') : t('off')}
                  </Text>
                  <Text style={styles.rightTextStyling}>
                    {infoNumrique.alimRelais == 1 ? t('on') : t('off')}
                  </Text>
                  <Text style={styles.rightTextStyling}>
                    {infoNumrique.alimUSB == 1 ? t('on') : t('off')}
                  </Text>
                  <Text style={styles.rightTextStyling}>
                    {infoNumrique.contactPort == 1 ? t('on') : t('off')}
                  </Text>
                  <Text style={styles.rightTextStyling}>
                    {infoNumrique.reserve == 1 ? t('on') : t('off')}
                  </Text>
                </View>
              </View>
            </View>
          </Layout>
        </ScrollView>
      )}
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  btn: {
    padding: 5,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOpacity: 0.8,
    elevation: 6,
    shadowRadius: 15,
    shadowOffset: {width: 1, height: 13},
  },
  tabContainer: {
    paddingVertical: 20,
    justifyContent: 'space-around',
  },
  tabView: {
    backgroundColor: 'white',
  },

  item: {
    fontSize: 20,
  },
  table: {
    paddingLeft: 10,
  },
  LeftTextStyling: {
    fontSize: 14,
    color: '#1b1e56',
    paddingBottom: 10,
  },
  rightTextStyling: {
    fontSize: 14,
    color: '#5b5d70',
    alignSelf: 'flex-end',
    paddingBottom: 10,
  },
});
