import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { getAboutService } from '../Actions/AboutServiceActions';
import { URL_TYPES } from '../Constants';
import logo from '../Images/Icons/logo_black.svg';

class AboutServiceComponent extends Component {
  componentDidMount() {
    this.props.dispatch(getAboutService());
  }
  render() {
    const {
      languageReducer: { language, applicationText: { aboutService } },
      municipalityReducer: { name },
      frontPage,
    } = this.props;
    return (
      <div>
        <div className="full-view-page-wrapper">
          <div className="white-bg">
            <div className="top-btn">
              <NavLink to={frontPage ? `/${language}/` : `/${language}/${name}/${URL_TYPES.MAP}`}>
                <input className="btn close" type="button" />
              </NavLink>
            </div>
            <article className="full-view-page-wrapper" aria-label="Om tjänsten">
              <div className="white-bg">
                <div className="header">
                  <img className="logo" src={logo} alt="vh-icon" />
                </div>
                <div>
                  <div className="main-text-content">
                    <h3>{aboutService.sectionMotivation.header}</h3>
                    <p>{aboutService.sectionMotivation.content}</p>
                    <ul>
                      {aboutService.sectionMotivation.ul.map(li => <li key={li}>{li}</li>)}
                    </ul>
                  </div>
                  <div className="main-text-content">
                    <h3>{aboutService.sectionBackground.header}</h3>
                    <p>{aboutService.sectionBackground.content}</p>
                  </div>
                  <div className="main-text-content">
                    <h3>{aboutService.sectionConnect.header}</h3>
                    <p>{aboutService.sectionConnect.contentP1}</p>
                    <p>
                      {aboutService.sectionConnect.contentP2}
                      <a
                        className="blue-link underline"
                        rel="noopener noreferrer"
                        target="_blank"
                        href={aboutService.sectionConnect.href}
                      >{aboutService.sectionConnect.href.replace('https://', '')}
                      </a>
                    </p>
                  </div>
                  <div className="main-text-content">
                    <h3>{aboutService.sectionAccessibility.header}</h3>
                    <p>{aboutService.sectionAccessibility.content}</p>
                    <ul>
                      {aboutService.sectionAccessibility.ul.map(li =>
                        (
                          <li key={li.title}>
                            {li.title}
                            <a
                              className="blue-link underline"
                              rel="noopener noreferrer"
                              target="_blank"
                              href={li.href}
                            >{aboutService.readMore}
                            </a>
                          </li>
                       ))}
                    </ul>
                  </div>
                  <div className="main-text-content about-images">
                    <img src="https://s3-eu-west-1.amazonaws.com/prod-welcome-file-storage/EU_centrerad_RGB.png" alt="EU-logo" />
                    <img src="https://s3-eu-west-1.amazonaws.com/prod-welcome-file-storage/dewire_head_with_text.png" alt="Dewire-logo" />
                  </div>
                </div>
                <div className="main-text-content">
                  <NavLink className="blue-link underline f15" to={`/${language}/${name}/${URL_TYPES.ABOUT_SERVICE}/${URL_TYPES.LICENSES}`}>
                    {aboutService.thirdParty}
                  </NavLink>
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
  municipalityReducer: state.MunicipalityReducer,
});

export default connect(mapStateToProps)(AboutServiceComponent);
