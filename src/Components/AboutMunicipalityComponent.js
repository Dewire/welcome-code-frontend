import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Parser } from 'html-to-react';
import draftToHtml from 'draftjs-to-html';
import AreaCarousel from './Carousel/AreaCarousel';
import { getAboutInMunicipality } from '../Actions/AboutMunicipalityActions';
import { SECTION_TYPE, URL_TYPES } from '../Constants';
import LoadingIndicatorComponent from './LoadingIndicatorComponent';
import DistanceTable from './DistanceTable';
import ImageSectionComponent from './ImageSectionComponent';

class AboutMunicipalityComponent extends Component {
  constructor() {
    super();

    this.htmlToReactParser = new Parser();
  }

  componentDidMount() {
    const {
      match: { params: { municipalityName } },
    } = this.props;
    this.props.dispatch(getAboutInMunicipality(municipalityName));
  }

  parseTextSection(section, lang) {
    const content = section.content[lang];
    return (
      <div key={section.index} className="main-text-content">
        <p><strong>{content.header}</strong></p>
        {this.htmlToReactParser.parse(draftToHtml(content.text))}
      </div>
    );
  }

  parseSections(sections) {
    const {
      match: {
        params: { lang, municipalityName },
      },
      municipalityReducer: {
        initialMapState: {
          center,
        },
      },
    } = this.props;
    return sections.map((section) => {
      switch (section.type) {
        case SECTION_TYPE.TEXT:
          return this.parseTextSection(section, lang);
        case SECTION_TYPE.IMAGES:
          return (<ImageSectionComponent
            municipality={municipalityName}
            section={section}
            key={section.index}
          />);
        case SECTION_TYPE.DISTANCE_TABLE:
          return <DistanceTable area={{ coordinates: center }} key={section.index} />;
        case SECTION_TYPE.VIDEO:
          return ''; // TODO: implement videos
        default:
          return '';
      }
    });
  }
  render() {
    const {
      AreaReducer: { areas },
      aboutMuni: { content },
      municipalityReducer: { initialMapState },
      match: { params: { lang, municipalityName } },
      languageReducer: { applicationText: { municipalityPage: { aboutMunicipality } } },
    } = this.props;

    const sortedSections = content && initialMapState
      ? content.section.sort((s1, s2) => s1.index - s2.index) : null;
    const sections = sortedSections && initialMapState ? this.parseSections(sortedSections) : null;

    return (
      <article className="full-view-page-wrapper" aria-label={aboutMunicipality}>
        {content ? (
          <div className="white-bg">
            <div className="top-btn">
              <NavLink to={`/${lang}/${municipalityName}/${URL_TYPES.MAP}`}>
                <input className="btn close" type="button" />
              </NavLink>
            </div>
            <div className="header">
              <h1>{content.topContent[lang].header}</h1>
            </div>
            <div className="preamble main-text-content">
              {this.htmlToReactParser.parse(draftToHtml(content.topContent[lang].text))}
            </div>
            <div>
              {sections}
            </div>
            <div>
              <hr className="divider" />
              <AreaCarousel
                areas={areas}
              />
            </div>
          </div>
        ) : (
          <LoadingIndicatorComponent />
        )}
      </article>
    );
  }
}

const mapStateToProps = state => ({
  AreaReducer: state.AreaReducer,
  aboutMuni: state.AboutMunicipalityReducer,
  municipalityReducer: state.MunicipalityReducer,
  languageReducer: state.LanguageReducer,
});

export default connect(mapStateToProps)(AboutMunicipalityComponent);
