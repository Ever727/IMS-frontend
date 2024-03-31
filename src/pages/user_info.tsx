import React, { useState, useEffect } from "react";
import { Avatar, Form, Button, Layout, DescriptionsProps, Descriptions, Modal, Input, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import LoginLayout from "../components/LoginUI";

const UserInfo: React.FC = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [storedUserId, setStoredUserId] = useState<string | null>(null);
    const [storedQueryId, setStoredQueryId] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [borderedItems, setBorderedItems] = useState<DescriptionsProps["items"]>([
        {
            key: "1",
            label: "用户ID",
            children: "Null",
        },
        {
            key: "2",
            label: "昵称",
            children: "Null",
        },
        {
            key: "3",
            label: "邮箱",
            children: "Null",
        },
        {
            key: "4",
            label: "电话号码",
            children: "Null",
        },
        {
            key: "5",
            label: "头像",
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
                            label: "用户ID",
                            children: data.userId,
                        },
                        {
                            key: "2",
                            label: "昵称",
                            children: data.userName,
                        },
                        {
                            key: "3",
                            label: "邮箱",
                            children: data.email,
                        },
                        {
                            key: "4",
                            label: "电话号码",
                            children: data.phoneNumber,
                        },
                        {
                            key: "5",
                            label: "头像",
                            children: (<Avatar src={data.avatar} size={100} shape="square" />),
                        },
                    ];
                    setBorderedItems(updatedBorderedItems);
                }
            } catch (error) {
                alert(error);
            }
        };
        fetchData();
    }, [router]);

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



    return (
        <div style={{ left: "38%", position: "absolute" }}>
            <Descriptions
                style={{ textAlign: "left", display: "flex", flexDirection: "column", width: "200%" }}
                size="default"
                bordered
                column={1}
                title="用户信息"
                extra={storedQueryId === storedUserId ?
                    <>
                        <Button type="primary" style={{ marginRight: "10px" }} onClick={() => showModal()}>编辑</Button>
                        <Button type="primary" danger onClick={() => {
                            handleDelete();
                        }}>注销</Button>
                        <Modal
                            title="编辑资料"
                            visible={isModalVisible}
                            onOk={handleEdit}
                            onCancel={handleCancel}
                        >
                            <Form
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 20 }}
                                form={form}>
                                <Form.Item
                                    label="新昵称"
                                    name="newName"
                                    rules={[{
                                        pattern: /^.{3,16}$/,
                                        message: "昵称长度限制为 3 到 16 个字符"
                                    }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="新邮箱"
                                    name="newEmail"
                                    rules={[{}, {
                                        type: "email",
                                        message: "请输入正确的邮箱格式"
                                    }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="新电话号码"
                                    name="newPhoneNumber"
                                    rules={[{
                                        pattern: /^1[3-9]\d{9}$/,
                                        message: "请输入正确的手机号码"
                                    }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="新密码"
                                    name="newPassword"
                                    rules={[{
                                        pattern: /^[A-Za-z0-9_]{6,16}$/,
                                        message: "密码只能包含字母、数字和下划线，长度限制为 6 到 16 个字符",
                                    }]}
                                >
                                    <Input.Password />
                                </Form.Item>
                                <Form.Item name="newAvatarUrl" style={{ display: "none" }}></Form.Item>
                                <Upload action="/upload.do" listType="picture-card" maxCount={1} beforeUpload={handleBeforeUpload} withCredentials={false}>
                                    <button style={{ border: 0, background: "none" }} type="button">
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>上传头像</div>
                                    </button>
                                </Upload>
                                <Form.Item
                                    label="确认密码"
                                    name="password"
                                    rules={[{ required: true, message: "请确认密码!" }]}
                                >
                                    <Input.Password />
                                </Form.Item>
                            </Form>
                        </Modal>

                    </>
                    : null}
                //  需判断是否为好友，若是好友则显示删除按钮，否则显示添加按钮
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