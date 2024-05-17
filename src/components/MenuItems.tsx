import { MyAvatar, OrdinaryAvatar } from "../components/Avatar";
import { Card, Button, Modal, Avatar, Tag, List, message, Flex } from "antd";
import router from "next/router";
import React, { useState } from "react";
const { Meta } = Card;

const FriendListItem: React.FC<any> = (props) => {
    return (
        <Flex gap={"large"} align="center" justify="flex-start">
            <MyAvatar userName={props.userName} avatarUrl={props.avatarUrl} userId={props.userId} tag={props.tag} />
            <Meta title={props.userName} />
            {props.tag && <Tag color="#2db7f5" bordered={false}>{props.tag}</Tag>}
        </Flex>
    );
};

const GroupListItem: React.FC<any> = (props) => {
    return (
        <Flex gap={"large"} align="center" justify="flex-start">
            <OrdinaryAvatar groupName={props.groupName} avatarUrl={props.avatarUrl} />
            <Meta title={props.groupName} />
        </Flex>
    );
};

interface Props {
    id: string;
    name: string;
    avatarUrl: string;
    message: string;
    status: number;
}

interface GroupInvitationsProps {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    receiverId: string;
    receiverName: string;
    receiverAvatar: string;
    conversationId: string;
    conversationName: string;
    conversationAvatar: string;
    timestamp: number;
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
            } catch (error: any) {
                message.error(error);
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
            <Flex gap={"large"} align="center" justify="space-between" onClick={controlModal}>
                <OrdinaryAvatar avatarUrl={props.avatarUrl} />
                <Meta title={props.name} />
                {props.status === 0 && <Tag color="orange" bordered={false}>等待验证</Tag>}
                {props.status === 1 && <Tag color="success" bordered={false}>已接受</Tag>}
                {props.status === 2 && <Tag color="error" bordered={false}>已过期</Tag>}
            </Flex>
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

const GroupRequestItem: React.FC<any> = (props: GroupInvitationsProps) => {
    const [showModal, setShowModal] = useState(false);
    const controlModal = () => {
        setShowModal(true);
    };

    const handleOk = () => {
        const AcceptGroup = () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            fetch(`api/chat/accept_group_invitation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${token}`,
                },
                body: JSON.stringify({
                    invitationId: props.id,
                    userId: userId,
                }),
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.code === 0) {
                        message.success('已同意加入群聊');
                    } else {
                        message.error(`操作失败：${res.info}`);
                    }
                })
                .catch((error) => {
                    message.error(`操作失败：${error}`);
                });
        };
        AcceptGroup();
        setShowModal(false);
    };

    const handleCancel = () => {
        setShowModal(false);
    };

    const handleTitleClick = (id: string) => {
        localStorage.setItem("queryId", id);
        router.push({
            pathname: "user_info",
        });
    };

    const formattedTime = new Date(props.timestamp).toLocaleTimeString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return (
        <>
            <Flex gap={"large"} align="center" justify="space-between" onClick={controlModal}>
                <OrdinaryAvatar avatarUrl={props.receiverAvatar} />
                <Meta title={props.receiverName} />
            </Flex>
            <Modal
                open={showModal}
                onCancel={handleCancel}
                footer={[
                    <Button key="Accept" type="primary" onClick={handleOk}>
                        接受
                    </Button>,
                    <Button key="Ignore" onClick={handleCancel}>
                        关闭
                    </Button>,
                ]}
            >
                <List
                    itemLayout="vertical"
                    header={
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Avatar shape="square" src={props.conversationAvatar} />
                            群聊 <h3>{props.conversationName}</h3>
                        </div>
                    }
                    footer={
                        <>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Avatar shape="square" src={props.senderAvatar} />
                                来自 {
                                    <a
                                        onClick={() => handleTitleClick(props.senderId)}
                                        style={{
                                            fontWeight: 'bold',
                                            color: 'black',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        {props.senderName}
                                    </a>
                                } 的邀请

                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                {formattedTime}
                            </div>
                        </>
                    }
                    dataSource={[props]}
                    renderItem={(props: GroupInvitationsProps) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar shape="square" src={props.receiverAvatar} />}
                                title={<a onClick={() => handleTitleClick(props.receiverId)}>
                                    {props.receiverName}
                                </a>}
                                description={`申请加入群聊`}
                            />
                        </List.Item>
                    )}
                />
            </Modal >
        </>
    );
};

export { FriendListItem, FriendRequestItem, GroupRequestItem, GroupListItem };
