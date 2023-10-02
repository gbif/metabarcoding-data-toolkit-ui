import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { List, Row, Col, Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined,
    FileExcelOutlined
} from '@ant-design/icons';
const {Title} = Typography

function App() {
  const navigate = useNavigate()
  const [formats, setFormats] = useState([])
    const [loading, setLoading]  = useState(false)
  useEffect(() => {
   
     // getAbout()

      const getFormats = async () => {
        try {
            setLoading(true)
            const res = await  axios(`/acceptedInputFormats.json`)

            setFormats(res.data)
            setLoading(false)
           // console.log(md2json.parse(res.data))
            //setFaq(res.data)
           // console.log(res.data)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
        
    }
    getFormats()
     

  },[])

  return (
    <Layout>
    
      <PageContent>
        <Row><Col><Title level={2}>How to use this tool</Title></Col></Row>
        <Row><Col >
        <Title level={5}>
        Here, we provide templates filled with minimal example data that you can download to get started. The tool accepts the following variants of OTU/ASV tables with taxon and sample metadata:</Title>
        </Col></Row>
      <List
      className="demo-loadmore-list"
      loading={loading}
      itemLayout="horizontal"
      dataSource={formats}
      renderItem={(item) => (
        <List.Item
          actions={[<a  target="_blank" href={item?.template}>Data template <DownloadOutlined /></a>]}
        >
            <List.Item.Meta
              title={item?.title}
              description={item?.description}
            />
        </List.Item>
      )}
    />
      </PageContent>
    </Layout>
  );
}

export default App;


