const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(helmet()); // 安全头
app.use(cors()); // 跨域支持
app.use(bodyParser.json()); // JSON解析
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev')); // 请求日志

// 静态文件服务（为前端提供）
app.use(express.static(path.join(__dirname, '../frontend')));

// 内存存储（生产环境应使用数据库）
const cardsHistory = [];
const cardTemplates = [
  {
    id: 'template-1',
    name: '春日樱花',
    colors: ['#ff9a9e', '#fad0c4'],
    emoji: '🌸',
    description: '温柔浪漫的樱花主题'
  },
  {
    id: 'template-2',
    name: '梦幻紫罗兰',
    colors: ['#a18cd1', '#fbc2eb'],
    emoji: '💐',
    description: '神秘梦幻的紫色主题'
  },
  {
    id: 'template-3',
    name: '温暖阳光',
    colors: ['#fad0c4', '#ffd1ff'],
    emoji: '🌺',
    description: '温暖明亮的阳光主题'
  },
  {
    id: 'template-4',
    name: '清新海洋',
    colors: ['#a1c4fd', '#c2e9fb'],
    emoji: '🌷',
    description: '清新自然的海洋主题'
  }
];

const blessingsLibrary = [
  "愿你如春日里的樱花，温柔而绚烂，生活处处是芬芳。",
  "愿你的每一天都充满阳光，每一步都走向幸福，女神节快乐！",
  "你是世间最美好的存在，愿你的笑容永远灿烂如花。",
  "愿你的生活如诗如画，每一天都充满惊喜与美好。",
  "女神节到来，愿你的世界被温柔以待，梦想都能实现。",
  "愿你的优雅与智慧永远相伴，活成自己想要的模样。",
  "愿你心中有爱，眼里有光，生活有诗，远方有梦。",
  "女神节快乐！愿你的每一天都像今天一样美丽动人。",
  "愿你独立坚强，温暖善良，活出自己最想要的模样。",
  "愿你的世界里，有鲜花，有阳光，有爱，也有诗和远方。",
  "愿你被这个世界温柔以待，即使生命总以刻薄荒芜相欺。",
  "愿时光能缓，愿故人不散，愿你惦念的人能和你道晚安。",
  "愿你一生努力，一生被爱，想要的都拥有，得不到的都释怀。",
  "愿你所有的努力都不白费，所想的都能如愿，所做的都能实现。"
];

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Greeting Card API',
    version: '1.0.0'
  });
});

// 获取卡片模板
app.get('/api/templates', (req, res) => {
  res.json({
    success: true,
    count: cardTemplates.length,
    templates: cardTemplates
  });
});

// 生成祝福卡片
app.post('/api/generate-card', (req, res) => {
  try {
    const { name, templateId } = req.body;
    
    // 验证输入
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '请输入有效的姓名'
      });
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      return res.status(400).json({
        success: false,
        error: '姓名长度应在2-20个字符之间'
      });
    }
    
    // 选择模板
    let selectedTemplate;
    if (templateId) {
      selectedTemplate = cardTemplates.find(t => t.id === templateId);
    }
    
    if (!selectedTemplate) {
      // 随机选择一个模板
      selectedTemplate = cardTemplates[Math.floor(Math.random() * cardTemplates.length)];
    }
    
    // 随机选择祝福语
    const randomBlessing = blessingsLibrary[Math.floor(Math.random() * blessingsLibrary.length)];
    
    // 生成卡片ID
    const cardId = uuidv4();
    const now = new Date();
    
    // 创建卡片对象
    const card = {
      id: cardId,
      name: trimmedName,
      blessing: randomBlessing,
      template: selectedTemplate,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后过期
      shareUrl: `${req.protocol}://${req.get('host')}/api/cards/${cardId}`
    };
    
    // 保存到历史记录
    cardsHistory.push({
      id: cardId,
      name: trimmedName,
      createdAt: now,
      ip: req.ip
    });
    
    // 限制历史记录大小
    if (cardsHistory.length > 1000) {
      cardsHistory.shift();
    }
    
    // 返回生成的卡片
    res.json({
      success: true,
      card: card,
      message: '祝福卡片生成成功'
    });
    
  } catch (error) {
    console.error('生成卡片时出错:', error);
    res.status(500).json({
      success: false,
      error: '生成卡片时发生内部错误'
    });
  }
});

// 获取卡片详情
app.get('/api/cards/:cardId', (req, res) => {
  try {
    const { cardId } = req.params;
    
    // 在实际应用中，这里会从数据库查询
    // 现在我们先模拟一个响应
    const mockCard = {
      id: cardId,
      name: '示例用户',
      blessing: blessingsLibrary[0],
      template: cardTemplates[0],
      createdAt: new Date().toISOString(),
      shareUrl: `${req.protocol}://${req.get('host')}/api/cards/${cardId}`
    };
    
    res.json({
      success: true,
      card: mockCard
    });
    
  } catch (error) {
    console.error('获取卡片详情时出错:', error);
    res.status(500).json({
      success: false,
      error: '获取卡片详情时发生内部错误'
    });
  }
});

// 获取生成历史（简化版，仅用于演示）
app.get('/api/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const recentHistory = cardsHistory.slice(-limit).reverse();
    
    res.json({
      success: true,
      count: recentHistory.length,
      total: cardsHistory.length,
      history: recentHistory.map(record => ({
        id: record.id,
        name: record.name,
        createdAt: record.createdAt,
        maskedIp: record.ip ? record.ip.replace(/\.\d+$/, '.xxx') : null
      }))
    });
    
  } catch (error) {
    console.error('获取历史记录时出错:', error);
    res.status(500).json({
      success: false,
      error: '获取历史记录时发生内部错误'
    });
  }
});

// 统计数据
app.get('/api/stats', (req, res) => {
  try {
    // 简单的统计计算
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = cardsHistory.filter(
      record => new Date(record.createdAt) >= today
    ).length;
    
    const uniqueNames = [...new Set(cardsHistory.map(record => record.name))];
    
    res.json({
      success: true,
      stats: {
        totalCards: cardsHistory.length,
        todayCards: todayCount,
        uniqueUsers: uniqueNames.length,
        mostCommonTemplate: cardTemplates[0].name,
        serverUptime: process.uptime()
      }
    });
    
  } catch (error) {
    console.error('获取统计信息时出错:', error);
    res.status(500).json({
      success: false,
      error: '获取统计信息时发生内部错误'
    });
  }
});

// 祝福语库
app.get('/api/blessings', (req, res) => {
  try {
    const count = parseInt(req.query.count) || 5;
    const randomBlessings = [];
    
    for (let i = 0; i < Math.min(count, blessingsLibrary.length); i++) {
      const randomIndex = Math.floor(Math.random() * blessingsLibrary.length);
      randomBlessings.push(blessingsLibrary[randomIndex]);
    }
    
    res.json({
      success: true,
      count: randomBlessings.length,
      blessings: randomBlessings
    });
    
  } catch (error) {
    console.error('获取祝福语时出错:', error);
    res.status(500).json({
      success: false,
      error: '获取祝福语时发生内部错误'
    });
  }
});

// 处理未知API端点
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API端点不存在',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/templates',
      'POST /api/generate-card',
      'GET /api/cards/:cardId',
      'GET /api/history',
      'GET /api/stats',
      'GET /api/blessings'
    ]
  });
});

// 前端路由处理（SPA支持）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err);
  
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
  🎉 女神节祝福卡片服务器已启动！
  
  📍 本地地址: http://localhost:${PORT}
  📍 网络地址: http://${getLocalIP()}:${PORT}
  
  📊 API健康检查: http://localhost:${PORT}/api/health
  📝 前端界面: http://localhost:${PORT}/
  
  🚀 服务器已就绪，开始生成祝福吧！
  `);
});

// 获取本地IP地址的辅助函数
function getLocalIP() {
  const interfaces = require('os').networkInterfaces();
  
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  
  return 'localhost';
}

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

// 未处理的Promise拒绝警告
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

module.exports = app;