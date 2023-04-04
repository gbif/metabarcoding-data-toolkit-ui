
import React, { useEffect, useState, useRef } from "react";
import axios from "axios"
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Button, Result, Typography, List, message } from "antd"
import { CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import config from "../config";
import FilesAvailable from '../Components/FilesAvailable'

import withContext from "../Components/hoc/withContext";
import { refreshLogin } from "../Auth/userApi";
import { axiosWithAuth } from "../Auth/userApi";
const { Title } = Typography;
const UserProfile = ({ user }) => {

 const [datasets, setDatasets] = useState([])
  let refreshUserHdl = useRef();

useEffect(() => {
    if(user?.datasets?.length > 0){
        getDatasets(user)
    }
}, [user])

const getDatasets = async (usr) => {
    try {
        const response = await axiosWithAuth.get(`${config.backend}/user/datasets`);
        setDatasets(response?.data)
    } catch (error) {
        setDatasets([])
    }

}


  return (
    <Layout><PageContent>
        {!!user && <pre>
            {JSON.stringify(user)}
            </pre>}
        {!!user && <>
            <ul>
                {datasets?.map(d => <li key={d?.id}>
                    {d?.id}
                </li>)}
            </ul>
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

