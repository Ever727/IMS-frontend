import React, { useState } from "react";
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { ScrollList } from "../components/ScrollList";
import SearchInput from "../components/SearchInput";
import TextInput from "../components/TextInput";
import { getLineHeight } from "antd/es/theme/internal";
import { MyAvatar } from "../components/Avatar";
import MenuItems from "../components/MenuItems";

const { Header, Content, Footer, Sider } = Layout;

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

const items: MenuItem[] = [
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
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="demo-logo-vertical" style={{ height: "100vh", overflowY: "auto" }}>
                    <Menu style={{ height: 0 }} theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={items} />
                </div>
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content style={{ margin: "0 16px" }}>
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
    );
};

export default App;