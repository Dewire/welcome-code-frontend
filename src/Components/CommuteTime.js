/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import debounce from 'debounce';
import { getDistanceObj } from '../Utils/googleUtil';
import { capitalize } from '../Utils/otherUtils';
import ExpandableContent from './ExpandableContent';
import CommuteAutoComplete from './CommuteAutoComplete';

class CommuteTime extends Component {
  constructor() {
    super();

    this.state = {
      destination: {
        name: '-',
      },
      travel: {
        car: '- min',
        transit: '- min',
        bike: '- min',
        walk: '- min',
        distance: '- km',
      },
    };

    this.autoCompletePlaces = debounce(this.autoCompletePlaces, 500);
  }

  fetchCommuteDurations(place) {
    const {
      area: { coordinates },
      LanguageReducer: { language },
    } = this.props;

    getDistanceObj(
      `${coordinates.lat},${coordinates.long}`,
      place.place_id,
      place.description,
      language,
    ).then((resp) => {
      this.setState({
        destination: { name: place.description.replace(', Sverige', '').replace(', Sweden', '') },
        travel: resp,
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  render() {
    const {
      area: { name, coordinates },
      LanguageReducer: { applicationText: { commuteTime } },
    } = this.props;

    const {
      destination,
      travel: {
        car, transit, bike, walk, distance,
      },
    } = this.state;

    return (
      <ExpandableContent
        id={commuteTime.heading}
        header={commuteTime.heading}
        hideDivider
      >
        <div className="main-text-content">
          <div className="commute-time">
            <p className="preamble">{commuteTime.preamble}</p>
            <div className="row collapse">
              <div className="columns medium-4 float-left">
                <CommuteAutoComplete
                  fieldLabel={commuteTime.whereTo}
                  coordinates={coordinates}
                  suggestionOnClick={place => this.fetchCommuteDurations(place)}
                />
              </div>
            </div>
            <div className="row collapse top-row">
              <div className="columns medium-10 float-left text-input-wrapper">
                <p className="f15 grey semi-bold result">{commuteTime.yourResult}</p>
                <p className="f15 semi-bold result">{`${commuteTime.fromPlaceholder + capitalize(name)} ${commuteTime.toPlaceholder} ${destination.name}`}</p>
              </div>
              <div className="columns medium-2">
                <p className="f18 grey semi-bold distance">{`${distance}`}</p>
              </div>
            </div>
            <div className="row collapse commute-row">
              <div className="columns medium-3 small-12">
                <div className="commute-container">
                  <div className="inner car">
                    <p className="f18 grey semi-bold">{`${car}`}</p>
                  </div>
                </div>
              </div>
              <div className="columns medium-3 small-12">
                <div className="commute-container">
                  <div className="inner public">
                    <p className="f18 grey semi-bold">{`${transit}`}</p>
                  </div>
                </div>
              </div>
              <div className="columns medium-3 small-12">
                <div className="commute-container">
                  <div className="inner bike">
                    <p className="f18 grey semi-bold">{`${bike}`}</p>
                  </div>
                </div>
              </div>
              <div className="columns medium-3 small-12">
                <div className="commute-container">
                  <div className="inner walk">
                    <p className="f18 grey semi-bold">{`${walk}`}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ExpandableContent>);
  }
}

const mapStateToProps = state => ({
  LanguageReducer: state.LanguageReducer,
  MunicipalityReducer: state.MunicipalityReducer,
});

export default connect(mapStateToProps)(CommuteTime);
