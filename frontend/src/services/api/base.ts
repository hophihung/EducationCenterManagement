import axios from 'axios';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 10000,
	withCredentials: true,
});

// Thêm interceptor để xử lý lỗi
api.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error('API Error:', error);
		// Xử lý các loại lỗi khác nhau
		if (error.response) {
			// Lỗi từ server
			console.error('Server Error:', error.response.data);
		} else if (error.request) {
			// Lỗi không có response
			console.error('Network Error:', error.request);
		}
		return Promise.reject(error);
	},
);

export default api;
