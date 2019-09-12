import { fetchSoldByArea, fetchListingsByArea } from './fetcherUtil';
import { isNumber } from './otherUtils';

const SOLD_LIMIT = 5;

const soldByAreaBuilder = (origin, objectType) => {
  const center = [origin.lat, origin.long];
  const dim = [1000, 1000]; // TODO: Get as params? Or set global value
  return {
    center: center.join(','),
    dim: dim.join(','),
    objectType,
    limit: 20,
  };
};

const sortLimitSoldObj = (soldObject, limit) => {
  if (limit) {
    return soldObject.sort((a, b) =>
      b.booliId - a.booliId)
      .slice(0, soldObject.length < SOLD_LIMIT ? soldObject.length : SOLD_LIMIT);
  }
  return soldObject.sort((a, b) =>
    b.booliId - a.booliId);
};

const calculateAveragePriceTotal = (soldObject) => {
  let returnVal = 0;
  sortLimitSoldObj(soldObject, SOLD_LIMIT)
    .forEach((s) => {
      if (isNumber(s.soldPrice)) {
        returnVal += s.soldPrice;
      }
    });
  return returnVal !== 0 ?
    (Math.round((returnVal / (soldObject.length < SOLD_LIMIT ? soldObject.length
      : SOLD_LIMIT)) / 100000) * 100000) : undefined;
};

const calculateAveragePriceSqM2 = (soldObject) => {
  let returnVal = 0;
  sortLimitSoldObj(soldObject, SOLD_LIMIT)
    .forEach((s) => {
      if (s.livingArea && isNumber(s.soldPrice)) {
        returnVal += s.soldPrice / s.livingArea;
      }
    });
  return returnVal !== 0 ?
    (Math.round((returnVal / (soldObject.length < SOLD_LIMIT ? soldObject.length
      : SOLD_LIMIT)) / 100000) * 100000) : undefined;
};

const calculateAveragePrice = (soldObject, sqM2) => {
  if (sqM2) { // TODO: Add feature toggle for this in admin backend.
    return calculateAveragePriceSqM2(soldObject);
  }
  return calculateAveragePriceTotal(soldObject);
};

export const getAvragePrice = (origin, objectType) => new Promise((resolve, reject) => {
  fetchSoldByArea([soldByAreaBuilder(origin, objectType)])
    .then((resp) => {
      if (resp.data.length) {
        // Take the first element since we are only fetching for a single area
        const { sold } = resp.data[0];
        const avgPrice = calculateAveragePrice(sold);
        resolve(avgPrice);
      }
      resolve('');
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
});

export const getAvragePriceBatch = (areas, objectType) => new Promise((resolve, reject) => {
  const data = [];
  areas.forEach(a => data.push(soldByAreaBuilder(a.coordinates, objectType)));
  fetchSoldByArea(data).then((resp) => {
    if (resp.data.length) {
      for (let i = 0; i < areas.length; i += 1) {
        const { sold } = resp.data[i];
        const avgPrice = calculateAveragePrice(sold);
        areas[i].avgPrice = avgPrice;
      }
      resolve(areas);
    }

    resolve([]);
  }).catch((err) => {
    console.log(err);
    reject(err);
  });
});

export const getHousingListings = (municipality, area) =>
  new Promise((resolve, reject) => {
    fetchListingsByArea({ q: `${area}, ${municipality}` }).then((response) => {
      const { listings } = response.data ? response.data : [];

      listings.forEach((listing) => {
        listing.streetAddress = listing.location.address.streetAddress ? listing.location.address.streetAddress : '-';
        listing.objectType = listing.objectType ? listing.objectType : '-';
        listing.area = listing.location.namedAreas ? listing.location.namedAreas[0] : '-';
        listing.livingArea = listing.livingArea ? `${listing.livingArea} m²` : '-';
        listing.listPrice = listing.listPrice ? `${Number.parseInt(listing.listPrice, 10).toLocaleString('sv-SE')} kr` : '-';
      });

      resolve(listings);
    }).catch((err) => {
      reject(err);
    });
  });
