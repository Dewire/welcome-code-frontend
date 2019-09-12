import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import ReactGA from 'react-ga';
import { toggleShowAll } from '../Actions/ToggleActions';
import { URL_TYPES } from '../Constants';


class ExploreButton extends Component {
  render() {
    const {
      dispatch,
      municipalityReducer: { name },
      languageReducer: { language, applicationText: { municipalityPage } },
      toggleReducer: { showAll, hideDropDown },
      cls,
    } = this.props;
    return (
      <button
        aria-label={hideDropDown ? municipalityPage.start : municipalityPage.explore}
        onClick={() => {
          if (hideDropDown) {
            ReactGA.event({
              category: 'UI Event',
              label: 'Show Start from explore button',
            });
            dispatch(push(`/${language}/${name}/${URL_TYPES.START}`));
          } else {
            ReactGA.event({
              category: 'UI Event',
              label: 'Show Map from explore button',
            });
            dispatch(push(`/${language}/${name}/${URL_TYPES.MAP}`));
          }
          dispatch(toggleShowAll(!showAll));
        }}
        className={`explore-button btn-content ${cls} ${hideDropDown ? 'show-all' : ''}`}
      >
        <p>
          {hideDropDown ? municipalityPage.start : municipalityPage.explore}
        </p>
      </button>
    );
  }
}

const mapStateToProps = state => ({
  municipalityReducer: state.MunicipalityReducer,
  languageReducer: state.LanguageReducer,
  toggleReducer: state.ToggleReducer,
});

export default connect(mapStateToProps)(ExploreButton);
