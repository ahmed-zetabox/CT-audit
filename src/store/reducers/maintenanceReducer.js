import {
  MAINTENANCE_MODAL,
  TENSION_SETTING,
  TEMP_SETTING,
  GLOBAL_SETTING,
  DEFAULT_SETTING,
  MAINTENANCE_STATE,
  INFO_NOTIF_STATE,
  IBAT_NOTIF_STATE,
  BAT_NOTIF_STATE
} from '../actions/actionTypes';

const initialState = {
  MaintModal: false,
  tensionSetting: {},
  tempSetting: [],
  defaultSetting: [],
  globalSetting: [],
  Maintenance_Notify:true,
  IbatNotif:true,
  BatNotif:true,
  IfnoNotif:true
};

export default (state = initialState, action) => {
  const {type, payload} = action;

  switch (type) {
    case MAINTENANCE_MODAL:
      return {
        ...state,
        MaintModal: action.MaintModal,
      };
    case TENSION_SETTING:
      return {
        ...state,
        tensionSetting: action.tensionSetting,
      };
    case TEMP_SETTING:
      return {
        ...state,
        tempSetting: action.tempSetting,
      };
    case GLOBAL_SETTING:
      return {
        ...state,
        globalSetting: action.globalSetting,
      };
    case DEFAULT_SETTING:
      return {
        ...state,
        defaultSetting: action.defaultSetting,
      };
      case MAINTENANCE_STATE:
      return {
        ...state,
        Maintenance_Notify: action.Maintenance_Notify,
      };
      case INFO_NOTIF_STATE:
        return {
          ...state,
          IfnoNotif: action.IfnoNotif,
        };   
        case BAT_NOTIF_STATE:
        return {
          ...state,
          BatNotif: action.BatNotif,
        };   case IBAT_NOTIF_STATE:
        return {
          ...state,
          IbatNotif: action.IbatNotif,
        };
    default:
      return state;
  }
};
