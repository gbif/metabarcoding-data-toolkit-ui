
import React, {useEffect, useState} from "react";
import config from "../config";
import axios from "axios"
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Button, Row, Col, Typography, Descriptions, Tabs } from "antd";
import TaxonomyChart from "./TaxonomyChart";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import LeafletMap from "./Map";
import TaxonomicSimilarity from "./TaxonomicSimilarity"
import {getDataForDissimilarityPlot} from "../Util/ordination"
import _ from "lodash"
import {getPromiseState} from "../Util/promises"
import withContext from "../Components/hoc/withContext";
import DataBrowser from "./DataBrowser";

const ORDINATION_MAX_CARDINALITY = 2500000;
const {Title} = Typography;

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
