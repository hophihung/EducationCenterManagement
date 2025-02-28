import { Typography } from 'antd';
import React, { useState } from 'react';

import ListCourse from '@/components/student/ListCourse';
import StudentLayoutNoSidebar from '@/layouts/student/student.noSidebar';
import { Center } from '@/schemas/center.schema';

const HomepageStudent: React.FC = () => {
	const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);

	return (
		<StudentLayoutNoSidebar onSelectCenter={setSelectedCenter}>
			<Typography.Title level={1} style={{ textAlign: 'center' }}>
				Education Center Management
			</Typography.Title>
			<ListCourse selectedCenter={selectedCenter} />
		</StudentLayoutNoSidebar>
	);
};

export default HomepageStudent;
