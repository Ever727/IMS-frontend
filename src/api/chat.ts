import { useEffect } from 'react';
import axios from 'axios';
import { getUrl } from './utils';
import { Conversation, Message } from './types';

export interface AddMessageArgs {
  me: string;
  conversation: Conversation;
  content: string;
}

export interface GetMessagesArgs {
  me?: string;
  conversationId?: number;
  cursor?: number;
  limit?: number;
  avatarUrl?: string;
}

export interface AddConversationArgs {
  me: string;
  type: 'private_chat' | 'group_chat';
  members: string[];
}

export interface GetConversationsArgs {
  me: string;
  idList: number[];
}

export interface JoinConversationsArgs {
  conversationId: number;
  me: string;
}

export interface LeaveConversationsArgs {
  conversationId: number;
  me: string;
}

export interface DeleteMessageArgs {
  messageId: number;
  me: string;
}

export interface ClearConversationsArgs {
  conversationId: number;
  me: string;
}

export interface addReplyMessageArgs {
  me: string;
  conversation: Conversation;
  content: string;
  replyMessageId: number;
}

// 向服务器添加一条消息
export async function addMessage({
  me,
  conversation,
  content,
}: AddMessageArgs) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${localStorage.getItem('token')}`
  };

  const { data } = await axios.post(getUrl('messages'), {
    userId: me, // 发送者的 ID
    conversationId: conversation.id, // 会话 ID
    content, // 消息内容
  }, {
    headers: headers
  });
  return data;
}

// 向服务器添加一条具有回复的消息
export async function addReplyMessage({
  me,
  conversation,
  content,
  replyMessageId,
}: addReplyMessageArgs) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${localStorage.getItem('token')}`
  };

  const { data } = await axios.post(getUrl('messages'), {
    userId: me, // 发送者的 ID
    conversationId: conversation.id, // 会话 ID
    content, // 消息内容
    replyId: replyMessageId, // 回复消息的 ID
  }, {
    headers: headers
  });
  return data;
}

// 从服务器获取消息列表
export async function getMessages({
  me,
  conversationId,
  cursor,
  limit,
}: GetMessagesArgs) {
  if (!me) return []; // 如果未登录，则返回空列表

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${localStorage.getItem('token')}`
  };

  const messages: Message[] = [];
  while (true) {
    // 使用循环来处理分页，直到没有下一页
    const { data } = await axios.get(getUrl('messages'), {
      params: {
        userId: me, // 查询消息的用户 ID
        conversationId: conversationId, // 查询消息的会话 ID
        after: cursor || 0, // 用于分页的游标，表示从此时间戳之后的消息 cursor || 0 不能用cursor，否则之前的消息更新不到
        limit: limit || 100, // 每次请求的消息数量限制
      },
      headers: headers,
    });
    data.messages.forEach((item: Message) => messages.push(item)); // 将获取到的消息添加到列表中
    if (!data.hasNext) break; // 如果没有下一页，则停止循环
    cursor = messages[messages.length - 1].timestamp; // 更新游标为最后一条消息的时间戳，用于下轮查询
  }
  return messages;
}

// 从服务器获取指定用户 ID 指定会话 ID 的未读消息数
export async function getUnreadCount({
  me,
  conversationId,
}: {
  me: string;
  conversationId: number;
}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${localStorage.getItem('token')}`
  };

  const { data } = await axios.get(getUrl('get_unread_count'), {
    params: {
      userId: me, // 查询未读消息的用户 ID
      conversationId: conversationId, // 查询未读消息的会话 ID
    },
    headers: headers,
  });
  return data.count;
}

// 向服务器添加一个新会话 (私聊/群聊)
export async function addConversation({ type, members, me }: AddConversationArgs) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${localStorage.getItem('token')}`
  };

  const { data } = await axios.post(getUrl('conversations'), {
    userId: me,
    type,
    members,
  }, {
    headers: headers
  });
  return data as Conversation;
}

// 从服务器查询指定会话信息
export async function getConversations({ idList, me }: GetConversationsArgs) {
  const params = new URLSearchParams();
  idList.forEach((id) => params.append('id', id.toString()));
  params.append('userId', me);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${localStorage.getItem('token')}`
  };
  const { data } = await axios.get(getUrl('conversations'), {
    params,
    headers: headers,
  });
  return data.conversations as Conversation[];
}

// 从服务器查询指定用户 ID 所在的所有会话 ID
export async function getConversationIdList({ me }: { me: string }) {
  if (!me) return []; // 如果未登录，则返回空列表

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${localStorage.getItem('token')}`
  };
  const { data } = await axios.get(getUrl('get_conversation_ids'), {
    params: {
      userId: me,
    },
    headers: headers,
  });
  return data.conversationIds as number[];
}

// 标记指定会话下的消息为已读
export async function readConversation({
  me,
  conversationId,
}: JoinConversationsArgs) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${localStorage.getItem('token')}`
  };

  const { data } = await axios.post(getUrl('read_message'), {
    userId: me, // 发送者的 ID
    conversationId: conversationId, // 会话 ID
  }, {
    headers: headers
  });
  return data;
}

// 删除指定消息
export async function deleteMessage({
  messageId,
  me,
}: DeleteMessageArgs) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${localStorage.getItem('token')}`
  };
  const { data } = await axios.post(getUrl('delete_message'), {
    messageId: messageId,// 消息Id
    userId: me,// 用户Id
  }, {
    headers: headers
  });
  return data;
}

// 清空指定会话的聊天记录
export async function clearConversation({
  conversationId,
  me,
}: ClearConversationsArgs) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${localStorage.getItem('token')}`
  };
  const { data } = await axios.post(getUrl('clear_conversation'), {
    conversationId: conversationId,// 会话Id
    userId: me,// 用户Id
  }, {
    headers: headers
  });
  return data;
}

export async function joinConversation({
  me,
  conversationId,
}: JoinConversationsArgs) {
  await axios.post(getUrl(`conversations/${conversationId}/join`), {
    username: me,
  });
}

export async function leaveConversation({
  me,
  conversationId,
}: JoinConversationsArgs) {
  await axios.post(getUrl(`conversations/${conversationId}/leave`), {
    username: me,
  });
}

// 使用React的useEffect钩子来监听WebSocket消息
export const useMessageListener = (fn: () => void, me: string) => {
  useEffect(() => {
    let ws: WebSocket | null = null;
    let closed = false;

    const connect = () => {
      ws = new WebSocket(
        getUrl(`ws/?username=${me}`).replace('https://', 'wss://').slice(0, -1) // 将http协议替换为ws协议，用于WebSocket连接
      );

      ws.onopen = () => { };

      ws.onmessage = async (event) => {
        if (event.data) {
          const data = JSON.parse(event.data);
          if (data.type == 'notify') fn(); // 当接收到通知类型的消息时，执行回调函数
        }
      };

      ws.onclose = () => {
        if (!closed) {
          setTimeout(() => {
            connect(); // 当WebSocket连接关闭时，尝试重新连接
          }, 1000);
        }
      };
    };

    connect();

    return () => {
      if (ws) {
        closed = true;
        ws.close(); // 组件卸载时关闭WebSocket连接
      }
    };
  }, [me, fn]); // 当前用户(me)或回调函数(fn)变化时，重新执行Effect
};
