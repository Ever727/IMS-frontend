import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { Input } from "antd";
import type { SearchProps } from "antd/es/input/Search";

const { Header, Content, Footer } = Layout;

const Navigation = (link: string) => {
    window.location.href = link;
};

const items = [
    {
        key: 1,
        label: "首页",
        link: "/index",
        onClick: () => Navigation("/"),
    },
    {
        key: 2,
        label: "注册",
        link: "/register",
        onClick: () => Navigation("/register"),
    },
    {
        key: 3,
        label: "登录",
        link: "/login",
        onClick: () => Navigation("/login"),
    }
];


const { Search } = Input;

const LoginLayout = ({ Component }: { Component: any }) => {
    const [loading, setLoading] = useState(false);

    const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
        setLoading(true);
        console.log(info?.source, value);

        // 模拟异步操作，比如发送搜索请求
        setTimeout(() => {
            setLoading(false);
        }, 500);
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