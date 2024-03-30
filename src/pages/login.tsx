import { FAILURE_PREFIX, LOGIN_FAILED, LOGIN_SUCCESS_PREFIX } from "../constants/string";
import { useRouter } from "next/router";
import { QqOutlined } from "@ant-design/icons";
import LoginLayout from "../components/LoginUI";
import { Layout } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";

const LoginScreen: React.FC<any> = () => {

    const router = useRouter();

    const onFinish = (values: any) => {
        fetch("/api/login", {
            method: "POST",
            body: JSON.stringify(values),
        })
            .then((res) => res.json())
            .then((res) => {
                if (Number(res.code) === 0) {
                    localStorage.setItem("token", res.token);
                    localStorage.setItem("userName", res.userName);
                    alert(LOGIN_SUCCESS_PREFIX + res.userName);
                    router.push({ pathname: "chat_interface", query: { userId: res.userId } });
                }
                else {
                    alert(LOGIN_FAILED);
                }
            })
            .catch((err) => alert(FAILURE_PREFIX + err));
    };

    return (
        <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
        >
            <div style={{ marginBottom: "20px" }}>
                <QqOutlined style={{ fontSize: "240px" }} />
            </div>
            <Form.Item
                name="userId"
                rules={[{ required: true, message: "请输入用户 ID!" }]}
            >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户 ID" />
            </Form.Item>
            <Form.Item
                name="password"
                rules={[{ required: true, message: "请输入密码!" }]}
            >
                <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="密码"
                />
            </Form.Item>
            <Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>记住我</Checkbox>
                </Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                    登录
                </Button>
            </Form.Item>
        </Form>
    );
};


const App: React.FC = () => {

    return (
        <Layout>
            <LoginLayout Component={LoginScreen} />
        </Layout>
    );
};

export default App;
