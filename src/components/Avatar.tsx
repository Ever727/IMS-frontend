import { UserOutlined } from "@ant-design/icons";
import React from "react";
import { Avatar, Badge, Space } from "antd";

const MyAvatar: React.FC<any> = (props) => (
    <Space size={24}>
        <Badge count={props.num} size="small" style={{ alignItems: "center", marginRight: "30px", marginLeft: "-10px", borderRadius: "60%", height: "18px", width: "30px" }} >
            <Avatar shape="square" icon={<UserOutlined />} style={{ marginRight: "30px", marginLeft: "-20px" }} />
        </Badge>
    </Space>
);

export { MyAvatar };