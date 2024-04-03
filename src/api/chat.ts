import { useEffect } from 'react';
import axios from 'axios';
import { getUrl } from './utils';
import { Conversation, Message } from './types';

export type AddMessageArgs = {
  me: string;
  conversation: Conversation;
  content: string;
};

export type GetMessagesArgs = {
  me?: string;
  conversationId?: number;
  cursor?: number;
  limit?: number;
};

export type AddConversationArgs = {
  type: 'private_chat' | 'group_chat';
  members: string[];
};

export type GetConversationsArgs = {
  idList: number[];
};

export type JoinConversationsArgs = {
  conversationId: number;
  me: string;
};

export type LeaveConversationsArgs = {
  conversationId: number;
  me: string;
};

// 向服务器添加一条消息
export async function addMessage({
  me,
  conversation,
  content,
}: AddMessageArgs) {
  const { data } = await axios.post(getUrl('messages'), {
    username: me, // 发送者的用户名
    conversation_id: conversation.id, // 会话ID
    content, // 消息内容
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
  const messages: Message[] = [];
  while (true) {
    // 使用循环来处理分页，直到没有下一页
    const { data } = await axios.get(getUrl('messages'), {
      params: {
        username: me, // 查询消息的用户名
        conversation_id: conversationId, // 查询消息的会话 ID
        after: cursor || 0, // 用于分页的游标，表示从此时间戳之后的消息
        limit: limit || 100, // 每次请求的消息数量限制
      },
    });
    data.messages.forEach((item: Message) => messages.push(item)); // 将获取到的消息添加到列表中
    if (!data.has_next) break; // 如果没有下一页，则停止循环
    cursor = messages[messages.length - 1].timestamp; // 更新游标为最后一条消息的时间戳，用于下轮查询
  }
  return messages;
}

// 向服务器添加一个新会话 (私聊/群聊)
export async function addConversation({ type, members }: AddConversationArgs) {
  const { data } = await axios.post(getUrl('conversations'), {
    type,
    members,
  });
  return data as Conversation;
}

// 从服务器查询指定会话信息
export async function getConversations({ idList }: GetConversationsArgs) {
  const params = new URLSearchParams();
  idList.forEach((id) => params.append('id', id.toString()));
  const { data } = await axios.get(getUrl('conversations'), {
    params,
  });
  return data.conversations as Conversation[];
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
        getUrl(`ws/?username=${me}`).replace('http://', 'ws://') // 将http协议替换为ws协议，用于WebSocket连接
      );

      ws.onopen = () => {
        console.log('WebSocket Connected');
      };

      ws.onmessage = async (event) => {
        if (event.data) {
          const data = JSON.parse(event.data);
          if (data.type == 'notify') fn(); // 当接收到通知类型的消息时，执行回调函数
        }
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        if (!closed) {
          console.log('Attempting to reconnect...');
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
