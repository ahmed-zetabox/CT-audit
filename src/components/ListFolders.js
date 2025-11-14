//import liraries
import React, {useState, useEffect} from 'react';
import {TouchableOpacity, Text, StyleSheet, View, Platform} from 'react-native';
import {Layout, Icon} from '@ui-kitten/components';
import RNFetchBlob from 'rn-fetch-blob';
import {readFile} from './File_functions';
import {SetHistoryToShow} from '../store/actions/historiqueAction';
import {useDispatch, useSelector} from 'react-redux';
import {converter} from './Common_functions';
import * as constants from '../config/constants';

// create a component
const ListFolder = (props) => {
  const [show, setShow] = useState(false);
  const [listSubsFolders, setSubsFolders] = useState([]);
  const [listFile, setFile] = useState([]);
  const [index, setIndex] = useState(null);
  const dispatch = useDispatch();
  const uniteTemp = useSelector((state) => state.appReducer.unite);
  const rootPath= Platform.OS===constants.PLATFORM_ANDROID ? RNFetchBlob.fs.dirs.DownloadDir:RNFetchBlob.fs.dirs.DocumentDir;
  const TrackFolder = `${rootPath}/ColdTrace/${props.name}`;
  const getList = async () => {
    setSubsFolders(await RNFetchBlob.fs.ls(TrackFolder));
  };
  const getListFiles = async (el, key) => {
    if (key === index) {
      setIndex(null);
    } else {
      setFile(await RNFetchBlob.fs.ls(props.track + `/${el}`));
      setIndex(key);
    }
  };
  useEffect(() => {
    if (show) {
      getList();
    }
  }, [show]);

  const ConvertTxtToJson = (string) => {
    var arrayString = string.split('\n');
    var json = [];
    for (var i = 1; i < arrayString.length; i++) {
      const arrayWord = arrayString[i].split(';');
      json.push({
        Temps: arrayWord[0].toString(),
        TCAISSE: Number(
          converter(parseInt(arrayWord[1]), uniteTemp).toFixed(2),
        ),
        TREACT: Number(converter(parseInt(arrayWord[2]), uniteTemp).toFixed(2)),
        TEVAP: Number(converter(parseInt(arrayWord[3]), uniteTemp).toFixed(2)),
      });
    }
    return json;
  };

  const read = async (el, els) => {
    const txtFile = await readFile(props.track + '/' + el + '/' + els);
    dispatch(SetHistoryToShow(ConvertTxtToJson(txtFile)));
  };

  return (
    <Layout style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setShow(!show);
        }}>
        <View style={{flexDirection: 'row'}}>
          <Icon style={styles.icon} fill="#1B1D3A" name="folder-outline" />
          <Text>{props.name}</Text>
        </View>
        <Icon style={styles.icon} fill="#1B1D3A" name="chevron-down-outline" />
      </TouchableOpacity>
      {show &&
        listSubsFolders.map((el, key) => (
          <View key={key} style={styles.subContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                getListFiles(el, key);
              }}>
              <View style={{flexDirection: 'row'}}>
                <Icon
                  style={styles.icon}
                  fill="#1B1D3A"
                  name="folder-outline"
                />
                <Text>{el}</Text>
              </View>
              <Icon
                style={styles.icon}
                fill="#1B1D3A"
                name="chevron-down-outline"
              />
            </TouchableOpacity>
            {key === index &&
              listFile.map((els, key) => (
                <View key={key} style={styles.subContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      read(el, els),
                        props.navigation.navigate('HistoryInChart');
                    }}>
                    <View style={{flexDirection: 'row'}}>
                      <Icon
                        style={styles.icon}
                        fill="#1B1D3A"
                        name="file-text-outline"
                      />
                      <Text>{els}</Text>
                    </View>
                    <Icon
                      style={styles.iconUpload}
                      fill="#1B1D3A"
                      name="eye-outline"
                    />
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        ))}
    </Layout>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderWidth: 0.1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'space-between',
  },
  subContainer: {
    padding: 15,
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
});

//make this component available to the app
export default ListFolder;
