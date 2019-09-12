import { ACTION_TYPES } from '../Constants';

export const changeLanguageVisibility = visible => ({
  type: ACTION_TYPES.CHANGE_LANGUAGE_VISIBILITY, visible,
});
export const changeInformationVisibility = visible => ({
  type: ACTION_TYPES.CHANGE_INFORMATION_VISIBILITY, visible,
});
export const toggleShowAll = showAll => ({
  type: ACTION_TYPES.TOGGLE_SHOW_ALL, showAll,
});
export const closeTopMenuDropdowns = () => ({
  type: ACTION_TYPES.CLOSE_TOP_MENU_DROPDOWNS,
});
export const toggleMapLayer = () => ({
  type: ACTION_TYPES.TOGGLE_MAP_LAYER,
});
export const toggleHamburgerMenu = visible => ({
  type: ACTION_TYPES.TOGGLE_HAMBURGER_MENU, visible,
});
export const changeOpenTab = openTab => ({
  type: ACTION_TYPES.CHANGE_OPEN_TAB, openTab,
});
export const setContactNotification = state => ({
  type: ACTION_TYPES.TOGGLE_CONTACT_NOTIFICATION, state,
});
export const setFullViewPage = state => ({
  type: ACTION_TYPES.TOGGLE_FULL_VIEW_PAGE, state,
});
export const setHideDropDown = state => ({
  type: ACTION_TYPES.TOGGLE_HIDE_DROP_DOWN, state,
});
export const toggleNavbarAbout = visible => ({
  type: ACTION_TYPES.TOGGLE_NAVBAR_ABOUT, visible,
});
export const toggleFilterState = filterToggles => ({
  type: ACTION_TYPES.TOGGLE_FILTER_STATE, filterToggles,
});
export const toggleFilterExpanded = expandToggles => ({
  type: ACTION_TYPES.TOGGLE_FILTER_EXPANDED, expandToggles,
});
export const changeFavSortOption = sortOption => ({
  type: ACTION_TYPES.CHANGE_FAV_SORT_OPTION, sortOption,
});
export const toggleTabLoading = tabLoading => ({
  type: ACTION_TYPES.TOGGLE_TAB_LOADING, tabLoading,
});
export const toggleGotCommuteForAreas = flag => ({
  type: ACTION_TYPES.TOGGLE_GOT_COMMUTE_FOR_AREAS, flag,
});
