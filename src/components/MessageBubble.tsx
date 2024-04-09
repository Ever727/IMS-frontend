import React from 'react';
import styles from './MessageBubble.module.css';
import { Avatar } from 'antd';

export interface MessageBubbleProps {
  sender: string; // 消息发送者
  avatar: string; // 消息发送者头像
  content: string; // 消息内容
  timestamp: number; // 消息时间戳
  isMe: boolean; // 判断消息是否为当前用户发送
  readList: string[]; // 已读消息列表
}

// 消息气泡组件
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  avatar,
  content,
  timestamp,
  isMe,
  readList,
}) => {
  // 格式化时间戳为易读的时间格式
  const formattedTime = new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className={`${styles.container} ${isMe ? styles.meContainer : styles.othersContainer}`}>
      <Avatar src={avatar} className={`${styles.avatar} ${isMe ? styles.meAvatar : styles.othersAvatar}`} />
      {/* 显示头像 */}
      <div className={`${styles.message} ${isMe ? styles.me : styles.others}`}>
        {/* 根据消息发送者显示不同的气泡样式 */}
        <div className={styles.sender}>
          {sender} @ {formattedTime} {/* 显示发送者和消息时间 */}
        </div>
        <div
          className={`${styles.bubble} ${isMe ? styles.meBubble : styles.othersBubble
            }`}
        >
          {content} {/* 显示消息内容 */}
        </div>
        {/* 根据是否已读显示不同的提示信息 */}
        { (
          <div className={styles.unread}>{readList}</div>
        )}

      </div>
    </div>
  );
};

export default MessageBubble;
