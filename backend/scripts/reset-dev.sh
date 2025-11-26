#!/bin/bash

# ==========================================
# Lucky Star — Reset Development Environment
# ==========================================

echo "=========================================="
echo " Lucky Star — Reset Development Environment"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 步骤1: 清理旧数据
echo -e "${BLUE}Step 1/5:${NC} Cleaning old data..."
npm run clean
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Clean failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Clean completed${NC}"
echo ""

# 步骤2: 初始化数据库
echo -e "${BLUE}Step 2/5:${NC} Initializing database..."
npm run db:init
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database initialization failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Database initialized${NC}"
echo ""

# 步骤3: 添加测试数据
echo -e "${BLUE}Step 3/5:${NC} Seeding test data..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Test data seeding failed (non-critical)${NC}"
fi
echo -e "${GREEN}✅ Test data seeded${NC}"
echo ""

# 步骤4: 健康检查
echo -e "${BLUE}Step 4/5:${NC} Running health check..."
npm run db:health
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Health check passed${NC}"
echo ""

# 步骤5: 启动服务器
echo -e "${BLUE}Step 5/5:${NC} Starting development server..."
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""
npm run dev