import { ACTION_TYPES } from '../Constants';

const initialState = {
  favourites: [],
};

// Merging old and new state then removes duplicates
const updateState = (oldState, newState) => {
  const mergedState = oldState.concat(newState);

  return mergedState.filter((a1, index, self) =>
    self.findIndex(a2 =>
      (a1.areaId === a2.areaId && a1.municipalityId === a2.municipalityId)) === index);
};


const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.UPDATE_AREA_FAVOURITE:
    case ACTION_TYPES.DELETE_SELECTED_FAVOURITES:
    case ACTION_TYPES.UPDATE_SELECT_FAVOURITE:
      return {
        ...state,
        favourites: action.data,
      };
    case ACTION_TYPES.UPDATE_AREA_FAVOURITES:
      return {
        ...state,
        favourites: updateState(state.favourites, action.data),
      };
    default:
      return state;
  }
};

export default reducer;
