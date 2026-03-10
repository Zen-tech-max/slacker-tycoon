import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // 引入刚才写的全局样式

// 将 React 应用挂载到 index.html 的 root 节点上
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);