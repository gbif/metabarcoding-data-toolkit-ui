import {useState, useEffect} from 'react';
import {  useMatch } from "react-router-dom";
import withContext from "./withContext"
import { axiosWithAuth } from "../../Auth/userApi";
import config from "../../config";

const DatasetProvider = ({dataset, setDataset}) => {

    const [key, setKey] = useState(null)
    const match = useMatch('/dataset/:key');
    const uploadMatch = useMatch('/dataset/:key/upload');
    const processMatch = useMatch('/dataset/:key/process');
    const reviewMatch = useMatch('/dataset/:key/review');
    const mappingMatch = useMatch('/dataset/:key/term-mapping');
    const metadataMatch = useMatch('/dataset/:key/metadata');
    const publishMatch = useMatch('/dataset/:key/publish');

    useEffect(() => {
        console.log(match?.params?.key)
        const key_ = match?.params?.key || processMatch?.params?.key || reviewMatch?.params?.key || metadataMatch?.params?.key || publishMatch?.params?.key || uploadMatch?.params?.key || mappingMatch?.params?.key || dataset?.key;
        if((!!key_ ) && key_ !== 'new'){
            setKey(key_)
            if(!dataset){
                getDataset(key_)
            }
        } else {
            setKey(null)
        }
    }, [ match?.params?.key, processMatch?.params?.key, reviewMatch?.params?.key,  metadataMatch?.params?.key,  publishMatch?.params?.key, uploadMatch?.params?.key, mappingMatch?.params?.key, dataset?.key])
   useEffect(()=>{
    console.log(`Dataset ${key}`)
    
    if(key && key !== 'new'){
        getDataset(key)
    } else {
        setDataset(null)
    }
    
    // fetch info about that dataset, is it ready for review? Has it got metadata? Versions?
   },[key, setDataset])

   const getDataset  = async (key) => {
    try {
        const res = await axiosWithAuth.get(`${config.backend}/dataset/${key}/process`)
        
        console.log(`Dataset provider set dataset ${res?.data?.id}`)
        setDataset(res?.data)
       // const isFinished = !!res?.data?.steps.find(s => s.status === 'finished');
        // const isFailed = !!res?.data?.steps.find(s => s.status === 'failed');
              
    } catch (error) {
        console.log(error)
    }
} 
    return null;
}




const mapContextToProps = ({ dataset, setDataset }) => ({
    dataset, setDataset
  });
  
export default withContext(mapContextToProps)(DatasetProvider);
