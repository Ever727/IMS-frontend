import { API_BASE_URL } from './constants';
import { Conversation, Message } from '../api/types';
import { Content } from 'antd/es/layout/layout';
import { db } from '../api/db';
import { message } from 'antd';
// 获取完整API URL
export function getUrl(apiName: string) {
  return `${API_BASE_URL.replace(/\/+$/, '')}/chat/${apiName}/`; // 去除基础URL末尾的斜线，防止形成双斜线
}

// 获取会话显示名称的函数
export function getConversationDisplayName(conversation: Conversation, userName: string) {
  return conversation.type === 'private_chat'
    ? `${conversation.members.map(item => item.userName).filter(name => name != userName)}` // 私聊显示`私聊#ID`
    : `群聊 #${conversation.id} (${conversation.members.length})`; // 群聊显示`群聊#ID (成员数)`
}

export function getConversationMessage(messages: Message[], conversation: Conversation, userId: string) {
  const contents = messages
    .filter(it => it.conversation === conversation.id)
    .filter(it => !it.deleteList.includes(userId))
    .map(messages => messages.content);

  return contents[contents.length - 1];
}