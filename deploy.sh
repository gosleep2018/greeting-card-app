#!/bin/bash

# 女神节祝福卡片生成器部署脚本
# 作者: Greeting Card Team
# 版本: 1.0.0

set -e  # 遇到错误时退出脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "女神节祝福卡片生成器部署脚本"
    echo ""
    echo "使用方法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  install    安装依赖并启动应用"
    echo "  start      启动应用"
    echo "  stop       停止应用"
    echo "  restart    重启应用"
    echo "  status     查看应用状态"
    echo "  update     更新代码并重启"
    echo "  backup     备份应用数据"
    echo "  help       显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 install   # 首次安装"
    echo "  $0 start     # 启动应用"
    echo "  $0 status    # 查看状态"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "命令 '$1' 未找到，请先安装"
        exit 1
    fi
}

# 检查Node.js版本
check_node_version() {
    local required_version=16
    local current_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    
    if [ "$current_version" -lt "$required_version" ]; then
        log_error "Node.js 版本过低 (当前: v$current_version, 需要: v$required_version+)"
        exit 1
    fi
    log_info "Node.js 版本检查通过: v$(node -v)"
}

# 安装依赖
install_dependencies() {
    log_info "正在安装后端依赖..."
    cd backend
    npm install --production
    cd ..
    log_success "依赖安装完成"
}

# 启动应用
start_application() {
    log_info "正在启动应用..."
    
    # 检查是否已安装PM2
    if command -v pm2 &> /dev/null; then
        # 使用PM2启动
        if pm2 list | grep -q "greeting-card"; then
            log_warning "应用已在运行中"
            pm2 status greeting-card
        else
            cd backend
            pm2 start server.js --name "greeting-card" --log-date-format "YYYY-MM-DD HH:mm:ss"
            pm2 save
            log_success "应用已启动 (PM2模式)"
            show_status
        fi
    else
        # 直接启动
        cd backend
        nohup node server.js > ../app.log 2>&1 &
        echo $! > ../app.pid
        log_success "应用已启动 (直接模式)"
        log_info "日志文件: app.log"
        log_info "PID文件: app.pid"
    fi
}

# 停止应用
stop_application() {
    log_info "正在停止应用..."
    
    if command -v pm2 &> /dev/null; then
        if pm2 list | grep -q "greeting-card"; then
            pm2 stop greeting-card
            pm2 delete greeting-card
            log_success "应用已停止 (PM2模式)"
        else
            log_warning "应用未在PM2中运行"
        fi
    fi
    
    # 检查直接模式
    if [ -f "app.pid" ]; then
        local pid=$(cat app.pid)
        if ps -p $pid > /dev/null; then
            kill $pid
            log_success "应用已停止 (直接模式, PID: $pid)"
        else
            log_warning "PID文件存在但进程未运行"
        fi
        rm -f app.pid
    fi
    
    # 清理日志文件
    if [ -f "app.log" ]; then
        mv app.log "app.log.$(date +%Y%m%d_%H%M%S)"
        log_info "日志文件已归档"
    fi
}

# 重启应用
restart_application() {
    log_info "正在重启应用..."
    stop_application
    sleep 2
    start_application
}

# 查看状态
show_status() {
    log_info "应用状态检查..."
    
    echo ""
    echo "=== 系统信息 ==="
    echo "当前时间: $(date)"
    echo "工作目录: $(pwd)"
    echo "Node版本: $(node -v)"
    echo "NPM版本: $(npm -v)"
    
    echo ""
    echo "=== 应用状态 ==="
    
    # 检查PM2模式
    if command -v pm2 &> /dev/null; then
        if pm2 list | grep -q "greeting-card"; then
            pm2 status greeting-card
            echo ""
            echo "最近日志:"
            pm2 logs greeting-card --lines 10 --nostream
        else
            echo "PM2: 应用未运行"
        fi
    fi
    
    # 检查直接模式
    if [ -f "app.pid" ]; then
        local pid=$(cat app.pid)
        if ps -p $pid > /dev/null; then
            echo "直接模式: 运行中 (PID: $pid)"
            echo "启动时间: $(ps -p $pid -o lstart=)"
            echo "内存使用: $(ps -p $pid -o rss=) KB"
        else
            echo "直接模式: 未运行 (残留PID文件)"
        fi
    else
        echo "直接模式: 未运行"
    fi
    
    echo ""
    echo "=== 端口检查 ==="
    if netstat -tuln 2>/dev/null | grep -q ":3000"; then
        echo "端口 3000: 正在监听"
    else
        echo "端口 3000: 未监听"
    fi
    
    echo ""
    echo "=== 文件检查 ==="
    echo "前端文件: $(ls -la frontend/ | wc -l) 个文件"
    echo "后端文件: $(ls -la backend/ | wc -l) 个文件"
    echo "依赖状态: $(if [ -d "backend/node_modules" ]; then echo "已安装"; else echo "未安装"; fi)"
}

# 更新应用
update_application() {
    log_info "正在更新应用..."
    
    # 备份当前版本
    local backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p $backup_dir
    cp -r frontend backend $backup_dir/
    log_info "当前版本已备份到: $backup_dir"
    
    # 停止应用
    stop_application
    
    # 拉取最新代码（假设从Git更新）
    if [ -d ".git" ]; then
        log_info "从Git拉取更新..."
        git pull origin main
    else
        log_warning "未发现Git仓库，跳过代码更新"
    fi
    
    # 安装依赖
    install_dependencies
    
    # 启动应用
    start_application
    
    log_success "应用更新完成"
}

# 备份数据
backup_data() {
    log_info "正在备份应用数据..."
    
    local backup_file="greeting-card-backup-$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # 创建备份
    tar -czf $backup_file \
        frontend/ \
        backend/ \
        README.md \
        .gitignore \
        deploy.sh \
        2>/dev/null
    
    # 添加日志文件（如果存在）
    if [ -f "app.log" ]; then
        tar -rzf $backup_file app.log
    fi
    
    # 添加配置文件（如果存在）
    if [ -f "backend/.env" ]; then
        tar -rzf $backup_file backend/.env
    fi
    
    local backup_size=$(du -h $backup_file | cut -f1)
    log_success "备份完成: $backup_file ($backup_size)"
    
    # 显示备份信息
    echo ""
    echo "=== 备份内容 ==="
    tar -tzf $backup_file | head -20
    echo "..."
    
    # 建议存储位置
    echo ""
    echo "建议将备份文件复制到安全位置:"
    echo "  scp $backup_file user@backup-server:/backup/"
}

# 主函数
main() {
    local command=${1:-"help"}
    
    # 检查必要命令
    check_command "node"
    check_command "npm"
    check_node_version
    
    case $command in
        "install")
            install_dependencies
            start_application
            ;;
        "start")
            start_application
            ;;
        "stop")
            stop_application
            ;;
        "restart")
            restart_application
            ;;
        "status")
            show_status
            ;;
        "update")
            update_application
            ;;
        "backup")
            backup_data
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"