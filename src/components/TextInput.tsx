import React, { useState } from "react";
import { Input, Layout } from "antd";

const { TextArea } = Input;

const App: React.FC = () => {
  const [value, setValue] = useState("");

  return (
    <>
        <Layout>
        <TextArea allowClear placeholder="Input your message"  />
        </Layout>
    </>
  );
};

export default App;