import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { Parser } from 'html-to-react';
import draftToHtml from 'draftjs-to-html';
import { getCommuteDestination } from '../Utils/localStorageUtil';
import MapViewComponent from './MapViewComponent';
import TopMenuComponent from './TopMenuComponent';
import ExploreButton from './ExploreButton';
import CommutePinModal from './CommutePinModal';
import { capitalize, changeTheme } from '../Utils/otherUtils';

class StartPageComponent extends Component {
  constructor() {
    super();

    this.htmlToReactParser = new Parser();
  }

  componentDidMount() {
    const { municipality: { theme } } = this.props;
    changeTheme(theme);
  }
  componentDidUpdate(prevProps) {
    const { municipality: { theme } } = this.props;
    const { municipality: { theme: oldTheme } } = prevProps;
    if (oldTheme !== theme) {
      changeTheme(theme, oldTheme);
    }
  }

  render() {
    const {
      toggle,
      municipality,
      mapView,
    } = this.props;

    const txt = this.props.ls.applicationText.municipalityPage;
    const lang = this.props.ls.language;
    const containerClasses = classNames('start-view-container', { hidden: toggle.hideDropDown });
    const wrapperClasses = classNames('wrapper', { hidden: toggle.hideDropDown });
    const mapViewComponent = mapView.center ? <MapViewComponent /> : null;

    return this.props.municipality.name ? (
      <div>
        <div className="start-view-wrapper" />
        <div className={containerClasses}>
          <div className="bg-image-container" style={{ backgroundImage: `url(${municipality.backgroundImage})` }}>
            <div className="bg-overlay" />
          </div>
          <div className={wrapperClasses}>
            <div className="row collapse">
              <div className="columns small-6 medium-3 logo-container">
                <img src={municipality.logoImage} alt={`${municipality.name} logo`} />
              </div>
              <div className="columns small-6 medium-9">
                <TopMenuComponent />
              </div>
            </div>
            <div className="row collapse text-wrapper">
              <div className="ta-center">
                <h1>{txt.moveTo + capitalize(municipality.name)}</h1>
              </div>
              <div className="ta-center preamble">
                {
                  municipality.preamble ?
                  this.htmlToReactParser.parse(draftToHtml(municipality.preamble[lang].content)) :
                  null
                }
              </div>
            </div>
          </div>
          <ExploreButton />
        </div>
        {toggle.hideDropDown && toggle.showAll && !getCommuteDestination() && <CommutePinModal />}
        {mapViewComponent}
      </div>
    ) : null;
  }
}
const mapStateToProps = state => ({
  ls: state.LanguageReducer,
  toggle: state.ToggleReducer,
  municipality: state.MunicipalityReducer,
  mapView: state.MapViewReducer,
  AreaReducer: state.AreaReducer,
});
export default connect(mapStateToProps)(StartPageComponent);
