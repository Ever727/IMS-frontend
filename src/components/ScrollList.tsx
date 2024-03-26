import React, { useEffect, useState } from "react";
import { Avatar, List, message } from "antd";
import VirtualList from "rc-virtual-list";
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";

interface UserItem {
    email: string;
    gender: string;
    name: {
        first: string;
        last: string;
        title: string;
    };
    nat: string;
    picture: {
        large: string;
        medium: string;
        thumbnail: string;
    };
}
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme } from "antd";

type MenuItem = Required<MenuProps>["items"][number];
const fakeDataUrl =
    "https://randomuser.me/api/?results=20&inc=name,gender,email,nat,picture&noinfo";
const ContainerHeight = 760;

const ScrollList: React.FC = () => {
    const [data, setData] = useState<UserItem[]>([]);

    const appendData = () => {
        fetch(fakeDataUrl)
            .then((res) => res.json())
            .then((body) => {
                setData(data.concat(body.results));
                message.success(`${body.results.length} more items loaded!`);
            });
    };

    useEffect(() => {
        appendData();
    }, []);

    const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
        // Refer to: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#problems_and_solutions
        if (Math.abs(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - ContainerHeight) <= 1) {
            appendData();
        }
    };

    function getItemHead(
        label: React.ReactNode,
        key: React.Key,
        icon?: React.ReactNode,
        children?: MenuItem[],
    ): MenuItem {
        return {
            key,
            icon,
            children,
            label,
        } as MenuItem;
    }

    const items: MenuItem[] = [
        getItemHead("Option 1", "1", <PieChartOutlined />),
        getItemHead("Option 2", "2", <DesktopOutlined />),
        getItemHead("User", "sub1", <UserOutlined />, [
            getItemHead("Tom", "3"),
            getItemHead("Bill", "4"),
            getItemHead("Alex", "5"),
            getItemHead("Corazon", "6"),
            getItemHead("a", "7"),
            getItemHead("b", "8"),
            getItemHead("c", "9"),
            getItemHead("d", "10"),
            getItemHead("e", "11"),

        ]),
        getItemHead("Team", "sub2", <TeamOutlined />, [getItemHead("Team 1", "12"), getItemHead("Team 2", "13")]),
        getItemHead("Files", "14", <FileOutlined />),
    ];


    return (
        <List bordered style={{ background: "white" }}>
            <VirtualList
                data={data}
                height={ContainerHeight}
                itemHeight={47}
                itemKey="email"
                onScroll={onScroll}
            >
                {(item: UserItem) => (
                    <List.Item key={item.email}>
                        <List.Item.Meta
                            avatar={<Avatar src={item.picture.large} />}
                            title={<a href="https://ant.design">{item.name.last}</a>}
                            description={""}
                        />
                    </List.Item>
                )}
            </VirtualList>
        </List>
    );
};

export { ScrollList };