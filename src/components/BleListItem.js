import React from 'react';
import {Button, Icon, ListItem} from '@ui-kitten/components';
import * as constants from '../config/constants';
import {StyleSheet} from 'react-native';

export class BleListItem extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  bluetoothIcon = (props) => <Icon {...props} name="bluetooth-outline" />;
  renderItemAccessory = () => {
    if (
      this.props.status == constants.STATUS_CONNECTED &&
      this.props.connectedDevice &&
      this.props.device.id == this.props.connectedDevice.id
    ) {
      return (
        <Button
          appearance="outline"
          size="tiny"
          style={styles.connect_btn}
          onPress={() => {
            this.props.disconnectDevice(this.props.device);
          }}>
          {this.props.t('Disconnect').toString().toUpperCase()}
        </Button>
      );
    } else {
      return (
        <Button
          size="tiny"
          style={styles.connect_btn}
          disabled={
            this.props.status !== constants.STATUS_SCANNING &&
            this.props.status !== constants.STATUS_DISCONNECTED
          }
          onPress={() => this.props.connectDevice(this.props.device)}>
          {this.props.t('Connect').toString().toUpperCase()}
        </Button>
      );
    }
  };
  render() {
    return (
      <ListItem
        title={this.props.device.localName}
        description={this.props.device.id}
        accessoryLeft={this.bluetoothIcon}
        accessoryRight={this.renderItemAccessory}
      />
    );
  }
}
const styles = StyleSheet.create({
  connect_btn: {
    minWidth: 100,
  },
});
