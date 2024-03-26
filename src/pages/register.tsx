import React from "react";
import { Layout } from "antd";
import LoginLayout from "../components/LoginUI";
import { QqOutlined } from "@ant-design/icons";
import { FAILURE_PREFIX, REGISTER_FAILED, REGISTER_SUCCESS_PREFIX } from "../constants/string";
import {
    Button,
    Form,
    Input,
} from "antd";
import { useRouter } from "next/router";
import { setName, setToken } from "../redux/auth";
import { useDispatch } from "react-redux";

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    },
};

const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 16,
            offset: 8,
        },
    },
};

const RegisterScreen = () => {
    const [form] = Form.useForm();
    const router = useRouter();
    const dispatch = useDispatch();


    const onFinish = (values: any) => {
        const userName = values.userName;

        fetch("/api/register", {
            method: "POST",
            body: JSON.stringify(values),
        })
            .then((res) => res.json())
            .then((res) => {
                if (Number(res.code) === 0) {
                    dispatch(setName(userName));
                    dispatch(setToken(res.token));
                    alert(REGISTER_SUCCESS_PREFIX + userName);
                    router.push("/login");
                }
                else {
                    alert(REGISTER_FAILED);
                }
            })
            .catch((err) => alert(FAILURE_PREFIX + err));
    };

    return (

        <Form
            {...formItemLayout}
            form={form}
            name="register"
            onFinish={onFinish}
            style={{ maxWidth: 600, justifyContent: "center", alignItems: "center", verticalAlign: "middle", textAlign: "center" }}
            scrollToFirstError
        >
            <div style={{ marginBottom: "20px" }}>
                <QqOutlined style={{ fontSize: "240px" }} />
            </div>
            <Form.Item
                name="userId"
                label="用户 ID"
                tooltip="用户 ID 只能包含字母、数字和下划线，长度限制为 3 到 16 个字符"
                rules={[
                    {
                        pattern: /^[A-Za-z0-9_]{3,16}$/,
                        message: "用户 ID 只能包含字母、数字和下划线，长度限制为 3 到 16 个字符",
                    },
                    {
                        required: true,
                        message: "请输入 ID!",
                    },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="userName"
                label="昵称"
                tooltip="你想让别人看到的名字"
                rules={[{
                    pattern: /^.{3,16}$/,
                    message: "昵称长度限制为 3 到 16 个字符"
                },
                {
                    required: true,
                    message: "请输入昵称!",
                    whitespace: false
                }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="password"
                label="密码"
                rules={[
                    {
                        pattern: /^[A-Za-z0-9_]{6,16}$/,
                        message: "用户 ID 只能包含字母、数字和下划线，长度限制为 3 到 16 个字符",
                    },
                    {
                        required: true,
                        message: "请输入密码!",
                    },
                ]}
                hasFeedback
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="confirm"
                label="确认密码"
                dependencies={["password"]}
                hasFeedback
                rules={[
                    {
                        required: true,
                        message: "请再次输入密码",
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("密码不一致"));
                        },
                    }),
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" style={{ display: "flex", justifyContent: "center" }}>
                    注册账号
                </Button>
            </Form.Item>
        </Form>
    );
};

const App: React.FC = () => {

    return (
        <Layout>
            <LoginLayout Component={RegisterScreen} />
        </Layout>
    );
};

export default App;