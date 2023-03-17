
import React, {useEffect, useState} from "react";
import axios from "axios"
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import {marked} from "marked"
function App() {
    const [markdown, setMarkdown] = useState(null)
    useEffect(() => {
        const getAbout = async () => {
            try {
                const res = await  axios(`/ABOUT.md`)
                setMarkdown(res.data)
               // console.log(res.data)
            } catch (error) {
                console.log(error)
            }
            
        }
        getAbout()
       

    },[])
  return (
    <Layout><PageContent>
       {markdown && <span
                  dangerouslySetInnerHTML={{
                    __html: marked(markdown),
                  }}
                ></span>}
        </PageContent></Layout>
  );
}

export default App;
