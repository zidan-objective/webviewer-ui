import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from 'components/Button';
import './DocumentControls.scss';

class DocumentControls extends React.PureComponent {
  static propTypes = {
    selectedPageIndexes: PropTypes.array.isRequired,
    selectedPageCount: PropTypes.number.isRequired,
    deletePagesCallBack: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.deletePagesHandler = this.deletePages.bind(this);
  }

  rotateCounterClockwiseHander () {

  }

  deletePages = () => {
    this.props.deletePagesCallBack();
  }

  extractPages = () => {
    const { selectedPageIndexes } = this.props;
    window.readerControl.extractPages(selectedPageIndexes.map(index => index + 1 ));
  }

  showOtherOptions = () => {

    
  }

  render() {
    const { selectedPageCount } = this.props;

    return (
      <div className={`documentControls ${!selectedPageCount ? 'hidden' : ''}`}>
        <Button
          img="ic_add_black_24px"
          onClick={this.rotateCounterClockwiseHander}
        />
        <Button
          img="ic_delete_black_24px"
          onClick={this.deletePages}
          title="action.delete"
        />
        <Button
          img="ic_extract_black_24px"
          title="action.extract"
          onClick={this.extractPages}
        />

        <Button
          img="ic_more_black_24px"
          onClick={this.showOtherOptions}
        />
      </div>)
  }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(DocumentControls);