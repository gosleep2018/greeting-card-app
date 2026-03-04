#!/usr/bin/env python3
"""
Render 自动部署脚本
使用Render API直接部署女神节祝福卡片应用
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

def main():
    # 检查是否提供了API Key
    if len(sys.argv) < 2:
        print("用法: python3 deploy-render.py <RENDER_API_KEY>")
        print("\n获取Render API Key:")
        print("1. 登录 https://dashboard.render.com")
        print("2. 点击右上角账户 → Account Settings")
        print("3. 在API Keys部分创建新密钥")
        sys.exit(1)
    
    api_key = sys.argv[1]
    print("正在验证Render API Key...")
    
    # 验证API Key
    try:
        req = urllib.request.Request("https://api.render.com/v1/user")
        req.add_header("Authorization", f"Bearer {api_key}")
        req.add_header("Accept", "application/json")
        
        with urllib.request.urlopen(req) as response:
            user_data = json.load(response)
            user_email = user_data.get("email", "未知")
            print(f"✅ Render账户: {user_email}")
    except urllib.error.HTTPError as e:
        print(f"错误：Render API Key无效 (HTTP {e.code})")
        print(e.read().decode())
        sys.exit(1)
    except Exception as e:
        print(f"错误：无法连接Render API - {e}")
        sys.exit(1)
    
    # 服务配置
    service_config = {
        "type": "web_service",
        "name": "greeting-card-app",
        "ownerId": "user",  # 会被API自动填充
        "repo": "https://github.com/gosleep2018/greeting-card-app",
        "branch": "main",
        "runtime": "node",
        "buildCommand": "cd backend && npm install",
        "startCommand": "cd backend && npm start",
        "plan": "free",
        "healthCheckPath": "/api/health",
        "autoDeploy": True,
        "envVars": [
            {"key": "NODE_ENV", "value": "production"},
            {"key": "PORT", "value": "3000"}
        ]
    }
    
    print(f"\n正在检查服务是否已存在...")
    
    # 检查服务是否已存在
    existing_service_id = None
    try:
        req = urllib.request.Request("https://api.render.com/v1/services")
        req.add_header("Authorization", f"Bearer {api_key}")
        req.add_header("Accept", "application/json")
        
        with urllib.request.urlopen(req) as response:
            services = json.load(response)
            for service in services:
                if service.get("name") == "greeting-card-app":
                    existing_service_id = service.get("id")
                    service_url = service.get("serviceDetails", {}).get("url")
                    print(f"⚠️  服务已存在: {service_url}")
                    break
    except Exception as e:
        print(f"警告：检查现有服务时出错 - {e}")
    
    if existing_service_id:
        # 如果服务已存在，触发重新部署
        print("\n服务已存在，触发重新部署...")
        try:
            deploy_url = f"https://api.render.com/v1/services/{existing_service_id}/deploys"
            data = json.dumps({}).encode('utf-8')
            
            req = urllib.request.Request(deploy_url, data=data, method="POST")
            req.add_header("Authorization", f"Bearer {api_key}")
            req.add_header("Content-Type", "application/json")
            req.add_header("Accept", "application/json")
            
            with urllib.request.urlopen(req) as response:
                deploy_data = json.load(response)
                deploy_id = deploy_data.get("id")
                print(f"✅ 重新部署已触发 (部署ID: {deploy_id})")
                
                # 等待部署完成
                wait_for_deploy(api_key, existing_service_id, deploy_id)
                
        except Exception as e:
            print(f"错误：重新部署失败 - {e}")
            sys.exit(1)
    else:
        # 创建新服务
        print("\n正在创建新的Render服务...")
        try:
            create_url = "https://api.render.com/v1/services"
            data = json.dumps(service_config).encode('utf-8')
            
            req = urllib.request.Request(create_url, data=data, method="POST")
            req.add_header("Authorization", f"Bearer {api_key}")
            req.add_header("Content-Type", "application/json")
            req.add_header("Accept", "application/json")
            
            with urllib.request.urlopen(req) as response:
                service_data = json.load(response)
                service_id = service_data.get("id")
                service_url = service_data.get("serviceDetails", {}).get("url")
                
                print(f"✅ 服务创建成功!")
                print(f"   服务ID: {service_id}")
                print(f"   服务URL: {service_url}")
                
                # 等待初始部署
                print(f"\n正在等待初始部署完成...")
                time.sleep(5)  # 给Render一些时间开始部署
                
                # 获取部署状态
                check_deploy_status(api_key, service_id)
                
        except urllib.error.HTTPError as e:
            error_response = e.read().decode()
            print(f"错误：创建服务失败 (HTTP {e.code})")
            print(f"响应: {error_response}")
            
            # 尝试解析错误信息
            try:
                error_data = json.loads(error_response)
                if "message" in error_data:
                    print(f"错误信息: {error_data['message']}")
            except:
                pass
            
            sys.exit(1)
        except Exception as e:
            print(f"错误：创建服务失败 - {e}")
            sys.exit(1)

def wait_for_deploy(api_key, service_id, deploy_id):
    """等待部署完成"""
    print(f"\n正在监控部署进度...")
    
    max_checks = 30  # 最多检查30次
    check_interval = 10  # 每次间隔10秒
    
    for i in range(max_checks):
        try:
            # 获取部署状态
            deploy_url = f"https://api.render.com/v1/services/{service_id}/deploys/{deploy_id}"
            req = urllib.request.Request(deploy_url)
            req.add_header("Authorization", f"Bearer {api_key}")
            req.add_header("Accept", "application/json")
            
            with urllib.request.urlopen(req) as response:
                deploy_data = json.load(response)
                status = deploy_data.get("status")
                print(f"检查 {i+1}/{max_checks}: 部署状态 - {status}")
                
                if status == "live":
                    # 获取服务详情以获取URL
                    service_url = f"https://api.render.com/v1/services/{service_id}"
                    req = urllib.request.Request(service_url)
                    req.add_header("Authorization", f"Bearer {api_key}")
                    req.add_header("Accept", "application/json")
                    
                    with urllib.request.urlopen(req) as service_response:
                        service_data = json.load(service_response)
                        final_url = service_data.get("serviceDetails", {}).get("url")
                        print(f"\n🎉 部署完成!")
                        print(f"   访问地址: {final_url}")
                        print(f"   API健康检查: {final_url}/api/health")
                        return True
                
                elif status in ["failed", "canceled"]:
                    print(f"❌ 部署失败，状态: {status}")
                    return False
                
        except Exception as e:
            print(f"警告：检查部署状态时出错 - {e}")
        
        if i < max_checks - 1:
            print(f"等待 {check_interval} 秒后再次检查...")
            time.sleep(check_interval)
    
    print(f"⏰ 部署超时，请在Render控制台查看状态")
    return False

def check_deploy_status(api_key, service_id):
    """检查部署状态"""
    try:
        # 获取服务详情
        service_url = f"https://api.render.com/v1/services/{service_id}"
        req = urllib.request.Request(service_url)
        req.add_header("Authorization", f"Bearer {api_key}")
        req.add_header("Accept", "application/json")
        
        with urllib.request.urlopen(req) as response:
            service_data = json.load(response)
            service_url = service_data.get("serviceDetails", {}).get("url")
            
            if service_url:
                print(f"\n✅ 服务详情:")
                print(f"   服务名称: {service_data.get('name')}")
                print(f"   服务URL: {service_url}")
                print(f"   运行状态: {service_data.get('serviceDetails', {}).get('status', '未知')}")
                print(f"   创建时间: {service_data.get('createdAt')}")
                
                print(f"\n🔗 访问链接:")
                print(f"   前端页面: {service_url}")
                print(f"   API健康检查: {service_url}/api/health")
                print(f"   GitHub仓库: https://github.com/gosleep2018/greeting-card-app")
                
                print(f"\n📋 下一步:")
                print(f"   1. 等待构建完成（约2-5分钟）")
                print(f"   2. 访问 {service_url} 测试应用")
                print(f"   3. 在Render控制台查看实时日志")
                
                return True
            else:
                print("警告：无法获取服务URL，请在Render控制台查看")
                return False
                
    except Exception as e:
        print(f"警告：获取服务详情时出错 - {e}")
        return False

def print_final_instructions():
    """打印最终使用说明"""
    print("\n" + "="*60)
    print("🎉 女神节祝福卡片应用部署完成!")
    print("="*60)
    
    print("\n📱 功能测试清单:")
    print("  ✅ 访问首页: 打开部署URL")
    print("  ✅ 输入姓名: 在输入框中输入测试姓名")
    print("  ✅ 生成卡片: 点击'解锁贺卡'按钮")
    print("  ✅ 检查API: 访问 /api/health 端点")
    print("  ✅ 响应式测试: 在不同设备尺寸下测试")
    
    print("\n🔧 维护指南:")
    print("  • 自动部署: 推送代码到GitHub main分支会自动重新部署")
    print("  • 查看日志: 在Render控制台查看实时应用日志")
    print("  • 环境变量: 在Render控制台配置生产环境变量")
    print("  • 监控: Render提供基本监控和健康检查")
    
    print("\n⚡ 性能提示:")
    print("  • 免费计划应用在无流量15分钟后会休眠")
    print("  • 首次访问休眠应用需要30-60秒唤醒时间")
    print("  • 绑定自定义域名可提高访问体验")
    
    print("\n📞 支持:")
    print("  • GitHub Issues: https://github.com/gosleep2018/greeting-card-app/issues")
    print("  • Render文档: https://render.com/docs")
    print("  • 应用文档: 仓库中的README.md")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    main()
    print_final_instructions()