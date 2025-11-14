import {SUPERVISOR_MODAL,unite,SUPERVISOR_DATE_DETVICE} from '../actions/actionTypes';

const initialState = {
    SupModal: false,
    unite:0,
    date:new Date()
};

export default (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SUPERVISOR_MODAL:
            return {
                ...state,
                SupModal: action.SupModal
            };
             case unite:
            return {
                ...state,
                unite: action.unite
            };
            case SUPERVISOR_DATE_DETVICE:
                return {
                    ...state,
                    date: action.date
                };
        default:
            return state
    }
};