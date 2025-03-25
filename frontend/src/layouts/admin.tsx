import { FloatButton, Layout } from 'antd';
import React, { ReactNode, memo } from 'react';

import AdminHeader from '@/components/admin/AdminHeader';
import Sidebar from '@/components/admin/Sidebar';
import Footer from '@/components/commons/Footer';

const { Content } = Layout;

interface AdminLayoutProps {
	children: ReactNode;
	showSidebar?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = memo(
	({ children, showSidebar = true }) => {
		const contentStyle = {
			marginLeft: showSidebar ? 0 : undefined,
			padding: 24,
			minHeight: 280,
			background: '#fff',
		};

		return (
			<Layout style={{ minHeight: '100vh', position: 'relative' }}>
				<AdminHeader />
				<Layout hasSider={showSidebar}>
					{showSidebar && <Sidebar />}
					<Layout>
						<Content style={contentStyle}>{children}</Content>
					</Layout>
				</Layout>
				<Footer />
				<FloatButton.BackTop />
			</Layout>
		);
	},
);

AdminLayout.displayName = 'AdminLayout';

export default AdminLayout;
