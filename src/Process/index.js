
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Table, Descriptions, Row, Col, Alert, Button, Timeline, Progress, Statistic, Space, Typography, Tooltip, Checkbox, message, theme, Tabs } from "antd"
import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {dateFormatter, numberFormatter} from '../Util/formatters'
import FilesAvailable from '../Components/FilesAvailable'
import _ from "lodash"
import Help from "../Components/Help";
import config from "../config";
import withContext from "../Components/hoc/withContext";
import { axiosWithAuth } from "../Auth/userApi";
const POLLING_INTERVAL = 1000;
const MAX_POLLING_INTERVAL = 10000;
const { Title } = Typography;
const { useToken } = theme;

const truncateMissingIdError = (strings, ...values) => ((values[0].length > 10 ? values[0].slice(0, 10).join(', ') + ` and ${values[0].length - 10} more ids` : values[0].join(', ')) + ` ${strings[1]}`);


/* const missingIdrMessages = {
    sampleIdsWithNoRecordInOtuTable`Sample_4 in the SAMPLETABLE is not present in the OTUTABLE`,
    sampleIdsWithNoRecordInSampleFile`Sample_4 in the SAMPLETABLE is not present in the OTUTABLE`,
    taxonIdsWithNoRecordInOtuTable`Sample_4 in the SAMPLETABLE is not present in the OTUTABLE`,
    taxonIdsWithNoRecordInSampleFile`Sample_4 in the SAMPLETABLE is not present in the OTUTABLE`
} */

const ProcessDataset = ({
    dataset,
    setDataset,
    supportedMarkers }) => {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [failed, setFailed] = useState(false);
    const [finished, setFinished] = useState(false);
    const [validationIssues, setValidationIssues] = useState([])
    const [showProcessingErrors, setShowProcessingErrors] = useState(false)
    const [assignTaxonomy, setAssignTaxonomy] = useState(dataset?.assignTaxonomy || false)
    const [showAssignTaxonomyCheckbox, setShowAssignTaxonomyCheckbox] = useState(false)
    const [metrics, setMetrics] = useState(null)
    const { token } = useToken();
    //    let hdl = useRef();
    //  let refreshUserHdl = useRef();

    useEffect(() => {

        if (dataset?.mapping?.defaultValues?.target_gene && supportedMarkers.map(m => m?.name).includes(dataset?.mapping?.defaultValues?.target_gene?.toLowerCase())) {
            setShowAssignTaxonomyCheckbox(true)
        }
        if (dataset?.assignTaxonomy) {
            setAssignTaxonomy(true)
        } else {
            setAssignTaxonomy(false)
        }
    }, [dataset?.mapping?.defaultValues?.target_gene, dataset?.assignTaxonomy, supportedMarkers])

    useEffect(() => {

        /*  setFailed(false)
         setFinished(false)
         if (!!dataset?.steps) {
             const isFinished = dataset.steps[dataset.steps.length - 1].status === 'finished';
             const isFailed = !!dataset.steps.find(s => s.status === 'failed');
             setFailed(isFailed)
             setFinished(isFinished)
             if (!isFinished && !isFailed) {
                 if (hdl.current) {
                     clearInterval(hdl.current);
                 }
                 hdl.current = setInterval(() => getData(dataset?.id, hdl.current), 1000);
             }
         }  */
        if (dataset?.id && dataset?.steps /* && !processDatasetID */) {
            // setProcessDatasetID(dataset?.id)
            subscribe()

        }

    }, [dataset?.id]);

    useEffect(() => {

        if (dataset) {
            validate(dataset)
        }
    }, [dataset?.mapping])

    useEffect(()=> {
        if(finished){
            getMetrics()
        }

    }, [finished, dataset?.id])

    const getMetrics = async () => {

        try {
            const metrics_ = await axiosWithAuth.get(`${config.backend}/dataset/${dataset?.id}/data/metrics`);
            console.log(metrics_)
            setMetrics(metrics_.data)
            setDataset({...dataset, metrics: metrics_.data})

        } catch (error) {
            console.log(error)
        }
    }

    const isValidForProcessing = () => {
        if (!dataset) {
            return false
        } else {
            return  ['TSV', 'TSV_WITH_FASTA','XLSX' , 'XLSX_WITH_FASTA', 'BIOM_2_1' ].includes(dataset?.files?.format)  // dataset?.files?.format === 'TSV' || dataset?.files?.format === 'TSV_WITH_FASTA' || dataset?.files?.format === 'XLSX' || dataset?.files?.format === 'XLSX_WITH_FASTA' || dataset?.files?.format === 'XLSX_WITH_FASTA'
        }
    }

    const validate = async (dataset) => {
        try {
            let errors = []
            const { mapping, sampleHeaders, taxonHeaders, files } = dataset;
            const taxonIdMapping = mapping?.taxa?.id;
            const sampleIdMapping = mapping?.samples?.id;
            const hasTaxonFile = files?.files.find(f => f?.type == "taxa") && files?.format === "TSV";
           
            if (hasTaxonFile && mapping && !taxonIdMapping && !taxonHeaders?.includes('id')) {
                errors.push("There is no 'id' column in the taxon file and no other column has been marked as the identifier ('id')")
            }
            if (mapping && !sampleIdMapping && !sampleHeaders?.includes('id')) {
                errors.push("There is no 'id' column in the sample file and no other column has been marked as the identifier ('id')")

            }

            setValidationIssues(errors)

        } catch (error) {
            console.log(error)
        }
    }


    const processData = async () => {
        if (isValidForProcessing()) {
            setDataset({steps: [], processingErrors: null})
            setShowProcessingErrors(false)
            setFailed(false)
            setFinished(false)
            try {
                const processRes = await axiosWithAuth.post(`${config.backend}/dataset/${dataset?.id}/process${(showAssignTaxonomyCheckbox && assignTaxonomy) ? '?assignTaxonomy=true' : ''}`);
                message.info("Processing data");


                subscribe()
            } catch (error) {
                setError(error)
            }

        }
    }

    const getPollingInterval = (_dataset) => {
        if (!_dataset?.summary?.sampleCount) {
            return POLLING_INTERVAL;
        } else if (_dataset?.summary?.sampleCount && !_dataset?.summary?.taxonCount) {
            return Math.max(POLLING_INTERVAL, _dataset?.summary?.sampleCount)
        } else {

            const interval = Math.max(POLLING_INTERVAL, Math.min(MAX_POLLING_INTERVAL, Math.round(_dataset?.summary?.sampleCount * _dataset?.summary?.taxonCount / 100000)))
            //  console.log(interval)
            return interval;
        }

    }


    const subscribe = async (interval = POLLING_INTERVAL) => {
        try {
            let res = await axiosWithAuth.get(`${config.backend}/dataset/${dataset?.id}/process`);

            if (res.status === 502) {
                // Status 502 is a connection timeout error,
                // may happen when the connection was pending for too long,
                // and the remote server or a proxy closed it
                // let's reconnect
                await subscribe();
            } else if (res.status !== 200) {
                // An error - let's show it
               // console.log(res)
                // showMessage(response.statusText);
                // Reconnect in one second
                await new Promise(resolve => setTimeout(resolve, interval));
                await subscribe(getPollingInterval(dataset));
            } else {
                // Get and show the message
                const isFinished = res?.data?.steps && res?.data?.steps[res?.data?.steps?.length - 1]?.status === 'finished';
                const isFailed = res?.data?.steps && !!res?.data?.steps.find(s => s.status === 'failed');
                if (res?.data?.assignTaxonomy) {
                    setAssignTaxonomy(res?.data?.assignTaxonomy)

                }
                setFailed(isFailed)
                setFinished(isFinished)
                setDataset(res?.data)
                if (!(isFinished || isFailed)) {
                    await new Promise(resolve => setTimeout(resolve, interval));
                    await subscribe(getPollingInterval(res?.data));
                }

                if ((isFailed || isFinished) && (res?.data?.processingErrors?.consistencyCheck || res?.data?.processingErrors?.blast)) {

                    const { consistencyCheck } = res?.data?.processingErrors;
                    // Sum the length of the arrarys of missed IDs
                    const numberOfMissedIDs = Object.keys(consistencyCheck).reduce((acc, curr) => acc + consistencyCheck[curr].length, 0);
                    if (numberOfMissedIDs > 0 || res?.data?.processingErrors?.blast?.length > 0) {
                        setShowProcessingErrors(true)
                    }

                }

                

            }
        } catch (error) {
            console.log(error)
        }

    }

    const getStatusColor = (status) => {
        switch (status) {
            case "processing":
                return '#108ee9'
            case "finished":
                return 'green'
            case "failed":
                return 'red'
            default:
                return 'grey'
        }
    }

    const getStepDot = (s) => {
        if(s.name === "assignTaxonomy" && dataset?.processingErrors?.blast?.length > 0){
            return <Tooltip placement="right" title={dataset?.processingErrors?.blast[0]}><WarningOutlined style={{ color: token.colorWarning}} /></Tooltip>
        }
        else if(s.status === "finished"){
            return <CheckCircleOutlined />
        } else if(s.status === "failed" ){
            return <ExclamationCircleOutlined /> 
        } else {
            return null
        }
    }

    return (
        <Layout>
            <PageContent>
                {error && <Alert style={{ marginBottom: "10px" }} type="error" >{error}</Alert>}
                {validationIssues?.length > 0 && <Alert style={{ marginBottom: "10px" }} message={<ul style={{ listStyle: 'none' }}>
                    {validationIssues.map(i => <li key={i}>{i}</li>)}
                </ul>} type="error" showIcon />}
                {showProcessingErrors &&
                    <Alert closable onClose={() => setShowProcessingErrors(false)}
                        style={{ marginBottom: "10px" }} type="warning" showIcon

                        message={<ul>
                            {dataset?.processingErrors?.blast?.length > 0
                                && dataset?.processingErrors?.blast.map(e => <li>{e}</li> )
                                } 

                            {dataset?.processingErrors?.consistencyCheck?.taxonIdsWithNoRecordInTaxonFile?.length > 0
                                && <li>
                                    {truncateMissingIdError`${dataset?.processingErrors?.consistencyCheck?.taxonIdsWithNoRecordInTaxonFile} in the OTU table are not present in the TAXONOMY`}
                                </li>}
                            {dataset?.processingErrors?.consistencyCheck?.taxonIdsWithNoRecordInOtuTable?.length > 0
                                && <li>
                                    {truncateMissingIdError`${dataset?.processingErrors?.consistencyCheck?.taxonIdsWithNoRecordInOtuTable} in the TAXONOMY are not present in the OTU table`}
                                </li>}
                                {dataset?.processingErrors?.consistencyCheck?.sampleIdsWithNoRecordInSampleFile?.length > 0
                                && <li>
                                    {truncateMissingIdError`${dataset?.processingErrors?.consistencyCheck?.sampleIdsWithNoRecordInSampleFile} in the OTU table are not present in the SAMPLE table`}
                                </li>}
                                {dataset?.processingErrors?.consistencyCheck?.sampleIdsWithNoRecordInOtuTable?.length > 0
                                && <li>
                                    {truncateMissingIdError`${dataset?.processingErrors?.consistencyCheck?.sampleIdsWithNoRecordInOtuTable} in the SAMPLE table are not present in the OTU table`}
                                </li>}
                        </ul>} />}
                <Row justify="space-evenly">
                    <Col span={6}>
                        <Button 
                            type="primary" 
                            style={{ marginBottom: "24px" }} 
                            onClick={() => processData(dataset?.id)} 
                            disabled={!isValidForProcessing() || (!!dataset?.steps && !(failed || finished))} 
                            loading={!!dataset?.steps && !(failed || finished)}>
                               {!!dataset?.steps && (failed || finished) ? 'Re-process data':'Process data'} 
                                </Button>
                         <>   
                            <Checkbox disabled={!showAssignTaxonomyCheckbox || (!!dataset?.steps && !(failed || finished))} style={{ marginLeft: "10px" }} checked={assignTaxonomy} onChange={(e) => setAssignTaxonomy(e?.target?.checked)}>Assign taxonomy </Checkbox>
                            <Help title="Taxonomic assigment" content={showAssignTaxonomyCheckbox ? <>
                            <p>
                            This will blast the ASVs against <strong> {`${supportedMarkers.find(m => m?.name === dataset?.mapping?.defaultValues?.target_gene?.toLowerCase())?.database}`}</strong>
                            </p>
                            <ul>
                                <li>{`If the best match based on bit score has identity >= 99, it is considered a an exact match and the scientificName field is filled`} </li>
                                <li>{`For matches with 90-99% similarity, it is considered a close match and upper ranks down to genus are filled`} </li>
                                <li>{'Only results with query coverage > 80% are considered'}</li>
                            </ul>
                           <p>
                                The taxonomic assignment process tries to match the taxon retrived from blast to the GBIF backbone taxonomy if possible. However, not all taxa in the reference databases exist in the GBIF taxonomy, and therefore some records will have taxon match issues when published to GBIF.
                           </p>
                           <p>
                                Assigning taxonomy may take a while, depending on the size of your dataset.
                           </p>
                            </> : <>
                            To assign taxonomy, you must select a defaultValue for 'target_gene' in the mapping section. We support the following options:
                            <ul>
                                {supportedMarkers.map(e => <li>{e.name} : {e.database}</li>)}
                            </ul>
                            </>}/></>

                        {dataset?.steps && dataset?.steps?.length > 0 && <Timeline
                            items={
                                dataset?.steps.map((s, idx) => ({
                                    dot:  getStepDot(s),//s.status === "finished" ? <CheckCircleOutlined /> : s.status === "failed" ? <ExclamationCircleOutlined /> : s.status === "pending" ? <ClockCircleOutlined /> : null,
                                    color: getStatusColor(s.status),
                                    children: (s.status === "finished" && idx === dataset?.steps?.length - 1) ? "Finished" :
                                        (s.status === "failed") ? `${s.messagePending} - Failed${s?.message ? ": " + s.message + ( typeof s.message === "string" && s.message?.includes('This data matrix has out of bounds value') ? ' - Check that column names in the OTU table corresponds to the IDs in the sample file.':'') : ""}` :
                                            <>
                                                {`${s.status === "processing" ? s.message : s.messagePending}${(s.subTask && idx === dataset?.steps.length - 1) ? " - " + s.subTask : ""}`}
                                                {s.status === "processing" && (!isNaN(s.total) && s.total !== 0 && s.progress) &&
                                                    <div
                                                        style={{
                                                            width: 200,
                                                        }}
                                                    >
                                                        <Progress size="small" percent={Math.round(s.progress / s.total * 100)} />
                                                    </div>}
                                            </>

                                }))
                            }
                        />}

                    </Col>

                     <Col span={6}>
                     {dataset?.filesAvailable && dataset?.filesAvailable.length > 0 &&  <FilesAvailable dataset={dataset} />}
                    </Col>
                    <Col span={6} 
                    >
                        {dataset?.summary?.sampleCount && <Title level={3}>Data collected</Title>}
 
                        {dataset?.summary?.sampleCount && metrics &&  <>{dataset?.summary &&   <Table showHeader={false} pagination={false} dataSource={[
                                ...Object.keys(dataset?.summary).filter(k => ['sampleCount', 'taxonCount'].includes(k)).map(k => ({key:k, label: _.startCase(k), value: numberFormatter.format(dataset?.summary[k])})),
                                ...Object.keys(metrics).filter(k => ['totalReads', 'singletonsTotal'].includes(k)).map(k => ({key: k, label: _.startCase(k), value:  numberFormatter.format(Math.round(metrics[k]))})),
                                ...Object.keys(metrics)
                                    .filter(k => ['otuCountPrSample', 'readSumPrSample', 'sequenceLength'].includes(k))
                                    .map(k => ({key: k, label: _.startCase(k), value: <span>{`${ numberFormatter.format(Math.round(metrics[k].mean))} (+/- ${ numberFormatter.format(Math.round(Math.round(metrics[k].stdev)*2))})`} <Help title="" content="Mean +/- stdev * 2"/></span>}))
                            ]}
                            columns={[{title: 'Label',
                            dataIndex: 'label',
                            key: 'label',
                            render: text => <span>{text}:</span>,
                            align: 'right'}, {
                                title: 'value',
                                dataIndex: 'value',
                                key: 'value'
                            }]} />}</>}


                       
                        

                    </Col>
{/*                     <Col flex="auto"></Col>
 */}                    <Col><Button type="primary" onClick={() => navigate(`/dataset/${dataset?.id}/review`)} disabled={!finished}>Proceed</Button></Col>
                </Row>

            </PageContent>
        </Layout>
    );
}

const mapContextToProps = ({ user, login, logout, dataset, setDataset, supportedMarkers }) => ({
    user,
    login,
    logout,
    dataset, setDataset, supportedMarkers
});

export default withContext(mapContextToProps)(ProcessDataset);
