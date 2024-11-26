import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Alert,
  message,
  Form,
  Skeleton,
  Row,
  Col,
  Typography,
} from "antd";
import _ from "lodash"
import { useNavigate, useLocation, useMatch } from "react-router-dom";
// import axios from "axios";
import { axiosWithAuth } from "../Auth/userApi";
import { isArray } from "lodash";
import config from "../config";
import TextArea from "antd/lib/input/TextArea";
import AgentControl from "./AgentControl";
import MethodSteps from "./MethodSteps2";
import Citation from "./Citation";
import TagControl from "./TagControl";
//import Auth from "../Auth"
import withContext from "../Components/hoc/withContext";
import GeographicCoverage from "./GeographicCoverage";
import TaxonomicCoverage from "./TaxonomicCoverage";
import TemporalCoverage from "./TemporalCoverage";
import Help from "../Components/Help";
import helpTexts from "../helpTexts.json";
const { Text, Link } = Typography;

const { emlForm: help } = helpTexts;
const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {} /* {
  labelCol: {
    xs: { span: 20 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
}; */
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 4,
    },
  },
};

const MetaDataForm = ({
  data,
  section,
  onSaveSuccess,
  saveButtonLabel,
  dataset,
  setDataset,
  licenseEnum,
}) => {
  const match = useMatch("/dataset/:key/metadata");
  const [submissionError, setSubmissionError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [submittable, setSubmittable] = useState(false);

  const navigate = useNavigate();

  const [form] = Form.useForm();
  const values = Form.useWatch([], form);
  useEffect(() => {
    form
      .validateFields({
        validateOnly: true,
      })
      .then(
        () => {
          setSubmittable(true);
        },
        () => {
          setSubmittable(false);
        },
      );
  }, [values, form]);
  const onFinishFailed = ({ errorFields }) => {
    form.scrollToField(errorFields[0].name);
  };

  const getProject = (values) => {
    const project = Object.keys(values).reduce((acc, curr) => {
      if(curr.startsWith('project')){
        if(!_.isNil(values[curr]) && !_.isArray(values[curr])){
          const key = _.camelCase(curr.replace('project',''))
          acc[key] = values[curr]
        }
        if(_.isArray(values[curr]) && values[curr].length > 0){
          const key = _.camelCase(curr.replace('project',''))
          acc[key] = values[curr]
        }
        
        
      }
      return acc
    }, {})
    
    return  _.isEmpty(project) ? null : project;
  }

  const submitData = (values) => {
    const key = match?.params?.key;
    let metadata = {...values};
    const project = getProject(values)
    if(project){
      metadata.project = project
    }
    if(values.includeGeographicCoverage || !!values.geographicDescription){
      metadata.geographicCoverage = values.includeGeographicCoverage ? {...dataset?.metrics?.geographicScope} : {}
      if(!!values.geographicDescription){
        metadata.geographicCoverage.geographicDescription = values.geographicDescription
      }
    }
    if(values.includeTaxonomicCoverage || !!values.generalTaxonomicCoverage){
      
      metadata.taxonomicCoverage = values.includeTaxonomicCoverage ? {...dataset?.metrics?.taxonomicScope} : {};
      if(!!values.generalTaxonomicCoverage){
        metadata.taxonomicCoverage.generalTaxonomicCoverage = values.generalTaxonomicCoverage
      }
    }
    if(values.includeTemporalCoverage){
      metadata.temporalCoverage = dataset?.metrics?.temporalScope
    }
    return axiosWithAuth
      .post(`${config.backend}/dataset/${key}/metadata`, metadata)
      .then((res) => {
        setIsTouched(false);
        if (onSaveSuccess && typeof onSaveSuccess === "function") {
          onSaveSuccess(res);
        }
        message.success("Metadata saved");
        setDataset({ ...dataset, metadata: values });
        setSubmissionError(null);
      })
      .catch((err) => {
        setSubmissionError(err);
      });
  };

  const initialValues = dataset?.metadata || {};

  const reuseAgent = (agent, type) => {
    // contact is the only non-arrary agent
    if(type !== "contact"){
        form.setFieldsValue({[type]: [...(form.getFieldValue(type) || []), agent]})

    } else {
        form.setFieldsValue({[type]: agent})

    }
  }

  return (
    <>
     {!!dataset ? <Form
        initialValues={initialValues}
        onFinish={submitData}
        onFinishFailed={onFinishFailed}
        style={{ paddingTop: "12px" }}
        layout="vertical"
        form={form}
        onFieldsChange={(changedFields, allFields) => {
          // add your additionaly logic here
          const touchedFields = allFields.filter((field) => {
            const name = field?.name?.[0];
            /* if (!field.touched) {
              return false;
            } else  */if (
              typeof field?.value === "object" &&
              typeof dataset?.metadata?.[name] === "object" &&
              JSON.stringify(field?.value) !==
                JSON.stringify(dataset?.metadata?.[name])
            ) {
              return true;
            } else if (!field?.value && !!dataset?.metadata?.[name]) {
              return true;
            } else if (!!field?.value && !dataset?.metadata?.[name]) {
              return true;
            } else if (
              typeof field?.value !== "object" &&
              field?.value &&
              field?.value != dataset?.metadata?.[name]
            ) {
              return true;
            } /* if(!field?.value && !dataset?.metadata?.[name]) */ else {
              return false;
            }
          });
          setIsTouched(touchedFields.length > 0);
        }}
      >
        <Row>
          {/* <Col span={4}>
            Show help <Switch onChange={setShowHelp} checked={showHelp} />
          </Col> */}
          {isTouched && (
            <Col>
              <Text type="warning">You have unsaved changes</Text>
            </Col>
          )}
          <Col flex="auto"></Col>

          <Col>
            {" "}
            <FormItem>
              <Button htmlType="submit">
                {saveButtonLabel || "Save metadata"}
              </Button>
            </FormItem>
          </Col>

          <Col>
            {" "}
            <Button
              style={{ marginLeft: "10px" }}
              disabled={!submittable}
              type="primary"
              onClick={async () => {
                try {
                  if(isTouched){
                    await submitData(values);
                  }
                  navigate(`/dataset/${dataset?.id}/export`);
                } catch (err) {
                    console.log(err)
                  //  onFinishFailed(err)
                }
              }}
            >
              Proceed
            </Button>
          </Col>
        </Row>

        {submissionError && (
          <FormItem>
            <Alert
              closable
              onClose={() => setSubmissionError(null)}
              description={submissionError?.message}
              type="error"
            />
          </FormItem>
        )}
     <FormItem
      hidden={section !== "basic"}
          {...formItemLayout}
          label={<>Title {help?.title && <Help title="Title" style={{marginLeft: "6px"}} content={help?.title} />}</>}
          name="title"
          help={showHelp && (help?.title || null)}
          rules={[
            {
              required: true,
              message: "Please input dataset title",
            },
          ]}
        >
          <Input />
        </FormItem>
           <FormItem
           hidden={section !== "basic"}
          {...formItemLayout}
          label={<>License {help?.license && <Help title="License"  style={{marginLeft: "6px"}} content={help?.license} />}</>}
          name="license"
          help={showHelp && (help?.license || null)}
          rules={[
            {
              required: true,
              message: "Please select a license",
            },
          ]}
        >
          <Select style={{ width: 500 }} showSearch>
            <Option value={undefined}>-</Option>
            {Object.keys(licenseEnum).map((f) => {
              return (
                <Option key={f} value={f}>
                  {f} <Text type="secondary">{licenseEnum[f].title}</Text>
                </Option>
              );
            })}
          </Select>
        </FormItem>

     {/*    <FormItem
          {...formItemLayout}
          label="DOI"
          name="doi"
          help={showHelp && (help?.doi || null)}
        >
          <Input />
        </FormItem> */}

   
          <FormItem
            hidden={section !== "basic"}
            {...formItemLayout}
            label={<>Contact {help?.contact && <Help title="Contact"  style={{marginLeft: "6px"}} content={help?.contact} />}</>}
            name="contact"
            help={showHelp && (help?.contact || null)}
            rules={[
              {
                required: true,
                message: "You must enter a contact person for the dataset",
              },
            ]}
            
          >
            <AgentControl
              requiredFields={["electronicMailAddress"/* , "userId" */]}
              agentType="contact"
              label="New contact"
              removeAll={true}
              array={false}
              otherAgentTypes={["creator"]}
              reUseAgentAsOtherAgentType={reuseAgent}
            />
          </FormItem>
        

   
          <FormItem
            hidden={section !== "basic"}
            {...formItemLayout}
            label={<>Description {help?.description && <Help title="Description"  style={{marginLeft: "6px"}} content={help?.description} />}</>}
            name="description"
            help={showHelp && (help?.description || null)}
          >
            <TextArea rows={6} />
          </FormItem>
        


          <FormItem
          hidden={section !== "sampling_methods"}
            {...formItemLayout}
            label={<>Study extent {help?.studyExtent && <Help title="Study extent"  style={{marginLeft: "6px"}} content={help?.studyExtent} />}</>}
            name="studyExtent"
            help={showHelp && (help?.studyExtent || null)}
          >
            <TextArea rows={6} />
          </FormItem>
        
  
          <FormItem
          hidden={section !== "sampling_methods"}
            {...formItemLayout}
            label={<>Sampling description {help?.samplingDescription && <Help title="Sampling description"  style={{marginLeft: "6px"}} content={help?.samplingDescription} />}</>}
            name="samplingDescription"
            help={showHelp && (help?.samplingDescription || null)}
          >
            <TextArea rows={6} />
          </FormItem>
        

          <FormItem
          hidden={section !== "sampling_methods"}
            {...formItemLayout}
            label={<>Method steps {help?.methodSteps && <Help title="Method steps"  style={{marginLeft: "6px"}} content={help?.methodSteps} />}</>}
            name="methodSteps"
            help={showHelp && (help?.methodSteps || null)}
          >
            <MethodSteps removeAll={true} label="Add step" />
          </FormItem>
     

        {/*       {true &&(
        <FormItem
          {...formItemLayout}
          label="Publisher"
          name="publisher"
         
        >
          <AgentControl
            agentType="publisher"
            label="New publisher"
            removeAll={true}
            array={false}
          />
        </FormItem>
      )} */}
       
          <FormItem
          hidden={section !== "basic"}
            {...formItemLayout}
            label={<>Creators {help?.creator && <Help title="Creators"  style={{marginLeft: "6px"}} content={help?.creator} />}</>}
            name="creator"
            help={showHelp && (help?.creator || null)}
            rules={[
              {
                required: true,
                message: "You must enter at least one creator of the dataset",
              },
            ]}
          >
            <AgentControl
              agentType="creator"
              label="New creator"
              removeAll={true}
              array={true}
              
            />
          </FormItem>
        
       
          <FormItem
          hidden={section !== "basic"}
            {...formItemLayout}
            label={<>Metadata providers {help?.metadataProvider && <Help title="Metadata providers"  style={{marginLeft: "6px"}} content={help?.metadataProvider} />}</>}
            name="metadataProvider"
            help={showHelp && (help?.metadataProvider || null)}
          >
            <AgentControl
              agentType="metadataProvider"
              label="New Metadata Provider"
              removeAll={true}
              array={true}
            />
          </FormItem>
        


          <FormItem
          hidden={section !== "associated_parties"}
            {...formItemLayout}
            label={<>Associated parties {help?.associatedParty && <Help title="Associated parties"  style={{marginLeft: "6px"}} content={help?.associatedParty} />}</>}
            name="associatedParty"
            help={showHelp && (help?.associatedParty || null)}
          >
            <AgentControl
              agentType="associatedParty"
              label="New associated party"
              hasRole={true}
              removeAll={true}
              array={true}
            />
          </FormItem>
          
{/*           const {identifier, title, personnel, description, funding, studyAreaDescription, designDescription} = project;
 */}
 <FormItem
      hidden={section !== "project_data"}
          {...formItemLayout}
          label={<>Project Title {help?.projectTitle && <Help title="Project Title" style={{marginLeft: "6px"}} content={help?.projectTitle} />}</>}
          name="projectTitle"
          help={showHelp && (help?.projectTitle || null)}
          
        >
          <Input />
        </FormItem>

        <FormItem
      hidden={section !== "project_data"}
          {...formItemLayout}
          label={<>Project Identifier {help?.projectIdentifier && <Help title="Project Identifier" style={{marginLeft: "6px"}} content={help?.projectIdentifier} />}</>}
          name="projectIdentifier"
          help={showHelp && (help?.projectIdentifier || null)}
          
        >
          <Input />
        </FormItem>

        <FormItem
            hidden={section !== "project_data"}
            {...formItemLayout}
            label={<>Project Description {help?.projectDescription && <Help title="Project Description"  style={{marginLeft: "6px"}} content={help?.projectDescription} />}</>}
            name="projectDescription"
            help={showHelp && (help?.projectDescription || null)}
          >
            <TextArea rows={6} />
          </FormItem>
          <FormItem
            hidden={section !== "project_data"}
            {...formItemLayout}
            label={<>Project Funding {help?.projectFunding && <Help title="Project Funding"  style={{marginLeft: "6px"}} content={help?.projectFunding} />}</>}
            name="projectFunding"
            help={showHelp && (help?.projectFunding || null)}
          >
            <TextArea rows={6} />
          </FormItem>

          <FormItem
            hidden={section !== "project_data"}
            {...formItemLayout}
            label={<>Project Study Area Description {help?.projectStudyAreaDescription && <Help title="Project Study Area Description"  style={{marginLeft: "6px"}} content={help?.projectStudyAreaDescription} />}</>}
            name="projectStudyAreaDescription"
            help={showHelp && (help?.projectStudyAreaDescription || null)}
          >
            <TextArea rows={6} />
          </FormItem>
          <FormItem
            hidden={section !== "project_data"}
            {...formItemLayout}
            label={<>Project Design Description {help?.projectDesignDescription && <Help title="Project Design Description"  style={{marginLeft: "6px"}} content={help?.projectDesignDescription} />}</>}
            name="projectDesignDescription"
            help={showHelp && (help?.projectDesignDescription || null)}
          >
            <TextArea rows={6} />
          </FormItem>
<FormItem
          hidden={section !== "project_data"}
            {...formItemLayout}
            label={<>Project personnel {help?.projectPersonnel && <Help title="Project personnel"  style={{marginLeft: "6px"}} content={help?.projectPersonnel} />}</>}
            name="projectPersonnel"
            help={showHelp && (help?.projectPersonnel || null)}
          >
            <AgentControl
              agentType="projectPersonnel"
              label="New project personnel"
              hasRole={true}
              removeAll={true}
              array={true}
            />
          </FormItem>


{/*****************************************/}
        <FormItem
          hidden={section !== "geographic_coverage"} 
            {...formItemLayout}
            label={<>Description {help?.geographicDescription && <Help title="Geographic description"  style={{marginLeft: "6px"}} content={help?.geographicDescription} />}</>}
            name="geographicDescription"
            help={showHelp && (help?.geographicDescription || null)}
          >
            <Input.TextArea />
          </FormItem>
          <FormItem
          hidden={section !== "geographic_coverage"} 
            {...formItemLayout}
            label={<>Geographic coverage inferred from data {help?.geographicCoverage && <Help title="Geographic coverage inferred from data "  style={{marginLeft: "6px"}} content={help?.geographicCoverage} />}</>}
            name="includeGeographicCoverage"
            help={showHelp && (help?.geographicCoverage || null)}
          >
            <GeographicCoverage geographicCoverage={dataset?.metrics?.geographicScope}  hidden={section !== "geographic_coverage"} />
          </FormItem>
        
          <FormItem
          hidden={section !== "taxonomic_coverage"} 
            {...formItemLayout}
            label={<>Description {help?.generalTaxonomicCoverage && <Help title="Taxonomic coverage description"  style={{marginLeft: "6px"}} content={help?.generalTaxonomicCoverage} />}</>}
            name="generalTaxonomicCoverage"
            help={showHelp && (help?.generalTaxonomicCoverage || null)}
          >
            <Input.TextArea />
          </FormItem>
          <FormItem
          hidden={section !== "taxonomic_coverage"} 
            {...formItemLayout}
            label={<>Taxonomic coverage inferred from data {help?.taxonomicCoverage && <Help title="Taxonomic coverage inferred from data"  style={{marginLeft: "6px"}} content={help?.taxonomicCoverage} />}</>}
            name="includeTaxonomicCoverage"
            help={showHelp && (help?.taxonomicCoverage || null)}
          >
            <TaxonomicCoverage taxonomicCoverage={dataset?.metrics?.taxonomicScope} />
          </FormItem>
        

          <FormItem
          hidden={section !== "temporal_coverage"} 
            {...formItemLayout}
            label={<>Temporal coverage {help?.temporalCoverage && <Help title="Temporal coverage"  style={{marginLeft: "6px"}} content={help?.temporalCoverage} />}</>}
            name="includeTemporalCoverage"
            help={showHelp && (help?.temporalCoverage || null)}
          >
            <TemporalCoverage temporalCoverage={dataset?.metrics?.temporalScope} />
          </FormItem>
        



          <FormItem
          hidden={section !== "keywords"}
            {...formItemLayout}
            label={<>Keywords {help?.keywords && <Help title="Keywords"  style={{marginLeft: "6px"}} content={help?.keywords} />}</>}
            name="keywords"
            help={showHelp && (help?.keywords || null)}
          >
            <TagControl label="Add keyword" removeAll={true} />
          </FormItem>
        
          <FormItem
          hidden={section !== "keywords" }
            {...formItemLayout}
            label={<>Keyword Thesaurus {help?.keywordThesaurus && <Help title="Keyword Thesaurus"  style={{marginLeft: "6px"}} content={help?.keywordThesaurus} />}</>}
            name="keywordThesaurus"
            help={showHelp && (help?.keywordThesaurus || null)}
          >
            <Input />
          </FormItem>
        

          <FormItem
          hidden={section !== "external_link" }
            {...formItemLayout}
            label={<>Url (website) {help?.url && <Help title="Url (website)"  style={{marginLeft: "6px"}} content={help?.url} />}</>}
            name="url"
            help={showHelp && (help?.url || null)}
          >
            <Input type="url" />
          </FormItem>
        


          <FormItem
          hidden={section !== "citations" }
            {...formItemLayout}
            label={<>Bibliografic references {help?.bibliographicReferences && <Help title="Bibliografic references"  style={{marginLeft: "6px"}} content={help?.bibliographicReferences} />}</>}
            name="bibliographicReferences"
            help={showHelp && (help?.bibliographicReferences || null)}
          >
            <Citation removeAll={true} label="Add reference" />
          </FormItem>
     
      </Form> : <Skeleton  />}
    </>
  );
};

const mapContextToProps = ({
 
  license: licenseEnum,
  dataset,
  setDataset,
}) => ({
  

  licenseEnum,
  dataset,
  setDataset,
});

export default withContext(mapContextToProps)(MetaDataForm);
