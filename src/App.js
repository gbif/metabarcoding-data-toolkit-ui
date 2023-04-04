import * as React from "react";
import ContextProvider from "./Components/hoc/ContextProvider";
import { ConfigProvider } from 'antd';

import { BrowserRouter as Router, useRoutes , Routes, Route} from "react-router-dom";
/* import MyRuns from "./MyRuns";
 */
import DatasetProvider from "./Components/hoc/DatasetProvider2"
import Home from "./Home";
import DataUpload from "./DataUpload";
import Process from "./Process";

import TermMapping from "./TermMapping";
import Review from "./Review";
import Metadata from "./Metadata";
import Publish from "./Publish";

import UserProfile from "./UserProfile"
import history from "./history";
//import "./App.css";

const App = () => {
  const routes = useRoutes([
    { key: "home", path: "/", element: [<DatasetProvider />,<Home /> ]},
    { key: "newdataset", path: "/dataset/new", element: [<DatasetProvider />, <DataUpload />] }, // DataUpload will be responisble for setting the dataset as it is progressing
    { key: "upload", path: "/dataset/:key/upload", element: [<DatasetProvider />, <DataUpload />] }, // DataUpload will be responisble for setting the dataset as it is progressing
    { key: "termMapping", path: "/dataset/:key/term-mapping", element: [<DatasetProvider />, <TermMapping />] },
    { key: "process", path: "/dataset/:key/process", element: [<DatasetProvider />, <Process />] }, // DataUpload will be responisble for setting the dataset as it is progressing
    { key: "review", path: "/dataset/:key/review", element: [<DatasetProvider />,<Review />] },
    { key: "metadata", path: "/dataset/:key/metadata", element: [<DatasetProvider />,<Metadata />] },
    { key: "publish",path: "/dataset/:key/publish", element: [<DatasetProvider />,<Publish /> ]},
    { key: "user-profile",path: "/user-profile", element: [<UserProfile /> ]},
    
    /* { path: "/run", element: <Workflow /> }, */

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
        {/* <Routes>
          <Route index  element={<Home />}/>
          <Route path="/prepare" element={<Prepare />} />
          <Route path="/dataset/:key" element={<DataUpload />} > 
          <Route path="*" element={<DatasetProvider />}/>

            <Route path="review" element={<Review />}/>
            <Route path="metadata" element={<Metadata />}/>
            <Route path="publish" element={<Publish />}/>
          <Route />
          <Route />
          </Route>
          
        </Routes> */}
          <App />
        </Router>
      </ContextProvider>
    </ConfigProvider>
  );
};

export default AppWrapper;