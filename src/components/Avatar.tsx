import { UserOutlined } from "@ant-design/icons";
import { Typography, Avatar, Badge, Card, Space, Tooltip, Button, Layout } from "antd";
import React, { useMemo, useState } from "react";
import router, { Router, useRouter } from "next/router";

const { Title, Text } = Typography;
const { Meta } = Card;
const MyAvatar: React.FC<any> = (props) => {
    const handleTitleClick = () => {
        localStorage.setItem("queryId", props.userId);
        router.push({
            pathname: "user_info",
        });
    };

    const title = (
        <Layout style={{ backgroundColor: "#ffffff" }}>
            <Space style={{ margin: 10 }}>
                <Avatar shape="square" src={props.avatarUrl} style={{ marginRight: 10, marginLeft: -10 }} />
                <Title level={5} onClick={handleTitleClick} style={{ margin: 5, color: "black", fontWeight: "bold", cursor: 'pointer' }}>
                    {props.userName}
                </Title>
            </Space>
            <Text style={{ margin: 5, color: "GrayText" }}>用户ID: {props.userId}</Text>
        </Layout>
    );
    return (
        <Tooltip color="#ffffff" style={{ color: "GrayText" }} placement="rightTop" title={title} arrow={true} trigger="contextMenu">
            <Avatar shape="square" src={props.avatarUrl} style={{ marginRight: "10px", marginLeft: "-40px" }} />
        </Tooltip>
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