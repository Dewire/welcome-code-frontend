/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Parser } from 'html-to-react';
import draftToHtml from 'draftjs-to-html';
import ReactGA from 'react-ga';

class TabContactComponent extends Component {
  constructor() {
    super();

    this.htmlToReactParser = new Parser();
  }

  render() {
    const {
      ToggleReducer: { openTab },
      MunicipalityReducer: { contact },
      LanguageReducer: { language, applicationText: { tabContact } },
    } = this.props;

    if (!openTab) return null;
    return (
      <div className="tab-contact-inner">
        <h2 className="m0">{tabContact.contact}</h2>
        <div style={{ backgroundImage: `url(${contact.portrait})` }} className="portrait" alt="portrait" />
        {this.htmlToReactParser.parse(draftToHtml(contact.body[language].content))}
        <input
          type="button"
          value={contact.emailBtn[language]}
          className="btn theme w100 mt10"
          onClick={() => {
            ReactGA.event({
              category: 'UI Event',
              action: 'Contact click',
              label: 'Clicked mail button',
            });

            window.location.href = `mailto:${contact.email}?subject=Välkommen hit kontaktformulär`;
           }}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  ToggleReducer: state.ToggleReducer,
  MunicipalityReducer: state.MunicipalityReducer,
  LanguageReducer: state.LanguageReducer,
});

export default connect(mapStateToProps)(TabContactComponent);
