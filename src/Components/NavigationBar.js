/* eslint-env browser */
import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import {
  toggleHamburgerMenu,
  changeOpenTab,
  setContactNotification,
  toggleNavbarAbout,
} from '../Actions/ToggleActions';
import { TAB_TYPES, URL_TYPES } from '../Constants';
import { getLocalAreaData } from '../Utils/localStorageUtil';

class NavigationBar extends Component {
  componentDidMount() {
    setTimeout(() => {
      this.props.dispatch(setContactNotification(true));
    }, 30000);
    document.addEventListener('mousedown', e => this.handleClickOutside(e));
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', e => this.handleClickOutside(e));
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(e) {
    if ((this.wrapperRef && !this.wrapperRef.contains(e.target))) {
      const {
        dispatch,
        toggle: { navbarAbout },
      } = this.props;
      if (navbarAbout && e.target.id !== 'information-button') {
        dispatch(toggleNavbarAbout(false));
      }
    }
  }

  toggleNavigationBar() {
    const {
      dispatch,
      toggle: { hamburgerMenu },
    } = this.props;
    dispatch(toggleHamburgerMenu(!hamburgerMenu));
  }

  render() {
    const {
      dispatch,
      toggle: {
        showAll, hamburgerMenu, openTab, showContactNotification, navbarAbout,
      },
      languageReducer: { applicationText: { navigationBar, municipalityPage } },
      languageReducer,
      municipalityReducer,
    } = this.props;

    return (
      <ReactCSSTransitionGroup
        transitionName="nav-bar"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}
      >
        {showAll ?
          <div className={hamburgerMenu ? 'navigation-bar-wrapper hamburger' : 'navigation-bar-wrapper'} >
            <div className="row show-for-small-only sticky-top">
              <div className={classNames('contact-circle', { hide: !showContactNotification })}>
                <p>1</p>
              </div>
              <input type="button" className={hamburgerMenu ? 'hamburger-button' : 'close-button'} onClick={() => this.toggleNavigationBar()} />
            </div>
            <div className="inner-wrapper">
              <div className="row align-center-middle">
                <label className={classNames('border-top', { selected: openTab === TAB_TYPES.FILTER })} htmlFor="filter-button">
                  <input
                    type="button"
                    id="filter-button"
                    className="icon-filter"
                    onClick={() => dispatch(changeOpenTab(TAB_TYPES.FILTER))}
                  />
                  {navigationBar.filter}
                </label>
              </div>
              <div className="row">
                <label
                  className={
              classNames({ selected: openTab === TAB_TYPES.FAVORITES })}
                  htmlFor="favourites-button"
                >
                  <input
                    type="button"
                    id="favourites-button"
                    className={
                classNames('icon-favourites', { 'has-favourites': getLocalAreaData().length !== 0 })}
                    onClick={() => dispatch(changeOpenTab(TAB_TYPES.FAVORITES))}
                  />
                  {navigationBar.favorites}
                </label>
              </div>
              {/* Disabled for now. Needs work.}
              <div className="row">
                <label
                  className={
              classNames({ selected: openTab === TAB_TYPES.SEARCH })}
                  htmlFor="search-button"
                >
                  <input
                    type="button"
                    id="search-button"
                    className="icon-search"
                    onClick={() => dispatch(changeOpenTab(TAB_TYPES.SEARCH))}
                  />
                  {navigationBar.search}
                </label>
              </div>
              { */}
              <div className="row contact-row">
                <div className={classNames('contact-circle', { hide: !showContactNotification })}>
                  <p>1</p>
                </div>
                <label
                  className={
              classNames({ selected: openTab === TAB_TYPES.CONTACT })}
                  htmlFor="contact-button"
                >
                  <input
                    type="button"
                    id="contact-button"
                    className="icon-contact"
                    onClick={() => {
                  dispatch(changeOpenTab(TAB_TYPES.CONTACT));
                  dispatch(setContactNotification(false));
                }}
                  />
                  {navigationBar.contact}
                </label>
              </div>
            </div>
            <div className="row show-for-small-only sticky-bottom">
              <input
                type="button"
                id="information-button"
                className="icon-information"
                onClick={() => dispatch(toggleNavbarAbout(!navbarAbout))}
              />
            </div>
            <div
              className={classNames('drop-down-wrapper navigationbar', { hide: !navbarAbout })}
              ref={node => this.setWrapperRef(node)}
            >
              <div className="dd-inner-wrapper">
                <input
                  type="button"
                  className="btn close"
                  onClick={() => dispatch(toggleNavbarAbout(!navbarAbout))}
                />
                <div className="row">
                  <NavLink
                    to={`/${languageReducer.language}/${municipalityReducer.name}/${URL_TYPES.ABOUT_MUNICIPALITY}`}
                  >
                    {municipalityPage.aboutMunicipality}
                  </NavLink>
                </div>
                <div className="separator" />
                <div className="row">
                  <NavLink
                    to={`/${languageReducer.language}/${municipalityReducer.name}/${URL_TYPES.ABOUT_SERVICE}`}
                  >
                    {municipalityPage.aboutService}
                  </NavLink>
                </div>
              </div>
              <div className="arrow-down" />
            </div>
          </div>
        : null}
      </ReactCSSTransitionGroup>
    );
  }
}

const mapStateToProps = state => ({
  toggle: state.ToggleReducer,
  languageReducer: state.LanguageReducer,
  municipalityReducer: state.MunicipalityReducer,
  areaReducer: state.AreaReducer,
});

export default connect(mapStateToProps)(NavigationBar);
