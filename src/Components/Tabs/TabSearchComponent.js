import React, { Component } from 'react';
import { connect } from 'react-redux';
import { changeOpenTab } from '../../Actions/ToggleActions';

class TabSearchComponent extends Component {
  constructor() {
    super();

    this.state = {
      query: '',
      filteredAreas: [],
    };
  }

  filterAreas(e) {
    const { AreaReducer: { areas } } = this.props;
    const query = e.target.value;
    if (query) {
      this.setState({
        query,
        filteredAreas: areas.filter(a => a.name.startsWith(query.toLowerCase())),
      });
    } else {
      this.clearSearch();
    }
  }

  clearSearch() {
    this.setState({
      query: '',
      filteredAreas: [],
    });
  }

  render() {
    const {
      LanguageReducer: { applicationText: { tabSearch } },
      areaClickHandler,
      dispatch,
    } = this.props;
    const { query, filteredAreas } = this.state;

    const areaList = filteredAreas ?
      filteredAreas.map(area => (
        <div className="result-row" key={area.areaId}>
          <div className="map-icon" />
          <button
            className="btn"
            onClick={() => {
              this.clearSearch();
              dispatch(changeOpenTab(''));
              areaClickHandler({ ...area, eventFromSearch: true });
            }}
          >
            <b>{query}</b>{area.name.substring(query.length, area.name.length)}
          </button>
        </div>
      ))
      : null;

    return (
      <div className="tab-search-inner">
        <h2 className="m0">{tabSearch.searchArea}</h2>
        <div className="text-input-wrapper mt25">
          <input
            id="search-box"
            className="text-input search"
            type="text"
            value={query || ''}
            onChange={e => this.filterAreas(e)}
          />
          {query
            ?
              <button
                className="btn clear-search-icon search-placeholder-padding"
                onClick={() => this.clearSearch()}
              />
            : null}
          <div className="search-icon" />
        </div>
        <div className="results-wrapper">
          {areaList}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  ToggleReducer: state.ToggleReducer,
  AreaReducer: state.AreaReducer,
  LanguageReducer: state.LanguageReducer,
  MapViewReducer: state.MapViewReducer,
});

export default connect(mapStateToProps)(TabSearchComponent);
