import React from 'react'
import ModalContent from './modalcontent'

class Modal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // debugger
      return (
        <React.Fragment>
        {this.props.isOpened?<ModalContent 
            closeModal={this.props.closeModal} 
            content={this.props.modalContent}
            onKeyDown={this.props.onKeyDown}
            onClickOutside={this.props.onClickOutside}
            />:<React.Fragment/>}
        </React.Fragment>
      );
    }
}

export default Modal;