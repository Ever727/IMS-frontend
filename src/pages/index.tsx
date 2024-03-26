import React from "react";
import { QqOutlined } from "@ant-design/icons";
import { Space, Button, Flex, Layout } from "antd";
import router from "next/router";
import LoginLayout from "../components/LoginUI";


const Interface = (colorBgContainer: string, borderRadiusLG: number) => {
    return (
        <div
            style={{
                background: colorBgContainer,
                minHeight: 240,
                padding: 240,
                borderRadius: borderRadiusLG,
            }}
        >
            <><div>
                <Space>
                    <QqOutlined style={{ fontSize: "240px" }} />
                </Space>
            </div><div style={{ display: "flex", justifyContent: "center" }}>
                    <Flex align="flex-start" gap="middle">
                        <Button type="primary" size="large" style={{ width: 100 }} onClick={() => router.push("/register")}>注册</Button>
                        <Button type="primary" size="large" style={{ width: 100 }} onClick={() => router.push("/login")}>登录</Button>
                    </Flex></div></>
        </div>
    );
};

const App: React.FC = () => {

    return (
        <Layout>
            <LoginLayout Component={Interface} />
        </Layout>
    );
};

export default App;