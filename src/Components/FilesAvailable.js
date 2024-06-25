

import React from "react";
import { Button, List, Typography, Popover, Alert, Row, Col } from "antd"
import { DownloadOutlined, WarningOutlined } from '@ant-design/icons';
import Help from "./Help";
import config from "../config";
const { Title, Text } = Typography;

const help = <Help title="Files available" content={<Text>Here you can download the Darwin Core Archive (archive.zip) and BIOM files in two versions.

    The Darwin Core Archive (archive.zip) can be indexed by biodiversity databases like GBIF and OBIS. You may download and publish it to e.g. GBIF in a way that you prefer.
    
    The BIOM file format is a general-use format for representing biological sample by observation contingency tables. BIOM is a Genomics Standards Consortium supported project. <a target="_blank" href="https://biom-format.org/" rel="noreferrer" >[https://biom-format.org/]</a>. 
    Here the BIOM file format is used as a practical intermediate file format. You may wish to download the BIOM files and use them for other applications.</Text>} />

const FilesAvailable = ({ dataset, showTitle = true }) => <div style={{maxWidth: "400px"}}>
    {showTitle && <Title level={3}>Files available</Title>}
    <List
        itemLayout="horizontal"
        dataSource={dataset?.filesAvailable}
        header={<Row><Col flex="auto"></Col><Col>{help}</Col></Row>}
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