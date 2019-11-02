import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Layer from 'components/Layer';

import core from 'core';
import useLayers from 'hooks/useLayers';
import selectors from 'selectors';

import './LayersPanel.scss';

const propTypes = {
  display: PropTypes.string.isRequired,
};

const LayersPanel = ({ display }) => {
  const isDisabled = useSelector(state =>
    selectors.isElementDisabled(state, 'layersPanel'),
  );
  const [layers, setLayers] = useLayers();

  return isDisabled || layers.length === 0 ? null : (
    <div
      className="Panel LayersPanel"
      style={{ display }}
      data-element="layersPanel"
    >
      {layers.map((layer, i) => (
        <Layer
          key={i}
          layer={layer}
          updateLayer={modifiedSubLayer => {
            // new references for triggering rerender
            const newLayers = [...layers];
            newLayers[i] = modifiedSubLayer;
            setLayers(newLayers);

            core.getDocument().setLayersArray(newLayers);
            window.docViewer.refreshAll();
            window.docViewer.updateView();
          }}
        />
      ))}
    </div>
  );
};

LayersPanel.propTypes = propTypes;

export default React.memo(LayersPanel);
