import { ACTION_TYPES } from '../Constants';

const initialState = {
  areas: [],
  excludedAreas: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RECEIVE_AREAS_IN_MUNICIPALITY:
    case ACTION_TYPES.RECEIVE_AREA_AVERAGE_PRICE:
      return {
        ...state,
        areas: action.data,
      };
    case ACTION_TYPES.RECEIVE_ALL_AREAS_EXCLUDE_BY_MUNICIPALITY:
      return {
        ...state,
        excludedAreas: action.data,
      };
    default:
      return state;
  }
};

export default reducer;
