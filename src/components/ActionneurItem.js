import React from 'react';
import {ListItem, Text, Toggle} from '@ui-kitten/components';

export class ActionneurItem extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  renderTitle = () => {
    return <Text numberOfLines={1}>{this.props.t(this.props.item.title)}</Text>;
  };

  renderItemAccessory = (props) => {
    return (
      <Toggle
        size="tiny"
        checked={props.item.value}
        onChange={(check) => props.toggleHandler(check, props.index)}
      />
    );
  };

  render() {
    return (
      <ListItem
        title={this.renderTitle}
        accessoryRight={this.renderItemAccessory(this.props)}
      />
    );
  }
}
