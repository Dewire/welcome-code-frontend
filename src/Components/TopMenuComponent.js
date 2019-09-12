/* eslint-env browser */
/* eslint jsx-a11y/label-has-for: 0 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { push } from 'react-router-redux';
import ReactGA from 'react-ga';
import { changeLanguage } from '../Actions/LanguageActions';
import {
  changeLanguageVisibility,
  changeInformationVisibility,
  closeTopMenuDropdowns,
} from '../Actions/ToggleActions';
import Input from './Input';
import english from '../Images/Icons/icon_english.svg';
import swedish from '../Images/Icons/icon_swedish.svg';
import information from '../Images/Icons/icon_information_white.svg';
import { URL_TYPES } from '../Constants';

class TopMenuComponent extends Component {
  componentDidMount() {
    document.addEventListener('mousedown', e => this.handleClickOutside(e));
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', e => this.handleClickOutside(e));
  }
  setWrapperRef(node) {
    this.wrapperRef = node;
  }
  handleClickOutside(e) {
    if (this.wrapperRef && !this.wrapperRef.contains(e.target)) {
      const { dispatch, ToggleReducer } = this.props;
      if (ToggleReducer.informationVisible || ToggleReducer.languageVisible) {
        dispatch(closeTopMenuDropdowns());
      }
    }
  }
  changeLanguage(e) {
    const {
      router: { location: { pathname } },
      dispatch,
    } = this.props;

    const lang = e.target.value;
    ReactGA.event({
      category: 'UI Event',
      action: 'Language change',
      label: `Change to ${lang}'`,
    });

    const newPathname = pathname === '/' || pathname === '/404' ? '/sv/' : pathname;

    dispatch(changeLanguage(lang));
    dispatch(push(lang === 'sv' ? newPathname.replace('/en/', '/sv/') : newPathname.replace('/sv/', '/en/')));
    dispatch(closeTopMenuDropdowns());
  }
  render() {
    const {
      ls, // LanguageStore
      ls: { applicationText },
      ls: { applicationText: { municipalityPage } },
      dispatch,
      ToggleReducer,
      MunicipalityReducer,
      frontPage,
    } = this.props;
    const languageIcon = ls.language === 'en' ? english : swedish;
    return (
      <div className="top-menu-wrapper" ref={node => this.setWrapperRef(node)} >
        <div className="show-for-small-only">
          <ul className="top-menu">
            <li
              tabIndex="0"
              onClick={() => dispatch(changeInformationVisibility(true))}
              onKeyPress={() => dispatch(changeInformationVisibility(true))}
              role="menuitem"
            >
              <img src={information} alt={ls.information} />
            </li>
            <li
              tabIndex="0"
              onClick={() => dispatch(changeLanguageVisibility(true))}
              onKeyPress={() => dispatch(changeLanguageVisibility(true))}
              role="menuitem"
            >
              <img src={languageIcon} alt={municipalityPage.language} />
            </li>
          </ul>
        </div>
        <div
          className={`${ToggleReducer.informationVisible ? '' : 'is-hidden'} drop-down-wrapper information`}
        >
          <div className="arrow-up" />
          <div className="dd-inner-wrapper">
            {
            !frontPage &&
            <div>
              <div className="row">
                <NavLink to={`/${ls.language}/${MunicipalityReducer.name}/${URL_TYPES.ABOUT_MUNICIPALITY}`}>
                  {municipalityPage.aboutMunicipality}
                </NavLink>
              </div>
              <div className="separator" />
            </div>
          }
            <div className="row">
              <NavLink to={
                !frontPage ? `/${ls.language}/${MunicipalityReducer.name}/${URL_TYPES.ABOUT_SERVICE}`
                : `/${ls.language}/${URL_TYPES.ABOUT_SERVICE}`
              }
              >
                {municipalityPage.aboutService}
              </NavLink>
            </div>
          </div>
        </div>
        <div
          className={`${ToggleReducer.languageVisible ? '' : 'is-hidden'} drop-down-wrapper language`}
        >
          <div className="arrow-up" />
          <div className="dd-inner-wrapper">
            <div className="row">
              <Input
                type="radio"
                value="sv"
                name="language"
                id="language-sv"
                onChange={e => this.changeLanguage(e)}
              />
              <label
                htmlFor="language-sv"
                className={ls.language === 'sv' ? 'checked' : 'unchecked'}
              >
                {applicationText.swedish}
              </label>
            </div>
            <div className="separator" />
            <div className="row">
              <Input
                type="radio"
                value="en"
                name="language"
                id="language-en"
                onChange={e => this.changeLanguage(e)}
              />
              <label
                htmlFor="language-en"
                className={ls.language === 'en' ? 'checked' : 'unchecked'}
              >
                {applicationText.english}
              </label>
            </div>
          </div>
        </div>
        <div className="hide-for-small-only top-menu">
          <ul>
            {
              !frontPage &&
              <li>
                <NavLink to={`/${ls.language}/${MunicipalityReducer.name}/${URL_TYPES.ABOUT_MUNICIPALITY}`}>
                  {municipalityPage.aboutMunicipality}
                </NavLink>
              </li>
            }
            <li>
              <NavLink to={
                !frontPage ? `/${ls.language}/${MunicipalityReducer.name}/${URL_TYPES.ABOUT_SERVICE}` :
                `/${ls.language}/${URL_TYPES.ABOUT_SERVICE}`
              }
              >
                {municipalityPage.aboutService}
              </NavLink>
            </li>
            <li
              onClick={() => dispatch(changeLanguageVisibility(true))}
              onKeyPress={() => dispatch(changeLanguageVisibility(true))}
              role="menuitem"
              className={ToggleReducer.languageVisible ? 'language-selected' : ''}
              tabIndex="0"
            >
              {municipalityPage.language}
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  router: state.router,
  ls: state.LanguageReducer,
  ToggleReducer: state.ToggleReducer,
  MunicipalityReducer: state.MunicipalityReducer,
});

export default connect(mapStateToProps)(TopMenuComponent);
