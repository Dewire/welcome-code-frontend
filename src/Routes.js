/* eslint-env browser */
import React from 'react';
import ReactGA from 'react-ga';
import { Route, Switch, Redirect } from 'react-router-dom';
import queryString from 'query-string';
import Loadable from 'react-loadable';
import AboutMunicipalityComponent from './Components/AboutMunicipalityComponent';
import AboutServiceComponent from './Components/AboutServiceComponent';
import AreaOverview from './Components/AreaOverview';
import CompareFavouritesComponent from './Components/Compare/CompareFavouritesComponent';
import LoadingIndicatorComponent from './Components/LoadingIndicatorComponent';
import FrontPage from './Components/FrontPage';
import { store } from './Store';
import { changeLanguage } from './Actions/LanguageActions';
import { getMunicipalityData, clearMunicipalityData } from './Actions/MunicipalityActions';
import { clearMapState } from './Actions/MapViewActions';
import {
  setFullViewPage,
  setHideDropDown,
  toggleShowAll,
  toggleNavbarAbout,
} from './Actions/ToggleActions';
import { URL_TYPES, GOOGLE_ANALYTICS_ID } from './Constants';
import { changeHtmlLang } from './Utils/otherUtils';

ReactGA.initialize(GOOGLE_ANALYTICS_ID, {
  gaOptions: {
    anonymizeIp: true,
    forceSSL: true,
  },
});

const preview = !!queryString.parse(window.location.search).preview;

const initApp = (match, hideDropDown, fullViewPage, showAll) => {
  ReactGA.pageview(window.location.pathname + window.location.search);

  if (match.params.municipalityName &&
      (!store.getState().MunicipalityReducer
      || store.getState().MunicipalityReducer.name !== match.params.municipalityName)) {
    store.dispatch(getMunicipalityData(match.params.lang, match.params.municipalityName));
  }
  store.dispatch(changeLanguage(match.params.lang));
  store.dispatch(setHideDropDown(hideDropDown));
  store.dispatch(setFullViewPage(fullViewPage));
  store.dispatch(toggleShowAll(showAll));
  store.dispatch(toggleNavbarAbout(false));

  const { params: { lang } } = match;
  changeHtmlLang(lang);

  if (preview) {
    window.history.pushState('', '', `${window.location.pathname}?preview=true`);
  }
};

const redirectToStartMunicipality = (match, path) => {
  ReactGA.pageview(window.location.pathname + window.location.search);
  const { lang, municipalityName } = match.params;

  if (municipalityName !== 'about-service') {
    if (lang && municipalityName) {
      const pathname = path || 'start';
      return <Redirect to={`/${lang}/${municipalityName}/${pathname}`} />;
    }
    return <Redirect to="/404" />;
  }
  changeHtmlLang(match.params.lang ? match.params.lang : 'sv');
  store.dispatch(changeLanguage(match.params.lang ? match.params.lang : 'sv'));
  return <AboutServiceComponent frontPage match={match} />;
};

const Licenses = Loadable({
  loader: () => import('./Components/LicenseComponent'),
  loading: LoadingIndicatorComponent,
});

export default () => (
  <Switch>
    <Route
      exact
      path="/"
      component={() => <Redirect to="/sv/" />}
    />
    <Route
      exact
      path="/:lang"
      component={({ match }) => {
        changeHtmlLang(match.params.lang ? match.params.lang : 'sv');
        store.dispatch(clearMunicipalityData());
        store.dispatch(clearMapState());
        initApp(match, true, true);
        return <FrontPage />;
      }}
    />
    <Route
      exact
      path="/:lang(sv|en)/:municipalityName"
      component={({ match }) => redirectToStartMunicipality(match)}
    />

    <Route
      exact
      path={`/:lang(sv|en)/:municipalityName/${URL_TYPES.ABOUT_MUNICIPALITY}`}
      component={({ match }) => {
       initApp(match, true, true);
       return <AboutMunicipalityComponent match={match} />;
     }}
    />
    <Route
      exact
      path={`/:lang(sv|en)/:municipalityName/${URL_TYPES.ABOUT_SERVICE}`}
      component={({ match }) => {
       initApp(match, true, true);
       return <AboutServiceComponent match={match} />;
     }}
    />
    <Route
      exact
      path={`/:lang(sv|en)/:municipalityName/${URL_TYPES.ABOUT_SERVICE}/${URL_TYPES.LICENSES}`}
      component={Licenses}
    />
    <Route
      exact
      path={`/:lang(sv|en)/:municipalityName/${URL_TYPES.AREA}/:areaName`}
      component={({ match }) => {
       initApp(match, true, true);
       return <AreaOverview match={match} />;
     }}
    />
    <Route
      exact
      path={`/:lang(sv|en)/:municipalityName/${URL_TYPES.COMPARE}`}
      component={({ match, location }) => {
       initApp(match, true, true);
       return <CompareFavouritesComponent match={match} location={location} />;
     }}
    />
    <Route
      exact
      path={`/:lang(sv|en)/:municipalityName/${URL_TYPES.START}`}
      component={({ match }) => {
       initApp(match, false);
       return (<div />);
     }}
    />
    <Route
      exact
      path={`/:lang(sv|en)/:municipalityName/${URL_TYPES.MAP}`}
      component={({ match }) => {
       initApp(match, true, false, true);
       return (<div />);
     }}
    />

    <Route
      exact
      path="/404"
      component={FrontPage}
    />

    <Route render={({ match }) => redirectToStartMunicipality(match)} />
  </Switch>
);
