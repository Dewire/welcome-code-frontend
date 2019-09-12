import { ACTION_TYPES } from '../Constants';
import {
  fetchAreasInMunicipality,
  fetchAreasByMunicipalityName,
  fetchAllAreasExcludeByMunicipality,
} from '../Utils/fetcherUtil';
import {
  getCommuteTimeForAreasBatch,
} from '../Utils/googleUtil';
import {
  getAvragePriceBatch,
} from '../Utils/booliUtil';
import { toggleGotCommuteForAreas } from './ToggleActions';
import { groupBy } from '../Utils/otherUtils';
import { updateFavourites } from './FavouriteActions';

const receiveAreasInMunicipality = data => ({
  type: ACTION_TYPES.RECEIVE_AREAS_IN_MUNICIPALITY, data,
});

const receiveAllAreasExcludeByMunicipality = data => ({
  type: ACTION_TYPES.RECEIVE_ALL_AREAS_EXCLUDE_BY_MUNICIPALITY, data,
});

const receiveAreaAveragePrice = data => ({
  type: ACTION_TYPES.RECEIVE_AREA_AVERAGE_PRICE, data,
});

export const fetchCommuteForAreas = (origin, areas, language) => (dispatch) => {
  dispatch(toggleGotCommuteForAreas(false));
  getCommuteTimeForAreasBatch(origin, areas, language).then((response) => {
    dispatch(receiveAreasInMunicipality(response));
    dispatch(toggleGotCommuteForAreas(true));
    dispatch(updateFavourites(response));
  }).catch((error) => {
    console.log('error', error);
  });
};

export const fetchAreaAveragePrice = areas => (dispatch) => {
  getAvragePriceBatch(areas).then((response) => {
    if (response.status === 200) {
      dispatch(receiveAreaAveragePrice(response.data));
    }
  }).catch((err) => {
    console.log(err);
  });
};

export const getAreasInMunicipality = (municipalityId, lang, origin) => (dispatch) => {
  fetchAreasInMunicipality(municipalityId).then((response) => {
    if (response.status === 200) {
      dispatch(fetchCommuteForAreas(origin, response.data, lang));
      dispatch(fetchAreaAveragePrice(response.data));
    }
  }).catch((error) => {
    console.log('error', error);
  });
};

export const getAreasByMunicipalityName = municipalityName => (dispatch) => {
  fetchAreasByMunicipalityName(municipalityName).then((response) => {
    if (response.status === 200) {
      dispatch(fetchCommuteForAreas(response.data));
    }
  }).catch((error) => {
    console.log('error', error);
  });
};

export const getAllAreasExcludeByMunicipality = municipalityId => (dispatch) => {
  fetchAllAreasExcludeByMunicipality(municipalityId)
    .then((response) => {
      const result = groupBy(response.data, 'municipalityId');
      dispatch(receiveAllAreasExcludeByMunicipality(result));
      dispatch(updateFavourites(response.data));
    })
    .catch((error) => {
      console.log('error', error);
    });
};
