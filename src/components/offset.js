import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Divider,
  Input,
  Text,
  Layout,
  Radio,
  RadioGroup,
  Button,
  Icon,
  Tooltip,
} from '@ui-kitten/components';
import {useDispatch, useSelector} from 'react-redux';
import * as constants from '../config/constants';
import {useTranslation} from 'react-i18next';
import {
  toFahrenheit,
  toCelsius,
  filterCharacteristics,
  decoder,
  saveParemetre,
  getValue,
} from './Common_functions';
import ToastComponent from '../components/toastComponent';
import {Buffer} from 'buffer';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import Loader from './Load';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import * as actionCreators from '../store/actions/index';
import {ConfirmationPopup} from './ConfirmationPopup';

export default Reglagesimple = (props) => {
  const [, updateState] = useState();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const forceUpdate = useCallback(() => updateState({}), []);
  const [selected, setSelected] = useState(0);
  const [unitTempselected, setunitTempselected] = useState(0);
  const [temp, setTemp] = useState();
  const [tempIsValid, setTempIsValid] = useState(true);
  const [basesIsValid, setBasesIsValid] = useState(true);
  const [hauteIsValid, setHauteIsValid] = useState(true);
  const [tempTooltip, setTempTooltip] = useState(false);
  const [basesTooltip, setBasesTooltip] = useState(false);
  const [hauteTooltip, setHauteTooltip] = useState(false);
  const [consiMax, setConsiMax] = useState();
  const [consiMin, setConsiMin] = useState();
  const [baseMax, setBaseMax] = useState();
  const [baseMin, setBaseMin] = useState();
  const [hautMax, setHautMax] = useState();
  const [hautMin, setHautMin] = useState();
  const [haute, setHaute] = useState();
  const [base, setBase] = useState();
  const [automate, setAutomate] = useState(null);
  const [Loading, setLoading] = useState(false);
  const isParamsSimpleSettingsEdited = useSelector(
    (state) => state.appReducer.isParamsSimpleSettingsEdited,
  );
  const isParamsEdited = useSelector(
    (state) => state.appReducer.isParamsEdited,
  );
  const isParamsProgrammingEdited = useSelector(
    (state) => state.appReducer.isParamsProgrammingEdited,
  );
  const screenOrientation = useSelector(
    (state) => state.appReducer.screenOrientation,
  );
  const characteristics = useSelector(
    (state) => state.bleReducer.connectedService2Characteristics,
  );
  const defaultSettings = useSelector(
    (state) => state.maintenanceReducer.defaultSetting,
  );
  const parametreColdway = useSelector(
    (state) => state.coldwayReducer.parametreColdway,
  );
  const characteristics2 = useSelector(
    (state) => state.bleReducer.connectedService2Characteristics,
  );

  const [windowHeight, setWindowHeight] = useState(
    Dimensions.get('window').height,
  );
  const [t] = useTranslation();

  const setConfirmationModal = (data) => {
    dispatch(
      actionCreators.toggleIsParamsSimpleSettingsEdited({
        status: constants.CLDW_PARAMS_STATUS_Edited,
        path: isParamsSimpleSettingsEdited.path,
      }),
    );
  };
  const setCancelConfirmationModal = () => {
    dispatch(
      actionCreators.toggleIsParamsSimpleSettingsEdited({
        status: constants.CLDW_PARAMS_STATUS_Clear,
        path: isParamsSimpleSettingsEdited.path,
      }),
    );
    dispatch(
      actionCreators.toggleIsParamsProgrammingEdited({
        status: constants.CLDW_PARAMS_STATUS_Clear,
        path: isParamsProgrammingEdited.path,
      }),
    );
    dispatch(
      actionCreators.toggleIsParamsEdited({
        status: constants.CLDW_PARAMS_STATUS_Clear,
        path: isParamsEdited.path,
      }),
    );
    navigation.navigate(isParamsSimpleSettingsEdited.path);
  };
  const initValues = async (characteristics) => {
    let commingUnit;
    var consiMaxMinPromis;
    setLoading(true);

    if (characteristics2.length > 0) {
      await filterCharacteristics(characteristics2, '7c01')
        .writeWithResponse(
          decoder('02' + decoder(52, 'decToHex'), 'hexToBase64'),
        )
        .then((writeResult) => {
          setTimeout(function () {
            let consiMaxMin;
            consiMaxMinPromis = filterCharacteristics(characteristics2, '7c02')
              .read()
              .then((result) => {
                consiMaxMin = saveParemetre(decoder(result.value, 'hex'), 52);
                setConsiMin(
                  commingUnit === 1
                    ? toFahrenheit(
                        getValue(
                          consiMaxMin[0].ref,
                          consiMaxMin[0].value,
                          defaultSettings,
                        ),
                      ).toFixed(1)
                    : getValue(
                        consiMaxMin[0].ref,
                        consiMaxMin[0].value,
                        defaultSettings,
                      ),
                );
                setConsiMax(
                  commingUnit === 1
                    ? toFahrenheit(
                        getValue(
                          consiMaxMin[1].ref,
                          consiMaxMin[1].value,
                          defaultSettings,
                        ),
                      ).toFixed(1)
                    : getValue(
                        consiMaxMin[1].ref,
                        consiMaxMin[1].value,
                        defaultSettings,
                      ),
                );
              });
          }, 2000);
        });
    }

    if (characteristics.length > 0) {
      const resultTempUniti = await filterCharacteristics(
        characteristics,
        '7b00',
      ).read();
      commingUnit = decoder(resultTempUniti.value, 'dec');
      setunitTempselected(commingUnit);

      const resultTemp = await filterCharacteristics(
        characteristics,
        '7b01',
      ).read();
      setTemp(
        commingUnit === 0
          ? (decoder(resultTemp.value, '16LE') * 0.1).toFixed(1)
          : toFahrenheit(decoder(resultTemp.value, '16LE') * 0.1).toFixed(1),
      );
      const resultBase = await filterCharacteristics(
        characteristics,
        '7b02',
      ).read();
      setBase(
        commingUnit === 0
          ? (decoder(resultBase.value, '16LE') * 0.1).toFixed(1)
          : toFahrenheit(decoder(resultBase.value, '16LE') * 0.1).toFixed(1),
      );
      const resultHaute = await filterCharacteristics(
        characteristics,
        '7b03',
      ).read();
      setHaute(
        commingUnit === 0
          ? (decoder(resultHaute.value, '16LE') * 0.1).toFixed(1)
          : toFahrenheit(decoder(resultHaute.value, '16LE') * 0.1).toFixed(1),
      );
      const resultSelected = await filterCharacteristics(
        characteristics,
        '7b04',
      ).read();
      setSelected(decoder(resultSelected.value, 'dec'));

      Promise.all([
        resultSelected,
        resultHaute,
        resultBase,
        resultTemp,
        resultTempUniti,
        consiMaxMinPromis,
      ])
        .then(() => setLoading(false))
        .catch((e) => {
          console.log('err', e), setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   console.log("consiMin",consiMin);
  // }, [consiMin])

  // useEffect(() => {
  //   console.log("consiMax",consiMax);
  // }, [consiMax])

  useEffect(() => {
    if (automate == 3) {
      ToastComponent.showToastSuccess(t('toast_success'), t('message_success'));
    } else if (automate == 4) {
      ToastComponent.showToastError(t('toast_error'), t('message_fail'));
    }
  }, [automate]);

  useEffect(() => {
    setWindowHeight(Dimensions.get('window').height);
  }, [screenOrientation]);

  useEffect(() => {
    if (temp) {
      setBaseMax(temp);
      setHautMin(temp);
    }
  }, [temp]);

  useEffect(() => {
    setBaseMin(
      unitTempselected === 1
        ? toFahrenheit(getMin('P58')).toFixed(1)
        : getMin('P58'),
    );
    setHautMax(
      unitTempselected === 1
        ? toFahrenheit(getMax('P57')).toFixed(1)
        : getMax('P57'),
    );
  }, [unitTempselected]);

  useEffect(() => {
    if (temp) {
      setTemp(
        unitTempselected === 1
          ? toFahrenheit(temp).toFixed(1)
          : toCelsius(temp).toFixed(1),
      );
    }
    if (haute) {
      setHaute(
        unitTempselected === 1
          ? toFahrenheit(haute).toFixed(1)
          : toCelsius(haute).toFixed(1),
      );
    }
    if (base) {
      setBase(
        unitTempselected === 1
          ? toFahrenheit(base).toFixed(1)
          : toCelsius(base).toFixed(1),
      );
      if (consiMax) {
        setConsiMax(
          unitTempselected === 1
            ? toFahrenheit(consiMax).toFixed(1)
            : toCelsius(consiMax).toFixed(1),
        );
      }
      if (consiMin) {
        setConsiMin(
          unitTempselected === 1
            ? toFahrenheit(consiMin).toFixed(1)
            : toCelsius(consiMin).toFixed(1),
        );
      }
      if (hautMin) {
        setHautMin(
          unitTempselected === 1
            ? toFahrenheit(hautMin).toFixed(1)
            : toCelsius(hautMin).toFixed(1),
        );
      }
      if (baseMax) {
        setBaseMax(
          unitTempselected === 1
            ? toFahrenheit(baseMax).toFixed(1)
            : toCelsius(baseMax).toFixed(1),
        );
      }
    }
  }, [unitTempselected]);

  const checkInputs = () => {
    if (
      !temp ||
      !haute ||
      !base ||
      !tempIsValid ||
      !basesIsValid ||
      !hauteIsValid
    ) {
      ToastComponent.showToastError(
        t('toast_error'),
        t('message_capture_error'),
      );
      return false;
    } else {
      return true;
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (props.selectedIndex == 1) {
        initValues(characteristics);
      }
      return () => null;
    }, [characteristics, props.selectedIndex]),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (characteristics.length > 0) {
        const val = filterCharacteristics(characteristics, '7b06').monitor(
          (error, res) => {
            if (res) {
              setAutomate(decoder(res.value, 'dec'));
            }
          },
        );
        return () => val.remove();
      }
    }, [characteristics]),
  );

  const send = async () => {
    if (checkInputs()) {
      setLoading(true);
      let unitToSend = unitTempselected;
      const bufTemp = Buffer.allocUnsafe(2);
      const bufHaute = Buffer.allocUnsafe(2);
      const bufBase = Buffer.allocUnsafe(2);
      bufTemp.writeInt16LE(
        unitTempselected === 0
          ? parseFloat(temp).toFixed(1) * 10
          : toCelsius(temp).toFixed(1) * 10,
      );
      bufBase.writeInt16LE(
        unitTempselected === 0
          ? parseFloat(base).toFixed(1) * 10
          : toCelsius(base).toFixed(1) * 10,
      );
      bufHaute.writeInt16LE(
        unitTempselected === 0
          ? parseFloat(haute).toFixed(1) * 10
          : toCelsius(haute).toFixed(1) * 10,
      );
      const saveUnit = await filterCharacteristics(
        characteristics,
        '7b00',
      ).writeWithResponse(
        decoder(unitToSend == 1 ? '01' : '00', 'hexToBase64'),
      );
      const saveTemp = await filterCharacteristics(characteristics, '7b01')
        .writeWithResponse(bufTemp.toString('base64'))
        .then((value) => {});
      const saveBasse = await filterCharacteristics(characteristics, '7b02')
        .writeWithResponse(bufBase.toString('base64'))
        .then((value) => {});
      const saveHaute = await filterCharacteristics(characteristics, '7b03')
        .writeWithResponse(bufHaute.toString('base64'))
        .then((value) => {});
      const saveTempSelct = await filterCharacteristics(
        characteristics,
        '7b04',
      ).writeWithResponse(decoder(selected == 1 ? '01' : '00', 'hexToBase64'));
      const saveAuto = await filterCharacteristics(
        characteristics,
        '7b06',
      ).writeWithResponse('AQ==');
      setAutomate(1);
      dispatch(
        actionCreators.toggleIsParamsSimpleSettingsEdited({
          status: constants.CLDW_PARAMS_STATUS_Clear,
          path: isParamsSimpleSettingsEdited.path,
        }),
      );
      Promise.all([
        saveAuto,
        saveTempSelct,
        saveHaute,
        saveBasse,
        saveTemp,
        saveUnit,
      ])
        .then(() => setLoading(false))
        .catch((e) => {
          console.log('errorAuto', e), setLoading(false);
        });
    }
  };

  const renderUnit = (props) => {
    return (
      <Text
        category="p2"
        appearance="hint"
        style={!props && {color: '#c53030'}}>
        {unitTempselected === 0 ? '°C' : '°F'}
      </Text>
    );
  };

  const unitChangeHandler = (index) => {
    setunitTempselected(index);
    setConfirmationModal();
  };
  const refreshComponent = () => {
    forceUpdate();
  };

  useEffect(() => {
    setBasesIsValid(base != undefined ? isValide(base, temp, baseMin) : true);
    setHauteIsValid(haute != undefined ? isValide(haute, hautMax, temp) : true);
  }, [temp]);

  const getcoldwayParam = (ref) => {
    let value;
    parametreColdway.map((parametreCold) => {
      if (ref == parametreCold.ref) {
        value = parametreCold.value;
      }
    });
    return value;
  };

  const isValide = (value, max, min) => {
    let result;
    const regex = new RegExp(/^[+-]?\d+(\.\d+)?$/);
    result =
      parseFloat(value) >= parseFloat(min) &&
      parseFloat(value) <= parseFloat(max) &&
      regex.test(value);
    return result;
  };

  const getMax = (ref) => {
    let max;
    defaultSettings.map((defaultSetting) => {
      if (defaultSetting.ref == ref) {
        max = isNaN(defaultSetting.maxValue)
          ? getcoldwayParam(defaultSetting.maxValue)
          : defaultSetting.maxValue;
      }
    });
    return max;
  };

  const getMin = (ref) => {
    let min;
    defaultSettings.map((defaultSetting) => {
      if (defaultSetting.ref == ref) {
        min = isNaN(defaultSetting.minValue)
          ? getcoldwayParam(defaultSetting.minValue)
          : defaultSetting.minValue;
      }
    });
    return min;
  };

  const getComment = (ref) => {
    let comment;
    defaultSettings.map((defaultSetting) => {
      if (defaultSetting.ref == ref) {
        comment = defaultSetting.comment;
      }
    });
    return comment;
  };

  const inputTempconsigne = () => {
    const max = consiMax;
    const min = consiMin;
    return (
      <TouchableOpacity
        onPressIn={() => setTempTooltip(true)}
        onPressOut={() => setTempTooltip(false)}
        style={{
          alignItems: 'center',
          marginVertical: 5,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text>{t('Deposit_temp')}</Text>
        <Input
          accessoryRight={renderUnit}
          style={{width: 100}}
          onBlur={() =>
            temp != undefined && setTempIsValid(isValide(temp, max, min))
          }
          value={temp && temp.toString()}
          status={!tempIsValid && 'danger'}
          textStyle={!tempIsValid && {color: '#c53030'}}
          onChangeText={(nextValue) => {
            setTemp(nextValue);
            setConfirmationModal();
          }}
          keyboardType={'default'}
        />
      </TouchableOpacity>
    );
  };

  const inputAlarmeBasse = () => {
    const max = baseMax;
    const min = baseMin;
    return (
      <TouchableOpacity
        onPressIn={() => setBasesTooltip(true)}
        onPressOut={() => setBasesTooltip(false)}
        style={{
          alignItems: 'center',
          marginVertical: 5,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text>{t('Low_alarm')}</Text>
        <Input
          style={{width: 100}}
          onBlur={() =>
            base != undefined && setBasesIsValid(isValide(base, max, min))
          }
          accessoryRight={renderUnit}
          value={base && base.toString()}
          status={!basesIsValid && 'danger'}
          textStyle={!basesIsValid && {color: '#c53030'}}
          onChangeText={(nextValue) => {
            setBase(nextValue);
            setConfirmationModal();
          }}
          keyboardType={'default'}
        />
      </TouchableOpacity>
    );
  };

  const inputAlarmeHaute = () => {
    const max = hautMax;
    const min = hautMin;
    return (
      <TouchableOpacity
        onPressIn={() => setHauteTooltip(true)}
        onPressOut={() => setHauteTooltip(false)}
        style={{
          alignItems: 'center',
          marginVertical: 5,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text>{t('High_alarm')}</Text>
        <Input
          style={{width: 100}}
          onBlur={() =>
            haute != undefined && setHauteIsValid(isValide(haute, max, min))
          }
          accessoryRight={renderUnit}
          value={haute && haute.toString()}
          status={!hauteIsValid && 'danger'}
          textStyle={!hauteIsValid && {color: '#c53030'}}
          onChangeText={(nextValue) => {
            setHaute(nextValue);
            setConfirmationModal();
          }}
          keyboardType={'default'}
        />
      </TouchableOpacity>
    );
  };

  const ErrorMsg = () => {
    return (
      <View style={styles.errorMsg}>
        <Icon style={styles.errorMsgIcon} fill="#c53030" name="info-outline" />
        <Text style={styles.errorMsgTxt}>{t('Error_saisie')}</Text>
      </View>
    );
  };
  return (
    <ErrorBoundary refreshComponent={refreshComponent}>
      {Loading ? (
        <Loader />
      ) : (
        <ScrollView style={{paddingBottom: 30}}>
          <Layout
            style={{
              height:
                screenOrientation === constants.SCREEN_LANDSCAPE
                  ? windowHeight + (windowHeight * 3) / 4
                  : windowHeight,
            }}>
            <View style={{paddingTop: 20, paddingHorizontal: 20}}>
              <Text
                style={{
                  borderBottomColor: '#000',
                  borderBottomWidth: 2,
                  width: 150,
                }}
                category="s1"
                appearance="hint">
                {t('unit')}
              </Text>
              <Divider style={{height: 2}} />
              <RadioGroup
                selectedIndex={unitTempselected}
                onChange={(index) => unitChangeHandler(index)}
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <Radio>Celsius</Radio>
                <Radio>Fahrenheit</Radio>
              </RadioGroup>
            </View>
            <View>
              <View style={{paddingVertical: 20, paddingHorizontal: 20}}>
                <Text
                  style={{
                    borderBottomColor: '#000',
                    borderBottomWidth: 2,
                    width: 150,
                    paddingBottom: 10,
                  }}
                  category="s1"
                  appearance="hint">
                  {t('Cold_storage')}
                </Text>
                <Divider style={{height: 2}} />
              </View>
              <View style={{paddingHorizontal: 35}}>
                <Tooltip
                  anchor={inputTempconsigne}
                  placement="top start"
                  visible={tempTooltip}
                  onBackdropPress={() => setTempTooltip(false)}>
                  {t('MaxValue')} : {consiMax} {'\n'}
                  {t('MinValue')} : {consiMin} {'\n'}
                  {getComment('P02')}
                </Tooltip>
                {!tempIsValid && <ErrorMsg />}
                <Tooltip
                  anchor={inputAlarmeBasse}
                  placement="top start"
                  visible={basesTooltip}
                  onBackdropPress={() => setBasesTooltip(false)}>
                  {t('MaxValue')} : {baseMax} {'\n'}
                  {t('MinValue')} : {baseMin} {'\n'}
                  {getComment('P58')}
                </Tooltip>
                {!basesIsValid && <ErrorMsg />}
                <Tooltip
                  anchor={inputAlarmeHaute}
                  placement="top start"
                  visible={hauteTooltip}
                  onBackdropPress={() => setHauteTooltip(false)}>
                  {t('MaxValue')} : {hautMax} {'\n'}
                  {t('MinValue')} : {hautMin} {'\n'}
                  {getComment('P57')}
                </Tooltip>
                {!hauteIsValid && <ErrorMsg />}
                <View
                  style={{
                    alignItems: 'center',
                    marginTop: 5,
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                  }}>
                  <Text>{t('Display_temp')}</Text>
                  <RadioGroup
                    selectedIndex={selected}
                    onChange={(index) => {
                      setSelected(index);
                      setConfirmationModal();
                    }}
                    style={{flexDirection: 'row'}}>
                    <Radio>{t('real')}</Radio>
                    <Radio>{t('deposit')}</Radio>
                  </RadioGroup>
                </View>
              </View>
            </View>
            <Button style={styles.btn_submit} onPress={() => send()}>
              {t('valide')}
            </Button>
          </Layout>
        </ScrollView>
      )}
      {isParamsEdited.status !== constants.CLDW_PARAMS_STATUS_Pending &&
        isParamsEdited.status !== constants.CLDW_PARAMS_STATUS_Edited &&
        isParamsProgrammingEdited.status !==
          constants.CLDW_PARAMS_STATUS_Edited &&
        isParamsProgrammingEdited.status !==
          constants.CLDW_PARAMS_STATUS_Pending && (
          <ConfirmationPopup
            type={'nav'}
            action={setCancelConfirmationModal}
            setVisible={setConfirmationModal}
            visible={
              isParamsSimpleSettingsEdited.status ===
              constants.CLDW_PARAMS_STATUS_Pending
            }
            msg={t('leavingConfirmation')}
          />
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
    // paddingLeft: 20,
    justifyContent: 'space-around',
  },
  tabView: {
    backgroundColor: 'white',
  },

  item: {
    fontSize: 20,
  },
  table: {
    marginTop: 10,
    paddingVertical: 4,
    paddingLeft: 10,
    justifyContent: 'space-around',
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
  btn_submit: {
    marginTop: 25,
    padding: 10,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  errorMsg: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },
  errorMsgIcon: {
    width: 19,
    height: 19,
    marginRight: 5,
  },
  errorMsgTxt: {
    fontSize: 12,
    color: '#c53030',
  },
});
