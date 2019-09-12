/* eslint jsx-a11y/label-has-for: 0 */
import React from 'react';
import classNames from 'classnames';

const Checkbox = ({
  id, cls, onChange, checked, children, ariaLabel,
}) => {
  const allClasses = classNames(cls, { checked }, { unchecked: !checked }, { 'has-children': children }, 'noselect');
  return (
    <div className="checkbox-wrapper">
      <input
        type="checkbox"
        id={id}
        onChange={onChange}
        checked={checked}
        aria-label={ariaLabel}
      />
      <label
        htmlFor={id}
        className={allClasses}
      >
        {children}
      </label>
    </div>
  );
};

export default Checkbox;
