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
const { useToken } = theme;


const AppLayout = ({ children, setDataset, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { token } = useToken();
 /*  const match = useMatch("/run/:id");
  const [current, setCurrent] = useState("");
  useEffect(() => {
    console.log(location);
    setCurrent(location?.pathname);
  }, [location]); */
  
 
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
        <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://docs.gbif-uat.org/edna-tool-guide/en/" /* onClick={() => navigate("/faq")} */>How to use it?</Button>
        <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://docs.gbif-uat.org/edna-tool-guide/en/#faq" /* onClick={() => navigate("/faq")} */>FAQ</Button>
    <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://github.com/gbif/edna-tool-ui/issues/new">Report a bug</Button>
    <Button style={{paddingLeft: 8}} type="link" target="_blank" href="https://github.com/gbif/edna-tool-ui/issues/new">Request a feature</Button>
  </Space>
        </Row>
          
          
          </Col>
          <Col flex="auto"></Col>

        </Row>
       
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
