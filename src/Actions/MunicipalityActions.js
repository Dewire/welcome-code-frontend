import { push } from 'react-router-redux';
import { ACTION_TYPES } from '../Constants';
import {
  getCommuteDestination,
} from '../Utils/localStorageUtil';
import {
  getAreasInMunicipality,
  getAllAreasExcludeByMunicipality,
} from './AreaActions';
import { setMapValues } from './MapViewActions';
import { fetchMunicipalityData } from '../Utils/fetcherUtil';

const receiveMunicipalityData = data => ({ type: ACTION_TYPES.RECEIVE_MUNICAPALITY_DATA, data });

export const clearMunicipalityData = () => ({ type: ACTION_TYPES.CLEAR_MUNICAPALITY_DATA });

export const getMunicipalityData = (lang, municipalityName) => (dispatch) => {
  fetchMunicipalityData(lang, municipalityName).then((response) => {
    if (response.status === 200) {
      const { municipalityId, initialMapState } = response.data;

      dispatch(receiveMunicipalityData(response.data));
      if (getCommuteDestination()) {
        dispatch(setMapValues({ ...initialMapState, commuteDestination: getCommuteDestination() }));
        dispatch(getAreasInMunicipality(
          municipalityId,
          lang, getCommuteDestination(),
        ));
        dispatch(getAllAreasExcludeByMunicipality(municipalityId));
      } else {
        dispatch(setMapValues(initialMapState));
        dispatch(getAreasInMunicipality(
          municipalityId,
          lang, initialMapState.commuteDestination,
        ));
        dispatch(getAllAreasExcludeByMunicipality(municipalityId));
      }
    }
  }).catch((error) => {
    if (error.response.status === 404) {
      dispatch(push('/404'));
    }
    console.log('error', error);
  });
};
