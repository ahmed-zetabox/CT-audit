
import React from 'react';
import {Text,View,Image,StyleSheet} from 'react-native'
import img from "../assets/img/info.png"
 const styles = StyleSheet.create({
    base: {
      flexDirection: 'row',
      height: 60,
      width: '90%',
      borderRadius: 6,
      backgroundColor:  "white",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 6
    },
    borderLeft: {
      borderLeftWidth: 5,
      borderLeftColor:  "#87CEFA"
    },
    iconContainer: {
      paddingHorizontal: 14,
      justifyContent: 'center',
      alignItems: 'center'
    },
    icon: {
      width: 20,
      height: 20
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center'
    },
    closeButtonContainer: {
      paddingHorizontal: 14,
      alignItems: 'center',
      justifyContent: 'center'
    },
    closeIcon: {
      width: 9,
      height: 9
    },
    text1: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 3
    },
    text2: {
      fontSize: 8,
      color: "#979797"
    }
  })

  const baseStyle = [
    styles.base,
    styles.borderLeft,
  ];
  
  export const toastConfig = {
    'any_custom_type': (internalState) => (
      <View style={baseStyle}>
      <View style={styles.iconContainer}>
      <Image style={styles.icon} source={img} resizeMode='contain' />
      </View>
      <View style={styles.contentContainer}>
          <View>
            <Text style={styles.text1}  >
              {internalState.text1}
            </Text>
          </View>
          <View>
            <Text style={styles.text2} >
              {internalState.text2}
            </Text>
          </View>
      </View>
    </View>
    ),
  
  }

  