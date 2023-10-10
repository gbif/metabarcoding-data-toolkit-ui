import React, { useState, useEffect, useRef, createContext, useContext } from "react";
//import injectSheet from "react-jss";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined, BarsOutlined } from "@ant-design/icons";
import { Menu, Dropdown, Avatar, Modal, Button, theme } from "antd";
import hashCode from "../Util/hashCode"
import withContext from "../Components/hoc/withContext";
import LoginForm from "./LoginForm"
import {refreshLogin} from './userApi'
const { useToken } = theme;
 

/* const hashCode = function (str) {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}; */

const styles = {
  avatar: {
    "& img": {
      imageRendering: "crisp-edges",
      fallbacks: {
        imageRendering: "pixelated",
      },
    },
  },
};


const MenuContent = ({logout}) => {

  const navigate = useNavigate()

  return <Menu selectedKeys={[]}>
  <Menu.Item
    key="logout"
    onClick={() => {
      logout();
      window.location.reload();
    }}
  >
    <LogoutOutlined /> Logout
  </Menu.Item>
  <Menu.Item
    key="user-profile"
    onClick={() => navigate('/user-profile')}
  >
    <BarsOutlined /> Datasets
  </Menu.Item>
</Menu>
} 

const UserMenu = ({login, user, logout, setUser, loginFormVisible, setLoginFormVisible}) => {
  
  const [visible, setVisible] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const { token } = useToken();
  let refreshUserHdl = useRef();

  useEffect(()=>{
    if (user) {
      const imgNr = Math.abs(hashCode(user.userName)) % 10;
      setCurrentUser({
        name: user.userName,
        avatar: `/_palettes/${imgNr}.png`,
      });
      refreshUserHdl.current = setInterval(
        () => {
          refreshLogin()
            .then(usr => setUser(usr))
            .catch(err => {
              console.log(err)
              setUser(null)
            })
        }
        ,  900000 );
    } else {
      if (refreshUserHdl.current) {
        clearInterval(refreshUserHdl.current);
    }
    }

   
    return () => {
      if (refreshUserHdl.current) {
        clearInterval(refreshUserHdl.current);
    }
    };
  }, [user])
  const showLogin = () => {
    setLoginFormVisible(true)
    
  };
  

  const handleLogin = (values) => {
    login(values)
      .then((user)=>{
        setInvalid(false)
        setLoginFormVisible(false)
      })
      .catch((err) => {
        setInvalid(err.message)

      });
  };

  const handleCancel = () => {
    setInvalid(false)
    setLoginFormVisible(false)
  };

    



    return (
      <React.Fragment>
        {!user && (
          <span style={{ padding: "0 10px" }}>
            <Button type="link"  onClick={showLogin}>
            <span style={{ color: "white" }}> Login</span>
            </Button>
          </span>
        )}
        {user && (
          <Dropdown overlay={<MenuContent logout={logout}/>} trigger={["click"]}>
            <span style={{ padding: "0 10px", cursor: "pointer" }}>
              <Avatar
                style={{ marginRight: 8 }}
                size="small"
               // className={classes.avatar}
                src={currentUser?.avatar}
                alt="avatar"
              />
              <span style={{color: token.colorWhite}}>{currentUser?.name}</span>
            </span>
          </Dropdown>
        )}
        
        <Modal
          title="Login with your GBIF-UAT account"
          open={loginFormVisible}
          onOk={handleLogin}
          onCancel={handleCancel}
          footer={null}
          destroyOnClose={true}
        >
          <div /* className={classes.background} */>
            
            {<LoginForm
              invalid={invalid}
              onLogin={handleLogin}
            />}
          </div>
        </Modal>
      </React.Fragment>
    );
  
}

const mapContextToProps = ({ user, login, logout, setUser, loginFormVisible, setLoginFormVisible}) => ({
  user,
  login,
  logout,
  setUser,loginFormVisible, setLoginFormVisible
});

export default withContext(mapContextToProps)(UserMenu);
