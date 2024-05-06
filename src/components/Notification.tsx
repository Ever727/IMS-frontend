import { Avatar, Button, Card, Divider, FloatButton, Form, Input, List, Modal } from 'antd';
import { Notification } from '../api/types';
import style from './Notification.module.css';
import { ArrowUpOutlined } from '@ant-design/icons';
import { useState } from 'react';

interface NotificationProps {
    isOpen: boolean;
    onCancel: () => void;
    groupId: number | undefined;
    groupNotificationList: Notification[] | undefined;
    edit: boolean | undefined;
    me: string;
}

const { TextArea } = Input;

const Notice = (notification: Notification) => {
    const formattedTime = new Date(notification.timestamp).toLocaleTimeString('zh-CN', {
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
                <Avatar src={notification.avatarUrl} />
                <div className={style.info}>
                    <div className={style.username}>{notification.userName}</div>
                    <div className={style.timestamp}>{formattedTime}</div>
                </div>
            </div>
            <div className={style.content}>{notification.content}</div>
        </div>
    );
};

const NotificationList: React.FC<NotificationProps> = ({
    isOpen,
    onCancel,
    groupId,
    groupNotificationList,
    edit,
    me,
}) => {
    const [showEdit, setShowEdit] = useState(false);
    const [form] = Form.useForm();

    const handleEdit = async () => {
        try {
            // 1. 验证表单字段
            const values = await form.validateFields();

            // 2. 发送更新请求
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/chat/upload_notification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${token}`,
                },
                body: JSON.stringify({
                    userId: me,
                    groupId: groupId,
                    ...values,
                }),
            });
            const data = await response.json();

            // 3. 处理请求结果
            if (Number(data.code) === 0) {
                form.resetFields();
                alert("编辑成功");
                // router.push("/user_info");
            } else {
                form.resetFields();
                alert(data.info);
            }
        } catch (error) {
            alert(error);
        }
    };

    return (
        <>

            <Modal
                title="群公告"
                open={isOpen}
                onCancel={() => {
                    onCancel();
                    setShowEdit(false);
                    form.resetFields();
                }}
                footer={null}
                style={{ height: '80vh', overflow: 'auto' }}
            >
                <div className={style.container}>
                    {groupNotificationList &&
                        Array.from(groupNotificationList!.values()).map((item, index) => (
                            <Notice key={`notice-${index}`} {...item} />
                        ))}
                </div>
                {edit && <FloatButton icon={<ArrowUpOutlined />} onClick={() => setShowEdit((prevState) => !prevState)} />}
                <Card title="编辑公告" className={`${style.editOverlay} ${showEdit ? style.visible : ''}`}>
                    <Form form={form}>
                        <Form.Item name="content" label="内容">
                            <TextArea rows={4} />
                        </Form.Item>
                    </Form>
                    <Button type="primary" onClick={handleEdit}>提交</Button>
                </Card>

            </Modal>
        </>
    );
};

export default NotificationList;