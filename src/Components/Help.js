
import { Popover} from "antd"
import {
    InfoCircleOutlined,
    
} from '@ant-design/icons';

const Help = ({placement="rightTop", style= {}, title= "Help", content=""}) => {

   return <Popover placement={placement} trigger="click" title={title} content={<div style={{maxWidth: "600px"}}>{content}</div>}>
                <InfoCircleOutlined style={{cursor: "pointer", ...style}} /> </Popover>

}

export default Help;