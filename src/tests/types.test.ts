import { Message, Conversation, User, Notification } from '../api/types';

describe('Message', () => {
  it('should create a valid Message', () => {
    const message: Message = {
      id: 1,
      conversation: 1,
      sender: 'user1',
      senderId: 'user1',
      content: 'Hello, world!',
      timestamp: Date.now(),
      sendTime: Date.now(),
      avatar: 'https://example.com/avatar.jpg',
      readList: ['user1', 'user2'],
      replyId: 0,
      replyCount: 0,
      deleteList: [],
    };

    expect(message.id).toBe(1);
    expect(message.conversation).toBe(1);
    expect(message.sender).toBe('user1');
    expect(message.senderId).toBe('user1');
    expect(message.content).toBe('Hello, world!');
    expect(typeof message.timestamp).toBe('number');
    expect(typeof message.sendTime).toBe('number');
    expect(message.avatar).toBe('https://example.com/avatar.jpg');
    expect(message.readList).toEqual(['user1', 'user2']);
    expect(message.replyId).toBe(0);
    expect(message.replyCount).toBe(0);
    expect(message.deleteList).toEqual([]);
  });
});

describe('User', () => {
  it('should create a valid User', () => {
    const user: User = {
      userId: 'user1',
      userName: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
      isDeleted: false,
    };

    expect(user.userId).toBe('user1');
    expect(user.userName).toBe('John Doe');
    expect(user.avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(user.isDeleted).toBe(false);
  });
});

describe('Notification', () => {
  it('should create a valid Notification', () => {
    const notification: Notification = {
      userId: 'user1',
      userName: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
      content: 'New message received',
      timestamp: Date.now(),
    };

    expect(notification.userId).toBe('user1');
    expect(notification.userName).toBe('John Doe');
    expect(notification.avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(notification.content).toBe('New message received');
    expect(typeof notification.timestamp).toBe('number');
  });
});

describe('Conversation', () => {
  it('should create a valid group chat Conversation', () => {
    const users: User[] = [
      { userId: 'user1', userName: 'John Doe', avatarUrl: 'https://example.com/avatar1.jpg', isDeleted: false },
      { userId: 'user2', userName: 'Jane Smith', avatarUrl: 'https://example.com/avatar2.jpg', isDeleted: false },
    ];

    const conversation: Conversation = {
      id: 1,
      type: 'group_chat',
      members: users,
      unreadCount: 3,
      avatarUrl: 'https://example.com/group_avatar.jpg',
      groupName: 'Chat Group',
      groupNotificationList: [
        {
          userId: 'user1',
          userName: 'John Doe',
          avatarUrl: 'https://example.com/avatar1.jpg',
          content: 'New group member added',
          timestamp: Date.now(),
        },
      ],
      host: users[0],
      adminList: [users[0]],
    };

    expect(conversation.id).toBe(1);
    expect(conversation.type).toBe('group_chat');
    expect(conversation.members).toEqual(users);
    expect(conversation.unreadCount).toBe(3);
    expect(conversation.avatarUrl).toBe('https://example.com/group_avatar.jpg');
    expect(conversation.groupName).toBe('Chat Group');
    expect(conversation.groupNotificationList.length).toBe(1);
    expect(conversation.host).toEqual(users[0]);
    expect(conversation.adminList).toEqual([users[0]]);
  });
});