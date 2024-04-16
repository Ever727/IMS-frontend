import Dexie, { UpdateSpec } from 'dexie';
import { Conversation, Message } from './types';
import { getConversations, getMessages, getConversationIdList, getUnreadCount } from './chat';

// 定义一个继承自Dexie的类，用于管理本地缓存在IndexedDB的数据
export class CachedData extends Dexie {
  messages: Dexie.Table<Message, number>; // 定义一个Dexie表用于存储消息，以数字类型的ID作为主键
  conversations: Dexie.Table<Conversation, number>; // 定义一个Dexie表用于存储会话，以数字类型的ID作为主键
  activeConversationId: number | null;

  constructor() {
    super('CachedData'); // 指定数据库名称
    this.version(1).stores({
      messages: '&id, sender, conversation, timestamp', // 定义消息表的结构，'&id' 表示id是主键，sender, conversationId, timestamp是索引
      conversations: '&id, type', // 定义会话表的结构，'&id' 表示id是主键，type是索引
    });
    this.messages = this.table('messages'); // 获取到Dexie表实例
    this.conversations = this.table('conversations'); // 获取到Dexie表实例
    this.activeConversationId = null;
  }

  // 清空缓存中的所有数据
  async clearCachedData() {
    await this.messages.clear();
    await this.conversations.clear();
  }

  // 从服务器拉取新消息 (用户消息链) 并更新本地缓存
  async pullMessages(me: string) {
    const latestMessage = await this.messages.orderBy('timestamp').last(); // 获取本地缓存中最新的一条消息
    const cursor = latestMessage?.timestamp; // 以最新消息的时间戳作为游标
    const newMessages = await getMessages({ me, cursor }); // 从服务器获取更新的消息列表
    const convIds = await getConversationIdList({ me }); // 获取所有会话 ID
    await this.messages.bulkPut(newMessages); // 使用bulkPut方法批量更新本地缓存

    this.messages.orderBy('id'); // 按照ID升序排序

    const newConvIds = Array.from(new Set(convIds)); // 获取新出现的会话 ID

    // 根据所有会话 ID 批量拉取会话信息，以正确显示头像
    await this.pullConversations(newConvIds, me);

    // 批量更新会话的未读计数
    await this.updateUnreadCounts(convIds, me);
  }

  // 从服务器拉取新消息 (会话消息链) 并更新本地缓存
  async pullMessagesFromConversation(conversationId: number) {
    const messages = await this.messages
      .where('conversation')
      .equals(conversationId)
      .sortBy('timestamp'); // 获取本地缓存中最新的一条消息
    const latestMessage = messages[messages.length - 1];
    const cursor = latestMessage?.timestamp; // 以最新消息的时间戳作为游标
    const newMessages = await getMessages({ conversationId, cursor }); // 从服务器获取更新的消息列表
    await this.messages.bulkPut(newMessages); // 使用bulkPut方法批量更新本地缓存
  }

  // 从服务器拉取指定会话信息并更新本地缓存
  async pullConversations(convIds: number[], me: string) {
    if (convIds.length) {
      const newConversations = await getConversations({ idList: convIds, me: me }); // 从服务器批量获取会话信息
      await this.conversations.bulkPut(newConversations); // 使用bulkPut方法批量更新本地缓存
    }
  }

  // 批量删除本地会话
  async removeConversations(convIds: number[]) {
    await this.conversations.bulkDelete(convIds);
  }

  // 根据新消息批量更新会话的未读计数
  async updateUnreadCounts(convIds: number[], me: string) {
    const updates: { key: number; changes: UpdateSpec<Conversation> }[] = [];

    // 准备批量更新操作
    for (const conversationId of convIds) {
      const unreadCount = await getUnreadCount({ me, conversationId }); // 从服务器获取未读计数
      updates.push({
        key: conversationId,
        changes: { unreadCount: unreadCount },
      });
    }

    // 执行批量更新
    await this.conversations.bulkUpdate(updates);
  }

  // 清除会话的未读计数
  async clearUnreadCount(convId: number) {
    await this.conversations.update(convId, { unreadCount: 0 });
  }

  // 根据游标获取本地缓存中的消息
  async getMessages(conversation: Conversation) {
    return this.messages
      .where('conversation')
      .equals(conversation.id)
      .toArray(); // 查询指定会话的所有消息
  }

  // 删除本地指定会话中的指定消息
  async deleteMessage(messageId: number, userId: string) {
    let target = await this.messages
      .get(messageId)
      .catch((error) => { console.warn(error); });
    target?.deleteList.push(userId);
    await this.messages.delete(messageId);
    await this.messages.add(target as Message);
  }

  // 获取指定的消息内容
  async getMessage(messageId: number) {
    return this.messages.get(messageId);
  }
}

export const db = new CachedData(); // 创建CachedData实例