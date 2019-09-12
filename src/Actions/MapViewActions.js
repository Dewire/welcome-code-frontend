import { ACTION_TYPES } from '../Constants';
import { fetchPlaceDetails } from '../Utils/fetcherUtil';
import { toggleFilterState } from './ToggleActions';
import { fetchCommuteForAreas } from './AreaActions';
import { saveCommuteDestination } from '../Utils/localStorageUtil';

export const setCommuteDestination = (commuteDestination) => {
  saveCommuteDestination(commuteDestination);
  return ({ type: ACTION_TYPES.SET_COMMUTE_DESTINATION, commuteDestination });
};

export const setMapValues = mapState => ({ type: ACTION_TYPES.SET_MAP_VALUES, mapState });

export const setFilteredAreas = filteredAreas =>
  ({
    type: ACTION_TYPES.SET_FILTERED_AREAS,
    filteredAreas: filteredAreas ? filteredAreas.map(a => a.areaId) : undefined,
  });

export const setPoiMarkers = poiMarkers =>
  ({ type: ACTION_TYPES.SET_POI_MARKERS, poiMarkers });

export const clearMapState = () =>
  ({ type: ACTION_TYPES.CLEAR_MAP_STATE });

export const getCommuteDestinationDetails = params => (dispatch) => {
  fetchPlaceDetails({ placeid: params.suggestion.place_id }).then((response) => {
    dispatch(fetchCommuteForAreas({
      lat: response.data.location.lat,
      long: response.data.location.lng,
    }, params.areas, params.language));
    dispatch(setCommuteDestination({
      name: params.suggestion.description.replace(', Sverige', '').replace(', Sweden', ''),
      lat: response.data.location.lat,
      long: response.data.location.lng,
    }));
  }).catch((error) => {
    console.log('error', error);
  });
};

export const clearFilter = () => (dispatch) => {
  dispatch(setPoiMarkers({}));
  dispatch(setFilteredAreas(undefined));
  dispatch(toggleFilterState({
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
  }));
};
