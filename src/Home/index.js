import React, { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Typography, Card, Space } from "antd";
import { SiRss } from "react-icons/si";
import config from "../config"
import withContext from "../Components/hoc/withContext"
const { Title, Text } = Typography;
const { Meta } = Card;

const DEFAULT_TITLE = "Metabarcoding Data Toolkit"
const DEFAULT_DESCRIPTION = "bridging metabarcoding and biodiversity"

function App({installationSettingsHasLoaded,
  installationSettings}) {

  
  return (
    <Layout>
      <Row style={{ height: "48px" }}></Row>
      <Row>
        <Col flex="auto"></Col>
        <Col span={12} style={{padding: "70px 0"}}>
          {/* <Row style={{ height: "35%" }}></Row> */}
          <div>
          <Row>
            <Title style={{ marginBottom: "0px" }}>{installationSettingsHasLoaded && !!installationSettings?.title ? installationSettings?.title : DEFAULT_TITLE}</Title>
          </Row>
          
          <Row style={{marginTop: "10px"}}>
            <Title level={5} >
            {installationSettingsHasLoaded && !!installationSettings?.description ? installationSettings?.description : DEFAULT_DESCRIPTION}
            </Title>
          </Row>
          <Row style={{marginTop: "16px"}}>
            <Text italic >
            This toolkit is being developed as part of the pilot phase of the <a href="https://www.gbif.org/metabarcoding-data-programme" target="_blank" rel="noreferrer">GBIF Metabarcoding Data Programme</a>
            </Text>
          </Row>
          </div>
        </Col>
        <Col>
          <img style={{ width: "400px" }} alt="collage" src="/images/tool-collage-opt.png" />
        </Col>
        <Col flex="auto"></Col>
      </Row>
      <Row style={{ height: "48px" }}></Row>
      <PageContent style={{minHeight: 0}}>
        <Row>
          <Col flex="auto"></Col>
          <Col style={{padding: "24px"}}>
            <Card
              onClick={() => window.open('https://docs.gbif-uat.org/mdt-user-guide/en/', '_blank')}
              className="home-card"
              style={{
                width: 200,
                cursor: "pointer",
                transition: "box-shadow .3s"
              }}
              cover={<img alt="example" src="/images/dnatool-05_scaled.png" />}
            >
              <Meta title="User guide" />
            </Card>
            
          </Col>

          <Col  style={{padding: "24px"}}>
            <Card
              onClick={() => window.location.href = `mailto:${installationSettings?.installationContactEmail}`}
              className="home-card"
              style={{
                width: 200,
                cursor: "pointer",
                transition: "box-shadow .3s"
              }}
              cover={<img alt="example" src="/images/dnatool-06_scaled.png" />}
            >
              <Meta title="Need help?" />
            </Card>
            
          </Col>
          <Col style={{padding: "24px"}}>
            <Card
              onClick={() => window.open('https://docs.gbif-uat.org/mdt-user-guide/en/#faq', '_blank')}
              className="home-card"
              style={{
                width: 200,
                cursor: "pointer",
                transition: "box-shadow .3s"
              }}
              cover={<img alt="example" src="/images/dnatool-07_scaled.png" />}
            >
              <Meta title="FAQ" />
            </Card>
            
          </Col>
          <Col flex="auto"></Col>
        </Row>
        <Row><Col flex="auto"></Col><Col><SiRss /> The most recently updated resources are available as an <a href={`${config.backend}/rss`}>RSS feed </a> </Col><Col flex="auto"></Col></Row>

        
      </PageContent>
    </Layout>
  );
}

const mapContextToProps = ({ installationSettingsHasLoaded,
  installationSettings }) => ({
    installationSettingsHasLoaded,
    installationSettings
});
export default withContext(mapContextToProps)(App);
