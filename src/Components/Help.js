
import { Popover} from "antd"
import {
    InfoCircleOutlined,
    
} from '@ant-design/icons';

const Help = ({placement="rightTop", style= {}, title= "Help", content="", trigger="click"}) => {

   return <Popover placement={placement} trigger={trigger} title={title} content={<div style={{maxWidth: "600px"}}>{content}</div>}>
                <InfoCircleOutlined style={{cursor: "pointer", ...style}} /> </Popover>

}

export default Help;