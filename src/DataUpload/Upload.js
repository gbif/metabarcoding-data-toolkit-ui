import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload, Alert, Row, Col, Progress, Typography } from 'antd';
import { useState, useEffect } from 'react';
import {axiosWithAuth} from "../Auth/userApi";
import config from "../config";
const { Dragger } = Upload;
const {Text} = Typography;
const Uploader = ({onSuccess, onError, datasetKey}) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [submissionError, setSubmissionError] = useState(null)
    const [progress, setProgress] = useState(null)

    useEffect(() => {}, [progress, uploading])
    const handleUpload = () => {

        const formData = new FormData();

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
                message.error('upload failed.');
                if(typeof onError === 'function'){
                    onError(err)
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
        <>
            {submissionError && (
                <Alert
                    style={{ marginBottom: "8px" }}
                    closable
                    onClose={() => setSubmissionError(null)}
                    description={submissionError}
                    type="error"
                />
            )}
            
            <Dragger {...props} style={{minWidth: "400px", padding: "10px"}} disabled={uploading}>
            
                <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                </p>
                {!uploading && <>
                    <p className="ant-upload-text">Click or drag files to this area to upload</p>
                    <Text type="secondary">If you upload in tsv format, name your files "OTUtable.tsv", "samples.tsv" and "taxa.tsv". File extension could also be .csv or .txt</Text>
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
            
        </>
    );
};
export default Uploader;