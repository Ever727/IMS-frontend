import React, { useState } from "react";
import { Card, Avatar, Form, Space, Typography, Button, Layout, } from "antd";
import { UserOutlined } from "@ant-design/icons";
const { Header, Sider } = Layout;
const { Text } = Typography;
import { FAILURE_PREFIX, USER_NOT_EXIST } from "../constants/string";
import { useRouter } from "next/router";

const UserInfo: React.FC = () => {
    const router = useRouter();
    let userId = router.query.userId;
    let userName = router.query.userName;
    let avatar = router.query.avatar;
    let email = router.query.email;
    let phoneNumber = router.query.phoneNumber;

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header style={{
                position: "fixed",
                top: 0,
                zIndex: 1,
                width: "100%",
                display: "flex",
                alignItems: "center"
            }}>
                <div className="demo-logo" />
                <p style={{ fontWeight: "bold", color: "#ffffff", fontSize: 20 }}>User Info</p>
            </Header>
            <Layout >
                <Sider style={{}}>
                    <Avatar style={{ marginTop: 100, marginLeft: 50 }} icon={<UserOutlined />} size={80} />
                </Sider>
                <Layout style={{ marginTop: 100, marginLeft: 50 }}>
                    <Space direction="vertical">
                        <Typography.Text style={{ fontSize: 20, margin: 40 }}>
                            <span style={{ fontWeight: "bold" }}>Name: </span>
                            <Typography.Text editable={false} style={{ fontSize: 20, margin: 10, width: 500 }}>
                                {userName}
                            </Typography.Text>
                            {/*                             <Typography.Text editable style={{ fontSize: 20, margin: 10, width: 500 }}>
                                User Name
                            </Typography.Text>
                            <Button style={{ margin: 20, width: 80 }} type="primary" onClick={() => { }}>
                                Upload
                            </Button> */}
                        </Typography.Text>
                        <Text style={{ fontSize: 20, margin: 40 }}>
                            <span style={{ fontWeight: "bold" }}>User ID: </span>
                            {userId}
                        </Text>
                        <Text style={{ fontSize: 20, margin: 40 }}>
                            <span style={{ fontWeight: "bold" }}>Email: </span>
                            <Typography.Text editable={false} style={{ fontSize: 20, margin: 10, width: 500 }}>
                                {email}
                            </Typography.Text>
                            {/*                             <Button style={{ margin: 20, width: 80 }} type="primary" onClick={() => { }}>
                                Upload
                            </Button> */}
                        </Text>
                        <Text style={{ fontSize: 20, margin: 40 }}>
                            <span style={{ fontWeight: "bold" }}>Phone number: </span>
                            {phoneNumber}
                            {/*                             <Button style={{ margin: 20, width: 80 }} type="primary" onClick={() => { }}>
                                Upload
                            </Button> */}
                        </Text>
                    </Space>
                </Layout>
            </Layout>

        </Layout>
    );
};

export default UserInfo;