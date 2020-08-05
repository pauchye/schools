import React from 'react'
import './header.css'

function handleClick(){
        localStorage.clear()
        location.hash = '/'
    }

function Header() {

    

    return(
        <div className="footer-main">
            <div className="footer-left"> 
                <div>I am a strong believer that equal opportunities start with education.</div>
                <div>And education should be a right instead of a privilage.</div>                   
            </div>
            <div className="footer-right">   
                <a className="fab fa-github fa-lg quick-fix" href="https://github.com/pauchye"></a>
                <a className="fab fa-linkedin fa-lg quick-fix" href="https://www.linkedin.com/in/olga-smirnova-17b73b41/"></a>             
            </div>  
        </div>
        
    )
};

export default Header;