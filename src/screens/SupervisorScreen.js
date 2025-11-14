import React from 'react';
import {Layout, Tab, TabView} from '@ui-kitten/components';
import Programtion from '../components/programtion';
import {StyleSheet} from 'react-native';
import Reglagesimple from '../components/offset';
import ModeAccesModal from '../components/modeAccessModal';
import {useSelector, useDispatch} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import * as actionCreators from '../store/actions/index';
import {useTranslation} from 'react-i18next';
import {ErrorNoDevice} from '../components/ErrorNoDevice';
import * as constants from '../config/constants';
import {ErrorServices} from '../components/ErrorServices';

export const SupervisorScreen = () => {
  const [t] = useTranslation();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const SupModal = useSelector((state) => state.supervisorReducer.SupModal);
  const servicesStatus = useSelector(
    (state) => state.bleReducer.servicesStatus,
  );
  const MaintModal = useSelector(
    (state) => state.maintenanceReducer.MaintModal,
  );
  const ColdwayModal = useSelector(
    (state) => state.coldwayReducer.ColdwayModal,
  );

  const dispatch = useDispatch();
  useFocusEffect(
    React.useCallback(() => {
      dispatch(actionCreators.fetchStorageSup());
      return () => null;
    }, []),
  );

  const connectedDevice = useSelector(
    (state) => state.bleReducer.connectedDevice,
  );

  return (
    <Layout style={{flex: 1}}>
      {SupModal || MaintModal || ColdwayModal ? (
        <>
          {connectedDevice ? (
            servicesStatus === constants.SERVICES_STATUS_SUCCESS ? (
              <TabView
                style={{flex: 1}}
                selectedIndex={selectedIndex}
                onSelect={(index) => setSelectedIndex(index)}>
                <Tab title={t('Programming')}>
                  <Programtion />
                </Tab>
                <Tab title={t('Simple_settings')}>
                  <Reglagesimple selectedIndex={selectedIndex} />
                </Tab>
              </TabView>
            ) : (
              <ErrorServices />
            )
          ) : (
            <ErrorNoDevice message={constants.NO_DATA_FOUND} />
          )}
        </>
      ) : (
        <ModeAccesModal supModal={SupModal} name={'Supervisor'} />
      )}
    </Layout>
  );
};
const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
