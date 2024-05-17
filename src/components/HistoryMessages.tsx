import React, { FC, useMemo, useState } from 'react';
import { Avatar, Calendar, Divider, FloatButton, Modal, } from 'antd';
import { Message } from '../api/types';
import style from './HistoryMessages.module.css';
import { Dayjs } from 'dayjs';
import { CalendarOutlined, CloseOutlined, TeamOutlined } from '@ant-design/icons';

interface ModalProps {
    isOpen: boolean;
    onCancel: () => void;
    messages: Message[];
}

const MSG = (message: Message) => {
    const formattedTime = new Date(message.sendTime).toLocaleTimeString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return (
        <div className={style.message}>
            <div className={style.header}>
                <Avatar src={message.avatar} />
                <div className={style.info}>
                    <div className={style.username}>{message.sender}</div>
                    <div className={style.timestamp}>{formattedTime}</div>
                </div>
            </div>
            <div className={style.content}>{message.content}</div>
        </div>
    );
};

const HistoryModal: FC<ModalProps> = ({ isOpen, onCancel, messages }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [showUserSelect, setShowUserSelect] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    const availableDates = useMemo(() => {
        if (!messages) return new Set<string>();

        const dates = new Set<string>();
        messages.forEach((msg) => {
            dates.add(new Date(msg.sendTime).toDateString());
        });
        return dates;
    }, [messages]);

    const availableUsers = useMemo(() => {
        if (!messages) return new Map<string, { id: string; name: string; avatar: string }>();

        const users = new Map<string, { id: string; name: string; avatar: string }>();
        messages.forEach((msg) => {
            if (!users.has(msg.senderId)) {
                users.set(msg.senderId, {
                    id: msg.senderId,
                    name: msg.sender,
                    avatar: msg.avatar,
                });
            }
        });
        return users;
    }, [messages]);

    const disabledDate = (current: Dayjs) => {
        return !availableDates.has(current.toDate().toDateString());
    };

    const handleClose = () => {
        setShowCalendar(false);
        setSelectedDate(null); // 清空选中的日期
        setShowUserSelect(false);
        setSelectedUser(null); // 清空选中的用户
    };


    return (
        <>

            <Modal
                title="聊天记录"
                open={isOpen}
                onCancel={() => {
                    handleClose();
                    onCancel();
                }}
                footer={null}
                style={{ height: '80vh', overflow: 'auto' }}
            >
                <div className={`${style.calendarOverlay} ${showCalendar ? style.visible : ''}`}>
                    <Calendar
                        fullscreen={false}
                        onChange={(value) => {
                            setSelectedDate(value);
                        }}
                        disabledDate={disabledDate}
                    />
                </div>

                <div className={`${style.userSelectOverlay} ${showUserSelect ? style.visible : ''}`}>
                    <div className={style.memberGrid}>
                        {availableUsers
                            ? Array.from(availableUsers.values()).map((item) => (
                                <div key={item.id} className={style.member} onClick={() => setSelectedUser(item.id)}>
                                    <Avatar src={item.avatar} alt={item.name} className={style.avatar} />
                                    <div className={style.name}>{item.name}</div>
                                </div>
                            ))
                            : null}
                    </div>
                </div>

                <FloatButton.Group shape="circle" style={{ right: 24 }}>
                    <FloatButton icon={<CalendarOutlined />} onClick={() => setShowCalendar((prevState) => !prevState)} />
                    <FloatButton icon={<TeamOutlined />} onClick={() => setShowUserSelect((prevState) => !prevState)} />
                    <FloatButton icon={<CloseOutlined />} onClick={handleClose} />
                </FloatButton.Group>

                <Divider />
                <div className={style.container}>
                    {selectedDate && selectedUser
                        ? messages
                            .filter((item) => {
                                return (
                                    new Date(item.sendTime).toDateString() === selectedDate.toDate().toDateString() &&
                                    item.senderId === selectedUser
                                );
                            })
                            .map((item) => <MSG key={item.id} {...item} />)
                        : selectedDate
                            ? messages
                                .filter((item) => {
                                    return new Date(item.sendTime).toDateString() === selectedDate.toDate().toDateString();
                                })
                                .map((item) => <MSG key={item.id} {...item} />)
                            : selectedUser
                                ? messages
                                    .filter((item) => {
                                        return item.senderId === selectedUser;
                                    })
                                    .map((item) => <MSG key={item.id} {...item} />)
                                : messages
                                    ? messages.map((item) => <MSG key={item.id} {...item} />)
                                    : null}
                </div>
            </Modal>
        </>
    );
};

export default HistoryModal;