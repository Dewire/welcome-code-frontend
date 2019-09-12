import React from 'react';
import { NavLink } from 'react-router-dom';
import { URL_TYPES } from '../../Constants';
import mapPinLocation from '../../Images/Icons/icon_map_pin_your_location.svg';

const CompareTypesColumn = ({
  types, applicationText, lang, municipalityName,
}) => (
  <div className="compare-types-wrapper">
    <div className="top-wrapper">
      <div className="close-wrapper">
        <NavLink to={`/${lang}/${municipalityName}/${URL_TYPES.MAP}`}>
          <input className="btn close" type="button" aria-label={applicationText.common.close} />
        </NavLink>
      </div>
      <div className="text-content">
        <h2>{applicationText.compare.compareFavs}</h2>
        <p>{applicationText.compare.compareFavsPreamble}</p>
        <p className="bottom">{applicationText.compare.locationInformation}</p>
      </div>
    </div>
    <div className="rows-wrapper">
      {types.map(t => (
        <div key={t}>
          <p>
            {applicationText.factBox[t]}
            {t === 'commuteDestination' &&
            <img className="pin" src={mapPinLocation} alt="map-pin" />}
          </p>
        </div>
        ))}
    </div>
  </div>
);

export default CompareTypesColumn;
