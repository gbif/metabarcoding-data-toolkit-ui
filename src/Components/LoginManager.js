import React, {useEffect,  useRef} from "react";
import withContext from "./hoc/withContext";
import { notification, Button, Typography, Row, Col } from "antd";
import {
    getTokenUser,
    refreshLogin,
  } from "../Auth/userApi";

  const {Text} = Typography

const LoginManager = ({user}) => {
    const [api, contextHolder] = notification.useNotification();
    const ref = useRef()
    const checkLogin = () => {
        const tokenUser = getTokenUser()
      //  console.log(tokenUser)
        if(tokenUser){
            const minutesRemaing = (tokenUser.exp - new Date().valueOf() / 1000) / 60;

        if(minutesRemaing < 5 && ref?.current !== "open"){
            api.warning({
                duration: 0,
                message: 'Attention',
                description: <>
                    <Text>You will be logged out in 5 minutues due to inactivity</Text>
                    <Row><Col flex="auto"></Col><Col><Button type="primary" style={{marginTop: "8px"}} onClick={() => {
                        refreshLogin()
                        api.destroy("open")
                        }}>Stay logged in</Button></Col></Row>
                    
                </>,
                key: "open",
                onClose: () => {
                    console.log("test")
                    ref.current = null
              }})
              ref.current = "open"
        }
        console.log(`Minutes remaing: ${minutesRemaing}`)
        }
        
    }
    useEffect(()=> {
        const timer = setInterval(checkLogin, 30*1000)
        return () => clearInterval(timer);
    },[])
 

 

    return <>{contextHolder}</>;
  
}

const mapContextToProps = ({ user }) => ({
    user
});

export default withContext(mapContextToProps)(LoginManager);
