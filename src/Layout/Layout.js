import { Layout, Button, Row, Col, Typography, Space, Divider, theme } from "antd";
import config from "../config";

import { LoadingOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import withContext from "../Components/hoc/withContext";
import Logo from "./Logo";
import UserMenu from "../Auth/UserMenu";
import Workflow from "../Components/Workflow";

const { Header, Content, Footer } = Layout;
const {Title} = Typography;
const {Text} = Typography

const AppLayout = ({ children, setDataset, user }) => {
  const navigate = useNavigate();

  
 
  return (
    <Layout className="layout">
      
      <Header>
        <Row>
          <Col  onClick={() => navigate("/")} span={1} style={{ padding: "4px" , cursor: "pointer"}} >
            <Logo />
          </Col>
          <Col><Button onClick={() => navigate("/")} type={"link"}><Title level={4} style={{color: "white"}}>eDNA Tool {config?.env !== "prod" ? "- Test environment": ""}</Title> </Button> </Col> 
          <Col flex="auto">
           
          </Col>
          <Col>
          
          </Col>
          <Col flex="auto"></Col>
          <Col>
            <Button
              style={{ marginRight: "8px" }}
/*               disabled={(location?.pathname !== "/dataset/new" ) || !user}
 */              type={"link"}
              onClick={() => {
                setDataset(null)
                navigate("/dataset/new");
              }}
              
            >
             <span style={{ color: "white" }}> New dataset</span>
            </Button>
            <Button 
              type={"link"} 
              onClick={() => window.open('https://docs.gbif-uat.org/edna-tool-guide/en/#faq', '_blank')}
              > 
              <span style={{  color: "white"  }}>FAQ </span></Button>
            <UserMenu />
          </Col>
        </Row>
      </Header>
      <Content
        style={{
          padding: "10px 50px",
        }}
      >
        <Workflow />
        <div className="site-layout-content">{children}</div>
      </Content>
      <Footer
        style={{
          textAlign: "center",
        }}
      >
        <Row>
          <Col flex="auto"></Col>
          <Col>
          <Row >
          
          <img src="/images/GBIF-2015-standard-ipt.png"  alt="GBIF logo" style={{width: "55px", marginTop: "-2px"}}/> 
          <Typography.Text >eDNA Tool</Typography.Text>
        
        </Row>
        <Row>
        <Space split={<Divider type="vertical" />}>
        <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://www.gbif.org/dna" /* onClick={() => navigate("/faq")} */>About the DNA Programme</Button>

        <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://docs.gbif-uat.org/edna-tool-guide/en/" /* onClick={() => navigate("/faq")} */>How to use it?</Button>
        <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://docs.gbif-uat.org/edna-tool-guide/en/#faq" /* onClick={() => navigate("/faq")} */>FAQ</Button>
    <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://github.com/gbif/edna-tool-ui/issues/new">Report a bug</Button>
    <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://github.com/gbif/edna-tool-ui/issues/new">Request a feature</Button>
  </Space>
        </Row>
        {config?.env === "uat" && <>
          
          <Row><Col style={{paddingLeft: "6px", marginTop: "4px"}}> <img src="/images/EN_Co-fundedbytheEU_RGB_POS.png"  alt="EU logo" style={{width: "140px"}}/> </Col></Row>
        </>}

          
          </Col>
          <Col flex="auto"></Col>

        </Row>
        
        {config?.env === "uat" && <Row style={{marginTop: "10px"}}><Col  flex="auto"></Col><Col ><Text style={{fontSize: "9px"}}>The development of this tool has received funding from the European Union's Horizon Europe research and innovation programme under grant agreement No 101057437 (BioDT project, <a href="https://doi.org/10.3030/101057437">https://doi.org/10.3030/101057437</a>)</Text></Col><Col flex="auto"></Col></Row>}
       
      </Footer>
    </Layout>
  );
};

const mapContextToProps = ({
  setDataset,
  user
}) => ({
  setDataset,
  user
});
export default withContext(mapContextToProps)(AppLayout);
