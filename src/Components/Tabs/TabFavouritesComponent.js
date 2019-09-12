/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import { NavLink } from 'react-router-dom';
import queryString from 'query-string';
import ReactGA from 'react-ga';
import Input from '../Input';
import {
  sortAreasByCommuteDestination,
  sortAreasByName,
  getDistanceBetweenCoordinates,
} from '../../Utils/otherUtils';
import { changeFavSortOption, changeOpenTab } from '../../Actions/ToggleActions';
import {
  FAV_SORT_OPTIONS,
  URL_TYPES,
  MAX_COMPARE_VALUE,
} from '../../Constants';
import {
  updateSelectFavourite,
  selectDeselectAllFavourites,
  deleteSelectedFavourites,
} from '../../Actions/FavouriteActions';
import { getLocalAreaData } from '../../Utils/localStorageUtil';
import placeholderImage from '../../Images/Placeholders/villaomr.png';
import ShareModal from '../ShareModal';
import Checkbox from '../Checkbox';

class TabFavouritesComponent extends Component {
  static getModalParent() {
    return document.getElementById('tab-modal-parent');
  }

  constructor(props) {
    super(props);
    const showNoFavContent = getLocalAreaData().length === 0;
    this.state = {
      modalIsOpen: showNoFavContent,
      modalContent: showNoFavContent ? this.getNoFavContent() : '',
      shareModalisOpen: false,
    };
    Modal.setAppElement('#root');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.favourites !== this.props.favourites) {
      const showNoFavContent = getLocalAreaData().length === 0;
      this.setState({
        modalIsOpen: showNoFavContent,
        modalContent: showNoFavContent ? this.getNoFavContent() : '',
      });
    }
  }

  onSelectChange(area) {
    const {
      favourites,
      dispatch,
    } = this.props;
    dispatch(updateSelectFavourite(favourites, area));
  }

  getCompareUrl() {
    const {
      favourites,
      favSortOption,
      languageReducer: { language },
      municipalityReducer: { name },
    } = this.props;
    const selectedAreas = favourites.filter(a => a.favSelected);
    const areaIds = selectedAreas.map(a => a.areaId);
    const municipalityIds = selectedAreas.map(a => a.municipalityId);
    const query = {
      areas: areaIds.join(),
      municipalities: municipalityIds.join(),
      sort: favSortOption,
    };
    const compareUrl = `/${language}/${name}/${URL_TYPES.COMPARE}?${queryString.stringify(query)}`;
    return compareUrl;
  }

  getShareUrl() {
    return window.location.origin + this.getCompareUrl();
  }

  getCompareBtnContent() {
    const {
      favourites,
      applicationText: { tabFavourites },
    } = this.props;
    const selectedAreas = favourites.filter(a => a.favSelected);
    if (selectedAreas.length > 0) {
      return (
        <div className="btn-wrapper">
          <NavLink to={this.getCompareUrl()}>
            <input
              type="button"
              value={tabFavourites.compare}
              className="btn theme w100 icon-compare"
              onClick={(e) => {
                ReactGA.event({
                  category: 'UI Event',
                  action: 'Favourite click',
                  label: 'Clicked compare button',
                });
                this.checkMaxCompare(e);
              }}
            />
          </NavLink>
        </div>
      );
    }
    return (
      <div className="btn-wrapper">
        <input
          type="button"
          value={tabFavourites.compare}
          className="btn theme w100 icon-compare"
        />
      </div>
    );
  }

  getSortContent() {
    const {
      applicationText: { tabFavourites },
      favSortOption,
    } = this.props;
    const sortByVicinity = favSortOption === FAV_SORT_OPTIONS.VICINITY;
    return (
      <div className="fav-sort-wrapper">
        <div className="button-section semi-bold">
          <p>{tabFavourites.sortBy}</p>
          <input
            className="semi-bold"
            type="button"
            value={favSortOption === FAV_SORT_OPTIONS.VICINITY ?
              tabFavourites.vicinity : tabFavourites.asc}
          />
        </div>
        <hr className="divider" />
        <p>{tabFavourites.sortOptions}</p>
        <hr className="divider" />
        <div
          className="drop-down-wrapper"
        >
          <div className="dd-inner-wrapper">
            <div className="row">
              <label
                htmlFor={tabFavourites.vicinity}
                className={sortByVicinity ? 'checked' : 'unchecked'}
              >
                {tabFavourites.vicinity}
                <Input
                  type="radio"
                  value={FAV_SORT_OPTIONS.VICINITY}
                  id={tabFavourites.vicinity}
                  onChange={e => this.changeSorting(e)}
                />
              </label>
            </div>
            <div className="separator" />
            <div className="row">
              <label
                htmlFor={tabFavourites.asc}
                className={!sortByVicinity ? 'checked' : 'unchecked'}
              >
                {tabFavourites.asc}
                <Input
                  type="radio"
                  value={FAV_SORT_OPTIONS.ASC}
                  id={tabFavourites.asc}
                  onChange={e => this.changeSorting(e)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  getNoFavContent() {
    const {
      applicationText: { tabFavourites },
      dispatch,
    } = this.props;
    return (
      <div className="no-fav-wrapper">
        <h2>{tabFavourites.noFavs}</h2>
        <div className="btn-wrapper">
          <input
            type="button"
            className="btn theme w100"
            value={tabFavourites.toMap}
            onClick={() => dispatch(changeOpenTab(''))}
          />
        </div>
      </div>
    );
  }

  getRemoveSelectedContent() {
    const {
      applicationText: { tabFavourites, common },
    } = this.props;
    return (
      <div className="remove-fav-wrapper">
        <h2>{tabFavourites.removePrompt}</h2>
        <div className="btn-wrapper">
          <input
            type="button"
            className="btn theme w100"
            value={common.yes}
            onClick={() => this.removeSelectedAreas()}
          />
        </div>
        <div className="btn-wrapper">
          <input
            type="button"
            className="btn theme w100"
            value={common.cancel}
            onClick={() => this.closeModal()}
          />
        </div>
      </div>
    );
  }

  getMaxCompareContent(fromShareModal) {
    const {
      applicationText: { tabFavourites },
    } = this.props;
    return (
      <div className="no-fav-wrapper">
        <input className="btn close" type="button" onClick={() => this.closeModal()} />
        <h2>{fromShareModal ? tabFavourites.maxShare : tabFavourites.maxCompare}</h2>
      </div>
    );
  }

  checkMaxCompare(e) {
    const { favourites } = this.props;
    const compareLimit = favourites.filter(a => a.favSelected).length > MAX_COMPARE_VALUE;
    if (compareLimit) {
      e.preventDefault();
      this.openModal(this.getMaxCompareContent());
    }
  }

  removeSelectedAreas() {
    const {
      dispatch,
      favourites,
    } = this.props;
    dispatch(deleteSelectedFavourites(favourites));
    this.closeModal();
  }

  selectDeselectAll(select) {
    const {
      dispatch,
      favourites,
    } = this.props;
    dispatch(selectDeselectAllFavourites(favourites, select));
  }

  changeSorting(e) {
    const { dispatch } = this.props;
    dispatch(changeFavSortOption(e.target.value));
    this.closeModal();
  }

  sortByOption(areas) {
    const {
      favSortOption,
      commuteDestination,
    } = this.props;
    if (favSortOption === FAV_SORT_OPTIONS.VICINITY) {
      return sortAreasByCommuteDestination(commuteDestination, areas);
    }
    return sortAreasByName(areas);
  }

  openModal(modalContent) {
    this.setState({
      modalIsOpen: true,
      modalContent,
    });
  }

  openShareModal() {
    const { favourites } = this.props;
    const selectedFavs = favourites.filter(a => a.favSelected).length;
    const compareLimit = selectedFavs > MAX_COMPARE_VALUE;
    if (selectedFavs > 0 && !compareLimit) {
      ReactGA.event({
        category: 'UI Event',
        action: 'Favourite click',
        label: 'Clicked share button',
      });
      this.setState({ shareModalisOpen: true });
    } else if (compareLimit) {
      const fromShareModal = true;
      this.openModal(this.getMaxCompareContent(fromShareModal));
    }
  }

  closeModal() {
    this.setState({
      modalIsOpen: false,
      shareModalisOpen: false,
    });
  }

  render() {
    const {
      favSortOption,
      commuteDestination,
      applicationText: { tabFavourites, common },
      applicationText,
      favourites,
    } = this.props;
    const {
      modalIsOpen,
      shareModalisOpen,
      modalContent,
    } = this.state;

    const sortedFavAreas = this.sortByOption(favourites);
    const isAllSelected = favourites.filter(a => a.favSelected).length === favourites.length;

    return (
      <div className="favourites-wrapper">
        <Modal
          style={{
            overlay: {
              position: 'absolute',
              backgroundColor: 'rgba(31, 47, 56, 0.75)',
            },
          }}
          className={{
            base: 'favourite-modal modal-base',
            afterOpen: '',
            beforeClose: '',
          }}
          isOpen={modalIsOpen}
          parentSelector={TabFavouritesComponent.getModalParent}
          onRequestClose={() => (sortedFavAreas.length ? this.closeModal() : null)}
        >
          {modalContent}
        </Modal>
        <ShareModal
          isOpen={shareModalisOpen}
          parentSelector={TabFavouritesComponent.getModalParent}
          onRequestClose={() => this.closeModal()}
          baseClassName="favourite-modal modal-base"
          applicationText={applicationText}
          areas={favourites}
          shareUrl={this.getShareUrl()}
          description={applicationText.tabFavourites.shareDescription}
        />
        <div className="top-section">
          <h2>{tabFavourites.heading}</h2>
          <div className="hide-for-small-only">
            <p>{tabFavourites.preamble}</p>
          </div>
        </div>
        <div className="fav-sort-wrapper">
          <div className="button-section semi-bold">
            <p>{tabFavourites.sortBy}</p>
            <input
              onClick={() => this.openModal(this.getSortContent())}
              className="semi-bold"
              type="button"
              value={favSortOption === FAV_SORT_OPTIONS.VICINITY ?
                tabFavourites.vicinity : tabFavourites.asc}
            />
          </div>
        </div>
        <hr className="divider" />
        <div className="button-section">
          <div className="row">
            { this.getCompareBtnContent() }
            <div className="btn-wrapper">
              <input
                onClick={() => this.openShareModal()}
                type="button"
                value={common.share}
                className="btn theme w100 icon-share"
              />
            </div>
          </div>
          <div className="row mt10">
            <div className="btn-wrapper">
              <input
                type="button"
                value={isAllSelected ? tabFavourites.deselectAll : tabFavourites.selectAll}
                className="blue-link underline"
                onClick={() => this.selectDeselectAll(!isAllSelected)}
              />
            </div>
            <div className="btn-wrapper">
              <input
                type="button"
                value={tabFavourites.removeSelected}
                className="blue-link underline"
                onClick={() => this.openModal(this.getRemoveSelectedContent())}
              />
            </div>
          </div>
        </div>
        <div className="area-section">
          <div className="row">
            { sortedFavAreas && sortedFavAreas.length > 0 &&
              sortedFavAreas.map(area => (
                <div key={area.areaId} className="area">
                  <div
                    className="area-img"
                    style={{ backgroundImage: `url(${area.thumbnail || placeholderImage})` }}
                  >
                    <div className="checkbox">
                      <Checkbox
                        id={area.areaId}
                        cls="basic"
                        checked={area.favSelected}
                        ariaLabel={area.favSelected ? common.uncheck : common.check}
                        onChange={() => this.onSelectChange(area)}
                      />
                    </div>
                  </div>
                  <div className="semi-bold"><p>{area.name}</p></div>
                  <div className="icon-pin-gray">
                    <p>{Number(getDistanceBetweenCoordinates(
                          commuteDestination,
                          area.coordinates,
                        )).toFixed(1)} {common.km}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  applicationText: state.LanguageReducer.applicationText,
  languageReducer: state.LanguageReducer,
  municipalityReducer: state.MunicipalityReducer,
  commuteDestination: state.MapViewReducer.commuteDestination,
  favSortOption: state.ToggleReducer.favSortOption, // TODO: move this to favouriteReducer?
  favourites: state.FavouriteReducer.favourites,
});

export default connect(mapStateToProps)(TabFavouritesComponent);
