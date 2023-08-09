import { Layout, Button, Row, Col, Typography, Space, Divider, theme } from "antd";
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
          <Col span={1} style={{ padding: "4px" }} >
            <Logo />
          </Col>
          <Col>  <Title level={4} style={{color: "tomato",  padding: "20px"}}>TEST VERSION</Title>
</Col>
          <Col flex="auto">
           
          </Col>
          <Col>
          <Title style={{color: "white",  padding: "8px"}}>GBIF eDNA Tool</Title>
          </Col>
          <Col flex="auto"></Col>
          <Col>
            <Button
              style={{ marginRight: "8px" }}
/*               disabled={(location?.pathname !== "/dataset/new" ) || !user}
 */              type={"default"}
              onClick={() => {
                setDataset(null)
                navigate("/dataset/new");
              }}
            >
             <span style={{ color: token.colorPrimary }}> New dataset</span>
            </Button>
            <Button style={{ marginRight: "8px" }} onClick={() => navigate("/")}> <span style={{ color: token.colorPrimary }}>About </span></Button>
            <Button onClick={() => navigate("/faq")}> <span style={{ color: token.colorPrimary }}>FAQ </span></Button>
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
        <Button style={{paddingLeft: 8}} type="link" onClick={() => navigate("/faq")}>FAQ</Button>
    <Button style={{paddingLeft: 8}} type="link" href="https://github.com/gbif/edna-tool-ui/issues/new">Report a bug</Button>
    <Button style={{paddingLeft: 8}} type="link" href="https://github.com/gbif/edna-tool-ui/issues/new">Request a feauture</Button>
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
