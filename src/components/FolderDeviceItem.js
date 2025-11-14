import React from 'react';
import RNFetchBlob from 'rn-fetch-blob';
import {StyleSheet, TouchableOpacity, View, Platform} from 'react-native';
import {Icon, Spinner, Text} from '@ui-kitten/components';
import FolderDateItem from './FolderDateItem';
import {connect} from 'react-redux';
import moment from 'moment';
import * as constants from '../config/constants';
import * as actionCreators from '../store/actions';

class FolderDeviceItem extends React.PureComponent {
  constructor(props) {
    super(props);
    const rootPath =
      Platform.OS === constants.PLATFORM_ANDROID
        ? RNFetchBlob.fs.dirs.DownloadDir
        : RNFetchBlob.fs.dirs.DocumentDir;
    this.state = {
      folderArray: [],
      trackFolder: `${rootPath}/ColdTrace/${this.props.name}`,
      showSubFolder: false,
    };
  }
  componentDidMount() {
    this.getList();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log(
      'FolderDeviceItem componentDidUpdate ' + this.props.isDeviceLoading,
    );
    if (
      !this.props.isFolderLoading &&
      !this.props.isParametersLoading &&
      !this.props.isDeviceLoading
    ) {
      this.props.toggleDeviceLoading(true);
      this.getList();
    }
  }

  getList = async () => {
    const folders = await RNFetchBlob.fs.ls(this.state.trackFolder);
    console.log(
      'FolderDeviceItem folders size ' +
        this.state.trackFolder +
        ' ' +
        folders.length,
    );

    const sortedFolders = folders
      .filter((item) => {
        return /^\d{1,2}\-\d{1,2}\-\d{4}$/.test(item);
      })
      .sort(
        (folder1, folder2) =>
          moment(folder2, 'DD-MM-YYYY').toDate() -
          moment(folder1, 'DD-MM-YYYY').toDate(),
      );
    this.setState({folderArray: sortedFolders});
  };
  toggleSubFloder = () => {
    this.setState((state, props) => ({
      showSubFolder: !state.showSubFolder,
    }));
  };
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            this.toggleSubFloder();
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View
              style={
                this.props.connectedDevice &&
                this.props.name === this.props.connectedDevice.name
                  ? styles.green_dot
                  : styles.gray_dot
              }
            />
            <View>
              <Text category="label" style={styles.pl_7}>
                {this.props.name}
              </Text>
              {this.props.connectedDevice &&
                this.props.name === this.props.connectedDevice.name &&
                (this.props.isFolderLoading ||
                  this.props.isParametersLoading) && (
                  <View style={[styles.text_button, styles.pl_15]}>
                    <Spinner status="info" size="tiny" />
                    <Text category="s2" status="info" style={styles.pl_7}>
                      {this.props.t('Synchronizing')}...
                    </Text>
                  </View>
                )}
            </View>
          </View>
          <Icon
            style={styles.icon}
            fill="#1B1D3A"
            name={
              this.state.showSubFolder
                ? 'chevron-up-outline'
                : 'chevron-down-outline'
            }
          />
        </TouchableOpacity>
        {this.state.folderArray.map((folder, index) => (
          <FolderDateItem
            key={index}
            deviceName={this.props.name}
            toggleSubFloder={this.toggleSubFloder}
            trackFolder={this.state.trackFolder + '/' + folder}
            name={folder}
            showSubFolder={this.state.showSubFolder}
            t={this.props.t}
            navigation={this.props.navigation}
          />
        ))}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 0.7,
    borderColor: '#CBD5E0',
    backgroundColor: '#EDF2F7',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  text_button: {
    flexDirection: 'row',
  },
  pl_7: {
    paddingLeft: 7,
  },
  pl_15: {
    paddingLeft: 15,
  },
  green_dot: {
    width: 13,
    height: 13,
    backgroundColor: '#48BB78',
    borderRadius: 50,
  },
  gray_dot: {
    width: 13,
    height: 13,
    backgroundColor: '#A0AEC0',
    borderRadius: 50,
  },
});
const mapDispatchToProps = (dispatch) => ({
  toggleDeviceLoading: (data) =>
    dispatch(actionCreators.toggleIsDeviceLoading(data)),
});
const mapStateToProps = (state) => ({
  isFolderLoading: state.historiqueReducer.isFolderLoading,
  isDeviceLoading: state.historiqueReducer.isDeviceLoading,
  connectedDevice: state.bleReducer.connectedDevice,
  isChartLoading: state.historiqueReducer.isChartLoading,
  isParametersLoading: state.appReducer.isParametersLoading,
});
export default connect(mapStateToProps, mapDispatchToProps)(FolderDeviceItem);
