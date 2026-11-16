import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, List, Popconfirm, Select, Space, Typography, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { listApiTokens, createApiToken, revokeApiToken } from "../Auth/userApi";

const { Text, Paragraph } = Typography;

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });
const formatTime = (seconds) => (seconds ? dateTimeFormatter.format(new Date(seconds * 1000)) : "never");

// Tokens for scripts and tools, such as the MDT plugin for Claude Code
const ApiTokens = () => {
  const [form] = Form.useForm();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setTokens(await listApiTokens());
    } catch (error) {
      setTokens([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async ({ label, days }) => {
    setCreating(true);
    try {
      const token = await createApiToken(label, days);
      setCreated(token);
      form.resetFields();
      await load();
    } catch (error) {
      message.error(error?.response?.data?.error || "Could not create the token");
    }
    setCreating(false);
  };

  const revoke = async (id) => {
    try {
      await revokeApiToken(id);
    } catch (error) {
      message.error("Could not revoke the token");
    }
    if (created?.id === id) {
      setCreated(null);
    }
    load();
  };

  return (
    <List
      style={{ marginTop: "24px" }}
      bordered
      loading={loading}
      dataSource={tokens}
      locale={{ emptyText: "No API tokens" }}
      header={
        <>
          <Text>API tokens</Text>
          <Paragraph type="secondary" style={{ marginTop: "8px" }}>
            For scripts and tools, such as the MDT plugin for Claude Code. A token gives access to your datasets on this
            MDT only, and nothing else of your GBIF account. Keep it private: paste it where the tool asks for it, not
            into a chat or a shared document. It ends when it expires, when you revoke it here, or when the MDT is
            restarted.
          </Paragraph>
          <Form form={form} layout="inline" onFinish={create} initialValues={{ days: 7 }}>
            <Form.Item name="label" rules={[{ required: true, message: "What is it for?" }]}>
              <Input placeholder="What it's for, e.g. Claude Code" maxLength={100} style={{ width: "260px" }} />
            </Form.Item>
            <Form.Item name="days">
              <Select
                style={{ width: "120px" }}
                options={[
                  { value: 1, label: "1 day" },
                  { value: 7, label: "7 days" },
                  { value: 30, label: "30 days" },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={creating}>
                Create token
              </Button>
            </Form.Item>
          </Form>
          {created && (
            <Alert
              style={{ marginTop: "12px" }}
              type="success"
              closable
              onClose={() => setCreated(null)}
              message={`Token "${created.label}", valid until ${formatTime(created.expiresAt)}`}
              description={
                <>
                  <Paragraph copyable={{ text: created.token }} code style={{ wordBreak: "break-all", marginBottom: "4px" }}>
                    {created.token}
                  </Paragraph>
                  <Text type="secondary">Copy it now: it is not shown again.</Text>
                </>
              }
            />
          )}
        </>
      }
      renderItem={(t) => (
        <List.Item
          actions={[
            <Popconfirm key="revoke" title={`Revoke "${t.label}"?`} onConfirm={() => revoke(t.id)}>
              <Button type="link">
                <DeleteOutlined /> Revoke
              </Button>
            </Popconfirm>,
          ]}
        >
          <List.Item.Meta
            title={t.label}
            description={
              <Space direction="vertical" size={0}>
                <span>{`Created ${formatTime(t.createdAt)}, expires ${formatTime(t.expiresAt)}`}</span>
                <span>{`Last used: ${formatTime(t.lastUsedAt)}`}</span>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default ApiTokens;
