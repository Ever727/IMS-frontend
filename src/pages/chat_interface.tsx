import React, { useState } from "react";
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme, Input, Space } from "antd";
import { ScrollList } from "../components/ScrollList";
import SearchInput from "../components/SearchInput";
import TextInput from "../components/TextInput";
import { getLineHeight } from "antd/es/theme/internal";
import { MyAvatar } from "../components/Avatar";
import MenuItems from "../components/MenuItems";
import type { SearchProps } from "antd/es/input/Search";

const { Header, Content, Footer, Sider } = Layout;

const { Search } = Input;

type MenuItem = Required<MenuProps>["items"][number];

function getItemHead(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}


function getItem(
    key: React.Key,
    icon?: React.ReactNode,
): MenuItem {
    return {
        key,
        icon,
    } as MenuItem;
}

const Navigation = (link: string) => {
    window.location.href = link;
};

const items1 = [
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

const items2: MenuItem[] = [
    getItemHead("Option 1", "1", <PieChartOutlined />),
    getItemHead("Option 2", "2", <DesktopOutlined />),
    getItemHead("User", "sub1", <UserOutlined />, [
        getItem("3", <MenuItems name="Tom" num={10} />),
        getItem("4", <MenuItems name="Bill" num={100} />),
        getItem("5", <MenuItems name="Alice" />),
    ]),
    getItemHead("Team", "sub2", <TeamOutlined />, [getItemHead("Team 1", "6"), getItemHead("Team 2", "8")]),
    getItemHead("Files", "9", <FileOutlined />),
];


const App: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();


    const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
        setLoading(true);
        console.log(info?.source, value);

        // 模拟异步操作，比如发送搜索请求
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

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
                <Search placeholder="搜索用户" allowClear onSearch={onSearch} style={{ width: 200, margin: "0 20px" }} loading={loading} />
                <Menu
                    theme="dark"
                    mode="horizontal"
                    items={items1}
                    style={{ flex: 1, minWidth: 0 }}
                >
                    {items1.map((item) => (
                        <Menu.Item key={item.key} onClick={item.onClick}>
                            {item.label}
                        </Menu.Item>
                    ))}
                </Menu>
            </Header>
            <Layout>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} style={{ position: "fixed"}}>
                    <div className="demo-logo-vertical" style={{ height: "100vh", overflowY: "auto", paddingTop: 60 }}>
                        <Menu style={{ height: 0 , borderRight: 0}} theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={items2} />
                    </div>
                </Sider>

                <Layout>
                    <Content style={{ margin: "50px 5px 0 210px" }}>
                        <Breadcrumb style={{ margin: "16px 0" }}>
                            <Breadcrumb.Item>User</Breadcrumb.Item>
                            <Breadcrumb.Item>Bill</Breadcrumb.Item>
                        </Breadcrumb>
                        <div
                            style={{
                                padding: 24,
                                minHeight: 360,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                        </div>
                    </Content>
                    <Footer style={{ textAlign: "center" }}>
                        ©{new Date().getFullYear()} Created by Tasright
                    </Footer>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default App;