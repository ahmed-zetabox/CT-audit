import {
  ADD_PRODUCTION,
  ADD_RECHARGE,
  ADD_CYCLE,
  TOGGLE_IS_CHART_LOADING,
  ADD_CREATED_FILE,
  TOGGLE_IS_FOLDER_LOADING,
  TOGGLE_IS_FILE_LOADING,
  SET_SELECTED_DATE,
  RESET_CYCLE,
  SET_RECORD_NUM,
  SET_INDEX_RECORD,
  TRIGGER_LIST_FOLDERS,
  SET_SELECTED_FOLDER,
  TOGGLE_IS_DEVICE_LOADING,
} from '../actions/actionTypes';

const initialState = {
  listOfProduction: [],
  listOfRecharge: [],
  listOfCycle: [],
  isChartLoading: false,
  isFolderLoading: true,
  isFileLoading: false,
  selectedTimestamp: null,
  createdFiles: [],
  recordsNum: 0,
  indexRecord: 0,
  triggerListFolders: true,
  selectedFolder: null,
  isDeviceLoading: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_PRODUCTION:
      return {
        ...state,
        listOfProduction: [...state.listOfProduction, action.payload],
      };
    case ADD_RECHARGE:
      return {
        ...state,
        listOfProduction: [...state.listOfRecharge, action.payload],
      };
    case ADD_CYCLE:
      const filtredCycle = state.listOfCycle.filter(
        (e) => e.timestamp != action.payload.timestamp,
      );
      return {
        ...state,
        listOfCycle: [...filtredCycle, action.payload],
      };
    case TOGGLE_IS_CHART_LOADING:
      return {
        ...state,
        isChartLoading: action.payload,
      };
    case ADD_CREATED_FILE:
      return {
        ...state,
        createdFiles: [...state.createdFiles, action.payload],
      };
    case TOGGLE_IS_FOLDER_LOADING:
      return {
        ...state,
        isFolderLoading: action.payload,
      };
    case TOGGLE_IS_FILE_LOADING:
      return {
        ...state,
        isFileLoading: action.payload,
      };
    case SET_SELECTED_DATE:
      return {
        ...state,
        selectedTimestamp: action.payload,
      };
    case RESET_CYCLE:
      return {
        ...state,
        listOfCycle: [],
        createdFiles: [],
      };
    case SET_RECORD_NUM:
      return {
        ...state,
        recordsNum: action.payload,
      };
    case SET_INDEX_RECORD:
      return {
        ...state,
        indexRecord: action.payload,
      };
    case TRIGGER_LIST_FOLDERS:
      return {
        ...state,
        triggerListFolders: action.payload,
      };
    case SET_SELECTED_FOLDER:
      return {
        ...state,
        selectedFolder: action.payload,
      };
    case TOGGLE_IS_DEVICE_LOADING:
      return {
        ...state,
        isDeviceLoading: action.payload,
      };
    default:
      return state;
  }
};
