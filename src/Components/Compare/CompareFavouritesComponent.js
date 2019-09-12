import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import Slider from 'react-slick';
import { NavLink } from 'react-router-dom';
import CompareAreaColumn from './CompareAreaColumn';
import CompareTypesColumn from './CompareTypesColumn';
import { PrevArrow, NextArrow } from '../Carousel/CarouselArrows';
import {
  QUERY_PARAMS,
  FAV_SORT_OPTIONS,
  FACT_DISTANCE_QUERIES,
  FACT_TYPES,
  URL_TYPES,
} from '../../Constants';
import {
  sortAreasByCommuteDestination,
  sortAreasByName,
  hasAllValues,
} from '../../Utils/otherUtils';
import { getCompareValues } from '../../Utils/googleUtil';
import LoadingIndicatorComponent from '../LoadingIndicatorComponent';
import mapPinLocation from '../../Images/Icons/icon_map_pin_your_location.svg';

class CompareFavouritesComponent extends Component {
  constructor(props) {
    super(props);
    this.state = ({ comparedAreas: null });
  }

  compareAreas() {
    const {
      languageReducer: { language },
      commuteDestination,
      location,
      excludedAreas,
      areas,
    } = this.props;

    const compare = hasAllValues(areas, language, commuteDestination);

    if (compare) {
      const query = queryString.parse(location.search);
      const queryAreaIds = query[QUERY_PARAMS.AREAS].split(',');
      const queryMunicipalities = query[QUERY_PARAMS.MUNICIPALITIES].split(',');
      const allAreas = areas.concat(...excludedAreas);
      const queryAreas = [];

      queryAreaIds.forEach((areaId, index) => {
        const municipalityId = queryMunicipalities[index];
        queryAreas.push({
          areaId,
          municipalityId,
        });
      });

      // Looping through all areas and match them with areaId & municipalityId from query
      const areasToCompare = allAreas.filter(area => queryAreas.some(queryArea =>
        queryArea.areaId === area.areaId && queryArea.municipalityId === area.municipalityId));

      // Do nothing if we don't find any areas to compare
      if (areasToCompare.length === 0) return;

      getCompareValues(
        areasToCompare,
        language,
        FACT_DISTANCE_QUERIES,
        commuteDestination,
      ).then((result) => {
        this.mergeResult(areasToCompare, result);
      });
    }
  }

  mergeResult(areasToCompare, result) {
    const {
      location,
      commuteDestination,
    } = this.props;

    const mergedAreas = areasToCompare.map((area) => {
      const compare = result
        .filter(a => area.areaId === a.areaId && area.municipalityId === a.municipalityId);
      return {
        ...area,
        compare,
      };
    });

    const query = queryString.parse(location.search);
    const querySort = query[QUERY_PARAMS.SORT];
    let comparedAreas;

    if (querySort === FAV_SORT_OPTIONS.VICINITY) {
      comparedAreas = sortAreasByCommuteDestination(commuteDestination, mergedAreas);
    }
    comparedAreas = sortAreasByName(mergedAreas);

    this.setState({ comparedAreas });
  }

  render() {
    const {
      languageReducer: { applicationText },
      match: { params: { lang, municipalityName } },
    } = this.props;
    const { comparedAreas } = this.state;
    const factTypesArr = Object.values(FACT_TYPES);

    if (!comparedAreas) {
      this.compareAreas();
    }

    const slidesToShow = comparedAreas && comparedAreas.length <= 4
      ? comparedAreas.length : 4;

    const sliderSettings = {
      infinite: false,
      touchMove: false,
      swipe: false,
      slidesToShow,
      slidesToScroll: 1,
      draggable: false,
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />,
    };

    return (
      <div className="full-view-page-wrapper compare-favourites-wrapper">
        {comparedAreas ? (
          <div>
            <div className="compare-types show-for-medium">
              <CompareTypesColumn
                types={factTypesArr}
                applicationText={applicationText}
                lang={lang}
                municipalityName={municipalityName}
              />
            </div>
            <div className="top show-for-small-only">
              <p>{applicationText.compare.compareFavs}</p>
              <NavLink to={`/${lang}/${municipalityName}/${URL_TYPES.MAP}`}>
                <input
                  className="btn close"
                  type="button"
                  aria-label={applicationText.common.close}
                />
              </NavLink>
            </div>
            {factTypesArr.map((f, index) => (
              <div key={f} className={`type type-${index} show-for-small-only`}>
                <p className="m0">
                  {applicationText.factBox[f]}
                  {f === 'commuteDestination' &&
                  <img className="pin-small" src={mapPinLocation} alt="map-pin" />}
                </p>
              </div>))
            }
            <div className="slider">
              <Slider {...sliderSettings}>
                {
                  comparedAreas.map(area => (
                    <div key={area.areaId}>
                      <CompareAreaColumn
                        key={area.areaId}
                        area={area}
                        language={applicationText}
                      />
                    </div>))
                }
              </Slider>
              <div className="shadow" />
            </div>
          </div>
        ) : (
          <LoadingIndicatorComponent />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  areas: state.AreaReducer.areas,
  excludedAreas: state.AreaReducer.excludedAreas,
  languageReducer: state.LanguageReducer,
  commuteDestination: state.MapViewReducer.commuteDestination,
});

export default connect(mapStateToProps)(CompareFavouritesComponent);
