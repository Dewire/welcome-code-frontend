/* eslint-env browser */
const AREA_DATA = 'AREA_DATA';
const COMMUTE_DESTINATION = 'COMMUTE_DESTINATION';

export const getCommuteDestination = () => {
  const commuteDestination = localStorage.getItem(COMMUTE_DESTINATION);
  if (commuteDestination) {
    return JSON.parse(commuteDestination);
  }
  return undefined;
};

export const saveCommuteDestination = data =>
  localStorage.setItem(COMMUTE_DESTINATION, JSON.stringify(data));

export const getLocalAreaData = () => {
  const areaFavs = localStorage.getItem(AREA_DATA);
  if (areaFavs) {
    return JSON.parse(areaFavs);
  }
  return [];
};

const saveLocalArea = data =>
  localStorage.setItem(AREA_DATA, JSON.stringify(data));

const saveArea = (areaData, localData) => {
  if (localData === null) {
    saveLocalArea([areaData]);
  } else {
    localData.push(areaData);
    saveLocalArea(localData);
  }
};

const removeArea = (areaData, localData) => {
  const newData =
    localData
      .filter(a => a.municipalityId !== areaData.municipalityId || a.areaId !== areaData.areaId);
  saveLocalArea(newData);
};

const isAreaFav = (areaData, localData = getLocalAreaData()) => !!localData.find(a =>
  a.municipalityId === areaData.municipalityId && a.areaId === areaData.areaId);

export const saveOrRemoveArea = (municipalityId, areaId) => {
  const areaData = { municipalityId, areaId };
  const localData = getLocalAreaData();
  if (localData === null) return saveArea(areaData, localData);
  else if (isAreaFav(areaData)) return removeArea(areaData, localData);
  return saveArea(areaData, localData);
};

export const removeSelectedAreas = (areas) => {
  const updatedAreas = areas
    .filter(a => !a.favSelected)
    .map(a => ({
      municipalityId: a.municipalityId,
      areaId: a.areaId,
    }));
  saveLocalArea(updatedAreas);
};
