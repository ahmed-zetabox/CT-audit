import React, {useState, useEffect, useCallback} from 'react';
import {View, Dimensions, StyleSheet, ToastAndroid} from 'react-native';
import {Divider, Text, Button, Icon, Modal} from '@ui-kitten/components';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import ProgramingView from './ProgramingView';
import DateTimePrograming from './DateTimePrograming';
import ToastComponent from '../components/toastComponent';
import {filterCharacteristics, decoder} from '../components/Common_functions';
import Loader from './Load';
import {Buffer} from 'buffer';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {ScrollView} from 'react-native-gesture-handler';
import * as constants from '../config/constants';
import {ConfirmationPopup} from './ConfirmationPopup';
import * as actionCreators from '../store/actions/index';

export default Programtion = () => {
  const [, updateState] = useState();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const systemStatus = useSelector((state) => state.appReducer.systemStatus);
  const [autoHourModalVisible, setAutoHourModalVisible] = useState(false);
  const forceUpdate = useCallback(() => updateState({}), []);
  // const [date, setDate] = useState(new Date());
  const [dateDevice, setDateDevice] = useState();
  const [Load, setLoad] = useState(true);
  const characteristics = useSelector(
    (state) => state.bleReducer.connectedService2Characteristics,
  );
  const isParamsEdited = useSelector(
    (state) => state.appReducer.isParamsEdited,
  );
  const isParamsProgrammingEdited = useSelector(
    (state) => state.appReducer.isParamsProgrammingEdited,
  );
  const isParamsSimpleSettingsEdited = useSelector(
    (state) => state.appReducer.isParamsSimpleSettingsEdited,
  );
  useFocusEffect(
    React.useCallback(() => {
      if (characteristics.length > 0) {
        const res = filterCharacteristics(characteristics, '7900').monitor(
          (error, res) => {
            if (res) {
              const newDate = new Date(decoder(res.value, '32LE') * 1000);
              newDate.setTime(
                newDate.getTime() + newDate.getTimezoneOffset() * 60 * 1000,
              );
              console.log(
                'notif Time',
                new Date(decoder(res.value, '32LE') * 1000),
              );
              setDateDevice(newDate);
            }
          },
        );
        return () => {
          res.remove();
        };
      }
    }, [characteristics]),
  );

  const [t, i18n] = useTranslation();
  const defaultHour = new Date().setHours(0, 0, 0, 0);

  const setConfirmationModal = (data) => {
    dispatch(
      actionCreators.toggleIsParamsEdited({
        status: constants.CLDW_PARAMS_STATUS_Edited,
        path: isParamsEdited.path,
      }),
    );
  };
  const setConfirmationProgrammingModal = (data) => {
    dispatch(
      actionCreators.toggleIsParamsProgrammingEdited({
        status: constants.CLDW_PARAMS_STATUS_Edited,
        path: isParamsProgrammingEdited.path,
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
    dispatch(
      actionCreators.toggleIsParamsProgrammingEdited({
        status: constants.CLDW_PARAMS_STATUS_Clear,
        path: isParamsProgrammingEdited.path,
      }),
    );
    dispatch(
      actionCreators.toggleIsParamsSimpleSettingsEdited({
        status: constants.CLDW_PARAMS_STATUS_Clear,
        path: isParamsSimpleSettingsEdited.path,
      }),
    );
    navigation.navigate(isParamsEdited.path);
  };
  const setCancelConfirmationProgrammingModal = () => {
    dispatch(
      actionCreators.toggleIsParamsEdited({
        status: constants.CLDW_PARAMS_STATUS_Clear,
        path: isParamsEdited.path,
      }),
    );
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
    navigation.navigate(isParamsProgrammingEdited.path);
  };
  const [Program, setProgram] = useState({
    production: {
      0: {time: defaultHour, checked: false},
      1: {time: defaultHour, checked: false},
      2: {time: defaultHour, checked: false},
      3: {time: defaultHour, checked: false},
      4: {time: defaultHour, checked: false},
      5: {time: defaultHour, checked: false},
      6: {time: defaultHour, checked: false},
    },
    recharge: {
      0: {time: defaultHour, checked: false},
      1: {time: defaultHour, checked: false},
      2: {time: defaultHour, checked: false},
      3: {time: defaultHour, checked: false},
      4: {time: defaultHour, checked: false},
      5: {time: defaultHour, checked: false},
      6: {time: defaultHour, checked: false},
    },
  });

  const onChangeCheckBox = (type, day, value, edited = true) => {
    const a = {...Program};
    a[type][day].checked = value;
    setProgram(a);
    edited && setConfirmationModal();
  };

  const onChangeDate = (val, edited = true) => {
    setDateDevice(val);
    edited && setConfirmationProgrammingModal();
  };

  const onChangeTime = (type, day, value, edited = true) => {
    const a = {...Program};
    a[type][day].time = value;
    setProgram(a);
    edited && setConfirmationProgrammingModal();
  };

  const send = async () => {
    setLoad(true);

    //time UNIX programing Date/Heur
    // const newDate = new Date(dateDevice);
    // console.log("dateDevice",dateDevice);
    // newDate.setTime(
    //   newDate.getTime() - newDate.getTimezoneOffset() * 60 * 1000,
    // );
    // let data = Math.floor(newDate / 1000);
    // const buf = Buffer.allocUnsafe(4);
    // buf.writeInt32LE(data);

    //buffer to set Time of Days
    var timeRecharge = '';
    var timeProduc = '';
    //bin: set status of checbox
    let binProd = '';
    let binRech = '';
    Object.keys(Program.production).map(function (key, index) {
      binProd += Program.production[key].checked === true ? '1' : '0';
      timeProduc +=
        new Date(Program.production[key].time)
          .getHours()
          .toString(16)
          .padStart(2, '0') +
        new Date(Program.production[key].time)
          .getMinutes()
          .toString(16)
          .padStart(2, '0');
    });
    Object.keys(Program.recharge).map(function (key, index) {
      binRech += Program.recharge[key].checked === true ? '1' : '0';
      timeRecharge +=
        new Date(Program.recharge[key].time)
          .getHours()
          .toString(16)
          .padStart(2, '0') +
        new Date(Program.recharge[key].time)
          .getMinutes()
          .toString(16)
          .padStart(2, '0');
    });

    const HEXBuf = new Buffer(timeProduc, 'hex');
    const HEXBuf2 = new Buffer(timeRecharge, 'hex');
    const HEXBufbinProd = new Buffer(
      parseInt(binProd + '0', 2)
        .toString(16)
        .padStart(2, '0'),
      'hex',
    );
    const HEXBufbinRech = new Buffer(
      parseInt(binRech + '0', 2)
        .toString(16)
        .padStart(2, '0'),
      'hex',
    );

    await filterCharacteristics(characteristics, '7a01').writeWithResponse(
      HEXBuf.toString('base64'),
    );

    await filterCharacteristics(characteristics, '7a03').writeWithResponse(
      HEXBuf2.toString('base64'),
    );
    await filterCharacteristics(characteristics, '7a00').writeWithResponse(
      HEXBufbinProd.toString('base64'),
    );

    await filterCharacteristics(characteristics, '7a02').writeWithResponse(
      HEXBufbinRech.toString('base64'),
    );
    getDateHour(filterCharacteristics(characteristics, '7900'));

    // const res3 = await filterCharacteristics(
    //   characteristics,
    //   '7900',
    // ).writeWithResponse(buf.toString('base64'));

    setLoad(false);
    ToastComponent.showToastSuccess(
      t('toast_success'),
      t('superviseur_Success'),
    );
    dispatch(
      actionCreators.toggleIsParamsEdited({
        status: constants.CLDW_PARAMS_STATUS_Clear,
        path: isParamsEdited.path,
      }),
    );
  };

  const getValCheckbox = (char, Type) => {
    let obj = {...Program};
    return new Promise((resolve, reject) => {
      char
        .read()
        .then(async ({error, value}) => {
          if (error) {
            reject(false);
            console.warn('errrr', error);
          } else {
            if (value) {
              let array = decoder(value, 'bin');
              array.pop();
              await array.map((el, index) => {
                obj[Type][index].checked = el == '1' ? true : false;
              });
            }
            resolve(obj);
          }
        })
        .catch(() => reject(false));
    });
  };
  const getTime = (char, Type) => {
    const MyTime = new Date();
    var arr = [];
    let obj = {...Program};
    return new Promise((resolve, reject) => {
      char
        .read()
        .then(({value}) => {
          const ch = decoder(value, 'hex');
          for (let i = 0; i < ch.length - 1; i = i + 4) {
            arr.push([ch[i] + ch[i + 1] + ch[i + 2] + ch[i + 3]]);
          }
          return arr;
        })
        .then((arr) =>
          arr.map((el, index) => {
            obj[Type][index].time = MyTime.setHours(
              parseInt('0x' + el[0].slice(0, 2)),
              parseInt('0x' + el[0].slice(2, 4)),
            );
          }),
        )
        .catch(() => reject(false))
        .then(() => resolve(obj))
        .catch(() => reject(false));
    });
  };

  const getDateHour = (char) => {
    return new Promise((resolve, reject) => {
      char.read().then(({value}) => {
        const newDate = new Date(decoder(value, '32LE') * 1000);
        newDate.setTime(
          newDate.getTime() + newDate.getTimezoneOffset() * 60 * 1000,
        );
        setDateDevice(newDate);
        resolve(true);
      });
    }).catch(() => reject(false));
  };
  const initValues = () => {
    setLoad(true);
    if (characteristics.length > 0) {
      let Promise1 = getValCheckbox(
        filterCharacteristics(characteristics, '7a00'),
        'production',
      );
      let Promise2 = getValCheckbox(
        filterCharacteristics(characteristics, '7a02'),
        'recharge',
      );
      let Promise3 = getTime(
        filterCharacteristics(characteristics, '7a01'),
        'production',
      );
      let Promise4 = getTime(
        filterCharacteristics(characteristics, '7a03'),
        'recharge',
      );

      let Promise5 = getDateHour(
        filterCharacteristics(characteristics, '7900'),
      );

      Promise.all([Promise1, Promise2, Promise3, Promise4, Promise5])
        .then((values) => {
          if (values[3] != false) {
            setProgram(values[3]);
          }
          setLoad(false);
        })
        .catch((e) => {
          setLoad(false);
        });
    }
  };

  useFocusEffect(
    useCallback(() => {
      initValues();
      return () => null;
    }, [characteristics]),
  );

  const refreshComponent = () => {
    forceUpdate();
  };

  const sendTime = async () => {
    setLoad(true);
    //time UNIX programing Date/Heur
    const newDate = new Date(dateDevice);
    console.log('dateDevice', dateDevice);
    newDate.setTime(
      newDate.getTime() - newDate.getTimezoneOffset() * 60 * 1000,
    );
    let data = Math.floor(newDate / 1000);
    const buf = Buffer.allocUnsafe(4);
    buf.writeInt32LE(data);
    const res3 = await filterCharacteristics(
      characteristics,
      '7900',
    ).writeWithResponse(buf.toString('base64'));
    setLoad(false);
    ToastComponent.showToastSuccess(
      t('toast_success'),
      t('superviseur_Success'),
    );
    dispatch(
      actionCreators.toggleIsParamsProgrammingEdited({
        status: constants.CLDW_PARAMS_STATUS_Clear,
        path: isParamsProgrammingEdited.path,
      }),
    );
  };

  return (
    <ErrorBoundary refreshComponent={refreshComponent}>
      <View style={{flex: 1}}>
        {Load ? (
          <Loader />
        ) : (
          <ScrollView>
            <DateTimePrograming
              t={t}
              dateDevice={dateDevice}
              onChangeDate={onChangeDate}
              setConfirmationModal={setConfirmationProgrammingModal}
            />
            <Button
              style={styles.btn_submit}
              disabled={
                systemStatus !== constants.SYSTEM_STATUS_READY &&
                systemStatus !== constants.SYSTEM_STATUS_TO_CHARGE
              }
              onPress={() => setAutoHourModalVisible(true)}>
              {t('valide')}
            </Button>
            <Divider style={{height: 2, marginTop: 30, marginBottom: 10}} />
            <View
              style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              <View>
                <Text
                  style={{marginBottom: 10, marginTop: 10}}
                  category="s1"
                  appearance="hint">
                  {t('production')}
                </Text>
                <ProgramingView
                  data={Program}
                  type="production"
                  translate={t}
                  onChangeCheckBox={onChangeCheckBox}
                  onChangeTime={onChangeTime}
                />
              </View>
              <View>
                <Text
                  style={{marginBottom: 10, marginTop: 10}}
                  category="s1"
                  appearance="hint">
                  {t('Recharge')}
                </Text>
                <ProgramingView
                  data={Program}
                  type="recharge"
                  translate={t}
                  onChangeCheckBox={onChangeCheckBox}
                  onChangeTime={onChangeTime}
                />
              </View>
            </View>
            <Button style={styles.btn_submit} onPress={() => send()}>
              {t('valide')}
            </Button>
          </ScrollView>
        )}
      </View>
      <ConfirmationPopup
        action={sendTime}
        setVisible={setAutoHourModalVisible}
        visible={autoHourModalVisible}
        msg={t('confirmation_message')}
      />
      <ConfirmationPopup
        type={'nav'}
        action={setCancelConfirmationModal}
        setVisible={setConfirmationModal}
        visible={isParamsEdited.status === constants.CLDW_PARAMS_STATUS_Pending}
        msg={t('leavingConfirmation')}
      />
      {isParamsEdited.status !== constants.CLDW_PARAMS_STATUS_Pending &&
        isParamsEdited.status !== constants.CLDW_PARAMS_STATUS_Edited && (
          <ConfirmationPopup
            type={'nav'}
            action={setCancelConfirmationProgrammingModal}
            setVisible={setConfirmationProgrammingModal}
            visible={
              isParamsProgrammingEdited.status ===
              constants.CLDW_PARAMS_STATUS_Pending
            }
            msg={t('leavingConfirmation')}
          />
        )}
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  btn_submit: {
    marginTop: 25,
    marginBottom: 15,
    padding: 10,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  container_modal: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    borderRadius: 15,
    backgroundColor: 'white',
    width: '95%',
  },
  icon: {
    width: 20,
    height: 20,
  },
});
