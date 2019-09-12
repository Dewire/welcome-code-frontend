import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ReactGA from 'react-ga';
import { changeOpenTab } from '../../Actions/ToggleActions';
import { TAB_TYPES } from '../../Constants';
import TabContactComponent from './TabContactComponent';
import TabSearchComponent from './TabSearchComponent';
import TabFilterComponent from './TabFilterComponent';
import TabFavouritesComponent from './TabFavouritesComponent';
import { getLocalAreaData } from '../../Utils/localStorageUtil';

class TabComponent extends Component {
  closeTabView() {
    const { dispatch } = this.props;
    dispatch(changeOpenTab(''));
  }

  renderOpenTab() {
    const {
      languageReducer: {
        applicationText: {
          common: { close },
        },
      },
      toggle: { openTab, tabLoading }, areaClickHandler, mapCenter,
    } = this.props;

    const wrapperClasses = classNames('tab-wrapper', { hidden: !openTab, loading: tabLoading });
    let tabToRender = null;
    let hideTabClose = null;

    switch (openTab) {
      case TAB_TYPES.CONTACT:
        tabToRender = <TabContactComponent closeTabView={() => this.closeTabView()} />;
        ReactGA.event({
          category: 'UI Event',
          action: 'Tab click',
          label: 'Show Contact',
        });
        break;
        // TODO: remove search component?
      case TAB_TYPES.SEARCH:
        tabToRender = <TabSearchComponent areaClickHandler={areaClickHandler} />;
        break;
      case TAB_TYPES.FILTER:
        tabToRender = <TabFilterComponent mapCenter={mapCenter} />;
        ReactGA.event({
          category: 'UI Event',
          action: 'Tab click',
          label: 'Show Filter',
        });
        break;
      case TAB_TYPES.FAVORITES:
        tabToRender = <TabFavouritesComponent />;
        hideTabClose = getLocalAreaData().length === 0;
        ReactGA.event({
          category: 'UI Event',
          action: 'Tab click',
          label: 'Show Favourites',
        });
        break;
      default:
        tabToRender = null;
    }

    return (
      openTab ?
        <div className={wrapperClasses} id="tab-modal-parent">
          <div className="loading-indicator">
            <div className="sk-folding-cube">
              <div className="sk-cube1 sk-cube" />
              <div className="sk-cube2 sk-cube" />
              <div className="sk-cube4 sk-cube" />
              <div className="sk-cube3 sk-cube" />
            </div>
          </div>
          <div id="tab-content-div" className="tab-content">
            {!hideTabClose &&
              <input
                aria-label={close}
                className="btn close"
                type="button"
                onClick={() => this.closeTabView()}
              />

            }
            {tabToRender}
          </div>
        </div>
        : null
    );
  }

  render() {
    return (
      <ReactCSSTransitionGroup
        transitionName="nav-bar"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}
      >
        {this.renderOpenTab()}
      </ReactCSSTransitionGroup>

    );
  }
}

const mapStateToProps = state => ({
  toggle: state.ToggleReducer,
  languageReducer: state.LanguageReducer,
});

export default connect(mapStateToProps)(TabComponent);
