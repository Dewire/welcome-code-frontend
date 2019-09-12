/* eslint-env browser */
import React from 'react';
import Modal from 'react-modal';

const ShareModal = ({
  isOpen, parentSelector, onRequestClose, baseClassName, applicationText, areas, shareUrl, style,
  description,
}) => {
  Modal.setAppElement('#root');
  let shareInput = null;

  const isIos = () => navigator.userAgent.match(/ipad|iphone/i);

  const copyShareUrl = () => {
    let range;
    let selection;

    if (isIos()) {
      range = document.createRange();
      range.selectNodeContents(shareInput);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      shareInput.setSelectionRange(0, 999999);
    } else {
      shareInput.select();
    }
    document.execCommand('Copy');
  };

  const defaultStyle = {
    overlay: {
      position: 'absolute',
      backgroundColor: 'rgba(31, 47, 56, 0.75)',
    },
  };

  return (
    <Modal
      style={style || defaultStyle}
      className={{
        base: baseClassName,
        afterOpen: '',
        beforeClose: '',
      }}
      isOpen={isOpen}
      parentSelector={parentSelector}
      onRequestClose={onRequestClose}
    >
      <div className="share-modal">
        <input className="btn close" type="button" onClick={onRequestClose} />
        <div className="share-text">
          {areas &&
            <div>
              <p className="preamble">
                {applicationText.tabFavourites.sharePreamble}
                <span>
                  {areas.map((a, index) => {
                const name = index + 1 === areas.length ? a.name : `${a.name}, `;
                return name;
              })}
                </span>
              </p>
            </div>
          }
          <p className="description">
            {description}
          </p>
        </div>
        <div className="text-input-wrapper">
          <button className="share-url-icon" />
          <input
            ref={(input) => { shareInput = input; }}
            id="search-box"
            className="text-input sharable-url theme"
            type="text"
            readOnly
            onFocus={copyShareUrl}
            value={shareUrl}
          />
        </div>
        <div>
          <button
            className="blue-link underline mt10"
            onClick={copyShareUrl}
          >
            {applicationText.common.copyLink}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
