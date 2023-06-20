
import { Descriptions, Steps, Tag } from "antd"
import withContext from "../Components/hoc/withContext";
import AgentPresentation from "../EmlForm/AgentPresentation";
import Doi from "../EmlForm/Doi"
import _ from "lodash"
const MetaDataView = ({dataset}) => {

    
    const {metadata} = dataset;
    return !metadata ? null :

    <Descriptions bordered column={1} >
        {['title', 'license', 'description', 'DOI'].map(key => <Descriptions.Item label={key}>{metadata?.[key] || '-'}</Descriptions.Item>)}
        <Descriptions.Item label="Method steps">{_.isArray(metadata?.methodSteps) ? <Steps
          direction="vertical"
          progressDot
          current={metadata?.methodSteps?.length}
          items={metadata?.methodSteps?.map(s => ({title: s}))}
        /> : '-'}</Descriptions.Item>

         <Descriptions.Item label="Contact">
         {metadata?.contact ? <AgentPresentation agent={metadata?.contact} /> : "-"}
         </Descriptions.Item>
        <Descriptions.Item label="Creator(s)">
                {_.isArray(metadata?.creator) ? metadata?.creator.map(c => <AgentPresentation  agent={c} />) : "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Keywords">
                {_.isArray(metadata?.keywords) ? metadata?.keywords.map(k => <Tag>{k}</Tag>) : "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Bibliographic References">
            {_.isArray(metadata?.bibliographicReferences) ? <ol>
                {metadata?.bibliographicReferences.map(ent => 
                    <li
                    key={ent?.key}
                   
                  >
                     
                   { `${ent?.value}`}
                    <Doi doi={ent?.key}/>
                  </li>
                )}
               </ol> : "-"}
            </Descriptions.Item>
            
            
       
    </Descriptions>

}

const mapContextToProps = ({ dataset }) => ({
    dataset
  });
  
export default withContext(mapContextToProps)(MetaDataView);