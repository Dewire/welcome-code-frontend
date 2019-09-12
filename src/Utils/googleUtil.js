import axios from 'axios';
import {
  fetchCommuteFromTo,
  fetchAutocompleteSuggestion,
  fetchPlacesTextSearch,
  fetchCommuteTimeForAreas,
  fetchDestination,
} from './fetcherUtil';
import { getAvragePrice } from '../Utils/booliUtil';
import { FACT_TYPES } from '../Constants';
import { getDistanceBetweenCoordinates } from '../Utils/otherUtils';

const AC_PLACES_RADIUS = 50000;
const AC_PLACES_COMPONENTS = 'country:se';

const formatAreas = areas => areas.map(a =>
  ({
    areaId: a.areaId,
    municipalityId: a.municipalityId,
    coordinates: a.coordinates,
  }));

export const getDistanceObj = (origin, placeId, destination, language) =>
  new Promise(async (resolve, reject) => {
    fetchCommuteFromTo({
      origins: origin,
      placeId,
      destinations: destination,
      units: 'metric',
      language,
    }).then((resp) => {
      // TODO: Maybe switch to moment.js and use duration in milliseconds from resp
      Object.keys(resp.data).forEach((o) => {
        if (language === 'sv') {
          resp.data[o] = resp.data[o].replace('timmar', 'h');
          resp.data[o] = resp.data[o].replace('tim', 'h');
        } else if (language === 'en') {
          resp.data[o] = resp.data[o].replace('hours', 'h');
          resp.data[o] = resp.data[o].replace('hour', 'h');
        }
      });
      resolve(resp.data);
    }).catch((err) => {
      reject(err);
    });
  });

export const getCommuteTimeForAreasBatch = (origin, areas, language) =>
  new Promise(async (resolve, reject) => {
    fetchCommuteTimeForAreas({
      areas: formatAreas(areas),
      origins: `${origin.lat},${origin.long}`,
      language,
    }).then((resp) => {
      for (let i = 0; i < areas.length; i += 1) {
        areas[i].commute = resp.data[i].commute;
      }
      resolve(areas);
    }).catch((err) => {
      reject(err);
    });
  });

export const getAutocompletePlacesSuggestion = (origin, input, language) =>
  new Promise(async (resolve, reject) => {
    if (!input) {
      resolve('');
    }

    fetchAutocompleteSuggestion({
      input,
      language,
      location: `${origin.lat},${origin.long}`,
      radius: AC_PLACES_RADIUS,
      components: AC_PLACES_COMPONENTS,
    }).then((resp) => {
      resolve(resp.data);
    }).catch((err) => {
      reject(err);
    });
  });

export const getPlacesByTextSearch = (origin, query, type, language) =>
  new Promise(async (resolve, reject) => {
    fetchPlacesTextSearch({
      query,
      type,
      language,
      location: `${Math.round(origin.lat * 10000) / 10000},${Math.round(origin.lng * 10000) / 10000}`,
      rankby: 'distance',
    }).then((resp) => {
      resolve(resp.data);
    }).catch((err) => {
      reject(err);
    });
  });

export const getPlacesByTextSearchBatch = (places, origin, language) => {
  const promises = [];
  places.forEach((p) => {
    const {
      query, type, objectLabel, subLabel,
    } = p;
    const fetchPlacesQuery = fetchPlacesTextSearch({
      query,
      type,
      language,
      location: `${Math.round(origin.lat * 10000) / 10000},${Math.round(origin.lng * 10000) / 10000}`,
      rankby: 'distance',
    }).then(resp => ({ objectLabel, subLabel, data: resp.data }));
    promises.push(fetchPlacesQuery);
  });

  return new Promise((resolve, reject) => {
    axios.all(promises)
      .then(axios.spread((...resp) => {
        const markers = {};
        resp.forEach((r) => {
          const { objectLabel, subLabel } = r;
          markers[objectLabel] = markers[objectLabel] ? markers[objectLabel] : {};
          markers[objectLabel][subLabel] = r.data;
        });
        resolve(markers);
      }))
      .catch((err) => {
        reject(err);
      });
  });
};


const getAveragePrice = query => getAvragePrice(query.origin, 'villa')
  .then(averagePrice => ({
    areaId: query.areaId,
    municipalityId: query.municipalityId,
    type: FACT_TYPES.AVERAGE_HOUSE_COST,
    value: averagePrice,
  }));


export const getCompareValues = (areas, language, compareQueries, commuteDestination) => {
  const promises = [];
  const commuteValues = [];

  promises.push(fetchDestination({
    areas: formatAreas(areas),
    language,
    compareQueries,
    rankby: 'distance',
  }));

  areas.forEach((a) => {
    const booliQuery = {
      areaId: a.areaId,
      municipalityId: a.municipalityId,
      origin: { lat: a.coordinates.lat, long: a.coordinates.long },
    };

    const commuteValue = {
      areaId: a.areaId,
      municipalityId: a.municipalityId,
      type: FACT_TYPES.COMMUTE_DESTINATION,
      value: getDistanceBetweenCoordinates(a.coordinates, commuteDestination, false),
    };

    promises.push(getAveragePrice(booliQuery));
    commuteValues.push(commuteValue);
  });

  return axios.all(promises).then(axios.spread((google, ...booli) => {
    // Match areas with response from google and get distance between those two
    const googleValues = areas.map(area => google.data.map((googleDestination) => {
      let distance;
      if (googleDestination.destination) {
        const { destination: { lat, lng } } = googleDestination;
        distance = getDistanceBetweenCoordinates(
          area.coordinates,
          { lat, long: lng },
          false,
        );
      }

      return {
        ...googleDestination,
        value: distance,
      };
    }).filter(a => area.areaId === a.areaId && area.municipalityId === a.municipalityId));
    const allData = booli
      .concat(...googleValues)
      .concat(commuteValues);

    const sortOrder = Object.values(FACT_TYPES);
    allData.sort((a, b) => {
      if (sortOrder.indexOf(a.type) > sortOrder.indexOf(b.type)) {
        return 1;
      }
      return -1;
    });
    return allData;
  }));
};
