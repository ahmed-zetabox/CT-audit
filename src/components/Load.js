import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Spinner} from '@ui-kitten/components';

export default Loader = () => {
  return (
    <Layout style={styles.container} level="1">
      <Spinner size="giant" />
    </Layout>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
