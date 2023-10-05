
import React, { useEffect, useState, useRef } from "react";
import axios from "axios"
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Button, Result, Typography, List,theme, Skeleton, message } from "antd"
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import config from "../config";
import FilesAvailable from '../Components/FilesAvailable'

import withContext from "../Components/hoc/withContext";
import { refreshLogin } from "../Auth/userApi";
import { axiosWithAuth } from "../Auth/userApi";
import {dateFormatter, numberFormatter} from '../Util/formatters'
const { useToken } = theme;

const { Title } = Typography;
const { Text } = Typography;

//const dateFormatter = new Intl.DateTimeFormat('en-GB')
//const numberFormatter = new Intl.NumberFormat('en-GB');

const UserProfile = ({ user, setLoginFormVisible }) => {
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
            <Col span={16}>
           <List
        itemLayout="horizontal"
        header={<Text>{`Datasets created by ${user?.userName}`}</Text>}
        bordered
        dataSource={datasets}
        loading={loading}
        renderItem={(d) => (
            <List.Item
           
                actions={[<Button type="link" onClick={() =>  navigate(`/dataset/${d.dataset_id}`)}><EyeOutlined /></Button>,<Button type="link" onClick={() =>  navigate(`/dataset/${d?.dataset_id}/upload`)}><EditOutlined /></Button>]}
            >
                <List.Item.Meta
                    title={d?.metadata?.title || d?.title || d.id}
                    description={<>
                    {d.created && <p style={{marginBottom: "0px"}}>{`Created: ${dateFormatter.format(new Date(d.created))}`}</p>}
                        {d?.sample_count ? <p style={{marginBottom: "0px"}}>{`Samples: ${numberFormatter.format(d?.sample_count)}`}</p> : ""}
                        {d?.taxon_count ? <p style={{marginBottom: "0px"}}>{`Taxa/ASVs: ${numberFormatter.format(d?.taxon_count)}`}</p> : ""}
                        {d?.occurrence_count ? <p >{`Occurrences: ${numberFormatter.format(d?.occurrence_count)}`}</p> : ""}

                    </>}
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
    title=""
    subTitle="Please login to see your datasets"
    extra={<Button type="primary" onClick={() => setLoginFormVisible(true)}>Login</Button>}
  />}
      


    </PageContent></Layout>
  );
}


const mapContextToProps = ({ user, login, logout, setLoginFormVisible }) => ({
  user,
  login,
  logout,
  setLoginFormVisible
});

export default withContext(mapContextToProps)(UserProfile);

