import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  Text,
} from '@ui-kitten/components';
import {HomeScreen} from '../screens/HomeScreen';
import {SupervisorScreen} from '../screens/SupervisorScreen';
import {MaintenanceScreen} from '../screens/MaintenanceScreen';
import {ColdwayScreen} from '../screens/ColdwayScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import toastComponent from '../components/toastComponent';
import {Platform} from 'react-native';
import * as constants from '../config/constants';
import * as actionCreators from '../store/actions/index';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

const {Navigator, Screen} = createBottomTabNavigator();

const BottomTabBar = ({navigation, state}) => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const coldwayIsLoding = useSelector(
    (state) => state.coldwayReducer.coldwayIsLoding,
  );
  const isParamsEdited = useSelector(
    (state) => state.appReducer.isParamsEdited,
  );
  const isParamsProgrammingEdited = useSelector(
    (state) => state.appReducer.isParamsProgrammingEdited,
  );
  const isParamsSimpleSettingsEdited = useSelector(
    (state) => state.appReducer.isParamsSimpleSettingsEdited,
  );

  const renderTitle = (props, title) => (
    <Text
      status={state.routeNames[state.index] === title ? 'info' : ''}
      appearance="hint"
      category="c1"
      numberOfLines={1}>
      {t(title)}
    </Text>
  );
  const renderIcon = (props, title, icon) => (
    <Icon
      {...props}
      fill={state.routeNames[state.index] === title ? '#902045' : '#8F9BB3'}
      name={icon}
    />
  );
  return (
    <SafeAreaView style={{backgroundColor: '#FFF'}}>
      <BottomNavigation
        appearance="noIndicator"
        selectedIndex={state.index}
        onSelect={(index) => {
          console.log('bottom nav', isParamsEdited);
          if (Platform.OS === constants.PLATFORM_ANDROID) {
            if (isParamsEdited.status === constants.CLDW_PARAMS_STATUS_Edited) {
              dispatch(
                actionCreators.toggleIsParamsEdited({
                  status: constants.CLDW_PARAMS_STATUS_Pending,
                  path: state.routeNames[index],
                }),
              );

              return;
            } else if (
              isParamsEdited.status === constants.CLDW_PARAMS_STATUS_Clear &&
              isParamsProgrammingEdited.status ===
                constants.CLDW_PARAMS_STATUS_Clear &&
              isParamsSimpleSettingsEdited.status ===
                constants.CLDW_PARAMS_STATUS_Clear
            ) {
              navigation.navigate(state.routeNames[index]);
              return;
            }
            if (
              isParamsProgrammingEdited.status ===
              constants.CLDW_PARAMS_STATUS_Edited
            ) {
              dispatch(
                actionCreators.toggleIsParamsProgrammingEdited({
                  status: constants.CLDW_PARAMS_STATUS_Pending,
                  path: state.routeNames[index],
                }),
              );

              return;
            } else if (
              isParamsEdited.status === constants.CLDW_PARAMS_STATUS_Clear &&
              isParamsProgrammingEdited.status ===
                constants.CLDW_PARAMS_STATUS_Clear &&
              isParamsSimpleSettingsEdited.status ===
                constants.CLDW_PARAMS_STATUS_Clear
            ) {
              navigation.navigate(state.routeNames[index]);
              return;
            }
            if (
              isParamsSimpleSettingsEdited.status ===
              constants.CLDW_PARAMS_STATUS_Edited
            ) {
              dispatch(
                actionCreators.toggleIsParamsSimpleSettingsEdited({
                  status: constants.CLDW_PARAMS_STATUS_Pending,
                  path: state.routeNames[index],
                }),
              );
              return;
            } else if (
              isParamsEdited.status === constants.CLDW_PARAMS_STATUS_Clear &&
              isParamsProgrammingEdited.status ===
                constants.CLDW_PARAMS_STATUS_Clear &&
              isParamsSimpleSettingsEdited.status ===
                constants.CLDW_PARAMS_STATUS_Clear
            ) {
              navigation.navigate(state.routeNames[index]);
              return;
            }
          } else {
            if (isParamsEdited.status === constants.CLDW_PARAMS_STATUS_Edited) {
              dispatch(
                actionCreators.toggleIsParamsEdited({
                  status: constants.CLDW_PARAMS_STATUS_Pending,
                  path: state.routeNames[index],
                }),
              );
              return;
            } else {
              !coldwayIsLoding
                ? isParamsEdited.status ===
                    constants.CLDW_PARAMS_STATUS_Clear &&
                  isParamsProgrammingEdited.status ===
                    constants.CLDW_PARAMS_STATUS_Clear &&
                  isParamsSimpleSettingsEdited.status ===
                    constants.CLDW_PARAMS_STATUS_Clear &&
                  navigation.navigate(state.routeNames[index])
                : toastComponent.showToastInfo(t('info_navigation'));
              return;
            }
            if (
              isParamsProgrammingEdited.status ===
              constants.CLDW_PARAMS_STATUS_Edited
            ) {
              dispatch(
                actionCreators.toggleIsParamsProgrammingEdited({
                  status: constants.CLDW_PARAMS_STATUS_Pending,
                  path: state.routeNames[index],
                }),
              );
              return;
            } else {
              !coldwayIsLoding
                ? isParamsEdited.status ===
                    constants.CLDW_PARAMS_STATUS_Clear &&
                  isParamsProgrammingEdited.status ===
                    constants.CLDW_PARAMS_STATUS_Clear &&
                  isParamsSimpleSettingsEdited.status ===
                    constants.CLDW_PARAMS_STATUS_Clear &&
                  navigation.navigate(state.routeNames[index])
                : toastComponent.showToastInfo(t('info_navigation'));
              return;
            }
            if (
              isParamsSimpleSettingsEdited.status ===
              constants.CLDW_PARAMS_STATUS_Edited
            ) {
              dispatch(
                actionCreators.toggleIsParamsSimpleSettingsEdited({
                  status: constants.CLDW_PARAMS_STATUS_Pending,
                  path: state.routeNames[index],
                }),
              );
              return;
            } else {
              !coldwayIsLoding
                ? isParamsEdited.status ===
                    constants.CLDW_PARAMS_STATUS_Clear &&
                  isParamsProgrammingEdited.status ===
                    constants.CLDW_PARAMS_STATUS_Clear &&
                  isParamsSimpleSettingsEdited.status ===
                    constants.CLDW_PARAMS_STATUS_Clear &&
                  navigation.navigate(state.routeNames[index])
                : toastComponent.showToastInfo(t('info_navigation'));
              return;
            }
          }
        }}>
        <BottomNavigationTab
          title={(props) => renderTitle(props, 'Home')}
          icon={(props) => renderIcon(props, 'Home', 'home-outline')}
        />
        <BottomNavigationTab
          title={(props) => renderTitle(props, 'Supervisor')}
          icon={(props) => renderIcon(props, 'Supervisor', 'person-outline')}
        />
        <BottomNavigationTab
          title={(props) => renderTitle(props, 'Maintenance')}
          icon={(props) => renderIcon(props, 'Maintenance', 'settings-outline')}
        />
        <BottomNavigationTab
          title={(props) => renderTitle(props, 'Coldway')}
          icon={(props) => renderIcon(props, 'Coldway', 'globe-outline')}
        />
        <BottomNavigationTab
          title={(props) => renderTitle(props, 'Settings')}
          icon={(props) => renderIcon(props, 'Settings', 'options-2-outline')}
        />
      </BottomNavigation>
    </SafeAreaView>
  );
};
const TabNavigator = () => (
  <Navigator tabBar={(props) => <BottomTabBar {...props} />}>
    <Screen name="Home" component={HomeScreen} />
    <Screen name="Supervisor" component={SupervisorScreen} />
    <Screen name="Maintenance" component={MaintenanceScreen} />
    <Screen name="Coldway" component={ColdwayScreen} />
    <Screen name="Settings" component={SettingsScreen} />
  </Navigator>
);

export const AppNavigator = () => <TabNavigator />;
