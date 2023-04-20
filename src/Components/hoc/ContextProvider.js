import React from "react";
import {
  authenticate as logUserIn,
  logout as logUserOut,
  getTokenUser,
  refreshLogin,
  JWT_STORAGE_NAME,
} from "../../Auth/userApi";
import {getDwcTerms, getRequiredTerms, getDefault} from "../../Api/terms.js"
import { getFormat , getLicense} from "../../Api/enum.js";
import country from "../../Enum/country.json"
 // import {getTrees} from '../../Api'

// Initializing and exporting AppContext - common for whole application
export const AppContext = React.createContext({});


class ContextProvider extends React.Component {

  state = {
    dwcTerms: {},
    requiredTerms: {},
    defaultTerms: {}, // terms that may have a default value
    license: {},
    format: {},
     country,
     user: null, //getTokenUser(),
    dataset: null,
    setDataset: (dataset) => this.setState({dataset}),
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
   Promise.all([getDwcTerms(), getRequiredTerms(), getLicense(), getFormat(), getDefault()])
    .then(responses => {
      this.setState({
        dwcTerms: responses[0]?.data,
        requiredTerms: responses[1]?.data,
        license: responses[2]?.data,
        format: responses[3]?.data,
        defaultTerms: responses[4]?.data,
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
