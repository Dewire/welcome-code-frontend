import React, { Component } from 'react';
import Slider from 'react-slick';
import { connect } from 'react-redux';

import { PrevArrow, NextArrow } from './CarouselArrows';
import { parseFactValue } from '../../Utils/otherUtils';
import mapPinLocation from '../../Images/Icons/icon_map_pin_your_location.svg';

class FactCarousel extends Component {
  render() {
    const {
      LanguageReducer: {
        applicationText: {
          common: {
            next, prev,
          },
        },
      },
    } = this.props;
    const settings = {
      infinite: true,
      slidesToShow: 4,
      slidesToScroll: 1,
      draggable: false,
      nextArrow: <NextArrow label={next} />,
      prevArrow: <PrevArrow label={prev} />,
      responsive: [
        {
          breakpoint: 640,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        }],
    };
    const {
      facts,
      titles,
    } = this.props;
    return (
      <div className="facts-wrapper">
        <div className="fact-box-wrapper">
          <Slider {...settings}>
            {
              facts.map((fact) => {
                const factValue = parseFactValue(fact.type, fact.value);
                return (
                  <div className="fact-box" key={fact.type}>
                    <div className="content-wrapper">
                      <div className="title">
                        <div className="inner">
                          <p>
                            {titles[fact.type]}
                            {fact.type === 'commuteDestination' &&
                            <img className="pin" src={mapPinLocation} alt="map-pin" />}
                          </p>
                        </div>
                      </div>
                      <p className="metric-value">{factValue.value > 0 ? factValue.value : '-'}</p>
                      <p className="metric-type">{factValue.metric}</p>
                    </div>
                  </div>
                );
              })
            }
          </Slider>
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  LanguageReducer: state.LanguageReducer,
});

export default connect(mapStateToProps)(FactCarousel);
