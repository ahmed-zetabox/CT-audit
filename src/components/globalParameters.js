import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {CldwParamsList} from '../components/CldwParamsList';
import ExportImportView from './ExportImportFile';
import {Layout} from '@ui-kitten/components';
import toastComponent from './toastComponent';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {Buffer} from 'buffer';
import {filterCharacteristics, decoder, setValue} from './Common_functions';
import Loader from './Load';
import ModalConfirmation from './ModalConfrimation';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import * as constants from '../config/constants';
import {ConfirmationPopup} from './ConfirmationPopup';
import * as actionCreators from '../store/actions/index';

export default GlobalParameters = (props) => {
  const [, updateState] = useState();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const forceUpdate = useCallback(() => updateState({}), []);
  const [parameters, setParameters] = useState();
  const [Declencher, setDeclencher] = useState(null);
  const [nbrParametre, setnbrParametre] = useState(0);
  const [sendOfdata, setSendOfdata] = useState(false);
  const [Count, setCount] = useState(0);
  const [LoaderSendData, setLoaderSendData] = useState(false);
  const [refIsnotExist, setRefIsnotExist] = useState([]);
  const [success, setSuccess] = useState(false);
  const [visible, setVisible] = useState(false);
  const [imortIsLoading, setImortIsLoading] = useState(false);
  const isParamsEdited = useSelector(
    (state) => state.appReducer.isParamsEdited,
  );
  const globalSetting = useSelector(
    (state) => state.maintenanceReducer.globalSetting,
  );
  const defaultSettings = useSelector(
    (state) => state.maintenanceReducer.defaultSetting,
  );
  const IsFocused = useIsFocused();
  const [t] = useTranslation();
  const parametreColdway = useSelector(
    (state) => state.coldwayReducer.parametreColdway,
  );
  const characteristics2 = useSelector(
    (state) => state.bleReducer.connectedService2Characteristics,
  );

  const getTitel = (ref) => {
    let res;
    defaultSettings.map((defaultSetting) => {
      if (ref == defaultSetting.ref) {
        res = defaultSetting.nomSetting;
      }
    });
    return res;
  };

  useEffect(() => {
    if (refIsnotExist.length > 0 && props.selectedIndex == 2 && IsFocused) {
      toastComponent.showToastInfo(t('common:New_params', {refIsnotExist}));
    }
  }, [IsFocused, props.selectedIndex]);

  const HandlerValue = (value) => {
    let res = value;
    parameters.map((el) => {
      if (value == el.ref) {
        res = el.value;
      }
    });
    return res;
  };

  const getUnit = (ref) => {
    let res;
    defaultSettings.map((defaultSetting) => {
      if (ref == defaultSetting.ref) {
        res = defaultSetting.unite;
      }
    });
    return res;
  };

  const csvDataToObject = (inputValue) => {
    const array = [];
    const arr = refIsnotExist;
    inputValue.map((settingValue) => {
      if (!getTitel(settingValue.ref)) {
        arr.push(settingValue.ref);
      }
      array.push({
        ref: settingValue.ref,
        titel: getTitel(settingValue.ref)
          ? getTitel(settingValue.ref)
          : settingValue.ref,
        value: settingValue.value,
        unit: getUnit(settingValue.ref),
      });
    });
    setRefIsnotExist(arr);
    return array;
  };

  useEffect(() => {
    if (globalSetting.length != 0) {
      setParameters(csvDataToObject(globalSetting));
    }
  }, [globalSetting]);

  useEffect(() => {
    if (success) {
      toastComponent.showToastSuccess(t('toast_success'), t('message_success'));
    }
  }, [success]);

  useEffect(() => {
    setParameters(csvDataToObject(props.data));
    filterCharacteristics(characteristics2, '7c00')
      .read()
      .then(({value}) => {
        setnbrParametre(decoder(value, 'dec'));
      });
  }, []);

  const restaurer = () => {
    setParameters(csvDataToObject(parametreColdway));
    toastComponent.showToastSuccess(
      t('toast_success'),
      t('Restauration_succes'),
    );
    dispatch(
      actionCreators.toggleIsParamsEdited({
        status: constants.CLDW_PARAMS_STATUS_Clear,
        path: isParamsEdited.path,
      }),
    );
  };

  const sendData = async () => {
    setSendOfdata(true);
    setSuccess(false);
    setLoaderSendData(true);
    var count = 4;
    var buf = Buffer.allocUnsafe(20);
    buf.writeUInt8(0x08, 1);
    buf.writeUInt8(0x00, 2);
    for (let i = Count; i < Count + 8; i++) {
      try {
        buf.writeInt16LE(
          setValue(parameters[i].ref, parameters[i].value, defaultSettings),
          count,
        );
        count += 2;
      } catch (err) {
        console.log('err sendData', err);
      }
    }
    setCount(Count + 8);
    await filterCharacteristics(characteristics2, '7c02').writeWithResponse(
      buf.toString('base64'),
    );
    let res = await filterCharacteristics(
      characteristics2,
      '7c03',
    ).writeWithResponse('AQ==');
    setDeclencher(1);

    dispatch(
      actionCreators.toggleIsParamsEdited({
        status: constants.CLDW_PARAMS_STATUS_Clear,
        path: isParamsEdited.path,
      }),
    );
  };

  useEffect(() => {
    if (sendOfdata) {
      const subscription = filterCharacteristics(
        characteristics2,
        '7c03',
      ).monitor((error, res) => {
        if (res) {
          setDeclencher(decoder(res.value, 'dec'));
        }
        if (error) {
          console.log('mian die');
        }
      });
      if (Declencher) {
        sendRestOfData(Declencher);
      }
      if (subscription && nbrParametre < Count) {
        return () => {
          subscription.remove();
          setSendOfdata(false);
          setCount(0);
        };
      }
    }
  }, [Declencher, sendOfdata]);

  const sendRestOfData = async (val) => {
    var nb = nbrParametre % 8;
    if (nbrParametre > Count && val != 1) {
      var count = 4;
      var buf = Buffer.allocUnsafe(20);
      buf.writeUInt8(
        nbrParametre - Count < 8 ? '00'.substr(0, 2) + nb : 0x08,
        1,
      );
      buf.writeInt8('00'.substr(0, 2) + Count, 2);
      for (let i = Count; i < Count + 8; i++) {
        try {
          buf.writeInt16LE(
            setValue(parameters[i].ref, parameters[i].value, defaultSettings),
            count,
          );
          count += 2;
        } catch (err) {
          console.log('err sendRestOfData', err);
        }
      }
      setCount(Count + 8);
      await filterCharacteristics(characteristics2, '7c02').writeWithResponse(
        buf.toString('base64'),
      );
      const res = await filterCharacteristics(
        characteristics2,
        '7c03',
      ).writeWithResponse('AQ==');
      setDeclencher(1);
    }
    if (nbrParametre < Count && val == 3) {
      setSuccess(true);
      setLoaderSendData(false);
    }
  };
  const setCancelConfirmationModal = () => {
    dispatch(
      actionCreators.toggleIsParamsEdited({
        status: constants.CLDW_PARAMS_STATUS_Clear,
        path: isParamsEdited.path,
      }),
    );
    navigation.navigate(isParamsEdited.path);
  };
  const setConfirmationModal = (data) => {
    dispatch(
      actionCreators.toggleIsParamsEdited({
        status: constants.CLDW_PARAMS_STATUS_Edited,
        path: isParamsEdited.path,
      }),
    );
  };
  return (
    <Layout style={styles.container}>
      {LoaderSendData || imortIsLoading ? (
        <Loader />
      ) : (
        <>
          <ModalConfirmation
            message={t('confirmation_message')}
            visible={visible}
            setVisible={(value) => {
              setVisible(value);
            }}
            onPress={sendData}
          />
          <CldwParamsList
            refIsnotExist={refIsnotExist}
            editable={false}
            data={parameters}
            screen={'maintenance'}
            HandlerValue={HandlerValue}
          />
          <ExportImportView
            onSend={() => setVisible(true)}
            setConfirmationModal={setConfirmationModal}
            imortIsLoading={(value) => setImortIsLoading(value)}
            restaurer={restaurer}
            data={parameters}
          />
          <ConfirmationPopup
            type={'nav'}
            action={setCancelConfirmationModal}
            setVisible={setConfirmationModal}
            visible={
              isParamsEdited.status === constants.CLDW_PARAMS_STATUS_Pending
            }
            msg={t('leavingConfirmation')}
          />
        </>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
