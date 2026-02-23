
import React from "react";

import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Button, Row, Col } from "antd";
import { useNavigate, useMatch } from "react-router-dom";

import withContext from "../Components/hoc/withContext";
import DashBoardContent from "./DashBoardContent";


const DashBoard = ({dataset}) => {
  const match = useMatch('/dataset/:key/review');
  const navigate = useNavigate()





  return (
    <Layout><PageContent>
        
      
       <DashBoardContent />

        </PageContent></Layout>
  );
}


const mapContextToProps = ({  dataset}) => ({

  dataset
});

export default withContext(mapContextToProps)(DashBoard);
