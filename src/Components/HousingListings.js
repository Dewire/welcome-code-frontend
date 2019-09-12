import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { getHousingListings } from '../Utils/booliUtil';
import ExpandableContent from './ExpandableContent';

class HousingListings extends Component {
  constructor() {
    super();

    this.state = {
      listings: [],
    };
  }

  componentDidMount() {
    const {
      area,
      municipality,
    } = this.props;

    if (area && municipality) {
      getHousingListings(municipality, area.name)
        .then((listings) => {
          this.setState({
            listings,
          });
        });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.area !== this.state.area) {
      const {
        area,
        municipality,
      } = nextProps;

      getHousingListings(municipality, area.name)
        .then((listings) => {
          this.setState({
            listings,
          });
        });
    }
  }

  renderPublished(published) {
    const {
      LanguageReducer: {
        applicationText: {
          housingListings: {
            housingItem: {
              today,
              yesterday,
              days,
            },
          },
        },
      },
    } = this.props;

    if (published) {
      switch (moment().diff(moment(published), 'days')) {
        case 0:
          return today;
        case 1:
          return yesterday;
        default:
          return `${moment().diff(moment(published), 'days')} ${days}`;
      }
    } else {
      return '-';
    }
  }

  renderObjectType(objectType) {
    const {
      LanguageReducer: {
        applicationText: {
          housingListings: {
            housingItem: {
              detached,
              apartment,
              farm,
              plotType,
              cottage,
              semiDetached,
              terraced,
            },
          },
        },
      },
    } = this.props;

    if (objectType) {
      switch (objectType.toLowerCase()) {
        case 'villa':
          return detached;
        case 'lägenhet':
          return apartment;
        case 'gård':
          return farm;
        case 'tomt-mark':
          return plotType;
        case 'fritidshus':
          return cottage;
        case 'parhus':
          return semiDetached;
        case 'radhus' || 'kedjehus':
          return terraced;
        default:
          return objectType;
      }
    } else {
      return '-';
    }
  }

  render() {
    const { listings } = this.state;
    const {
      LanguageReducer: {
        applicationText: {
          housingListings: {
            newlyListed,
            visit,
            moreForSale,
            noResults,
            housingItem: {
              rooms,
              month,
              plot,
              today,
              yesterday,
              days,
            },
          },
        },
      },
    } = this.props;

    const housingList = listings && listings.length
      ? listings.map(listing => (
        <a
          className="housing-link"
          href={listing.url}
          rel="noopener noreferrer"
          target="_blank"
          key={listing.booliId}
        >
          <div className="row housing collapse">
            <div className="medium-3 small-4 columns">
              <div
                className="image"
                style={{
                backgroundImage: `url(https://api.bcdn.se/cache/primary_${listing.booliId}_140x94.jpg)`,
              }}
              />
            </div>
            <div className="row collapse show-for-small-only">
              <div className="small-8 columns">
                <p className="address">{listing.streetAddress}</p>
              </div>
              <div className="small-4 columns">
                <p>{listing.area}</p>
              </div>
              <div className="small-2 columns">
                <p>{listing.livingArea}</p>
              </div>
              <div className="small-2 columns ta-right">
                <p>{listing.rooms ? `${listing.rooms} ${rooms}` : '-'}</p>
              </div>
              <div className="small-4 columns">
                <p className="price">{listing.listPrice}</p>
              </div>
              <div className="small-4 columns ta-right">
                <p className="price">{listing.rent ? `${Number.parseInt(listing.rent, 10).toLocaleString('sv-SE')} kr/${month}` : '-'}</p>
              </div>
              <div className="small-4 columns">
                <p className="grey">{listing.plotArea ? `${listing.plotArea} m² ${plot}` : '-'}</p>
              </div>
              <div className="small-4 columns ta-right">
                <p className="grey">
                  {this.renderPublished(listing.published, today, yesterday, days)}
                </p>
              </div>
            </div>
            <div className="row collapse hide-for-small-only">
              <div className="medium-5 columns">
                <p className="address">{listing.streetAddress}</p>
                <p>{listing.rooms ? `${listing.rooms} ${rooms}` : '-'}, {listing.livingArea}
                </p>
                <p>{this.renderObjectType(listing.objectType)}, {listing.area}</p>
              </div>
              <div className="medium-2 columns ta-right">
                <p className="price mt25">{listing.listPrice}</p>
                <p className="price">{listing.rent ? `${Number.parseInt(listing.rent, 10).toLocaleString('sv-SE')} kr/${month}` : '-'}</p>
              </div>
              <div className="medium-2 columns ta-right">
                <p className="mt25">
                  {this.renderPublished(listing.published, today, yesterday, days)}
                </p>
                <p>{listing.plotArea ? `${listing.plotArea} m² ${plot}` : '-'}</p>
              </div>
            </div>
          </div>
        </a>))
      : <p className="no-results">{noResults}</p>;

    // TODO: Booli URL, vart ska denna leda?
    return (
      <ExpandableContent
        id={newlyListed}
        header={newlyListed}
      >
        <div className="main-text-content">
          <div className="housing-container">
            {housingList}
            <div className="row collapse">
              <div className="medium-12 columns">
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  className="blue-link"
                  href="http://booli.se"
                >
                  <div>{visit}</div><div className="booli-icon" />
                  <div>{moreForSale}</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </ExpandableContent>

    );
  }
}

const mapStateToProps = state => ({
  LanguageReducer: state.LanguageReducer,
});

export default connect(mapStateToProps)(HousingListings);
