/* eslint-env browser */
import React, { Component } from 'react';
import classNames from 'classnames';
import ReactGA from 'react-ga';

const placeholderImage = require('../Images/Placeholders/villaomr.png');
const houseImg = require('../Images/Icons/icon_house.svg');
const carImage = require('../Images/Icons/icon_car.svg');
const bicycleImage = require('../Images/Icons/icon_bicycle.svg');
const arrowRightImage = require('../Images/Icons/icon_arrow_right.svg');

class AreaCardComponent extends Component {
  onFavClick() {
    const {
      areaFavOnClick,
      favourites,
      openArea,
    } = this.props;
    areaFavOnClick(favourites, openArea);
  }

  render() {
    const {
      LanguageReducer: { applicationText: { area, common: { close } } },
      MunicipalityReducer: { name: municipalityName },
      navigationOnClick,
      closeOnClick,
      openArea: {
        name,
        thumbnail,
        avgPrice,
        isFav,
        commute: { bicycling, driving },
      },
    } = this.props;

    ReactGA.event({
      category: 'UI Event',
      action: 'Area card click',
      label: `Clicked area card: ${name} (${municipalityName})`,
    });
    return (
      <div className="area-card-container">
        <div className="wrapper">
          <div className="row collapse main-dividers top" style={{ backgroundImage: `url(${thumbnail || placeholderImage})` }}>
            <div className="close-container">
              <button
                className="btn close-circle"
                id="close-btn"
                onClick={closeOnClick}
                aria-label={close}
              />
            </div>
            <button className="navigation-button" onClick={navigationOnClick}>
              <div className="row collapse name-container">
                <p>{name}</p>
                <img className="arrow" src={arrowRightImage} alt="arrow" />
              </div>
            </button>
          </div>
          <div className="row collapse main-dividers bottom">
            <div className="row collapse">
              <div className="link-container">
                <input
                  id="fav-btn"
                  type="button"
                  className={classNames('blue-link underline heart-icon', { filled: isFav })}
                  value={area.saveArea}
                  onClick={() => {
                    ReactGA.event({
                      category: 'UI Event',
                      action: 'Area card click',
                      label: 'Clicked save area',
                    });
                    this.onFavClick();
                  }}
                />
              </div>
            </div>
            <div className="row collapse mlr10">
              <div className="columns small-4 medium-12 icon-container">
                <img src={houseImg} alt="housing-price" />
              </div>
              <div className="columns small-4 medium-12 icon-container">
                <img src={carImage} alt="car" />
              </div>
              <div className="columns small-4 medium-12 icon-container">
                <img src={bicycleImage} alt="bicycle" />
              </div>
            </div>
            <div className="row collapse mlr10 text-row">
              <div className="columns small-4 medium-12 text-container">
                { /* TODO: Fix sq meter after adding feature toggle in admin */}
                <p>{avgPrice ? `~ ${avgPrice.toLocaleString('sv-SE')} kr` : '-'}</p>
              </div>
              <div className="columns small-4 medium-12 text-container">
                <p>{driving.duration ? driving.duration.text : '-'}</p>
              </div>
              <div className="columns small-4 medium-12 text-container">
                <p>{bicycling.duration ? bicycling.duration.text : '-'}</p>
              </div>
            </div>
            <div className="marker-container hide-for-small-only" />
          </div>
        </div>
      </div>
    );
  }
}

export default AreaCardComponent;
