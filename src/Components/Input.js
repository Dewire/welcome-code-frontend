import React from 'react';

const Input = (props) => {
  const {
    id,
    name,
    value,
    type,
    onChange,
  } = props;
  return (
    <input
      {...props}
      id={id}
      name={name}
      value={value}
      type={type}
      onChange={onChange}
    />
  );
};

export default Input;
