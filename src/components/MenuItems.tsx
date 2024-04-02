import { MyAvatar, OrdinaryAvatar } from "../components/Avatar";
import { Space, Card, Button, Modal, Avatar, Layout, Tag, List, message } from "antd";
import router from "next/router";
import React, { useState } from "react";
const { Meta } = Card;

const FriendListItem: React.FC<any> = (props) => {
    return (
        <Space >
            <MyAvatar name={props.name} num={props.num} avatarUrl={props.avatarUrl} />
            <Meta
                title={props.name}
            />
        </Space>
    );
};

interface Props {
    id: string;
    name: string;
    avatarUrl: string;
    message: string;
    status: number;
}

const FriendRequestItem: React.FC<any> = (props: Props) => {
    const [showModal, setShowModal] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const controlModal = () => {
        setShowModal(true);
    };

    const handleOk = () => {
        const AcceptFriend = async () => {
            try {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");
                fetch(`api/friends/accept_friend`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`,
                    },
                    body: JSON.stringify({
                        senderId: props.id,
                        receiverId: userId,
                    }),
                });
            } catch (error) {
                alert(error);
            }
        };
        AcceptFriend();
        setShowModal(false);
        messageApi
            .open({
                type: 'success',
                content: '添加好友成功',
                duration: 0.5,
            })
            .then(() => router.push({ pathname: "chat_interface", }));

    };

    const handleCancel = () => {
        setShowModal(false);
    };

    const handleTitleClick = () => {
        localStorage.setItem("queryId", props.id);
        router.push({
            pathname: "user_info",
        });
    };

    return (
        <>
            {contextHolder}
            <Space onClick={controlModal}>
                <OrdinaryAvatar avatarUrl={props.avatarUrl} />
                <Meta
                    title={props.name}
                />
            </Space>
            <Modal
                open={showModal}
                onCancel={handleCancel}
                footer={Number(props.status) === 0
                    ? [
                        <Button key="Accept" type="primary" onClick={handleOk}>
                            接受
                        </Button>,
                        <Button key="Ignore" onClick={handleCancel}>
                            关闭
                        </Button>,
                    ]
                    : Number(props.status) === 1
                        ? [<Tag key="accepted" color="success">已接受</Tag>]
                        : Number(props.status) === 2
                            ? [<Tag key="expired" color="error">已过期</Tag>]
                            : []}
            >   <List
                    itemLayout="horizontal"
                    dataSource={[props]}
                    renderItem={(props: Props) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar shape="square" src={props.avatarUrl} size={80} />}
                                title={<a onClick={handleTitleClick}>
                                    {props.name}
                                </a>}
                                description={props.message}

                            />
                        </List.Item>
                    )}
                />
            </Modal >
        </>
    );
};

export { FriendListItem, FriendRequestItem };
