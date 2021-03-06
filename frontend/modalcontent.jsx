import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './modal.css'
import ShowSchool from './showSchool'

export class ModalContent extends Component {

        
    render() {
        // debugger
        return ReactDOM.createPortal(
        <aside aria-modal="true" tabIndex="-1" role="dialog" className="modal-cover"
            onClick={this.props.onClickOutside}
            onKeyDown={this.props.onKeyDown}
        >
            <div className="modal-background">
            {/* <button 
                aria-label="Close Modal"
                aria-labelledby="close-modal"
                className="_modal-close"
                onClick={this.props.closeModal} className="_modal-close">
                <span id="close-modal" className="_hide-visual">Close</span>
                <svg className="_modal-close-icon" viewBox="0 0 40 40">
                <path d="M 10,10 L 30,30 M 30,10 L 10,30" />
                </svg>
            </button> */}
            <div className="modal-child"
                id="modalNotClosed"
            >
                <div 
                aria-label="Close Modal"
                aria-labelledby="close-modal"
                className="_modal-close"
                onClick={this.props.closeModal} className="_modal-close">
                <span id="close-modal" className="_hide-visual"><i class="fas fa-times-circle fa-lg color-blue"></i></span>
                {/* <svg className="_modal-close-icon" viewBox="0 0 40 40">
                <path d="M 10,10 L 30,30 M 30,10 L 10,30" />
                </svg> */}
            </div>
            
                <ShowSchool
                    content={this.props.content}
                />
            </div>
            </div>
        </aside>,
        document.body
        );
    }
}
export default ModalContent;