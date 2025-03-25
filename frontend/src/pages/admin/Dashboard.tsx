// Cập nhật Dashboard component
import { Column, Pie } from '@ant-design/plots';
import { Button, Card, Col, Row, Spin, message } from 'antd';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import AdminLayout from '@/layouts/admin';
import { getAllCenter } from '@/services/api/center';
import { getAllCourse } from '@/services/api/course';
import { getAllStudent } from '@/services/api/student';
import { getAllTeacher } from '@/services/api/teacher';
import { getAllVoucher } from '@/services/api/voucher';

// Thêm interfaces ở đầu file
interface ChartDatum {
	type: string;
	value: number;
}

interface PieChartDatum extends ChartDatum {
	percent?: number;
}

interface ChartErrorFallbackProps {
	error: Error;
	resetErrorBoundary: () => void;
}

// Custom loading component
const ChartLoading = () => (
	<div
		style={{
			height: 300,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		}}
	>
		<Spin size="large" />
	</div>
);

// Custom error fallback component
const ChartErrorFallback: React.FC<ChartErrorFallbackProps> = ({
	error,
	resetErrorBoundary,
}) => (
	<Card style={{ textAlign: 'center', padding: '20px' }}>
		<h3>Không thể tải biểu đồ</h3>
		<p style={{ color: 'red' }}>{error.message}</p>
		<Button type="primary" onClick={resetErrorBoundary}>
			Thử lại
		</Button>
	</Card>
);

// Cấu hình mặc định cho biểu đồ
const defaultChartConfig = {
	appendPadding: 10,
	height: 300,
	animation: false,
	theme: {
		defaultColor: '#1890ff',
	},
	interactions: [
		{
			type: 'element-active',
		},
	],
};

const Dashboard: React.FC = () => {
	const [tongTrungTam, setTongTrungTam] = useState<number>(0);
	const [tongKhoaHoc, setTongKhoaHoc] = useState<number>(0);
	const [tongHocSinh, setTongHocSinh] = useState<number>(0);
	const [tongGiaoVien, setTongGiaoVien] = useState<number>(0);
	const [tongVoucher, setTongVoucher] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);

	const fetchData = async () => {
		setLoading(true);
		try {
			const results = await Promise.allSettled([
				getAllCenter().catch(() => []),
				getAllCourse().catch(() => []),
				getAllStudent().catch(() => []),
				getAllTeacher().catch(() => []),
				getAllVoucher().catch(() => []),
			]);

			let hasError = false;
			results.forEach((result, index) => {
				if (result.status === 'fulfilled') {
					const data = result.value;
					switch (index) {
						case 0:
							setTongTrungTam(data?.length || 0);
							break;
						case 1:
							setTongKhoaHoc(data?.length || 0);
							break;
						case 2:
							setTongHocSinh(data?.length || 0);
							break;
						case 3:
							setTongGiaoVien(data?.length || 0);
							break;
						case 4:
							setTongVoucher(data?.length || 0);
							break;
					}
				} else {
					hasError = true;
					console.warn(
						`Failed to fetch data for index ${index}:`,
						result.reason,
					);
				}
			});

			if (hasError) {
				message.warning('Một số dữ liệu có thể chưa được cập nhật đầy đủ');
			}
		} catch (error) {
			console.error('Dashboard data fetch error:', error);
			message.error('Có lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const pieConfig = useMemo(() => {
		const data = [
			{ type: 'Trung Tâm', value: tongTrungTam },
			{ type: 'Khóa Học', value: tongKhoaHoc },
			{ type: 'Học Sinh', value: tongHocSinh },
			{ type: 'Giáo Viên', value: tongGiaoVien },
			{ type: 'Voucher', value: tongVoucher },
		].filter((item) => item.value > 0);

		const total = data.reduce((sum, item) => sum + item.value, 0);

		return {
			...defaultChartConfig,
			data,
			angleField: 'value',
			colorField: 'type',
			radius: 0.8,
			label: {
				type: 'outer',
				content: (item: PieChartDatum) => {
					if (!item || typeof item.value !== 'number') return '';
					const percent = ((item.value / total) * 100).toFixed(1);
					return `${item.type}\n${item.value} (${percent}%)`;
				},
			},
			tooltip: {
				showTitle: false,
				formatter: (item: PieChartDatum) => {
					if (!item || typeof item.value !== 'number')
						return { name: '', value: '0' };
					const percent = ((item.value / total) * 100).toFixed(1);
					return {
						name: item.type,
						value: `${item.value.toLocaleString()} (${percent}%)`,
					};
				},
			},
			legend: {
				layout: 'horizontal',
				position: 'bottom',
			},
			state: {
				active: {
					style: {
						lineWidth: 2,
						stroke: '#000',
					},
				},
			},
		};
	}, [tongTrungTam, tongKhoaHoc, tongHocSinh, tongGiaoVien, tongVoucher]);

	const columnConfig = useMemo(() => {
		const data = [
			{ type: 'Trung Tâm', value: tongTrungTam },
			{ type: 'Khóa Học', value: tongKhoaHoc },
		].filter((item) => item.value > 0);

		return {
			...defaultChartConfig,
			data,
			xField: 'type',
			yField: 'value',
			label: {
				position: 'top',
				formatter: (text: string) => text,
			},
			tooltip: {
				formatter: (datum: ChartDatum) => ({
					name: datum.type,
					value: datum.value.toLocaleString(),
				}),
			},
			columnStyle: {
				radius: [4, 4, 0, 0],
			},
			state: {
				active: {
					style: {
						lineWidth: 2,
						stroke: '#000',
					},
				},
			},
		};
	}, [tongTrungTam, tongKhoaHoc]);

	return (
		<AdminLayout>
			<Row gutter={[16, 16]} justify="center" style={{ paddingLeft: 180 }}>
				<Col span={4}>
					<Card title="Tổng Trung Tâm" variant="outlined" loading={loading}>
						{tongTrungTam}
					</Card>
				</Col>
				<Col span={4}>
					<Card title="Tổng Khóa Học" variant="outlined" loading={loading}>
						{tongKhoaHoc}
					</Card>
				</Col>
				<Col span={4}>
					<Card title="Tổng Học Sinh" variant="outlined" loading={loading}>
						{tongHocSinh}
					</Card>
				</Col>
				<Col span={4}>
					<Card title="Tổng Giáo Viên" variant="outlined" loading={loading}>
						{tongGiaoVien}
					</Card>
				</Col>
				<Col span={4}>
					<Card title="Tổng Voucher" variant="outlined" loading={loading}>
						{tongVoucher}
					</Card>
				</Col>
			</Row>
			<ErrorBoundary
				FallbackComponent={ChartErrorFallback}
				onReset={() => {
					setLoading(true);
					fetchData();
				}}
			>
				<Row
					gutter={[16, 16]}
					justify="center"
					style={{ marginTop: 16, paddingLeft: 180, marginBottom: 90 }}
				>
					<Col span={12}>
						<Card title="Thống Kê" variant="outlined">
							<div
								style={{ position: 'relative', minHeight: 300, width: '100%' }}
							>
								<Suspense fallback={<ChartLoading />}>
									{!loading && pieConfig.data.length > 0 ? (
										<Pie {...pieConfig} key={`pie-${loading}`} />
									) : (
										<ChartLoading />
									)}
								</Suspense>
							</div>
						</Card>
					</Col>
					<Col span={8}>
						<Card title="Trung Tâm và Khóa Học" variant="outlined">
							<div
								style={{ position: 'relative', minHeight: 300, width: '100%' }}
							>
								<Suspense fallback={<ChartLoading />}>
									{!loading && columnConfig.data.length > 0 ? (
										<Column {...columnConfig} key={`column-${loading}`} />
									) : (
										<ChartLoading />
									)}
								</Suspense>
							</div>
						</Card>
					</Col>
				</Row>
			</ErrorBoundary>
		</AdminLayout>
	);
};

export default Dashboard;
