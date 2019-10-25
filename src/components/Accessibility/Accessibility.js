import React from 'react';

import getHashParams from 'helpers/getHashParams';

import './Accessibility.scss';

class Accessibility extends React.PureComponent {
  state = {
    isVisible: false,
  }

  onFocus = () => {
    this.setState({ isVisible: true });
  }

  onBlur = () => {
    this.setState({ isVisible: false });
  }

  render() {
    const { accessibleMode } = getHashParams();
    const { isVisible } = this.state;

    if (!accessibleMode) {
      return null;
    }

    const className = `Accessibility ${isVisible ? 'visible' : 'hidden'}`;

    return (
      <div className={className} data-element="accessibility">
        <div>Skip to: </div>
        <input className="skip-to-hack" tabIndex={-1}></input>
        <div className="skip-to-document" onFocus={this.onFocus} onBlur={this.onBlur} tabIndex={0}>Document</div>
        <div className="skip-to-notes" onFocus={this.onFocus} onBlur={this.onBlur} tabIndex={0}>Notes</div>
      </div>
    );
  }
}

export default Accessibility;