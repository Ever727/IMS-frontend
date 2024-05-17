export interface Message {
  id: number; // 消息ID
  conversation: number; // 会话 ID
  sender: string; // 发送者
  senderId: string; // 发送者 ID
  content: string; // 消息内容
  timestamp: number; // 时间戳
  sendTime: number; // 发送时间
  avatar: string; // 头像
  readList: string[]; // 已读用户列表
  replyId: number; // 回复消息的ID
  replyCount: number; // 回复消息的计数
  deleteList: string[]; // 删除用户列表
}

export class User {
  userId = ""; // 用户ID
  userName = ""; // 用户名
  avatarUrl = ""; // 头像
  isDeleted = false;//是否已经注销
}

export interface Notification {
  userId: string; // 用户ID
  userName: string; // 用户名
  avatarUrl: string; // 头像
  content: string; // 通知内容
  timestamp: number; // 时间戳
}

export interface Conversation {
  id: number; // 会话ID
  type: 'group_chat' | 'private_chat'; // 会话类型：群聊或私聊
  members: User[]; // 会话成员列表
  unreadCount?: number; // 未读计数
  avatarUrl: string; // 头像

  // 群聊独有属性
  groupName: string; // 会话名称
  groupNotificationList: Notification[]; // 群公告
  host: User; // 群主
  adminList: User[]; // 管理员列表
}
