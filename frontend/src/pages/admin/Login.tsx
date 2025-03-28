import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Typography, Modal, Layout, Col, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getAdminByUsername } from '@/services/api/admin';
import { fetchLogin } from '@/services/api/auth';
import AdminLayout from '@/layouts/admin';

const {  Title } = Typography;
const { Content } = Layout;

interface LoginFormValues {
  username: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && token !== 'undefined') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleCloseError = () => {
    setError(null);
  };

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const { accessToken } = await fetchLogin(values);
      localStorage.setItem('accessToken', accessToken);
      const adminDetails = await getAdminByUsername(values.username);
      localStorage.setItem('adminFullName', adminDetails.fullName);
      navigate('/admin/dashboard');
    } catch (error: unknown) {
      let errorMessage = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';

      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as {
          response: { status: number; data?: { message?: string } };
        };
        const { status, data } = err.response;
        switch (status) {
          case 404:
            errorMessage = `Không tìm thấy tài khoản quản trị viên "${values.username}".`;
            break;
          case 401:
            errorMessage = 'Mật khẩu bạn đã nhập không chính xác.';
            break;
          default:
            errorMessage = data?.message
              ? `Lỗi: ${data.message}`
              : errorMessage;
            break;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout showSidebar={false}>
      <Layout style={{ minHeight: '100vh' }}>
        <Content>
          <Row
            justify="center"
            align="middle"
            style={{ height: 'calc(100vh - 134px)' }}
          >
            <Col xs={22} sm={18} md={12} lg={8}>
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '32px',
                  borderRadius: '12px',
                  border: '2px solid #ddd', // Lighter border for better look
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', // Subtle shadow
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <Title
                    level={3}
                    style={{
                      fontFamily: 'cursive',
                      margin: 0,
                      marginBottom: '8px',
                    }}
                  >
                    Lang La Academy
                  </Title>
                  <Title
                    level={2}
                    style={{
                      textAlign: 'center',
                      marginBottom: '24px',
                      fontSize: '1.5rem',
                      color: '#333',
                    }}
                  >
                    Đăng nhập
                  </Title>
                </div>

                <Form
                  name="login"
                  onFinish={onFinish}
                  layout="vertical"
                >
                  <Form.Item
                    name="username"
                    label="Tên đăng nhập"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                  >
                    <Input
                      placeholder="Nhập tên đăng nhập"
                      size="large"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        padding: '12px 16px',
                        fontSize: '16px',
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                  >
                    <Input.Password
                      placeholder="Nhập mật khẩu"
                      size="large"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        padding: '12px 16px',
                        fontSize: '16px',
                      }}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      style={{
                        marginTop: '16px',
                        backgroundColor: '#49BBBD',
                        height: '48px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for button
                      }}
                    >
                      Đăng Nhập
                    </Button>
                  </Form.Item>
                </Form>
              </div>

              <Modal
                title="Đăng nhập thất bại"
                open={!!error}
                onCancel={handleCloseError}
                footer={[
                  <Button
                    key="ok"
                    onClick={handleCloseError}
                    type="primary"
                    style={{
                      backgroundColor: '#e74c3c',
                      borderColor: '#e74c3c',
                    }}
                  >
                    OK
                  </Button>,
                ]}
              >
                <p>{error}</p>
              </Modal>
            </Col>
          </Row>
        </Content>
      </Layout>
    </AdminLayout>
  );
};

export default AdminLogin;
