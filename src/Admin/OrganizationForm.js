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
  Space
} from "antd";
import config from "../config";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
// import axios from "axios";
import { axiosWithAuth } from "../Auth/userApi";
import OrganizationControl from "./OrganizationControl";
import TagControl from "../EmlForm/TagControl";
import {getEmailBodyForTokenRequest} from "../Publish/EmailTemplate";
const FormItem = Form.Item;



const OrganizationForm = ({initialValues, submitData, user}) => {

    const [submissionError, setSubmissionError] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [isTouched, setIsTouched] = useState(false);
    const [submittable, setSubmittable] = useState(false);
    const [submitting, setSubmitting] = useState(false)
    const [tokenError, setTokenError] = useState(null)
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

    const submitData_ = async (values) => {
        try {
            setSubmitting(true)
            await submitData(values)
            setSubmitting(false)
        } catch (error) {
            setSubmitting(false)

            console.log(error)
        }
    }

    const retrieveToken = async () => {
        
        try {
            const url = `${config.backend}/organization/${values?.key}/password`;
            console.log(url)
            const res = await axiosWithAuth.get(url)
            setTokenError(null)
            form.setFieldValue('token', res.data)
        } catch (error) {

            if(error?.response?.status === 403){
                setTokenError(<>You don´t have permissions to see the token for this organisation. Please contact <a target="_blank" href={`mailto:helpdesk@gbif.org?subject=${encodeURIComponent("Organization token")}&body=${encodeURIComponent(getEmailBodyForTokenRequest({organizationKey: values?.key, toolBaseUrl: window.location.protocol +"//"+ window.location.hostname, user
                }))}`} rel="noreferrer">GBIF Helpdesk</a>.</>)

            } else if(error?.message)(
                setTokenError(error?.message)
            )
        }
    }

    return <>
    <Form
    
        layout="vertical"
        initialValues={initialValues}
        onFinish={submitData_}
        onFinishFailed={onFinishFailed}
        style={{ paddingTop: "12px" }}
        form={form}
        onFieldsChange={(changedFields, allFields) => {
          // add your additionaly logic here
        
        }}
      >

        <FormItem
        label="Organization name"
        name="name"
        rules={[
          {
            required: true,
            message: "Type to find the organization",
          },
        ]}
         >
            <OrganizationControl  setOrganizationKey={key => {
                if(values?.key !== key){
                    form.setFieldValue('key', key)
                    form.setFieldValue('token', null)
                }
                
            }}/>
        </FormItem>
        <FormItem 
        label={"Organization Key"}
        name="key"
        rules={[
            {
              required: true,
            },
          ]}
        >
            
            <Input  />
        </FormItem>
        
        <FormItem 
        label={"Organization shared token"}
        name="token"
        rules={[
            {
              required: true,
            },
          ]}
        extra={tokenError ? <Alert style={ {marginTop: "10px"}}type="error" description={tokenError} /> : null}
        >
            
      <Input.Password addonAfter={ <span style={{cursor: "pointer"}} onClick={retrieveToken}>Retrieve</span>} />
     
   
        </FormItem>

        <FormItem 
        label={"Users"}
        name="users"
        >
            <TagControl  removeAll />
        </FormItem>
        <Row>
            <Col flex="auto"></Col>
            <FormItem>
              <Button type="primary" htmlType="submit">
                {"Save"}
              </Button>
            </FormItem>
        </Row>
        
      </Form>
    </>
}

export default OrganizationForm