import React from 'react';

const PageContent = ({children, style = {}}) => <div style={{ background: '#fff', padding: 24, minHeight: 480, margin: '16px 0' , ...style}}>{children}</div>
export default PageContent