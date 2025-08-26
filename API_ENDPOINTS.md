# API 端點文檔 (JavaScript 版本)

## 基礎配置
- 基礎 URL: `http://localhost:8080/api`
- 所有響應都應該是 JSON 格式
- 使用 JavaScript + Axios

## 首頁相關端點

### 1. 獲取服務圖標列表
**GET** `/home/service-icons`

**響應示例:**
```json
[
  {
    "img": "http://localhost:8080/images/service-icon1.svg",
    "title": "創業不迷航",
    "description": "從評估到加盟，專員陪跑解決焦慮。"
  },
  {
    "img": "http://localhost:8080/images/service-icon2.svg", 
    "title": "嚴選連鎖品牌",
    "description": "嚴選優質成熟品牌，複製成功模式。"
  }
]
```

### 2. 獲取項目列表
**GET** `/home/projects`

**查詢參數:**
- `limit` (可選): 限制返回數量
- `status` (可選): 項目狀態 (active, completed)

**響應示例:**
```json
[
  {
    "id": 1,
    "img": "http://localhost:8080/images/project1.jpg",
    "title": "創新餐飲連鎖項目",
    "progress": 88,
    "price": "99天",
    "supporters": "9999 人瀏覽",
    "to": {
      "name": "ProjectDetail",
      "params": { "id": 1 }
    }
  }
]
```

### 3. 獲取流程步驟
**GET** `/home/process-steps`

**響應示例:**
```json
[
  {
    "img": "http://localhost:8080/images/process-step1.png",
    "title": "線上註冊",
    "desc": "對焦創業意向及需求，\n提交申請，啟動媒合。"
  }
]
```

### 4. 獲取輪播圖數據
**GET** `/home/banner`

**響應示例:**
```json
[
  {
    "id": 1,
    "img": "http://localhost:8080/images/banner1.jpg",
    "title": "歡迎來到星橋創業平台",
    "subtitle": "您的創業夢想從這裡開始",
    "link": "/about"
  }
]
```

## 關於我們相關端點

### 5. 獲取 STARS 數據
**GET** `/about/stars`

**響應示例:**
```json
[
  {
    "id": 1,
    "key": "sincerity",
    "letter": "S",
    "title": "Sincerity",
    "subtitle": "真誠透明"
  }
]
```

### 6. 獲取優勢數據
**GET** `/about/advantages`

**響應示例:**
```json
[
  {
    "id": 1,
    "icon": "http://localhost:8080/images/about-icon1.png",
    "title": "觸及多元投資者",
    "description": "結合內部資源與平台，幫助項目接觸到不同投資客群，提升資金觸達。",
    "cardType": "yellow"
  }
]
```

### 7. 獲取關於我們信息
**GET** `/about/info`

**響應示例:**
```json
[
  {
    "id": 1,
    "title": "成為亞洲最值得信賴的創業共創平台",
    "content": "在星橋，創業不是遙不可及的大夢...",
    "photo": "http://localhost:8080/images/about-photo1.jpg"
  }
]
```

## 創辦人相關端點

### 8. 獲取創辦人列表
**GET** `/official-founder/list`

**響應示例:**
```json
[
  {
    "id": 1,
    "name": "創辦人",
    "photo": "http://localhost:8080/images/people-1.png",
    "info": "Lorem er magna aliqua. Ut enim ad minim am..."
  }
]
```

## 使用方式

```javascript
import { homeApi } from '@/api/modules/home.js';
import { aboutApi } from '@/api/modules/about.js';
import { officialFounderApi } from '@/api/modules/officialFounder.js';

// 獲取首頁數據
const icons = await homeApi.getServiceIcons();
const projects = await homeApi.getProjects({ limit: 10 });

// 獲取關於我們數據
const stars = await aboutApi.getStarsData();
const advantages = await aboutApi.getAdvantages();

// 獲取創辦人數據
const founders = await officialFounderApi.getOfficialFounders();
```

## 錯誤處理

所有 API 調用都包含自動錯誤處理和默認數據降級。如果 API 失敗，會自動使用 `src/utils/` 中的默認數據。