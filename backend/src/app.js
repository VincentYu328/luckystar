// backend/src/app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import apiRoutes from './routes/api.js';
import errorHandler from './middleware/errorHandler.js';

// 解决 ESModule __dirname 问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ===========================================
   1. Global Middlewares
=========================================== */

// 允许 JSON body
app.use(express.json({ limit: '5mb' }));

// 解析 URL-encoded 数据（表单）
app.use(express.urlencoded({ extended: true }));

// Cookie 解析（JWT + Admin Portal）
app.use(cookieParser());

// CORS（开发环境放宽）
app.use(
  cors({
    origin: true,            // 自动反射请求源
    credentials: true,       // 允许 Cookie
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  })
);

/* ===========================================
   2. API Routes 集中入口
=========================================== */

app.use('/api', apiRoutes);

/* ===========================================
   3. Static Files（可选：未来前端构建后配置）
=========================================== */

// const frontendDistPath = path.join(__dirname, '../../frontend/dist');
// app.use(express.static(frontendDistPath));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(frontendDistPath, 'index.html'));
// });

/* ===========================================
   4. Global Error Handler
=========================================== */

app.use(errorHandler);

/* ===========================================
   5. Export App（server.js 将启动它）
=========================================== */

export default app;
