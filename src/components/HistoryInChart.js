import React, { useEffect, useState } from 'react';
import CheckBox from '@react-native-community/checkbox';
import { View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Button ,Text, Icon } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import LineCharte from './LineCharte';
import { useSelector } from 'react-redux';
import * as constants from '../config/constants';


export const HistoryInChart = (props) => {
    const { t, i18n } = useTranslation();
    const screenOrientation = useSelector((state) => state.appReducer.screenOrientation);
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width)
    const [windowHeight, setWindowHeight] = useState(Dimensions.get('window').height)
    const [tempInter, setTempInterValue] = useState([]);
    const [tempEvaporateur, setTempEvaporateurValue] = useState([]);
    const [tempReacteur, setTempReacteurValue] = useState([]);
    const [tempInterState, setTempInter] = useState(true);
    const [tempEvaporateurState, setTempEvaporateur] = useState(true);
    const [tempReacteurState, setTempReacteur] = useState(true);
    const uniteTemp = useSelector((state) => state.appReducer.unite);
    const historyToShow = useSelector((state) => state.HistoriqueReducer.historyToShow);

    const FullScreen = (props) => (
        <Icon {...props} style={{
            width: 25,
            height: 25,
        }} name='collapse' fill='#272958' />
    );

    useEffect(() => {
        var TCAISSE = []
        var TEVAP = []
        var TREACT = []
        historyToShow.map(data => {
            TCAISSE.push({ x: data.Temps, y: data.TCAISSE })
            TEVAP.push({ x: data.Temps, y: data.TEVAP })
            TREACT.push({ x: data.Temps, y: data.TREACT })
        })
        setTempInterValue(TCAISSE)
        setTempEvaporateurValue(TEVAP)
        setTempReacteurValue(TREACT)
    }, [historyToShow])

    useEffect(() => {
        setWindowWidth(Dimensions.get('window').width)
        setWindowHeight(Dimensions.get('window').height)
    }, [screenOrientation])


    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 20, paddingBottom: 0 }}>
                <Text style={{ width: 150 }} category='h6'>{t('Temperature')+` (${uniteTemp})`}</Text>
                <View style={{ flexDirection: "row" }}>
                    <Button onPress={() => props.navigation.goBack()} style={{ width: 40, height: 40, backgroundColor: "#fff", borderColor: "#272958" }} accessoryLeft={FullScreen} />
                </View>
            </View>
            <ScrollView horizontal={true}>
                <View style={{
                    backgroundColor: "#fff",
                    width: screenOrientation === constants.SCREEN_LANDSCAPE
                        ? windowWidth
                        : windowWidth * 5, paddingLeft: 10, paddingRight: 100
                }}>
                    <LineCharte
                        height={screenOrientation === constants.SCREEN_LANDSCAPE
                            ? windowHeight - 90
                            : 300}
                        tempInter={tempInterState ? tempInter : []}
                        // tempAmbiant={tempAmbiantState ? tempAmbiant : []}
                        tempEvaporateur={tempEvaporateurState ? tempEvaporateur : []}
                        tempReacteur={tempReacteurState ? tempReacteur : []}
                        FormaX='HH'
                        // titel={`${t('Temperature')}(C°)`}
                        label="temperature"
                    />
                </View>
            </ScrollView>
            <View style={{ padding: 20, marginTop: 10 }}>
                <TouchableOpacity style={{ flexDirection: "row", marginBottom: 5 }}
                    onPress={() => setTempInter(!tempInterState)}>
                    <CheckBox
                        tintColors={{ true: "#272958", false: "#272958" }}
                        value={tempInterState}
                        onValueChange={() => setTempInter(!tempInterState)}
                        style={{ alignSelf: "center" }}
                    />
                    <Text style={{ margin: 8 }}>{t('common:Inside_body_temperature')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: "row", marginBottom: 5 }}
                    onPress={() => setTempEvaporateur(!tempEvaporateurState)}>
                    <CheckBox
                        tintColors={{ true: "#E25382", false: "#E25382" }}
                        value={tempEvaporateurState}
                        onValueChange={() => setTempEvaporateur(!tempEvaporateurState)}
                        style={{ alignSelf: "center" }}
                    />
                    <Text style={{ margin: 8 }}>{t('common:Evaporator_temperature')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: "row" }}
                    onPress={() => setTempReacteur(!tempReacteurState)}>
                    <CheckBox
                        tintColors={{ true: "#3442C0", false: "#3442C0" }}
                        value={tempReacteurState}
                        onValueChange={() => setTempReacteur(!tempReacteurState)}
                        style={{ alignSelf: "center" }}
                    />
                    <Text style={{ margin: 8 }}>{t('common:Reactor_temperature')}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView >
    );
};