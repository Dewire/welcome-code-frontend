import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { putErrorMessage } from '../Utils/fetcherUtil';
import { CONF_NAME } from '../Constants';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });

    // Split componentStack string in to an array where each value
    // represent a row in componentStack
    const componentStack = info.componentStack.split('in');
    let label = '';
    // Take the first three rows from componentStack and add them to label for GA
    for (let i = 0; i < componentStack.length && i < 3; i += 1) {
      const errorInfo = componentStack[i].trim();
      if (errorInfo.length > 0) {
        label += errorInfo;
      }
    }

    ReactGA.event({
      category: 'ERROR',
      action: 'ErrorBoundary Client',
      label,
      nonInteraction: true,
    });

    const errorMessage = {
      errorOrigin: `Client${CONF_NAME}`,
      label: `Stack trace ${info.componentStack}`,
    };

    putErrorMessage(errorMessage).then((response) => {
      if (response.status === 200) {
        console.log('success');
      }
    }).catch((er) => {
      console.log('error', er);
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="no-page-wrapper">
          <h2>Ett oväntat fel har inträffat</h2>
          <p>Ett oväntat fel har uppstått när din begäran behandlades. Försök igen senare.</p>
          <h2>An unexpected error has occurred</h2>
          <p>An unexpected error occurred while processing your request. Please try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}


export default ErrorBoundary;
