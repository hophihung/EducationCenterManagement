import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import viLocale from '@fullcalendar/core/locales/vi';
import { Button, Col, Row, Tag, Typography } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ScheduleOutlined 
} from '@ant-design/icons';

import ButtonGoBack from '@/components/commons/ButtonGoback';
import DropdownCenter from '@/components/teacher/DropdownCenter';
import DropdownCourse from '@/components/teacher/DropdownCourse';
import { Center } from '@/schemas/center.schema';
import { Course } from '@/schemas/course.schema';
import { Slot } from '@/schemas/slot.schema';
import { getCenterById, getCentersByTeacherEmail } from '@/services/api/center';
import { filterSlotsforSchedule } from '@/services/api/slot';
import { convertToUTC } from '@/utils/dateFormat';
import { decodeToken } from '@/utils/jwtDecode';

interface ExtendedSlot extends Slot {
  centerName: string;
}

const Schedule: React.FC = () => {
  const [slots, setSlots] = useState<ExtendedSlot[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<string | undefined>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>('all');
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const token = localStorage.getItem('teacherToken');
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
        const teacherEmail = localStorage.getItem('teacherEmail');
        if (!teacherEmail) {
          throw new Error('Teacher email not found in local storage');
        }
        const data = await getCentersByTeacherEmail(teacherEmail);
        setCenters(data);
      } catch (error) {
        console.error('Error fetching centers:', error);
      }
    };
    fetchCenters();
  }, []);

  useEffect(() => {
    const fetchFilteredSlots = async () => {
      try {
        const teacherEmail = localStorage.getItem('teacherEmail');
        if (!teacherEmail) {
          throw new Error('Teacher email not found in local storage');
        }
        const filteredSlots = await filterSlotsforSchedule(
          teacherEmail,
          selectedCenter,
          selectedCourse,
        );
        const convertedData: ExtendedSlot[] = await Promise.all(
          filteredSlots.map(async (slot) => {
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
        console.error('Error fetching filtered slots:', error);
      }
    };
    fetchFilteredSlots();
  }, [selectedCenter, selectedCourse]);

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

  const handleRedirect = (id: string) => {
    window.location.href = `/teacher/attendance/${id}`;
  };

  const events = slots.map((slot) => ({
    id: slot._id,
    title: `Lớp: ${slot.class.name}`,
    start: slot.start,
    end: slot.end,
    extendedProps: {
      location: slot.room,
      description: slot.isDone ? 'Đã dạy' : 'Chưa dạy',
      centerName: slot.centerName,
    },
  }));

  const eventContent = (eventInfo: any) => {
    const event = eventInfo.event;
    const currentTime = new Date();
    const slotStartTime = new Date(event.start);
    const endOfDay = new Date(slotStartTime);
    endOfDay.setHours(23, 59, 59, 999);

    const isButtonDisabled =
      // Convert all ">" to "<" when demo
      currentTime < slotStartTime || currentTime > endOfDay;

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
        <Button
          type="primary"
          icon={<ScheduleOutlined />}
          onClick={() => handleRedirect(event.id)}
          style={{ marginTop: '10px' }}
          disabled={isButtonDisabled}
        >
          Điểm danh
        </Button>
      </div>
    );
  };

  return (
    <div style={{ paddingLeft: '270px' }}>
      <Row>
        <Col span={2}>
          <ButtonGoBack />
        </Col>
        <Col span={20}>
          <Typography.Title level={2} style={{ textAlign: 'center' }}>
            Lịch giảng dạy
          </Typography.Title>
        </Col>
      </Row>
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

export default Schedule;