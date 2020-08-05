import React from 'react'
import EachSelected from './eachSelected'
import './selected.css'

const allSchools = require('./reports/schoolqrep2018.json'); 
const dummyData = require('./reports/dummydata.json')
const fieldsData = [
    'count_of_students_in_hs',
    'count_of_testers',
    'number_of_offers'
]
const fieldOtherData = [
    'School Type',
    'Enrollment',
    'Rigorous Instruction Rating',
    'Supportive Environment Rating',
    'Effective School Leadership Rating',
    'Strong Family-Community Ties Rating',
    'Student Achievement Rating',
    'Quality Review - How interesting and challenging is the curriculum?',
    'Quality Review - How effective is the teaching and learning?',
    'Quality Review - How well does the school assess what students are learning?',
    'Average Incoming ELA Proficiency (Based on 5th Grade)',
    'Average Incoming Math Proficiency (Based on 5th Grade)',
    'Years of principal experience at this school'
]

const fieldPercentData = [
    'Percent English Language Learners',
    'Percent Students with Disabilities',
    'Percent Self-Contained',
    'Percent HRA Eligible',
    'Percent Asian',
    'Percent Black',
    'Percent Hispanic',
    'Percent White',
    'Percent of teachers with 3 or more years of experience',
    'Percent of Students Chronically Absent'
]

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
                <table className="selected-body">
                    <tbody>
                        <tr>
                            <th colspan="100%" className="table-head">
                                Middle School Name
                            </th>
                            
                            </tr>
                            
                            <tr>
                                {
                                    this.state.selected.map((object, idx) => {
                                        return(
                                            <th className="table-col" key={idx}>
                                                {object['feeder_school_name']}
                                            </th>
                                        )
                                    })
                                }
                            </tr>
                            
                        
                        
                    
                {
                    fieldsData.map((field, id) => {
                        let betterField = field.split("_").map(word => word.slice(0,1).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
                        // debugger
                        return(
                            <React.Fragment key={id}>
                                <tr>
                                    <td colspan="100%" className="tab-colspan">
                                     {betterField}   
                                    </td>
                                </tr>
                                

                                
                                    <tr className="selected-row">
                                {
                                    this.state.selected.map((object, idx) => {
                                        return(
                                            <td key={idx}>
                                                {object[field]}
                                            </td>
                                        )
                                    })
                                }
                                </tr>
                                
                                    
                            </React.Fragment>
                        )
                    })
                }

                {
                    fieldOtherData.map((field, id) => {
                        return(
                            <React.Fragment key={id}>
                                <tr>
                                    <td colspan="100%" className="tab-colspan">
                                       {field} 
                                    </td>
                                    </tr>
                                    <tr>
                                {
                                    this.state.selected.map((object, idx) => {
                                        let otherData = otherDataSet.filter((object2) => {
                                            return object2["DBN"] === object.feeder_school_dbn
                                          })
                                          if(!otherData[0]) otherData = [dummyData]

                                        return(
                                            <td key={idx}>
                                                {otherData[0][field]}
                                            </td>
                                        )
                                    })
                                }
                                    </tr>
                            </React.Fragment>
                        )
                    })
                }

{
                    fieldPercentData.map((field, id) => {
                        return(
                            <React.Fragment key={id}>
                                <tr>
                                    <td colspan="100%" className="tab-colspan">
                                       {field} 
                                    </td>
                                    </tr>
                                    <tr>
                                {
                                    this.state.selected.map((object, idx) => {
                                        let otherData = otherDataSet.filter((object2) => {
                                            return object2["DBN"] === object.feeder_school_dbn
                                          })
                                          if(!otherData[0]) otherData = [dummyData]

                                        return(
                                            <td key={idx}>
                                                {(otherData[0][field]*100).toFixed(1).toString() + ' %'}
                                            </td>
                                        )
                                    })
                                }
                                    </tr>
                            </React.Fragment>
                        )
                    })
                }



                          
                {/* {this.state.selected.map((object, idx) => {
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
                })} */}
                </tbody>
                </table>  
            </div>
        )
    }
}

export default Selected