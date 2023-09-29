import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";



function App() {
  const navigate = useNavigate()


  return (
    <Layout>
    
      <PageContent>
        How to use the tool
      </PageContent>
    </Layout>
  );
}

export default App;
