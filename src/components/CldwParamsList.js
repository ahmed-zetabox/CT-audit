import React from 'react';
import { List } from '@ui-kitten/components';
import { StyleSheet, ScrollView } from 'react-native';
import { CldwParamsListItem } from './CldwParamsListItem';

export const CldwParamsList = (props) => {
  var array = []

  const arrayTest = (val, ref) => {
    const { length } = array;
    const id = length + 1;
    let found = true
    for (i = 0; i < array.length; i++) {
      if (array[i].ref === ref) {
        found = false
      }
      if (array[i].ref === ref && array[i].value != val) {
        array.splice(i, 1);
        found = false
      }
    }
    if (found && val == false) { array.push({ val, ref }) }
    props.onValid(array)
  }

  const renderItem = ({ item, index }) => {
    return (
      <CldwParamsListItem
        onValid={(val, ref) => arrayTest(val, ref)}
        onChange={props.onChange}
        refe={item.ref}
        HandlerValue={props.HandlerValue}
        title={item.titel}
        value={item.value}
        type={item.type}
        unit={item.unit}
        max={isNaN(item.max) ? props.HandlerValue(item.max) : item.max}
        min={isNaN(item.min) ? props.HandlerValue(item.min) : item.min}
        comment={item.comment}
        extra={item.extra}
        index={index}
        key={index}
        refIsnotExist={props.refIsnotExist}
        editable={props.editable}
        screen={props.screen}
        t={props.t}

      />
    );
  };

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="on-drag">
      <List
        style={[styles.l_0, styles.white_bg]}
        data={props.data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 10
  },
  l_0: {
    left: 0,
  },
  white_bg: {
    backgroundColor: '#FFFFFF',
  },
});
