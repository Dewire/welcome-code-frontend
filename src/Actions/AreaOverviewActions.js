import { ACTION_TYPES } from '../Constants';
import { fetchAreaOverview } from '../Utils/fetcherUtil';

export const receiveAreaOverviewData = data => (
  { type: ACTION_TYPES.RECEIVE_AREA_OVERVIEW_DATA, data }
);

export const getAreaOverview = areaId => (dispatch) => {
  fetchAreaOverview(areaId).then((response) => {
    dispatch(receiveAreaOverviewData(response.data));
  });
};
