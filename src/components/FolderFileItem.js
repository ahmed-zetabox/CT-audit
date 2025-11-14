import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, Text} from '@ui-kitten/components';
import FileViewer from 'react-native-file-viewer';
import {readFile, csvJSON} from './File_functions';
import {connect} from 'react-redux';
class FolderFileItem extends React.PureComponent {
  openFile = () => {
    FileViewer.open(this.props.trackFolder)
      .then(() => {})
      .catch((error) => {
        console.log('im in open file ERROR', error);
      });
  };
  //Get the number of props to skip when reading csv file
  getPropsNumber = () => {
    return this.props.defaultSetting.filter((item) => {
      return item.ref !== '';
    }).length;
  };

  removeDefaultFromChart = (chart) => {
    return chart.filter((item) => !item.codeAlarm);
  };
  render() {
    return (
      <>
        {this.props.showSubFolder && (
          <View style={styles.subContainer}>
            <View style={styles.button}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon
                  style={styles.icon}
                  fill="#4299E1"
                  name="file-text-outline"
                />
                <Text category="label">{this.props.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.openFile();
                }}>
                <Text style={styles.view_text} category="label">
                  {this.props.t('see')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  readFile(this.props.trackFolder).then((value) => {
                    this.props.navigation.navigate('FullScreenTemp', {
                      tempChart: this.removeDefaultFromChart(
                        csvJSON(value, this.getPropsNumber()),
                      ),
                    });
                  });
                }}>
                <Text style={styles.view_text} category="label">
                  {this.props.t('graph')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </>
    );
  }
}
const styles = StyleSheet.create({
  subContainer: {
    padding: 20,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'space-between',
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 10,
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
  view_text: {
    textDecorationLine: 'underline',
  },
  text_disabled: {
    color: '#D1D5DB',
  },
});
function mapStateToProps(state) {
  return {
    defaultSetting: state.maintenanceReducer.defaultSetting,
  };
}
export default connect(mapStateToProps)(FolderFileItem);
