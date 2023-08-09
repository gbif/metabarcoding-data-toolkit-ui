
import React, { useEffect, useState } from "react";
import { Table, Button, Row, Col, Descriptions, Typography } from "antd";
const { Text, Link } = Typography;


const FileView = ({ file, dismiss }) => {

  return <>

    <Row>
      <Col span={4}>
        <Button style={{ marginBottom: "8px" }} onClick={dismiss} type="primary">Back</Button>

      </Col>
      <Col span={20}>
        <Descriptions  >
          <Descriptions.Item label={`File`}>{file?.name}</Descriptions.Item>
          <Descriptions.Item label={`Delimiter`}>{file?.properties?.delimiter === '\t' ? "\\t" : file?.properties?.delimiter}</Descriptions.Item>
          <Descriptions.Item label={`Number of columns`}>{file?.properties?.numColumns}</Descriptions.Item>

        </Descriptions>
      </Col>
    </Row>

    {file?.properties?.numColumns > file?.properties?.columnLimit && <Row><Text type="warning">{`This preview shows the first ${file?.properties?.columnLimit} of ${file?.properties?.numColumns} columns.`}</Text></Row>
    }


    <Table
      size="small"
      scroll={{
        y: 800,
        x: file?.properties?.headers.length * 250,
      }}
      columns={file?.properties?.headers?.map(h => ({
        title: h,
        key: h,
        dataIndex: h,
        ellipsis: true
      }))}
      dataSource={file?.properties?.rows?.slice(1).map(r => file?.properties?.headers?.reduce((acc, cur, idx) => { acc[cur] = r[idx]; return acc }, {}))}
      pagination={false}
    /></>

}

export default FileView;
