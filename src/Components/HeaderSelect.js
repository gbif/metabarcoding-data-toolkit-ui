import { useState, useEffect } from "react";
import {Form, Space, Typography, Select, theme} from "antd"

const {Text, Divider, Link} = Typography;

const HeaderSelect = ({ headers, style = {width: 300}, onChange, term }) => {
    const [matchedHeaders, setMatchedHeaders] = useState([])
    const [value, setValue] = useState(null)
    useEffect(() => {
        if(term?.synonyms){
            setMatchedHeaders(headers.filter(s =>  term?.synonyms.indexOf(s.toLowerCase()) > -1 ))
        }
        const matchedTerm = headers.find(matchTerm)
        if(matchTerm){
            setValue(matchedTerm)
            if(typeof onChange === 'function'){
                onChange(matchedTerm)
            }
        }
       
    }, [headers, term])

    useEffect(() => {
        if(typeof onChange === 'function'){
            onChange(value)
        }
    }, [value])
    const matchTerm = (header) => {
        return header.toLowerCase() === term?.name?.toLowerCase()
    }
    
   return <><Select style={style} value={value} onChange={val => {
    setValue(val)
   }}>
            {headers?.map(h => <Select.Option key={h} value={h}>{h}</Select.Option>)}
        </Select>
         {matchedHeaders.length > 0 && <><br/> <Text type="secondary">Use </Text> <Space split={<Divider type="vertical" />}>{matchedHeaders.map(h => <Link onClick={() => setValue(h)}>{h}</Link>)}</Space></>}
         </>
       
}

export default HeaderSelect