import { Layout, Button, Row, Col, Typography, Space, Divider, theme, Watermark } from "antd";
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

  const header = <Header>
  <Row>
    <Col  onClick={() => navigate("/")} span={1} style={{ padding: "4px" , cursor: "pointer"}} >
      <Logo />
    </Col>
    <Col  style={{ padding: "16px" }}><Button style={{padding: "0px"}} onClick={() => navigate("/")} type={"link"}><Title level={4} style={{color: "white"}}>Metabarcoding Data Toolkit</Title> </Button> </Col> 
    
   
    <Col flex="auto"></Col>
    
    <Col>
    {(!!user && !!user?.isAdmin) && <Button
        style={{ marginRight: "8px" }}
       type={"link"}
        onClick={() => {
          navigate("/admin");
        }}
        
      >
       <span style={{ color: "white" }}> Administration</span>
      </Button>}
    {!!user &&  <Button
        style={{ marginRight: "8px" }}
       type={"link"}
        onClick={() => {
          navigate("/user-profile");
        }}
        
      >
       <span style={{ color: "white" }}> My datasets</span>
      </Button>}
      <Button
        style={{ marginRight: "8px" }}
       type={"link"}
        onClick={() => {
          setDataset(null)
          navigate("/dataset/new");
        }}
        
      >
       <span style={{ color: "white" }}> New dataset</span>
      </Button>
      <Button 
        type={"link"} 
        onClick={() => window.open('https://docs.gbif-uat.org/mdt-user-guide/en/#faq', '_blank')}
        > 
        <span style={{  color: "white"  }}>FAQ </span></Button>
      <UserMenu />
    </Col>
  </Row>
</Header>
 
  return (
    <Layout className="layout">
      {config.env === "uat" ? <Watermark gap={[30,30]} content={['Test']}>
        {header}
      </ Watermark> : <>{header}</>}
    
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
        <Row >
        <Col flex="auto"></Col>
        <Col >
          <img src="/images/GBIF-2015-standard-ipt.png"  alt="GBIF logo" style={{width: "55px", marginTop: "-2px"}}/> 
          <Typography.Text >Metabarcoding Data Toolkit</Typography.Text>
          </Col>
          <Col flex="auto"></Col>
        </Row>
        <Row style={{marginTop: "16px"}}>
          <Col flex="auto"></Col>
          <Col>
          
        <Row>
        <Space split={<Divider type="vertical" />}>
       
        <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://www.gbif.org/metabarcoding-data-programme" /* onClick={() => navigate("/faq")} */> About the programme</Button>

        <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://www.gbif.org/dna" /* onClick={() => navigate("/faq")} */>About GBIF & DNA </Button>

        <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://docs.gbif-uat.org/mdt-user-guide/en/" /* onClick={() => navigate("/faq")} */>User guide</Button>
        <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://docs.gbif-uat.org/mdt-user-guide/en/#faq" /* onClick={() => navigate("/faq")} */>FAQ</Button>
        <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://github.com/gbif/metabarcoding-data-toolkit-backend?tab=readme-ov-file#api" /* onClick={() => navigate("/faq")} */>API</Button>
    <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://github.com/gbif/metabarcoding-data-toolkit-ui/issues/new">Report a bug</Button>
    <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://github.com/gbif/metabarcoding-data-toolkit-ui/issues/new">Request a feature</Button>
  </Space>
        </Row>
      

          
          </Col>
          <Col flex="auto"></Col>

        </Row>
          { ['mdt.gbif-test.org', 'mdt.gbif.org'].includes(window?.location?.hostname) && <>
          
            <Row style={{marginTop: "16px"}}><Col flex="auto"></Col><Col style={{paddingLeft: "6px", marginTop: "4px"}}> <img src="/images/EN_Co-fundedbytheEU_RGB_POS.png"  alt="EU logo" style={{width: "140px"}}/> </Col> <Col span={10} ><Text style={{fontSize: "9px"}}>The development of this tool has received funding from the European Union's Horizon Europe research and innovation programme under grant agreement No 101057437 (BioDT project, <a href="https://doi.org/10.3030/101057437">https://doi.org/10.3030/101057437</a>)</Text></Col><Col flex="auto"></Col></Row>
        </>}
        
       
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
