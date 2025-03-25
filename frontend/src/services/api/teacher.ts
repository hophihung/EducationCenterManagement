import { message } from 'antd';
import axios, { AxiosError } from 'axios';

import { Slot } from '@/schemas/slot.schema';
import { Teacher } from '@/schemas/teacher.schema';
import { apiBaseUrl } from '@/utils/apiBase';

// Hàm helper để log lỗi chi tiết
const logError = (operation: string, error: unknown) => {
	if (error instanceof AxiosError) {
		console.error(`${operation} failed:`, {
			status: error.response?.status,
			data: error.response?.data,
			message: error.message,
		});
	} else {
		console.error(`${operation} failed:`, error);
	}
};

export const getAllTeacher = async (): Promise<Teacher[]> => {
	try {
		const token = localStorage.getItem('accessToken');
		const response = await axios.get(`${apiBaseUrl}/api/teachers`, {
			timeout: 10000,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`, // Thêm token nếu API yêu cầu xác thực
			},
			validateStatus: (status) => {
				return status < 500; // Chấp nhận status code < 500
			},
		});

		if (response.status === 401) {
			message.error('Phiên làm việc đã hết hạn, vui lòng đăng nhập lại');
			// Có thể redirect tới trang login ở đây
			return [];
		}

		if (!response.data || response.status !== 200) {
			console.warn('Invalid teacher data received:', response.status);
			return [];
		}

		return response.data;
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.code === 'ECONNABORTED') {
				message.error('Kết nối tới server quá chậm, vui lòng thử lại sau');
			} else if (!error.response) {
				message.error('Không thể kết nối tới server');
			}
		}
		logError('Fetching all teachers', error);
		return [];
	}
};

export const getTeacherById = async (id: string): Promise<Teacher> => {
	try {
		const response = await axios.get(`${apiBaseUrl}/api/teachers/${id}`);
		return response.data;
	} catch (error) {
		logError('Fetching teacher by ID', error);
		throw new Error(`Không thể lấy thông tin giáo viên với ID: ${id}`);
	}
};

export const getTeacherByEmail = async (email: string): Promise<Teacher> => {
	try {
		const response = await axios.get(
			`${apiBaseUrl}/api/teachers/email/${email}`,
		);
		return response.data;
	} catch (error) {
		logError('Fetching teacher by email', error);
		throw new Error(`Không thể lấy thông tin giáo viên với email: ${email}`);
	}
};

export const deleteTeacher = async (id: string): Promise<void> => {
	try {
		await axios.delete(`${apiBaseUrl}/api/teachers/${id}`);
		console.log(`Teacher with ID ${id} deleted successfully`);
	} catch (error) {
		logError('Deleting teacher', error);
		throw new Error(`Không thể xóa giáo viên với ID: ${id}`);
	}
};

export const getTeacherBySlotId = async (slotId: string): Promise<Teacher> => {
	try {
		const response = await axios.get(`${apiBaseUrl}/api/slots/${slotId}`);
		const slot: Slot = response.data;
		return getTeacherById(slot.class.teacher.toString());
	} catch (error) {
		logError('Fetching teacher by slot ID', error);
		throw new Error(`Không thể lấy thông tin giáo viên với slot ID: ${slotId}`);
	}
};

export const updateTeacher = async (
	id: string,
	updateData: Partial<Teacher>,
): Promise<Teacher> => {
	try {
		const response = await axios.put(
			`${apiBaseUrl}/api/teachers/${id}`,
			updateData,
		);
		console.log(`Teacher with ID ${id} updated successfully`);
		return response.data;
	} catch (error) {
		logError('Updating teacher', error);
		throw new Error(`Không thể cập nhật giáo viên với ID: ${id}`);
	}
};

export const changeTeacherPassword = async (
	email: string,
	currentPassword: string,
	newPassword: string,
): Promise<void> => {
	try {
		const url = `${apiBaseUrl}/api/teachers/${encodeURIComponent(email)}/change-password`;
		const requestBody = { currentPassword, newPassword };
		await axios.put(url, requestBody);
		console.log(`Password changed successfully for email: ${email}`);
	} catch (error) {
		logError('Changing teacher password', error);
		throw new Error(`Không thể đổi mật khẩu cho giáo viên với email: ${email}`);
	}
};
