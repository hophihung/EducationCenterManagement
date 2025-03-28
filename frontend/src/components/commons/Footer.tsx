import { Layout, Typography } from 'antd';
import React from 'react';

const { Footer: AntFooter } = Layout;
const { Title } = Typography;

const Footer: React.FC = () => {
	return (
		<AntFooter
			style={{
				textAlign: 'center',
				backgroundColor: '#001529',
				padding: 30,
				boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
				width: '100%',
				bottom: 0,
				left: 0,
				zIndex: 1,
			}}
		>
			<Title level={5} style={{ margin: '10px 0 0 0' ,color: 'white'}}>
				Copyright © LangLA_Academy 2024
			</Title>
		</AntFooter>
	);
};

export default Footer;