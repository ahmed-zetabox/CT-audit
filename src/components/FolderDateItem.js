import React from 'react';
import RNFetchBlob from 'rn-fetch-blob';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, Layout, Spinner, Text} from '@ui-kitten/components';
import {connect} from 'react-redux';
import * as actionCreators from '../store/actions';
import * as constants from '../config/constants';
import toastComponent from './toastComponent';
import FolderFileItem from './FolderFileItem';
import moment from 'moment';
import {
  extractFormattedDateFromFileName,
  sortFileNamesInAntiChronologicalOrder,
} from './Common_functions';

class FolderDateItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      folderArray: [],
      showSubFolder: false,
      isFolderLoaded: false,
    };
  }
  componentDidMount() {
    this.getList(this.props.trackFolder);
  }

  // Restrict view redraw
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (
      this.props.deviceName !== nextProps.deviceName ||
      this.props.trackFolder !== nextProps.trackFolder ||
      this.props.name !== nextProps.name ||
      this.props.showSubFolder !== nextProps.showSubFolder ||
      this.props.t !== nextProps.t ||
      this.props.isFileLoading !== nextProps.isFileLoading ||
      this.props.isFolderLoading !== nextProps.isFolderLoading ||
      this.props.selectedTimestamp !== nextProps.selectedTimestamp ||
      this.props.connectedDevice !== nextProps.connectedDevice ||
      this.props.status !== nextProps.status ||
      this.props.recordsNum !== nextProps.recordsNum ||
      this.props.triggerListFolders !== nextProps.triggerListFolders ||
      this.props.selectedFolder !== nextProps.selectedFolder ||
      this.state.folderArray !== nextState.folderArray ||
      this.state.showSubFolder !== nextState.showSubFolder ||
      this.state.isFolderLoaded !== nextState.isFolderLoaded
    ) {
      return true;
    }

    return (
      this.props.indexRecord !== nextProps.indexRecord &&
      this.props.selectedTimestamp === this.props.name &&
      this.props.deviceName === this.props.connectedDevice.name
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      !this.props.isFileLoading &&
      this.props.selectedTimestamp === this.props.name &&
      this.props.selectedFolder === this.props.trackFolder &&
      this.props.triggerListFolders
    ) {
      this.getList(this.props.trackFolder);
    }
  }
  getList = async (TrackFolder) => {
    RNFetchBlob.fs
      .ls(TrackFolder)
      .then((files) => {
        this.props.refreshFolders(false);
        console.log(
          'FolderDateItem getList ' + TrackFolder + ' size ' + files.length,
        );
        this.setState({
          folderArray: sortFileNamesInAntiChronologicalOrder(files),
        });
      })
      .catch((error) => console.log('FolderDateItem ' + error));
  };
  getFileByDate = () => {
    this.setState(
      (state, props) => ({
        showSubFolder: !state.showSubFolder,
      }),
      () => {
        // Download temperature cycle only when there is no other download in progress
        if (
          this.props.status === constants.STATUS_CONNECTED &&
          this.props.connectedDevice &&
          this.props.deviceName === this.props.connectedDevice.name &&
          this.state.showSubFolder &&
          !this.props.isFileLoading &&
          !this.props.isFolderLoading
        ) {
          this.props.filterCycle(
            this.props.name,
            this.props.trackFolder,
            this.props.t,
          );
        } else {
          this.getList(this.props.trackFolder);
        }
      },
    );
  };
  render() {
    return (
      <Layout style={styles.layout} level="3">
        {this.props.showSubFolder && (
          <View style={styles.subContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.getFileByDate(!this.state.showSubFolder);
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {this.props.selectedTimestamp === this.props.name &&
                this.props.connectedDevice &&
                this.props.deviceName === this.props.connectedDevice.name &&
                this.props.isFileLoading ? (
                  <Spinner status="info" size="tiny" />
                ) : (
                  <Icon style={[styles.icon]} fill="#A0AEC0" name="folder" />
                )}
                <Text style={styles.ml_10} category="label">
                  {this.props.name}
                </Text>

                {this.props.selectedTimestamp === this.props.name &&
                this.props.connectedDevice &&
                this.props.deviceName === this.props.connectedDevice.name &&
                this.props.isFileLoading &&
                this.props.indexRecord > 0 &&
                this.props.recordsNum > 0 ? (
                  <Text style={styles.ml_10} category="label">
                    {this.props.indexRecord.toString()} /{' '}
                    {this.props.recordsNum.toString()}
                  </Text>
                ) : (
                  <Text />
                )}
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
              <FolderFileItem
                key={index}
                trackFolder={this.props.trackFolder + '/' + folder}
                name={folder}
                showSubFolder={this.state.showSubFolder}
                t={this.props.t}
                navigation={this.props.navigation}
              />
            ))}
          </View>
        )}
      </Layout>
    );
  }
}
const styles = StyleSheet.create({
  layout: {
    flex: 1,
  },
  subContainer: {
    padding: 15,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'space-between',
  },
  icon: {
    width: 22,
    height: 22,
  },
  mr_10: {
    marginRight: 10,
  },
  ml_10: {
    marginLeft: 10,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconUpload: {
    width: 15,
    height: 15,
    marginRight: 10,
  },
});

const mapDispatchToProps = (dispatch) => ({
  filterCycle: (timestamp, trackFolder, t) =>
    dispatch(actionCreators.filterCycle(timestamp, trackFolder, t)),
  refreshFolders: (data) => dispatch(actionCreators.triggerListFolders(data)),
});
function mapStateToProps(state) {
  return {
    isFileLoading: state.historiqueReducer.isFileLoading,
    isFolderLoading: state.historiqueReducer.isFolderLoading,
    isChartLoading: state.historiqueReducer.isChartLoading,
    selectedTimestamp: state.historiqueReducer.selectedTimestamp,
    connectedDevice: state.bleReducer.connectedDevice,
    status: state.bleReducer.status,
    recordsNum: state.historiqueReducer.recordsNum,
    indexRecord: state.historiqueReducer.indexRecord,
    triggerListFolders: state.historiqueReducer.triggerListFolders,
    selectedFolder: state.historiqueReducer.selectedFolder,
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(FolderDateItem);
