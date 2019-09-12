/* eslint-env browser */
/* jshint -W065 */
import React, { Component } from 'react';

const OVERFLOW = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  BOTH: 'BOTH',
  NONE: 'NONE',
};

class AreaFactsComponent extends Component {
  constructor() {
    super();
    this.state = ({ // TODO: renamve variables to better names
      ticking: false,
      isMoving: false,
      direction: '',
      distance: 150,
      overflow: 'none',
      lastScrollPosition: 0,
    });
  }

  componentDidMount() {
    const overflow = this.determineOverflow(this.contentDiv, this.wrapperDiv);
    console.log('componentDidMount', overflow);
    this.addScrollListener();
    this.addTransitionListener();
  }

  onPrev() {
    const { isMoving, distance } = this.state;
    if (isMoving) return;

    if (this.determineOverflow(this.contentDiv, this.wrapperDiv) === OVERFLOW.LEFT
    || this.determineOverflow(this.contentDiv, this.wrapperDiv) === OVERFLOW.BOTH) {
      const availableScroll = this.wrapperDiv.scrollLeft;
      if (availableScroll < distance * 2) {
        this.contentDiv.style.transform = `translateX(${availableScroll}px)`;
      } else {
        this.contentDiv.style.transform = `translateX(${distance}px)`;
      }

      this.contentDiv.classList.remove('no-transition');
      this.setState({
        direction: 'left',
        isMoving: true,
      });
    }

    this.determineOverflow(this.contentDiv, this.wrapperDiv);
  }

  onNext() {
    const { isMoving, distance } = this.state;
    if (isMoving) return;

    if (this.determineOverflow(this.contentDiv, this.wrapperDiv) === OVERFLOW.RIGHT
      || this.determineOverflow(this.contentDiv, this.wrapperDiv) === OVERFLOW.BOTH) {
      const navBarRightEdge = this.contentDiv.getBoundingClientRect().right;
      const navBarScrollerRightEdge = this.wrapperDiv.getBoundingClientRect().right;
      const availableScrollRight = Math.floor(navBarRightEdge - navBarScrollerRightEdge);

      if (availableScrollRight < distance * 2) {
        this.contentDiv.style.transform = `translateX(-${availableScrollRight}px)`;
      } else {
        this.contentDiv.style.transform = `translateX(-${distance}px)`;
      }
      this.contentDiv.classList.remove('no-transition');
      this.setState({
        direction: 'right',
        isMoving: true,
      });
    }
    this.determineOverflow(this.contentDiv, this.wrapperDiv);
  }

  setTicking(ticking) {
    this.setState({ ticking });
  }

  addScrollListener() {
    this.wrapperDiv.addEventListener('scroll', () => {
      const { ticking, lastScrollPosition } = this.state;
      this.setState({ lastScrollPosition: window.scrollY });
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.doSomething(lastScrollPosition);
          this.setTicking(false);
        });
      }
      this.setTicking(true);
    });
  }

  addTransitionListener() {
    this.contentDiv.addEventListener('transitionend', () => {
      const { direction } = this.state;
      const styleOfTransform = window.getComputedStyle(this.contentDiv, null);
      const tr = styleOfTransform.getPropertyValue('-webkit-transform') || styleOfTransform.getPropertyValue('transform');
      const amount = Math.abs(parseInt(tr.split(',')[4], 10) || 0);
      this.contentDiv.style.transform = 'none';
      this.contentDiv.classList.add('no-transition');
      if (direction === 'left') {
        this.wrapperDiv.scrollLeft -= amount;
      } else {
        this.wrapperDiv.scrollLeft += amount;
      }
      this.setState({ isMoving: false });
    }, false);
  }

  doSomething() {
    const overflow = this.determineOverflow(this.contentDiv, this.wrapperDiv);
    this.setState({ overflow });
  }

  determineOverflow(content, container) {
    console.log('determineOverflow', this);
    const containerMetrics = container.getBoundingClientRect();
    const containerMetricsRight = Math.floor(containerMetrics.right);
    const containerMetricsLeft = Math.floor(containerMetrics.left);
    const contentMetrics = content.getBoundingClientRect();
    const contentMetricsRight = Math.floor(contentMetrics.right);
    const contentMetricsLeft = Math.floor(contentMetrics.left);
    if (containerMetricsLeft > contentMetricsLeft && containerMetricsRight < contentMetricsRight) {
      return OVERFLOW.BOTH;
    } else if (contentMetricsLeft < containerMetricsLeft) {
      return OVERFLOW.LEFT;
    } else if (contentMetricsRight > containerMetricsRight) {
      return OVERFLOW.RIGHT;
    }
    return OVERFLOW.NONE;
  }

  render() {
    const { overflow, lastScrollPosition } = this.state;
    console.log('scroll', lastScrollPosition);
    console.log('overflow', overflow);
    return (
      <div>
        <div className="area-facts-wrapper">
          <div className="scroll-wrapper" ref={(div) => { this.wrapperDiv = div; }}>
            <div className="box-wrapper" ref={(div) => { this.contentDiv = div; }}>
              <div className="box">
                <p className="title">Avstånd till centrum</p>
                <p className="metric-number">2.3</p>
                <p className="metric-type">km</p>
              </div>
              <div className="box">
                <p className="title">Snittpris att köpa villa</p>
                <p className="metric-number">34k</p>
                <p className="metric-type">kr/m2</p>
              </div>
              <div className="box">
                <p className="title">Avstånd till matbutik</p>
                <p className="metric-number">600</p>
                <p className="metric-type">m</p>
              </div>
              <div className="box">
                <p className="title">Avstånd till vårdcentral</p>
                <p className="metric-number">6.5</p>
                <p className="metric-type">km</p>
              </div>
              <div className="box">
                <p className="title">Avstånd till sjukhus</p>
                <p className="metric-number">2.3</p>
                <p className="metric-type">km</p>
              </div>
              <div className="box">
                <p className="title">Avstånd till aptoek</p>
                <p className="metric-number">2.1</p>
                <p className="metric-type">km</p>
              </div>
            </div>
          </div>
          <button onClick={() => this.onPrev()} id="lolprev" className="navigation prev" />
          <button onClick={() => this.onNext()} id="lolnext" className="navigation next" />
        </div>
      </div>

    );
  }
}

export default AreaFactsComponent;
