import React from 'react';
import {GbifLogoIcon} from './Icons'
import {IconContext} from 'react-icons'
function Logo() {
      /* return (<div
            style={{ backgroundImage: `url("../images/clb-blue.svg")` , height: '58px', width: '58px', flex: '0 0 auto' }}
            className='headerLogo'
          />) */
      return (<IconContext.Provider value={{ color: "white", size: "56"}}><GbifLogoIcon /></IconContext.Provider>);
}

export default Logo;