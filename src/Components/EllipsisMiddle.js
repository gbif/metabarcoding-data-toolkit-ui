import React from 'react';
import { Typography } from 'antd';
const { Text } = Typography;

const EllipsisMiddle = ({ suffixCount, children }) => {
    const start = children.slice(0, children.length - suffixCount);
    const suffix = children.slice(-suffixCount).trim();
    return (
      <Text
        /* style={{
          maxWidth: '100%',
        }} */
        ellipsis={{
          suffix,
        }}
      >
        {start}
      </Text>
    );
  };

  export default EllipsisMiddle;