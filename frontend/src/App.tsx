import { Spin } from 'antd';
import React, { Suspense, lazy } from 'react';
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from 'react-router-dom';

import ProtectedRoute from '@/components/commons/ProtectedRoute';

// Admin lazy load
const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const AdminChangePassword = lazy(() => import('@/pages/admin/ChangePassword'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminCentersManagement = lazy(
	() => import('@/pages/admin/CentersManagement'),
);
const TeacherDetail = lazy(() => import('@/pages/admin/TeacherDetail'));
const AdminCoursesManagement = lazy(
	() => import('@/pages/admin/CoursesManagement'),
);
const AdminVouchersManagement = lazy(
	() => import('@/pages/admin/VouchersManagement'),
);
const AdminSchedulesManagement = lazy(
	() => import('@/pages/admin/SchedulesManagement'),
);
const AdminCenterCreate = lazy(() => import('@/pages/admin/CenterCreate'));
const AdminCourseCreate = lazy(() => import('@/pages/admin/CourseCreate'));
const AdminVoucherCreate = lazy(() => import('@/pages/admin/VoucherCreate'));
const ClassCreate = lazy(() => import('@/pages/admin/ClassCreate'));
const TeacherCreate = lazy(() => import('@/pages/admin/TeacherCreate'));
const AddCourse = lazy(() => import('@/pages/admin/AddCourse'));
const AddVoucher = lazy(() => import('@/pages/admin/AddVoucher'));
const AdminCenterEdit = lazy(() => import('@/pages/admin/CenterEdit'));
const AdminCourseEdit = lazy(() => import('@/pages/admin/CourseEdit'));
const AdminVoucherEdit = lazy(() => import('@/pages/admin/VoucherEdit'));
const CenterDetail = lazy(() => import('@/pages/admin/CenterDetail'));
const CourseDetailOfCenter = lazy(
	() => import('@/pages/admin/CourseDetailOfCenter'),
);
const VoucherDetailOfCenter = lazy(
	() => import('@/pages/admin/VoucherDetailOfCenter'),
);
const CourseDetail = lazy(() => import('@/pages/admin/CourseDetail'));
const VoucherDetail = lazy(() => import('@/pages/admin/VoucherDetail'));
const ListCoursesOfCenter = lazy(
	() => import('@/pages/admin/ListCoursesOfCenter'),
);
const ListVouchersOfCenter = lazy(
	() => import('@/pages/admin/ListVouchersOfCenter'),
);
const ListTeacherOfCenter = lazy(
	() => import('@/pages/admin/ListTeacherOfCenter'),
);
const ClassDetailForAdmin = lazy(() => import('@/pages/admin/ClassDetail'));
const ListClass = lazy(() => import('@/pages/admin/ListClass'));
const AdminSalariesManagement = lazy(
	() => import('@/pages/admin/SalariesManagement'),
);
const AdminSalariesCreate = lazy(() => import('@/pages/admin/SalariesCreate'));

// Teacher lazy load
const LoginTeacher = lazy(() => import('@/pages/teacher/Login'));
const ClassesPage = lazy(() => import('@/pages/teacher/Classes'));
const ClassDetail = lazy(() => import('@/pages/teacher/ClassDetail'));
const StudentDetail = lazy(() => import('@/pages/teacher/StudentDetail'));
const TeacherProfile = lazy(() => import('@/pages/teacher/Profile'));
const EditTeacherProfile = lazy(() => import('@/pages/teacher/EditProfile'));
const ChangePasswordPage = lazy(() => import('@/pages/teacher/ChangePassword'));
const CheckAttendancesPage = lazy(
	() => import('@/pages/teacher/CheckAttendances'),
);
const TeacherSchedule = lazy(() => import('@/pages/teacher/ScheduleView'));
const ListSalariesPage = lazy(() => import('@/pages/teacher/ListSalaries'));

// Student lazy load
const HomepageStudent = lazy(() => import('@/pages/student/Homepage'));
const StudentProfile = lazy(() => import('@/pages/student/Profile'));
const EditProfileStudent = lazy(() => import('@/pages/student/EditProfile'));
const StudentClassList = lazy(() => import('@/pages/student/ClassList'));
const StudentCourseDetail = lazy(() => import('@/pages/student/CourseDetail'));
const AttendencesReport = lazy(
	() => import('@/pages/student/AttendencesReport'),
);
const PaymentHistory = lazy(() => import('@/pages/student/PaymentHistory'));

const PaymentDetail = lazy(() => import('@/pages/student/PaymentDetail'));
const ScheduleView = lazy(() => import('@/pages/student/ScheduleView'));
const StudentRegisterPage = lazy(
	() => import('@/pages/student/StudentRegisterPage'),
);

const App: React.FC = () => {
	React.useEffect(() => {
		const style = document.createElement('style');
		style.textContent = `
			div[style*="z-index: 999999999"] {
				display: none !important;
			}
		`;
		document.head.appendChild(style);
		return () => {
			document.head.removeChild(style);
		};
	}, []);

	return (
		<Router>
			<Suspense
				fallback={
					<div>
						<Spin size="large" /> Đang tải...
					</div>
				}
			>
				<Routes>
					{/* Admin Routes */}
					<Route path="/admin/login" element={<AdminLogin />} />
					<Route
						path="admin/change-password"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminChangePassword />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/dashboard"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminDashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminCentersManagement />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/:id"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<CenterDetail />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/:id/courses"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<ListCoursesOfCenter />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/:centerID/courses/create"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AddCourse />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/:id/vouchers"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<ListVouchersOfCenter />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/:centerID/vouchers/create"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AddVoucher />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/:centerID/teachers"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<ListTeacherOfCenter />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/:centerID/classes"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<ListClass />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/teachers/:teacherID"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<TeacherDetail />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/:centerID/teachers/create"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<TeacherCreate />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/classes/:classID"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<ClassDetailForAdmin />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/:centerID/classes/create"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<ClassCreate />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/courses"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminCoursesManagement />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/courses/:id"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<CourseDetailOfCenter />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/courses/:id"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<CourseDetail />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/courses/create"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminCourseCreate />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/courses/edit/:id"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminCourseEdit />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/vouchers"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminVouchersManagement />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/vouchers/:id"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<VoucherDetailOfCenter />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/vouchers/:id"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<VoucherDetail />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/vouchers/create"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminVoucherCreate />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/vouchers/:id/edit"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminVoucherEdit />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/create"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminCenterCreate />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/centers/edit/:id"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminCenterEdit />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin"
						element={<Navigate replace to="/admin/dashboard" />}
					/>
					<Route
						path="/admin/schedules"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminSchedulesManagement />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/salaries"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminSalariesManagement />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/salaries/calculate"
						element={
							<ProtectedRoute
								redirectPath="/admin/login"
								tokenName="accessToken"
							>
								<AdminSalariesCreate />
							</ProtectedRoute>
						}
					/>

					{/* Teacher Routes */}
					<Route path="/teacher/login" element={<LoginTeacher />} />
					<Route path="/teacher/classes" element={<ClassesPage />} />
					<Route path="/teacher/classes/:id" element={<ClassDetail />} />
					<Route
						path="/teacher/classes/student/:studentID"
						element={<StudentDetail />}
					/>
					<Route
						path="/teacher"
						element={<Navigate to="/teacher/classes" replace />}
					/>
					<Route
						path="/teacher/profile"
						element={
							<ProtectedRoute redirectPath="/teacher" tokenName="teacherToken">
								<TeacherProfile />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/teacher/profile/edit"
						element={
							<ProtectedRoute redirectPath="/teacher" tokenName="teacherToken">
								<EditTeacherProfile />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/teacher/change-password/"
						element={
							<ProtectedRoute redirectPath="/teacher" tokenName="teacherToken">
								<ChangePasswordPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/teacher/attendance/:slotId"
						element={
							<ProtectedRoute redirectPath="/teacher" tokenName="teacherToken">
								<CheckAttendancesPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/teacher/salaries/"
						element={
							<ProtectedRoute redirectPath="/teacher" tokenName="teacherToken">
								<ListSalariesPage />
							</ProtectedRoute>
						}
					/>
					<Route path="/teacher/schedule" element={<TeacherSchedule />} />

					{/* Student Routes */}
					<Route index element={<Navigate to="/student" replace />} />
					<Route path="/student" element={<HomepageStudent />} />
					<Route path="/student/login" element={<HomepageStudent />} />
					<Route
						path="/student/courses/:courseID/:centerID"
						element={<StudentCourseDetail />}
					/>
					<Route
						path="/student/profile"
						element={
							<ProtectedRoute redirectPath="/student" tokenName="token">
								<StudentProfile />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/student/profile/edit"
						element={
							<ProtectedRoute redirectPath="/student" tokenName="token">
								<EditProfileStudent />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/student/classes"
						element={
							<ProtectedRoute redirectPath="/student" tokenName="token">
								<StudentClassList />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/student/classes"
						element={
							<ProtectedRoute redirectPath="/student" tokenName="token">
								<StudentClassList />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/student/classes/:classID"
						element={
							<ProtectedRoute redirectPath="/student" tokenName="token">
								<AttendencesReport />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/student/payment-history"
						element={
							<ProtectedRoute redirectPath="/student" tokenName="token">
								<PaymentHistory />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/student/payment-history/:id"
						element={
							<ProtectedRoute redirectPath="/student" tokenName="token">
								<PaymentDetail />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/student/schedule"
						element={
							<ProtectedRoute redirectPath="/student" tokenName="token">
								<ScheduleView />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/student/payment/:courseID/:centerID"
						element={
							<ProtectedRoute redirectPath="/student" tokenName="token">
								<StudentRegisterPage />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</Suspense>
		</Router>
	);
};

export default App;
