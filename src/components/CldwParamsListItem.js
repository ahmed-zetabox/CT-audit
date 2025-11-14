import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, ListItem, Text, Tooltip, Icon } from '@ui-kitten/components';


export class CldwParamsListItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      valideValue: true
    };
  }

  /*
  function input control
  input : max , min and value
  output booleen
  **/
  isValide = () => {
    const regex = new RegExp(/^[+-]?\d+(\.\d+)?$/);
    const value = this.props.value
    const max = this.props.max
    const min = this.props.min
    if (max && min) {
      this.setState({
        valideValue: value <= parseFloat(max)
          && value >= parseFloat(min) && regex.test(value)
      })
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if ((prevProps.value != this.props.value) || (prevProps.max != this.props.max) || (prevProps.min != this.props.min)) {
      this.isValide()
    }
    if (prevState.valideValue !== this.state.valideValue) {
      this.props.onValid(this.state.valideValue, this.props.refe)
    }
  }

  onChangeValue = (text) => {
    this.props.onChange(text, this.props.index)
  };

  renderTitle = (evaProps) => {
    return (
      <Text {...evaProps} numberOfLines={1} style={this.findInMap(this.props.refe) && { color: "rgb(224, 224, 224)" }}>
        {this.props.title}
      </Text>
    );
  };

  renderUnit = () => {
    return (
      <Text category="p2" appearance="hint" style={!this.state.valideValue && { color: "#c53030" }}>
        {this.props.unit === "Sans" ? null :
          this.props.unit
        }
      </Text>);
  };

  renderSelectTitle = (text) => {
    return (
      <Text category="s2" style={{ overflow: 'visible' }}>
        {text}
      </Text>
    );
  };

  findInMap = (refe) => {
    return this.props.refIsnotExist.includes(refe)
  }

  renderItemAccessory = () => {
    return (
      <View>
        {this.props.editable ? (
          <View style={styles.container}>
            <Input
              onBlur={() => this.isValide()}
              onChangeText={(text) => this.onChangeValue(text)}
              accessoryRight={this.renderUnit}
              value={this.props.value != undefined && this.props.value.toString()}
              size="small"
              disabled={this.findInMap(this.props.refe)}
              status={!this.state.valideValue && "danger"}
              textStyle={!this.state.valideValue && { color: "#c53030" }}
            />
          </View>
        ) : (
            <View style={styles.container}>
              <View style={styles.notEditableView}>
                <Text appearance="hint" category="p2" style={this.findInMap(this.props.refe) && { color: "rgb(224, 224, 224)" }}>
                  {this.props.value && this.props.value.toString() + " "}
                </Text>
                {this.renderUnit()}
              </View>
            </View>
          )}
      </View>

    );
  };

  renderTooltip = () => {
    return (
      <ListItem
        onPressIn={() => !this.findInMap(this.props.refe) && this.setState({ visible: true })}
        onPressOut={() => !this.findInMap(this.props.refe) && this.setState({ visible: false })}
        accessoryRight={this.renderItemAccessory}
        title={this.renderTitle}
      />
    );
  };

  render() {
    return (
      <>
        {this.props.screen === "coldway" ?
          <Tooltip
            anchor={this.renderTooltip}
            visible={this.state.visible}
            placement={'top start'}
            onBackdropPress={() => this.setState({ visible: false })}>
            {this.props.t("Max_value")} : {this.props.max} {"\n"}
            {this.props.t("Min_value")} : {this.props.min} {"\n"}
            {this.props.comment}
          </Tooltip> :
          <ListItem
            accessoryRight={this.renderItemAccessory}
            title={this.renderTitle}
          />
        }
        {!this.state.valideValue &&
          <View style={styles.errorMsg}>
            <Icon style={styles.errorMsgIcon} fill='#c53030' name="info-outline" />
            <Text style={styles.errorMsgTxt}>{this.props.t('Error_saisie')}</Text>
          </View>
        }
      </>
    );
  }
}
const styles = StyleSheet.create({
  container: { width: 140},
  notEditableView: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  errorMsg: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 15,
    flexDirection: "row"
  },
  errorMsgIcon: {
    width: 19,
    height: 19,
    marginRight: 5
  },
  errorMsgTxt: {
    fontSize: 12,
    color: "#c53030"
  }
});
