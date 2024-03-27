import React, { useMemo, useState } from 'react';
import { Button, ConfigProvider, Popover, Segmented } from 'antd';

const text = <span>Title</span>;

const buttonWidth = 80;

const content = (
    <div>
        <p>Content</p>
        <p>Content</p>
    </div>
);

const SideButton: React.FC = () => {
    return (
        <ConfigProvider button={{ style: { width: buttonWidth, margin: 4 } }}>
            <div style={{ width: buttonWidth, marginInlineStart: buttonWidth * 4 + 24 }}>
                <Popover placement="rightTop" title={text} content={content} arrow={true} trigger="click">
                </Popover>
            </div>
        </ConfigProvider>
    );
};

export { SideButton };