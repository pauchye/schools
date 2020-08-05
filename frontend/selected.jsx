import React from 'react'
import EachSelected from './eachSelected'
import './selected.css'

const allSchools = require('./reports/schoolqrep2018.json'); 
const dummyData = require('./reports/dummydata.json')

class Selected extends React.Component {
    constructor(props){
        super(props)
        this.handleClick = this.handleClick.bind(this)
        // debugger
    }

    componentDidMount() {
        const selected = localStorage.getItem('selected');
        this.setState({ selected: JSON.parse(selected) });
    }

    handleClick(){
        localStorage.clear()
        location.hash = '/'
    }

    render(){
        let otherDataSet = allSchools;
        console.log('this.state', this.state)
        if(!this.state) return <div>Loading...</div>
        console.log('this.state', this.state)
        return(
            <div className="selected-main">        
                <div className="selected-button" onClick={this.handleClick}>Back</div>        
                <div className="selected-body">

                          
                {this.state.selected.map((object, idx) => {
                    let otherData = otherDataSet.filter((object2) => {
                      return object2["DBN"] === object.feeder_school_dbn
                    })
                    if(!otherData[0]) otherData = [dummyData]
                    if(!object.isChecked) object.isChecked = false; 
                    return <EachSelected 
                        name={object.feeder_school_name}
                        key={idx} 
                        data={object} 
                        otherData={otherData[0]} 
                   />
                })}
                </div>  
            </div>
        )
    }
}

export default Selected