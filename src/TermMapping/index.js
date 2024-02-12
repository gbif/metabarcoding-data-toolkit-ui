
import React, {useEffect, useState} from "react";
import axios from "axios"
import {useMatch} from "react-router-dom"
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import withContext from "../Components/hoc/withContext";
import TermMapper from "../Components/TermMapperEmof";

const TermMapping = ({dataset}) => {

  return (
    <Layout><PageContent>
       <TermMapper />
        </PageContent></Layout>
  );
}

const mapContextToProps = ({ user, login, logout, dataset, setDataset}) => ({
  user,
  login,
  logout,
  dataset, setDataset
});

export default withContext(mapContextToProps)(TermMapping);
