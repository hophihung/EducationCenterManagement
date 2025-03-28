import { Affix, Layout, Typography } from 'antd';
import React from 'react';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

interface HeaderProps {
	leftComponent?: React.ReactNode;
	rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ leftComponent, rightComponent }) => {
	return (
		<Affix offsetTop={0}>
			<AntHeader className="site-layout-background">
				<div className="left-component">{leftComponent}</div>
				<div className="center-title">
					<a href="/">
						<Title level={3} className="title">
							📜𝓛𝓪𝓷𝓰 𝓛𝓪 𝓐𝓬𝓪𝓭𝓮𝓶𝔂 🖋️
						</Title>
					</a>
				</div>
				<div className="right-component">{rightComponent}</div>
			</AntHeader>
		</Affix>
	);
};

export default Header;
