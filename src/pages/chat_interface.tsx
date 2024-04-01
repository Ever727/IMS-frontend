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
import { FriendListItem, FriendRequestItem } from "../components/MenuItems";
import type { SearchProps } from "antd/es/input/Search";
import { SideButton } from "../components/Buttons";
import { FAILURE_PREFIX, USER_NOT_EXIST } from "../constants/string";
const { Header, Content, Footer, Sider } = Layout;
import { useRouter } from "next/router";
import { json } from "stream/consumers";

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
    const [friendships, setFriendships] = useState<MenuItem[]>([]);
    const [friendRequests, setFriendRequests] = useState<MenuItem[]>([]);
    const [friendsChange, setFriendsChange] = useState(true);
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const change = () => {
        setFriendsChange(true);
    };
    const dischange = () => {
        setFriendsChange(false);
    };

    const items2: MenuItem[] = [
        getItemHead("Option 1", "01", <PieChartOutlined />),
        getItemHead("Option 2", "02", <DesktopOutlined />),
        getItemHead("User", "sub1", <UserOutlined />, friendships),
        getItemHead("Team", "sub2", <TeamOutlined />, [getItemHead("Team 1", "6"), getItemHead("Team 2", "8")]),
        getItemHead("Friend Request", "sub3", <UserOutlined />, friendRequests),
    ];

    useEffect(() => {
        const storedAvatar = localStorage.getItem("avatar");
        if (storedAvatar && storedAvatar !== "undefined") {
            setAvatar(<Avatar src={storedAvatar} />);
        } else {
            setAvatar(<Avatar icon={<UserOutlined />} />);
        }

        const fetchFriendships = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const token = localStorage.getItem("token");
                const request = await fetch(`api/friends/myfriends/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`,
                    },
                });
                const datas = await request.json();
                const data = datas.data;
                if (Array.isArray(data)) {
                    const menuItems: MenuItem[] = data.map((dat, index) => {
                        return {
                            key: (index) as React.Key,
                            icon: <FriendListItem name={dat.name} avatarUrl={dat.avatarUrl} message={dat.message} status={dat.status} /> as React.ReactNode,
                        } as MenuItem;
                    });
                    if (friendsChange) {
                        setFriendships(menuItems);
                        dischange();
                    }

                }

            } catch (error) {
                alert(error);
            }
        };

        const fetchFriendRequests = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const token = localStorage.getItem("token");
                const request = await fetch(`api/friends/myrequests/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`,
                    },
                });
                const datas = await request.json();
                const data = datas.data;
                if (Array.isArray(data)) {
                    const menuItems: MenuItem[] = data.map((dat, index) => {
                        return {
                            //设置最大好友数为五千，实现菜单键值不重复
                            key: (index + 5000) as React.Key,
                            icon: <FriendRequestItem id={dat.id} name={dat.name} avatarUrl={dat.avatarUrl} message={dat.message} status={dat.status} /> as React.ReactNode,
                        } as MenuItem;
                    });
                    if (friendsChange) {
                        setFriendRequests(menuItems);
                        dischange();
                    }

                }

            } catch (error) {
                alert(error);
            }
        };
        fetchFriendRequests();
        fetchFriendships();
    }, [router, friendRequests, friendships, friendsChange]);

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
                        <Menu style={{ height: 100, borderRight: 0 }} theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={items2} />
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