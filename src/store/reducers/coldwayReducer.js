import { COLDWAY_MODAL, COLDWAY_PARAMETRE, COLDWAY_ISLOADING, TOGGLE_IS_PARAMS_EDITED } from '../actions/actionTypes';
import {Platform} from 'react-native';
import * as constants from '../../config/constants';

const initialState = {
    ColdwayModal: false,
    coldwayIsLoding:Platform.OS===constants.PLATFORM_ANDROID ? true:false,
    parametreColdway: [],

};

export default (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case COLDWAY_MODAL:
            return {
                ...state,
                ColdwayModal: action.ColdwayModal
            };
        case COLDWAY_PARAMETRE:
            return {
                ...state,
                parametreColdway: action.parametreColdway
            };
        case COLDWAY_ISLOADING:
            return {
                ...state,
                coldwayIsLoding: action.coldwayIsLoding
            };
        default:
            return state
    }
};
