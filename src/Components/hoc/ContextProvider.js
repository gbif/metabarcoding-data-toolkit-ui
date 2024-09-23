import React from "react";
import {
  authenticate as logUserIn,
  logout as logUserOut,
  getTokenUser,
  refreshLogin,
  JWT_STORAGE_NAME,
} from "../../Auth/userApi";
import {getDwcTerms, getRequiredTerms, getDefault} from "../../Api/terms.js"
import { getFormat , getLicense, getSupportedMarkers, getAgentRoles, getNetworks, getFileTypes} from "../../Api/enum.js";
import {getInstallationSettings} from "../../Api/installationSettings.js"
import country from "../../Enum/country.json"
 // import {getTrees} from '../../Api'

// Initializing and exporting AppContext - common for whole application
export const AppContext = React.createContext({});


class ContextProvider extends React.Component {

  state = {
    dwcTerms: {},
    requiredTerms: {},
    defaultTerms: [], // terms that may have a default value
    supportedMarkers: [],
    agentRoles: [],
    networks: [],
    fileTypes: [],
    installationSettings: {},
    license: {},
    format: {},
     country,
     user: null, //getTokenUser(),
     tokenUser: () => getTokenUser(),
    dataset: null,
    loginFormVisible: false,
    setLoginFormVisible: (val) => this.setState({loginFormVisible: val}),
    setDataset: (dataset) => this.setState({dataset}),
    setUser: (user) => this.setState({user}),
    login: (values) => {
      return this.login(values);
    },
    logout: () => {
      this.logout();
    },
    

  };

  componentDidMount() {
    const tokenUser = getTokenUser();
    if(tokenUser){
      refreshLogin().then(user => {
        this.setState({user})
      })
    }
    /* if(this?.state?.user){
      refreshLogin().then(user => {
        this.setState({user})
      })
    } */
   Promise.all([getDwcTerms(), getRequiredTerms(), getLicense(), getFormat(), getDefault(), getSupportedMarkers(), getInstallationSettings(), getAgentRoles(), getNetworks(), getFileTypes()])
    .then(responses => {
      this.setState({
        dwcTerms: responses[0]?.data,
        requiredTerms: responses[1]?.data,
        license: responses[2]?.data,
        format: responses[3]?.data,
        defaultTerms: responses[4]?.data,
        supportedMarkers: responses[5]?.data,
        installationSettings: responses[6]?.data,
        agentRoles: responses[7]?.data,
        networks: responses[8]?.data,
        fileTypes: responses[9]?.data
      })
    }) 


  }
  login = ({ username, password, remember }) => {
    return logUserIn(username, password, remember).then((user) => {
      const jwt = user.token;
      sessionStorage.setItem(JWT_STORAGE_NAME, jwt);
      if (remember) {
        localStorage.setItem(JWT_STORAGE_NAME, jwt);
      }
      this.setState({ user: { ...user } });
      return user;
      // this.getUserItems(user);
    });
  };

  logout = () => {
    logUserOut();
    this.setState({ user: null });
  };

  

  render() {
    return (
      <AppContext.Provider value={this.state}>
        {this.props.children}
      </AppContext.Provider>
    );
  }
}

export default ContextProvider;
