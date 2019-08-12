import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { textAlignment } from 'constants/textAlignment';
import TextAlignTabs from '../TextAlignTabs';

import './RedactionOption.scss';

class RedactionOption extends React.PureComponent {
  static propTypes = {
    t: PropTypes.func.isRequired,
    style: PropTypes.object.isRequired,
    onStyleChange: PropTypes.func.isRequired,  
  }

  constructor(props) {
    super(props);
  }

  overlayTextOnChange = e => {
    const { onStyleChange } = this.props;
    onStyleChange('OverlayText', e.target.value);
  }

  horizontalAlignmentChange = val => {
    const { onStyleChange } = this.props;
    onStyleChange('TextAlign', val);
  }

  render() { 
    const { t, style } = this.props;
    let textHorizontalAlignment = style['TextAlign'] || textAlignment.horizontal.left;
    let textValue = style['OverlayText'] || '';

    return (
      <div className="RedactionOption" >
        <div className="option">
          <span className="optionLabel">Alignment</span>
          <span className="optionControl">
            <TextAlignTabs t={t} currentAlignment={textHorizontalAlignment} setActiveStyle={this.horizontalAlignmentChange}/>
          </span>
        </div>
        <hr />
        <div className="overlayTextControls">
          <span className="optionLabel">Custom Text</span>
          <input className="optionControl" type="text" value={textValue} onChange={this.overlayTextOnChange}/>
        </div>
      </div>
    );
  }
}

export default withTranslation()(RedactionOption);