import React from 'react';
import { parseFactValue } from '../../Utils/otherUtils';
import placeholderImage from '../../Images/Placeholders/villaomr.png';

const CompareAreaColumn = ({ area }) => (
  <div key={area.areaId} className="column-wrapper">
    <div className="name bg-color green border-lr show-for-small-only">
      <p className="m0">{area.name}</p>
    </div>
    <div
      className="area-thumbnail"
      style={{ backgroundImage: `url(${area.thumbnail || placeholderImage})` }}
    />
    <div className="name bg-color border-r green show-for-medium">
      <p className="m0">{area.name}</p>
    </div>
    {area.compare.map((c) => {
      const compareValue = c.value ? parseFactValue(c.type, c.value) : { value: '-' };
      return (
        <div key={c.type} className="border-lr value-wrapper">
          <div className="show-for-small-only">
            <div className="compare-separator" />
            <div className="compare-value">
              <p className="metric-value m0">{compareValue.value}</p>
              <p className="metric-type">{compareValue.metric}</p>
            </div>
          </div>
          <div className="compare-value border-r show-for-medium">
            <p className="m0">
              {compareValue.value} <span>{compareValue.metric}</span>
            </p>
          </div>
        </div>
      );
    })}
  </div>
);

export default CompareAreaColumn;
