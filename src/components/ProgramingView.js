//import liraries
import React from 'react';
import { StyleSheet } from 'react-native';
import CheckBoxView from "./checkboxView";

// create a component
const DaysList = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
const ProgramingView = (props) => {
    return (
        <>
            {DaysList.map((val, index) => {
                return (<CheckBoxView key={index} day={val} translate={props.translate} dayIndex={index} value={props.data[props.type][index]} type={props.type}
                    onChangeCheckBox={props.onChangeCheckBox} onChangeTime={props.onChangeTime} />)
            })
            }
        </>
    )
}
// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
    },
});

//make this component available to the app
export default ProgramingView;
