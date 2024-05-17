import React, { use, useCallback, useEffect, useState } from "react";
import {
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Avatar, Layout, Menu, Input, Space, MenuProps, Modal, Button, List, Tag, message, Select } from "antd";
import { FriendListItem, FriendRequestItem, GroupListItem, GroupRequestItem } from "../components/MenuItems";
import type { SearchProps } from "antd/es/input/Search";
import { FAILURE_PREFIX, USER_NOT_EXIST } from "../api/string";
import { useRouter } from "next/router";
import HomePage from "../components/HomePage";
import { useTheme } from 'antd-style';
import type { SelectProps } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
const { Search } = Input;
type MenuItem = Required<MenuProps>["items"][number];

function getItemHead(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    onClick?: () => void,
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
        },
        onClick,
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
    const [groups, setGroups] = useState<MenuItem[]>([]); // 群聊列表
    const [friendRequests, setFriendRequests] = useState<MenuItem[]>([]);
    const [groupRequests, setGroupRequests] = useState<MenuItem[]>([]);
    const [items2, setItems2] = useState<MenuItem[]>([]);
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectItems, setSelectItems] = useState<SelectProps[]>([]); // 群聊成员可选项，与好友列表同步更新
    const [isModalOpen, setIsModalOpen] = useState([false, false]); // 控制创建群聊对话框是否可见
    const [selectValues, setSelectValues] = useState<string[]>([]); // 储存群聊成员选择
    const [newConv, setNewConv] = useState(false); // 如果通过了新的好友申请通过则刷新页面
    const token = useTheme();

    const handleNewConv = () => {
        setNewConv(!newConv);
    };

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        fetch(`api/chat/group_requests/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token}`,
            },
        })
            .then((res) => res.json())
            .then((res) => {
                if (Array.isArray(res.data)) {
                    let menuItems: MenuItem[] = Array.from(res.data).map((datum, index) => {
                        return {
                            //设置最大好友数为五千，实现菜单键值不重复
                            key: index,
                            icon: <GroupRequestItem {...datum!} /> as React.ReactNode,
                            style: {
                                height: 60,
                                // 设置列表每一项的高度
                            },
                        } as MenuItem;
                    });
                    setGroupRequests(menuItems);
                }
            });
    }, [router]);

    //创建群聊对话框的格式模板
    const toggleModal = (idx: number, target: boolean) => {
        setIsModalOpen((p) => {
            p[idx] = target;
            return [...p];
        });
    };

    const modalStyles = {
        header: {
            borderLeft: `5px solid ${token.colorPrimary}`,
            borderRadius: 0,
            paddingInlineStart: 5,
        },
        body: {
            boxShadow: 'inset 0 0 5px #999',
            borderRadius: 5,
        },
        mask: {
            backdropFilter: 'blur(10px)',
        },
        content: {
            boxShadow: '0 0 30px #999',
        },
    };

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
            getItemHead("发起群聊", "01", <TeamOutlined />, () => toggleModal(0, true)),
            getItemHead("好友", "sub1", <UserOutlined />, () => { }, friendships),
            getItemHead("群组", "sub2", <TeamOutlined />, () => { }, groups),
            getItemHead("好友请求", "sub3", <UserOutlined />, () => { }, friendRequests),
            getItemHead("群聊请求", "sub4", <PieChartOutlined />, () => { }, groupRequests),
        ]);
    }, [friendships, friendRequests, groupRequests, groups]);

    useEffect(() => {
        const storedAvatar = localStorage.getItem("avatar");
        if (storedAvatar && storedAvatar !== "undefined") {
            setAvatar(<Avatar src={storedAvatar} />);
        } else {
            setAvatar(<Avatar icon={<UserOutlined />} />);
        }
        let userId = localStorage.getItem("userId");
        let token = localStorage.getItem("token");
        const fetchFriendships = async () => {
            try {
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
                    // 和好友列表同步更新创建群聊可选项
                    let selections: SelectProps[] = data.map((datum, index) => {
                        return {
                            key: (index) as React.Key,
                            label: datum.userName,
                            value: datum.userId,
                            avatarUrl: datum.avatarUrl,
                        } as SelectProps;
                    });
                    setSelectItems(selections);
                }

            } catch (error: any) {
                message.error(error);
            }
        };

        const fetchFriendRequests = async () => {
            try {
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
                            icon: <FriendRequestItem
                                id={datum.id}
                                name={datum.name}
                                avatarUrl={datum.avatarUrl}
                                message={datum.message}
                                status={datum.status}
                            /> as React.ReactNode,
                            style: {
                                height: 60,
                                // 设置列表每一项的高度
                            },
                        } as MenuItem;
                    });
                    setFriendRequests(menuItems);
                }

            } catch (error: any) {
                message.error(error);
            }
        };
        fetchFriendRequests();
        fetchFriendships();
    }, [router]);

    useEffect(() => {
        let userId = localStorage.getItem("userId");
        let token = localStorage.getItem("token");
        const fetchGroups = async () => {
            try {
                let req = await fetch(`api/chat/get_conversation_ids/?userId=${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`,
                    },
                });
                let re = await req.json();
                const conversationIds: number[] = re.conversationIds;
                let idList = "";
                for (const convId of conversationIds) {
                    idList += "&id=" + convId;
                }
                const request = await fetch(`api/chat/conversations/?userId=${userId}${idList}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`,
                    },
                });
                let res = await request.json();
                let data = res.conversations.filter((conv: any) => conv.type == "group_chat");
                if (Array.isArray(data)) {
                    let items: MenuItem[] = data.map((datum, index) => {
                        return {
                            key: (index + 10000) as React.Key,
                            icon: <GroupListItem
                                groupName={datum.groupName}
                                avatarUrl={datum.avatarUrl}
                            /> as React.ReactNode,
                            style: {
                                height: 60,
                                // 设置列表每一项的高度
                            },
                        } as MenuItem;
                    });
                    setGroups(items);
                }
            } catch (error) {
                alert(error);
            }
        };
        fetchGroups();
    }, [router, newConv]);


    // 处理群聊成员选择
    const handleOnChange = (values: string[]) => {
        setSelectValues(values);
    };

    const handleMakeGroup = () => {
        toggleModal(0, false);
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        fetch(`api/chat/conversations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token}`,
            },
            body: JSON.stringify({
                userId: userId!,
                memberIds: selectValues,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (Number(res.code) === 0) {
                    message.success("创建群聊成功");
                }
                else if (Number(res.code) === -1) {
                    message.error(USER_NOT_EXIST);
                } else {
                    message.error(FAILURE_PREFIX + res.info);
                }
            })
            .catch((error) => {
                message.error(FAILURE_PREFIX + error);
            });
        handleNewConv();

    };

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
                    message.error(USER_NOT_EXIST);
                } else {
                    message.error(FAILURE_PREFIX + res.message);
                }
            })
            .catch((error) => {
                message.error(FAILURE_PREFIX + error);
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
                </Menu>
            </Header>
            <Modal
                title="创建群聊"
                okText="创建"
                cancelText="取消"
                open={isModalOpen[0]}
                onOk={handleMakeGroup}
                onCancel={() => toggleModal(0, false)}
                styles={modalStyles}
                destroyOnClose={true}
            >
                <Select
                    mode="multiple"
                    allowClear={true}
                    style={{ width: '100%' }}
                    placeholder="选择好友加入群聊"
                    defaultValue={[]}
                    onChange={handleOnChange}
                    options={selectItems}
                    optionRender={(option) => (
                        <Space>
                            <span role="img" aria-label={option.data.label}>
                                {<Avatar src={option.data.avatarUrl} />}
                            </span>
                            {option.data.label}
                        </Space>
                    )}
                />
            </Modal>
            <Layout>
                <Sider collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} style={{ position: "fixed" }}>
                    <div className="demo-logo-vertical" style={{ height: "100vh", overflowY: "auto", paddingTop: 60 }}>
                        <Menu style={{ height: 100, borderRight: 0 }} theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={items2} />
                    </div>
                </Sider>

                <Layout>
                    <Content style={{ margin: "50px 5px 0 210px" }}>
                        {/* 这里是主页面，去 HomePage.tsx 修改内容 */}
                        <HomePage />
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