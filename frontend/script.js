// DOM元素
const nameInput = document.getElementById('nameInput');
const clearBtn = document.getElementById('clearBtn');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const previewName = document.getElementById('preview-name');
const resultSection = document.getElementById('resultSection');
const generatedCard = document.getElementById('generatedCard');
const closeResult = document.getElementById('closeResult');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const copyBtn = document.getElementById('copyBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const notification = document.getElementById('notification');

// 全局变量
let currentCardUrl = '';
let serverConnected = false;

// 祝福语库
const blessings = [
    "愿你如春日里的樱花，温柔而绚烂，生活处处是芬芳。",
    "愿你的每一天都充满阳光，每一步都走向幸福，女神节快乐！",
    "你是世间最美好的存在，愿你的笑容永远灿烂如花。",
    "愿你的生活如诗如画，每一天都充满惊喜与美好。",
    "女神节到来，愿你的世界被温柔以待，梦想都能实现。",
    "愿你的优雅与智慧永远相伴，活成自己想要的模样。",
    "愿你心中有爱，眼里有光，生活有诗，远方有梦。",
    "女神节快乐！愿你的每一天都像今天一样美丽动人。"
];

// 设计模板库
const designs = [
    { color1: '#ff9a9e', color2: '#fad0c4', emoji: '🌸' },
    { color1: '#a18cd1', color2: '#fbc2eb', emoji: '💐' },
    { color1: '#fad0c4', color2: '#ffd1ff', emoji: '🌺' },
    { color1: '#ffecd2', color2: '#fcb69f', emoji: '🌷' },
    { color1: '#a1c4fd', color2: '#c2e9fb', emoji: '💮' }
];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 实时更新预览名字
    nameInput.addEventListener('input', updatePreviewName);
    
    // 清空按钮
    clearBtn.addEventListener('click', clearInput);
    
    // 生成贺卡按钮
    generateBtn.addEventListener('click', generateGreetingCard);
    
    // 重置按钮
    resetBtn.addEventListener('click', resetAll);
    
    // 关闭结果按钮
    closeResult.addEventListener('click', () => {
        resultSection.style.display = 'none';
    });
    
    // 下载按钮
    downloadBtn.addEventListener('click', downloadCard);
    
    // 分享按钮
    shareBtn.addEventListener('click', shareCard);
    
    // 复制链接按钮
    copyBtn.addEventListener('click', copyCardLink);
    
    // 初始更新预览
    updatePreviewName();
    
    // 检查服务器连接
    checkServerHealth().then(connected => {
        serverConnected = connected;
        if (connected) {
            console.log('后端API服务器连接正常');
        } else {
            console.log('后端API服务器未连接，使用本地模式');
            showNotification('使用本地模式生成卡片', 'info');
        }
    });
});

// 更新预览名字
function updatePreviewName() {
    const name = nameInput.value.trim() || '邱越';
    previewName.textContent = name;
}

// 清空输入
function clearInput() {
    nameInput.value = '';
    updatePreviewName();
    showNotification('输入已清空', 'info');
}

// 重置所有
function resetAll() {
    nameInput.value = '';
    resultSection.style.display = 'none';
    updatePreviewName();
    showNotification('已重置所有内容', 'info');
}

// 生成祝福卡片
async function generateGreetingCard() {
    const name = nameInput.value.trim();
    
    // 验证输入
    if (!name) {
        showNotification('请输入您的姓名', 'error');
        nameInput.focus();
        return;
    }
    
    if (name.length < 2 || name.length > 10) {
        showNotification('姓名长度应在2-10个字符之间', 'error');
        return;
    }
    
    // 显示加载动画
    loadingOverlay.style.display = 'flex';
    
    try {
        // 调用后端API生成卡片
        const response = await fetch('/api/generate-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || '生成卡片失败');
        }
        
        // 使用API返回的数据生成卡片
        const cardHTML = createCardHTMLFromAPI(data.card);
        generatedCard.innerHTML = cardHTML;
        
        // 显示结果区域
        resultSection.style.display = 'block';
        
        // 平滑滚动到结果区域
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        showNotification('祝福卡片生成成功！', 'success');
        
        // 更新卡片链接
        updateCardLink(data.card.shareUrl || '#');
        
    } catch (error) {
        console.error('生成卡片失败:', error);
        showNotification(error.message || '生成失败，请重试', 'error');
        
        // 如果API调用失败，使用本地生成作为降级方案
        const cardHTML = createCardHTML(name);
        generatedCard.innerHTML = cardHTML;
        resultSection.style.display = 'block';
        showNotification('使用本地模式生成卡片', 'info');
    } finally {
        // 隐藏加载动画
        loadingOverlay.style.display = 'none';
    }
}

// 创建卡片HTML（本地模式）
function createCardHTML(name) {
    const randomDesign = designs[Math.floor(Math.random() * designs.length)];
    const randomBlessing = blessings[Math.floor(Math.random() * blessings.length)];
    const date = new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    return createCardHTMLFromData(name, randomBlessing, randomDesign, date);
}

// 从API数据创建卡片HTML
function createCardHTMLFromAPI(cardData) {
    const date = new Date(cardData.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    return createCardHTMLFromData(
        cardData.name,
        cardData.blessing,
        cardData.template,
        date
    );
}

// 通用卡片HTML生成函数
function createCardHTMLFromData(name, blessing, template, date) {
    const colors = template.colors || [template.color1, template.color2];
    const emoji = template.emoji || '🌸';
    
    return `
        <div class="generated-card-inner" style="
            background: linear-gradient(135deg, ${colors[0]}, ${colors[1]});
            border-radius: 16px;
            padding: 40px;
            color: #333;
            text-align: center;
            border: 3px solid white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        ">
            <div class="card-emoji" style="font-size: 48px; margin-bottom: 20px;">
                ${emoji}
            </div>
            <h2 style="font-size: 32px; margin-bottom: 16px; color: #6a11cb;">
                亲爱的 ${name}
            </h2>
            <p style="font-size: 20px; line-height: 1.6; margin-bottom: 24px; color: #555;">
                ${blessing}
            </p>
            <div class="card-footer" style="margin-top: 30px; padding-top: 20px; border-top: 2px dashed rgba(255,255,255,0.5);">
                <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
                    ${date} · 女神节特别祝福
                </p>
                <p style="font-size: 12px; color: #888;">
                    #专属祝福 #女神节快乐 #${name}
                </p>
            </div>
        </div>
    `;
}

// 更新卡片分享链接
function updateCardLink(shareUrl) {
    // 存储当前的分享链接
    currentCardUrl = shareUrl;
}

// 保存到历史记录（模拟API调用）
async function saveToHistory(name) {
    const history = {
        name: name,
        timestamp: new Date().toISOString(),
        cardType: '女神节祝福'
    };
    
    // 这里在实际项目中会调用后端API
    console.log('保存历史记录:', history);
    
    // 模拟API调用
    await delay(300);
    return true;
}

// 获取服务器健康状态
async function checkServerHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.status === 'ok') {
            console.log('服务器连接正常');
            return true;
        }
    } catch (error) {
        console.warn('服务器连接异常，使用本地模式');
        return false;
    }
    return false;
}

// 下载卡片（模拟功能）
async function downloadCard() {
    showNotification('下载功能正在开发中...', 'info');
    
    // 在实际项目中，这里会使用html2canvas或类似库生成图片
    // const canvas = await html2canvas(document.querySelector('.generated-card-inner'));
    // const link = document.createElement('a');
    // link.download = `女神节祝福卡片_${nameInput.value.trim()}.png`;
    // link.href = canvas.toDataURL('image/png');
    // link.click();
}

// 分享卡片
async function shareCard() {
    const name = nameInput.value.trim() || '邱越';
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${name}的专属女神节祝福卡片`,
                text: `查看${name}的专属女神节祝福卡片！`,
                url: window.location.href
            });
            showNotification('分享成功！', 'success');
        } catch (error) {
            console.log('分享取消:', error);
        }
    } else {
        // 回退方案：复制到剪贴板
        const shareText = `查看${name}的专属女神节祝福卡片：${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        showNotification('分享链接已复制到剪贴板', 'success');
    }
}

// 复制卡片链接
async function copyCardLink() {
    try {
        let cardUrl;
        
        if (currentCardUrl) {
            cardUrl = currentCardUrl;
        } else {
            const name = nameInput.value.trim() || '邱越';
            cardUrl = `${window.location.origin}/card/${encodeURIComponent(name)}?type=goddess-day`;
        }
        
        await navigator.clipboard.writeText(cardUrl);
        showNotification('卡片链接已复制到剪贴板', 'success');
    } catch (error) {
        console.error('复制失败:', error);
        showNotification('复制失败，请手动复制', 'error');
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 设置通知内容和样式
    notification.textContent = message;
    notification.className = 'notification';
    
    // 根据类型设置颜色
    switch (type) {
        case 'success':
            notification.style.background = '#4CAF50';
            break;
        case 'error':
            notification.style.background = '#f44336';
            break;
        case 'info':
            notification.style.background = '#2196F3';
            break;
        case 'warning':
            notification.style.background = '#FF9800';
            break;
    }
    
    // 添加图标
    const icon = document.createElement('i');
    switch (type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            break;
        default:
            icon.className = 'fas fa-info-circle';
    }
    
    notification.prepend(icon);
    
    // 显示通知
    notification.classList.add('show');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 键盘快捷键支持
document.addEventListener('keydown', function(event) {
    // Ctrl+Enter 或 Cmd+Enter 生成卡片
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        generateGreetingCard();
    }
    
    // ESC 关闭结果
    if (event.key === 'Escape' && resultSection.style.display !== 'none') {
        resultSection.style.display = 'none';
    }
});

// 触摸设备优化
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // 为触摸设备添加反馈
    const buttons = document.querySelectorAll('.btn, .clear-btn, .close-result');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时，可以刷新数据
        console.log('页面重新激活');
    }
});

// 错误处理
window.addEventListener('error', function(event) {
    console.error('JavaScript错误:', event.error);
    showNotification('应用程序遇到错误，请刷新页面重试', 'error');
});

// 离线检测
window.addEventListener('offline', function() {
    showNotification('网络连接已断开，部分功能可能不可用', 'warning');
});

window.addEventListener('online', function() {
    showNotification('网络连接已恢复', 'success');
});