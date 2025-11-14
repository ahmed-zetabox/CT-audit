import React from 'react';
import {
  TopNavigation,
  Divider,
  Icon,
  TopNavigationAction,
} from '@ui-kitten/components';
import {useDispatch, useSelector} from 'react-redux';
import * as actionCreators from '../store/actions/index';
import {ScanModal} from '../components/ScanModal';
import * as constants from '../config/constants';
import {Dimensions, StyleSheet, View} from 'react-native';
import LogoWhite from '../assets/img/logo-white';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

const HistoryIcon = (props) => (
  <View style={{backgroundColor: '#FFFFFF', padding: 4, borderRadius: 30}}>
    <Icon {...props} name="clock-outline" />
  </View>
);
const ScanIcon = (props, status) => {
  if (status === constants.STATUS_CONNECTED) {
    return (
      <View style={{backgroundColor: '#FFFFFF', padding: 4, borderRadius: 30}}>
        <Icon {...props} fill="#105A25" name="bluetooth-outline" />
      </View>
    );
  } else {
    return (
      <View style={{backgroundColor: '#FFFFFF', padding: 4, borderRadius: 30}}>
        <Icon {...props} name="bluetooth-outline" />
      </View>
    );
  }
};

function handleHistoryNavigation(dispatch, navigation) {
  dispatch(actionCreators.toggleIsFolderLoading(true));
  navigation.navigate('HistoryScreen');
}

export const AppTopNavigation = ({navigation}) => {
  const dispatch = useDispatch();
  const IsScanModalVisible = useSelector(
    (state) => state.appReducer.isScanModalVisible,
  );
  const status = useSelector((state) => state.bleReducer.status);
  const onLayout = () => {
    const {width} = Dimensions.get('window');
    dispatch(
      actionCreators.changeScreenOrientation(
        width > 450 ? constants.SCREEN_LANDSCAPE : constants.SCREEN_NORMAL,
      ),
    );
  };
  const setScanVisible = (data) => {
    if (status !== constants.STATUS_CONNECTED) {
      dispatch(actionCreators.clearDisconnectedDevicesFromBleList());
    }
    dispatch(actionCreators.toggleScanModalVisible(data));
  };
  const renderRightActions = () => (
    <>
      <TopNavigationAction
        onPress={() => setScanVisible(true)}
        icon={(props) => ScanIcon(props, status)}
      />
      <TopNavigationAction
        onPress={() => handleHistoryNavigation(dispatch, navigation)}
        icon={(props) => HistoryIcon(props)}
      />
    </>
  );
  const insets = useSafeAreaInsets();
  return (
    <>
      <TopNavigation
        style={{
          paddingTop: insets.top,
          backgroundColor: '#1B1D3A',
        }}
        title={(evaProps) => (
          <LogoWhite width={150} height={35} style={{resizeMode: 'contain'}} />
        )}
        onLayout={onLayout}
        accessoryRight={renderRightActions}
      />
      <ScanModal
        navigation={navigation}
        visible={IsScanModalVisible}
        setVisible={setScanVisible}
      />
      <Divider />
    </>
  );
};
const styles = StyleSheet.create({
  header_background: {
    backgroundColor: '#1B1D3A',
  },
});
