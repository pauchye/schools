import React from 'react'
import ModalTrigger from './modaltrigger'
import ModalContent from './modalcontent'

class Modal extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     isShown: props.isOpened
        // };
        // debugger
        // this.showModal = this.showModal.bind(this)
        // this.closeModal = this.closeModal.bind(this)
        // this.onKeyDown = this.onKeyDown.bind(this)
        // this.onClickOutside = this.onClickOutside.bind(this)
    }

    // showModal(){
    //     this.setState({ isShown: true })
    //     // this.setState({ isShown: true }, () => {
    //     //   this.closeButton.focus();
    //     // });
    //     this.toggleScrollLock();
    //   };

    // closeModal() {
    //     this.setState({ isShown: false });
    //     // this.TriggerButton.focus();
    //     this.toggleScrollLock();
    // };

    // onKeyDown(event) {
    //     if (event.keyCode === 27) {
    //         this.closeModal();
    //     }
    // };

    // onClickOutside(event) {
    //     // let modal = document.getElementsByClassName('modal-child')
    //     // debugger
    //     // if (modal.contains(event.target)) return;
    //     if(document.getElementById('modalNotClosed').contains(event.target)) return;
    //     this.closeModal();
    // };

    // toggleScrollLock() {
    //     console.log('tog modal')
    //     document.querySelector('html').classList.toggle('scroll-lock');
    // };

    render() {
        // debugger
      return (
        <React.Fragment>
            {/* <ModalTrigger
                showModal={this.showModal}
                triggerText={this.props.modalProps.triggerText}
        ></ModalTrigger> */}
          {/* <ModalTrigger triggerText={this.props.modalProps.triggerText} /> */}
          {/* <ModalContent /> */}
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