import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DISTANCE_TABLE_DESTINATIONS } from '../Constants';
import { getDistanceBetweenCoordinates } from '../Utils/otherUtils';
import ExpandableContent from './ExpandableContent';

class DistanceTable extends Component {
  static renderTableRows(coordinates, language) {
    return coordinates ?
      DISTANCE_TABLE_DESTINATIONS.map(d => (
        <div className="row" key={d.name}>
          <p className="destination">{d.name}</p>
          <p className="distance">
            {
            language === 'sv' ? `${Math.round(getDistanceBetweenCoordinates(coordinates, d.coordinates) / 10)} mil` :
            `${Math.round(getDistanceBetweenCoordinates(coordinates, d.coordinates))} km`
          }
          </p>
        </div>
      )) :
      null;
  }

  render() {
    const {
      area: { coordinates },
      LanguageReducer: { language, applicationText: { distanceTable } },
    } = this.props;

    const tableRows = DistanceTable.renderTableRows(coordinates, language);

    return (
      <ExpandableContent
        id={distanceTable}
        header={distanceTable}
      >
        <div className="main-text-content">
          <div className="distance-table">
            {tableRows}
          </div>
        </div>
      </ExpandableContent>);
  }
}

const mapStateToProps = state => ({
  LanguageReducer: state.LanguageReducer,
});

export default connect(mapStateToProps)(DistanceTable);
