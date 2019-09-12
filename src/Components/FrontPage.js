import React, { Component } from 'react';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import { fetchAllMunicipalities } from '../Utils/fetcherUtil';
import { capitalize } from '../Utils/otherUtils';
import logo from '../Images/Icons/logo_white.svg';
import mapPinLocation from '../Images/Icons/icon_map_pin_your_location.svg';
import TopMenuComponent from './TopMenuComponent';
import { URL_TYPES } from '../Constants';

class FrontPage extends Component {
  constructor(props) {
    super(props);
    this.state = { municipalities: [] };
  }
  componentDidMount() {
    fetchAllMunicipalities().then((result) => {
      this.setState({ municipalities: result.data });
    }).catch((error) => {
      console.log(error);
    });
  }
  render() {
    const {
      dispatch,
      languageReducer: { language, applicationText: { frontPage } },
    } = this.props;
    const { municipalities } = this.state;

    return (
      <div className="frontpage-wrapper">
        <div className="background">
          <div className="inner" />
        </div>
        <div>
          <div>
            <article aria-label={frontPage.frontPage}>
              <div className="start-view-container">
                <div className="header">
                  <TopMenuComponent frontPage />
                  <img className="logo" src={logo} alt="vh-icon" />
                  <p>{frontPage.preamble}</p>
                </div>
                <div className="municipality-list">
                  {municipalities.length > 0 &&
                  <div>
                    {
                      municipalities.map(municipality => municipality.name)
                        .sort((a, b) => a.localeCompare(b, 'sv'))
                        .map(name =>
                        (
                          <div key={name}>
                            <button
                              className="municipality-link"
                              onClick={() => {
                              dispatch(push(`/${language}/${name}/${URL_TYPES.START}`));
                            }}
                            >
                              <img className="map-pin" src={mapPinLocation} alt="map-pin" />
                              {capitalize(name)}
                            </button>
                          </div>
                      ))
                    }
                  </div>
                }
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  languageReducer: state.LanguageReducer,
});


export default connect(mapStateToProps)(FrontPage);
