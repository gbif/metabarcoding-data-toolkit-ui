import React, { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Typography, Card } from "antd";
import { SiRss } from "react-icons/si";
import config from "../config"

const { Title } = Typography;
const { Meta } = Card;

function App() {

  
  return (
    <Layout>
      <Row style={{ height: "48px" }}></Row>
      <Row>
        <Col flex="auto"></Col>
        <Col>
          <Row style={{ height: "35%" }}></Row>
          <Row>
            <Title style={{ marginBottom: "0px" }}>Metabarcoding Data Toolkit</Title>
          </Row>
          <Row>
            <Title level={5} italic>
              bridging metabarcoding and biodiversity
            </Title>
          </Row>
        </Col>
        <Col>
          <img style={{ width: "400px" }} src="/images/gntAsset_1gnt_scaled.png" />
        </Col>
        <Col flex="auto"></Col>
      </Row>
      <Row style={{ height: "48px" }}></Row>
      <PageContent style={{minHeight: 0}}>
        <Row>
          <Col flex="auto"></Col>
          <Col style={{padding: "24px"}}>
            <Card
              onClick={() => window.open('https://docs.gbif-uat.org/edna-tool-guide/en/', '_blank')}
              className="home-card"
              style={{
                width: 200,
                cursor: "pointer",
                transition: "box-shadow .3s"
              }}
              cover={<img alt="example" src="/images/dnatool-05_scaled.png" />}
            >
              <Meta title="How to use it?" />
            </Card>
            
          </Col>
          <Col  style={{padding: "24px"}}>
            <Card
              onClick={() => window.open('https://github.com/gbif/edna-tool-ui/issues/new', '_blank')}
              className="home-card"
              style={{
                width: 200,
                cursor: "pointer",
                transition: "box-shadow .3s"
              }}
              cover={<img alt="example" src="/images/dnatool-06_scaled.png" />}
            >
              <Meta title="Got feedback?" />
            </Card>
            
          </Col>
          <Col style={{padding: "24px"}}>
            <Card
              onClick={() => window.open('https://docs.gbif-uat.org/edna-tool-guide/en/#faq', '_blank')}
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

export default App;
