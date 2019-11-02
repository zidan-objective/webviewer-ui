import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Icon from 'components/Icon';
import Input from 'components/Input';

import './Layer.scss';

const propTypes = {
  layer: PropTypes.object.isRequired,
  parentLayer: PropTypes.object,
  updateLayer: PropTypes.func.isRequired,
};

const Layer = ({ layer, parentLayer, updateLayer }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const unCheckChildren = layer => {
    const newLayer = { ...layer };

    layer.children?.forEach((childLayer, i) => {
      let newChildLayer = { ...childLayer };
      newChildLayer.visible = false;
      newChildLayer = unCheckChildren(newChildLayer);
      newLayer.children[i] = newChildLayer;
    });

    return newLayer;
  };

  const onChange = e => {
    if (e.target.checked && parentLayer && !parentLayer.visible) {
      window.alert(
        'This layer has been disabled because its parent layer is disabled.',
      );
    } else {
      let newLayer = { ...layer };
      newLayer.visible = e.target.checked;
      if (!e.target.checked) {
        newLayer = unCheckChildren(newLayer);
      }
      updateLayer(newLayer);
    }
  };

  const hasSubLayers = layer.children.length > 0;

  return (
    <div className="Layer">
      <div className="layer-wrapper">
        <div className="padding">
          {hasSubLayers && (
            <div
              className={classNames({
                arrow: true,
                expanded: isExpanded,
              })}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icon glyph="ic_chevron_right_black_24px" />
            </div>
          )}
        </div>
        <Input
          id={layer.name}
          type="checkbox"
          label={layer.name}
          onChange={onChange}
          checked={layer.visible}
        />
      </div>
      {hasSubLayers && isExpanded && (
        <div className="sub-layers">
          {layer.children.map((subLayer, i) => (
            <Layer
              key={i}
              layer={subLayer}
              parentLayer={layer}
              updateLayer={modifiedSubLayer => {
                const children = [...layer.children];
                children[i] = modifiedSubLayer;
                const newLayer = { ...layer };
                newLayer.children = children;

                updateLayer(newLayer);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

Layer.propTypes = propTypes;

export default Layer;
