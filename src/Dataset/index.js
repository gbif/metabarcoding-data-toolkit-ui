
import React, {useEffect, useState} from "react";
import FilesAvailable from "../Components/FilesAvailable";
import {Row, Col} from "antd"
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import withContext from "../Components/hoc/withContext";

const Dataset = ({dataset}) => {

  return (
    <Layout><PageContent>
        {dataset &&
        <Row><Col span={6}>
            <FilesAvailable dataset={dataset} />
        </Col></Row>
        
        }
        </PageContent></Layout>
  );
}

const mapContextToProps = ({ dataset }) => ({
    dataset
  });
  
export default withContext(mapContextToProps)(Dataset);
