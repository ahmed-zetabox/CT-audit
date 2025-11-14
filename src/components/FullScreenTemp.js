import React, {useEffect, useState, useRef, useMemo} from 'react';
import CheckBox from '@react-native-community/checkbox';
import {
    View,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    StyleSheet, Platform,
} from 'react-native';
import {Button, Text, Icon, Modal} from '@ui-kitten/components';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import * as constants from '../config/constants';
import Share from 'react-native-share';
import {captureRef} from 'react-native-view-shot';
import {SaveFile} from './File_functions';
import ToastComponent from '../components/toastComponent';
import {LineCharte} from './LineCharte';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const FullScreenTemp = (props) => {
    const {t, i18n} = useTranslation();
    const screenOrientation = useSelector(
        (state) => state.appReducer.screenOrientation,
    );
    const [visible, setVisible] = useState(false);
    const [windowHeight, setWindowHeight] = useState(
        Dimensions.get('window').height,
    );
    const [isTempInterVisible, setIsTempInterVisible] = useState(true);
    const [isTempAmbVisible, setIsTempAmbVisible] = useState(true);
    const [istempEvapVisible, setIsTempEvapVisible] = useState(false);
    const [isTempReactVisible, setIsTempReactVisible] = useState(false);
    const connectedDevice = useSelector((state) => state.bleReducer.connectedDevice);

    const viewRef = useRef(1);
    const insets = useSafeAreaInsets();

    const FullScreen = (props) => (
        <Icon {...props} style={styles.iconButton} name="collapse" fill="#272958"/>
    );

    const saveIcon = (props) => (
        <Icon
            {...props}
            style={styles.iconButton}
            name="save-outline"
            fill="#272958"
        />
    );
    const filterIcon = (props) => (
        <Icon
            {...props}
            style={styles.iconButton}
            name="funnel-outline"
            fill="#272958"
        />
    );
    const shareIcon = (props) => (
        <Icon
            {...props}
            style={styles.iconButton}
            name="share-outline"
            fill="#272958"
        />
    );

    const onSave = () => {
        captureRef(viewRef, {
            format: 'png',
            quality: 1,
            result: 'base64',
        }).then((uri) => {
            const newUri = uri.replace(/\s/g, '');
            SaveFile(
                Platform.OS === constants.PLATFORM_ANDROID ? uri : newUri,
                `${connectedDevice.name}/temperature`,
                `screenshot-${moment().format('DD_H_mm_ss')}.png`,
                'base64',
            );
        });
        ToastComponent.showToastSuccess(t('toast_success'), t('message_saved'));
    };

    const onShare = () => {
        try {
            captureRef(viewRef, {
                format: 'png',
                quality: 1,
                result: Platform.OS === constants.PLATFORM_ANDROID ? 'data-uri' : 'tmpfile',
            }).then((uri) => {
                const shareOptions = {
                    title: 'Share file',
                    url: uri,
                    failOnCancel: false,
                };
                Share.open(shareOptions);
            });
        } catch (error) {
            console.log('sahre error', error);
        }
    };

    useEffect(() => {
        console.log('im in here at least');

        setWindowHeight(Dimensions.get('window').height);
    }, [screenOrientation]);
    const calculateWidth = useMemo(() => {
        if (props.route.params.tempChart.length > 7) {
            return (
                Dimensions.get('window').width + 2 * Dimensions.get('window').width
            );
        } else {
            return Dimensions.get('window').width;
        }
    }, [props.route.params.tempChart]);
    return (
        <View style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
            flex: 1,
            backgroundColor: '#fff',
        }}>
            <View
                style={{
                    height: insets.top,
                    backgroundColor: '#1B1D3A',
                }}
            />
            <View style={styles.containerButton}>
                <Text style={{width: 120, fontWeight: 'bold'}} category="s1">
                    {t('Temperature')}
                </Text>
                <View style={{flexDirection: 'row'}}>
                    <Button
                        onPress={() => setVisible(true)}
                        style={styles.button}
                        accessoryLeft={filterIcon}
                    />
                    <Button
                        onPress={() => onSave()}
                        style={styles.button}
                        accessoryLeft={saveIcon}
                    />
                    <Button
                        onPress={() => onShare()}
                        style={styles.button}
                        accessoryLeft={shareIcon}
                    />
                    <Button
                        onPress={() => props.navigation.goBack()}
                        style={styles.button}
                        accessoryLeft={FullScreen}
                    />
                </View>
            </View>
            <View
                ref={viewRef}
                style={{
                    backgroundColor: '#fff',
                    paddingLeft: 10,
                }}>
                <LineCharte
                    height={
                        screenOrientation === constants.SCREEN_LANDSCAPE
                            ? windowHeight - 150
                            : windowHeight - 100 - insets.bottom
                    }
                    tempChart={props.route.params.tempChart}
                    isTempInterVisible={isTempInterVisible}
                    isTempAmbVisible={isTempAmbVisible}
                    istempEvapVisible={istempEvapVisible}
                    isTempReactVisible={isTempReactVisible}
                    FormaX="HH"
                    label="temperature"
                />
            </View>

            <Modal
                visible={visible}
                style={styles.modal}
                backdropStyle={styles.backdrop}
                onBackdropPress={() => setVisible(false)}>
                <View style={styles.container}>
                    <View style={styles.containerlegand}>
                        <TouchableOpacity
                            style={styles.legand}
                            onPress={() => setIsTempInterVisible(!isTempInterVisible)}>
                            <CheckBox
                                tintColors={{true: '#272958', false: '#272958'}}
                                onTintColor={'#272958'}
                                onCheckColor={'#272958'}
                                value={isTempInterVisible}
                                onValueChange={() => setIsTempInterVisible(!isTempInterVisible)}
                                style={{alignSelf: 'center'}}
                            />
                            <Text style={{margin: 8}}>{t('common:Inside_body_temperature')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.legand}
                            onPress={() => setIsTempAmbVisible(!isTempAmbVisible)}>
                            <CheckBox
                                tintColors={{true: '#902038', false: '#902038'}}
                                onTintColor={'#902038'}
                                onCheckColor={'#902038'}
                                value={isTempAmbVisible}
                                onValueChange={() => setIsTempAmbVisible(!isTempAmbVisible)}
                                style={{alignSelf: 'center'}}
                            />
                            <Text style={{margin: 8}}>{t('common:Ambient_temperature')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.legand}
                            onPress={() => setIsTempEvapVisible(!istempEvapVisible)}>
                            <CheckBox
                                tintColors={{true: '#E25382', false: '#E25382'}}
                                onTintColor={'#E25382'}
                                onCheckColor={'#E25382'}
                                value={istempEvapVisible}
                                onValueChange={() => setIsTempEvapVisible(!istempEvapVisible)}
                                style={{alignSelf: 'center'}}
                            />
                            <Text style={{margin: 8}}>{t('common:Evaporator_temperature')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{flexDirection: 'row'}}
                            onPress={() => setIsTempReactVisible(!isTempReactVisible)}>
                            <CheckBox
                                tintColors={{true: '#3442C0', false: '#3442C0'}}
                                onTintColor={{true: '#3442C0', false: '#3442C0'}}
                                onCheckColor={{true: '#3442C0', false: '#3442C0'}}
                                value={isTempReactVisible}
                                onValueChange={() => setIsTempReactVisible(!isTempReactVisible)}
                                style={{alignSelf: 'center'}}
                            />
                            <Text style={{margin: 8}}>{t('common:Reactor_temperature')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 0,
    },
    button: {
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderColor: '#272958',
        marginRight: 5,
    },
    iconButton: {
        width: 25,
        height: 25,
    },
    legand: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    containerlegand: {
        padding: 20,
        marginTop: 10,
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
        borderRadius: 15,
        backgroundColor: 'white',
        width: '95%',
    },
});
