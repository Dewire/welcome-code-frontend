import { ACTION_TYPES } from '../Constants';
import { fetchAboutMunicipality } from '../Utils/fetcherUtil';

const receiveAboutMunicipalityData = data => (
  { type: ACTION_TYPES.RECEIVE_ABOUT_MUNICAPALITY_DATA, data }
);

export const getAboutInMunicipality = municipality => (dispatch) => {
  fetchAboutMunicipality(municipality).then((response) => {
    if (response.status === 200) {
      dispatch(receiveAboutMunicipalityData(response.data));
    }
  }).catch((error) => {
    console.log('error', error);
  });
};
