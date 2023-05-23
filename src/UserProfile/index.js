
import React, { useEffect, useState, useRef } from "react";
import axios from "axios"
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Button, Result, Typography, List,theme, Skeleton, message } from "antd"
import { EditOutlined, DownloadOutlined } from '@ant-design/icons';
import config from "../config";
import FilesAvailable from '../Components/FilesAvailable'

import withContext from "../Components/hoc/withContext";
import { refreshLogin } from "../Auth/userApi";
import { axiosWithAuth } from "../Auth/userApi";
const { useToken } = theme;

const { Title } = Typography;
const { Text } = Typography;

const UserProfile = ({ user }) => {
const {token} = useToken()
 const [datasets, setDatasets] = useState([])
 const [loading, setLoading] = useState(false)
  let refreshUserHdl = useRef();
  const navigate = useNavigate();

useEffect(() => {
    if(user?.datasets?.length > 0){
        getDatasets(user)
    }
}, [user])

const getDatasets = async (usr) => {
    try {
        setLoading(true)
        const response = await axiosWithAuth.get(`${config.backend}/user/datasets`);
        setDatasets(response?.data?.reverse())
        setLoading(false)
    } catch (error) {
        setDatasets([])
        setLoading(false)

    }

}


  return (
    <Layout><PageContent>
        
      {/*   {!!user && <>
            <ul>
                {datasets?.map(d => <li key={d?.id}>
                    <Button type="link" onClick={() => navigate(`/dataset/${d.id}`)}>{d?.metadata?.title || d.id}</Button>
                </li>)}
            </ul>
        </>} */}

        {!!user &&        <> <Row>
            <Col flex="auto"></Col>
            <Col span={12}>
           <List
        itemLayout="horizontal"
        header={<Text>{`Datasets created by ${user?.userName}`}</Text>}
        bordered
        dataSource={datasets}
        loading={loading}
        renderItem={(d) => (
            <List.Item
           
                actions={[<Button type="link" onClick={() =>  navigate(`/dataset/${d.id}/upload`)}><EditOutlined /></Button>]}
            >
                <List.Item.Meta
                    title={<a href={`/dataset/${d.id}`} style={{color: token.colorLink}} onClick={() =>  navigate(`/dataset/${d.id}`)}>{d?.metadata?.title || d.id}</a>}
                    description={`Samples: ${d?.summary?.sampleCount} - Taxa/ASVs: ${d?.summary?.taxonCount}`}
                />
            </List.Item>
        )}
    />
    
            </Col>
            <Col flex="auto"></Col>
            </Row>

</>}

        

        {!user &&  <Result
    status="403"
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={<Button type="primary">Back Home</Button>}
  />}
      


    </PageContent></Layout>
  );
}


const mapContextToProps = ({ user, login, logout }) => ({
  user,
  login,
  logout
});

export default withContext(mapContextToProps)(UserProfile);

