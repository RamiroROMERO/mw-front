import { combineReducers } from 'redux';
import settings from './settings/reducer';
import menu from './menu/reducer';
import authUser from './auth/reducer';
import generalDataFunc from './generalData/reducer';

const reducers = combineReducers({
  menu: menu,
  settings: settings,
  authUser: authUser,
  generalData: generalDataFunc
});

export default reducers;
