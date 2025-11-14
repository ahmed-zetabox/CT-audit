import React, {useEffect, useState, useCallback} from 'react';
import {ScrollView, StyleSheet, Platform, View} from 'react-native';
import {
  Icon,
  TopNavigation,
  TopNavigationAction,
  Text,
  Layout,
} from '@ui-kitten/components';
import RNFetchBlob from 'rn-fetch-blob';
import {useTranslation} from 'react-i18next';
import FolderDeviceItem from '../components/FolderDeviceItem';
import * as constants from '../config/constants';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import {useDispatch, useSelector} from 'react-redux';
import * as actionCreators from '../store/actions/index';
import toastComponent from '../components/toastComponent';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// create a component
const HistoryScreen = (props) => {
  const [, updateState] = useState();
  const [listOfDird, setListOfDird] = useState([]);
  const forceUpdate = useCallback(() => updateState({}), []);
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const isFolderLoading = useSelector(
    (state) => state.historiqueReducer.isFolderLoading,
  );
  const isFileLoading = useSelector(
    (state) => state.historiqueReducer.isFileLoading,
  );
  const isChartLoading = useSelector(
    (state) => state.historiqueReducer.isChartLoading,
  );
  const status = useSelector((state) => state.bleReducer.status);
  const BackIcon = (props) => (
    <Icon fill="#FFFFFF" {...props} name="arrow-back" />
  );

  const BackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => props.navigation.goBack()}
    />
  );
  const rootPath =
    Platform.OS === constants.PLATFORM_ANDROID
      ? RNFetchBlob.fs.dirs.DownloadDir
      : RNFetchBlob.fs.dirs.DocumentDir;
  const TRACK_FOLDER = `${rootPath}/ColdTrace/`;
  const getListFolders = async () => {
    console.log('HistoryScreen getListFolders ');
    try {
      const folders = await RNFetchBlob.fs.ls(TRACK_FOLDER);
      const filtredFolder = folders.filter((item) =>
        item.includes(constants.PREFIX_BLE_NAME),
      );
      setListOfDird(filtredFolder);
    } catch (error) {
      console.log(error);
    }
  };
  const refreshComponent = () => {
    forceUpdate();
  };
  useEffect(() => {
    getListFolders();
  }, [isFolderLoading]);

  const refreshIcon = (props, status) => {
    return (
      <View style={{backgroundColor: '#FFFFFF', padding: 4, borderRadius: 30}}>
        <Icon {...props} fill="#105A25" name="refresh-outline" />
      </View>
    );
  };
  const title = () => {
    return (
      <Text category="s1" style={{color: '#FFFFFF'}}>
        {t('History')}
      </Text>
    );
  };
  const checkSyncHistory = () => {
    if (status == constants.STATUS_CONNECTED) {
      if (!isFileLoading && !isFolderLoading && !isChartLoading) {
        dispatch(actionCreators.syncHistory(t));
      } else {
        toastComponent.showToastInfo(t('syncHistory_msg'));
      }
    }
  };
  const renderRightActions = () => (
    <TopNavigationAction
      onPress={() => checkSyncHistory()}
      icon={(props) => refreshIcon(props)}
    />
  );
  const insets = useSafeAreaInsets();
  return (
    <ErrorBoundary refreshComponent={refreshComponent}>
      <Layout
        style={{
          flex: 1,
        }}
        level="3">
        <TopNavigation
          style={{
            paddingTop: insets.top,
            backgroundColor: '#1B1D3A',
          }}
          accessoryLeft={BackAction}
          title={title}
          accessoryRight={renderRightActions}
        />
        <ScrollView>
          {listOfDird.map((folderName, key) => (
            <FolderDeviceItem
              key={key}
              name={folderName}
              navigation={props.navigation}
              t={t}
            />
          ))}
        </ScrollView>
      </Layout>
    </ErrorBoundary>
  );
};

// define your styles
const styles = StyleSheet.create({
  layout: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

//make this component available to the app
export default HistoryScreen;
