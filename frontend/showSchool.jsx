import React from 'react'
import './modal.css'

function ShowSchool(props) {
    const school = props.content.data;
    return(
        <div className="show-body">
                <div>
                    <div>School name</div>
                    <div>{school["name"]}</div>
                </div>
                <div>
                    <div>Count of students in high school</div>
                    <div>{school["data"]["count_of_students_in_hs"]}</div>
                </div>
                <div>
                    <div>Count of testers</div>
                    <div>{school["data"]["count_of_testers"]}</div>
                </div>
                <div>
                    <div>Number of offers</div>
                    <div>{school["data"]["number_of_offers"]}</div>
                </div>
                <div>
                    <div>School Type</div>
                    <div>{school["otherData"]["School Type"]}</div>
                </div>
                <div>
                    <div>Enrollment</div>
                    <div>{school["otherData"]["Enrollment"]}</div>
                </div>
                <div>
                    <div>Rigorous Instruction Rating</div>
                    <div>{school["otherData"]["Rigorous Instruction Rating"]}</div>
                </div>
                <div>
                    <div>Collaborative Teachers Rating</div>
                    <div>{school["otherData"]["Collaborative Teachers Rating"]}</div>
                </div>
                <div>
                    <div>Supportive Environment Rating</div>
                    <div>{school["otherData"]["Supportive Environment Rating"]}</div>
                </div>
                <div>
                    <div>Effective School Leadership Rating</div>
                    <div>{school["otherData"]["Effective School Leadership Rating"]}</div>
                </div>
                <div>
                    <div>Strong Family-Community Ties Rating</div>
                    <div>{school["otherData"]["Strong Family-Community Ties Rating"]}</div>
                </div>
                <div>
                    <div>Trust Rating</div>
                    <div>{school["otherData"]["Trust Rating"]}</div>
                </div>
                <div>
                    <div>Student Achievement Rating</div>
                    <div>{school["otherData"]["Student Achievement Rating"]}</div>
                </div>
                <div>
                    <div>How interesting and challenging is the curriculum?</div>
                    <div>{school["otherData"]["Quality Review - How interesting and challenging is the curriculum?"]}</div>
                </div>
                <div>
                    <div>How effective is the teaching and learning?</div>
                    <div>{school["otherData"]["Quality Review - How effective is the teaching and learning?"]}</div>
                </div>
                <div>
                    <div>How well does the school assess what students are learning?</div>
                    <div>{school["otherData"]["Quality Review - How well does the school assess what students are learning?"]}</div>
                </div>
                <div>
                    <div>Average Incoming ELA Proficiency (Based on 5th Grade)</div>
                    <div>{school["otherData"]["Average Incoming ELA Proficiency (Based on 5th Grade)"]}</div>
                </div>
                <div>
                    <div>Average Incoming Math Proficiency (Based on 5th Grade)</div>
                    <div>{school["otherData"]["Average Incoming Math Proficiency (Based on 5th Grade)"]}</div>
                </div>
                <div>
                    <div>Percent English Language Learners</div>
                    <div>{(school["otherData"]["Percent English Language Learners"]*100).toFixed(1).toString() + ' %'}</div>
                </div>
                <div>
                    <div>Percent Students with Disabilities</div>
                    <div>{(school["otherData"]["Percent Students with Disabilities"]*100).toFixed(1).toString() + ' %'}</div>
                </div>
                <div>
                    <div>Percent Self-Contained</div>
                    <div>{(school["otherData"]["Percent Self-Contained"]*100).toFixed(1).toString() + ' %'}</div>
                </div>
                <div>
                    <div>Percent in Temp Housing</div>
                    <div>{(school["otherData"]["Percent in Temp Housing"]*100).toFixed(1).toString() + ' %'}</div>
                </div>
                <div>
                    <div>Percent HRA Eligible</div>
                    <div>{(school["otherData"]["Percent HRA Eligible"]*100).toFixed(1).toString() + ' %'}</div>
                </div>
                <div>
                    <div>Percent Asian</div>
                    <div>{(school["otherData"]["Percent Asian"]*100).toFixed(1).toString() + ' %'}</div>
                </div>
                <div>
                    <div>Percent Black</div>
                    <div>{(school["otherData"]["Percent Black"]*100).toFixed(1).toString() + ' %'}</div>
                </div>
                <div>
                    <div>Percent Hispanic</div>
                    <div>{(school["otherData"]["Percent Hispanic"]*100).toFixed(1).toString() + ' %'}</div>
                </div>
                <div>
                    <div>Percent White</div>
                    <div>{(school["otherData"]["Percent White"]*100).toFixed(1).toString() + ' %'}</div>
                </div>
                <div>
                    <div>Years of principal experience at this school</div>
                    <div>{school["otherData"]["Years of principal experience at this school"]}</div>
                </div>
                <div>
                    <div>Percent of teachers with 3 or more years of experience</div>
                    <div>{school["otherData"]["Percent of teachers with 3 or more years of experience"]}</div>
                </div>
                <div>
                    <div>Percent of Students Chronically Absent</div>
                    <div>{school["otherData"]["Percent of Students Chronically Absent"]}</div>
                </div>   
        </div>
    )
}

export default ShowSchool