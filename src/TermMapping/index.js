
import React, {useEffect, useState} from "react";
import axios from "axios"
import {useMatch} from "react-router-dom"
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import withContext from "../Components/hoc/withContext";
import TermMapper from "../Components/TermMapper";

const Prepare = ({dataset}) => {
  const match = useMatch('/dataset/:key/prepare');

  return (
    <Layout><PageContent>
       <TermMapper />
        </PageContent></Layout>
  );
}

const mapContextToProps = ({ user, login, logout, dataset, setDataset, stepState, setStepState }) => ({
  user,
  login,
  logout,
  dataset, setDataset,
  stepState,
  setStepState
});

export default withContext(mapContextToProps)(Prepare);
