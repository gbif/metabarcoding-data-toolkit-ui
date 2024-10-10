import React, { useState, useEffect } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Input, Button, Checkbox, Alert, Form } from 'antd';
import config from '../config'
const FormItem = Form.Item;

const messages = {
  "Request failed with status code 401": "Invalid User name or Password"
}

const LoginForm = ({onLogin, invalid}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false)
  
  useEffect(()=> {
    if(!!invalid){
      setLoading(false)
    }
  }, [invalid])

  const onFinishFailed = ({ errorFields }) => {
    form.scrollToField(errorFields[0].name);
  };

  const onFinish = (values) => {
    setLoading(true)
    onLogin(values)
  }

  return   (
    <Form onFinish={onFinish} onFinishFailed={onFinishFailed} initialValues={{
      remember: true,
    }}>
      <FormItem rules={[{ required: true, message: 'Please enter your GBIF username!' }]} name="username">
        <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
      </FormItem>
      <FormItem rules={[{ required: true, message: 'Please enter your GBIF password!' }]} name="password">
        <Input prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
      </FormItem>
      <FormItem style={{width: '100%'}} valuePropName="checked" name="remember">
        <Button  loading={loading} type="primary" htmlType="submit" style={{width: '100%'}}>
          Log in
        </Button>
        Or <a href={`https://www.gbif${config.env !== "prod" ? "-uat" : ""}.org/user/profile`}>register at gbif{config.env !== "prod" ? "-uat" : ""}.org now!</a>
      </FormItem>
      {invalid && <FormItem style={{width: '100%'}}><Alert message={messages?.[invalid] || invalid} type="error" /></FormItem>}

      <FormItem><a className="login-form-forgot" href={`https://www.gbif${config.env !== "prod" ? "-uat" : ""}.org/user/profile`}>Forgot password?</a></FormItem>
    </Form>
  );

}

export default LoginForm;