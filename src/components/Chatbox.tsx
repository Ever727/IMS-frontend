import React, { useRef, useState } from 'react';
import { Input, Button, Divider, message, Drawer, theme, Avatar, Popconfirm, Tag, Popover, Modal, Select, SelectProps, Space, Form, UploadFile, Upload } from 'antd';
import { useRequest } from 'ahooks';
import styles from './Chatbox.module.css';
import MessageBubble from './MessageBubble';
import { Conversation, Message } from '../api/types';
import {
  addMessage,
  addReplyMessage,
  deleteMessage
} from '../api/chat';
import { getConversationDisplayName, getConversationMemberAvatar } from '../api/utils';
import { db } from '../api/db';
import { PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import { QuestionCircleOutlined } from '@ant-design/icons';
import HistoryModal from './HistoryMessages';
import NotificationList from './Notification';
import router from 'next/router';

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
  const [isModalOpen, setIsModalOpen] = useState(false); // 控制聊天记录弹窗的状态
  const [isInviteOpen, setIsInviteOpen] = useState(false); // 控制邀请成员的状态
  const [selectMembers, setSelectMembers] = useState<string[]>([]); // 储存群聊成员选择
  const [selectItems, setSelectItems] = useState<SelectProps[]>([]); // 群聊成员可选项，与好友列表同步更新
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // 控制群公告的状态
  const [groupModel, setGroupModel] = useState(false); // 控制编辑群信息的弹窗开关
  const [replyParams, setReplyParams] = useState<ReplyProps>({
    messageId: -1,
    replyUser: '',
    replyContent: '',
  });
  const [refMap, setRefMap] = useState<Map<number, React.RefObject<HTMLDivElement>>>(new Map()); // 建立一个字典根据消息ID对应消息想引用用于跳转
  const [uploadedFile, setUploadedFile] = useState<UploadFile | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();


  // 打开或关闭抽屉
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  // 打开聊天记录弹窗
  const showModal = () => {
    setIsModalOpen(true);
  };

  // 关闭聊天记录弹窗
  const handleModalCancel = () => {
    setIsModalOpen(false);
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
      // 创建新的 refMap
      const newRefMap = new Map<number, React.RefObject<HTMLDivElement>>();
      for (const mes of newMessages) {
        // 为消息设置引用
        newRefMap.set(mes.id, React.createRef<HTMLDivElement>());
      }
      setRefMap(newRefMap);
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
        .catch((error) => {
            const errorMessage = (error.response && error.response.data && error.response.data.info)
            ? error.response.data.info
            : (error.message || '发送消息失败');
            message.error(`发送消息失败: ${errorMessage}`);
        })
        .finally(() => setSending(false));
    } else {
      addReplyMessage({ me, content, conversation: conversation!, replyMessageId: replyParams.messageId }) // 调用API发送带回复的消息
        .then(() => setInputValue(''))
        .catch((error) => {
            const errorMessage = (error.response && error.response.data && error.response.data.info)
            ? error.response.data.info
            : (error.message || '发送消息失败');
            message.error(`发送消息失败: ${errorMessage}`);
        })
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
        message.error('删除失败:', error);
      });
  };

  // 处理对话框中显示的消息回复
  const replyMessage = (messageId: number) => {
    async function fetchMessage(messageId: number) {
      const msg = await db.getMessage(messageId)
        .catch((error) => {
          message.error('回复失败:', error);
        }) as Message;
      setReplyParams({
        messageId: messageId,
        replyUser: msg.sender,
        replyContent: msg.content,
      });
    }
    fetchMessage(messageId);
    setReply(true);// 显示回复消息提示
  };

  // 处理回复消息点击跳转
  const handleReplyJump = async (messageId: number) => {
    const target = await db.getMessage(messageId);
    if (target) {
      const reId = target.replyId;
      const reMessage = refMap.get(reId);
      if (reMessage?.current) {
        await new Promise((resolve) => setTimeout(resolve, 100)); // 等待 100ms，确保 DOM 元素就绪
        reMessage.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleViewProfile = (userId: string) => {
    // 查看资料的逻辑
    localStorage.setItem("queryId", userId);
    router.push('/user_info/');
  };

  const handleSetHost = (userId: string) => {
    // 设为群主的逻辑
    const token = localStorage.getItem("token");
    fetch('/api/chat/set_host', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify({
        groupId: conversation!.id,
        oldHostId: me,
        newHostId: userId,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
          message.success('设为群主成功');
        } else {
          message.error(`设为群主失败：${res.info}`);
        }
      })
      .catch((error) => {
        message.error(`设为群主失败：${error}`);
      });
  };

  const handleSetAdmin = (userId: string) => {
    // 设为管理员的逻辑
    const token = localStorage.getItem("token");
    fetch('/api/chat/set_admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify({
        groupId: conversation!.id,
        hostId: me,
        adminId: userId,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
          message.success('设为管理员成功');
        } else {
          message.error('设为管理员失败:', res.info);
        }
      })
      .catch((error) => {
        message.error('设为管理员失败:', error);
      });
  };

  const handleRemoveAdmin = (userId: string) => {
    // 移除管理员的逻辑
    const token = localStorage.getItem("token");
    fetch('/api/chat/remove_admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify({
        groupId: conversation!.id,
        hostId: me,
        adminId: userId,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
          message.success('移除管理员成功');
        } else {
          message.error('移除管理员失败:', res.info);
        }
      })
      .catch((error) => {
        message.error('移除管理员失败:', error);
      });
  };

  const handleKickMember = (userId: string) => {
    // 踢出群员的逻辑
    const token = localStorage.getItem("token");
    fetch('/api/chat/kick_member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify({
        groupId: conversation!.id,
        opId: me,
        memberId: userId,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
          message.success('踢出群员成功');
        } else {
          message.error(`踢出群员失败：${res.info}`);
        }
      })
      .catch((error) => {
        message.error('踢出群员失败:', error);
      });
  };

  const handleExitGroup = () => {
    // 退出群聊的逻辑
    const token = localStorage.getItem("token");
    fetch('/api/chat/exit_group', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify({
        groupId: conversation!.id,
        userId: me,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
          db.removeConversations([conversation!.id]);
          message.success('退出群聊成功');
        } else {
          message.error(`退出群聊失败：${res.info}`);
        }
      })
      .catch((error) => {
        message.error('退出群聊失败：', error);
      });
  };

  const showInviteModal = () => {
    // 显示邀请成员弹窗
    const token = localStorage.getItem("token");
    fetch(`/api/friends/myfriends/${me}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
          let options: SelectProps[] = Array.from(res.data).map((item: any, index: number) => ({
            key: index,
            value: item.userId,
            label: item.userName,
            avatarUrl: item.avatarUrl,
          }));
          options = options.filter((item) => !conversation!.members.some(member => member.userId === item.value));
          setSelectItems(options);
          setIsInviteOpen(true);
        } else {
          message.error(`获取群成员失败：${res.info}`);
        }
      })
      .catch((error) => {
        message.error(`获取群成员失败：${error}`);
      });
  };


  const handleInviteNewMember = () => {
    // 邀请新成员的逻辑
    const token = localStorage.getItem("token");
    fetch('/api/chat/invite_member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify({
        groupId: conversation!.id,
        opId: me,
        memberIds: selectMembers,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
          message.success('邀请成功');
          setIsInviteOpen(false);
        } else {
          message.error(`邀请失败：${res.info}`);
        }
      })
      .catch((error) => {
        message.error('邀请失败:', error);
      });
  };

  // 群聊信息编辑弹窗
  const showGroupModel = () => {
    setGroupModel(true);
  };

  const handleCancel = () => {
    setGroupModel(false);
    setUploadedFile(null);
    form.resetFields();
  };

  const handleBeforeUpload = async (file: any) => {
    setUploadedFile(file);
    const reversibleString = await convertToReversibleString(file);
    form.setFieldValue("newAvatarUrl", reversibleString);
    // 返回 false 阻止默认上传行为
    return false;
  };

  const convertToReversibleString = (file: Blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const image = new Image();
        image.onload = function () {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d")!;
          context.drawImage(image, 0, 0);
          const reversibleString = canvas.toDataURL("image/jpeg");
          resolve(reversibleString);
        };
        image.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEdit = async () => {
    try {
      // 1. 验证表单字段
      const values = await form.validateFields();

      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(([key, value]) => value !== undefined && value !== '')
      );
      // 2. 发送更新请求
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const response = await fetch(`/api/chat/update_group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`,
        },
        body: JSON.stringify({
          groupId: conversation!.id,
          userId: userId,
          ...filteredValues,
        }),
      });
      const data = await response.json();
      if (Number(data.code) === 0) {
        form.resetFields();
        setUploadedFile(null);
        messageApi.success("更新成功");
      } else {
        form.resetFields();
        setUploadedFile(null);
        message.error(data.info);
      }

    } catch (error: any) {
      message.error(error);
    }
    setGroupModel(false);
  };

  return (
    <div style={containerStyle} >
      {contextHolder}
      <HistoryModal
        isOpen={isModalOpen}
        onCancel={handleModalCancel}
        messages={messages?.filter((item) => !item.deleteList.includes(me))!}
        conversation={conversation!}
      />

      <NotificationList
        isOpen={isNotificationOpen}
        onCancel={() => setIsNotificationOpen(false)}
        me={me}
        groupId={conversation?.id}
        groupNotificationList={conversation?.groupNotificationList}
        edit={me === conversation?.host?.userId || conversation?.adminList?.some((admin) => admin.userId === me)}
      />

      {conversation && (
        <>
          <Modal
            title="邀请好友"
            okText="邀请"
            cancelText="取消"
            open={isInviteOpen}
            onOk={handleInviteNewMember}
            onCancel={() => setIsInviteOpen(false)}
            destroyOnClose={true}
          >
            <Select
              mode="multiple"
              allowClear={true}
              style={{ width: '100%' }}
              placeholder="选择好友加入群聊"
              defaultValue={[]}
              onChange={setSelectMembers}
              options={selectItems}
              optionRender={(option) => (
                <Space>
                  <span role="img" aria-label={option.data.label}>
                    {<Avatar src={option.data.avatarUrl} />}
                  </span>
                  {option.data.label}
                </Space>
              )}
            />
          </Modal>

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
            getContainer={() => document.body}
            zIndex={0}
          >
            {conversation.type === 'private_chat' ?
              <>
                {/* 私聊显示列表 */}
                <div className={styles.memberGrid}>
                  {conversation.members
                    ? Array.from(conversation.members.values()).map((item) => (
                      <div key={item.userId} className={styles.member}>
                        <Avatar src={item.avatarUrl} alt={item.userName} className={styles.avatar} />
                        <div className={styles.name}>{item.userName}</div>
                      </div>
                    ))
                    : null}
                </div>
                <Divider />
                <div >
                  <Button className={styles.chatHistoryButton} type="text" onClick={showModal} > 查看聊天记录</Button>
                </div>
              </>
              :
              <>
                {/* 群聊显示列表 */}
                <div className={styles.memberGrid}>
                  {conversation.members
                    ? Array.from(conversation.members.values()).map((item) => (
                      <div key={item.userId} className={styles.member}>
                        {me !== item.userId ? <Popover
                          content={
                            <div className={styles.buttonGroup}>
                              <Button type="text" onClick={() => handleViewProfile(item.userId)}>
                                查看资料
                              </Button>
                              {me === conversation.host.userId ? (
                                <Button type="text" onClick={() => handleSetHost(item.userId)}>
                                  设为群主
                                </Button>
                              ) : null}
                              {!conversation.adminList.some((admin) => admin.userId === item.userId) && me === conversation.host.userId ? (
                                <Button type="text" onClick={() => handleSetAdmin(item.userId)}>
                                  设为管理员
                                </Button>
                              ) : null}
                              {conversation.adminList.some((admin) => admin.userId === item.userId) && me === conversation.host.userId ? (
                                <Button type="text" onClick={() => handleRemoveAdmin(item.userId)}>
                                  移除管理员
                                </Button>
                              ) : null}
                              {((me === conversation.host.userId)
                                || ((conversation.adminList.some((admin) => admin.userId === me))
                                  && (item.userId !== conversation.host.userId)
                                  && (!conversation.adminList.some((admin) => admin.userId === item.userId)))) ? (
                                <Button type="text" danger onClick={() => handleKickMember(item.userId)}>
                                  踢出群员
                                </Button>
                              ) : null}
                            </div>
                          }
                          trigger={['contextMenu']}
                          className={styles.dropdown}
                        >
                          <Avatar src={item.avatarUrl} className={styles.avatar} />
                        </Popover>
                          : <Avatar src={item.avatarUrl} className={styles.avatar} />}
                        <div className={styles.name}>{item.userName}</div>
                        {item.userId === conversation.host.userId && (
                          <Tag color="yellow" className={styles.tag}>
                            群主
                          </Tag>
                        )}
                        {conversation.adminList && conversation.adminList.some((admin) => admin.userId === item.userId) && (
                          <Tag color="green" className={styles.tag}>
                            管理员
                          </Tag>
                        )}
                      </div>
                    ))
                    : null}
                  <div key={'new_member'} className={styles.member}>
                    <Avatar size={50} icon={<UserAddOutlined />} onClick={showInviteModal} />
                    <div key={'new_member'} className={styles.name}>邀请</div>
                  </div>
                </div>
                <Divider />
                {me === conversation.host.userId || conversation.adminList.some((admin) => admin.userId === me) ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button className={styles.chatHistoryButton} type="text" onClick={showGroupModel}> 编辑群聊信息 </Button>
                    <Modal
                      title="编辑资料"
                      open={groupModel}
                      okText="确认"
                      cancelText="取消"
                      onOk={handleEdit}
                      onCancel={handleCancel}
                    >
                      <Form
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 20 }}
                        form={form}>
                        <Form.Item
                          label="新群名"
                          name="newName"
                          rules={[{
                            pattern: /^.{3,16}$/,
                            message: "群名长度限制为 3 到 16 个字符"
                          }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item name="newAvatarUrl" style={{ display: "none" }}></Form.Item>
                        <Upload
                          action="/upload.do"
                          listType="picture-card"
                          maxCount={1}
                          onRemove={() => {
                            setUploadedFile(null);
                            form.setFieldValue("newAvatarUrl", "");
                          }}
                          beforeUpload={handleBeforeUpload}
                          withCredentials={false}
                          fileList={uploadedFile ? [uploadedFile] : []}>
                          <button style={{ border: 0, background: "none" }} type="button">
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>上传头像</div>
                          </button>
                        </Upload>
                      </Form>
                    </Modal>
                  </div>
                ) : null}
                <div >
                  <Button className={styles.chatHistoryButton} type="text" onClick={showModal}> 查看聊天记录</Button>
                </div>
                <div >
                  <Button className={styles.chatHistoryButton} type="text" onClick={() => setIsNotificationOpen(true)}> 查看群公告</Button>
                </div>
                <div>
                  <Popconfirm
                    title="退出群聊"
                    description="你确定要退出群聊吗?"
                    okText="确定"
                    cancelText="取消"
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    onConfirm={handleExitGroup}
                    onCancel={() => { }}
                  >
                    <Button className={styles.chatHistoryButton} type="link" danger > 退出群聊</Button>
                  </Popconfirm>
                </div>
              </>
            }
          </Drawer>
        </>
      )}

      <div className={styles.messages}>
        {/* 消息列表容器 */}
        {messages?.map((item) => {
          if (!item.deleteList.includes(me)) {
            return (
              <div key={item.id} ref={refMap.get(item.id)}> {/* 每条消息的引用位置 */}
                <MessageBubble
                  key={item.id}
                  messageId={item.id}
                  isMe={item.senderId === me}
                  {...item}
                  avatar={getConversationMemberAvatar(conversation!, item.senderId)} // 获取头像
                  readList={item.readList}
                  replyMessage={replyMessage} // 处理回复消息的回调函数
                  handleDeleteMessage={handleDeleteMessage} // 处理删除消息想回调函数
                  handleReplyJump={handleReplyJump}
                />
              </div>// 渲染每条消息为MessageBubble组件
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
            {reply && <Tag
              color="blue"
              bordered={false}
              style={{ overflow: "auto", maxWidth: "100%", height: 30 }}>
              {"回复 " + replyParams.replyUser + " : " + replyParams.replyContent}
            </Tag>}
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
