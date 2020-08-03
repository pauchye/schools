import React from 'react'
import EachSchool from './eachSchool'
import { Link } from 'react-router-dom'
import './schools.css'
import Modal from './modal'

// import all from "./reports/schoolqrep2018.js";
const allSchools = require('./reports/schoolqrep2018.json'); 
const dummyData = require('./reports/dummydata.json')


class Schools extends React.Component {
    constructor(){
        super()
        this.state = {
            data: allSchools,
            feederData: [],
            selected: [],
            isOpened: false
        }

        // this.isOpened = false;
        this.modalContent = null
        // this.modalProps = {
        //     triggerText: 'Launch the Modal!'
        // };
        // this.modalContent = (
        //     <div>
        //       <p>Hello From passed modalContent from App!</p>
        //     </div>
        //   );
        this.handleCheckChildElement = this.handleCheckChildElement.bind(this)
        this.handleOpenModal = this.handleOpenModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.onClickOutside = this.onClickOutside.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.toggleScrollLock = this.toggleScrollLock.bind(this)
        // this.handleCompare = this.handleCompare.bind(this)
    }

    componentDidMount(){
        // const p1 = fetch("https://data.cityofnewyork.us/resource/g6v2-wcvk.json").then(response => response.json());
        // const p1 = fetch("./frontend/reports/schoolqrep2018.json").then(response => response.json());
        // const p2 = fetch("https://data.cityofnewyork.us/resource/xuij-x4t4.json").then(response => response.json());;
        // Promise.all([p1, p2]).then(([p1Res, p2Res]) => {
        //     this.setState({
        //         data: p1Res,
        //         feederData: p2Res
        //     });
        // });

        // fetch("https://data.cityofnewyork.us/resource/g6v2-wcvk.json")
        // .then(response => {
        //     // console.log('response', response)
        //     return response.json()}
        // )
        // .then(response => {
        //     console.log('response', response)
        //     this.setState({ data: response })
        // })

        fetch("https://data.cityofnewyork.us/resource/xuij-x4t4.json").then(response => {
            return response.json()}
        ).then(response => {
            console.log('response', response)
            this.setState({ feederData: response })
        })
    }

    // componentDidUpdate() {
    //     console.log('updated')
    //   }

    handleCheckChildElement(event){
        let schools = this.state.feederData
        let selectedSchools = []
        schools.forEach(school => {
          if (school.feeder_school_name === event.target.name) {
            school.isChecked =  event.target.checked;
            
            // this.setState({feederData: schools})
          }
          if(school.isChecked){
            selectedSchools.push(school)  
          }
        })
        this.setState({feederData: schools, selected: selectedSchools})
        // console.log('this.state.selected', this.state.selected)
        // console.log('selectedSchools', selectedSchools)
        
     }

     handleOpenModal(event){
        // console.log('modal', event.target.dataset.data)
        // debugger
        this.setState({isOpened: true});
        // this.isOpened = true;
        this.modalContent = {
          data: JSON.parse(event.target.dataset.data)
        }
        this.toggleScrollLock();
        // debugger
        // console.log('modal', event.target.otherdata)
     }

    closeModal() {
        this.setState({ isOpened: false });
        // this.TriggerButton.focus();
        // debugger
        this.toggleScrollLock();
    };

    onKeyDown(event) {
        if (event.keyCode === 27) {
            this.closeModal();
        }
    };

    onClickOutside(event) {
        // let modal = document.getElementsByClassName('modal-child')
        // debugger
        // if (modal.contains(event.target)) return;
        if(document.getElementById('modalNotClosed').contains(event.target)) return;
        this.closeModal();
    };

    handleCompare(){
        let selectedSchools = []
        let schools = this.state.feederData
        schools.forEach(school => {
          if (school.isChecked) {
            selectedSchools.push(school);
          }
        })
        console.log('selectedSchools', selectedSchools)
    }

    handleSubmit(){
        let selected = JSON.stringify(this.state.selected);
        localStorage.setItem('selected', selected)
        location.hash = '/selected'
      };

    toggleScrollLock() {
      console.log('tog schools')
        document.querySelector('html').classList.toggle('scroll-lock');
    };


    render(){
        // debugger
        if(this.state.data === []) return <div>Oops...</div>;
        let otherDataSet = this.state.data;
        let filteredSchools = this.state.feederData;
        // console.log('otherDataSet', otherDataSet)
        // console.log('this.state.data', this.state.data)
        // console.log('this.state.feederData', this.state.feederData)
        return(
            <div>
                <button onClick={this.handleSubmit}>Compare</button>
                <Modal 
                  isOpened={this.state.isOpened} 
                  modalContent={this.modalContent}
                  onKeyDown={this.onKeyDown}
                  onClickOutside={this.onClickOutside}
                  closeModal={this.closeModal} 
                  />
                {/* <Link to={{
                    pathname: '/selected',
                    state: {
                        selected: this.state.selected
                    }
                }}>Compare</Link> */}
            
            <ul>
                <li className='table'>
                    <div className='tab-1'>Select</div>
                    <div className='tab-2'>District</div>
                    <div className='tab-3'>Name</div>
                    <div className='tab-4'>Number of students</div>
                    <div className='tab-5'>Number of testers</div>
                    <div className='tab-6'>Number of offers</div>
                    <div className='tab-7'>Avg. Incoming ELA Prof.</div>
                    <div className='tab-8'>Avg. Incoming Math Prof.</div>
                    <div className='tab-9'>W</div>
                    <div className='tab-10'>B</div>
                    <div className='tab-11'>A</div>
                    <div className='tab-12'>H</div>
                    <div className='tab-13'>ELL learner</div>
                </li>
                {
                filteredSchools.map((object, idx) => {
                    let otherData = otherDataSet.filter((object2) => {
                      return object2["DBN"] === object.feeder_school_dbn
                    })
                    if(!otherData[0]) otherData = [dummyData]
                    if(!object.isChecked) object.isChecked = false; 
                    return <EachSchool 
                        name={object.feeder_school_name}
                        key={idx} 
                        data={object} 
                        otherData={otherData[0]} 
                        isChecked={object.isChecked} 
                        handleCheckChildElement={this.handleCheckChildElement} 
                        handleOpenModal={this.handleOpenModal} 
                        // onClick={(data, otherData) => {
                        //   console.log()
                        //   debugger
                        //   this.setState({isOpened: true, 
                        //     modalContent: {
                        //       data,
                        //       otherData: otherData[0]
                        //     }
                        //   });
                        //   this.toggleScrollLock();
                        // }}
                        />
                })}
            </ul>
            </div>
        )
    }
}

export default Schools
