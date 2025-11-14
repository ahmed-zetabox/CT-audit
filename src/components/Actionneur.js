import React from 'react';
import {List} from '@ui-kitten/components';
import {StyleSheet} from 'react-native';
import {ActionneurItem} from './ActionneurItem';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {ErrorDiagMode} from './ErrorDiagMode';
import * as constants from '../config/constants';
import Loader from './Load';
import {useFocusEffect} from '@react-navigation/native';

const Actionneur = (props) => {
  const [t] = useTranslation();
  const diagModeStatus = useSelector((state) => state.appReducer.diagMode);
  const systemStatus = useSelector((state) => state.appReducer.systemStatus);
  useFocusEffect(
    React.useCallback(() => {
      if (props.selectedIndex === 1) {
        props.onDiagModeCheckedChange(constants.DIAG_BASE64_ON);
      } else if (diagModeStatus) {
        props.onDiagModeCheckedChange(constants.DIAG_BASE64_OFF);
      }
      return () => {
        if (props.selectedIndex === 1) {
          props.onDiagModeCheckedChange(constants.DIAG_BASE64_OFF);
        }
      };
    }, [props.selectedIndex]),
  );
  const renderItem = React.useCallback(
    ({item, index}) => (
      <ActionneurItem
        item={item}
        index={index}
        toggleHandler={props.toggleHandler}
        t={t}
      />
    ),
    [props.actionneurs],
  );

  return (
    <>
      {props.isLoading ? (
        <Loader />
      ) : systemStatus !== constants.SYSTEM_STATUS_READY &&
        systemStatus !== constants.SYSTEM_STATUS_CHARGE &&
        systemStatus !== constants.SYSTEM_STATUS_TO_CHARGE &&
      systemStatus !== constants.SYSTEM_STATUS_DEFAULT? (
        <ErrorDiagMode message={'Cycle_error'} />
      ) : diagModeStatus ? (
        <List
          style={styles.white_bg}
          data={props.actionneurs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <ErrorDiagMode message={'Diag_mode_error'} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  white_bg: {
    backgroundColor: '#FFFFFF',
  },
});

export default Actionneur;
