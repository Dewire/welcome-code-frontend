import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import SessionReducer from './SessionReducer';
import LanguageReducer from './LanguageReducer';
import MunicipalityReducer from './MunicipalityReducer';
import ToggleReducer from './ToggleReducer';
import MapViewReducer from './MapViewReducer';
import AreaReducer from './AreaReducer';
import AboutMunicipalityReducer from './AboutMunicipalityReducer';
import AreaOverviewReducer from './AreaOverviewReducer';
import AboutServiceReducer from './AboutServiceReducer';
import FavouriteReducer from './FavouriteReducer';

const reducers = combineReducers({
  session: SessionReducer,
  LanguageReducer,
  MunicipalityReducer,
  ToggleReducer,
  MapViewReducer,
  router: routerReducer,
  AreaReducer,
  AboutMunicipalityReducer,
  AreaOverviewReducer,
  AboutServiceReducer,
  FavouriteReducer,
});

export default reducers;
