import React from 'react';
import './selected.css'

function EachSelected(props){

    return(
        <div className="each-body">
            <table>
                <thead>
                <tr>
                    <th>
                        {props.data.feeder_school_name}
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>
                         {props.data.count_of_students_in_hs}
                    </td>
                </tr>
                <tr>
                    <td>
                         {props.data.count_of_testers}
                    </td>
                </tr>
                <tr>
                    <td>
                         {props.data.number_of_offers}
                    </td>
                </tr>
                <tr>
                    <td>Average Incoming ELA Proficiency</td>
                    <td>
                         {props.otherData["Average Incoming ELA Proficiency (Based on 5th Grade)"]}
                    </td>
                </tr>
                <tr>
                    <td>Average Incoming ELA Proficiency</td>
                    <td>
                         {props.otherData["Average Incoming Math Proficiency (Based on 5th Grade)"]}
                    </td>
                </tr>
                </tbody>

            </table>
            <div></div>
        </div>
        
    )
}

export default EachSelected;