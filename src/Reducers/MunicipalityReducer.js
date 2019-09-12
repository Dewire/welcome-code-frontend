import { ACTION_TYPES } from '../Constants';

const initialState = {
  theme: 'green',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RECEIVE_MUNICAPALITY_DATA:
      return { ...state, ...action.data };
    case ACTION_TYPES.CLEAR_MUNICAPALITY_DATA:
      return { ...initialState };
    default:
      return state;
  }
};

export default reducer;
