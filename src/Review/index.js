
import React from "react";

import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Button, Row, Col } from "antd";
import { useNavigate, useMatch } from "react-router-dom";

import withContext from "../Components/hoc/withContext";
import DataBrowser from "./DataBrowser";


const Review = ({dataset}) => {
  const match = useMatch('/dataset/:key/review');
  const navigate = useNavigate()





  return (
    <Layout><PageContent>
        
      <Row>
        <Col flex="auto"></Col>
        <Col><Button onClick={() => navigate(`/dataset/${match?.params?.key}/metadata`)} type="primary">Proceed</Button></Col>
      </Row>
       <DataBrowser />

        </PageContent></Layout>
  );
}


const mapContextToProps = ({  dataset}) => ({

  dataset
});

export default withContext(mapContextToProps)(Review);
