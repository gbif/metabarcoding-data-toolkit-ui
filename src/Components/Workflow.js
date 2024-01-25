import { Steps } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, useMatch, useParams, matchPath } from "react-router-dom";
import withContext from "./hoc/withContext"

const Workflow = ({ dataset, format }) => {
   /*  const uploadMatch = useMatch('/dataset/:key/upload');
    const reviewMatch = useMatch('/dataset/:key/review');
    const mappingMatch = useMatch('/dataset/:key/term-mapping');
    const metadataMatch = useMatch('/dataset/:key/metadata');
    const publishMatch = useMatch('/dataset/:key/publish'); */
    let {key} = useParams();
    const [step, setStep] = useState(null)
    const location = useLocation();
    const navigate = useNavigate();
    
    const [failed, setFailed] = useState(null);
    const [finished, setFinished] = useState(null);
    const [message, setMessage] = useState(null)
    const [status, setStatus] = useState(null);
    const [percent, setPercent] = useState(null)
    useEffect(() => {
        if (location?.pathname.endsWith("dataset/new") || location?.pathname.endsWith(`/upload`)) {
            setStep(0)
        } else if (location?.pathname.endsWith("/term-mapping")) {
            setStep(1)
        } else if (location?.pathname.endsWith("/process")) {
            setStep(2)
        } else if (location?.pathname.endsWith("/review")) {
            setStep(3)
        } else if (location?.pathname.endsWith("/metadata")) {
            setStep(4)
        } else if (location?.pathname.endsWith("/publish")) {
            setStep(5)
        } else {
            setStep(null)
        }
    }, [location])

    useEffect(() => {
        try {
            if(!!dataset?.steps){
                const {steps} = dataset;
                const isFinished = !!steps && !!steps[steps.length -1].status === 'finished'  // .find(s => s.status === 'finished');
                const isFailed = !!steps && !!steps.find(s => s.status === 'failed');
                const activeSteps = (isFailed || isFinished) ? steps : steps.filter(s => s.status === 'processing')
                const currentStep = activeSteps[activeSteps.length -1];

                if(steps){
                    setMessage(activeSteps[activeSteps.length -1]?.message || null);
                }
                
                if(currentStep?.status === 'queued'){
                    setStatus('wait')
                } else if(currentStep?.status === 'processing'){
                    setStatus('process')
                } else if(currentStep?.status === 'finished'){
                    setStatus('finish')
                } else if(currentStep?.status === 'failed'){
                    setStatus('error')
                } else {
                    setStatus(null)
                }

                if(!isNaN(currentStep?.total) && Number(currentStep?.total) > 0 && !isNaN(currentStep?.progress) &&  Number(currentStep?.progress)){
                   // console.log((Number(currentStep?.progress)/Number(currentStep?.total) * 100))
                    setPercent(Number(currentStep?.progress)/Number(currentStep?.total) * 100)
                } else {
                    setPercent(null)
                }


                setFailed(isFailed)
                setFinished(isFinished)
            }
            
        } catch (error) {
            console.log("Workflow err")
            console.log(error)
        }
    }, [dataset])

    useEffect(() => {}, [message, status, percent])

    const onChange = (newStep) => {
        switch (newStep) {
            case 0:
                key ? navigate(`/dataset/${key}/upload`) : navigate(`/dataset/new`)
                break;
            case 1:
                navigate(`/dataset/${key}/term-mapping`) //navigate("/prepare")
                break;
            case 2:
                navigate(`/dataset/${key}/process`) 
                break;
            case 3:
                    navigate(`/dataset/${key}/review`)
                break;
            case 4:
                navigate(`/dataset/${key}/metadata`)
                break;
            case 5:
                navigate(`/dataset/${key}/publish`)
                break;
            default:
                break;
        }

    }

    return step !== null ? <Steps onChange={onChange} current={step} percent={step === 2 ? (percent || "") : ""}
        items={[
            {
                title: 'Upload data',
            },
            {
                title: 'Map terms',
                disabled: !dataset?.files?.format || dataset?.files?.format === 'INVALID'
            },
            {
                title: 'Process data',
                status: status,
               // description: message,
                percent: percent ,
                disabled: !dataset?.files?.format || dataset?.files?.format === 'INVALID'

            },
            {
                title: 'Review',
                disabled: !dataset?.filesAvailable?.find(f => f.format === 'BIOM 1.0')
            },
            {
                title: dataset?.metadata ? 'Edit metadata' : 'Add metadata',
                disabled: !dataset
            },
            {
                title: 'Publish',
                disabled: !(dataset?.metadata && dataset?.filesAvailable?.find(f => f.format === 'BIOM 1.0'))
            },
        ]}
    />
        : null

}

const mapContextToProps = ({ user, login, logout, dataset, format}) => ({
    user,
    login,
    logout,
    dataset,
    format
  });
  
export default withContext(mapContextToProps)(Workflow);
