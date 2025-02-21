import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import viLocale from '@fullcalendar/core/locales/vi';
import { Button, Col, Form, Row, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import moment from 'moment';

import CustomEditorTemplate from '@/components/admin/CustomEditorTemplate';
import DropdownCenter from '@/components/teacher/DropdownCenter';
import DropdownCourse from '@/components/teacher/DropdownCourse';
import { Center } from '@/schemas/center.schema';
import { Course } from '@/schemas/course.schema';
import { Slot } from '@/schemas/slot.schema';
import { getAllCenter, getCenterById } from '@/services/api/center';
import { getAllSlot } from '@/services/api/slot';
import { convertToUTC } from '@/utils/dateFormat';

interface ExtendedSlot extends Slot {
  centerName: string;
}

const SetupSchedules: React.FC = () => {
  const [form] = Form.useForm();
  const [slots, setSlots] = useState<ExtendedSlot[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<string | undefined>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>('all');
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

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
      selectedCenter === 'all' || slot.class.center.toString() === selectedCenter;
    const courseMatch =
      selectedCourse === 'all' || slot.class.course.toString() === selectedCourse;
    return centerMatch && courseMatch;
  });

  const events = filteredSlots.map((slot) => ({
    id: slot._id,
    title: slot.class.name,
    start: slot.start,
    end: slot.end,
    extendedProps: {
      location: slot.room,
      description: slot.isDone ? 'Đã dạy' : 'Chưa dạy',
      centerName: slot.centerName,
      classId: slot.class._id,
      centerId: slot.class.center,
    },
  }));

  const handleEventClick = (info: any) => {
    const currentDate = new Date();
    const eventStart = new Date(info.event.start);
    
    if (eventStart.getTime() < currentDate.setHours(0, 0, 0, 0)) {
      return;
    }

    setSelectedEvent(info.event);
    const center = centers.find(
      (center) => center.name === info.event.extendedProps.centerName
    );
    const selectedClass = center?.classes?.find(
      (cls) => cls._id === info.event.extendedProps.classId
    );

    form.setFieldsValue({
      StartTime: moment(info.event.start),
      EndTime: moment(info.event.end),
      Subject: selectedClass ? selectedClass.name : info.event.title,
      Location: info.event.extendedProps.location,
      Center: center ? center._id : undefined,
    });
  };

  const handleDateSelect = (selectInfo: any) => {
    const currentDate = new Date();
    if (selectInfo.start.getTime() < currentDate.setHours(0, 0, 0, 0)) {
      return;
    }
    
    form.resetFields();
    form.setFieldsValue({
      StartTime: moment(selectInfo.start),
      EndTime: moment(selectInfo.end),
    });
    setSelectedEvent(null);
  };

  const eventContent = (eventInfo: any) => {
    const event = eventInfo.event;
    return (
      <div style={{ padding: '5px' }}>
        <div>
          <h4>Lớp: {event.title}</h4>
        </div>
        <div style={{ marginTop: '7px' }}>
          {new Date(event.start).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          -{' '}
          {new Date(event.end).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
        <div style={{ marginTop: '5px' }}>
          <strong>{event.extendedProps.centerName}</strong>
        </div>
        <div style={{ marginTop: '5px' }}>
          <strong>Tại phòng: </strong>
          {event.extendedProps.location}
        </div>
        <div style={{ marginTop: '10px' }}>
          <Tag
            icon={
              event.extendedProps.description === 'Đã dạy' ? (
                <CheckCircleOutlined />
              ) : (
                <ClockCircleOutlined />
              )
            }
            color={event.extendedProps.description === 'Đã dạy' ? 'success' : 'default'}
          >
            {event.extendedProps.description}
          </Tag>
        </div>
      </div>
    );
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
      <div style={{ marginTop: '15px', height: '650px' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          slotMinTime="07:00:00"
          slotMaxTime="17:15:00"
          events={events}
          eventContent={eventContent}
          locale={viLocale}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          eventClick={handleEventClick}
          select={handleDateSelect}
          height="100%"
        />
      </div>
      {(selectedEvent || form.getFieldValue('StartTime')) && (
        <CustomEditorTemplate
          form={form}
          onSave={() => {
            setSelectedEvent(null);
            fetchSlots();
          }}
          onCancel={() => setSelectedEvent(null)}
          isEditMode={!!selectedEvent}
          eventId={selectedEvent?.id}
        />
      )}
    </div>
  );
};

export default SetupSchedules;