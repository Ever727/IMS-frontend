import { MyAvatar, OrdinaryAvatar } from "../components/Avatar";
import { Space, Card, Button, Modal, Avatar, Layout } from "antd";
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

const FriendRequestItem: React.FC<any> = (props) => {
    const [showModal, setShowModal] = useState(false);
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
    };

    const handleCancel = () => {
        setShowModal(false);
    };
    return (
        <>
            <Space >
                <OrdinaryAvatar avatarUrl={props.avatarUrl} />
                <Meta
                    title={props.name}
                />
                <Button onClick={controlModal} type="link">
                    View
                </Button>
            </Space>
            <Modal
                open={showModal}
                onCancel={handleCancel}
                footer={[
                    <Button key="Accept" type="primary" onClick={handleOk}>
                        Accept
                    </Button>,
                    <Button key="Ignore" onClick={handleCancel}>
                        Refuse
                    </Button>,
                ]}>
                <Space direction="horizontal">
                    <Avatar shape="square" src={props.avatarUrl} size={80} style={{}} />
                    <Space direction="vertical">
                        <Meta
                            description={"Message: " + props.message}
                            style={{ marginLeft: 50, fontSize: 20 }}>
                        </Meta>
                        <Meta description={"Status: " + (props.status ? "Accepted" : "Undisposed")} style={{ marginLeft: 50, fontSize: 13 }} />
                    </Space>
                </Space>

            </Modal>
        </>
    );
};

export { FriendListItem, FriendRequestItem };
