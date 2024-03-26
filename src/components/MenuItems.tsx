import React from "react";
import { MyAvatar } from "../components/Avatar"
import { Space, Card } from "antd";

const { Meta } = Card;

const MenuItems: React.FC<any> = (props) => {
    return (
        <Space >
            <MyAvatar num={props.num} />
            <Meta
                title={props.name}
            />
        </Space>
    )
};

export default MenuItems;
