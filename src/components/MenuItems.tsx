import { MyAvatar } from "../components/Avatar";
import { Space, Card } from "antd";
import React from 'react';
const { Meta } = Card;

const MenuItems: React.FC<any> = (props) => {
    return (
        <Space >
            <MyAvatar name={props.name} num={props.num} />
            <Meta
                title={props.name}
            />
        </Space>
    );
};

export default MenuItems;
