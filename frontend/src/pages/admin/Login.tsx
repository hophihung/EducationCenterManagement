import { Button, Form, Input, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminLayout from '@/layouts/admin';
import { getAdminByUsername } from '@/services/api/admin';
import { fetchLogin } from '@/services/api/auth';

const { Text, Title } = Typography;

interface LoginFormValues {
	username: string;
	password: string;
}

const AdminLogin: React.FC = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const token = localStorage.getItem('accessToken');
		if (token && token !== 'undefined') {
			navigate('/admin/dashboard');
		}
	}, [navigate]);

	const onFinish = async (values: LoginFormValues) => {
		setLoading(true);
		try {
			const { accessToken } = await fetchLogin(values);
			localStorage.setItem('accessToken', accessToken);
			const adminDetails = await getAdminByUsername(values.username);
			localStorage.setItem('adminFullName', adminDetails.fullName);
			navigate('/admin/dashboard');
		} catch (error: unknown) {
			let errorMessage = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';

			if (typeof error === 'object' && error !== null && 'response' in error) {
				const err = error as {
					response: { status: number; data?: { message?: string } };
				};
				const { status, data } = err.response;
				switch (status) {
					case 404:
						errorMessage = `Không tìm thấy tài khoản quản trị viên "${values.username}".`;
						break;
					case 401:
						errorMessage = 'Mật khẩu bạn đã nhập không chính xác.';
						break;
					default:
						errorMessage = data?.message
							? `Lỗi: ${data.message}`
							: errorMessage;
						break;
				}
			}

			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AdminLayout showSidebar={false}>
			<div 
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					backgroundColor: 'white', // Changed to white
					padding: '20px'
				}}
			>
				<div 
					style={{
						backgroundColor: 'white',
						borderRadius: '26px',
						border:'4px solid black',
						boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
						width: '100%',
						maxWidth: '400px',
						padding: '50px'
					}}
				>
					<div style={{ textAlign: 'center', marginBottom: '24px' }}>
						
						<Title 
							level={3} 
							style={{ 
								margin: 0, 
								marginBottom: '8px',
								color: '#333'
							}}
						>
							Sign In
						</Title>
						<Text 
							type="secondary" 
							style={{ 
								fontSize: '14px',
								color: '#6c757d' 
							}}
						>					</Text>
					</div>
					<Form 
						name="login" 
						onFinish={onFinish} 
						layout="vertical"
					>
						<Form.Item
							name="username"
							label="Tên đăng nhập"
							rules={[
								{ required: true, message: 'Vui lòng nhập tên đăng nhập!' },
							]}
						>
							<Input 
								placeholder="Nhập tên đăng nhập" 
								size="large"
								style={{
									borderRadius: '8px'
								}}
							>
								Lang La Academy
							</Title>
						</div>
						<Title
							level={2}
							style={{ textAlign: 'center', marginBottom: '8px' }}

						>
							<Input.Password 
								placeholder="Nhập mật khẩu" 
								size="large"
								style={{
									borderRadius: '8px'
								}}
							/>
						</Form.Item>

						{error && (
							<div 
								style={{
									backgroundColor: '#fff5f5',
									color: '#c92a2a',
									padding: '10px 15px',
									borderRadius: '8px',
									marginBottom: '16px',
									border: '1px solid #ffc9c9'
								}}
							>
								{error}
							</div>
						)}

						<Form.Item>
							<Button
								type="primary"
								htmlType="submit"
								loading={loading}
								block
								style={{
									height: '48px',
									borderRadius: '8px',
									backgroundColor: '#2c3e50',
									borderColor: '#2c3e50',
									fontSize: '16px',
									fontWeight: 'bold'
								}}
							>
								<Input.Password placeholder="Nhập mật khẩu" />
							</Form.Item>
							<Form.Item>
								<Button
									type="primary"
									htmlType="submit"
									loading={loading}
									block
									style={{
										marginTop: '8px',
										backgroundColor: '#49BBBD',
										
									}}
								>
									Đăng Nhập
								</Button>
							</Form.Item>
						</Form>
					</div>
					{error && (
						<Modal
							title="Đăng nhập thất bại"
							visible={!!error}
							onCancel={handleCloseError}
							footer={[
								<Button
									key="ok"
									onClick={handleCloseError}
									style={{
										backgroundColor: 'black',
										borderColor: 'black',
										color: 'white',
									}}
								>
									OK
								</Button>,
							]}
						>
							<p>{error}</p>
						</Modal>
					)}
				</Col>
			</Row>

		</AdminLayout>
	);
};

export default AdminLogin;