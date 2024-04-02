import React, { ReactNode, useEffect, useState } from "react";
import { Avatar, Button, Layout, List, Menu, Modal, Space, Tag } from "antd";
import { Input } from "antd";
import type { SearchProps } from "antd/es/input/Search";
import { UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { FAILURE_PREFIX, USER_NOT_EXIST } from "../constants/string";

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const LoginLayout = ({ Component }: { Component: any }) => {
    const router = useRouter();

    interface SearchResult {
        id: string;
        name: string;
        avatar: string;
        isDeleted: boolean;
    }

    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState<React.ReactNode>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

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

    useEffect(() => {
        const storedAvatar = localStorage.getItem("avatar");
        if (storedAvatar && storedAvatar !== "undefined") {
            setAvatar(<Avatar src={storedAvatar} />);
        } else {
            setAvatar(<Avatar icon={<UserOutlined />} />);
        }
    }, [router]);

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
                <Search placeholder="搜索用户" onSearch={onSearch} style={{ width: 200, margin: "0 20px" }} loading={loading} />
                <Modal
                    open={showModal}
                    title={"搜索结果"}
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
                ©{new Date().getFullYear()} Created by TAsRight
            </Footer>
        </Layout>
    );
};

export default LoginLayout;