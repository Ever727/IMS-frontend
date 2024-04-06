import React, { use, useCallback, useEffect, useState } from "react";
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Avatar, Breadcrumb, Layout, Menu, theme, Input, Space, MenuProps, Modal, Button, List, Tag, Divider } from "antd";
import { MyAvatar, UserAvatar } from "../components/Avatar";
import { FriendListItem, FriendRequestItem } from "../components/MenuItems";
import type { SearchProps } from "antd/es/input/Search";
import { SideButton } from "../components/Buttons";
import { FAILURE_PREFIX, USER_NOT_EXIST } from "../constants/string";
const { Header, Content, Footer, Sider } = Layout;
import { useRouter } from "next/router";
import { useLocalStorageState, useRequest } from 'ahooks';
import styles from '../components/HomePage.module.css';
import Chatbox from '../components/Chatbox';
import ConversationSelection from '../components/ConversationSelection';
import {
    addConversation,
    joinConversation,
    leaveConversation,
    useMessageListener,
} from '../api/chat';
import { db } from '../api/db';

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
        style: {
            marginTop: 10,
            marginBottom: 10,
        }
        // 用于调整菜单项间距，并非菜单项的子项
    } as MenuItem;
}

const App: React.FC = () => {
    const router = useRouter();

    interface SearchResult {
        id: string;
        name: string;
        avatar: string;
        isDeleted: boolean;
    }

    const [avatar, setAvatar] = useState<React.ReactNode>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [friendships, setFriendships] = useState<MenuItem[]>([]);
    const [friendRequests, setFriendRequests] = useState<MenuItem[]>([]);
    const [items2, setItems2] = useState<MenuItem[]>([]);
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const items1 = [
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
        setItems2([
            getItemHead("Option 1", "01", <PieChartOutlined />),
            getItemHead("Option 2", "02", <DesktopOutlined />),
            getItemHead("好友", "sub1", <UserOutlined />, friendships),
            getItemHead("群组", "sub2", <TeamOutlined />, [getItemHead("Team 1", "6"), getItemHead("Team 2", "8")]),
            getItemHead("好友请求", "sub3", <UserOutlined />, friendRequests),
        ]);
    }, [friendships, friendRequests]);

    useEffect(() => {
        const storedAvatar = localStorage.getItem("avatar");
        if (storedAvatar && storedAvatar !== "undefined") {
            setAvatar(<Avatar src={storedAvatar} />);
        } else {
            setAvatar(<Avatar icon={<UserOutlined />} />);
        }

        const fetchFriendships = async () => {
            try {
                let userId = localStorage.getItem("userId");
                let token = localStorage.getItem("token");
                const request = await fetch(`api/friends/myfriends/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`,
                    },
                });
                let res = await request.json();
                let data = res.data;
                if (Array.isArray(data)) {
                    let menuItems: MenuItem[] = data.map((datum, index) => {
                        return {
                            key: (index) as React.Key,
                            icon: <FriendListItem
                                userName={datum.userName}
                                avatarUrl={datum.avatarUrl}
                                userId={datum.userId}
                                tag={datum.tag}
                            /> as React.ReactNode,
                            style: {
                                height: 60,
                                // 设置列表每一项的高度
                            },
                        } as MenuItem;
                    });
                    setFriendships(menuItems);
                }

            } catch (error) {
                alert(error);
            }
        };

        const fetchFriendRequests = async () => {
            try {
                let userId = localStorage.getItem("userId");
                let token = localStorage.getItem("token");
                const request = await fetch(`api/friends/myrequests/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`,
                    },
                });
                let res = await request.json();
                let data = res.data;
                if (Array.isArray(data)) {
                    let menuItems: MenuItem[] = data.map((datum, index) => {
                        return {
                            //设置最大好友数为五千，实现菜单键值不重复
                            key: (index + 5000) as React.Key,
                            icon: <FriendRequestItem id={datum.id} name={datum.name} avatarUrl={datum.avatarUrl} message={datum.message} status={datum.status} /> as React.ReactNode,
                            style: {
                                height: 60,
                                // 设置列表每一项的高度
                            },
                        } as MenuItem;
                    });
                    setFriendRequests(menuItems);
                }

            } catch (error) {
                alert(error);
            }
        };
        fetchFriendRequests();
        fetchFriendships();
    }, [router]);

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
                            isDeleted: res.isDeleted,
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

    // 使用localStorage状态管理当前用户(me)和活跃会话ID(activeChat)，页面刷新后可以保持不变
    const [me, setMe] = useLocalStorageState('useId', { defaultValue: 'test' });
    const [activeChat, setActiveChat] = useLocalStorageState<number | null>(
        'activeChat',
        { defaultValue: null }
    );
    const { data: conversations, refresh } = useRequest(async () => {
        const convs = await db.conversations.toArray();
        return convs.filter((conv) => conv.members.includes(me!));
    }); // 当前用户的会话列表

    // 本地消息数据最后更新时间，用于触发聊天框的更新
    const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
    const update = useCallback(() => {
        // 更新函数，从后端拉取消息，合并到本地数据库
        db.pullMessages(me!).then(() => {
            refresh();
            setLastUpdateTime(Date.now());
        });
    }, [me, refresh]);

    useEffect(() => {
        setMe(localStorage.getItem("userId") as string);
    }, []);

    useEffect(() => {
        update();
    }, [update]);

    useEffect(() => {
        db.activeConversationId = activeChat || null;
        if (activeChat) {
            db.clearUnreadCount(activeChat).then(refresh);
        }
    }, [activeChat, refresh]);

    useMessageListener(update, me!); // 使用消息监听器钩子，当有新消息时调用更新函数

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
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar src={item.avatar} />}
                                    title={
                                        <>
                                            <a>
                                                {item.id}
                                            </a>
                                            {item.isDeleted ? <Tag color="error" style={{ marginLeft: 8 }}>已注销</Tag> : null}
                                        </>
                                    }
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
                <Sider collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} style={{ position: "fixed" }}>
                    <div className="demo-logo-vertical" style={{ height: "100vh", overflowY: "auto", paddingTop: 60 }}>
                        <Menu style={{ height: 100, borderRight: 0 }} theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={items2} />
                    </div>
                </Sider>

                <Layout>
                    <Content style={{ margin: "50px 5px 0 210px" }}>
                        <div className={styles.wrap}>
                            <div className={styles.container}>
                                <div className={styles.settings}>
                                    <div className={styles.form}>
                                        <Divider className={styles.divider} />
                                        <div className={styles.conversations}>
                                            <ConversationSelection // 会话选择组件
                                                me={me!}
                                                conversations={conversations || []}
                                                onSelect={(id) => setActiveChat(id)}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.chatBox}>
                                        <Chatbox // 聊天框组件
                                            me={me!}
                                            conversation={
                                                // 根据活跃会话ID找到对应的会话对象
                                                activeChat
                                                    ? conversations?.find((item) => item.id === activeChat)
                                                    : undefined
                                            }
                                            lastUpdateTime={lastUpdateTime}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <SideButton />
                    </Content>
                    <Footer style={{ textAlign: "center" }}>
                        ©{new Date().getFullYear()} Created by TAsRight
                    </Footer>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default App;