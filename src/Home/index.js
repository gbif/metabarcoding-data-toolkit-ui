import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";

import { marked } from "marked";
const { Title } = Typography;
const { Meta } = Card;

function App() {
  const [markdown, setMarkdown] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
    const getAbout = async () => {
      try {
        const res = await axios(`/ABOUT.md`);
        setMarkdown(res.data);
        // console.log(res.data)
      } catch (error) {
        console.log(error);
      }
    };
    getAbout();
  }, []);
  return (
    <Layout>
      <Row style={{ height: "48px" }}></Row>
      <Row>
        <Col flex="auto"></Col>
        <Col>
          <Row style={{ height: "35%" }}></Row>
          <Row>
            <Title style={{ marginBottom: "0px" }}>eDNA data converter</Title>
          </Row>
          <Row>
            <Title level={5} italic>
              bridging metabarcoding and biodiversity
            </Title>
          </Row>
        </Col>
        <Col>
          <img style={{ width: "400px" }} src="/images/gntAsset_1gnt.png" />
        </Col>
        <Col flex="auto"></Col>
      </Row>
      <Row style={{ height: "48px" }}></Row>
      <PageContent style={{minHeight: 0}}>
        <Row>
          <Col flex="auto"></Col>
          <Col style={{padding: "24px"}}>
            <Card
              onClick={() => navigate("/how-to-use-the-tool")}
              className="home-card"
              style={{
                width: 200,
                cursor: "pointer",
                transition: "box-shadow .3s"
              }}
              cover={<img alt="example" src="/images/dnatool-05.png" />}
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
              cover={<img alt="example" src="/images/dnatool-06.png" />}
            >
              <Meta title="Got feedback?" />
            </Card>
            
          </Col>
          <Col style={{padding: "24px"}}>
            <Card
              onClick={() => navigate("/faq")}
              className="home-card"
              style={{
                width: 200,
                cursor: "pointer",
                transition: "box-shadow .3s"
              }}
              cover={<img alt="example" src="/images/dnatool-07.png" />}
            >
              <Meta title="FAQ" />
            </Card>
            
          </Col>
          <Col flex="auto"></Col>
        </Row>
        
      </PageContent>
    </Layout>
  );
}

export default App;
