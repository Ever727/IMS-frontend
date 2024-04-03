import { API_BASE_URL } from './constants';
import { Conversation } from './types';

// 获取完整API URL
export function getUrl(apiName: string) {
  return `${API_BASE_URL.replace(/\/+$/, '')}/${apiName}`; // 去除基础URL末尾的斜线，防止形成双斜线
}

// 获取会话显示名称的函数
export function getConversationDisplayName(conversation: Conversation) {
  return conversation.type === 'private_chat'
    ? `私聊 #${conversation.id}` // 私聊显示`私聊#ID`
    : `群聊 #${conversation.id} (${conversation.members.length})`; // 群聊显示`群聊#ID (成员数)`
}
