
import React, {useEffect, useState} from "react";
import axios from "axios"
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import MetadataForm from "../EmlForm"
import EmlForm from "../EmlForm";
const Prepare = () => {
    
  return (
    <Layout><PageContent>
       <EmlForm />
        </PageContent></Layout>
  );
}

export default Prepare;
