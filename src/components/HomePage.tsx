import React, { useCallback, useEffect, useState } from 'react';
import { Divider, message } from 'antd';
import styles from './HomePage.module.css';
import Chatbox from './Chatbox';
// import { Operations } from './Operations';
import ConversationSelection from './ConversationSelection';
import {
  addConversation,
  joinConversation,
  leaveConversation,
  useMessageListener,
  readConversation,
} from '../api/chat';
import { db } from '../api/db';
import { clearCache, useLocalStorageState, useRequest } from 'ahooks';


// 首页组件
const HomePage = () => {
  // 页面初始化完成标志
  const [initialRenderComplete, setInitialRenderComplete] = useState<boolean>(false);

  // 使用localStorage状态管理当前用户(me)和活跃会话ID(activeChat)，页面刷新后可以保持不变
  const [me, setMe] = useState<string>();
  const [activeChat, setActiveChat] = useLocalStorageState<number | null>(
    'activeChat',
    { defaultValue: null }
  );
  const { data: conversations, refresh } = useRequest(async () => {
    const convs = await db.conversations.toArray();
    return convs.filter((conv) => conv.members.some(item => item.userId === me));
  }); // 当前用户的会话列表

  // 本地消息数据最后更新时间，用于触发聊天框的更新
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const update = useCallback(() => {
    // 更新函数，从后端拉取消息，合并到本地数据库
    db.pullMessages(me!).then(() => {
      refresh();
      setLastUpdateTime(Date.now());
    });

    db.clearUnreadCount(db.activeConversationId!); // 清除未读计数
  }, [me, refresh]);

  // 页面初始化
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setMe(userId);
    }
    setInitialRenderComplete(true);
    update();
  }, [update]);

  // 更新从后端拉取消息
  useEffect(() => {
    update();
  }, [update]);

  // 选中会话消除未读计数
  useEffect(() => {
    db.activeConversationId = activeChat || null;
    if (activeChat) {
      db.clearUnreadCount(activeChat);
    }
  }, [activeChat, refresh]);

  useMessageListener(update, me!); // 使用消息监听器钩子，当有新消息时调用更新函数

  const handleConversationSelect = (id: number) => {
    if (id === activeChat) return; // 若当前会话已选中，则不做任何操作

    db.conversations.get(id).then((conversation) => {
      if (conversation) {
        const unreadCount = conversation.unreadCount || 0;
        setActiveChat(id);
        if (me) {
          if (unreadCount === 0) return; // 若会话没有未读消息，则不做任何操作
          readConversation({ me, conversationId: id });
        }
      }
    });
  };

  if (!initialRenderComplete) return <></>;

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.settings}>
          <div className={styles.form}>
            <div className={styles.inputItem}>
              当前用户：
              {me ? ( // 显示当前用户，若未设置则提示
                <strong>{localStorage.getItem("userName")}</strong>
              ) : (
                <span style={{ color: 'grey' }}>(未设置)</span>
              )}
            </div>
            <div className={`${styles.inputItem} ${styles.hint}`}>
              {me}
            </div>
          </div>
          <Divider className={styles.divider} />
          <div className={styles.conversations}>
            <ConversationSelection // 会话选择组件
              me={me!}
              conversations={conversations || []}
              onSelect={handleConversationSelect}
            />
          </div>
        </div>
        <div className={styles.chatBox}>
          <Chatbox // 聊天框组件
            me={me!}
            conversation={
              // 根据活跃会话ID找到对应的会话对象
              activeChat
                ? conversations?.find((item) => item.id === activeChat)
                : undefined
            }
            lastUpdateTime={lastUpdateTime}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
