import React, {useEffect, useState} from 'react';
import {Layout} from '@ui-kitten/components';
import {useFocusEffect} from '@react-navigation/native';
import {StyleSheet} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import ModeAccesModal from '../components/modeAccessModal';
import {CldwParameters} from '../components/CldwParameters';
import * as actionCreators from '../store/actions/index';
import {setDataParamtr, coldwayIsLoding} from '../store/actions/coldwayAction';
import {ErrorNoDevice} from '../components/ErrorNoDevice';
import * as constants from '../config/constants';
import {ErrorServices} from '../components/ErrorServices';
import {
  filterCharacteristics,
  decoder,
  saveParemetre,
  changeIntervalToRead,
  ConvertAndSaveData,
  setIntervalForRead,
  initialIndex,
} from '../components/Common_functions';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import {useIsFocused} from '@react-navigation/native';

export const ColdwayScreen = (navigation) => {
  const [loadData, setLoadData] = useState(true);
  const [, updateState] = useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const ColdwayModal = useSelector(
    (state) => state.coldwayReducer.ColdwayModal,
  );
  const parametreColdway = useSelector(
    (state) => state.coldwayReducer.parametreColdway,
  );
  const servicesStatus = useSelector(
    (state) => state.bleReducer.servicesStatus,
  );
  const characteristics2 = useSelector(
    (state) => state.bleReducer.connectedService2Characteristics,
  );
  const connectedDevice = useSelector(
    (state) => state.bleReducer.connectedDevice,
  );
  const defaultSettings = useSelector(
    (state) => state.maintenanceReducer.defaultSetting,
  );
  const Maintenance_Notify = useSelector(
    (state) => state.maintenanceReducer.Maintenance_Notify,
  );
  const isParametersLoading = useSelector(
    (state) => state.appReducer.isParametersLoading,
  );
  const dispatch = useDispatch();
  var coldwayParem = [];

  const IsFocused = useIsFocused();

  useFocusEffect(
    React.useCallback(() => {
      dispatch(actionCreators.fetchStorageColdway());
      return () => null;
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      let notify;
      setLoadData(true);
      if (
        characteristics2.length > 0 &&
        ColdwayModal &&
        IsFocused &&
        Maintenance_Notify &&
        !isParametersLoading
      ) {
        coldwayParem = [];
        initialIndex();
        dispatch(coldwayIsLoding(true));
        dispatch(setDataParamtr([]));
        notify = readParametrList();
      }
      if (notify) {
        return () => {
          notify.remove();
        };
      } else {
        null;
      }
    }, [
      characteristics2,
      ColdwayModal,
      IsFocused,
      Maintenance_Notify,
      isParametersLoading,
    ]),
  );

  //lecture des parametre clodway
  const readParametrList = () => {
    dispatch(coldwayIsLoding(false));
    let nbrParametre;
    //lecture du nombre de paramètres total de menu coldway
    filterCharacteristics(characteristics2, '7c00')
      .read()
      .then(({value}) => {
        nbrParametre = decoder(value, 'dec');
      });
    //Réception par Notify changment de valeurs des paramètres du menu coldway
    const value = filterCharacteristics(characteristics2, '7c02');
    const notify = value.monitor((error, result) => {
      if (error) {
        console.log('error', error);
        dispatch(coldwayIsLoding(true));
        setLoadData(false);
      } else {
        coldwayParem = coldwayParem.concat(
          saveParemetre(decoder(result.value, 'hex'), coldwayParem.length),
        );

        console.log('testTag ColdWay params received ', coldwayParem.length);
        changeIntervalToRead(nbrParametre, characteristics2);
        if (coldwayParem.length == nbrParametre) {
          console.log('testTag ColdWay all params received ');

          dispatch(
            setDataParamtr(ConvertAndSaveData(coldwayParem, defaultSettings)),
          );
          notify.remove();
          coldwayParem = [];
          setLoadData(false);
          dispatch(coldwayIsLoding(true));
        }
      }
    });
    setIntervalForRead(characteristics2, decoder('08' + '00', 'hexToBase64'));
    return notify;
  };

  const refreshComponent = () => {
    forceUpdate();
  };
  return (
    <ErrorBoundary refreshComponent={refreshComponent}>
      <Layout style={styles.container}>
        {ColdwayModal ? (
          <>
            {connectedDevice ? (
              servicesStatus === constants.SERVICES_STATUS_SUCCESS ? (
                !loadData && !isParametersLoading ? (
                  <CldwParameters data={parametreColdway} />
                ) : (
                  <Loader />
                )
              ) : (
                <ErrorServices />
              )
            ) : (
              <ErrorNoDevice message={constants.NO_DATA_FOUND} />
            )}
          </>
        ) : (
          <ModeAccesModal supModal={ColdwayModal} name={'Coldway'} />
        )}
      </Layout>
    </ErrorBoundary>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
