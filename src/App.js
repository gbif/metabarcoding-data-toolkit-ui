import * as React from "react";
import ContextProvider from "./Components/hoc/ContextProvider";
import { ConfigProvider } from 'antd';

import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import DatasetProvider from "./Components/hoc/DatasetProvider2"
import Home from "./Home";
import DataUpload from "./DataUpload";
import Process from "./Process";

import TermMapping from "./TermMapping";
import Review from "./Review";
import Metadata from "./Metadata";
import Publish from "./Publish";

import UserProfile from "./UserProfile"
import Dataset from "./Dataset"
import Faq from "./Faq"
import HowTo from "./HowTo"
import Admin from "./Admin";
import history from "./history";
import "./App.css";

const App = () => {
  const routes = useRoutes([
    { key: "home", path: "/", element: [<Home /> ]},
    { key: "faq", path: "/faq", element: [<Faq /> ]},
    { key: "howto", path: "/how-to-use-the-tool", element: [<HowTo /> ]},
    { key: "newdataset", path: "/dataset/new", element: [<DatasetProvider />, <DataUpload />] }, 
    { key: "dataset", path: "/dataset/:key", element: [<DatasetProvider />, <Dataset /> ]},
    { key: "upload", path: "/dataset/:key/upload", element: [<DatasetProvider />, <DataUpload />] }, 
    { key: "termMapping", path: "/dataset/:key/term-mapping", element: [<DatasetProvider />, <TermMapping />] },
    { key: "process", path: "/dataset/:key/process", element: [<DatasetProvider />, <Process />] }, 
    { key: "review", path: "/dataset/:key/review", element: [<DatasetProvider />,<Review />] },
    { key: "metadata", path: "/dataset/:key/metadata", element: [<DatasetProvider />,<Metadata />] },
    { key: "publish",path: "/dataset/:key/publish", element: [<DatasetProvider />,<Publish /> ]},
    { key: "user-profile",path: "/user-profile", element: [<UserProfile /> ]},
    { key: "admin",path: "/admin", element: [<Admin /> ]},
    
  ]);

  return routes;
};

const AppWrapper = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#71b171',
        },
      }}
    >
      <ContextProvider>
        <Router history={history}>
          <App />
        </Router>
      </ContextProvider>
    </ConfigProvider>
  );
};

export default AppWrapper;