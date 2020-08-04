import React from 'react'

function ShowSchool(props) {
    const school = props.content.data;
    return(
        <div>
            <ul>
                <li>
                    <div>School name</div>
                    <div>{school["name"]}</div>
                </li>
                <li>
                    <div>Count of students in high school</div>
                    <div>{school["data"]["count_of_students_in_hs"]}</div>
                </li>
                <li>
                    <div>Count of testers</div>
                    <div>{school["data"]["count_of_testers"]}</div>
                </li>
                <li>
                    <div>Number of offers</div>
                    <div>{school["data"]["number_of_offers"]}</div>
                </li>
                <li>
                    <div>School Type</div>
                    <div>{school["otherData"]["School Type"]}</div>
                </li>
                <li>
                    <div>Enrollment</div>
                    <div>{school["otherData"]["Enrollment"]}</div>
                </li>
                <li>
                    <div>Rigorous Instruction Rating</div>
                    <div>{school["otherData"]["Rigorous Instruction Rating"]}</div>
                </li>
                <li>
                    <div>Collaborative Teachers Rating</div>
                    <div>{school["otherData"]["Collaborative Teachers Rating"]}</div>
                </li>
                <li>
                    <div>Supportive Environment Rating</div>
                    <div>{school["otherData"]["Supportive Environment Rating"]}</div>
                </li>
                <li>
                    <div>Effective School Leadership Rating</div>
                    <div>{school["otherData"]["Effective School Leadership Rating"]}</div>
                </li>
                <li>
                    <div>Strong Family-Community Ties Rating</div>
                    <div>{school["otherData"]["Strong Family-Community Ties Rating"]}</div>
                </li>
                <li>
                    <div>Trust Rating</div>
                    <div>{school["otherData"]["Trust Rating"]}</div>
                </li>
                <li>
                    <div>Student Achievement Rating</div>
                    <div>{school["otherData"]["Student Achievement Rating"]}</div>
                </li>
                <li>
                    <div>How interesting and challenging is the curriculum?</div>
                    <div>{school["otherData"]["Quality Review - How interesting and challenging is the curriculum?"]}</div>
                </li>
                <li>
                    <div>How effective is the teaching and learning?</div>
                    <div>{school["otherData"]["Quality Review - How effective is the teaching and learning?"]}</div>
                </li>
                <li>
                    <div>How well does the school assess what students are learning?</div>
                    <div>{school["otherData"]["Quality Review - How well does the school assess what students are learning?"]}</div>
                </li>
                <li>
                    <div>Average Incoming ELA Proficiency (Based on 5th Grade)</div>
                    <div>{school["otherData"]["Average Incoming ELA Proficiency (Based on 5th Grade)"]}</div>
                </li>
                <li>
                    <div>Average Incoming Math Proficiency (Based on 5th Grade)</div>
                    <div>{school["otherData"]["Average Incoming Math Proficiency (Based on 5th Grade)"]}</div>
                </li>
                <li>
                    <div>Percent English Language Learners</div>
                    <div>{school["otherData"]["Percent English Language Learners"]}</div>
                </li>
                <li>
                    <div>Percent Students with Disabilities</div>
                    <div>{school["otherData"]["Percent Students with Disabilities"]}</div>
                </li>
                <li>
                    <div>Percent Self-Contained</div>
                    <div>{school["otherData"]["Percent Self-Contained"]}</div>
                </li>
                <li>
                    <div>Percent in Temp Housing</div>
                    <div>{school["otherData"]["Percent in Temp Housing"]}</div>
                </li>
                <li>
                    <div>Percent HRA Eligible</div>
                    <div>{school["otherData"]["Percent HRA Eligible"]}</div>
                </li>
                <li>
                    <div>Percent Asian</div>
                    <div>{school["otherData"]["Percent Asian"]}</div>
                </li>
                <li>
                    <div>Percent Black</div>
                    <div>{school["otherData"]["Percent Black"]}</div>
                </li>
                <li>
                    <div>Percent Hispanic</div>
                    <div>{school["otherData"]["Percent Hispanic"]}</div>
                </li>
                <li>
                    <div>Percent White</div>
                    <div>{school["otherData"]["Percent White"]}</div>
                </li>
                <li>
                    <div>Years of principal experience at this school</div>
                    <div>{school["otherData"]["Years of principal experience at this school"]}</div>
                </li>
                <li>
                    <div>Percent of teachers with 3 or more years of experience</div>
                    <div>{school["otherData"]["Percent of teachers with 3 or more years of experience"]}</div>
                </li>
                <li>
                    <div>Percent of Students Chronically Absent</div>
                    <div>{school["otherData"]["Percent of Students Chronically Absent"]}</div>
                </li>




            </ul>
        </div>
    )
}

export default ShowSchool