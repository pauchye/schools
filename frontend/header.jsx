import React from 'react'
import './header.css'

function handleClick(){
    localStorage.clear()
    location.hash = '/'
}

function Header() {

    

    return(
        <div className="header-main">
            <div className="header-left"> 
                <div className="header-logo" onClick={handleClick}>
                    {/* <div >Smart hat</div>   */}
                    <i className="fas fa-graduation-cap fa-4x" style={{fontsize: "98px", color:"white"}}></i>
                    
                </div>
                <div className="header-logo-text">Smart hat</div>  
                {/* <div >Feeder schools</div> */}
                
            </div>
            <div className="header-mid-text">
                <div className="bold">Where New York City’s Elite High Schools Get Their Students?</div>
                <div>See SHSAT Admissions Test Offers By Sending Middle School</div>
            </div>
            <div className="header-right"> 
                <div>
                   <a href="https://data.cityofnewyork.us/Education/2018-2019-SHSAT-Admissions-Test-Offers-By-Sending-/uf53-ree9">DATA LINK 1</a>  
                </div>
                <div>
                   <a href="https://data.cityofnewyork.us/Education/2017-2018-School-Quality-Reports-Elem-Middle-K-8/g6v2-wcvk">DATA LINK 2</a>  
                </div>                    
            </div>  
        </div>
        
    )
};

export default Header;