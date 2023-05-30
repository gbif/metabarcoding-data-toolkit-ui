import { Select, Typography , Space, Button} from 'antd';
import { useState } from 'react';
import linkifyHtml from 'linkify-html';
const { Text } = Typography;

const DwcTermSelect = ({ dwcTerms, onSelect, placeholder, style }) => {
    const [selected, setSelected] = useState(null)
   
    return <div style={style || {width: "500px"}}><Space.Compact
    style={{
      width: '100%',
    }}
  >
  <Select
  showSearch
  style={{
    width: '100%',
  }}
  placeholder={placeholder || "Search to Select"}
  optionFilterProp="children"
  allowClear
  onClear={() => setSelected(null)}
  filterOption={(input, option) => (option?.value ?? '').includes(input)}
  filterSort={(optionA, optionB) =>
      (optionA?.value ?? '').toLowerCase().localeCompare((optionB?.value ?? '').toLowerCase())
  }
  value={selected?.value}
  onSelect={(val, opt) => setSelected(opt)}
  options={
      Object.keys(dwcTerms).map(k => (
          {
              value: k, description: dwcTerms[k]?.['dc:description'],
              label: k
          }))}
/>
    <Button disabled={!selected} onClick={() => {
        if(typeof onSelect === 'function'){
            onSelect(selected?.value)
            setSelected(null)
        }
    }} type="primary">Add field</Button>
  </Space.Compact>
   {selected && <div style={{marginLeft: "8px", marginTop: "8px"}}><Text strong>Description: </Text><Text style={{
    width: '100%',
  }}>{ <span dangerouslySetInnerHTML={{ __html: linkifyHtml(selected?.description || "") }}></span>}</Text></div>}
  </div>
    
};
export default DwcTermSelect;