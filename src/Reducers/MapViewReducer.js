import { ACTION_TYPES } from '../Constants';

const initialState = {
  poiMarkers: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_MAP_VALUES:
      return { ...state, ...action.mapState };
    case ACTION_TYPES.SET_COMMUTE_DESTINATION:
      return {
        ...state,
        commuteDestination: action.commuteDestination,
      };
    case ACTION_TYPES.SET_FILTERED_AREAS:
      return {
        ...state,
        filteredAreas: action.filteredAreas,
      };
    case ACTION_TYPES.SET_POI_MARKERS:
      return {
        ...state,
        poiMarkers: action.poiMarkers,
      };
    case ACTION_TYPES.CLEAR_MAP_STATE:
      return { ...initialState };
    default:
      return state;
  }
};

export default reducer;
