import React, { FC, useMemo, useState } from 'react';
import { Avatar, Button, Calendar, Divider, FloatButton, Modal, } from 'antd';
import { Message } from '../api/types';
import style from './HistoryMessages.module.css';
import { Dayjs } from 'dayjs';

interface ModalProps {
    isOpen: boolean;
    onCancel: () => void;
    messages: Message[];
}

const MSG = (message: Message) => {
    const formattedTime = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
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

    )

}

const HistoryModal: FC<ModalProps> = ({ isOpen, onCancel, messages }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

    const availableDates = useMemo(() => {
        const dates = new Set<string>();
        messages.forEach((msg) => {
          dates.add(new Date(msg.timestamp).toDateString());
        });
        return dates;
      }, [messages]);
    
      const disabledDate = (current: Dayjs) => {
        return !availableDates.has(current.toDate().toDateString());
      };

    const handleCloseCalendar = () => {
        setShowCalendar(false);
        setSelectedDate(null); // 清空选中的日期
      };

    return (
        <>

            <Modal
                title="聊天记录"
                open={isOpen}
                onCancel={() => {
                    handleCloseCalendar();
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
                <FloatButton.Group shape="circle" style={{ right: 24 }}>
                    <FloatButton onClick={() => setShowCalendar((prevState) => !prevState)} />
                    <FloatButton.BackTop visibilityHeight={0} />
                </FloatButton.Group>

                <Divider />
                <div className={style.container}>
                    {selectedDate
                        ? messages
                            .filter((item) => {
                                return (
                                    new Date(item.timestamp).toDateString() ===
                                    selectedDate.toDate().toDateString()
                                );
                            })
                            .map((item) => <MSG {...item} />)
                        : messages.map((item) => <MSG {...item} />)}
                </div>
            </Modal>
        </>
    );
};

export default HistoryModal;