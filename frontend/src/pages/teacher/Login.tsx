import React from 'react';
import { Button, Form, Input, Typography, Modal, Layout, Col, Row } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

import { setEmail, setToken } from '../../slices/teacher';
import { apiBaseUrl } from '@/utils/apiBase';
import Header from '@/components/commons/Header';
import Footer from '@/components/commons/Footer';

const { Title } = Typography;
const { Content } = Layout;

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginErrorResponse {
  message?: string;
}

const LoginTeacher: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form] = Form.useForm<LoginFormValues>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const teacherToken = localStorage.getItem('teacherToken');
    if (teacherToken) {
      navigate('/teacher/classes');
    }
  }, [navigate]);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/auth/teacher/login`,
        {
          email: values.email,
          password: values.password,
        }
      );

      const { access_token } = response.data;
      dispatch(setToken(access_token));
      dispatch(setEmail(values.email));

      localStorage.setItem('teacherToken', access_token);
      localStorage.setItem('teacherEmail', values.email);

      navigate('/teacher/classes');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<LoginErrorResponse>;
        const errorMsg = axiosError.response?.data?.message ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';
        setErrorMessage(errorMsg);
        console.error('Login error:', axiosError.response?.data);
      } else {
        setErrorMessage('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
        console.error('Unexpected error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseErrorModal = () => {
    setErrorMessage(null);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content>
        <Row justify="center" align="middle" style={{ height: 'calc(100vh - 134px)' }}>
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
                form={form}
                name="login"
                onFinish={handleLogin}
                layout="vertical"
              >
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập email của bạn!',
                    },
                    {
                      type: 'email',
                      message: 'Vui lòng nhập địa chỉ email hợp lệ!',
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập email"
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
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập mật khẩu của bạn!',
                    },
                    {
                      min: 6,
                      message: 'Mật khẩu phải có ít nhất 6 ký tự!',
                    },
                  ]}
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
                    loading={isLoading}
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
              open={!!errorMessage}
              onCancel={handleCloseErrorModal}
              footer={[
                <Button
                  key="ok"
                  onClick={handleCloseErrorModal}
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
              <p>{errorMessage}</p>
            </Modal>
          </Col>
        </Row>
      </Content>
      <Footer />
    </Layout>
  );
};

export default LoginTeacher;
