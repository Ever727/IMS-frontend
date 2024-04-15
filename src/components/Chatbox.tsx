import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Input, Button, Divider, message, Drawer, theme, Avatar, Popconfirm, Tag } from 'antd';
import { useRequest } from 'ahooks';
import styles from './Chatbox.module.css';
import MessageBubble from './MessageBubble';
import { Conversation, Message } from '../api/types';
import {
  addMessage,
  addReplyMessage,
  deleteMessage
} from '../api/chat';
import { getConversationDisplayName } from '../api/utils';
import { db } from '../api/db';
import { UserAddOutlined } from '@ant-design/icons';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Item from 'antd/es/list/Item';

export interface ChatboxProps {
  me: string; // 当前用户
  conversation?: Conversation; // 当前选中的会话 (可能为空)
  lastUpdateTime?: number; // 本地消息数据最后更新时间，用于触发该组件数据更新
}

export interface ReplyProps {
  messageId: number; // 回复的消息ID
  replyUser: string; // 回复的用户名
  replyContent: string; // 回复的消息内容
}
// 聊天框组件
const Chatbox: React.FC<ChatboxProps> = ({
  me,
  conversation,
  lastUpdateTime,
}) => {
  const cachedMessagesRef = useRef<Message[]>([]); // 使用ref存储组件内缓存的消息列表
  const [sending, setSending] = useState(false); // 控制发送按钮的状态
  const [inputValue, setInputValue] = useState(''); // 控制输入框的值
  const messageEndRef = useRef<HTMLDivElement>(null); // 指向消息列表末尾的引用，用于自动滚动
  const { token } = theme.useToken();// 抽屉组件元素
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState(false);// 处理消息删除事件
  const [reply, setReply] = useState(false);// 处理消息回复事件
  const [replyParams, setReplyParams] = useState<ReplyProps>({
    messageId: -1,
    replyUser: '',
    replyContent: '',
  });

  // 打开或关闭抽屉
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    height: "100%",
    maxHeight: "100%",
    width: "100%",
    overflow: 'hidden',
    backgroundColor: "#f3f3f3",
    background: token.colorFillAlter,
  };

  // 使用ahooks的useRequest钩子从IndexedDB异步获取消息数据，依赖项为lastUpdateTime
  const { data: messages } = useRequest(
    async () => {
      if (!conversation) return [];
      const curMessages = cachedMessagesRef.current;
      const newMessages = await db.getMessages(conversation); // 从本地数据库获取当前会话的所有消息
      cachedMessagesRef.current = newMessages;
      // 设置定时器以确保滚动操作在数据更新后执行
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({
          behavior: curMessages.length > 0 ? 'smooth' : 'instant', // 根据消息数量选择滚动方式 (平滑滚动 / 瞬间跳转)
        });
      }, 10);
      return cachedMessagesRef.current; // 返回更新后的消息列表
    },
    { refreshDeps: [conversation, lastUpdateTime, del, reply] }
  );

  // 发送消息的函数
  const sendMessage = () => {

    if (!inputValue) {
      message.error('消息内容不能为空');
      return;
    }
    const content = inputValue.trim();
    setSending(true);
    if (!reply) {
      addMessage({ me, content, conversation: conversation! }) // 调用API发送消息
        .then(() => setInputValue(''))
        .catch(() => message.error('消息发送失败'))
        .finally(() => setSending(false));
    } else {
      addReplyMessage({ me, content, conversation: conversation!, replyMessageId: replyParams.messageId }) // 调用API发送带回复的消息
        .then(() => setInputValue(''))
        .catch(() => message.error('消息发送失败'))
        .finally(() => setSending(false));
    }
    setReplyParams({
      messageId: -1,
      replyUser: '',
      replyContent: '',
    });
    setReply(false);
  };
  const name = localStorage.getItem("userName");

  // 处理消息删除
  const handleDeleteMessage = (messageId: number) => {
    deleteMessage({ me: me, messageId });
    db.deleteMessage(messageId, me)
      .then(() => {
        if (!del)
          setDel(true);
        else
          setDel(false);
      })
      .catch((error) => {
        console.error('删除失败:', error);
      });
  };

  // 处理对话框中显示的消息回复
  const replyMessage = (messageId: number) => {
    async function fetchMessage(messageId: number) {
      const message = await db.getMessage(messageId)
        .catch((error) => {
          console.error('回复失败:', error);
        }) as Message;
      setReplyParams({
        messageId: messageId,
        replyUser: message.sender,
        replyContent: message.content,
      });
    }
    fetchMessage(messageId);
    setReply(true);// 显示回复消息提示
  };

  return (
    <div style={containerStyle} >
      {conversation && (
        <>
          <div className={styles.title} onClick={showDrawer}>
            {getConversationDisplayName(conversation, name as string)}
          </div>
          <Divider className={styles.divider} />
          <Drawer
            title={getConversationDisplayName(conversation, name as string)}
            placement="right"
            closable={false}
            onClose={onClose}
            open={open}
            getContainer={false}
          >
            <Avatar src={conversation.avatarUrl} shape="square" size={50} />
            <Avatar shape="square" size={50} icon={<UserAddOutlined />} style={{ marginLeft: 20 }} />
            <Divider />
            <div >
              <Button className={styles.chatHistoryButton} type="text" > 查看聊天记录</Button>
            </div>
            <div>
              <Popconfirm
                title="清空聊天记录"
                description="你确定要删除这个会话的所有聊天记录吗?"
                okText="确定"
                cancelText="取消"
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                onConfirm={() => { }}
                onCancel={() => { }}
              >
                <Button className={styles.chatHistoryButton} type="link" danger > 清空聊天记录</Button>
              </Popconfirm>
            </div>

          </Drawer>
        </>
      )}

      <div className={styles.messages}>
        {/* 消息列表容器 */}
        {messages?.map((item) => {
          if (!item.deleteList.includes(me)) {
            return (
              <MessageBubble
                key={item.id}
                messageId={item.id}
                isMe={item.senderId === me}
                {...item}
                readList={item.readList}
                replyMessage={replyMessage} // 处理回复消息的回调函数
                handleDeleteMessage={handleDeleteMessage} // 处理删除消息想回调函数
              /> // 渲染每条消息为MessageBubble组件
            );
          } else {
            return;
          }
        })}
        <div ref={messageEndRef} /> {/* 用于自动滚动到消息列表底部的空div */}
      </div>
      {conversation && (
        <>
          <div
            style={{
              maxWidth: 400
            }}>
            <Tag
              color="blue"
              visible={reply}
              bordered={false}
              style={{ overflow: "auto", maxWidth: "100%", height: 30 }}>
              {"回复 " + replyParams.replyUser + " : " + replyParams.replyContent}
            </Tag>
          </div>
          <Input.TextArea
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              // 按下Enter键时发送消息，除非同时按下了Shift或Ctrl
              if (!e.shiftKey && !e.ctrlKey) {
                e.preventDefault(); // 阻止默认事件
                e.stopPropagation(); // 阻止事件冒泡
                sendMessage();
              }
            }}
            rows={3}
            autoSize={false} // 关闭自动调整大小
            readOnly={sending} // 当正在发送消息时，设置输入框为只读
          >
          </Input.TextArea>
          <Button
            className={styles.submitButton}
            type="primary"
            disabled={sending} // 当正在发送消息时，禁用按钮
            loading={sending} // 显示加载中状态
            onClick={sendMessage} // 点击时调用发送消息函数
          >
            发送 (Enter)
          </Button>
        </>
      )}
    </div>
  );
};

export default Chatbox;
