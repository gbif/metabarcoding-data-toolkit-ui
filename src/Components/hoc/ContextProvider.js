import React from "react";
import {
  authenticate as logUserIn,
  logout as logUserOut,
  getTokenUser,
  JWT_STORAGE_NAME,
} from "../../Auth/userApi";
import {getDwcTerms, getRequiredTerms} from "../../Api/terms.js"
import country from "../../Enum/country.json"
 // import {getTrees} from '../../Api'

// Initializing and exporting AppContext - common for whole application
export const AppContext = React.createContext({});


class ContextProvider extends React.Component {

  state = {
    dwcTerms: {},
    requiredTerms: {},
     country,
     user: getTokenUser(),
    stepState: {reviewDisabled: true, publishDisabled: true, loadingStep: null},
    dataset: null,
    setDataset: (dataset) => this.setState({dataset}),
    login: (values) => {
      return this.login(values);
    },
    logout: () => {
      this.logout();
    },
    setStepState: stepState => this.setState({stepState}),

  };

  componentDidMount() {
    
   Promise.all([getDwcTerms(), getRequiredTerms()])
    .then(responses => {
      this.setState({
        dwcTerms: responses[0]?.data,
        requiredTerms: responses[1]?.data
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
