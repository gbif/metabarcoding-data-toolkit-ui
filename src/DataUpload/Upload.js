import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload, Alert, Row, Col, Progress, Typography, Input,  } from 'antd';
import { useState, useEffect } from 'react';
import {axiosWithAuth} from "../Auth/userApi";
import withContext from "../Components/hoc/withContext";

import config from "../config";
const { Dragger } = Upload;
const {Text} = Typography;


const Uploader = ({onSuccess, onError, datasetKey, dataset}) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [submissionError, setSubmissionError] = useState(null)
    const [progress, setProgress] = useState(null)
    const [datasetTitle, setDatasetTitle] = useState( dataset?.metadata?.title || "")
    useEffect(() => {}, [progress, uploading])
    const handleUpload = () => {

        const formData = new FormData();
        formData.append('datasetTitle', datasetTitle)
        fileList.forEach((file) => {
            formData.append('tables', file);
        });
        setUploading(true);

       (datasetKey ? axiosWithAuth
            .put(`${config.backend}/dataset/${datasetKey}/upload`, formData, {
                onUploadProgress:  progressEvent => {
                    console.log(progressEvent.loaded)
                    setProgress(progressEvent)
                }
            }) : 
            axiosWithAuth
            .post(`${config.backend}/dataset/upload`, formData, {
                onUploadProgress:  progressEvent => {
                    console.log(progressEvent.loaded)
                    setProgress(progressEvent)
                }
            }))
            .then((res) => {
                setFileList([]);
                message.success(res?.data + ' upload successfully.');
                if(typeof onSuccess === 'function'){
                    onSuccess(res?.data)
                }
               
            })
            .catch((err) => {
                
                if(typeof onError === 'function'){
                    onError(err)
                } else {
                    message.error('upload failed.');
                }
            })
            .finally(() => {
                setProgress(null)
                setUploading(false);
                
            });
    };
    const props = {
        multiple: true,
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file, fileList_) => {
            let err = false;
            for (let f of fileList) {
                const duplicate = fileList_.find(s => s.name == f.name);
                if (duplicate) {
                    err = true
                    setSubmissionError(`You have already selected a file named ${duplicate.name}`)
                }
            }
            if (!err) {
                setFileList([...fileList, ...fileList_]);
            }
            return false;
        },
        fileList,
    };

    const bytesToReadable = (bytes) => {
        let mb = bytes / 1000000;
        let gb = mb / 1000
        if(mb < 500){
            return `${mb.toFixed(1)} mb`
        } else {
            return `${gb.toFixed(2)} gb`
        }

    }

    return (
        <div style={{minHeight: "400px"}}>
            {submissionError && (
                <Alert
                    style={{ marginBottom: "8px" }}
                    closable
                    onClose={() => setSubmissionError(null)}
                    description={submissionError}
                    type="error"
                />
            )}
             <div style={{marginBottom: "10px"}}>
            <Input  placeholder="Dataset title or nickname" value={datasetTitle} onChange={(e) => setDatasetTitle(e?.target?.value) } allowClear/> 
                <Text type="secondary" style={{marginBottom: "10px"}}>The title can be changed later in the "Edit Metadata" form in step 5</Text>
                </div>
            <Dragger {...props} style={{minWidth: "400px", padding: "10px"}} disabled={uploading}>
            
                <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                </p>
                {!uploading && <>
                    <p className="ant-upload-text">Click or drag files to this area to upload</p>
                    <Text type="secondary">Upload data in one of the <Button type="link" style={{ padding: "0px" }} onClick={() => window.open('https://docs.gbif-uat.org/mdt-user-guide/en/#templates', '_blank')}>four available templates</Button>.</Text>
                    </>}
                {progress && <p className="ant-upload-text">Uploading ({`${bytesToReadable(progress.loaded)} of ${bytesToReadable(progress.total)}`})</p>}
                {progress && <Progress
                percent={(progress.progress * 100).toFixed(0)}
                status="active"
                strokeColor={{
                    from: '#108ee9',
                    to: '#87d068',
                }}
            />}
            </Dragger>
           <Row>
            <Col flex="auto"></Col>
            <Col><Button
                type="primary"
                onClick={handleUpload}
                disabled={fileList.length === 0}
                loading={uploading}
                style={{
                    marginTop: 16,
                }}
            >
                {uploading ? 'Uploading' : 'Start Upload'}
            </Button></Col>
           </Row>
            
        </div>
    );
};

const mapContextToProps = ({ dataset}) => ({
    dataset
});
export default withContext(mapContextToProps)(Uploader);