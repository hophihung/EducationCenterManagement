import { Col, Row, Spin, Alert } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import FormUpdate from '@/components/teacher/FormUpdateProfile';
import TeacherLayout from '@/layouts/teacher';
import {
	selectEmail,
	selectToken,
	setAvatar,
	setFullName,
} from '@/slices/teacher';
import { apiBaseUrl } from '@/utils/apiBase';

const EditProfileTeacher: React.FC = () => {
	const email = useSelector(selectEmail);
	const token = useSelector(selectToken);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		if (!token) {
			navigate('../teacher/login');
		}

		const fetchTeacherData = async () => {
			try {
				const response = await axios.get(
					`${apiBaseUrl}/api/teachers/email/${email}`,
				);
				if (response.data.avatar && response.data.fullName) {
					dispatch(setAvatar(response.data.avatar));
					dispatch(setFullName(response.data.fullName));
				}
			} catch (err) {
				setError('Failed to load teacher data. Please try again later.');
				console.error('Failed to load teacher data:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchTeacherData();
	}, [token, email, dispatch, navigate]);

	if (loading) {
		return (
			<TeacherLayout>
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '100vh',
					}}
				>
					<Spin size="large" />
				</div>
			</TeacherLayout>
		);
	}

	if (error) {
		return (
			<TeacherLayout>
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '100vh',
					}}
				>
					<Alert message={error} type="error" showIcon />
				</div>
			</TeacherLayout>
		);
	}

	return (
		<TeacherLayout>
			<Row style={{ padding: '20px' }}>
				<Col span={24}>
					<FormUpdate />
				</Col>
			</Row>
		</TeacherLayout>
	);
};

export default EditProfileTeacher;
