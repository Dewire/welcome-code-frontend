/* eslint no-mixed-operators: "off" */
/* eslint-env browser */
import { FACT_TYPES, THEMES } from '../Constants';

export const capitalize = string => (string ? string.charAt(0).toUpperCase() + string.slice(1) : '');
export const getDistanceBetweenCoordinates = (c1, c2, kmAsMetric = true) => {
  const deg2rad = deg => deg * (Math.PI / 180);

  const RK = 6371; // Radius of the earth in km
  const RM = 6371000; // Radius of the earth in m

  const dLat = deg2rad(c2.lat - c1.lat); // deg2rad below
  const dLon = deg2rad(c2.long - c1.long);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(c1.lat)) * Math.cos(deg2rad(c2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = kmAsMetric ? RK * c : RM * c; // Distance in km or m
  return d;
};

export const sortAreasByDistance = (origin, areas) =>
  areas.filter(a => a.name !== origin.name).sort((x, y) =>
    getDistanceBetweenCoordinates(origin.coordinates, x.coordinates)
    - getDistanceBetweenCoordinates(origin.coordinates, y.coordinates));

export const sortAreasByCommuteDestination = (commuteDestination, areas) =>
  areas.sort((x, y) =>
    getDistanceBetweenCoordinates(commuteDestination, x.coordinates)
    > getDistanceBetweenCoordinates(commuteDestination, y.coordinates));

export const sortAreasByName = areas => areas.sort((x, y) => x.name.localeCompare(y.name, 'sv'));

export const isMobileDevice = () => (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

// converts meter to km if distance is >= 1000
// km is returned with 1 decimal e.g. 1.512 = 1.5
// m is rounded up to closest 50 e.g. 310 = 350,
export const distanceConverter = (distance) => {
  const value = Math.ceil(distance / 50) * 50;
  if (value >= 1000) {
    const tempDistance = value / 1000;
    return {
      value: tempDistance.toFixed(1),
      metric: 'km',
    };
  }
  return {
    value,
    metric: 'm',
  };
};

/* shortens price for e.g. house, apartments to more readable */
// TODO: get m² if admin feature toggle says so
export const priceConverter = price =>
  ({
    value: price >= 1000000 ? price / 1000000 : `${price / 1000}k`,
    metric: price >= 1000000 ? 'mkr' : 'kr',
  });

export const hasAllValues = (...args) => args.every(x => x);

export const parseFactValue = (type, value) => {
  if (type === FACT_TYPES.AVERAGE_HOUSE_COST) {
    return priceConverter(value);
  }
  return distanceConverter(value);
};

export const changeTheme = (newTheme, currentTheme = null) => {
  const newClasses = THEMES.get(newTheme).classes;
  if (!currentTheme) {
    document.body.classList.add(...newClasses);
  } else {
    const oldClasses = THEMES.get(currentTheme).classes;
    document.body.classList.remove(...oldClasses);
    document.body.classList.add(...newClasses);
  }
};

export const isNumber = n => Number(parseFloat(n)) === n;

export const changeHtmlLang = (lang) => {
  const currentLang = document.documentElement.lang;
  if (lang !== currentLang) {
    document.documentElement.lang = lang;
  }
};

// Group objects by property from an array of objects
export const groupBy = (collection, property) => {
  const hash = {};
  const result = [];

  collection.forEach((a) => {
    if (!hash[a[property]]) {
      hash[a[property]] = [];
      result.push(hash[a[property]]);
    }
    hash[a[property]].push(a);
  });
  return result;
};

export const isAreaFav = (favourites, area) =>
  favourites.some(a => a.areaId === area.areaId && a.municipalityId === area.municipalityId);
