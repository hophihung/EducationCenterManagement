import Header from '../commons/Header';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, MenuProps, Typography, message } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeaderAdmin: React.FC = () => {
	const navigate = useNavigate();
	const fullName = localStorage.getItem('adminFullName');
	const accessToken = localStorage.getItem('accessToken');

	const handleChangePassword = () => {
		navigate('/admin/change-password');
	};

	const handleLogout = () => {
		localStorage.clear();
		message.success('Đăng xuất thành công');
		navigate('/student');
	};

	const menuItems: MenuProps['items'] = [
		{
			key: 'changePassword',
			label: 'Đổi mật khẩu',
			onClick: handleChangePassword,
		},
		{
			key: 'logout',
			label: 'Đăng xuất',
			onClick: handleLogout,
		},
	];

	const rightComponent = accessToken ? (
		<div>
			<Dropdown menu={{ items: menuItems }} trigger={['hover']}>
				<div
					style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
				>
					<Typography.Text style={{ marginRight: 8, color: 'white' }}>
						{fullName}
					</Typography.Text>
					<Avatar
						style={{
							marginRight: '8px',
							backgroundColor: 'white',
							cursor: 'pointer',
						}}
						size="large"
						icon={<UserOutlined style={{ color: 'black' }} />}
					/>
				</div>
			</Dropdown>
		</div>
	) : null;

	return <Header rightComponent={rightComponent} />;
};

export default HeaderAdmin;

/*
### Giải thích từng phần trong đoạn code React:

#### 1. **Import các thư viện và component cần thiết**
```tsx
import Header from '../commons/Header';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, MenuProps, Typography, message } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
```
- **Header**: Import component `Header` từ thư mục `commons/Header` (có thể là header chung của hệ thống).
- **UserOutlined**: Icon đại diện cho người dùng từ thư viện `@ant-design/icons`.
- **Avatar, Dropdown, Typography, message**: Các component từ `antd` để hiển thị avatar, dropdown menu và tin nhắn.
- **React**: Import React vì đây là một component React.
- **useNavigate**: Hook từ `react-router-dom` để điều hướng trang.

---

#### 2. **Khai báo component `HeaderAdmin`**
```tsx
const HeaderAdmin: React.FC = () => {
```
- Định nghĩa một functional component `HeaderAdmin`, có kiểu `React.FC` (Functional Component) để hỗ trợ TypeScript.

---

#### 3. **Lấy thông tin từ `localStorage`**
```tsx
const navigate = useNavigate();
const fullName = localStorage.getItem('adminFullName');
const accessToken = localStorage.getItem('accessToken');
```
- **`useNavigate()`**: Dùng để điều hướng trang.
- **Lấy dữ liệu từ `localStorage`**:
  - `adminFullName`: Lấy tên admin đang đăng nhập.
  - `accessToken`: Kiểm tra xem admin có đăng nhập hay không.

---

#### 4. **Hàm đổi mật khẩu**
```tsx
const handleChangePassword = () => {
  navigate('/admin/change-password');
};
```
- Khi người dùng chọn "Đổi mật khẩu", điều hướng đến `/admin/change-password`.

---

#### 5. **Hàm đăng xuất**
```tsx
const handleLogout = () => {
  localStorage.clear();
  message.success('Đăng xuất thành công');
  navigate('/student');
};
```
- **Xóa toàn bộ dữ liệu trong `localStorage`** để đăng xuất.
- **Hiển thị thông báo "Đăng xuất thành công"** bằng `message.success()`.
- **Điều hướng người dùng đến trang `/student`**.

---

#### 6. **Tạo danh sách menu dropdown**
```tsx
const menuItems: MenuProps['items'] = [
  {
    key: 'changePassword',
    label: 'Đổi mật khẩu',
    onClick: handleChangePassword,
  },
  {
    key: 'logout',
    label: 'Đăng xuất',
    onClick: handleLogout,
  },
];
```
- **Tạo menu dropdown** có hai lựa chọn:
  - "Đổi mật khẩu" → Gọi `handleChangePassword()`.
  - "Đăng xuất" → Gọi `handleLogout()`.

---

#### 7. **Hiển thị avatar và dropdown menu**
```tsx
const rightComponent = accessToken ? (
  <div>
    <Dropdown menu={{ items: menuItems }} trigger={['hover']}>
      <div
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
      >
        <Typography.Text style={{ marginRight: 8, color: 'white' }}>
          {fullName}
        </Typography.Text>
        <Avatar
          style={{
            marginRight: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
          size="large"
          icon={<UserOutlined style={{ color: 'black' }} />}
        />
      </div>
    </Dropdown>
  </div>
) : null;
```
- Nếu có `accessToken` (người dùng đã đăng nhập):
  - Hiển thị **Dropdown menu** chứa tên người dùng và avatar.
  - Khi hover vào avatar, hiện menu chứa các tùy chọn "Đổi mật khẩu" và "Đăng xuất".
- Nếu **không có `accessToken`**, `rightComponent` sẽ là `null` (không hiển thị gì cả).

---

#### 8. **Render `Header` và truyền `rightComponent` vào**
```tsx
return <Header rightComponent={rightComponent} />;
```
- **Trả về component `Header`**, truyền `rightComponent` vào làm nội dung bên phải của header.

---

#### 9. **Xuất component**
```tsx
export default HeaderAdmin;
```
- **Xuất `HeaderAdmin`** để có thể sử dụng ở các file khác.

---

### **Tóm tắt cách hoạt động**
1. Lấy **tên admin** và **token đăng nhập** từ `localStorage`.
2. Nếu có **token**:
   - Hiển thị tên admin và avatar.
   - Khi hover vào avatar, hiển thị dropdown menu chứa các tùy chọn:
     - Đổi mật khẩu → Chuyển hướng đến trang đổi mật khẩu.
     - Đăng xuất → Xóa dữ liệu, thông báo thành công, chuyển đến trang `/student`.
3. Nếu **không có token**, không hiển thị gì.
4. Kết hợp với component `Header` chung của hệ thống.

*/
