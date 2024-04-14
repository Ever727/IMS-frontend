import React, { useEffect, useState } from 'react';
import styles from './MessageBubble.module.css';
import { Avatar, Dropdown, Space, MenuProps, Tag, Popover, Button, message, Popconfirm } from 'antd';
import { DownOutlined, FontSizeOutlined, HeartFilled } from '@ant-design/icons';
import { read, readlink } from 'fs';
import { SP } from 'next/dist/shared/lib/utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  deleteMessage
} from '../api/chat';
import { db } from '../api/db';
import { Conversation, Message } from '../api/types';

export interface MessageBubbleProps {
  messageId: number;// 消息ID
  sender: string; // 消息发送者
  senderId: string; // 消息发送者ID
  avatar: string; // 消息发送者头像
  content: string; // 消息内容
  timestamp: number; // 消息时间戳
  sendTime: number; // 消息发送时间
  isMe: boolean; // 判断消息是否为当前用户发送
  readList: string[]; // 已读消息列表
  replyMessage: (messageId: number) => void; // 回复消息的回调函数
  handleDeleteMessage: (messageId: number) => void; // 删除消息的回调函数
}

// 消息气泡组件
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  messageId,
  sender,
  avatar,
  content,
  sendTime,
  isMe,
  readList,
  replyMessage,
  handleDeleteMessage,
}) => {
  // 格式化时间戳为易读的时间格式
  const formattedTime = new Date(sendTime).toLocaleTimeString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const [reply, setReply] = useState(false);

  const userId = localStorage.getItem("userId");
  const handleDeleteConfirm = () => {
    // 处理消息删除确认事件
    handleDeleteMessage(messageId);
  };

  const handleReply = () => {
    // 处理消息回复事件,将消息id传递给Chatbox
    replyMessage(messageId);
  };

  const message_popover = (
    <div>
      <Button onClick={handleReply} style={{ margin: 3 }} color="primary">回复</Button>
      <Popconfirm
        title="删除消息"
        description="你确定要删除这条消息吗?"
        okText="确定"
        cancelText="取消"
        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { }}
      >
        <Button danger>删除</Button>
      </Popconfirm>
    </div>
  );

  // 解析出已读消息成员列表
  let readers = [];
  if (readList && Array.isArray(readList)) {
    for (let i = 0; i < readList.length; i++) {
      readers.push({
        label: readList[i],
        key: i,
      });
    }
  }
  const items: MenuProps["items"] = readers;

  return (
    <div className={`${styles.container} ${isMe ? styles.meContainer : styles.othersContainer}`}>
      <Avatar src={avatar} className={`${styles.avatar} ${isMe ? styles.meAvatar : styles.othersAvatar}`} />
      {/* 显示头像 */}
      <div className={`${styles.message} ${isMe ? styles.me : styles.others}`}>
        {/* 根据消息发送者显示不同的气泡样式 */}
        <div className={styles.sender}>
          {sender} @ {formattedTime} {/* 显示发送者和消息时间 */}
        </div>
        {/* 消息气泡 */}
        <Popover
          placement="right"
          content={message_popover}
          className={`${styles.bubble} ${isMe ? styles.meBubble : styles.othersBubble}`}
          style={{
            maxWidth: 300,
          }}
          autoAdjustOverflow
          trigger="contextMenu">
          <div
            style={{
              maxWidth: 300,
            }}>
            {content}
          </div>
        </Popover>

        {/* 根据是否已读显示不同的提示信息 */}
        {(
          <Dropdown menu={{ items }} trigger={["click"]}>
            <a onClick={(e) => e.preventDefault()}>
              <Tag color="default" style={{ marginTop: 7, fontSize: 11, color: "gray" }}>已 读
                <DownOutlined />
              </Tag>
            </a>
          </Dropdown>
        )}

      </div>
    </div >
  );
};

export default MessageBubble;
