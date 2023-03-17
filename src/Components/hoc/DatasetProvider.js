import {useState, useEffect} from 'react';
import {  useMatch } from "react-router-dom";
import withContext from "./withContext"
import { axiosWithAuth } from "../../Auth/userApi";
import config from "../../config";

const DatasetProvider = ({dataset, setDataset}) => {

    const [key, setKey] = useState(null)
    const match = useMatch('/dataset/:key');
    const reviewMatch = useMatch('/dataset/:key/review');
    const metadataMatch = useMatch('/dataset/:key/metadata');
    const publishMatch = useMatch('/dataset/:key/publish');
    const prepareMatch = useMatch('/dataset/:key/prepare');

    useEffect(() => {
        console.log(match?.params?.key)
        const key_ = match?.params?.key || reviewMatch?.params?.key || metadataMatch?.params?.key || publishMatch?.params?.key || prepareMatch?.params?.key || dataset?.key;
        if((!!key_ ) && key_ !== 'new'){
            setKey(key_)
        } else {
            setKey(null)
        }
    }, [ match?.params?.key,  reviewMatch?.params?.key,  metadataMatch?.params?.key,  publishMatch?.params?.key, prepareMatch?.params?.key, dataset?.key])
   useEffect(()=>{
    console.log(`Dataset ${key}`)
    const getDataset  = async (key) => {
        try {
            const res = await axiosWithAuth.get(`${config.backend}/dataset/${key}/process`)
            
            console.log(res?.data)
            setDataset(res?.data)
           // const isFinished = !!res?.data?.steps.find(s => s.status === 'finished');
            // const isFailed = !!res?.data?.steps.find(s => s.status === 'failed');
                  
        } catch (error) {
            // if it is a 404, the dataset has not been processed yet. It mght be processing still
            console.log(error)
        }
    } 
    if(key && key !== 'new'){
        getDataset(key)
    } else {
        setDataset(null)
    }
    
    // fetch info about that dataset, is it ready for review? Has it got metadata? Versions?
   },[key, setDataset])


    return null;
}



const mapContextToProps = ({ dataset, setDataset }) => ({
    dataset, setDataset
  });
  
export default withContext(mapContextToProps)(DatasetProvider);
