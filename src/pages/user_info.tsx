import React, { useState, useEffect } from "react";
import { Avatar, Form, Button, Layout, DescriptionsProps, Descriptions, Modal, Input, Upload, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import LoginLayout from "../components/LoginUI";

const UserInfo: React.FC = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [storedUserId, setStoredUserId] = useState<string | null>(null);
    const [storedQueryId, setStoredQueryId] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [borderedItems, setBorderedItems] = useState<DescriptionsProps["items"]>([
        {
            key: "1",
            label: "头像",
            children: "Null",
        },
        {
            key: "2",
            label: "用户ID",
            children: "Null",
        },
        {
            key: "3",
            label: "昵称",
            children: "Null",
        },
        {
            key: "4",
            label: "邮箱",
            children: "Null",
        },
        {
            key: "5",
            label: "电话号码",
            children: "Null",
        },
    ]);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const queryId = localStorage.getItem("queryId");
                setStoredUserId(userId);
                setStoredQueryId(queryId);

                if (queryId) {
                    const response = await fetch(`/api/profile/${queryId}`, {
                        method: "GET",
                    });
                    const data = await response.json();

                    const updatedBorderedItems = [
                        {
                            key: "1",
                            label: "头像",
                            children: (<Avatar src={data.avatarUrl} size={100} shape="square" />),
                        },
                        {
                            key: "2",
                            label: "用户ID",
                            children: data.userId,
                        },
                        {
                            key: "3",
                            label: "昵称",
                            children: data.userName,
                        },
                        {
                            key: "4",
                            label: "邮箱",
                            children: data.email,
                        },
                        {
                            key: "5",
                            label: "电话号码",
                            children: data.phoneNumber,
                        },

                    ];
                    setBorderedItems(updatedBorderedItems);
                }
            } catch (error) {
                alert(error);
            }
        };

        const checkFriendStatus = async () => {
            try {
                const response = await fetch(`/api/friends/check_friendship`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        userId: storedUserId,
                        friendId: storedQueryId,
                    }),
                });
                const data = await response.json();
                setIsFriend(data.friendshipStatus);
                setIsDeleted(data.deleteStatus);
            } catch (error) {
                alert(error);
            }
        };

        checkFriendStatus();
        fetchData();
    }, [router, storedQueryId, storedUserId, isModalVisible, isFriend, isDeleted, borderedItems]);

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/delete/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${token}`,
                },
                body: JSON.stringify({
                    userId: storedUserId,
                    password: prompt("请输入密码以确认注销"),
                }),
            });
            const data = await response.json();
            if (Number(data.code) === 0) {
                alert("注销成功");
                localStorage.removeItem("userId");
                localStorage.removeItem("queryId");
                localStorage.removeItem("token");
                localStorage.removeItem("userName");
                localStorage.removeItem("avatar");
                router.push("/");
            } else {
                alert(data.info);
            }
        } catch (error) {
            alert(error);
        }
    };

    const handleEdit = async () => {
        try {
            form.validateFields().then(async (values) => {
                const token = localStorage.getItem("token");
                const response = await fetch(`/api/update_profile/${storedUserId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`,
                    },
                    body: JSON.stringify({
                        userId: storedUserId,
                        ...values,
                    }),
                });
                const data = await response.json();
                if (Number(data.code) === 0) {
                    alert("编辑成功");
                    if (values.newName)
                        localStorage.setItem("userName", values.newName);
                    if (values.newAvatarUrl)
                        localStorage.setItem("avatar", values.newAvatarUrl);
                    router.push("/user_info");
                } else {
                    alert(data.info);
                }
            });
        } catch (error) {
            alert(error);
        }
        setIsModalVisible(false);
    };

    const handleBeforeUpload = async (file: any) => {
        const reversibleString = await convertToReversibleString(file);
        form.setFieldValue("newAvatarUrl", reversibleString);
        // 返回 false 阻止默认上传行为
        return false;
    };

    const convertToReversibleString = (file: Blob) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const image = new Image();
                image.onload = function () {
                    const canvas = document.createElement("canvas");
                    canvas.width = image.width;
                    canvas.height = image.height;
                    const context = canvas.getContext("2d")!;
                    context.drawImage(image, 0, 0);
                    const reversibleString = canvas.toDataURL("image/jpeg");
                    resolve(reversibleString);
                };
                image.src = e.target!.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleAddFriend = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/friends/add_friend`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${token}`,
                },
                body: JSON.stringify({
                    userId: storedUserId,
                    searchId: storedQueryId,
                    message: prompt("请输入添加好友时的留言"),
                }),
            });
            const data = await response.json();
            if (Number(data.code) === 0) {
                alert("发送请求成功");
            } else {
                alert(data.info);
            }
        } catch (error) {
            alert(error);
        }
    };

    const handleDeleteFriend = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/friends/delete_friend`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${token}`,
                },
                body: JSON.stringify({
                    userId: storedUserId,
                    friendId: storedQueryId,
                }),
            });
            const data = await response.json();
            if (Number(data.code) === 0) {
                alert("删除好友成功");
                setIsFriend(false);
            } else {
                alert(data.info);
            }
        } catch (error) {
            alert(error);
        }
    };

    return (
        <div style={{ left: "38%", position: "absolute" }}>
            <Descriptions
                style={{ textAlign: "left", display: "flex", flexDirection: "column", width: "200%" }}
                size="default"
                bordered
                column={1}
                title="用户信息"
                extra={
                    storedQueryId === storedUserId ? (
                        <>
                            <Button type="primary" style={{ marginRight: "10px" }} onClick={() => showModal()}>
                                编辑
                            </Button>
                            <Button type="primary" danger onClick={() => handleDelete()}>
                                注销
                            </Button>
                            <Modal
                                title="编辑资料"
                                open={isModalVisible}
                                onOk={handleEdit}
                                onCancel={handleCancel}
                            >
                                {/* Modal 内容 */}
                            </Modal>
                        </>
                    ) : isDeleted === true ? (
                        isFriend === true ? (
                            <>
                                <Tag color="error">已注销</Tag>
                                <Button type="primary" danger onClick={() => handleDeleteFriend()}>
                                    删除好友
                                </Button>
                            </>
                        ) : (
                            <Tag color="error">已注销</Tag>
                        )
                    ) : isFriend === true ? (
                        <Button type="primary" danger onClick={() => handleDeleteFriend()}>
                            删除好友
                        </Button>
                    ) : (
                        <Button type="primary" onClick={() => handleAddFriend()}>
                            添加好友
                        </Button>
                    )
                }
                items={borderedItems}
            />
            <br />
            <br />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <Layout>
            <LoginLayout Component={UserInfo} />
        </Layout>
    );
};

export default App;