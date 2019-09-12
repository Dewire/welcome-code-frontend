/* eslint-env browser */
import React from 'react';
import Modal from 'react-modal';

const LoadingIndicatorComponent = () => {
  Modal.setAppElement('#root');
  const getModalParent = () => document.getElementById('root');
  return (
    <div className="loading-indicator-wrapper">
      <Modal
        style={{
            overlay: {
              position: 'absolute',
              backgroundColor: 'rgba(31, 47, 56, 0.75)',
            },
          }}
        className={{
            base: 'loading-modal',
            afterOpen: '',
            beforeClose: '',
          }}
        isOpen
        parentSelector={getModalParent}
      >
        <div className="loading-indicator">
          <div className="sk-folding-cube">
            <div className="sk-cube1 sk-cube" />
            <div className="sk-cube2 sk-cube" />
            <div className="sk-cube4 sk-cube" />
            <div className="sk-cube3 sk-cube" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LoadingIndicatorComponent;
