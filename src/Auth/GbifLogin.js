import React, { useState } from "react";
import { LockOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Alert, Typography } from "antd";
import { gbifLogin, isGbifLoginRequired } from "./userApi";

const { Paragraph } = Typography;

export const GBIF_LOGIN_CANCELLED = "gbif-login-cancelled";

const GbifLoginModal = ({ open, userName, onDone, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const close = (fn) => {
    form.resetFields();
    setError(null);
    fn();
  };

  const submit = async ({ password }) => {
    setLoading(true);
    setError(null);
    try {
      await gbifLogin(userName, password);
      setLoading(false);
      close(onDone);
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.error || "Wrong password for this GBIF account.");
    }
  };

  return (
    <Modal
      open={open}
      title="Log in to GBIF again"
      okText="Continue"
      confirmLoading={loading}
      onOk={() => form.submit()}
      onCancel={() => close(onCancel)}
      destroyOnClose
    >
      <Paragraph>
        This is done with your GBIF account at GBIF, and your GBIF login from when you logged in to the MDT has
        expired. Enter the password for <strong>{userName}</strong> to continue.
      </Paragraph>
      <Form form={form} onFinish={submit}>
        <Form.Item name="password" rules={[{ required: true, message: "Please enter your GBIF password" }]}>
          <Input.Password autoFocus prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="Password" />
        </Form.Item>
      </Form>
      {error && <Alert type="error" message={error} />}
    </Modal>
  );
};

// const [withGbifLogin, gbifLoginModal] = useGbifLogin(user?.userName)
// withGbifLogin(() => axiosWithAuth.post(...)) runs the request, and when the backend needs a
// fresh GBIF login, asks for the password and runs it once more. Render gbifLoginModal.
// If the user cancels, it rejects with GBIF_LOGIN_CANCELLED.
const useGbifLogin = (userName) => {
  const [pending, setPending] = useState(null);

  const withGbifLogin = async (request) => {
    try {
      return await request();
    } catch (error) {
      if (!isGbifLoginRequired(error)) {
        throw error;
      }
      await new Promise((resolve, reject) => setPending({ resolve, reject }));
      return request();
    }
  };

  const modal = (
    <GbifLoginModal
      open={!!pending}
      userName={userName}
      onDone={() => {
        pending?.resolve();
        setPending(null);
      }}
      onCancel={() => {
        pending?.reject(GBIF_LOGIN_CANCELLED);
        setPending(null);
      }}
    />
  );

  return [withGbifLogin, modal];
};

export default useGbifLogin;
