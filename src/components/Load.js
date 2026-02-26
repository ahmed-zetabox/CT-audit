import React, {useEffect} from 'react';
import {StyleSheet, Alert} from 'react-native';
import {Layout, Spinner, Text} from '@ui-kitten/components';

export default Loader = () => {

  
  return (
    <Layout style={styles.container} level="1">
      <Spinner size="giant" />
      <Text style={{marginTop: 20}}>Loading...</Text>
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
