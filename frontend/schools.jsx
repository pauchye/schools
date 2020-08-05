import React from 'react'
import EachSchool from './eachSchool'
import { Link } from 'react-router-dom'
import './schools.css'
import Modal from './modal'

// import all from "./reports/schoolqrep2018.js";
const allSchools = require('./reports/schoolqrep2018.json'); 
const dummyData = require('./reports/dummydata.json')

function debounce(fn, time) {
  let timeoutHandle = null;
  let lastArgs = null;

  return function(...args) {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
    const that = this;
    lastArgs = args;
    timeoutHandle = setTimeout(() => {
      fn.apply(that, lastArgs);
    }, time);
  }
}

class Schools extends React.Component {
    constructor(){
        super()
        this.state = {
            data: allSchools,
            feederData: [],
            selected: [],
            isOpened: false,
            sort: 'acs'
        }
        this.modalContent = null

        this.handleCheckChildElement = this.handleCheckChildElement.bind(this)
        this.handleOpenModal = this.handleOpenModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.onClickOutside = this.onClickOutside.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.toggleScrollLock = this.toggleScrollLock.bind(this)
        this.updateDistrict = this.updateDistrict.bind(this)
        this.toggleSort = this.toggleSort.bind(this)
        this.handleSearch = this.handleSearch.bind(this)
    }

    componentDidMount(){
        fetch("https://data.cityofnewyork.us/resource/xuij-x4t4.json").then(response => {
            return response.json()}
        ).then(response => {
            console.log('response', response)
            this.setState({ feederData: response })
            localStorage.setItem('storeData', JSON.stringify(response))
            // debugger
        })
    }


    handleCheckChildElement(event){
        let schools = this.state.feederData
        let selectedSchools = []
        schools.forEach(school => {
          if (school.feeder_school_name === event.target.name) {
            school.isChecked =  event.target.checked;
          }
          if(school.isChecked){
            selectedSchools.push(school)  
          }
        })
        this.setState({feederData: schools, selected: selectedSchools}) 
    }

    handleOpenModal(event){
        this.setState({isOpened: true});
        this.modalContent = {
          data: JSON.parse(event.target.dataset.data)
        }
        this.toggleScrollLock();
    }

    closeModal() {
        this.setState({ isOpened: false });
        this.toggleScrollLock();
    };

    onKeyDown(event) {
        if (event.keyCode === 27) {
            this.closeModal();
        }
    };

    onClickOutside(event) {
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
        document.querySelector('html').classList.toggle('scroll-lock');
    };

    updateDistrict(event) {
        event.persist();
        // debugger
        let allSchools = JSON.parse(localStorage.getItem('storeData'));
        if (event.target.value !== "All"){
          allSchools = allSchools.filter(sch => {
            return parseInt(sch.feeder_school_dbn.slice(0, 2)) === parseInt(event.target.value)
          });
          // console.log('all dist', allSchools[0])
        } 
        // else {

        //   allSchools = JSON.parse(localStorage.getItem('storeData'))
          
        //   console.log('all all', allSchools)
        // }
        // debugger
        this.setState({feederData: allSchools})
    }


    toggleSort(event) {
      let sorter = event.target.dataset.sort || event.target.parentNode.dataset.sort;
      let schools = this.state.feederData ;
      let newSchools;
      let lessSchools;
      if(this.state.sort === 'acs'){
        newSchools = schools.filter(school => {
          return school[sorter] !== "0-5"
        }).sort(function(a, b){
          return a[sorter] - b[sorter]
        });
        lessSchools = schools.filter(school => {
          return school[sorter] === "0-5"
        })
        newSchools = lessSchools.concat(newSchools);
        this.setState({feederData: newSchools})
        this.setState({sort: 'desc'})
        debugger
      } else {
        newSchools = schools.filter(school => {
          return school[sorter] !== "0-5"
        }).sort(function(a, b){
          return b[sorter] - a[sorter]
        });
        lessSchools = schools.filter(school => {
          return school[sorter] === "0-5"
        })
        newSchools = newSchools.concat(lessSchools);
        this.setState({feederData: newSchools})
        this.setState({sort: 'acs'})
      }
      
    }

    handleSearch(event){
      event.persist();
        if(!this.debounced) {
            this.debounced = debounce(() => {
                    this.setState({filter: event.target.value})
             }, 600);
        }
        this.debounced();
    }


    render(){
        // debugger
        if(this.state.data === []) return <div>Oops...</div>;
        let otherDataSet = this.state.data;
        let filteredSchools = this.state.feederData;
        let districts = [...Array(32).keys()].map(el => el+1);
        districts.push(79)
        districts.push(84)
        if(this.state.filter){
          filteredSchools = filteredSchools.filter(school => {
            // console.log('school',school)
              return school.feeder_school_name.toUpperCase().indexOf(this.state.filter.toUpperCase()) >= 0
              // return school.feeder_school_name.split(" ").map((el) => { return el.toUpperCase()}).includes(this.state.filter.toUpperCase())
        });
      }
        // console.log("dist", districts)
        let arrow = this.state.sort === "acs" ? <i className="fas fa-angle-down fa-lg space"></i> : <i className="fas fa-angle-up fa-lg space"></i>
        return(
            <div className='schools-main'>
                
                <Modal 
                  isOpened={this.state.isOpened} 
                  modalContent={this.modalContent}
                  onKeyDown={this.onKeyDown}
                  onClickOutside={this.onClickOutside}
                  closeModal={this.closeModal} 
                  />  
                  
            {/* <div className='schools-top'>
                <button onClick={this.handleSubmit}>Compare</button>  
            </div>        */}
                        
            <ul>
                <div className='fixed'>
                 <li className='table'>
               
                    <div className='tab-1'>
                      <div>Select</div>
                      <button className='compare-button' onClick={this.handleSubmit}>COMPARE</button>  
                    </div>
                    <div className='tab-2' >District
                        <select onChange={this.updateDistrict}> 
                          <option  value='All'>All</option>
                          {districts.map(dist => {
                            return <option key={dist} value={dist}>{dist}</option>
                          })}
                        </select>
                    </div>
                    <div className='tab-3'>
                      <div>Name</div>
                      <input type="text" onChange={this.handleSearch}/>
                      </div>
                    <div className='tab-4' onClick={this.toggleSort} data-sort="count_of_students_in_hs">Number of students
                    {/* <i class="fas fa-angle-down"></i> */}
                      {arrow}
                    </div>
                    <div className='tab-5' onClick={this.toggleSort} data-sort="count_of_testers">Number of testers
                    {/* <i class="fas fa-angle-down"></i> */}
                      {arrow}
                    </div>
                    <div className='tab-6' onClick={this.toggleSort} data-sort="number_of_offers">Number of offers
                    {/* <i class="fas fa-angle-down"></i> */}
                      {arrow}
                    </div>
                    <div className='tab-7'>Avg. Incoming ELA Prof.</div>
                    <div className='tab-8'>Avg. Incoming Math Prof.</div>
                    <div className='tab-9'>W %</div>
                    <div className='tab-10'>B %</div>
                    <div className='tab-11'>A %</div>
                    <div className='tab-12'>H %</div>
                    <div className='tab-13'>ELL learner %</div>
                    </li>
                  </div>
                <div className='pos-top'>

               
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
               </div>  
            </ul>
            </div>
        )
    }
}

export default Schools
