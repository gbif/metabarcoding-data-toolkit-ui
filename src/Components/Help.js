
import { Popover} from "antd"
import {
    InfoCircleOutlined,
    
} from '@ant-design/icons';

const Help = ({placement="rightTop", style= {}, title= "Help", content=""}) => {

   return <Popover placement={placement} trigger="click" title={title} content={content}>
                <InfoCircleOutlined style={style} /> </Popover>

}

export default Help;