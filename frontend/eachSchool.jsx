import React, { useState } from 'react';
import './schools.css'

function EachSchool(props){
    return(
        <div>
            {/* <h1>hi</h1> */}
            <li className='table'>
                <div className='tab-1'>
                    <input name={props.name} type="checkbox" checked={props.isChecked} onChange={props.handleCheckChildElement}/>
                </div>
                <div className='tab-2'>{props.data.feeder_school_dbn.slice(0, 2)}</div>
                <div className='tab-3' data-data={JSON.stringify(props)} onClick={props.handleOpenModal}>{props.data.feeder_school_name}</div>
                {/* <div className='tab-3' onClick={() => {
                    let selectedSchool = JSON.stringify(props);
                    localStorage.setItem('selectedSchool', selectedSchool)
                    location.hash = '/show'
                }}>{props.data.feeder_school_name}</div> */}
                <div className='tab-4'>{props.data.count_of_students_in_hs}</div>
                <div className='tab-5'>{props.data.count_of_testers}</div>
                <div className='tab-6'>{props.data.number_of_offers}</div>
                <div className='tab-7'>{props.otherData['Average Incoming ELA Proficiency (Based on 5th Grade)']}</div>
                <div className='tab-8'>{props.otherData['Average Incoming Math Proficiency (Based on 5th Grade)']}</div>
                <div className='tab-9'>{(props.otherData['Percent White']*100).toFixed(1).toString()+' %'}</div>
                <div className='tab-10'>{(props.otherData['Percent Black']*100).toFixed(1).toString()+' %'}</div>
                <div className='tab-11'>{(props.otherData['Percent Asian']*100).toFixed(1).toString()+' %'}</div>
                <div className='tab-12'>{(props.otherData['Percent Hispanic']*100).toFixed(1).toString()+' %'}</div>
                <div className='tab-13'>{(props.otherData['Percent English Language Learners']*100).toFixed(1).toString()+' %'}</div>
            </li>
        </div>
        
    )
}

export default EachSchool;