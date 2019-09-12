/* eslint-env browser */
import queryString from 'query-string';
import { ACTION_TYPES, FAV_SORT_OPTIONS } from '../Constants';

const initialState = {
  languageVisible: false,
  informationVisible: false,
  showAll: false,
  mapSatelliteVisible: false,
  hamburgerMenu: true,
  openTab: '',
  showContactNotification: false,
  fullViewPage: false,
  hideDropDown: false,
  navbarAbout: false,
  filterToggles: {
    housingToggles: { 1: false, 2: false },
    commuteTimeQuery: {
      time: 0,
      filterOptions: {
        driving: false,
        transit: false,
        bicycling: false,
        walking: false,
      },
    },
  },
  favSortOption: FAV_SORT_OPTIONS.VICINITY,
  gotCommuteForAreas: false,
  preview: !!queryString.parse(window.location.search).preview,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.CHANGE_LANGUAGE_VISIBILITY:
      return {
        ...state,
        languageVisible: action.visible,
        informationVisible: false,
      };
    case ACTION_TYPES.CHANGE_INFORMATION_VISIBILITY:
      return {
        ...state,
        informationVisible: action.visible,
        languageVisible: false,
      };
    case ACTION_TYPES.CLOSE_TOP_MENU_DROPDOWNS:
      return {
        ...state,
        informationVisible: false,
        languageVisible: false,
      };
    case ACTION_TYPES.TOGGLE_SHOW_ALL:
      return {
        ...state,
        showAll: action.showAll,
        openTab: '',
      };
    case ACTION_TYPES.TOGGLE_MAP_LAYER:
      return {
        ...state,
        mapSatelliteVisible: !state.mapSatelliteVisible,
      };
    case ACTION_TYPES.TOGGLE_HAMBURGER_MENU:
      return {
        ...state,
        hamburgerMenu: action.visible,
        navbarAbout: false,
      };
    case ACTION_TYPES.CHANGE_OPEN_TAB:
      return {
        ...state,
        openTab: action.openTab,
      };
    case ACTION_TYPES.TOGGLE_CONTACT_NOTIFICATION:
      return {
        ...state,
        showContactNotification: action.state,
      };
    case ACTION_TYPES.TOGGLE_FULL_VIEW_PAGE:
      return {
        ...state,
        fullViewPage: action.state,
      };
    case ACTION_TYPES.TOGGLE_HIDE_DROP_DOWN:
      return {
        ...state,
        hideDropDown: action.state,
      };
    case ACTION_TYPES.TOGGLE_NAVBAR_ABOUT:
      return {
        ...state,
        navbarAbout: action.visible,
      };
    case ACTION_TYPES.TOGGLE_FILTER_STATE:
      return {
        ...state,
        filterToggles: action.filterToggles,
      };
    case ACTION_TYPES.TOGGLE_FILTER_EXPANDED:
      return {
        ...state,
        filterToggles: { ...state.filterToggles, expandToggles: action.expandToggles },
      };
    case ACTION_TYPES.CHANGE_FAV_SORT_OPTION:
      return {
        ...state,
        favSortOption: action.sortOption,
      };
    case ACTION_TYPES.TOGGLE_TAB_LOADING:
      return {
        ...state,
        tabLoading: action.tabLoading,
      };
    case ACTION_TYPES.TOGGLE_GOT_COMMUTE_FOR_AREAS:
      return {
        ...state,
        gotCommuteForAreas: action.flag,
      };
    default:
      return state;
  }
};

export default reducer;
