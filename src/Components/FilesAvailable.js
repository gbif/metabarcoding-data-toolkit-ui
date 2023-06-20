

import React from "react";
import { Button, List, Typography, Popover, Alert } from "antd"
import { DownloadOutlined, WarningOutlined } from '@ant-design/icons';
import config from "../config";
const { Title } = Typography;

const FilesAvailable = ({ dataset, showTitle = true }) => <div style={{maxWidth: "400px"}}>
    {showTitle && <Title level={3}>Files available</Title>}
    <List
        itemLayout="horizontal"
        dataSource={dataset?.filesAvailable}
        renderItem={(file) => (
            <List.Item
                actions={[<Button type="link" download={file.fileName} href={`${config.backend}/dataset/${dataset?.id}/file/${file.fileName}`}><DownloadOutlined color="yellow"/></Button>]}
            >
                <List.Item.Meta
                    title={<>{file.fileName} {file.format === 'BIOM 2.1' 
                    && dataset?.processingErrors?.hdf5?.length > 0 
                    && <Popover 
                        title={`${dataset?.processingErrors?.hdf5?.length} issues`}
                        content={<Alert style={{width: "500px"}} type="warning" message={<ul> 
                            {dataset?.processingErrors?.hdf5.map(i => <li>{i}</li>)}
                        </ul>} ></Alert>}><WarningOutlined /></Popover> } </>}
                    description={`${file?.format} - ${file?.mimeType} - ${Math.round(file.size * 10) / 10} mb`}
                />
            </List.Item>
        )}
    />

</div>

export default FilesAvailable;