import React, { useRef, useState, useEffect } from 'react';
import { List, Avatar, Badge } from 'antd';
import { MessageOutlined, TeamOutlined } from '@ant-design/icons';
import styles from './ConversationSelection.module.css';
import { getConversationDisplayName, getConversationMessage } from '../api/utils';
import { useRequest } from 'ahooks';
import { Conversation, Message } from '../api/types';
import { db } from '../api/db';

interface ConversationSelectionProps {
  me: string; // 当前用户
  conversations: Conversation[]; // 会话列表
  onSelect: (conversationId: number) => void; // 选择会话时的回调函数
}

// 会话选择组件
const ConversationSelection: React.FC<ConversationSelectionProps> = ({
  me,
  conversations,
  onSelect,
}) => {

  //从前端数据库获得消息列表
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  useEffect(() => {
    async function getMessages() {
      try {
        let totalmessages: Message[] = [];
        for (const conversation of conversations) {
          const data = db.getMessages(conversation);
          const messages = await data;
          totalmessages = totalmessages.concat(messages);
        }
        setConversationMessages(totalmessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }

    getMessages();
  });

  return (
    <List
      itemLayout="horizontal"
      dataSource={conversations} // 数据源为当前用户的会话列表
      renderItem={(item) => (
        <List.Item
          onClick={() => onSelect(item.id)} // 点击会话项时触发onSelect回调
          className={styles.listItem}
        >
          <List.Item.Meta
            className={styles.listItemMeta}
            avatar={
              // 会话项的头像，根据会话类型显示不同图标
              <Badge count={item.unreadCount || 0}>
                <Avatar src={item.avatarUrl} />
              </Badge>
            }
            title={getConversationDisplayName(item)}
            description={
              getConversationMessage(conversationMessages, item) // 获取会话的最新消息内容
              //conversationMessages.filter(it => it.conversation === item.id).map(messages => messages.content)
            }
          />
        </List.Item>
      )}
    />
  );
};

export default ConversationSelection;
