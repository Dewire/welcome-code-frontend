/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import debounce from 'debounce';
import ReactGA from 'react-ga';
import { getAutocompletePlacesSuggestion } from '../Utils/googleUtil';

class CommuteTime extends Component {
  constructor() {
    super();

    this.state = {
      acSuggestions: [],
      query: '',
      querySelectedFlag: false,
    };

    this.autoCompletePlaces = debounce(this.autoCompletePlaces, 500);
  }

  componentDidMount() {
    this.setInitialQuery();
    document.addEventListener('click', (e) => { this.resetDropdown(e); });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.initialPlaceName !== nextProps.initialPlaceName) {
      this.setState({ query: nextProps.initialPlaceName });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', (e) => { this.resetDropdown(e); });
  }

  setInitialQuery() {
    this.setState({ query: this.props.initialPlaceName, querySelectedFlag: true });
  }

  resetDropdown(e) {
    if (e.target.id !== 'commute-time-search') {
      this.setState({
        acSuggestions: [],
      });
    }
  }

  autoCompletePlaces(input) {
    const {
      coordinates,
      LanguageReducer: { language },
    } = this.props;

    getAutocompletePlacesSuggestion(coordinates, input, language)
      .then((resp) => {
        this.setState({
          acSuggestions: resp.predictions,
        });
      });
  }

  keyUpListener(e) {
    this.autoCompletePlaces(e.target.value);
  }

  fieldOnClick() {
    ReactGA.event({
      category: 'UI Event',
      action: 'Filter click',
      label: 'Search filter was focused',
    });
    if (this.state.querySelectedFlag) {
      this.clearSearch();
      this.setState({ querySelectedFlag: true });
    }
  }

  clearSearch() {
    this.setState({
      query: '',
      querySelectedFlag: false,
    });
  }

  render() {
    const {
      LanguageReducer: { applicationText: { commuteTime } },
      fieldLabel,
      labelStyle,
    } = this.props;

    const {
      acSuggestions,
      query,
    } = this.state;

    const suggestionList = acSuggestions ?
      acSuggestions.map(suggestion => (
        <button
          key={suggestion.id}
          className="btn"
          onClick={() => {
            ReactGA.event({
              category: 'UI Event',
              action: 'Filter click',
              label: `Search filter: ${suggestion.description}`,
            });

            this.props.suggestionOnClick(suggestion);
            this.setState({
              query: suggestion.description.replace(', Sverige', '').replace(', Sweden', ''),
              querySelectedFlag: true,
            });
          }}
        >
          <div className="result-row">
            <div className="map-icon" />
            {suggestion.description.replace(', Sverige', '').replace(', Sweden', '')}
          </div>
        </button>
      ))
      : null;

    return (
      <div className="text-input-wrapper">
        <label className={labelStyle} htmlFor="commute-time-search">
          {fieldLabel}
          <input
            id="commute-time-search"
            className="text-input theme"
            type="text"
            placeholder={commuteTime.toPlaceholder}
            value={query || ''}
            onClick={() => { this.fieldOnClick(); }}
            onKeyUp={(e) => { this.keyUpListener(e); }}
            onChange={(e) => {
              this.setState({
                query: e.target.value,
              });
            }}
          />
        </label>
        <div className="commute-results-wrapper">
          <div className="inner">
            {suggestionList}
          </div>
        </div>
      </div>);
  }
}

const mapStateToProps = state => ({
  LanguageReducer: state.LanguageReducer,
  MunicipalityReducer: state.MunicipalityReducer,
});

export default connect(mapStateToProps)(CommuteTime);
