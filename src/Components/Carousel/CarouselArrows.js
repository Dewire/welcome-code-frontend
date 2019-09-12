import React from 'react';
import classNames from 'classnames';

export const PrevArrow = (props) => {
  const btnClass = classNames({
    hide: props.selectedArea || !props.onClick,
    'carousel-arrow prev-arrow': !props.selectedArea,
  });
  return (
    <button
      className={btnClass}
      onClick={props.onClick}
      aria-label={props.label}
    />
  );
};

export const NextArrow = (props) => {
  const btnClass = classNames({
    hide: props.selectedArea || !props.onClick,
    'carousel-arrow next-arrow': !props.selectedArea,
  });
  return (
    <button
      className={btnClass}
      onClick={props.onClick}
      aria-label={props.label}
    />
  );
};
