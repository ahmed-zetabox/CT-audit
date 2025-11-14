import React from 'react';
import {
  Button,
  Icon,
  ListItem,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Text,
  Toggle,
} from '@ui-kitten/components';
import * as constants from '../config/constants';
import {Platform, StyleSheet} from 'react-native';

export class SettingsListItem extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  renderSettingsIcon = (props) => (
    <Icon {...props} name={this.props.item.icon} />
  );
  renderSelectTitle = (text) => {
    return (
      <Text category="s2" style={{overflow: 'visible'}}>
        {text}
      </Text>
    );
  };
  renderItemAccessory = (props) => {
    console.log(props.item.type);
    switch (props.item.type) {
      case constants.SETTINGS_BLUETOOTH:
        return (
          <Toggle
            size="tiny"
            disabled={props.activeBle}
            checked={props.activeBle}
            onChange={(check) => props.onBluetoothCheckedChange(check)}
          />
        );
      case constants.SETTINGS_POSITION:
        return (
          <Toggle
            size="tiny"
            disabled={props.activeLocation}
            checked={props.activeLocation}
            onChange={(check) => props.onLocationCheckedChange(check)}
          />
        );
      case constants.SETTINGS_POSITION_GLOBAL:
        return (
          <Button onPress={props.requestLocationPermission} size="tiny">
            {props.t(props.item.extra.button_title)}
          </Button>
        );
      case constants.SETTINGS_LANGUAGE:
        return (
          <Select
            size="small"
            style={styles.lang_select}
            value={this.props.t(props.displayValue)}
            selectedIndex={props.selectedIndex}
            onSelect={(index) => props.selectLangHandler(index)}>
            {props.Languages.map((lang, index) => {
              return (
                <SelectItem
                  key={index}
                  title={() => this.renderSelectTitle(props.t(lang.value))}
                />
              );
            })}
          </Select>
        );
      case constants.SETTINGS_UNITE:
        return (
          <RadioGroup
            selectedIndex={props.activeUnite === '°C' ? 0 : 1}
            onChange={(index) => {
              this.props.unitChangeHandler(index);
            }}
            // style={{flexDirection:"row",justifyContent:"space-around"}}
          >
            <Radio>Celsius(°C)</Radio>
            <Radio>Fahrenheit(°F)</Radio>
          </RadioGroup>
        );
      case constants.SETTINGS_DIAGNOSTIC:
        return (
          <Toggle
            size="tiny"
            checked={props.diagMode}
            disabled={props.status !== constants.STATUS_CONNECTED}
            onChange={(check) => props.onDiagModeCheckedChange(check)}
          />
        );
      case constants.SETTINGS_IHM:
        return <Text>{props.ihm}</Text>;
      case constants.SETTINGS_MCU:
        return <Text>{props.mcu}</Text>;
      case constants.SETTINGS_ESP32:
        return <Text>{props.esp32}</Text>;
      case constants.SETTINGS_SERIAL:
        return <Text>{props.serial}</Text>;
    }
  };

  render() {
    return (
      <ListItem
        title={this.props.t(this.props.item.title)}
        description={this.props.t(this.props.item.description)}
        accessoryLeft={this.renderSettingsIcon}
        accessoryRight={() => this.renderItemAccessory(this.props)}
      />
    );
  }
}
const styles = StyleSheet.create({
  lang_select: {
    width: 150,
  },
});
