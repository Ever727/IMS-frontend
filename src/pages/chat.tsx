import React from "react";
import { UploadOutlined, UserOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import TextInput from "../components/TextInput";
import SearchInput from "../components/SearchInput";
import ScrollList from "../components/ScrollList";

const { Header, Content, Footer, Sider } = Layout;
const items = new Array(10).fill(UserOutlined).map(
  (icon, index) => ({
    key: String(index + 1),
    icon: React.createElement(icon),
    label: `nav ${index + 1}`,
  }),
);

const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout, colorSuccessBg },
  } = theme.useToken();

  return (
    <Layout style={{ background: colorBgLayout, height: "800px" }}>
      <Sider width="60px" ></Sider>
      <Sider
        breakpoint="md"
        collapsedWidth="0"
        style={{ background: colorBgLayout }}
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <Layout style={{ margin: "0px 0", background: colorBgLayout }}>
          <SearchInput />
        </Layout>
        <div className="demo-logo-vertical" />
        <ScrollList />
      </Sider>
      <Layout>
        <Layout style={{ margin: "0", height: "700px" }}>
          <div
            style={{
              padding: 24,
              minHeight: 700,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
          </div>
        </Layout>
        <Layout style={{ margin: "0" }}>
          <TextInput />
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;