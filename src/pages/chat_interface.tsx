import React, { useEffect, useState } from "react";
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Avatar, Breadcrumb, Layout, Menu, theme, Input, Space, MenuProps, Modal, Button, List } from "antd";
import { MyAvatar, UserAvatar } from "../components/Avatar";
import MenuItems from "../components/MenuItems";
import type { SearchProps } from "antd/es/input/Search";
import { SideButton } from "../components/Buttons";
import { FAILURE_PREFIX, USER_NOT_EXIST } from "../constants/string";
const { Header, Content, Footer, Sider } = Layout;
import { useRouter } from "next/router";

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
    const router = useRouter();

    interface SearchResult {
        id: string;
        name: string;
        avatar: string;
    }

    const [avatar, setAvatar] = useState<React.ReactNode>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    useEffect(() => {
        const storedAvatar = localStorage.getItem("avatar");
        if (storedAvatar && storedAvatar !== "undefined") {
            setAvatar(<Avatar src={storedAvatar} />);
        } else {
            setAvatar(<Avatar icon={<UserOutlined />} />);
        }
    }, [router]);
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleOk = () => {
        localStorage.setItem("queryId", searchResults[0].id as string);
        router.push({
            pathname: "user_info",
        });
        setShowModal(false);
    };

    const handleCancel = () => {
        setShowModal(false);
    };

    const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token || !value) {
            setLoading(false);
            return;
        }

        const queryId = value;
        localStorage.setItem("queryId", queryId);

        fetch(`/api/search/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token}`,
            },
            body: JSON.stringify({
                searchId: queryId,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (Number(res.code) === 0) {
                    setSearchResults([
                        {
                            id: res.id,
                            name: res.name,
                            avatar: res.avatarUrl,
                        },
                    ]);
                    setShowModal(true);
                } else if (Number(res.code) === -1) {
                    alert(USER_NOT_EXIST);
                } else {
                    alert(FAILURE_PREFIX + res.message);
                }
            })
            .catch((error) => {
                alert(FAILURE_PREFIX + error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const UserInfo = () => {
        const userId = localStorage.getItem("userId");
        localStorage.setItem("queryId", userId as string);
        router.push({
            pathname: "user_info",
        });
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
                <Space size={30}>
                    <Avatar onClick={UserInfo} shape="square" icon={avatar} />
                </Space>
                <Search placeholder="搜索用户" onSearch={onSearch} style={{ width: 200, margin: "0 20px" }} loading={loading} />
                <Modal
                    open={showModal}
                    title="搜索结果"
                    onOk={handleOk}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="submit" type="primary" onClick={handleOk}>
                            访问
                        </Button>,
                        <Button key="back" onClick={handleCancel}>
                            返回
                        </Button>,
                    ]}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={searchResults}
                        renderItem={(item, index) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar src={item.avatar} />}
                                    title={<a >{item.id}</a>}
                                    description={item.name}
                                />
                            </List.Item>
                        )}
                    />
                </Modal>
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
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} style={{ position: "fixed" }}>
                    <div className="demo-logo-vertical" style={{ height: "100vh", overflowY: "auto", paddingTop: 60 }}>
                        <Menu style={{ height: 0, borderRight: 0 }} theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={items2} />
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
                        <SideButton />
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