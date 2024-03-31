import React, { ReactNode, useEffect, useState } from "react";
import { Avatar, Layout, Menu, Space } from "antd";
import { Input } from "antd";
import type { SearchProps } from "antd/es/input/Search";
import { UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { FAILURE_PREFIX, USER_NOT_EXIST } from "../constants/string";

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const LoginLayout = ({ Component }: { Component: any }) => {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState<React.ReactNode>(null);

    const items = [
        {
            key: 1,
            label: "首页",
            link: "/index",
            onClick: () => router.push("/"),
        },
        {
            key: 2,
            label: "注册",
            link: "/register",
            onClick: () => router.push("/register"),
        },
        {
            key: 3,
            label: "登录",
            link: "/login",
            onClick: () => router.push("/login"),
        }
    ];

    useEffect(() => {
        const storedAvatar = localStorage.getItem("avatar");
        if (storedAvatar && storedAvatar !== "null") {
            setAvatar(<Avatar src={storedAvatar} />);
        } else {
            setAvatar(<Avatar icon={<UserOutlined />} />);
        }
    }, [router]);

    const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
        setLoading(true);
        console.log(info?.source, value);

        // 模拟异步操作，比如发送搜索请求
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    const UserInfo = () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            return null;
        }
        localStorage.setItem("queryId", userId as string);
        router.push({
            pathname: "user_info",
        });
    };



    return (
        <Layout>
            <Header style={{
                position: "fixed",
                top: 0,
                zIndex: 1,
                width: "100%",
                display: "flex",
                alignItems: "center"
            }}>
                <div className="demo-logo" />
                <Space size={30}>
                    <Avatar onClick={UserInfo} shape="square" icon={avatar} />
                </Space>
                <Search placeholder="搜索用户" allowClear onSearch={onSearch} style={{ width: 200, margin: "0 20px" }} loading={loading} />
                <Menu
                    theme="dark"
                    mode="horizontal"
                    items={items}
                    style={{ flex: 1, minWidth: 0 }}
                >
                    {items.map((item) => (
                        <Menu.Item key={item.key} onClick={item.onClick}>
                            {item.label}
                        </Menu.Item>
                    ))}
                </Menu>
            </Header>
            <Content style={{ padding: "0 0 0 0", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", verticalAlign: "center", textAlign: "center" }}>
                <Component {...Component} />
            </Content>
            <Footer style={{ textAlign: "center" }}>
                Ant Design ©{new Date().getFullYear()} Created by Ant UED
            </Footer>
        </Layout>
    );
};

export default LoginLayout;