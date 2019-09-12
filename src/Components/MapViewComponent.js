/* eslint-env browser */
/* eslint no-underscore-dangle: ["error", { "allow": ["_icon"] }] */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Leaflet from 'leaflet';
import classNames from 'classnames';
import ReactGA from 'react-ga';
import 'leaflet.markercluster';
import 'leaflet-edgebuffer';
import { NavLink } from 'react-router-dom';
import '../Utils/bouncemarker';
import AreaCardComponent from './AreaCardComponent';
import TabComponent from './Tabs/TabComponent';
import ChangeMunicipalityModal from './ChangeMunicipalityModal';
import {
  toggleMapLayer,
  toggleHamburgerMenu,
  changeOpenTab,
  toggleFilterExpanded,
  toggleTabLoading,
} from '../Actions/ToggleActions';
import { updateFavourite } from '../Actions/FavouriteActions';
import {
  clearFilter,
  setPoiMarkers,
} from '../Actions/MapViewActions';
import { URL_TYPES, TAB_TYPES, MAP_PARAMS } from '../Constants';
import { fetchMunicipalityById } from '../Utils/fetcherUtil';
import { isAreaFav } from '../Utils/otherUtils';
import { getPlacesByTextSearch } from '../Utils/googleUtil';
import { options } from '../Resources/filterOptions';

import mapPinLocation from '../Images/Icons/icon_map_pin_your_location.svg';
import iconSchool from '../Images/Icons/icon_school.svg';
import iconFastFood from '../Images/Icons/icon_fast_food.svg';
import iconShoppingBag from '../Images/Icons/icon_shopping_bag.svg';

class MapViewComponent extends Component {
  constructor() {
    super();
    this.state = {
      openArea: {},
      muniModalVisible: false,
      showLoadMoreBtn: false,
      showLoadMoreBtnActive: false,
      filterOptions: options,
    };
  }

  componentDidMount() {
    this.createMap();
    this.addMapLayer();
    this.addStartPin();
    this.addAreaMarkers();

    const { location: { search } } = window;
    const { dispatch } = this.props;
    // open filter tab if we have query parameter filter
    if (search.includes('filter')) {
      dispatch(changeOpenTab(TAB_TYPES.FILTER));
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.MapViewReducer.commuteDestination.name
      !== this.props.MapViewReducer.commuteDestination.name) {
      this.moveCommutePin();
    }

    if (prevProps.MapViewReducer.poiMarkers
      !== this.props.MapViewReducer.poiMarkers) {
      this.addPoiMarkers();
    }

    if (prevProps.ToggleReducer.hamburgerMenu &&
      prevProps.ToggleReducer.hamburgerMenu !==
      this.props.ToggleReducer.hamburgerMenu) {
      this.removePopup();
    }

    if ((prevProps.AreaReducer.areas &&
      prevProps.AreaReducer.areas !==
      this.props.AreaReducer.areas) ||
      (prevProps.AreaReducer.excludedAreas &&
        prevProps.AreaReducer.excludedAreas !==
        this.props.AreaReducer.excludedAreas)) {
      this.addAreaMarkers();
    }

    if ((prevProps.MapViewReducer.filteredAreas !==
      this.props.MapViewReducer.filteredAreas)) {
      this.removePopup();
      this.addAreaMarkers();
    }

    if (prevProps.FavouriteReducer.favourites
      !== this.props.FavouriteReducer.favourites) {
      // If we have an area card (popup) open we should redraw it otherwise
      // new values won't update since the area card is static.
      if (this.state.openArea.areaId) this.redrawPopup();
      this.addAreaMarkers();
    }
  }

  createMap() {
    const {
      MapViewReducer: { center, zoom },
      MunicipalityReducer: { mapCredentials },
    } = this.props;

    this.map = Leaflet.map('map', {
      maxBounds: MAP_PARAMS.SWE_BOUNDS,
      minZoom: MAP_PARAMS.MIN_ZOOM,
      attributionControl: !mapCredentials,
      zoomControl: false,
    }).setView([center.lat, center.long], zoom);
    this.addMoveendEventListener();
  }

  addMoveendEventListener() {
    this.map.on('moveend', () => {
      const { MapViewReducer: { poiMarkers } } = this.props;
      if (Object.keys(poiMarkers).length !== 0) {
        setTimeout(() => {
          this.setState({ showLoadMoreBtn: true });
        }, 2000);
      }
    });
  }

  addMapLayer() {
    const { mapCredentials } = this.props.MunicipalityReducer;

    if (mapCredentials) {
      this.defaultMapLayer =
          Leaflet.tileLayer.wms(`${process.env.REACT_APP_MAP_PROXY_URL}/api/lantmateriet`, {
            api: 'topowebb-skikt/wms/v1.1',
            layers: 'mark,hydrografi_ytor,bebyggelse_nedtonad,jarnvag_nedtonad,kommunikation_nedtonad,text_nedtonad',
            format: 'image/png',
            srs: 'EPSG:3857',
            mapCredentials: JSON.stringify(mapCredentials),
          });
    } else {
      const osmWLabels =
      Leaflet.tileLayer.wms('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
        maxZoom: 12,
        attribution:
        '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia maps</a> | Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      });

      const osmWOLabels =
      Leaflet.tileLayer.wms('https://maps.wikimedia.org/osm/{z}/{x}/{y}.png', {
        minZoom: 13,
        attribution:
        '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia maps</a> | Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      });

      this.defaultMapLayer = new Leaflet.LayerGroup([osmWLabels, osmWOLabels]);
    }

    this.map.addLayer(this.defaultMapLayer);
  }

  addSatelliteLayer() {
    const { mapCredentials } = this.props.MunicipalityReducer;

    this.satelliteMapLayer =
    mapCredentials ?
      Leaflet.tileLayer.wms(`${process.env.REACT_APP_MAP_PROXY_URL}/api/lantmateriet`, {
        api: 'ortofoto/wms/v1.2',
        layers: 'orto025,orto050',
        format: 'image/png',
        srs: 'EPSG:3857',
        mapCredentials: JSON.stringify(mapCredentials),
      })
      :
      Leaflet.tileLayer.wms('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 17,
        attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      });

    this.map.addLayer(this.satelliteMapLayer);
  }

  moveCommutePin() {
    const { dispatch, MapViewReducer: { commuteDestination } } = this.props;
    dispatch(changeOpenTab(''));

    this.startPin.setLatLng([commuteDestination.lat, commuteDestination.long]);
    const allMarkersGroupBounds =
      Leaflet.featureGroup([this.clusteredMarkers, this.startPin]).getBounds().pad(0.3);
    const boundsZoom = this.map.getBoundsZoom(allMarkersGroupBounds);
    this.map.removeLayer(this.startPin);
    this.map.fitBounds(allMarkersGroupBounds, { animate: true });

    if (boundsZoom !== this.map.getZoom()) {
      this.map.once('zoomend moveend', () => {
        this.addStartPin();
      });
    } else {
      this.addStartPin();
    }
  }

  addStartPin() {
    const { dispatch, MapViewReducer: { commuteDestination } } = this.props;

    const startPin = Leaflet.icon({
      iconUrl: mapPinLocation,
      iconAnchor: [13, 34],
    });

    this.startPin = Leaflet.marker(
      [commuteDestination.lat, commuteDestination.long],
      {
        icon: startPin,
        bounceOnAdd: true,
        pane: 'tooltipPane',
      },
    ).on('click keypress', () => dispatch(changeOpenTab(TAB_TYPES.FILTER))).addTo(this.map);
  }

  addAreaMarkers() {
    const {
      MapViewReducer: { filteredAreas },
      AreaReducer: { excludedAreas },
      FavouriteReducer: { favourites },
    } = this.props;

    let {
      AreaReducer: { areas },
    } = this.props;

    if (this.clusteredMarkers) {
      this.map.removeLayer(this.clusteredMarkers);
    }

    if (this.excludedClusters) {
      this.map.removeLayer(this.excludedClusters);
    }

    this.clusteredMarkers = Leaflet.markerClusterGroup({
      showCoverageOnHover: false,
      removeOutsideVisibleBounds: false,
      iconCreateFunction: (cluster) => {
        const hasFav = cluster.getAllChildMarkers().some(m => m.options.isFav);
        return Leaflet.divIcon({
          className: 'map-pin-multiple-wrapper',
          html: `<div class="icon-pin ${hasFav ? 'fav' : ''}"><p><b>${cluster.getChildCount()}</b> st</p></div>`,
          iconAnchor: [-22, 50],
          iconSize: [0, 0],
        });
      },
    });

    this.clusteredMarkers.on('clusterkeypress', (a) => {
      a.layer.zoomToBounds();
    });

    if (filteredAreas) {
      areas = areas.filter(a => filteredAreas.indexOf(a.areaId) > -1);
    }

    const { openArea } = this.state;
    areas.forEach((a) => {
      const isFav = isAreaFav(favourites, a);
      const isOpen = a.areaId === openArea.areaId;
      const iconClasses = classNames('map-pin-area theme', { 'selected-map-marker': isOpen });
      const iconHtmlClasses = classNames('icon-pin icon-theme', { fav: isFav });
      const nameHtmlClasses = classNames('area-name', { fav: isFav });
      const areaIcon = Leaflet.divIcon({
        areaId: a.areaId,
        className: iconClasses,
        html: `<div class="${iconHtmlClasses}"></div><div class="${nameHtmlClasses}"><p>${a.name}</p></div>`,
        iconAnchor: [13, 34],
        iconSize: [0, 0],
      });

      const hiddenPopup = Leaflet.popup({
        className: 'hidden-popup ',
        offset: [0, 0],
      });

      const areaMarker = Leaflet
        .marker([a.coordinates.lat, a.coordinates.long], { icon: areaIcon, isFav })
        .bindPopup(hiddenPopup)
        .on('click keypress', (e) => {
          this.openPopup(a);
          Leaflet.DomUtil.addClass(e.target._icon, 'selected-map-marker');
        });
      this.clusteredMarkers.addLayer(areaMarker);
    });

    const excludedClusters = [];
    excludedAreas.forEach((muniGroup) => {
      const markerCluster = Leaflet.markerClusterGroup({
        showCoverageOnHover: false,
        iconCreateFunction: (cluster) => {
          const hasFav = cluster.getAllChildMarkers().some(m => m.options.isFav);
          return Leaflet.divIcon({
            className: 'map-pin-multiple-wrapper excluded',
            html: `<div class="icon-pin ${hasFav ? 'fav' : ''}"><p><b>${cluster.getChildCount()}</b> st</p></div>`,
            iconAnchor: [-22, 50],
            iconSize: [0, 0],
          });
        },
      });
      muniGroup.forEach((a) => {
        const isFav = isAreaFav(favourites, a);
        const iconHtmlClasses = classNames('icon-pin icon-theme excluded', { fav: isFav });
        const areaIcon = Leaflet.divIcon({
          className: 'map-pin-area theme',
          html: `<div class="${iconHtmlClasses}"></div>`,
          iconAnchor: [13, 34],
          iconSize: [0, 0],
        });

        const areaMarker = Leaflet
          .marker([a.coordinates.lat, a.coordinates.long], { icon: areaIcon, isFav })
          .on('click keypress', () => {
            this.openMunicipalityModal(a.municipalityId);
          });
        markerCluster.addLayer(areaMarker);
      });
      excludedClusters.push(markerCluster);
    });

    this.excludedClusters = new Leaflet.LayerGroup(excludedClusters);

    this.map.addLayer(this.excludedClusters);
    this.map.addLayer(this.clusteredMarkers);
  }

  addPoiMarkers() {
    const {
      MapViewReducer: { poiMarkers },
    } = this.props;

    if (this.poiMarkers) {
      this.map.removeLayer(this.poiMarkers);
    }

    const markers = [];

    Object.keys(poiMarkers).forEach((objectLabel) => {
      Object.keys(poiMarkers[objectLabel]).forEach((subLabel) => {
        if (poiMarkers[objectLabel][subLabel]) {
          poiMarkers[objectLabel][subLabel].forEach((place) => {
            if (place.geometry) {
              const poiIcon = Leaflet.divIcon({
                className: 'map-pin-poi',
                html: `<div class="icon-pin"><img src="${place.icon}" alt="marker-icon" /></div>`,
                iconAnchor: [13, 34],
                popupAnchor: [0, -34],
                iconSize: [0, 0],
              });
              markers.push(Leaflet.marker(place.geometry.location, {
                icon: poiIcon,
                zIndexOffset: -200,
              })
                .bindPopup(`<b>${place.name}</b><br>${place.formatted_address}`));
            }
          });
        }
      });
    });

    this.poiMarkers = new Leaflet.LayerGroup(markers);
    this.map.addLayer(this.poiMarkers);
  }

  redrawPopup() {
    const { openArea } = this.state;
    const { AreaReducer: { areas } } = this.props;
    const updatedArea = areas.find(a => a.areaId === openArea.areaId);
    this.removePopup();
    this.openPopup(updatedArea);
  }

  removePopup() {
    if (document.getElementById('popup')) {
      document.getElementById('popup').parentElement.outerHTML = '';
      document.getElementById('popup-mobile').outerHTML = '';
      if (document.getElementsByClassName('selected-map-marker')[0]) {
        document.getElementsByClassName('selected-map-marker')[0].className =
        document.getElementsByClassName('selected-map-marker')[0].className.replace('selected-map-marker', '');
        this.setState({ openArea: {} });
      }
    }
  }

  openPopup(openArea) {
    this.removePopup();
    const popupIcon = Leaflet.divIcon({
      className: 'popup',
      html: '<div id="popup"></div>',
      iconSize: [0, 0],
      iconAnchor: [122, 288],
    });

    const {
      LanguageReducer,
      MunicipalityReducer,
      MapViewReducer,
      dispatch,
      FavouriteReducer: { favourites },
    } = this.props;

    openArea.isFav = isAreaFav(favourites, openArea);
    this.setState({ openArea });

    const {
      coordinates,
      eventFromSearch,
      name,
    } = openArea;

    const areaCard = (<AreaCardComponent
      LanguageReducer={LanguageReducer}
      MunicipalityReducer={MunicipalityReducer}
      MapViewReducer={MapViewReducer}
      favourites={favourites}
      openArea={openArea}
      navigationOnClick={() => {
        dispatch(push(`/${LanguageReducer.language}/${MunicipalityReducer.name}/${URL_TYPES.AREA}/${name.toLowerCase()}`));
        this.removePopup();
      }}
      closeOnClick={() => this.removePopup()}
      areaFavOnClick={(favAreas, area) =>
        dispatch(updateFavourite(favAreas, area))
      }
    />);

    dispatch(toggleHamburgerMenu(true));

    const mobilePopup = document.createElement('div');
    mobilePopup.setAttribute('id', 'popup-mobile');
    mobilePopup.setAttribute('class', 'show-for-small-only');
    document.body.appendChild(mobilePopup);

    this.popupMarker = Leaflet.marker(
      [coordinates.lat, coordinates.long],
      {
        icon: popupIcon,
        pane: 'popupPane',
      },
    );
    this.map.addLayer(this.popupMarker);

    ReactDOM.render(areaCard, document.getElementById('popup'));
    ReactDOM.render(areaCard, document.getElementById('popup-mobile'));

    // This is needed to await map zoom before changing the marker, since it's not
    // rendered until zoom is done.
    if (eventFromSearch) {
      if (this.map.getZoom() === 13) {
        const marker = this.clusteredMarkers.getLayers()
          .find(l => l.options.icon.options.areaId === openArea.areaId)._icon;
        Leaflet.DomUtil.addClass(marker, 'selected-map-marker');
      } else {
        this.map.once('zoomend', () => {
          const marker = this.clusteredMarkers.getLayers()
            .find(l => l.options.icon.options.areaId === openArea.areaId)._icon;
          Leaflet.DomUtil.addClass(marker, 'selected-map-marker');
        });
      }

      this.map.setView([openArea.coordinates.lat, openArea.coordinates.long], 13);
    }
  }

  toggleMapLayers() {
    const { dispatch, ToggleReducer: { mapSatelliteVisible } } = this.props;

    if (mapSatelliteVisible) {
      ReactGA.event({
        category: 'UI Event',
        action: 'Map type click',
        label: 'Datellite map',
      });
      this.addMapLayer();
      this.map.removeLayer(this.satelliteMapLayer);
    } else {
      ReactGA.event({
        category: 'UI Event',
        action: 'Map type click',
        label: 'Default map',
      });
      this.addSatelliteLayer();
      this.map.removeLayer(this.defaultMapLayer);
    }

    dispatch(toggleMapLayer());
  }

  reloadFilters() {
    const {
      MapViewReducer: { poiMarkers },
      dispatch,
    } = this.props;
    const { filterOptions } = this.state;

    ReactGA.event({
      category: 'UI Event',
      action: 'Search again click',
      label: 'Search for filters again',
    });

    filterOptions.forEach((type) => {
      const {
        subLabels,
        objectLabel,
      } = type.options;
      if (poiMarkers[objectLabel]) {
        subLabels.forEach((label) => {
          const marker = poiMarkers[objectLabel][label];
          if (marker) {
            const index = subLabels.indexOf(label);
            const markerType = type.options.types[index];
            const queryParam = markerType ? '' : `${type.options.query[index]}`;

            this.setState({ showLoadMoreBtnActive: true });
            dispatch(toggleTabLoading(true));

            this.searchFilters(markerType, queryParam, objectLabel, label);
          }
        });
      }
    });
  }

  searchFilters(type, queryParam, objectLabel, label) {
    const {
      LanguageReducer: { language },
      MapViewReducer: { poiMarkers },
      dispatch,
    } = this.props;

    const mapCenter = this.map.getCenter();
    getPlacesByTextSearch(mapCenter, queryParam, type, language)
      .then((result) => {
        const newMarkers = { ...poiMarkers };
        newMarkers[objectLabel] = newMarkers[objectLabel] ? newMarkers[objectLabel] : {};
        newMarkers[objectLabel][label] = result;

        this.setState({ showLoadMoreBtnActive: false });
        this.setState({ showLoadMoreBtn: false });
        dispatch(toggleTabLoading(false));
        dispatch(setPoiMarkers(newMarkers));
      });
  }

  clearFilter() {
    const {
      dispatch,
    } = this.props;

    this.setState({ showLoadMoreBtn: false });
    dispatch(clearFilter());
  }

  mapZoomIn() {
    this.map.zoomIn();
  }

  mapZoomOut() {
    this.map.zoomOut();
  }

  openMunicipalityModal(muniModalId) {
    this.setState({
      muniModalVisible: true,
      muniModalId,
    });
  }

  closeMunicipalityModal() {
    this.setState({ muniModalVisible: false });
  }

  changeMunicipality() {
    const {
      muniModalId,
    } = this.state;
    const {
      LanguageReducer,
    } = this.props;
    fetchMunicipalityById(muniModalId)
      .then((response) => {
        const municipality = response.data;
        window.location.replace(`/${LanguageReducer.language}/${municipality.name}/${URL_TYPES.START}`);
      });
    this.closeMunicipalityModal();
  }

  render() {
    const {
      LanguageReducer, LanguageReducer: { applicationText, language, applicationText: { mapView } },
      ToggleReducer: { showAll, mapSatelliteVisible, openTab },
      MapViewReducer: { filteredAreas, poiMarkers },
      AreaReducer: { areas },
      dispatch,
      MunicipalityReducer,
    } = this.props;

    const mapClasses = classNames('map-view-container leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom', { inactive: !showAll });
    const mapLayerBtnClasses = classNames('btn-layer-wrapper', { satellite: mapSatelliteVisible });
    const zoomInClasses = classNames('btn theme zoom zoom-in', { 'tab-offset': openTab });
    const zoomOutClasses = classNames('btn theme zoom zoom-out', { 'tab-offset': openTab });
    const reloadBtnClasses = classNames('btn theme map-view-layer', { 'tab-offset': openTab });
    const reloadBtnIconClasses = classNames('icon', { rotate: this.state.showLoadMoreBtnActive });

    return (
      <div className="map-view-wrapper">
        <TabComponent
          areaClickHandler={(area) => { this.openPopup(area); }}
          mapCenter={this.map ? this.map.getCenter() : null}
        />
        <div id="map" className={mapClasses} />
        { showAll &&
        <div className="map-view-button-wrapper">
          <div className={mapLayerBtnClasses}>
            <button
              className="btn theme map-view-layer"
              type="button"
              onClick={() => this.toggleMapLayers()}
            >
              <div className="icon" />
              <p>
                {mapSatelliteVisible ?
                mapView.map :
                mapView.satellite}
              </p>
            </button>
          </div>
          {filteredAreas || Object.keys(poiMarkers).length ?
            <div className="filtered-areas-container f15">
              <p className="areas">
                {mapView.areas}<b>{filteredAreas ? filteredAreas.length : areas.length }</b>
              </p>
              <p>
                <button
                  className="blue-link underline f15"
                  onClick={() => {
                  this.clearFilter();
                }}
                >
                  {mapView.clearFilter}
                </button>
              </p>
            </div>
             :
            <div className="btn-layer-wrapper map-locations">
              <button
                className="btn theme map-view-layer"
                type="button"
                onClick={() => {
                  ReactGA.event({
                    category: 'UI Event',
                    action: 'Map button click',
                    label: 'Clicked filter from map button',
                  });
                  if (openTab === TAB_TYPES.FILTER) {
                    dispatch(changeOpenTab(''));
                  } else {
                    dispatch(changeOpenTab(TAB_TYPES.FILTER));
                    dispatch(toggleFilterExpanded(true));
                  }
                }}
              >
                <ReactSVG className="svg" path={iconSchool} />
                <ReactSVG className="svg" path={iconFastFood} />
                <ReactSVG className="svg" path={iconShoppingBag} />
              </button>
            </div>
           }
          {poiMarkers && this.state.showLoadMoreBtn &&
          <div className="btn-layer-wrapper map-reload-filter">
            <button
              className={reloadBtnClasses}
              type="button"
              onClick={() => this.reloadFilters()}
            >
              <div className={reloadBtnIconClasses} />
              <p>
                {mapView.reload}
              </p>
            </button>
          </div>
          }

          <input
            className={zoomInClasses}
            aria-label={mapView.zoomIn}
            type="button"
            onClick={() => this.mapZoomIn()}
            value="+"
          />
          <input
            className={zoomOutClasses}
            aria-label={mapView.zoomOut}
            type="button"
            onClick={() => {
              this.mapZoomOut();
            }}
            value="-"
          />
          <ChangeMunicipalityModal
            visible={this.state.muniModalVisible}
            changeMuni={() => this.changeMunicipality()}
            close={() => this.closeMunicipalityModal()}
            applicationText={applicationText}
            language={language}
          />
        </div>
        }
        {areas && areas.length &&
          <div className="screen-reader-area-nav">
            <p>Länksamling områden</p>
            {areas.map(a =>
              (
                <NavLink
                  key={a.areaId}
                  to={`/${LanguageReducer.language}/${MunicipalityReducer.name}/${URL_TYPES.AREA}/${a.name}`}
                >
                  {a.name}
                </NavLink>
              ))}
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  MapViewReducer: state.MapViewReducer,
  MunicipalityReducer: state.MunicipalityReducer,
  AreaReducer: state.AreaReducer,
  ToggleReducer: state.ToggleReducer,
  LanguageReducer: state.LanguageReducer,
  FavouriteReducer: state.FavouriteReducer,
});

export default connect(mapStateToProps)(MapViewComponent);
