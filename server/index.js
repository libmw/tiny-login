const http = require('http');
const mysql = require('mysql2/promise');

// MySQL数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'ls@123',
  database: 'user',
};

// HTTP服务器配置
const PORT = 3000;

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/login') {
    // 假设使用JSON格式的请求体
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString(); // 将接收到的Buffer转换为字符串
    });
    req.on('end', async () => {
      try {
        // 解析JSON请求体
        const { username, password } = JSON.parse(body);

        // 检查是否提供了必要的字段
        if (!username || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({ error: 'Username and password are required' }),
          );
          return;
        }

        // 获取数据库连接
        const connection = await mysql.createConnection(dbConfig);

        // 执行SQL查询
        const [rows] = await connection.execute(
          'SELECT * FROM users WHERE username = ? AND password = ?',
          [username, password],
        );

        // 检查结果
        if (rows.length > 0) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({ success: true, message: 'Login successful' }),
          );
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: false,
              message: '用户名或者密码错误',
            }),
          );
        }

        // 关闭数据库连接
        await connection.end();
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
        console.error('Database error:', error);
      }
    });
  } else {
    // 对于非/login请求或不是POST方法，可以返回一个简单的错误消息
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// 监听端口
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
