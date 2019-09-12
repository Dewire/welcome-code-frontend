import { ACTION_TYPES } from '../Constants';
import {
  getLocalAreaData,
  saveOrRemoveArea,
  removeSelectedAreas,
} from '../Utils/localStorageUtil';

const updateAreaFavs = data => ({
  type: ACTION_TYPES.UPDATE_AREA_FAVOURITES, data,
});

const updateAreaFav = data => ({
  type: ACTION_TYPES.UPDATE_AREA_FAVOURITE, data,
});

const updateSelectedFav = data => ({
  type: ACTION_TYPES.UPDATE_SELECT_FAVOURITE, data,
});

const deleteSelectedFavs = data => ({
  type: ACTION_TYPES.DELETE_SELECTED_FAVOURITES, data,
});

export const updateFavourites = areas => (dispatch) => {
  const localFavAreas = getLocalAreaData();
  const favAreas = areas.reduce((accum, area) => {
    const index = localFavAreas
      .findIndex(e => e.municipalityId === area.municipalityId && e.areaId === area.areaId);
    if (index !== -1) {
      accum.push({
        ...area,
        favSelected: true,
      });
    }
    return accum;
  }, []);
  dispatch(updateAreaFavs(favAreas));
};

export const updateFavourite = (favAreas, area) => (dispatch) => {
  const index = favAreas
    .findIndex(a => area.municipalityId === a.municipalityId && area.areaId === a.areaId);

  if (index === -1) {
    favAreas.push({
      ...area,
      favSelected: true,
    });
  } else {
    favAreas.splice(index, 1);
  }
  const updatedAreas = favAreas.slice();
  saveOrRemoveArea(area.municipalityId, area.areaId);
  dispatch(updateAreaFav(updatedAreas));
};

export const updateSelectFavourite = (favAreas, area) => (dispatch) => {
  const updatedAreas = favAreas.map((a) => {
    if (a.municipalityId !== area.municipalityId || a.areaId !== area.areaId) return a;
    return {
      ...a,
      favSelected: !a.favSelected,
    };
  });
  dispatch(updateSelectedFav(updatedAreas));
};


export const selectDeselectAllFavourites = (favAreas, select) => (dispatch) => {
  const updatedAreas = favAreas.map(area => ({
    ...area,
    favSelected: select,
  }));
  dispatch(updateSelectedFav(updatedAreas));
};

export const deleteSelectedFavourites = favAreas => (dispatch) => {
  removeSelectedAreas(favAreas);

  const updatedAreas = favAreas.filter(area => !area.favSelected);
  dispatch(deleteSelectedFavs(updatedAreas));
};
