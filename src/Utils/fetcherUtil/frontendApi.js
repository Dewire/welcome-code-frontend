import axios from 'axios';
import { store } from '../../Store';

const backendUrl = process.env.REACT_APP_LAMBDA_URL;

const noCache = {
  Expires: '0',
  'Cache-control': 'no-cache,no-store,must-revalidate,max-age=-1,private',
  Pragma: 'no-cache',
};

const getCookie = (name) => {
  const escape = s => s.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');
  const match = document.cookie.match(RegExp(`(?:^|;\\s*)${escape(name)}=([^;]*)`));
  return match ? match[1] : null;
};

const frontendApi = axios.create({
  headers: { ...noCache },
  baseURL: `${backendUrl}/front`,
});

const previewApi = axios.create({
  headers: { ...noCache },
  baseURL: `${backendUrl}/preview`,
});

const fetcher = () => {
  const {
    ToggleReducer: {
      preview,
    } = {},
  } = store.getState();
  const jwtToken = getCookie('jwtToken');
  if (preview) {
    previewApi.defaults.headers.common.Authorization = jwtToken;
    return previewApi;
  }
  return frontendApi;
};

export const fetchMunicipalityData = (language, municipality) => fetcher()({
  url: `/lang/${language}/municipality/${municipality}/startpage`, method: 'get',
});

export const fetchMunicipalityById = municipalityId => fetcher()({
  url: `/municipality/id/${municipalityId}`, method: 'get',
});

export const fetchAreasInMunicipality = municipalityId => fetcher()({
  url: `/areas/municipalityid/${municipalityId}/`, method: 'get',
});

export const fetchAllAreasExcludeByMunicipality = municipalityId => fetcher()({
  url: `/areas/exclude/municipalityid/${municipalityId}/`, method: 'get',
});

export const fetchAboutMunicipality = municipality => fetcher()({
  url: `/about-municipality/municipality/${municipality}/`, method: 'get',
});

export const fetchAreasByMunicipalityName = municipality => fetcher()({
  url: `/areas/municipality/${municipality}/`, method: 'get',
});

export const fetchAreaOverview = areaId => fetcher()({
  url: `/area-overview/areaid/${areaId}/`, method: 'get',
});

export const fetchAboutService = () => fetcher()({
  url: '/about-service/', method: 'get',
});

export const fetchAllMunicipalities = () => fetcher()({
  url: '/municipality/all/', method: 'get',
});
