import { UserOutlined } from "@ant-design/icons";
import { Typography, Avatar, Space, Tooltip, Button, Layout, Form, Modal, message } from "antd";
import React, { useState } from "react";
import router from "next/router";

const { Title, Text } = Typography;

const MyAvatar: React.FC<any> = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    const info = () => {
        messageApi.error('请输入标签!');
      };

    const handleTitleClick = () => {
        localStorage.setItem("queryId", props.userId);
        router.push({
            pathname: "user_info",
        });
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleTagEdit = async () => {
        try {
            const values = await form.validateFields();
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            const friendId = props.userId;
            const tag = values.tag;
            const response = await fetch(`/api/friends/add_tag/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${token}`,
                },
                body: JSON.stringify({
                    userId,
                    friendId,
                    tag,
                }),
            });
            const data = await response.json();
            if (Number(data.code) === 0) {
                alert("编辑成功");
                router.push("/chat_interface");
            } else {
                alert(data.info);
            }
        } catch (error) {
                info();
        } finally {
            form.resetFields();
            setIsModalOpen(false);
        }
    };

    let title = (
        <Layout style={{ backgroundColor: "#ffffff" }}>
            <Space style={{ margin: 10 }}>
                <Avatar shape="square" src={props.avatarUrl} style={{ marginRight: 10, marginLeft: -10 }} />
                <Title level={5} onClick={handleTitleClick} style={{ margin: 5, color: "black", fontWeight: "bold", cursor: 'pointer' }}>
                    {props.userName}
                </Title>
            </Space>
            <Text style={{ margin: 5, color: "GrayText" }}>用户ID: {props.userId}</Text>
            <Button type="primary" onClick={showModal}>修改标签</Button>
        </Layout>
    );
    return (
        <>
            {contextHolder}
            <Tooltip color="#ffffff" style={{ color: "GrayText" }} placement="rightTop" title={title} arrow={true} trigger="contextMenu">
                <Avatar shape="square" src={props.avatarUrl} style={{ marginRight: "10px", marginLeft: "-40px" }} />
            </Tooltip>
            <Modal
                okText="确认"
                cancelText="取消"
                title="修改标签"
                open={isModalOpen}
                onOk={handleTagEdit}
                onCancel={handleCancel}
            >
                <Form
                    wrapperCol={{ span: 20 }}
                    form={form}>
                    <Form.Item
                        name="tag"
                        label="新标签"
                        rules={[{
                            required: true,
                            pattern: /^.{1,30}$/,
                            message: "最长为 30 个字符"
                        }]}>
                        <input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

const UserAvatar: React.FC<any> = (props) => {
    return (
        <Avatar onClick={
            () => {
                router.push({ pathname: "user_info", query: { userId: props.userId } });
            }} shape="square" icon={<UserOutlined />} />
    );
};

const OrdinaryAvatar: React.FC<any> = (props) => {
    return (
        <Avatar shape="square" src={props.avatarUrl} style={{ marginRight: "10px", marginLeft: "-40px" }} />
    );
};
export { MyAvatar, UserAvatar, OrdinaryAvatar };