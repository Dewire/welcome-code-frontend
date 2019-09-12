import 'babel-polyfill';
import React, { Component } from 'react';
import { ConnectedRouter } from 'react-router-redux';
import { Provider } from 'react-redux';
import { store, history } from './Store';
import './Style/App.scss';
import Routes from './Routes';
import NavigationBar from './Components/NavigationBar';
import StartPageComponent from './Components/StartPageComponent';
import ErrorBoundary from './Components/ErrorBoundary';

require('what-input');

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div className="root-wrapper">
            <ErrorBoundary>
              <Routes />
              <StartPageComponent />
              <NavigationBar />
            </ErrorBoundary>
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default App;
