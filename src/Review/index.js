
import React, {useEffect, useState} from "react";
import axios from "axios"
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Button } from "antd";
import { useNavigate, useLocation, useMatch } from "react-router-dom";

const Review = () => {
  const match = useMatch('/dataset/:key/review');
  const navigate = useNavigate()

  return (
    <Layout><PageContent>
       This is the review page
       <Button onClick={() => navigate(`/dataset/${match?.params?.key}/metadata`)}>Done</Button>
        </PageContent></Layout>
  );
}

export default Review;
