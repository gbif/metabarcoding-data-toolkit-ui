import React, {useEffect,useState,  useRef, createContext} from "react";
import withContext from "./hoc/withContext";
import { notification, Modal, Button, Typography, Row, Col } from "antd";
import useTimer from "./useTimer";
import {
    getTokenUser,
    refreshLogin
  } from "../Auth/userApi";
const bufferInSeconds = 120; // Logout a couple of minutes before the token actually expires
  const {Text} = Typography
  const ReachableContext = createContext(null);

const LoginManager = ({user, logout}) => {
    const [api, contextHolder] = notification.useNotification();
    const [exp, setExp] = useState(null)
    const { seconds, start, pause, reset, running, stop } = useTimer();

    const ref = useRef()
    const expRef = useRef()
   // const secondsLeftRef = useRef()

    const openLoginWarning = () => {
        const tokenUser = getTokenUser()
      //  console.log(tokenUser)
            let secsLeft = Math.round(tokenUser.exp - new Date().valueOf() / 1000)
            start()
        if( ref?.current !== "open" && expRef.current === tokenUser.exp ){
        api.warning({
            duration: 0,
            message: 'Attention',
            description: <>
                <Text><ReachableContext.Consumer>{(secsPassed) => {
                    const remainingSeconds = secsLeft-secsPassed - bufferInSeconds;
                    const minutes = Math.floor(remainingSeconds/60)
                    const remainder = remainingSeconds%60;
                    return `You will be logged out in ${minutes}:${String(Math.round(remainder)).padStart(2, '0')} minutes due to inactivity`
                }}</ReachableContext.Consumer></Text>
                <Row><Col flex="auto"></Col><Col><Button type="primary" style={{marginTop: "8px"}} onClick={() => {
                    refreshLogin()
                   // clearInterval(countDownTimer)
                   stop()
                    api.destroy("open")
                    }}>Stay logged in</Button></Col></Row>
                
            </>,
            key: "open",
            onClose: () => {
                console.log("test")
                stop()
          }})
          ref.current = "open"
        } else {
            ref.current = null
        }
          
    }
    const checkLogin = () => {
        const tokenUser = getTokenUser()
      //  console.log(tokenUser)
        if(tokenUser){
           // secondsLeftRef.current = (tokenUser.exp - new Date().valueOf() / 1000)
            const minutesRemaing = (tokenUser.exp - new Date().valueOf() / 1000) / 60;
            expRef.current = tokenUser.exp
            
        if(minutesRemaing > (bufferInSeconds / 60) && minutesRemaing < 5 ){
            openLoginWarning()
             
        } else if(minutesRemaing < (bufferInSeconds / 60)){
            logout()
        }
      //  console.log(`Minutes remaing: ${minutesRemaing}`)
        }
        
    }
    useEffect(()=> {
        const timer = setInterval(checkLogin, 30*1000)
        return () => clearInterval(timer);
    },[])
 

 

    return <ReachableContext.Provider value={seconds}>{contextHolder}</ReachableContext.Provider>;
  
}

const mapContextToProps = ({ user, logout }) => ({
    user, logout
});

export default withContext(mapContextToProps)(LoginManager);
