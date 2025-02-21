import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import viLocale from '@fullcalendar/core/locales/vi';
import { Button, Col, Row, Tag, Typography } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined, 
  SyncOutlined 
} from '@ant-design/icons';

import ButtonGoBack from '@/components/commons/ButtonGoback';
import DropdownCenter from '@/components/teacher/DropdownCenter';
import DropdownCourse from '@/components/teacher/DropdownCourse';
import { Center } from '@/schemas/center.schema';
import { Course } from '@/schemas/course.schema';
import { Slot } from '@/schemas/slot.schema';
import { checkAttendanceStatus } from '@/services/api/attendance';
import { getAllCenter, getCenterById } from '@/services/api/center';
import { getSlotsByStudentEmail } from '@/services/api/slot';
import { fetchStudentData } from '@/services/custom/getStudentbyToken';
import { convertToUTC } from '@/utils/dateFormat';
import { decodeToken } from '@/utils/jwtDecode';

interface ExtendedSlot extends Slot {
  centerName: string;
  Description: string;
}

const SetupSchedules: React.FC = () => {
  const [slots, setSlots] = useState<ExtendedSlot[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<string | undefined>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>('all');
  const calendarRef = useRef<FullCalendar>(null);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded.role !== 'admin') {
        setIsReadOnly(true);
      }
    }
  }, []);

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

  const fetchSlots = async () => {
    try {
      const email = (await fetchStudentData()).email;
      const allSlots = await getSlotsByStudentEmail(email);
      const convertedData: ExtendedSlot[] = await Promise.all(
        allSlots.map(async (slot) => {
          const center = await getCenterById(slot.class.center.toString());
          const status = await checkAttendanceStatus(email, slot._id);
          let description = 'Chưa học';
          if (status === 'attended') {
            description = 'Đã điểm danh';
          } else if (status === 'absent') {
            description = 'Vắng mặt';
          }

          return {
            ...slot,
            start: convertToUTC(new Date(slot.start)),
            end: convertToUTC(new Date(slot.end)),
            centerName: center.name,
            Description: description,
          };
        }),
      );
      setSlots(convertedData);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.scrollToTime('07:00:00');
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
    id: slot._id,
    title: `Lớp: ${slot.class.name}`,
    start: slot.start,
    end: slot.end,
    extendedProps: {
      location: slot.room,
      description: slot.Description,
      centerName: slot.centerName,
    },
  }));

  const eventContent = (eventInfo: any) => {
    const event = eventInfo.event;
    let icon;
    let color;

    if (event.extendedProps.description === 'Đã điểm danh') {
      icon = <CheckCircleOutlined />;
      color = 'success';
    } else if (event.extendedProps.description === 'Vắng mặt') {
      icon = <CloseCircleOutlined />;
      color = 'error';
    } else {
      icon = <ClockCircleOutlined />;
      color = 'default';
    }

    return (
      <div style={{ padding: '5px' }}>
        <div>
          <h3>{event.title}</h3>
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
          <Tag icon={icon} color={color}>
            {event.extendedProps.description}
          </Tag>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Row>
        <Col span={2}>
          <ButtonGoBack />
        </Col>
        <Col span={20}>
          <Typography.Title level={2} style={{ textAlign: 'center' }}>
            Lịch Học
          </Typography.Title>
        </Col>
      </Row>

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
          <div style={{ marginTop: '20px' }}>
            <Button
              type="default"
              icon={<SyncOutlined />}
              onClick={handleRefresh}
              style={{ float: 'right' }}
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
          selectable={!isReadOnly}
          editable={!isReadOnly}
          dayMaxEvents={true}
          weekends={true}
          height="100%"
        />
      </div>
    </div>
  );
};

export default SetupSchedules;