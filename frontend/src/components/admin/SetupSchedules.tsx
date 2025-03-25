import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	SyncOutlined,
} from '@ant-design/icons';
import { L10n, loadCldr } from '@syncfusion/ej2-base';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import {
	Day,
	Inject,
	Month,
	ScheduleComponent,
	Week,
	WorkWeek,
} from '@syncfusion/ej2-react-schedule';
import '@syncfusion/ej2-react-schedule/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import { Button, Col, Form, Modal, Row, Tag, Typography } from 'antd';
import * as gregorian from 'cldr-data/main/vi/ca-gregorian.json';
import * as numberingSystems from 'cldr-data/main/vi/numbers.json';
import * as timeZoneNames from 'cldr-data/main/vi/timeZoneNames.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import React, { useEffect, useRef, useState } from 'react';

import CustomEditorTemplate from '@/components/admin/CustomEditorTemplate';
import DropdownCenter from '@/components/teacher/DropdownCenter';
import DropdownCourse from '@/components/teacher/DropdownCourse';
import { Center } from '@/schemas/center.schema';
import { Course } from '@/schemas/course.schema';
import { Slot } from '@/schemas/slot.schema';
import { getAllCenter, getCenterById } from '@/services/api/center';
import { getAllSlot } from '@/services/api/slot';
import { convertToUTC } from '@/utils/dateFormat';

loadCldr(numberingSystems, gregorian, timeZoneNames, weekData);

L10n.load({
	vi: {
		schedule: {
			day: 'Ngày',
			week: 'Tuần',
			workWeek: 'Tuần làm việc',
			month: 'Tháng',
			today: 'Hôm nay',
			noEvents: 'Không có sự kiện',
			allDay: 'Cả ngày',
			start: 'Bắt đầu',
			end: 'Kết thúc',
			more: 'Thêm',
		},
	},
});

interface ExtendedSlot extends Slot {
	centerName: string;
}

const SetupSchedules: React.FC = () => {
	const [form] = Form.useForm();
	const [slots, setSlots] = useState<ExtendedSlot[]>([]);
	const [centers, setCenters] = useState<Center[]>([]);
	const [selectedCenter, setSelectedCenter] = useState<string | undefined>(
		'all',
	);
	const [courses, setCourses] = useState<Course[]>([]);
	const [selectedCourse, setSelectedCourse] = useState<string | undefined>(
		'all',
	);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [modalData, setModalData] = useState<Record<string, unknown>>({});
	const scheduleRef = useRef<ScheduleComponent>(null);

	const fetchSlots = async () => {
		try {
			const allSlots = await getAllSlot();
			const convertedData: ExtendedSlot[] = await Promise.all(
				allSlots.map(async (slot) => {
					const center = await getCenterById(slot.class.center.toString());
					return {
						...slot,
						start: convertToUTC(new Date(slot.start)),
						end: convertToUTC(new Date(slot.end)),
						centerName: center.name,
					};
				}),
			);
			setSlots(convertedData);
		} catch (error) {
			console.error('Error fetching slots:', error);
		}
	};

	useEffect(() => {
		const fetchCenters = async () => {
			try {
				const data = await getAllCenter();
				setCenters(data);
			} catch (error) {
				console.error('Error fetching centers:', error);
			}
		};
		fetchCenters();
	}, []);

	useEffect(() => {
		fetchSlots();
	}, []);

	useEffect(() => {
		if (scheduleRef.current) {
			scheduleRef.current.scrollTo('07:00');
		}
	}, [slots]);

	const handleCenterChange = (value: string) => {
		setSelectedCenter(value);
		const selected = centers.find((center) => center._id === value);
		if (selected?.courses) {
			setCourses(selected.courses);
		} else {
			setCourses([]);
		}
		setSelectedCourse('all');
	};

	const handleCourseChange = (value: string) => {
		setSelectedCourse(value);
	};

	const handleRefresh = () => {
		fetchSlots();
	};

	const filteredSlots = slots.filter((slot) => {
		const centerMatch =
			selectedCenter === 'all' ||
			slot.class.center.toString() === selectedCenter;
		const courseMatch =
			selectedCourse === 'all' ||
			slot.class.course.toString() === selectedCourse;
		return centerMatch && courseMatch;
	});

	const events = filteredSlots.map((slot) => ({
		Id: slot._id,
		Subject: slot.class.name,
		StartTime: slot.start,
		EndTime: slot.end,
		Location: slot.room,
		Description: slot.isDone ? 'Đã dạy' : 'Chưa dạy',
		IsAllDay: false,
		CenterName: slot.centerName,
		classId: slot.class._id,
		centerId: slot.class.center,
	}));

	const eventTemplate = (props: {
		Subject: string;
		Description: string;
		StartTime: string;
		EndTime: string;
		Id: string;
		Location: string;
		CenterName: string;
	}) => (
		<div style={{ padding: '5px' }}>
			<div>
				<h4>Lớp: {props.Subject}</h4>
			</div>
			<div style={{ marginTop: '7px' }}>
				{new Date(props.StartTime).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				})}{' '}
				-{' '}
				{new Date(props.EndTime).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				})}
			</div>
			<div style={{ marginTop: '5px' }}>
				<strong>{props.CenterName}</strong>
			</div>
			<div style={{ marginTop: '5px' }}>
				<strong>Tại phòng: </strong>
				{props.Location}
			</div>
			<div style={{ marginTop: '10px' }}>
				<Tag
					icon={
						props.Description === 'Đã dạy' ? (
							<CheckCircleOutlined />
						) : (
							<ClockCircleOutlined />
						)
					}
					color={props.Description === 'Đã dạy' ? 'success' : 'default'}
				>
					{props.Description}
				</Tag>
			</div>
		</div>
	);

	const onPopupOpen = (args: {
		type: string;
		data: Record<string, unknown>;
		cancel: boolean;
	}) => {
		const currentDate = new Date();
		if (args.type === 'QuickInfo' && !('Id' in args.data)) {
			const startTime = args.data.StartTime as Date;
			if (startTime.getTime() < currentDate.setHours(0, 0, 0, 0)) {
				args.cancel = true;
				return;
			}
			args.cancel = true;
			setModalData(args.data);
			setIsModalVisible(true);
		} else if (args.type === 'Editor') {
			args.cancel = true;
			const startTime = args.data.StartTime as Date;
			if (startTime.getTime() < currentDate.setHours(0, 0, 0, 0)) {
				return;
			}
			setModalData(args.data);
			setIsModalVisible(true);
		}
	};

	const handleModalOk = () => {
		form.validateFields().then(() => {
			const values = form.getFieldsValue();
			const newEvent = {
				Subject: values.Subject,
				StartTime: values.StartTime.toISOString(),
				EndTime: values.EndTime.toISOString(),
				Location: values.Location,
				Description: 'Chưa dạy',
			};

			if (scheduleRef.current) {
				scheduleRef.current.addEvent(newEvent);
			}
			setIsModalVisible(false);
			form.resetFields();
			fetchSlots();
		});
	};

	const handleModalCancel = () => {
		setIsModalVisible(false);
		form.resetFields();
	};

	return (
		<div style={{ paddingLeft: '270px' }}>
			<Typography.Title level={2} style={{ textAlign: 'center' }}>
				Danh sách lịch học
			</Typography.Title>
			<Row>
				<Col span={20}>
					<div style={{ display: 'flex', marginTop: '20px' }}>
						<DropdownCenter
							centers={centers}
							selectedCenter={selectedCenter || 'all'}
							onChange={handleCenterChange}
						/>
						{selectedCenter !== 'all' && (
							<DropdownCourse
								courses={courses}
								selectedCourse={selectedCourse || 'all'}
								onChange={handleCourseChange}
							/>
						)}
					</div>
				</Col>
				<Col span={4}>
					<div
						style={{
							display: 'flex',
							marginTop: '20px',
							justifyContent: 'flex-end',
						}}
					>
						<Button
							type="default"
							icon={<SyncOutlined />}
							onClick={handleRefresh}
							style={{ marginRight: 8 }}
						>
							Làm mới
						</Button>
					</div>
				</Col>
			</Row>
			<ScheduleComponent
				ref={scheduleRef}
				height="650px"
				startHour="07:00"
				endHour="17:15"
				eventSettings={{ dataSource: events, template: eventTemplate }}
				locale="vi"
				style={{ marginTop: '15px' }}
				views={['Day', 'Week', 'WorkWeek', 'Month']}
				popupOpen={onPopupOpen}
				quickInfoTemplates={null}
				enablePersistence={false}
				enableRtl={false}
				showQuickInfo={false}
				showHeaderBar={true}
				allowDragAndDrop={false}
				allowResizing={false}
				allowInline={false}
				allowKeyboardInteraction={true}
			>
				<Inject services={[Day, Week, WorkWeek, Month]} />
			</ScheduleComponent>

			<Modal
				title={modalData.Id ? 'Chỉnh sửa lịch học' : 'Thêm lịch học'}
				open={isModalVisible}
				onOk={handleModalOk}
				onCancel={handleModalCancel}
				width={600}
				destroyOnClose
			>
				<CustomEditorTemplate
					form={form}
					onSave={handleModalOk}
					onCancel={handleModalCancel}
					isEditMode={!!modalData.Id}
					eventId={modalData.Id as string}
					StartTime={modalData.StartTime as Date}
					EndTime={modalData.EndTime as Date}
					Subject={modalData.Subject as string}
					Location={modalData.Location as string}
				/>
			</Modal>
		</div>
	);
};

export default SetupSchedules;
