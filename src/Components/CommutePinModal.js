import React, { Component } from 'react';
import { connect } from 'react-redux';
import Rodal from 'rodal';
import CommuteAutoComplete from './CommuteAutoComplete';
import { getCommuteDestinationDetails, setCommuteDestination } from '../Actions/MapViewActions';
import mapPinLocation from '../Images/Icons/icon_map_pin_your_location.svg';

class CommutePinModal extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: true };
  }

  show() {
    this.setState({ visible: true });
  }

  hide() {
    const { mapViewReducer: { commuteDestination }, dispatch } = this.props;

    this.setState({ visible: false });
    dispatch(setCommuteDestination(commuteDestination));
  }

  suggestionOnClick(suggestion) {
    const {
      areaReducer: { areas },
      languageReducer: { language },
      dispatch,
    } = this.props;

    this.hide();
    dispatch(getCommuteDestinationDetails({
      suggestion, areas, language,
    }));
  }

  render() {
    const {
      mapViewReducer: { commuteDestination },
      languageReducer: {
        applicationText: {
          tabFilter: { commute },
          common: { close },
          commutePinModal: {
            header, contentP1, contentP2, contentP3,
          },
        },
      },
    } = this.props;

    return (
      <div>
        {commuteDestination &&
        <Rodal
          className="commute-pin-modal"
          visible={this.state.visible}
          onClose={() => { this.hide(); }}
        >
          <div className="header-container">
            <img className="pin" src={mapPinLocation} alt="map-pin" />
            <h3>{header}</h3>
          </div>
          <div className="clear" />
          <p className="content">
            {contentP1}
          </p>
          <p className="content">
            {contentP2}
          </p>
          <p className="content">
            {contentP3}
          </p>
          <CommuteAutoComplete
            fieldLabel={commute}
            labelStyle="mid-label grey lh38"
            initialPlaceName={commuteDestination.name}
            fromQuery={commuteDestination.name}
            coordinates={commuteDestination}
            suggestionOnClick={place => this.suggestionOnClick(place)}
          />
          <button onClick={() => { this.hide(); }} className="screen-reader-text">{close}</button>
        </Rodal>}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  toggleReducer: state.ToggleReducer,
  mapViewReducer: state.MapViewReducer,
  languageReducer: state.LanguageReducer,
  municipalityReducer: state.MunicipalityReducer,
  areaReducer: state.AreaReducer,
});

export default connect(mapStateToProps)(CommutePinModal);
