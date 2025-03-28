import { Button, Form, Input, Modal, message } from 'antd';
import type { ModalProps } from 'antd';
import { useState } from 'react';

interface LoginFormValues {
	username: string;
	password: string;
}

const ButtonLogin: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm<LoginFormValues>();
	const [loading, setLoading] = useState(false);

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleOk = async () => {
		try {
			setLoading(true);
			const values = await form.validateFields();
			await loginUser(values);
			setIsModalOpen(false);
			form.resetFields();
			message.success('Đăng nhập thành công!');
		} catch (error) {
			message.error('Đăng nhập thất bại!');
			console.error('Login failed:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setIsModalOpen(false);
		form.resetFields();
	};

	const modalProps: ModalProps = {
		title: 'Đăng nhập',
		open: isModalOpen,
		onOk: handleOk,
		onCancel: handleCancel,
		destroyOnClose: true,
		maskClosable: false,
		confirmLoading: loading,
		okText: 'Đăng nhập',
		cancelText: 'Hủy',
		width: 400,
		centered: true,
	};

	const loginUser = async ({ username, password }: LoginFormValues) => {
		return new Promise<void>((resolve, reject) => {
			setTimeout(() => {
				if (username && password) {
					console.log('Login values:', { username, password });
					resolve();
				} else {
					reject(new Error('Thông tin đăng nhập không hợp lệ'));
				}
			}, 1000);
		});
	};

	return (
		<>
<!-- <<<<<<< hienupdate -->
			<Button type="primary" onClick={showModal} >

				Đăng nhập
			</Button>
			<Button
				type="primary"
				style={{ marginTop: '16px', backgroundColor: '#49BBBD' }}
				onClick={showModal}
			>
				Đăng Nhập
			</Button>

			<Modal {...modalProps}>
				<Form
					form={form}
					layout="vertical"
					autoComplete="off"
					initialValues={{ username: '', password: '' }}
				>
					<Form.Item
						name="username"
						label="Tên đăng nhập"
						rules={[
							{ required: true, message: 'Vui lòng nhập tên đăng nhập!' },
							{ min: 3, message: 'Tên đăng nhập phải dài ít nhất 3 ký tự' },
						]}
					>
						<Input placeholder="Nhập tên đăng nhập" style={{ borderRadius: '5px' }} />
					</Form.Item>

					<Form.Item
						name="password"
						label="Mật khẩu"
						rules={[
							{ required: true, message: 'Vui lòng nhập mật khẩu!' },
							{ min: 6, message: 'Mật khẩu phải dài ít nhất 6 ký tự' },
						]}
					>
						<Input.Password placeholder="Nhập mật khẩu" style={{ borderRadius: '5px' }} />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default ButtonLogin;