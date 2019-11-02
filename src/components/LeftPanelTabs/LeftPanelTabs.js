import React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import Button from 'components/Button';
import Element from 'components/Element';

import useLayers from 'hooks/useLayers';
import actions from 'actions';
import selectors from 'selectors';

import './LeftPanelTabs.scss';

const LeftPanelTabs = () => {
  const [isDisabled, activePanel, customPanels] = useSelector(
    state => [
      selectors.isElementDisabled(state, 'leftPanelTabs'),
      selectors.getActiveLeftPanel(state),
      selectors.getCustomPanels(state),
    ],
    shallowEqual,
  );
  const dispatch = useDispatch();
  const [layers] = useLayers();

  const isActive = panel => activePanel === panel;

  return isDisabled ? null : (
    <Element className="LeftPanelTabs" dataElement="leftPanelTabs">
      <Button
        isActive={isActive('thumbnailsPanel')}
        dataElement="thumbnailsPanelButton"
        img="ic_thumbnails_black_24px"
        onClick={() => dispatch(actions.setActiveLeftPanel('thumbnailsPanel'))}
        title="component.thumbnailsPanel"
      />
      <Button
        isActive={isActive('outlinesPanel')}
        dataElement="outlinesPanelButton"
        img="ic_outline_black_24px"
        onClick={() => dispatch(actions.setActiveLeftPanel('outlinesPanel'))}
        title="component.outlinesPanel"
      />
      <Button
        isActive={isActive('notesPanel')}
        dataElement="notesPanelButton"
        img="ic_annotations_black_24px"
        onClick={() => dispatch(actions.setActiveLeftPanel('notesPanel'))}
        title="component.notesPanel"
      />
      {layers.length > 0 && (
        <Button
          isActive={isActive('layersPanel')}
          dataElement="layersPanelButton"
          img="ic_layers_24px"
          onClick={() => dispatch(actions.setActiveLeftPanel('layersPanel'))}
          title="component.layersPanel"
        />
      )}

      {customPanels.map(({ panel, tab }, index) => (
        <Button
          key={tab.dataElement || index}
          isActive={isActive(panel.dataElement)}
          dataElement={tab.dataElement}
          img={tab.img}
          onClick={() =>
            dispatch(actions.setActiveLeftPanel(panel.dataElement))
          }
          title={tab.title}
        />
      ))}
    </Element>
  );
};

export default React.memo(LeftPanelTabs);
