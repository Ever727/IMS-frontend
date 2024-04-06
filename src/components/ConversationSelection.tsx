import React from 'react';
import { List, Avatar, Badge } from 'antd';
import { MessageOutlined, TeamOutlined } from '@ant-design/icons';
import styles from './ConversationSelection.module.css';
import { Conversation } from '../api/types';
import { getConversationDisplayName } from '../api/utils';

type ConversationSelectionProps = {
  me: string; // 当前用户
  conversations: Conversation[]; // 会话列表
  onSelect: (conversationId: number) => void; // 选择会话时的回调函数
};

// 会话选择组件
const ConversationSelection: React.FC<ConversationSelectionProps> = ({
  me,
  conversations,
  onSelect,
}) => {
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
                <Avatar
                  icon={
                    item.type === 'private_chat' ? (
                      <MessageOutlined /> // 私聊使用消息图标
                    ) : (
                      <TeamOutlined /> // 群聊使用团队图标
                    )
                  }
                />
              </Badge>
            }
            title={getConversationDisplayName(item)}
            description={
              // 会话描述部分显示会话成员
              item.type === 'private_chat' ? (
                <div className={styles.membersList}>
                  {item.members.filter((user) => user !== me)}
                  {/* 私聊时过滤掉当前用户，只显示对方用户名 */}
                </div>
              ) : (
                <div className={styles.membersList}>
                  {item.members.join(', ')}
                  {/* 群聊时显示所有成员用户名，以逗号分隔 */}
                </div>
              )
            }
          />
        </List.Item>
      )}
    />
  );
};

export default ConversationSelection;
