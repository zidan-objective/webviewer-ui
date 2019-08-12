import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Button from 'components/Button';
import { textAlignment } from 'constants/textAlignment';
import './TextAlignTabs.scss';

const horizAlignBtn = [
  { val: textAlignment.horizontal.left, img: 'ic_alignment-left_black_24px', toolTip: 'option.alignment.horizontal.left' },
  { val: textAlignment.horizontal.center, img: 'ic_alignment-center_black_24px', toolTip: 'option.alignment.horizontal.center' },
  { val: textAlignment.horizontal.right, img: 'ic_alignment-right_black_24px', toolTip: 'option.alignment.horizontal.right' },
];

class TextAlignTabs extends React.PureComponent {
  static propTypes = {
    currentAlignment: PropTypes.string,
    setActiveStyle: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }

  isActive = alignment => {
    const { currentAlignment } = this.props;
    return currentAlignment === alignment;
  }

  render() {
    const {
      setActiveStyle,
    } = this.props;

    const alignmentButtons = horizAlignBtn;

    return (
      <span className="TextAlignTab">
        {
          alignmentButtons.map(btn =>
            <Button
              isActive={this.isActive(btn.val)}
              img={btn.img}
              onClick={() => setActiveStyle(btn.val)}
              title={btn.toolTip}
              key={btn.val}
            />
          )
        }
      </span>
    );
  }
}

export default (withTranslation()(TextAlignTabs));
