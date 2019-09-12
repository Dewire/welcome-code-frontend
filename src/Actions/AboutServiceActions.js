import { ACTION_TYPES } from '../Constants';
import { fetchAboutService } from '../Utils/fetcherUtil';

const receiveAboutServiceData = data => (
  { type: ACTION_TYPES.RECEIVE_ABOUT_SERVICE_DATA, data }
);

export const getAboutService = () => (dispatch) => {
  fetchAboutService().then((response) => {
    if (response.status === 200) {
      dispatch(receiveAboutServiceData(response.data));
    }
  }).catch((error) => {
    console.log('error', error);
  });
};
