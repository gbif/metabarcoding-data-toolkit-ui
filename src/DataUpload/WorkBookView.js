
import React, { useEffect, useState } from "react";
import { Tabs, Table, Button, Row, Col, Typography , Alert} from "antd";
const { Text, Link } = Typography;


const WorkBookView = ({ sheets, dismiss }) => {

  return <>

    <Row>
      <Col span={4}>
        <Button style={{ marginBottom: "8px" }} onClick={dismiss}>Back</Button>

      </Col>
      
    </Row>

    <Tabs  items={sheets.map(sheet => ({
        key: sheet?.name,
        label: sheet?.name,
        children: <>
        {sheet?.numColumns > sheet?.columnLimit && <Row><Text type="warning">{`This preview shows the first ${sheet?.columnLimit} of ${sheet?.numColumns} columns.`}</Text></Row>}
        {(sheet?.errors || []).map(e => <Alert message={e} type="warning" showIcon style={{marginBottom: "8px"}} />) }

    <Table
      size="small"
      scroll={{
        y: 800,
        x: sheet?.headers.length * 250,
      }}
      columns={sheet?.headers?.map(h => ({
        title: h || "#",
        key: h || "#",
        dataIndex: h || "#",
        ellipsis: true
      }))}
      dataSource={sheet?.rows?.slice(1).map(r => sheet?.headers?.reduce((acc, cur, idx) => { acc[cur || "#"] = r[idx]; return acc }, {}))}
      pagination={false}
    />
    </>

    }) )} />

    


    </>

}

export default WorkBookView;
