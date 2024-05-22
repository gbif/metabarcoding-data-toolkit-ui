import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Alert,
  message,
  Form,
  Switch,
  Row,
  Col,
  Typography,
} from "antd";
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
import helpTexts from "../helpTexts.json";
const { Text, Link } = Typography;

const { emlForm: help } = helpTexts;
const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: {
    xs: { span: 20 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
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

  const submitData = (values) => {
    const key = match?.params?.key;
    let metadata = {...values};
    if(values.includeGeographicCoverage){
      metadata.geographicCoverage = dataset?.metrics?.geographicScope
    }
    if(values.includeTaxonomicCoverage){
      metadata.taxonomicCoverage = dataset?.metrics?.taxonomicScope
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
    if(isArray(values[type])){
        form.setFieldsValue({[type]: [...values[type], agent]})

    } else {
        form.setFieldsValue({[type]: agent})

    }
  }

  return (
    <>
      <Form
        initialValues={initialValues}
        onFinish={submitData}
        onFinishFailed={onFinishFailed}
        style={{ paddingTop: "12px" }}
        form={form}
        onFieldsChange={(changedFields, allFields) => {
          // add your additionaly logic here
          const touchedFields = allFields.filter((field) => {
            const name = field?.name?.[0];
            if (!field.touched) {
              return false;
            } else if (
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
          <Col span={4}>
            Show help <Switch onChange={setShowHelp} checked={showHelp} />
          </Col>
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
                  
                  await submitData(values);
                  navigate(`/dataset/${dataset?.id}/publish`);
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
          {...formItemLayout}
          label="Title"
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
          {...formItemLayout}
          label="License"
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

{true && (
          <FormItem
            {...formItemLayout}
            label="Contact"
            name="contact"
            help={showHelp && (help?.contact || null)}
            rules={[
              {
                required: true,
                message: "You mush enter a contact person for the dataset",
              },
            ]}
            
          >
            <AgentControl
              requiredFields={["electronicMailAddress", "userId"]}
              agentType="contact"
              label="New contact"
              removeAll={true}
              array={false}
              otherAgentTypes={["creator"]}
              reUseAgentAsOtherAgentType={reuseAgent}
            />
          </FormItem>
        )}

        {true && (
          <FormItem
            {...formItemLayout}
            label="Description"
            name="description"
            help={showHelp && (help?.description || null)}
          >
            <TextArea rows={6} />
          </FormItem>
        )}

        {true && (
          <FormItem
            {...formItemLayout}
            label="Study extent"
            name="studyExtent"
            help={showHelp && (help?.studyExtent || null)}
          >
            <TextArea rows={6} />
          </FormItem>
        )}
        {true && (
          <FormItem
            {...formItemLayout}
            label="Sampling description"
            name="samplingDescription"
            help={showHelp && (help?.samplingDescription || null)}
          >
            <TextArea rows={6} />
          </FormItem>
        )}

        {true && (
          <FormItem
            {...formItemLayout}
            label="Method steps"
            name="methodSteps"
            help={showHelp && (help?.methodSteps || null)}
          >
            <MethodSteps removeAll={true} label="Add step" />
          </FormItem>
        )}

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
        {true && (
          <FormItem
            {...formItemLayout}
            label="Creators"
            name="creator"
            help={showHelp && (help?.creator || null)}
          >
            <AgentControl
              agentType="creator"
              label="New creator"
              removeAll={true}
              
            />
          </FormItem>
        )}

        {true && (
          <FormItem
            {...formItemLayout}
            label="Geographic coverage"
            name="includeGeographicCoverage"
            help={showHelp && (help?.geographicCoverage || null)}
          >
            <GeographicCoverage geographicCoverage={dataset?.metrics?.geographicScope} />
          </FormItem>
        )}

{true && (
          <FormItem
            {...formItemLayout}
            label="Taxonomic coverage"
            name="includeTaxonomicCoverage"
            help={showHelp && (help?.taxonomicCoverage || null)}
          >
            <TaxonomicCoverage taxonomicCoverage={dataset?.metrics?.taxonomicScope} />
          </FormItem>
        )}

{true && (
          <FormItem
            {...formItemLayout}
            label="Temporal coverage"
            name="includeTemporalCoverage"
            help={showHelp && (help?.temporalCoverage || null)}
          >
            <TemporalCoverage temporalCoverage={dataset?.metrics?.temporalScope} />
          </FormItem>
        )}



        {true && (
          <FormItem
            {...formItemLayout}
            label="Keywords"
            name="keywords"
            help={showHelp && (help?.keywords || null)}
          >
            <TagControl label="Add keyword" removeAll={true} />
          </FormItem>
        )}
        {true && values?.keywords?.length > 0 && (
          <FormItem
            {...formItemLayout}
            label="Keyword Thesaurus"
            name="keywordThesaurus"
            help={showHelp && (help?.keywordThesaurus || null)}
          >
            <Input />
          </FormItem>
        )}

        {true && (
          <FormItem
            {...formItemLayout}
            label="Url (website)"
            name="url"
            help={showHelp && (help?.url || null)}
          >
            <Input type="url" />
          </FormItem>
        )}

        {true && (
          <FormItem
            {...formItemLayout}
            label="Bibliografic references"
            name="bibliographicReferences"
            help={showHelp && (help?.bibliographicReferences || null)}
          >
            <Citation removeAll={true} label="Add reference" />
          </FormItem>
        )}
      </Form>
    </>
  );
};

const mapContextToProps = ({
  addError,
  addInfo,

  license: licenseEnum,
  dataset,
  setDataset,
}) => ({
  addError,
  addInfo,

  licenseEnum,
  dataset,
  setDataset,
});

export default withContext(mapContextToProps)(MetaDataForm);
