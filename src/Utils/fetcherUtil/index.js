/* eslint-env browser */
import axios from 'axios';
import ReactGA from 'react-ga';
import { createHash } from 'crypto';
import { CONF_NAME } from '../../Constants';
import { store } from '../../Store';

export * from './frontendApi';

const getCookie = (name) => {
  const escape = s => s.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');
  const match = document.cookie.match(RegExp(`(?:^|;\\s*)${escape(name)}=([^;]*)`));
  return match ? match[1] : null;
};

const jwtToken = getCookie('jwtToken');

axios.interceptors.request.use((ctx) => {
  const {
    ToggleReducer: {
      preview,
    } = {},
  } = store.getState();

  if (ctx.method === 'post' && ctx.data) {
    const md5 = createHash('md5').update(JSON.stringify(ctx.data)).digest('hex');
    if (!ctx.params) {
      ctx.params = {};
    }
    Object.assign(ctx.params, { digest: md5 });
  }

  if (preview) {
    ctx.headers = { ...ctx.headers, Authorization: jwtToken };
  }

  return ctx;
});

const backendUrl = process.env.REACT_APP_LAMBDA_URL;
const mapBackendUrl = process.env.REACT_APP_MAP_PROXY_URL;
const awsErrorUrl = '/front/aws/error';

// const noCache = {
//   Expires: '0',
//   'Cache-control': 'no-cache,no-store,must-revalidate,max-age=-1,private',
//   Pragma: 'no-cache',
// };

export const putErrorMessage = data => axios({
  baseURL: backendUrl, url: awsErrorUrl, method: 'put', data,
});

export const fetchListingsByArea = params => axios({
  baseURL: backendUrl, url: '/front/booli/listings', method: 'get', params,
});

export const fetchSoldByArea = data => axios({
  baseURL: backendUrl, url: '/front/booli/sold', method: 'post', data,
});

export const fetchCommuteFromTo = params => axios({
  baseURL: mapBackendUrl, url: '/api/google-distance/', method: 'get', params,
});

export const fetchAutocompleteSuggestion = params => axios({
  baseURL: mapBackendUrl, url: '/api/google-places-ac/', method: 'get', params,
});

export const fetchPlaceDetails = params => axios({
  baseURL: mapBackendUrl, url: '/api/google-place-details/', method: 'get', params,
});

export const fetchPlacesTextSearch = params => axios({
  baseURL: mapBackendUrl, url: '/api/google-places-search/', method: 'get', params,
});

export const fetchCommuteTimeForAreas = data =>
  axios({
    baseURL: mapBackendUrl, url: '/api/google-distance/areas', method: 'post', data,
  });

export const fetchDestination = data => axios({
  baseURL: mapBackendUrl, url: '/api/google-places-destination', method: 'post', data,
});

axios.interceptors.response.use(
  response => response
  , (error) => {
    const {
      config: { baseURL, url },
    } = error;

    const path = url.replace(baseURL, '');
    let label;

    // Reject if path is same as awsErrorUrl
    // otherwise we can create an infinite loop
    if (path === awsErrorUrl) {
      return Promise.reject(error);
    }

    if (error.response) {
      const {
        response: { status, statusText },
      } = error;
      label = `${path} ${status} ${statusText}`;
    } else {
      label = `${path} ${error.message}`;
    }

    ReactGA.event({
      category: 'ERROR',
      action: 'HTTP_CLIENT',
      label,
      nonInteraction: true,
    });

    const errorMessage = {
      errorOrigin: `Client${CONF_NAME}`,
      label,
    };

    putErrorMessage(errorMessage).then((response) => {
      if (response.status === 200) {
        console.log('success');
      }
    }).catch((er) => {
      console.log('error', er);
    });

    return Promise.reject(error);
  },
);
