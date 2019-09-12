import React, { Component } from 'react';
import { connect } from 'react-redux';
import { capitalize } from '../Utils/otherUtils';
import ExpandableContent from './ExpandableContent';

class DistanceTable extends Component {
  render() {
    const {
      area: { name, coordinates },
      LanguageReducer: { applicationText: { streetView } },
    } = this.props;

    const iframeSrc = `https://www.google.com/maps/embed/v1/streetview?key=AIzaSyD9mys_yjq-VFWtgBYErp7yg82Pa9IViUc&location=${coordinates.lat},${coordinates.long}`;

    return (
      <div className="street-view">
        <ExpandableContent
          id={streetView.heading}
          header={capitalize(name) + streetView.heading}
        >
          <div className="main-text-content">
            <p className="preamble">
              {streetView.preamble}
            </p>
          </div>
          <div className="full-width-item">
            <div className="iframe-wrapper">
              <iframe
                title={streetView.linkText}
                src={iframeSrc}
                allowFullScreen
              />
            </div>
          </div>
        </ExpandableContent>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  LanguageReducer: state.LanguageReducer,
  MunicipalityReducer: state.MunicipalityReducer,
});

export default connect(mapStateToProps)(DistanceTable);
