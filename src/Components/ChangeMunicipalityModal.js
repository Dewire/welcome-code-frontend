import React from 'react';
import Rodal from 'rodal';

const ChangeMunicipalityModal = ({
  applicationText, language, visible, changeMuni, close,
}) => (
  <Rodal
    className={`change-municipality-modal ${language}`}
    visible={visible}
    onClose={() => close()}
  >
    <div className="content">
      <p>{applicationText.changeMunicipalityModal.content}</p>
      <div className="row collapse">
        <div className="columns small-5">
          <input
            type="button"
            className="btn theme w100"
            value={applicationText.common.yes}
            onClick={() => changeMuni()}
          />
        </div>
        <div className="columns small-5">
          <input
            type="button"
            className="btn theme w100"
            value={applicationText.common.cancel}
            onClick={() => close()}
          />
        </div>
      </div>
    </div>
  </Rodal>
);

export default ChangeMunicipalityModal;
