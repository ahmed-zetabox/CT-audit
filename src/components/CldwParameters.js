import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Divider, Layout, Text} from '@ui-kitten/components';
import {CldwParamsList} from './CldwParamsList';
import {useTranslation} from 'react-i18next';
import ExportImportView from './ExportImportFile';
import {useDispatch, useSelector} from 'react-redux';
import toastComponent from './toastComponent';
import {filterCharacteristics, decoder, setValue} from './Common_functions';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {Buffer} from 'buffer';
import Load from './Load';
import * as actionCreators from '../store/actions/index';
import * as constants from '../config/constants';
import {ConfirmationPopup} from './ConfirmationPopup';

export const CldwParameters = (props) => {
  const [t] = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [parameters, setParameters] = useState();
  const [Declencher, setDeclencher] = useState(null);
  const [nbrParametre, setnbrParametre] = useState(0);
  const [Count, setCount] = useState(0);
  const [refIsnotExist, setRefIsnotExist] = useState([]);
  const [valide, setValide] = useState([]);
  const [sendOfdata, setSendOfdata] = useState(false);
  const [success, setSuccess] = useState(false);
  const [LoaderSendData, setLoaderSendData] = useState(false);
  const [visible, setVisible] = useState(false);
  const [imortIsLoading, setImortIsLoading] = useState(false);
  const [TempUnit, setTempUnit] = useState({
    ref: 'P25',
    value: uniteTemp && uniteTemp === '°C' ? 0 : 1,
  });
  const isParamsEdited = useSelector(
    (state) => state.appReducer.isParamsEdited,
  );
  const defaultSettings = useSelector(
    (state) => state.maintenanceReducer.defaultSetting,
  );
  const parametreColdway = useSelector(
    (state) => state.coldwayReducer.parametreColdway,
  );
  const globalSetting = useSelector(
    (state) => state.maintenanceReducer.globalSetting,
  );
  const uniteTemp = useSelector((state) => state.appReducer.unite);
  const characteristics2 = useSelector(
    (state) => state.bleReducer.connectedService2Characteristics,
  );

  useEffect(() => {
    if (globalSetting.length != 0) {
      setParameters(csvDataToObject(globalSetting));
    }
  }, [globalSetting]);

  useEffect(() => {
    setParameters(csvDataToObject(props.data));
    filterCharacteristics(characteristics2, '7c00')
      .read()
      .then(({value}) => {
        setnbrParametre(decoder(value, 'dec'));
      });
  }, []);

  useEffect(() => {
    if (success) {
      toastComponent.showToastSuccess(t('toast_success'), t('message_success'));
    }
  }, [success]);

  useEffect(() => {
    if (refIsnotExist.length > 0 && IsFocused) {
      toastComponent.showToastInfo(t('common:New_params', {refIsnotExist}));
    }
  }, [IsFocused, refIsnotExist]);

  useFocusEffect(
    React.useCallback(() => {
      let subscription;
      if (sendOfdata) {
        subscription = filterCharacteristics(characteristics2, '7c03').monitor(
          (error, res) => {
            if (res) {
              setDeclencher(decoder(res.value, 'dec'));
            }
            if (error) {
              console.log('im die');
            }
          },
        );
        if (Declencher) {
          sendRestOfData(Declencher);
        }
      }
      if (subscription && nbrParametre < Count) {
        return () => {
          setCount(0);
          setSendOfdata(false);
          subscription.remove();
        };
      }
    }, [Declencher, sendOfdata]),
  );

  //Handler values oject from child component
  const IsFocused = useIsFocused();

  //Handler values object from child component
  const inputHandler = (value, index) => {
    const para = [...parameters];
    para[index].value = value;
    setParameters(csvDataToObject(para));
    dispatch(
      actionCreators.toggleIsParamsEdited({
        status: constants.CLDW_PARAMS_STATUS_Edited,
        path: isParamsEdited.path,
      }),
    );
  };

  const setConfirmationModal = (data) => {
    dispatch(
      actionCreators.toggleIsParamsEdited({
        status: constants.CLDW_PARAMS_STATUS_Edited,
        path: isParamsEdited.path,
      }),
    );
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
  //get value with ref of intput
  //input : ref , output : value of ref from state
  const HandlerValue = (value) => {
    let res = value;
    parameters.map((el) => {
      if (value == el.ref) {
        res = el.value;
      }
    });
    return res;
  };

  //convert ref to value from defaultsettings file
  const getTitel = (ref) => {
    let res;
    defaultSettings &&
      defaultSettings.map((defaultSetting) => {
        if (ref == defaultSetting.ref) {
          res = defaultSetting.nomSetting;
        }
      });
    return res;
  };

  const getUnit = (ref) => {
    let res;
    defaultSettings &&
      defaultSettings.map((defaultSetting) => {
        if (ref == defaultSetting.ref) {
          res = defaultSetting.unite;
        }
      });
    return res;
  };

  const getMax = (ref) => {
    let res;
    defaultSettings &&
      defaultSettings.map((defaultSetting) => {
        if (ref == defaultSetting.ref) {
          res = defaultSetting.maxValue;
        }
      });
    return res;
  };

  const getMin = (ref) => {
    let res;
    defaultSettings &&
      defaultSettings.map((defaultSetting) => {
        if (ref == defaultSetting.ref) {
          res = defaultSetting.minValue;
        }
      });

    return res;
  };

  const getComment = (ref) => {
    let res;
    defaultSettings &&
      defaultSettings.map((defaultSetting) => {
        if (ref == defaultSetting.ref) {
          res = defaultSetting.comment;
        }
      });
    return res;
  };

  const getPrecisionReglage = (ref) => {
    let res;
    defaultSettings &&
      defaultSettings.map((defaultSetting) => {
        if (ref == defaultSetting.ref) {
          res = defaultSetting.précisionReglage;
        }
      });
    return res;
  };

  const csvDataToObject = (inputValue) => {
    const array = [];
    const arr = refIsnotExist;
    inputValue.map((settingValue) => {
      if (!getTitel(settingValue.ref) && arr.indexOf(settingValue.ref) === -1) {
        arr.push(settingValue.ref);
      }
      array.push({
        ref: settingValue.ref,
        titel: getTitel(settingValue.ref)
          ? getTitel(settingValue.ref)
          : settingValue.ref,
        value: settingValue.value,
        unit: getUnit(settingValue.ref),
        max: getMax(settingValue.ref),
        min: getMin(settingValue.ref),
        comment: getComment(settingValue.ref),
        precisionReglage: getPrecisionReglage(settingValue.ref),
      });
    });
    setRefIsnotExist(arr);
    return array;
  };

  const sendData = async () => {
    setSuccess(false);
    if (valide.length == 0) {
      setSendOfdata(true);
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
    } else {
      toastComponent.showToastError(
        t('ToastError_saveCldw'),
        t('messageError_saveCldw'),
      );
    }
    dispatch(
      actionCreators.toggleIsParamsEdited({
        status: constants.CLDW_PARAMS_STATUS_Clear,
        path: isParamsEdited.path,
      }),
    );
  };

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

  return (
    <Layout style={styles.container}>
      {!LoaderSendData && !imortIsLoading ? (
        <>
          <View style={styles.ph_10}>
            <View style={styles.header}>
              <Text category="s1" appearance="hint">
                {t('Parameters')}
              </Text>
            </View>
            <Divider style={styles.divider_pos} />
          </View>
          <CldwParamsList
            onValid={(array) => {
              setValide(array);
            }}
            editable={true}
            data={parameters}
            onChange={inputHandler}
            refIsnotExist={refIsnotExist}
            HandlerValue={HandlerValue}
            screen={'coldway'}
            t={t}
            TempUnit={TempUnit.value}
          />
          <ExportImportView
            screen={'coldway'}
            setConfirmationModal={setConfirmationModal}
            data={parameters}
            imortIsLoading={(value) => setImortIsLoading(value)}
            onSend={() => setVisible(true)}
            restaurer={restaurer}
          />
          <ModalConfirmation
            message={t('confirmation_message')}
            visible={visible}
            setVisible={(value) => {
              setVisible(value);
            }}
            onPress={sendData}
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
      ) : (
        <Load />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    justifyContent: 'center',
  },
  ph_10: {
    paddingHorizontal: 10,
  },
  divider_pos: {
    justifyContent: 'flex-end',
  },
});
