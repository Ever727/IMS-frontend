import { UserOutlined } from "@ant-design/icons";
import { Typography, Avatar, Badge, Card, Space, Tooltip, Button, Layout } from "antd";
import React, { useMemo, useState } from "react";
import { Router, useRouter } from "next/router";

const { Title, Text } = Typography;
const { Meta } = Card;
const MyAvatar: React.FC<any> = (props) => {
    const description = (
        <>
            <Title level={5}> ID:</Title>
            <Text style={{ marginLeft: 10 }}>user id</Text>
            <Title level={5}> Email:</Title>
            <Text style={{ marginLeft: 10 }}>user email</Text>
        </>
    );
    const title = (
        <Layout style={{ backgroundColor: "#ffffff" }}>
            <Space style={{ margin: 20 }}>
                <Avatar shape="square" icon={<UserOutlined />} style={{ marginRight: 20, marginLeft: -10 }} />
                <Meta
                    title={props.name}
                    style={{ margin: 5, color: "black", fontWeight: "bold" }} />
            </Space>
            <Space style={{ margin: 20, marginTop: -30 }}>
                <Meta
                    description={description}
                />
            </Space>    
        </Layout>
    );
    return (
        <Space size={24}>
            <Badge count={props.num} size="small" style={{ alignItems: "center", marginRight: "10px", marginLeft: "-20px", borderRadius: "60%", height: "18px", width: "30px" }} >
                <Tooltip color="#ffffff" style={{ color: "GrayText" }} placement="rightTop" title={title} arrow={true} trigger="contextMenu">
                    <Avatar shape="square" src={props.avatarUrl} style={{ alignContent: "left"}} />
                </Tooltip>
            </Badge>
        </Space>
    );
};

const UserAvatar: React.FC<any> = (props) => {
    const router = useRouter();
    return (
        <Space size={30}>
            <Avatar onClick={
                () => {
                    router.push({ pathname: "user_info", query: { userId: props.userId } });
                }} shape="square" icon={<UserOutlined />} />
        </Space>
    );
};

const OrdinaryAvatar: React.FC<any> = (props) => {
    return (
        <Space size={30}>
            <Avatar shape="square" src={props.avatarUrl} style={{ marginRight: "10px", marginLeft: "-20px" }} />
        </Space>
    );
};
export { MyAvatar, UserAvatar, OrdinaryAvatar };