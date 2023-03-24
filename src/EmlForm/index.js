import React, { useState, useEffect } from "react";
import {
    Input,
    Select,
    Button,
    Alert,
    notification,
    Form,
    Switch,
    Row,
    Col,
    Typography
} from "antd";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import axios from "axios";
import config from "../config";
import TextArea from "antd/lib/input/TextArea";
import AgentControl from "./AgentControl";
import MethodSteps from "./MethodSteps2";
import Citation from "./Citation"
import TagControl from "./TagControl";
//import Auth from "../Auth"
import withContext from "../Components/hoc/withContext";
import helpTexts from "../helpTexts.json"
const { Text, Link } = Typography;

const {emlForm: help} = helpTexts;
const FormItem = Form.Item;
const Option = Select.Option;
const openNotification = (title, description) => {
    notification.open({
        message: title,
        description: description,
    });
};

const formItemLayout = {
    labelCol: {
        xs: { span: 20 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    }
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

const MetaDataForm = ({data, onSaveSuccess, saveButtonLabel, dataset, setDataset, licenseEnum}) => {

    const match = useMatch('/dataset/:key/metadata')
    const [submissionError, setSubmissionError] = useState(null);
    const [showHelp, setShowHelp] = useState(true)
    const [form] = Form.useForm();


    const onFinishFailed = ({ errorFields }) => {
        form.scrollToField(errorFields[0].name);
    };

    const submitData = (values) => {
        const key = match?.params?.key;

            axios.post(`${config.backend}/dataset/${key}/metadata`, {
                ...values
            })
            .then((res) => {
                let title = key ? "Meta data updated" : "Dataset registered";
                let msg = key
                    ? `Meta data updated successfully updated for ${values.title}`
                    : `${values.title} registered and ready for import`;
                if (onSaveSuccess && typeof onSaveSuccess === "function") {
                    if (key) {
                        onSaveSuccess(res);
                    } else {
                        onSaveSuccess(res, values.origin);
                    }
                }
                openNotification(title, msg);
                setDataset({...dataset, metadata: values})
                setSubmissionError(null);
            })
            .catch((err) => {
                setSubmissionError(err);
            });

    };



    const initialValues = dataset?.metadata || {};



    return (
       <>
       <Row><Col flex="auto"></Col><Col>Show help <Switch onChange={setShowHelp}/></Col></Row>
        <Form
            initialValues={initialValues}
            onFinish={submitData}
            onFinishFailed={onFinishFailed}
            style={{ paddingTop: "12px" }}
            form={form}
        >
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
                help={ showHelp && (help?.title || null)}
                rules={
                    [
                        {
                            required: true,
                            message: "Please input dataset title",
                        },
                    ]
                }
            >
                <Input />
            </FormItem>
            <FormItem
                {...formItemLayout}
                label="License"
                name="license"
                help={ showHelp && (help?.license || null)}
                rules={
                    [
                        {
                            required: true,
                            message: "Please select a license",
                        },
                    ]
                }

            >
                <Select style={{ width: 500 }} showSearch>
                    <Option value={undefined}>-</Option>
                    {Object.keys(licenseEnum).map((f) => {
                        return (
                            <Option key={f} value={f}>
                                {f}
                                <br/><Text type="secondary">{licenseEnum[f].title}</Text>
                            </Option>
                        );
                    })}
                </Select>
            </FormItem>

            {true && (
                <FormItem
                    {...formItemLayout}
                    label="DOI"
                    name="doi"
                    help={ showHelp && (help?.doi || null)}


                >
                    <Input />
                </FormItem>
            )}
            {true && (
                <FormItem
                    {...formItemLayout}
                    label="Description"
                    name="description"
                    help={ showHelp && (help?.description || null)}
                >
                    <TextArea rows={6} />
                </FormItem>
            )}

            {true && (  
                <FormItem
                    {...formItemLayout}
                    label="Method steps"
                    name="methodSteps"
                    help={ showHelp && (help?.methodSteps || null)}
                >
                    <MethodSteps removeAll={true} label="Add step" />
                </FormItem>
            )}

            {true && (
                <FormItem
                    {...formItemLayout}
                    label="Contact"
                    name="contact"
                    help={ showHelp && (help?.contact || null)}

                >
                    <AgentControl
                        agentType="contact"
                        label="New contact"
                        removeAll={true}
                        array={false}
                    />
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
                    help={ showHelp && (help?.creator || null)}

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
                    label="Keywords"
                    name="keywords"
                    help={ showHelp && (help?.keywords || null)}

                >
                    <TagControl label="Add keyword" removeAll={true} />
                </FormItem>
            )}




            {true && (
                <FormItem
                    {...formItemLayout}
                    label="Url (website)"
                    name="url"
                    help={ showHelp &&( help?.url || null)}

                >
                    <Input type="url" />
                </FormItem>
            )}

{true && (  
                <FormItem
                    {...formItemLayout}
                    label="Bibliografic references"
                    name="bibliographicReferences"
                    help={ showHelp && (help?.bibliographicReferences || null)}

                >
                    <Citation removeAll={true} label="Add reference" />
                </FormItem>
            )}





            <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                    {saveButtonLabel || "Save"}
                </Button>
            </FormItem>
        </Form>
        </>
    );
};

const mapContextToProps = ({
    addError,
    addInfo,

    license: licenseEnum,
    dataset,
    setDataset

}) => ({
    addError,
    addInfo,

    licenseEnum,
    dataset,
    setDataset
});

export default withContext(mapContextToProps)(MetaDataForm);
