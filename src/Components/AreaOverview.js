/* eslint jsx-a11y/label-has-for: 0 */
/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from 'react-slick';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { Parser } from 'html-to-react';
import draftToHtml from 'draftjs-to-html';
import { getAreaOverview, receiveAreaOverviewData } from '../Actions/AreaOverviewActions';
import { updateFavourite } from '../Actions/FavouriteActions';
import StreetView from './StreetView';
import CommuteTime from './CommuteTime';
import HousingListings from './HousingListings';
import {
  URL_TYPES,
  SECTION_TYPE,
  FACT_DISTANCE_QUERIES,
} from '../Constants';
import AreaCarousel from './Carousel/AreaCarousel';
import ExpandableContent from './ExpandableContent';
import placeholderImage from '../Images/Placeholders/villaomr.png';
import FactCarousel from './Carousel/FactCarousel';
import { getCompareValues } from '../Utils/googleUtil';
import ShareModal from './ShareModal';
import LoadingIndicatorComponent from './LoadingIndicatorComponent';
import ImageSectionComponent from './ImageSectionComponent';
import { isAreaFav } from '../Utils/otherUtils';

class AreaOverview extends Component {
  static parseCarousel(carouselUrls, name) {
    const sliderSettings = {
      infinite: true,
      slidesToShow: 1,
      speed: 500,
      dots: true,
      arrows: false,
      responsive: [{
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      }],
    };
    return (
      <div className="slider-wrapper full-width-slide">
        <Slider {...sliderSettings}>
          {
          carouselUrls.sort((u1, u2) => u1.index - u2.index).map(data =>
            (<div
              key={data.index}
              className="bg-image-container"
              style={{ backgroundImage: `url(${data.url || placeholderImage})` }}
              aria-label={`${name} ${data.index}`}
            />))
          }
        </Slider>
      </div>
    );
  }

  static getShareUrl() {
    return window.location.href;
  }

  static getModalParent() {
    return document.getElementById('area-overview');
  }

  constructor() {
    super();

    this.htmlToReactParser = new Parser();

    this.state = {
      area: {},
      factBox: [],
      modalIsOpen: false,
    };
  }

  componentWillMount() {
    this.props.dispatch(receiveAreaOverviewData(undefined));
  }

  componentWillReceiveProps(nextProps) {
    let newArea = '';
    if (nextProps.areaReducer.areas.length > 0 &&
        this.state.area.name !== nextProps.match.params.areaName) {
      const {
        areaReducer: { areas },
        match: { params: { areaName } },
      } = nextProps;
      newArea = this.setCurrentArea(areas, areaName);
    }

    if ((!nextProps.areaOverViewReducer.areaOverview && (newArea || this.state.area.areaId)) ||
      (this.state.area.areaId &&
      nextProps.areaOverViewReducer.areaOverview.areaId !==
      this.state.area.areaId)) {
      this.props.dispatch(getAreaOverview(this.state.area.areaId ?
        this.state.area.areaId :
        newArea.areaId));
    }
  }

  setCurrentArea(areas, areaName) {
    const currentArea = areas.find(area => area.name === areaName);
    currentArea.name = currentArea.name;
    this.setState({ area: currentArea });
    this.getfactBox(currentArea);
    return currentArea;
  }

  getfactBox(currentArea) {
    const {
      languageReducer: { language },
      mapViewReducer: { commuteDestination },
    } = this.props;
    getCompareValues(
      [currentArea],
      language,
      FACT_DISTANCE_QUERIES,
      commuteDestination,
    ).then((result) => {
      this.setState({
        factBox: result,
      });
    });
  }

  getHeaderSection(language, area, common) {
    if (this.state && this.state.area) {
      const { name } = this.state.area;
      const { dispatch, favouriteReducer: { favourites } } = this.props;
      const isFav = isAreaFav(favourites, this.state.area);
      return (
        <div className="header-section">
          <h1>{name}</h1>
          <input
            type="button"
            className={classNames('blue-link underline heart-icon', { filled: isFav })}
            value={area.saveArea}
            onClick={() => dispatch(updateFavourite(favourites, this.state.area))}
          />
          <input
            type="button"
            className="blue-link underline share-icon"
            value={common.share}
            onClick={() => this.handleShareModal()}
          />
        </div>
      );
    }
    return null;
  }

  parseTextSection(section, lang) {
    const content = section.content[lang];
    const text = this.htmlToReactParser.parse(draftToHtml(content.text));

    return (
      <ExpandableContent
        key={section.index}
        id={section.index}
        header={content.header}
        content={text}
      />
    );
  }

  dispatchAreaOverView(areaId) {
    this.props.dispatch(getAreaOverview(areaId));
  }

  handleShareModal() {
    this.setState({ modalIsOpen: !this.state.modalIsOpen });
  }

  parseSections(sections) {
    const { match: { params: { lang, municipalityName } } } = this.props;
    return sections.map((section) => {
      switch (section.type) {
        case SECTION_TYPE.TEXT:
          return this.parseTextSection(section, lang);
        case SECTION_TYPE.STREET_VIEW:
          return <StreetView area={this.state.area} key={section.index} />;
        case SECTION_TYPE.COMMUTE_TIME:
          return <CommuteTime area={this.state.area} key={section.index} />;
        case SECTION_TYPE.IMAGES:
          return <ImageSectionComponent section={section} divider />;
        case SECTION_TYPE.HOUSE_LISTINGS:
          return (<HousingListings
            area={this.state.area}
            municipality={municipalityName}
            key={section.index}
          />);
        default:
          return '';
      }
    });
  }

  render() {
    const {
      areaOverViewReducer: { areaOverview },
      areaReducer: { areas },
      languageReducer: { language, applicationText, applicationText: { area, factBox, common } },
      match: { params: { municipalityName } },
    } = this.props;
    const { area: { areaId, name } } = this.state;

    const carousel = areaOverview
      ? AreaOverview.parseCarousel(areaOverview.carouselUrls, name) : null;

    const headerSection = language
      ? this.getHeaderSection(language, area, common) : null;

    const sortedSections = areaOverview && areaOverview.section
      ? areaOverview.section.sort((s1, s2) => s1.index - s2.index) : null;
    const sections = sortedSections && this.state.area ? this.parseSections(sortedSections) : null;

    const modalStyle = {
      overlay: {
        position: 'fixed',
        backgroundColor: 'rgba(31, 47, 56, 0.75)',
        width: '100%',
        height: '100%',
      },
    };

    return (
      <div
        className="area-overview-wrapper full-view-page-wrapper"
        id="area-overview"
      >
        <ShareModal
          isOpen={this.state.modalIsOpen}
          parentSelector={() => AreaOverview.getModalParent()}
          onRequestClose={() => this.handleShareModal()}
          baseClassName="full-modal modal-base"
          applicationText={applicationText}
          areas={[this.state.area]}
          shareUrl={AreaOverview.getShareUrl()}
          style={modalStyle}
        />
        { areaOverview && areaOverview.areaId === areaId ? (
          <div className="white-bg">
            <div className="top-btn">
              <NavLink to={`/${language}/${municipalityName}/${URL_TYPES.MAP}`}>
                <input className="btn close-circle" type="button" aria-label={common.close} />
              </NavLink>
            </div>
            <div>
              {carousel}
            </div>
            <div className="main-text-content">
              {headerSection}
            </div>
            <FactCarousel
              facts={this.state.factBox}
              titles={factBox}
            />
            <div className="main-text-content">
              <div ref={(c) => { this.preamble = c; }} className="preamble">
                {
                    this.htmlToReactParser
                    .parse(draftToHtml(areaOverview.preamble[language].content))
                  }
                <div
                  className="gradient"
                  ref={(c) => { this.gradient = c; }}
                />
                <div className="button-row">
                  <button
                    className="blue-link"
                    onClick={(e) => {
                      e.target.classList.toggle('hide');
                      this.preamble.classList.toggle('show');
                      this.gradient.classList.toggle('hide');
                  }}
                  >{area.readMore}
                  </button>
                </div>
              </div>
            </div>
            <hr className="divider" />
            <div>
              {sections}
            </div>
            <AreaCarousel
              areas={areas || null}
              selectedArea={this.state ? this.state.area : null}
            />
          </div>
        ) : (
          <LoadingIndicatorComponent />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  areaOverViewReducer: state.AreaOverviewReducer,
  areaReducer: state.AreaReducer,
  languageReducer: state.LanguageReducer,
  municipalityReducer: state.MunicipalityReducer,
  mapViewReducer: state.MapViewReducer,
  favouriteReducer: state.FavouriteReducer,
});

export default connect(mapStateToProps)(AreaOverview);
