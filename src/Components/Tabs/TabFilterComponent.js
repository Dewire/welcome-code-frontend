/* eslint jsx-a11y/label-has-for: 0 */
/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from 'rc-slider';
import classNames from 'classnames';
import queryString from 'query-string';
import ReactGA from 'react-ga';
import {
  getCommuteDestinationDetails,
  setCommuteDestination,
  setFilteredAreas,
  setPoiMarkers,
  clearFilter,
} from '../../Actions/MapViewActions';
import {
  toggleFilterState,
  toggleTabLoading,
  changeOpenTab,
  toggleFilterExpanded,
} from '../../Actions/ToggleActions';
import CommuteAutoComplete from '../CommuteAutoComplete';
import { HOUSING_TYPES, URL_TYPES, THEMES } from '../../Constants';
import { options } from '../../Resources/filterOptions';
import { getPlacesByTextSearch, getPlacesByTextSearchBatch } from '../../Utils/googleUtil';
import ShareModal from '../ShareModal';
import Checkbox from '../Checkbox';

class TabFilterComponent extends Component {
  static getModalParent() {
    return document.getElementById('tab-modal-parent');
  }
  constructor() {
    super();

    this.state = {
      filterData: options,
      showMore: false,
      modalIsOpen: false,
    };
  }

  componentDidMount() {
    const {
      location: { search },
      history,
    } = window;

    const {
      dispatch,
      LanguageReducer,
      MunicipalityReducer,
      ToggleReducer: { filterToggles: { expandToggles } },
    } = this.props;

    if (search.includes('filter')) {
      this.parseQueryUrl(search);
      dispatch(toggleFilterExpanded(true));
      history.pushState({}, null, `/${LanguageReducer.language}/${MunicipalityReducer.name}/${URL_TYPES.MAP}`);
    }

    if (expandToggles) {
      document.getElementById('tab-modal-parent').scrollTop =
        document.getElementById('filter-top-div').offsetHeight;
      dispatch(toggleFilterExpanded(false));
    }
  }

  componentDidUpdate(prevProps) {
    // Listen for commute destionation change
    if ((prevProps.AreaReducer.areas &&
      prevProps.AreaReducer.areas !==
      this.props.AreaReducer.areas)) {
      this.updateAreaFilter();
    }
    if (prevProps.ToggleReducer.filterToggles !==
        this.props.ToggleReducer.filterToggles) {
      this.updateAreaFilter();
    }
  }

  onPlacesChange(objectLabel, subLabel, type, query) {
    const {
      LanguageReducer: { language },
      MapViewReducer: { poiMarkers },
      mapCenter,
      dispatch,
    } = this.props;

    let newMarkers = { ...poiMarkers };

    if (poiMarkers[objectLabel] && poiMarkers[objectLabel][subLabel]) {
      ReactGA.event({
        category: 'UI Event',
        action: 'Filter click',
        label: `unset filter: ${objectLabel} -> ${subLabel}`,
      });

      newMarkers[objectLabel][subLabel] = '';
      let hasObjectContent = false;

      Object.keys(newMarkers).forEach((objectMarker) => {
        const subMarkers = Object.keys(newMarkers[objectMarker]);
        const hasSubContent = subMarkers.some(subMarker =>
          newMarkers[objectMarker][subMarker] !== '');

        if (!hasSubContent) {
          newMarkers[objectMarker] = '';
        }

        if (newMarkers[objectMarker]) {
          hasObjectContent = true;
        }
      });

      if (!hasObjectContent) {
        newMarkers = '';
      }

      dispatch(setPoiMarkers(newMarkers));
      dispatch(toggleTabLoading(false));
    } else {
      ReactGA.event({
        category: 'UI Event',
        action: 'Filter click',
        label: `set filter: ${objectLabel} -> ${subLabel}`,
      });

      const queryParam = type ? '' : `${query}`;

      dispatch(toggleTabLoading(true));
      getPlacesByTextSearch(mapCenter, queryParam, type, language)
        .then((result) => {
          newMarkers[objectLabel] = newMarkers[objectLabel] ? newMarkers[objectLabel] : {};
          newMarkers[objectLabel][subLabel] = result;
          dispatch(setPoiMarkers(newMarkers));
          dispatch(toggleTabLoading(false));
        });
    }
  }

  onSliderChange(time) {
    const {
      ToggleReducer: {
        filterToggles,
      },
      dispatch,
    } = this.props;

    // Slider max value position workaround
    const newTime = time === 125 ? 120 : time;

    ReactGA.event({
      category: 'UI Event',
      action: 'Filter click',
      label: `Filter slider: ${newTime} min`,
    });

    dispatch(toggleFilterState({
      ...filterToggles,
      commuteTimeQuery: { ...filterToggles.commuteTimeQuery, time: newTime },
    }));
  }

  getShareUrl() {
    const {
      MapViewReducer: { poiMarkers, commuteDestination },
      ToggleReducer: { filterToggles },
      LanguageReducer: { language },
      MunicipalityReducer: { name },
    } = this.props;
    const query = { filter: 1 };
    const poiMarkersArr = Object.keys(poiMarkers);

    poiMarkersArr.forEach((key) => {
      const value = Object.values(poiMarkers[key]);
      // Value becomes an empty string if that filter type has been cleared
      if (value.length && value[0] !== '') {
        query[key] = Object.keys(poiMarkers[key]).join();
      }
    });
    const {
      housingToggles,
      commuteTimeQuery: { time, filterOptions },
    } = filterToggles;
    const allQueries = {
      ...housingToggles, time, ...filterOptions, ...query, ...commuteDestination,
    };
    const queryUrl = queryString.stringify(allQueries);
    return `${window.location.origin}/${language}/${name}/${URL_TYPES.MAP}?${queryUrl}`;
  }


  parseQueryUrl(queryUrl) {
    const {
      MunicipalityReducer: { name, googleApiKey },
      LanguageReducer: { language },
      mapCenter,
      dispatch,
    } = this.props;
    const parsedQuery = queryString.parse(queryUrl);
    const parsedQueryArr = Object.keys(parsedQuery);
    const places = [];

    const stringToBoolean = string => (string === 'true');
    const {
      time, driving, transit, bicycling, walking, name: commuteName, lat, long,
    } = parsedQuery;

    const newFilterToggles = {
      housingToggles: {
        1: stringToBoolean(parsedQuery[1]) || false,
        2: stringToBoolean(parsedQuery[2]) || false,
      },
      commuteTimeQuery: {
        time: Number(time) || 0,
        filterOptions: {
          driving: stringToBoolean(driving) || false,
          transit: stringToBoolean(transit) || false,
          bicycling: stringToBoolean(bicycling) || false,
          walking: stringToBoolean(walking) || false,
        },
      },
    };
    dispatch(toggleFilterState(newFilterToggles));

    if (commuteName && lat && long) {
      dispatch(setCommuteDestination({
        name: commuteName,
        lat: Number(lat),
        long: Number(long),
      }));
    }

    parsedQueryArr.forEach((key) => {
      // We have to check if options contain query parameter since the
      // query contains more parameters then filterOptions
      const option = options.find(o => o.options.objectLabel === key);

      if (option) {
        const { options: { objectLabel, subLabels, types } } = option;
        const parsedSubLabels = parsedQuery[key].split(',');

        parsedSubLabels.forEach((subLabel) => {
          // Find index for sublabel based on query sublabel
          // We can then use the index to get type and query from filterOptions
          const index = subLabels.indexOf(subLabel);
          if (index >= 0) {
            const type = types[index];
            const query = option.options[language][index];
            places.push({
              objectLabel, subLabel, type, query: type ? '' : `${query} ${name}`,
            });
          }
        });
      }
    });

    dispatch(toggleTabLoading(true));
    getPlacesByTextSearchBatch(places, mapCenter, googleApiKey, language)
      .then((markers) => {
        dispatch(setPoiMarkers(markers));
        dispatch(toggleTabLoading(false));
      });
  }

  handleModal() {
    const { modalIsOpen } = this.state;

    ReactGA.event({
      category: 'UI Event',
      action: 'Filter click',
      label: 'Share filter',
    });

    this.setState({ modalIsOpen: !modalIsOpen });
  }

  filterOnHousingChange(housingType) {
    const {
      ToggleReducer: { filterToggles },
      dispatch,
    } = this.props;

    const newHousingToggles = filterToggles.housingToggles;
    const apartment = newHousingToggles[2];
    const house = newHousingToggles[1];

    newHousingToggles[housingType] = !newHousingToggles[housingType];

    let houseingFilterValue = '';
    if (house && apartment) {
      houseingFilterValue = 'both';
    } else if (!house && !apartment) {
      houseingFilterValue = 'none';
    } else {
      houseingFilterValue = (newHousingToggles[1] ? 'house' : 'aparment');
    }

    ReactGA.event({
      category: 'UI Event',
      action: 'Filter click',
      label: `Filter housing: ${houseingFilterValue}`,
    });

    dispatch(toggleFilterState({
      ...filterToggles,
      housingToggles: newHousingToggles,
    }));
  }

  filterByHousing() {
    const {
      AreaReducer: { areas },
      ToggleReducer: { filterToggles },
    } = this.props;

    const returnAreas = areas.filter((a) => {
      let returnValue = false;
      if (!a.housingType) {
        return false;
      }
      if (filterToggles.housingToggles[HOUSING_TYPES.HOUSE]) {
        returnValue = a.housingType.indexOf(HOUSING_TYPES.HOUSE) > -1;
      }
      if (filterToggles.housingToggles[HOUSING_TYPES.APARTMENT] && !returnValue) {
        returnValue = a.housingType.indexOf(HOUSING_TYPES.APARTMENT) > -1;
      }
      return returnValue;
    });

    return returnAreas.length ? returnAreas : undefined;
  }

  updateAreaFilter() {
    const {
      AreaReducer: { areas },
      ToggleReducer: {
        filterToggles: { commuteTimeQuery: { time, filterOptions } },
      },
      dispatch,
    } = this.props;

    const filterByHousing = this.filterByHousing();

    if (time) {
      const activeFilterAreas = filterByHousing || areas;
      let checkIfAnyOptionIsActive = false;

      Object.keys(filterOptions).forEach((o) => {
        if (filterOptions[o] === true) {
          checkIfAnyOptionIsActive = true;
        }
      });

      dispatch(setFilteredAreas(activeFilterAreas.filter((a) => {
        let returnValue = false;

        Object.keys(filterOptions).forEach((o) => {
          if ((!checkIfAnyOptionIsActive || filterOptions[o])
              && a.commute[o].status === 'OK'
              && a.commute[o].duration.value
              && Math.ceil(a.commute[o].duration.value / 60) <= time) {
            returnValue = true;
          }
        });

        return returnValue;
      })));
    } else {
      dispatch(setFilteredAreas(filterByHousing));
    }
  }

  toggleCommuteQueryOption(option) {
    const {
      ToggleReducer: {
        filterToggles,
      },
      ToggleReducer: {
        filterToggles: { commuteTimeQuery: { filterOptions } },
      },
      dispatch,
    } = this.props;

    filterOptions[option] = !filterOptions[option];

    dispatch(toggleFilterState({
      ...filterToggles,
      commuteTimeQuery: { ...filterToggles.commuteTimeQuery, filterOptions },
    }));
  }

  suggestionOnClick(suggestion) {
    const {
      AreaReducer: { areas },
      LanguageReducer: { language },
      dispatch,
    } = this.props;

    dispatch(getCommuteDestinationDetails({
      suggestion, areas, language,
    }));
  }

  render() {
    const {
      LanguageReducer: { language, applicationText: { tabFilter } },
      LanguageReducer: { applicationText },
      MapViewReducer: { commuteDestination, poiMarkers },
      ToggleReducer: {
        filterToggles: {
          expandToggles,
          housingToggles,
          commuteTimeQuery: { time, filterOptions },
        },
      },
      dispatch,
      MunicipalityReducer: { theme },
    } = this.props;

    const {
      filterData,
      showMore,
      modalIsOpen,
    } = this.state;

    const poiContainerClasses = classNames('poi-container', { 'show-more': showMore });
    const showMoreButtonClasses = classNames('blue-link', { hide: showMore });
    const themeColor = THEMES.get(theme).primaryColor;

    const filterMarkup = filterData.map(i => (
      <div className="options-container" key={i.name[language]}>
        <div className="expandable-content always-expandable">
          <input
            className="expandable-input page-width"
            id={i.name[language].toLowerCase()}
            type="checkbox"
            defaultChecked={expandToggles}
          />
          <label
            className="noselect expandable-label page-width"
            htmlFor={i.name[language].toLowerCase()}
          >
            {i.name[language]}
          </label>
          <div className="section-content">
            {i.options[language].map((o, index) => (
              <Checkbox
                key={o.toLowerCase()}
                id={o.toLowerCase()}
                cls="filter-option"
                checked={
                        !!((poiMarkers[i.options.objectLabel]
                        && poiMarkers[i.options.objectLabel][i.options.subLabels[index]]))
                      }
                onChange={() => {
                        this.onPlacesChange(
                          i.options.objectLabel,
                          i.options.subLabels[index],
                          i.options.types[index],
                          i.options.query[index],
                        );
                      }}
              >
                {o}
              </Checkbox>
                    ))}
          </div>
        </div>
      </div>
    ));

    const { Handle } = Slider;
    const handle = (props) => {
      const {
        value, dragging, index, ...restProps
      } = props;
      return (
        <Handle value={value} {...restProps}>
          <div className="slider-handle" />
        </Handle>
      );
    };

    return (
      <div className="tab-filter-inner">
        <div id="filter-top-div">
          <h2 className="m0">{tabFilter.heading}</h2>
          <p className="description">{tabFilter.preamble}</p>
          <p className="mid-label grey">{tabFilter.housingPreference}</p>
          <div className="checkboxes-container row collapse">
            <div className="columns medium-4 small-4">
              <div>
                <Checkbox
                  id="checkbox-house"
                  cls="basic"
                  checked={housingToggles[HOUSING_TYPES.HOUSE]}
                  onChange={() => this.filterOnHousingChange(HOUSING_TYPES.HOUSE)}
                >
                  {tabFilter.house}
                </Checkbox>
              </div>
            </div>
            <div className="columns medium-8 small-8">
              <Checkbox
                id="checkbox-apartment"
                cls="basic"
                checked={housingToggles[HOUSING_TYPES.APARTMENT]}
                onChange={() => this.filterOnHousingChange(HOUSING_TYPES.APARTMENT)}
              >
                {tabFilter.apartment}
              </Checkbox>
            </div>
          </div>
          <CommuteAutoComplete
            fieldLabel={tabFilter.commute}
            labelStyle="mid-label grey lh38 pin-label"
            initialPlaceName={commuteDestination.name}
            fromQuery={commuteDestination.name}
            coordinates={commuteDestination}
            suggestionOnClick={place => this.suggestionOnClick(place)}
          />
          <div className="commute-selector-wrapper">
            <div className="commute-checkbox-container car">
              <Checkbox
                id="commute-car"
                cls="commute-checkbox car"
                onChange={() => this.toggleCommuteQueryOption('driving')}
                checked={filterOptions.driving}
              />
            </div>
            <div className="commute-checkbox-container transit">
              <Checkbox
                id="commute-transit"
                cls="commute-checkbox transit"
                onChange={() => this.toggleCommuteQueryOption('transit')}
                checked={filterOptions.transit}
              />
            </div>
            <div className="commute-checkbox-container bike">
              <Checkbox
                id="commute-bike"
                cls="commute-checkbox bike"
                onChange={() => this.toggleCommuteQueryOption('bicycling')}
                checked={filterOptions.bicycling}
              />
            </div>
            <div className="commute-checkbox-container walk">
              <Checkbox
                id="commute-walk"
                cls="commute-checkbox walk"
                onChange={() => this.toggleCommuteQueryOption('walking')}
                checked={filterOptions.walking}
              />
            </div>
          </div>
          <div className="commute-heading-container">
            <p className="mid-label grey">{tabFilter.commuteMax}</p>
            <p className="time-label">{time || '-'} min</p>
          </div>
          <div className="range-wrapper">
            <Slider
              value={time}
              onChange={e => this.onSliderChange(e)}
              min={0}
              max={125}
              step={5}
              railStyle={{
              backgroundColor: '#8F979B',
              height: 3,
            }}
              trackStyle={{
              backgroundColor: themeColor,
              height: 3,
            }}
              handle={handle}
              handleStyle={{
              border: 'none',
              height: 24,
              width: 24,
            }}
            />
          </div>
        </div>
        <p className="mid-label grey expandable-content-header">{tabFilter.showOnMap}:</p>
        <div id="filter-div" name="filterDiv" className={poiContainerClasses}>
          {filterMarkup}
        </div>
        <button
          className={showMoreButtonClasses}
          onClick={() => this.setState({ showMore: !showMore })}
        >
          {tabFilter.showMore}
        </button>
        <button
          className="btn theme w100 mt25"
          onClick={() => { dispatch(changeOpenTab('')); }}
        >
          {tabFilter.showOnMap}
        </button>
        <button
          className="blue-link"
          onClick={() => { dispatch(clearFilter()); }}
        >
          {tabFilter.clearFilter}
        </button>
        <button
          className="blue-link share-icon"
          onClick={() => this.handleModal()}
        >
          {applicationText.common.share}
        </button>
        <ShareModal
          isOpen={modalIsOpen}
          parentSelector={TabFilterComponent.getModalParent}
          onRequestClose={() => this.handleModal()}
          baseClassName="favourite-modal modal-base"
          applicationText={applicationText}
          shareUrl={this.getShareUrl()}
          description={tabFilter.shareDescription}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  ToggleReducer: state.ToggleReducer,
  AreaReducer: state.AreaReducer,
  LanguageReducer: state.LanguageReducer,
  MapViewReducer: state.MapViewReducer,
  MunicipalityReducer: state.MunicipalityReducer,
});

export default connect(mapStateToProps)(TabFilterComponent);
