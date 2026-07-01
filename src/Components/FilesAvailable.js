

import React from "react";
import { Button, List, Typography, Popover, Alert, Row, Col } from "antd"
import { DownloadOutlined, WarningOutlined, BarChartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Help from "./Help";
import config from "../config";
const { Title, Text } = Typography;

const help = <Help title="Files available" content={<Text>
    <p>Only the files that have actually been generated for this dataset are listed. Depending on how far the dataset has been processed, some of these may not yet be available:</p>
    <ul>
        <li><b>Darwin Core Archive</b> (archive.zip) can be indexed by biodiversity databases like GBIF and OBIS. You may download and publish it to e.g. GBIF in a way that you prefer.</li>
        <li><b>Darwin Core Data Package</b> (dwc-dp.zip and dwc-dp.parquet.zip) is the newer GBIF publishing format, available as CSV and Parquet.</li>
        <li><b>BIOM files</b> (data.biom.json and data.biom.h5) use a general-use format for representing biological sample by observation contingency tables. BIOM is a Genomics Standards Consortium supported project (<a target="_blank" href="https://biom-format.org/" rel="noreferrer" >https://biom-format.org/</a>). Here it is used as a practical intermediate file format. You may wish to download the BIOM files and use them for other applications.</li>
        <li><b>Log file</b> (log.txt) contains the processing log for this dataset.</li>
    </ul>
</Text>} />

// Human-readable labels for the internal format codes stored in filesAvailable.
const formatLabels = {
    'BIOM 1.0': 'BIOM 1.0 (JSON)',
    'BIOM 2.1': 'BIOM 2.1 (HDF5)',
    'DWC': 'Darwin Core Archive',
    'DWCDP': 'Darwin Core Data Package',
    'DWCDP_PARQUET': 'Darwin Core Data Package (Parquet)',
    'Log file': 'Log file',
};

const FilesAvailable = ({ dataset, showTitle = true }) => <div style={{maxWidth: "400px"}}>
    {showTitle && <Title level={3}>Files available</Title>}
    <List
        itemLayout="horizontal"
        dataSource={[...(dataset?.filesAvailable ?? []), {fileName: 'log.txt', format: 'Log file', mimeType: 'text/plain', size: 0}]}
        header={<Row><Col flex="auto"></Col><Col>{help}</Col></Row>}
        renderItem={(file) => (
            <List.Item
                actions={[
                    file.format === 'DWCDP_PARQUET' && (
                        <Link to={`/dataset/${dataset?.id}/dashboard`}>
                            <Button type="link" icon={<BarChartOutlined />} title="Explore data" />
                        </Link>
                    ),
                    <Button type="link" download={file.fileName} href={file?.fileName === 'log.txt'? `${config.backend}/dataset/${dataset?.id}/log.txt`: `${config.backend}/dataset/${dataset?.id}/file/${file.fileName}`}><DownloadOutlined color="yellow"/></Button>
                ].filter(Boolean)}
            >
                <List.Item.Meta
                    title={<>{file.fileName} {file.format === 'BIOM 2.1' 
                    && dataset?.processingErrors?.hdf5?.length > 0 
                    && <Popover 
                        title={`${dataset?.processingErrors?.hdf5?.length} issues`}
                        content={<Alert style={{width: "500px"}} type="warning" message={<ul> 
                            {dataset?.processingErrors?.hdf5.map(i => <li>{i}</li>)}
                        </ul>} ></Alert>}><WarningOutlined /></Popover> } </>}
                    description={`${formatLabels[file?.format] ?? file?.format} - ${file?.mimeType} - ${Math.round(file.size * 10) / 10} mb`}
                />
            </List.Item>
        )}
    />

</div>

export default FilesAvailable;