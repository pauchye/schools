import React from 'react'

class ModalTrigger extends React.Component {
    render() {
      return <button onClick={this.props.showModal} className="modal-button">{this.props.triggerText}</button>;
    }
}

export default ModalTrigger;
