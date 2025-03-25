import { EventSettingsModel } from '@syncfusion/ej2-react-schedule';
import {
	Button,
	Checkbox,
	Form,
	FormInstance,
	Input,
	InputNumber,
	Select,
	TimePicker,
	message,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';

import { Center } from '@/schemas/center.schema';
import { Class } from '@/schemas/class.schema';
import { NewSlot, Slot } from '@/schemas/slot.schema';
import { createAllAttendance } from '@/services/api/attendance';
import { getAllCenter } from '@/services/api/center';
import { getAllClasses } from '@/services/api/class';
import { createSlot, getSlotByClass, updateSlot } from '@/services/api/slot';
import { doSlotsConflict } from '@/utils/checkSlotConflict';

const { Option } = Select;

interface CustomEditorTemplateProps extends EventSettingsModel {
	Subject?: string;
	Location?: string;
	StartTime?: Date;
	EndTime?: Date;
	form: FormInstance;
	onSave: () => void;
	onCancel: () => void;
	isEditMode?: boolean;
	eventId?: string;
}

const CustomEditorTemplate: React.FC<CustomEditorTemplateProps> = (props) => {
	const [classOptions, setClassOptions] = useState<Class[]>([]);
	const [centerOptions, setCenterOptions] = useState<Center[]>([]);
	const [selectedCenter, setSelectedCenter] = useState<string | undefined>(
		props.Location,
	);
	const [startTime, setStartTime] = useState<Dayjs | null>(
		props.StartTime ? dayjs(props.StartTime) : null,
	);
	const [endTime, setEndTime] = useState<Dayjs | null>(
		props.EndTime ? dayjs(props.EndTime) : null,
	);
	const [existingSlots, setExistingSlots] = useState<Slot[]>([]);

	const [repeatEvent, setRepeatEvent] = useState(false);
	const [selectedDays, setSelectedDays] = useState<string[]>([]);
	const [disabledDays, setDisabledDays] = useState<string[]>([]);
	const [numberOfSlots, setNumberOfSlots] = useState<number>(1);

	useEffect(() => {
		const fetchCenters = async () => {
			try {
				const centers = await getAllCenter();
				setCenterOptions(centers);
			} catch (error) {
				console.error('Error fetching centers:', error);
				message.error('Không thể tải danh sách trung tâm');
			}
		};
		fetchCenters();
	}, []);

	useEffect(() => {
		const fetchClasses = async () => {
			try {
				const classes = await getAllClasses();
				setClassOptions(classes);
			} catch (error) {
				console.error('Error fetching classes:', error);
			}
		};
		fetchClasses();
	}, []);

	useEffect(() => {
		if (startTime) {
			const defaultDay = startTime.format('dddd');
			setSelectedDays([defaultDay]);
			setDisabledDays([defaultDay]);
		}
	}, [startTime]);

	const handleCenterChange = (value: string) => {
		try {
			setSelectedCenter(value);
			const selectedCenter = centerOptions.find(
				(center) => center._id === value,
			);
			if (selectedCenter?.classes) {
				setClassOptions(selectedCenter.classes);
				props.form.setFieldsValue({
					Subject: undefined,
					Center: value,
				});
			} else {
				setClassOptions([]);
			}
		} catch (error) {
			console.error('Error in handleCenterChange:', error);
		}
	};

	const handleClassChange = async (value: string) => {
		const selectedClass = classOptions.find(
			(classOption) => classOption.name === value,
		);
		if (selectedClass) {
			try {
				const slots = await getSlotByClass(selectedClass._id);
				setExistingSlots(slots);
			} catch (error) {
				console.error('Error fetching slots for class:', error);
			}
		}
	};

	const handleStartTimeChange = (time: Dayjs | null) => {
		setStartTime(time);
		props.form.setFieldsValue({ StartTime: time });
	};

	const handleEndTimeChange = (time: Dayjs | null) => {
		if (time && startTime) {
			const updatedEndTime = time
				.set('year', startTime.year())
				.set('month', startTime.month())
				.set('date', startTime.date());
			setEndTime(updatedEndTime);
			props.form.setFieldsValue({ EndTime: updatedEndTime });
		} else {
			setEndTime(time);
			props.form.setFieldsValue({ EndTime: time });
		}
	};

	const handleRepeatEventChange = (e: CheckboxChangeEvent) => {
		setRepeatEvent(e.target.checked);
	};

	const handleDaysChange = (checkedValues: string[]) => {
		setSelectedDays(checkedValues);
	};

	const handleNumberOfSlotsChange = (value: number | null) => {
		if (value !== null) {
			setNumberOfSlots(value);
		}
	};

	const checkForConflicts = (start: Date, end: Date) => {
		const newSlot = { start, end } as Slot;
		return existingSlots.some((slot) => doSlotsConflict(newSlot, slot));
	};

	const handleSave = async () => {
		try {
			await props.form.validateFields();
			const values = props.form.getFieldsValue();
			const selectedClass = classOptions.find(
				(classOption) => classOption.name === values.Subject,
			);
			if (!selectedClass) {
				throw new Error('Selected class not found');
			}

			const studentIds = (selectedClass.students ?? []).map((student) =>
				String(student),
			);

			const initialSlot = {
				class: selectedClass._id,
				room: values.Location,
				start: dayjs(values.StartTime).add(7, 'hour').toDate(),
				end: dayjs(values.EndTime).add(7, 'hour').toDate(),
				isDone: false,
			};

			const duration = dayjs(values.EndTime).diff(
				dayjs(values.StartTime),
				'minute',
			);
			if (duration > 135) {
				message.error(
					'Thời gian từ bắt đầu đến kết thúc không được quá 2 giờ 15 phút.',
				);
				return;
			}

			if (checkForConflicts(initialSlot.start, initialSlot.end)) {
				message.error(
					'Lớp học này đã có tiết học trùng với thời gian bạn chọn',
				);
				return;
			}

			const createAndLogSlot = async (slot: NewSlot) => {
				const slotId = await createSlot({
					...slot,
					class: selectedClass._id,
				});
				await createAllAttendance(slotId, studentIds);
				return slotId;
			};

			if (props.isEditMode) {
				if (props.eventId) {
					await updateSlot(
						{ ...initialSlot, class: selectedClass._id },
						props.eventId,
					);
				} else {
					throw new Error('Event ID is undefined');
				}
				message.success('Cập nhật khoá học thành công!');
			} else {
				await createAndLogSlot(initialSlot);
				message.success('Thêm khoá học thành công!');

				if (repeatEvent) {
					const daysMap = {
						Sunday: 0,
						Monday: 1,
						Tuesday: 2,
						Wednesday: 3,
						Thursday: 4,
						Friday: 5,
						Saturday: 6,
					};

					let createdSlots = 1;
					let currentDate = dayjs(values.StartTime);

					while (createdSlots < numberOfSlots) {
						for (const day of selectedDays) {
							if (createdSlots >= numberOfSlots) break;

							const dayOfWeek = daysMap[day as keyof typeof daysMap];
							let nextDate = currentDate.day(dayOfWeek);

							if (
								nextDate.isBefore(currentDate, 'day') ||
								nextDate.isSame(currentDate, 'day')
							) {
								nextDate = nextDate.add(1, 'week');
							}

							const repeatedSlot = {
								...initialSlot,
								class: selectedClass._id,
								start: nextDate.add(7, 'hour').toDate(),
								end: nextDate
									.add(
										dayjs(values.EndTime).diff(
											dayjs(values.StartTime),
											'minute',
										),
										'minute',
									)
									.add(7, 'hour')
									.toDate(),
							};

							if (checkForConflicts(repeatedSlot.start, repeatedSlot.end)) {
								message.error(
									'Lớp học này đã có lịch học trùng với thời gian bạn chọn',
								);
								return;
							}

							await createAndLogSlot(repeatedSlot);
							createdSlots++;
						}
						currentDate = currentDate.add(1, 'week');
					}
				}
			}

			props.onSave();
		} catch (error) {
			console.error('Validation failed or error creating slot:', error);
			message.error('Có lỗi xảy ra khi tạo khoá học.');
		}
	};

	const handleCancel = () => {
		props.form.resetFields();
		props.onCancel();
	};

	const daysOrder = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

	const sortedDays = daysOrder.map((day) => ({
		value: day,
		disabled: disabledDays.includes(day),
	}));

	return (
		<Form
			layout="vertical"
			form={props.form}
			initialValues={{
				StartTime: startTime,
				EndTime: endTime,
				Subject: props.Subject,
				Location: props.Location,
				Center: selectedCenter,
			}}
		>
			<Form.Item
				name="Center"
				label="Trung tâm"
				rules={[{ required: true, message: 'Vui lòng chọn một trung tâm!' }]}
			>
				<Select
					onChange={handleCenterChange}
					placeholder="Vui lòng chọn một trung tâm"
					style={{ width: '100%' }}
				>
					{centerOptions.map((center) => (
						<Select.Option key={center._id} value={center._id}>
							{center.name}
						</Select.Option>
					))}
				</Select>
			</Form.Item>
			{selectedCenter && (
				<Form.Item
					name="Subject"
					label="Lớp"
					rules={[{ required: true, message: 'Vui lòng chọn lớp học!' }]}
				>
					<Select
						placeholder="Vui lòng chọn lớp học"
						onChange={handleClassChange}
					>
						{classOptions.map((classOption) => (
							<Option key={classOption._id} value={classOption.name}>
								{classOption.name}
							</Option>
						))}
					</Select>
				</Form.Item>
			)}
			<Form.Item
				name="StartTime"
				label="Thời gian bắt đầu"
				rules={[
					{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' },
					({ getFieldValue }) => ({
						validator(_, value) {
							if (!value || value.isBefore(getFieldValue('EndTime'))) {
								return Promise.resolve();
							}
							return Promise.reject(
								new Error('Thời gian bắt đầu phải trước thời gian kết thúc!'),
							);
						},
					}),
				]}
			>
				<TimePicker
					format="HH:mm"
					value={startTime}
					onChange={handleStartTimeChange}
				/>
			</Form.Item>
			<Form.Item
				name="EndTime"
				label="Thời gian kết thúc"
				rules={[
					{ required: true, message: 'Vui lòng chọn thời gian kết thúc!' },
					({ getFieldValue }) => ({
						validator(_, value) {
							if (!value || value.isAfter(getFieldValue('StartTime'))) {
								const duration = dayjs(value).diff(
									dayjs(getFieldValue('StartTime')),
									'minute',
								);
								if (duration > 135) {
									return Promise.reject(
										new Error(
											'Thời gian từ bắt đầu đến kết thúc không được quá 2 giờ 15 phút.',
										),
									);
								}
								return Promise.resolve();
							}
							return Promise.reject(
								new Error('Thời gian kết thúc phải sau thời gian bắt đầu!'),
							);
						},
					}),
				]}
			>
				<TimePicker
					format="HH:mm"
					value={endTime}
					onChange={handleEndTimeChange}
				/>
			</Form.Item>
			<Form.Item
				name="Location"
				label="Tại phòng"
				rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}
			>
				<Input />
			</Form.Item>
			{!props.isEditMode && (
				<>
					<Form.Item>
						<Checkbox onChange={handleRepeatEventChange}>
							Lặp lại tiết học
						</Checkbox>
					</Form.Item>
					{repeatEvent && (
						<>
							<Form.Item label="Chọn ngày">
								<Checkbox.Group
									onChange={handleDaysChange}
									value={selectedDays}
								>
									{sortedDays.map(({ value, disabled }) => (
										<Checkbox key={value} value={value} disabled={disabled}>
											{value}
										</Checkbox>
									))}
								</Checkbox.Group>
							</Form.Item>
							<Form.Item label="Số lượng tiết học">
								<InputNumber
									min={1}
									value={numberOfSlots}
									onChange={handleNumberOfSlotsChange}
								/>
							</Form.Item>
						</>
					)}
				</>
			)}
			<Form.Item style={{ marginTop: '20px', textAlign: 'right' }}>
				<Button onClick={handleCancel} style={{ marginRight: 8 }}>
					Hủy
				</Button>
				<Button type="primary" onClick={handleSave}>
					Lưu
				</Button>
			</Form.Item>
		</Form>
	);
};

export default CustomEditorTemplate;
