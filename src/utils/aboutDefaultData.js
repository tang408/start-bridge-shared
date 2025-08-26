// 默認 STARS 數據
export function getDefaultStarsData() {
  return [
    { 
      id: 1,
      key: "sincerity", 
      letter: "S", 
      title: "Sincerity", 
      subtitle: "真誠透明" 
    },
    { 
      id: 2,
      key: "teamwork", 
      letter: "T", 
      title: "Teamwork", 
      subtitle: "參與共創" 
    },
    {
      id: 3,
      key: "accountab",
      letter: "A",
      title: "Accountability",
      subtitle: "風險共擔",
    },
    {
      id: 4,
      key: "reliability",
      letter: "R",
      title: "Reliability",
      subtitle: "專業支持",
    },
    {
      id: 5,
      key: "sustain",
      letter: "S",
      title: "Sustainability",
      subtitle: "永續成長",
    },
  ];
}

// 默認優勢數據
export function getDefaultAdvantages() {
  return [
    {
      id: 1,
      icon: new URL("@/assets/icon/about-icon1.png", import.meta.url).href,
      title: "觸及多元投資者",
      description: "結合內部資源與平台，幫助項目接觸到不同投資客群，提升資金觸達。",
      cardType: "yellow"
    },
    {
      id: 2,
      icon: new URL("@/assets/icon/about-icon2.png", import.meta.url).href,
      title: "專業分析與支持",
      description: "提供數據分析與顧問，協助方案做出更穩定的決策，建立穩定的合作關係。",
      cardType: "orange"
    },
    {
      id: 3,
      icon: new URL("@/assets/icon/about-icon3.png", import.meta.url).href,
      title: "探索商業活力",
      description: "尋找新市場與營運機會，發掘具有潛力的品牌與模式。",
      cardType: "black"
    }
  ];
}

// 默認創辦人數據
export function getDefaultOfficialFounders() {
  return [
    {
      id: 1,
      name: "創辦人",
      photo: new URL("@/assets/images/people-1.png", import.meta.url).href,
      info: "Lorem er magna aliqua. Ut enim ad minim am, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
    },
    {
      id: 2,
      name: "創辦人",
      photo: new URL("@/assets/images/people-2.png", import.meta.url).href,
      info: "Lorem er magna aliqua. Ut enim ad minim am, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
    },
    {
      id: 3,
      name: "創辦人",
      photo: new URL("@/assets/images/people-1.png", import.meta.url).href,
      info: "Lorem er magna aliqua. Ut enim ad minim am, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
    },
    {
      id: 4,
      name: "創辦人",
      photo: new URL("@/assets/images/people-2.png", import.meta.url).href,
      info: "Lorem er magna aliqua. Ut enim ad minim am, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
    },
  ];
}