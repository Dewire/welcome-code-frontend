import React from 'react';
import licenses from '../Resources/licenses.json';

const LicenseComponent = () => (
  <div>
    {
      licenses.map(license => (
        <div className="license-wrapper">
          <p>Name & Version: {license.name}</p>
          <p>Url: {license.url}</p>
          <p>Licenses: {license.licenses}</p>
          <p>{license.licenseText}</p>
        </div>
      ))
    }
  </div>
);

export default LicenseComponent;
