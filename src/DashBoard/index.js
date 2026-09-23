
import React from "react";

import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Button, Row, Col } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Typography } from "antd";
import withContext from "../Components/hoc/withContext";
import DashBoardContent from "./DashBoardContent";

const { Title } = Typography;

const DashBoard = ({dataset}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { key } = useParams()

  // The dashboard is linked from the files list, which appears on the process, export,
  // dataset and user profile pages - so there is no single page to return to. location.key
  // is "default" only for the first entry of a session, which is a deep link, a bookmark or
  // a reload; going back from there would leave the app, so fall back to the dataset page.
  const goBack = () => {
    if (location.key !== "default") {
      navigate(-1)
    } else {
      navigate(key ? `/dataset/${key}` : '/')
    }
  }


  return (
    <Layout><PageContent>
        
          <Row style={{ marginBottom: '4px' }}>
            <Button type="link" style={{ paddingLeft: 0 }} icon={<ArrowLeftOutlined />} onClick={goBack}>Back</Button>
          </Row>
          <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
            <Title level={3}>Explore Darwin Core Data Package (DwC-DP)</Title>
          </Row>
      
       <DashBoardContent />

        </PageContent></Layout>
  );
}


const mapContextToProps = ({  dataset}) => ({

  dataset
});

export default withContext(mapContextToProps)(DashBoard);
