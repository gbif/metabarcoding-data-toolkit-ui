import {useState, useEffect, useReducer} from 'react';
import {  useMatch } from "react-router-dom";
import withContext from "./withContext"
import { axiosWithAuth } from "../../Auth/userApi";
import config from "../../config";


const reducer = (state, action) => {
    switch (action.type) {
        case 'routeChange':
            return { ...state, route: action.payload.route, key: action.payload.key};
        case 'resetDataset':
            return {};
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
  }; 

const initialState = {key: null, route: null};

const DatasetProvider = ({setDataset, user, setLoginFormVisible }) => {

   // const [key, setKey] = useState(null)
    const datasetMatch = useMatch('/dataset/:key');
    const uploadMatch = useMatch('/dataset/:key/upload');
    const processMatch = useMatch('/dataset/:key/process');
    const reviewMatch = useMatch('/dataset/:key/review');
    const mappingMatch = useMatch('/dataset/:key/term-mapping');
    const metadataMatch = useMatch('/dataset/:key/metadata');
    const publishMatch = useMatch('/dataset/:key/publish');
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {

        const datasetRouteChange = processMatch || reviewMatch || metadataMatch || publishMatch || uploadMatch || mappingMatch || datasetMatch;
        if(datasetRouteChange && datasetRouteChange.params.key !== "new"){
            dispatch({ type: 'routeChange', payload: {route: datasetRouteChange.pathname, key: datasetRouteChange.params.key} })
        } else if(!user && datasetRouteChange.params.key === "new") {
            dispatch({ type: 'resetDataset', payload: null })
            // setLoginFormVisible(true)
        } else {
            dispatch({ type: 'resetDataset', payload: null })
        }
       
    }, [datasetMatch, mappingMatch, metadataMatch, processMatch, publishMatch, reviewMatch, uploadMatch, user])
   
    useEffect(()=>{
    console.log(`Dataset ${state?.key}`)
    
    if(state?.key){
        getDataset(state?.key)
    } else {
        setDataset(null)
    }
    
    // fetch info about that dataset, is it ready for review? Has it got metadata? Versions?
   },[setDataset, state?.key, state.route])

   const getDataset  = async (key) => {
    try {
        const res = await axiosWithAuth.get(`${config.backend}/dataset/${key}/process`)
        const dataset = res?.data
        let metrics;
        if(dataset?.filesAvailable && dataset?.filesAvailable.find(f => f.format === "BIOM 2.1")){
            metrics = await getMetrics(key)
            if(metrics){
                dataset.metrics = metrics
            }
        }
        
        
        
        console.log(`Dataset provider set dataset ${res?.data?.id}`)
        setDataset(dataset)
       
              
    } catch (error) {
        console.log(error)
    }
} 

const getMetrics  = async (key) => {
    try {
        const res = await axiosWithAuth.get(`${config.backend}/dataset/${key}/data/metrics`)
        
        console.log(`Dataset provider set metrics for ${res?.data?.id}`)
        return res?.data
       
              
    } catch (error) {
        return null
    }
} 
    return null;
}


const mapContextToProps = ({ dataset, setDataset, user, setLoginFormVisible }) => ({
    dataset, setDataset, user, setLoginFormVisible 
  });
  
export default withContext(mapContextToProps)(DatasetProvider);
