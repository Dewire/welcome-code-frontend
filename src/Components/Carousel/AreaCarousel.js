/* eslint-env browser */
import React, { Component } from 'react';
import Slider from 'react-slick';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { sortAreasByDistance } from '../../Utils/otherUtils';
import placeholderImage from '../../Images/Placeholders/villaomr.png';
import { URL_TYPES } from '../../Constants';
import carouselSettings from './CarouselSettings';

class AreaCarousel extends Component {
  render() {
    const {
      areas,
      selectedArea,
      LanguageReducer: {
        language,
        applicationText,
        applicationText: { areaCarousel },
      },
      MunicipalityReducer,
    } = this.props;

    const areasToRender = areas && selectedArea && selectedArea.name ?
      sortAreasByDistance(selectedArea, areas) :
      areas;

    const settings = carouselSettings(areasToRender, selectedArea, applicationText);

    return (
      <div>
        <div className="main-text-content">
          <h2 className="grey-mobile-only">
            {selectedArea ? areaCarousel.headingArea : areaCarousel.headingMunicipality}
          </h2>
        </div>
        <div className="area-carousel-wrapper">
          <Slider {...settings}>
            {areasToRender &&
            areasToRender.map(area => (

              <div key={area.areaId}>
                <NavLink
                  onClick={() => { window.scrollTo(0, 0); }}
                  to={`/${language}/${MunicipalityReducer.name}/${URL_TYPES.AREA}/${area.name.toLowerCase()}`}
                >
                  <div
                    className="area-image"
                    style={{ backgroundImage: `url(${area.thumbnail || placeholderImage})` }}
                    aria-label={area.name}
                  />
                  <p>{area.name}</p>
                </NavLink>
              </div>
            ))
          }
          </Slider>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  LanguageReducer: state.LanguageReducer,
  MunicipalityReducer: state.MunicipalityReducer,
});

export default connect(mapStateToProps)(AreaCarousel);
