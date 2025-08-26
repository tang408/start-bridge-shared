// 默認服務圖標數據
export function getDefaultServiceIcons() {
  return [
    {
      img: new URL("@/assets/images/service-icon1.svg", import.meta.url).href,
      title: "創業不迷航",
      description: "從評估到加盟，專員陪跑解決焦慮。",
    },
    {
      img: new URL("@/assets/images/service-icon2.svg", import.meta.url).href,
      title: "嚴選連鎖品牌",
      description: "嚴選優質成熟品牌，複製成功模式。",
    },
    {
      img: new URL("@/assets/images/service-icon3.svg", import.meta.url).href,
      title: "雲端資料庫",
      description: "即時瀏覽品牌資訊、串接全台人脈網絡。",
    },
    {
      img: new URL("@/assets/images/service-icon4.svg", import.meta.url).href,
      title: "低門檻參與",
      description: "告別盲目投入，小額滾出大收益。",
    },
    {
      img: new URL("@/assets/images/service-icon5.svg", import.meta.url).href,
      title: "實戰進修輔導",
      description: "輔導課程、專業講座、業師培訓一應俱全。",
    },
  ];
}

// 默認項目數據
export function getDefaultProjects() {
  return [
    {
      id: 1,
      img: new URL("@/assets/images/card-box.png", import.meta.url).href,
      title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
      progress: 88,
      price: "99天",
      supporters: "9999 人瀏覽",
      to: { name: "ProjectDetail", params: { id: 1 } },
    },
    {
      id: 2,
      img: new URL("@/assets/images/card-box.png", import.meta.url).href,
      title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
      progress: 72,
      price: "99天",
      supporters: "9999 人瀏覽",
      to: { name: "ProjectDetail", params: { id: 2 } },
    },
    {
      id: 3,
      img: new URL("@/assets/images/card-box.png", import.meta.url).href,
      title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
      progress: 55,
      price: "99天",
      supporters: "9999 人瀏覽",
      to: { name: "ProjectDetail", params: { id: 3 } },
    },
    {
      id: 4,
      img: new URL("@/assets/images/card-box.png", import.meta.url).href,
      title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
      progress: 91,
      price: "99天",
      supporters: "9999 人瀏覽",
      to: { name: "ProjectDetail", params: { id: 4 } },
    },
    {
      id: 5,
      img: new URL("@/assets/images/card-box.png", import.meta.url).href,
      title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
      progress: 64,
      price: "99天",
      supporters: "9999 人瀏覽",
      to: { name: "ProjectDetail", params: { id: 5 } },
    },
  ];
}

// 默認流程步驟數據
export function getDefaultProcessSteps() {
  return [
    {
      img: new URL("@/assets/images/process-step1.png", import.meta.url).href,
      title: "線上註冊",
      desc: "對焦創業意向及需求，\n提交申請，啟動媒合。",
    },
    {
      img: new URL("@/assets/images/process-step2.png", import.meta.url).href,
      title: "門店諮詢",
      desc: "預約到訪實體店，\n專業顧問解析專屬方案。",
    },
    {
      img: new URL("@/assets/images/process-step3.png", import.meta.url).href,
      title: "專員對接",
      desc: "化身陪跑夥伴從旁支援，\n主動挖掘合作方，溝通協調。",
    },
    {
      img: new URL("@/assets/images/process-step4.png", import.meta.url).href,
      title: "合作支持",
      desc: "簽訂法律協議，保障權益。\n提供持續跟進與輔導服務。",
    },
  ];
}