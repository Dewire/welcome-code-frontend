/* eslint jsx-a11y/label-has-for: 0 */
import React from 'react';
import classNames from 'classnames';

const ExpandableContent = ({
  id, header, content, children, hideDivider = false,
}) => (
  <div className="expandable-content">
    <h2 className="expandable-header page-width">{header}</h2>
    <input className="expandable-input page-width" id={id} type="checkbox" />
    <label className="expandable-label page-width" htmlFor={id}>
      <span>{header}</span>
    </label>
    <div className="section-content">
      {content &&
        <div className="main-text-content">
          {content}
        </div>
      }
      {children}
    </div>
    <hr
      className={
      classNames('divider', { 'show-for-small-only': hideDivider })}
    />
  </div>
);

export default ExpandableContent;
