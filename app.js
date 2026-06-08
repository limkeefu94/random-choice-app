const MODES = {
  food: {
    icon: "🍜",
    title: "今天吃什么？",
    short: "国家地区餐单",
    description: "先选国家、地区和食物种类，候选美食会自动换成当地口味。",
    hint: "国家、地区和种类会改变美食候选池",
    label: "今日菜单",
  },
  drink: {
    icon: "🧋",
    title: "今天喝什么？",
    short: "饮料外卖菜单",
    description: "按国家、品牌和饮料类型随机一杯奶茶、咖啡、果茶或冰饮。",
    hint: "参考外卖平台和品牌菜单，价格以门店为准",
    label: "今日饮料",
  },
  travel: {
    icon: "✈️",
    title: "下一站去哪？",
    short: "旅行灵感",
    description: "按想去国家、活动、消费等级和出行方式抽一个目的地，随机后会给出预算范围。",
    hint: "可按国家、潜水/浮潜/爬山/滑雪等活动筛选",
    label: "旅行目的地",
  },
  number: {
    icon: "🔢",
    title: "娱乐号码随机",
    short: "4D / 6D / TOTO 等格式",
    description: "按国家和玩法生成 4D、6D、TOTO、Powerball、EuroMillions 等格式的随机组合。",
    hint: "号码由随机算法生成，仅供娱乐，不构成投注建议。",
    label: "随机号码",
  },
  shopping: {
    icon: "🛍️",
    title: "今天买什么？",
    short: "购物小决定",
    description: "从日常补给到奢侈品都能抽，结果会附上大概预算。",
    hint: "选择购物类别和消费等级，避免冲动消费",
    label: "购物建议",
  },
  custom: {
    icon: "🎲",
    title: "自定义随机池",
    short: "任何纠结都能放",
    description: "把选项用逗号、空格或换行分开，也可以先锁定朋友们提出的候选。",
    hint: "输入自己的候选项后再随机",
    label: "自定义结果",
  },
};

const MODE_DISPLAY_ORDER = ["food", "shopping", "custom", "drink", "travel", "number"];
const FOOD_CATEGORIES = ["全部", "Mamak", "快餐连锁", "外卖平台热门", "油炸类", "素食类", "低卡类", "快餐", "嘴馋零嘴类", "高热量", "健康类"];
const SPECIAL_FOOD_CATEGORIES = new Set(["Mamak", "快餐连锁", "外卖平台热门"]);
const SPECIAL_REGION_KEYS = new Set(["全国 Mamak", "快餐连锁", "外卖平台热门"]);
const DRINK_CATEGORIES = ["全部", "奶茶", "咖啡", "果茶", "纯茶", "冰沙", "冰淇淋", "低糖", "高热量", "健康类", "外卖热门"];
const IMAGE_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_UPLOAD_BYTES = 2.5 * 1024 * 1024;
const TRAVEL_MOODS = ["全部", "短途", "放松", "自然", "城市", "美食", "文化", "冒险", "购物", "海岛", "亲子"];
const TRAVEL_ACTIVITIES = ["全部", "潜水", "浮潜", "海岛跳岛", "爬山", "徒步", "滑雪", "冲浪", "露营", "温泉", "沙漠", "极光", "野生动物", "赏鲸", "骑行", "皮划艇", "漂流", "文化探索", "美食巡礼", "城市漫游", "购物", "亲子乐园", "摄影", "自驾风景"];
const TRAVEL_LEVELS = ["全部", "穷游", "低消费", "舒适", "轻奢", "奢华"];
const TRAVEL_TRANSPORTS = ["全部", "公共交通", "自驾游", "自由行", "跟团", "步行城市"];
const SHOPPING_LEVELS = ["全部", "低消费", "中等", "高消费", "奢侈品", "理性"];
const SHOPPING_MINDSETS = ["全部", "真的需要", "升级装备", "奖励自己", "先收藏不买", "工作需要", "旅行需要", "便宜小物", "长期投资"];
const DEFAULT_PREVIEW_LIMIT = 24;
const SHOPPING_PREVIEW_LIMIT = 30;
const LOCKABLE_MODES = new Set(["food", "drink", "travel", "shopping", "custom"]);
const SUPPORTED_LANGUAGES = ["zh-CN", "en", "ms"];
const LANGUAGE_LABELS = {
  "zh-CN": "中文",
  en: "English",
  ms: "Bahasa Melayu",
};
const CURRENCY_RATES = {
  MYR: { label: "MYR", perMYR: 1, decimals: 0 },
  SGD: { label: "SGD", perMYR: 1 / 3.1044, decimals: 2 },
  USD: { label: "USD", perMYR: 1 / 3.968, decimals: 2 },
  CNY: { label: "CNY", perMYR: 1 / 0.5863, decimals: 0 },
  JPY: { label: "JPY", perMYR: 100 / 2.491, decimals: 0 },
  THB: { label: "THB", perMYR: 100 / 12.1774, decimals: 0 },
  TWD: { label: "TWD", perMYR: 100 / 12.6333, decimals: 0 },
};

function dish(title, tags, budget) {
  return { title, tags, budget };
}

function drink(brand, title, tags, budget) {
  return { brand, title: `${brand} · ${title}`, drinkTitle: title, tags, budget };
}

function destination(title, country, days, tags, transports, budgets, note, activities = []) {
  return { title, country, days, tags, transports, budgets, note, activities };
}

function createShoppingSuggestion({
  title,
  category,
  subcategory,
  level,
  budget,
  tags = [],
  reason,
  priority,
}) {
  return {
    title,
    category,
    subcategory,
    level,
    budget,
    tags,
    reason,
    priority,
  };
}

function fallbackShop(title, category, subcategory, level, budget, tags = [], reason = "适合补齐当前缺口的人", priority = "按预算再买") {
  return createShoppingSuggestion({
    title,
    category,
    subcategory,
    level,
    budget,
    tags,
    reason,
    priority,
  });
}

function normalizeShoppingSuggestion(item, sourceCategory = "全部") {
  const category = item.category || sourceCategory;
  const subcategory = item.subcategory || item.tags?.[0] || "全部";

  return {
    title: item.title,
    category,
    subcategory,
    level: item.level || "中等",
    budget: item.budget || "按实际价格",
    tags: Array.isArray(item.tags) ? item.tags : [],
    reason: item.reason || `适合正在考虑${subcategory}的人`,
    priority: item.priority || "想清楚再买",
  };
}

function normalizeShoppingData(data) {
  return Object.fromEntries(
    Object.entries(data).map(([category, items]) => [
      category,
      Array.isArray(items) ? items.map((item) => normalizeShoppingSuggestion(item, category)) : [],
    ]),
  );
}

const FALLBACK_SHOPPING_DATA = {
  电子产品: [
    fallbackShop("iPhone 16 / 17 系列", "电子产品", "手机", "高消费", "RM3500-6500", ["手机", "升级", "长期使用"], "适合想升级主力手机的人", "想清楚再买"),
    fallbackShop("降噪耳机", "电子产品", "耳机 / 音响", "高消费", "RM500-1800", ["通勤", "专注", "音质"], "适合通勤、办公和想减少环境噪音的人", "确认使用频率再买"),
    fallbackShop("平板电脑", "电子产品", "平板", "高消费", "RM1200-4800", ["学习", "娱乐", "轻办公"], "适合看课、看剧、手写笔记或轻办公的人", "先确认是否会长期使用"),
  ],
  电脑与配件: [
    fallbackShop("机械键盘", "电脑与配件", "键盘 / 鼠标", "中等", "RM180-650", ["桌面", "打字", "手感"], "适合想改善打字体验和桌面氛围的人", "试轴或看评价后再买"),
    fallbackShop("人体工学椅", "电脑与配件", "办公椅", "高消费", "RM600-2500", ["久坐", "办公", "健康"], "适合每天久坐工作或学习的人", "优先试坐"),
  ],
  家居生活: [
    fallbackShop("洗衣凝珠", "家居生活", "清洁收纳", "低消费", "RM18-45", ["补货", "清洁", "日用品"], "适合家里洗衣用品快用完的人", "需要就买"),
    fallbackShop("护手霜", "家居生活", "个人护理", "低消费", "RM12-45", ["保湿", "随身", "日常"], "适合经常洗手或待在冷气房的人", "小额可买"),
    fallbackShop("收纳盒", "家居生活", "收纳盒 / 架", "低消费", "RM15-60", ["整理", "空间", "家务"], "适合桌面、衣柜或杂物区变乱的人", "先量尺寸"),
  ],
  美妆护理: [
    fallbackShop("防晒霜", "美妆护理", "护肤", "中等", "RM40-180", ["防晒", "日常", "护肤"], "适合每天出门或长时间靠窗工作的人", "需要就买"),
    fallbackShop("香水小样", "美妆护理", "香水", "中等", "RM45-180", ["试香", "礼物", "气味"], "适合还没确定正装香水前先试味道的人", "先小样再正装"),
  ],
  穿搭: [
    fallbackShop("舒服运动鞋", "服饰穿搭", "鞋履", "中等", "RM180-650", ["通勤", "走路", "日常"], "适合想提升日常走路舒适度的人", "试穿后再买"),
    fallbackShop("通勤包", "服饰穿搭", "包袋", "中等", "RM120-600", ["上班", "收纳", "穿搭"], "适合需要装电脑、雨伞和日用品的人", "先确认尺寸"),
  ],
  运动户外: [
    fallbackShop("瑜伽垫", "健康运动", "瑜伽", "低消费", "RM35-180", ["运动", "居家", "拉伸"], "适合想在家运动或拉伸的人", "小额可买"),
    fallbackShop("登山鞋", "旅行户外", "徒步装备", "高消费", "RM450-1600", ["徒步", "户外", "防滑"], "适合准备长距离徒步或爬山的人", "试穿后再买"),
  ],
  礼物: [
    fallbackShop("甜点礼盒", "礼物", "生日礼物", "中等", "RM60-220", ["礼物", "聚会", "分享"], "适合临时需要体面又不太冒险的礼物", "看保质期"),
    fallbackShop("体验券", "礼物", "情侣礼物", "高消费", "RM200-1200", ["体验", "纪念日", "惊喜"], "适合想送一段体验而不是实物的人", "确认对方时间"),
  ],
  奢侈品: [
    fallbackShop("设计师钱包", "奢侈品", "设计师包袋", "奢侈品", "RM1800-6500", ["入门奢侈品", "长期使用", "配饰"], "适合想买第一件耐用奢侈品的人", "想清楚再买"),
    fallbackShop("机械腕表", "奢侈品", "腕表", "奢侈品", "RM8000-80000+", ["腕表", "收藏", "长期使用"], "适合明确喜欢腕表并能接受保养成本的人", "确认预算和维护成本"),
  ],
  理性提醒: [
    fallbackShop("先等 24 小时", "软件 / 订阅 / 数字产品", "效率工具", "理性", "RM0", ["冷静", "防冲动"], "适合不确定是不是真的需要时使用", "先别买"),
    fallbackShop("加入愿望清单", "软件 / 订阅 / 数字产品", "效率工具", "理性", "RM0", ["记录", "复盘", "延迟满足"], "适合把想买的东西先存起来观察", "先别买"),
    fallbackShop("比较三家价格", "软件 / 订阅 / 数字产品", "效率工具", "理性", "RM0", ["比价", "预算", "理性"], "适合价格波动大或替代品很多的商品", "比价后再买"),
  ],
};

function getShoppingDataFromWindow() {
  if (typeof window === "undefined" || !window.SHOPPING_DATA || typeof window.SHOPPING_DATA !== "object") {
    return normalizeShoppingData(FALLBACK_SHOPPING_DATA);
  }

  const categories = Object.keys(window.SHOPPING_DATA);

  return normalizeShoppingData(categories.length ? window.SHOPPING_DATA : FALLBACK_SHOPPING_DATA);
}

const SHOPPING_DATA = getShoppingDataFromWindow();
if (typeof window !== "undefined") {
  window.SHOPPING_DATA = SHOPPING_DATA;
}
if (typeof window !== "undefined") {
  window.SHOPPING_CATEGORY_TREE = [
    {
      id: "all",
      label: "全部",
      children: [],
    },
    {
      id: "electronics",
      label: "电子产品",
      children: [
        { id: "electronics-all", label: "全部" },
        { id: "phones", label: "手机" },
        { id: "computers", label: "电脑" },
        { id: "tablets", label: "平板" },
        { id: "cameras", label: "相机" },
        { id: "audio", label: "耳机 / 音响" },
        { id: "gaming", label: "游戏设备" },
        { id: "wearables", label: "智能穿戴" },
        { id: "pc-parts", label: "电脑配件" },
        { id: "smart-home", label: "智能家居" },
      ],
    },
    {
      id: "computers-accessories",
      label: "电脑与配件",
      children: [
        { id: "computers-accessories-all", label: "全部" },
        { id: "computer-devices", label: "电脑" },
        { id: "laptops", label: "笔记本电脑" },
        { id: "desktops", label: "台式电脑" },
        { id: "monitors", label: "显示器" },
        { id: "keyboards", label: "键盘 / 鼠标" },
        { id: "storage", label: "硬盘 / 存储" },
        { id: "networking", label: "路由器 / 网络" },
        { id: "printers", label: "打印机" },
      ],
    },
    {
      id: "phones-accessories",
      label: "手机与配件",
      children: [
        { id: "phones-accessories-all", label: "全部" },
        { id: "smartphones", label: "智能手机" },
        { id: "phone-cases", label: "手机壳" },
        { id: "chargers-cables", label: "充电器 / 线材" },
        { id: "power-banks", label: "移动电源" },
        { id: "screen-protectors", label: "保护膜" },
        { id: "stands-grips", label: "支架 / 手柄" },
      ],
    },
    {
      id: "daily-essentials",
      label: "生活用品",
      children: [
        { id: "daily-essentials-all", label: "全部" },
        { id: "cleaning-supplies", label: "清洁用品" },
        { id: "daily-paper", label: "纸巾 / 消耗品" },
        { id: "daily-storage", label: "收纳小物" },
        { id: "daily-laundry", label: "洗衣用品" },
      ],
    },
    {
      id: "home-living",
      label: "家居生活",
      children: [
        { id: "home-living-all", label: "全部" },
        { id: "bedding", label: "床品" },
        { id: "lighting", label: "灯具" },
        { id: "home-decor", label: "家饰" },
        { id: "bathroom", label: "浴室用品" },
        { id: "small-appliances", label: "小家电" },
        { id: "furniture", label: "家具" },
      ],
    },
    {
      id: "kitchen",
      label: "厨房用品",
      children: [
        { id: "kitchen-all", label: "全部" },
        { id: "cookware", label: "锅具" },
        { id: "tableware", label: "餐具" },
        { id: "bakeware", label: "烘焙" },
        { id: "coffee-tea", label: "咖啡 / 茶具" },
        { id: "food-storage", label: "保鲜收纳" },
        { id: "kitchen-tools", label: "厨房小工具" },
      ],
    },
    {
      id: "cleaning-storage",
      label: "清洁收纳",
      children: [
        { id: "cleaning-storage-all", label: "全部" },
        { id: "laundry", label: "洗衣用品" },
        { id: "cleaning-tools", label: "清洁工具" },
        { id: "organizers", label: "收纳盒 / 架" },
        { id: "fragrance", label: "香氛除味" },
        { id: "trash-recycling", label: "垃圾分类" },
      ],
    },
    {
      id: "fashion",
      label: "服饰穿搭",
      children: [
        { id: "fashion-all", label: "全部" },
        { id: "tops", label: "上衣" },
        { id: "bottoms", label: "裤装 / 裙装" },
        { id: "shoes", label: "鞋履" },
        { id: "bags", label: "包袋" },
        { id: "accessories", label: "配饰" },
        { id: "innerwear", label: "内衣袜子" },
      ],
    },
    {
      id: "beauty-care",
      label: "美妆护理",
      children: [
        { id: "beauty-care-all", label: "全部" },
        { id: "skincare", label: "护肤" },
        { id: "makeup", label: "彩妆" },
        { id: "haircare", label: "洗护发" },
        { id: "fragrance-beauty", label: "香水" },
        { id: "beauty-tools", label: "美容工具" },
        { id: "personal-care", label: "个人护理" },
      ],
    },
    {
      id: "health-sports",
      label: "健康运动",
      children: [
        { id: "health-sports-all", label: "全部" },
        { id: "fitness", label: "健身器材" },
        { id: "running", label: "跑步" },
        { id: "yoga", label: "瑜伽" },
        { id: "recovery", label: "按摩 / 恢复" },
        { id: "nutrition", label: "营养补给" },
        { id: "outdoor-sports", label: "户外运动" },
      ],
    },
    {
      id: "work-study",
      label: "工作学习",
      children: [
        { id: "work-study-all", label: "全部" },
        { id: "stationery", label: "文具" },
        { id: "desk-setup", label: "桌面布置" },
        { id: "office-chair", label: "办公椅" },
        { id: "books-courses", label: "书籍 / 课程" },
        { id: "productivity-tools", label: "效率工具" },
      ],
    },
    {
      id: "transport",
      label: "交通工具",
      children: [
        { id: "transport-all", label: "全部" },
        { id: "cars", label: "汽车" },
        { id: "bicycles", label: "自行车" },
        { id: "e-scooters", label: "电动滑板车" },
        { id: "helmets", label: "头盔" },
        { id: "commute-accessories", label: "通勤配件" },
        { id: "public-transport", label: "公共交通卡 / 票券" },
      ],
    },
    {
      id: "car-accessories",
      label: "汽车用品",
      children: [
        { id: "car-accessories-all", label: "全部" },
        { id: "dashcam", label: "行车记录仪" },
        { id: "car-care", label: "清洁养护" },
        { id: "car-chargers", label: "车充 / 支架" },
        { id: "car-storage", label: "车内收纳" },
        { id: "tyre-tools", label: "轮胎 / 工具" },
      ],
    },
    {
      id: "hobbies",
      label: "兴趣娱乐",
      children: [
        { id: "hobbies-all", label: "全部" },
        { id: "board-games", label: "桌游" },
        { id: "music", label: "乐器 / 音乐" },
        { id: "crafts", label: "手作" },
        { id: "collectibles", label: "收藏品" },
        { id: "streaming-gear", label: "直播设备" },
        { id: "toys", label: "玩具" },
      ],
    },
    {
      id: "travel-outdoor",
      label: "旅行户外",
      children: [
        { id: "travel-outdoor-all", label: "全部" },
        { id: "luggage", label: "行李箱" },
        { id: "backpacks", label: "背包" },
        { id: "camping", label: "露营装备" },
        { id: "travel-gadgets", label: "旅行小物" },
        { id: "hiking", label: "徒步装备" },
        { id: "rain-sun", label: "雨具 / 防晒" },
      ],
    },
    {
      id: "dive-photo",
      label: "潜水 / 摄影装备",
      children: [
        { id: "dive-photo-all", label: "全部" },
        { id: "dive-gear", label: "潜水装备" },
        { id: "snorkeling", label: "浮潜装备" },
        { id: "action-cameras", label: "运动相机" },
        { id: "camera-lenses", label: "镜头" },
        { id: "tripods", label: "脚架 / 稳定器" },
        { id: "waterproof-bags", label: "防水包" },
      ],
    },
    {
      id: "pets",
      label: "宠物用品",
      children: [
        { id: "pets-all", label: "全部" },
        { id: "pet-food", label: "宠物食品" },
        { id: "pet-toys", label: "玩具" },
        { id: "pet-cleaning", label: "清洁护理" },
        { id: "pet-beds", label: "窝垫" },
        { id: "pet-travel", label: "外出用品" },
      ],
    },
    {
      id: "gifts",
      label: "礼物",
      children: [
        { id: "gifts-all", label: "全部" },
        { id: "birthday-gifts", label: "生日礼物" },
        { id: "couple-gifts", label: "情侣礼物" },
        { id: "family-gifts", label: "家人礼物" },
        { id: "corporate-gifts", label: "商务礼物" },
        { id: "handmade-gifts", label: "手作礼物" },
      ],
    },
    {
      id: "luxury",
      label: "奢侈品",
      children: [
        { id: "luxury-all", label: "全部" },
        { id: "designer-bags", label: "设计师包袋" },
        { id: "watches", label: "腕表" },
        { id: "jewelry", label: "珠宝" },
        { id: "luxury-fragrance", label: "高级香水" },
        { id: "luxury-accessories", label: "奢华配饰" },
        { id: "luxury-luggage", label: "高端旅行箱" },
      ],
    },
    {
      id: "software-digital",
      label: "软件 / 订阅 / 数字产品",
      children: [
        { id: "software-digital-all", label: "全部" },
        { id: "productivity-subscriptions", label: "效率订阅" },
        { id: "creative-software", label: "创作软件" },
        { id: "cloud-storage", label: "云存储" },
        { id: "learning-apps", label: "学习 App" },
        { id: "gaming-digital", label: "游戏 / DLC" },
        { id: "security-vpn", label: "安全 / VPN" },
      ],
    },
  ];
}
const SHOPPING_CATEGORY_TREE = typeof window !== "undefined" && Array.isArray(window.SHOPPING_CATEGORY_TREE)
  ? window.SHOPPING_CATEGORY_TREE
  : [];
const SHOPPING_CATEGORY_SOURCE_MAP = {
  all: Object.keys(SHOPPING_DATA),
  electronics: ["电子产品", "手机与配件", "电脑与配件", "数码小物"],
  "computers-accessories": ["电脑与配件", "电子产品", "数码小物"],
  "phones-accessories": ["手机与配件", "电子产品", "数码小物"],
  "daily-essentials": ["生活补给", "清洁收纳", "家居生活"],
  "home-living": ["家居生活", "生活补给", "家里缺的"],
  kitchen: ["厨房用品", "家居生活", "家里缺的"],
  "cleaning-storage": ["清洁收纳", "家居生活", "生活补给", "家里缺的"],
  fashion: ["服饰穿搭", "穿搭"],
  "beauty-care": ["美妆护理", "美妆护肤"],
  "health-sports": ["健康运动", "运动户外"],
  "work-study": ["工作学习", "电脑与配件", "生活补给", "数码小物"],
  transport: ["交通工具", "汽车用品", "运动户外"],
  "car-accessories": ["汽车用品", "交通工具", "电子产品", "数码小物", "生活补给"],
  hobbies: ["兴趣娱乐", "数码小物", "礼物"],
  "travel-outdoor": ["旅行户外", "潜水 / 摄影装备", "运动户外", "奢侈品"],
  "dive-photo": ["潜水 / 摄影装备", "电子产品", "运动户外", "数码小物"],
  pets: ["宠物用品", "家居生活", "生活补给"],
  gifts: ["礼物"],
  luxury: ["奢侈品"],
  "software-digital": ["软件 / 订阅 / 数字产品", "理性提醒", "数码小物"],
};
const SHOPPING_SUBCATEGORY_ALIAS_MAP = {
  "computer-devices": ["笔记本电脑", "台式电脑"],
  cars: ["汽车"],
  "cleaning-supplies": ["清洁工具", "清洁养护", "清洁护理"],
  "daily-paper": ["家居用品"],
  "daily-storage": ["收纳盒 / 架", "家居用品"],
  "daily-laundry": ["洗衣用品"],
};

const DRINK_MENU_DATA = {
  马来西亚: [
    drink("Tealive", "Signature Brown Sugar Pearl Milk Tea", ["奶茶", "高热量", "外卖热门"], "RM8-13/杯"),
    drink("Tealive", "Roasted Milk Tea with Handmade Pearl", ["奶茶", "外卖热门"], "RM8-13/杯"),
    drink("Tealive", "Signature Passion Fruit Green Tea", ["果茶", "纯茶"], "RM7-12/杯"),
    drink("Tealive", "Grapefruit Chia Tea Booster", ["果茶", "健康类"], "RM8-13/杯"),
    drink("Tealive", "Classic Milk Tea", ["奶茶"], "RM7-12/杯"),
    drink("ZUS Coffee", "Spanish Latte", ["咖啡", "外卖热门"], "RM9-15/杯"),
    drink("ZUS Coffee", "CEO Latte", ["咖啡"], "RM9-15/杯"),
    drink("ZUS Coffee", "Vietnamese Spanish Latté Frappé", ["咖啡", "冰沙", "高热量"], "RM12-18/杯"),
    drink("ZUS Coffee", "Americano", ["咖啡", "低糖"], "RM6-12/杯"),
    drink("CHAGEE", "Jasmine Green Milk Tea", ["奶茶", "外卖热门"], "RM10-15/杯"),
    drink("CHAGEE", "Da Hong Pao Milk Tea", ["奶茶"], "RM10-16/杯"),
    drink("CHAGEE", "Peach Oolong Tea", ["果茶", "纯茶"], "RM9-15/杯"),
    drink("CHAGEE", "Oriental Tea Latte", ["奶茶", "低糖"], "RM10-16/杯"),
    drink("Mixue", "Fresh Ice Cream", ["冰淇淋", "嘴馋零嘴类"], "RM2-5/杯"),
    drink("Mixue", "Lemon Jasmine Tea", ["果茶", "低糖", "外卖热门"], "RM4-8/杯"),
    drink("Mixue", "Brown Sugar Pearl Milk Tea", ["奶茶", "高热量"], "RM6-10/杯"),
    drink("Mixue", "Supreme Milk Tea", ["奶茶"], "RM6-10/杯"),
    drink("Mixue", "Mango Sundae", ["冰淇淋", "高热量"], "RM5-9/杯"),
    drink("Gong Cha", "Milk Tea with Pearl", ["奶茶", "外卖热门"], "RM10-15/杯"),
    drink("Gong Cha", "Earl Grey Milk Tea with Coffee Jelly", ["奶茶"], "RM10-16/杯"),
    drink("Gong Cha", "Passion Fruit Green Tea", ["果茶", "纯茶"], "RM9-14/杯"),
    drink("Gong Cha", "Signature Black Coffee", ["咖啡"], "RM9-15/杯"),
    drink("Chatime", "Pearl Milk Tea", ["奶茶", "外卖热门"], "RM9-15/杯"),
    drink("Chatime", "Mango Green Tea", ["果茶", "纯茶"], "RM8-14/杯"),
    drink("Chatime", "Brown Sugar Fresh Milk", ["奶茶", "高热量"], "RM10-16/杯"),
    drink("Starbucks", "Caffè Latte", ["咖啡"], "RM14-22/杯"),
    drink("Starbucks", "Caramel Macchiato", ["咖啡", "高热量"], "RM16-24/杯"),
    drink("Starbucks", "Java Chip Frappuccino", ["咖啡", "冰沙", "高热量"], "RM18-26/杯"),
    drink("Starbucks", "Cold Brew", ["咖啡", "低糖"], "RM14-22/杯"),
    drink("Coffee Bean", "The Original Mocha Ice Blended", ["咖啡", "冰沙", "高热量"], "RM17-25/杯"),
    drink("Coffee Bean", "Vanilla Latte", ["咖啡"], "RM15-23/杯"),
    drink("Coffee Bean", "Matcha Green Tea Latte", ["奶茶", "高热量"], "RM16-24/杯"),
    drink("Boost Juice", "Mango Magic", ["果茶", "冰沙"], "RM12-20/杯"),
    drink("Boost Juice", "All Berry Bang", ["果茶", "健康类"], "RM12-20/杯"),
    drink("Gigi Coffee", "Buttercream Latte", ["咖啡", "高热量"], "RM9-16/杯"),
    drink("Bask Bear", "Aren Latte", ["咖啡"], "RM9-16/杯"),
  ],
  中国: [
    drink("瑞幸咖啡", "生椰拿铁", ["咖啡", "外卖热门"], "RM8-18/杯"),
    drink("瑞幸咖啡", "丝绒拿铁", ["咖啡"], "RM8-18/杯"),
    drink("瑞幸咖啡", "陨石拿铁", ["咖啡", "高热量"], "RM10-20/杯"),
    drink("库迪咖啡", "厚乳拿铁", ["咖啡"], "RM7-16/杯"),
    drink("蜜雪冰城", "冰鲜柠檬水", ["果茶", "低糖", "外卖热门"], "RM2-6/杯"),
    drink("蜜雪冰城", "珍珠奶茶", ["奶茶"], "RM4-9/杯"),
    drink("蜜雪冰城", "雪王大圣代", ["冰淇淋", "高热量"], "RM4-9/杯"),
    drink("喜茶", "多肉葡萄", ["果茶", "高热量", "外卖热门"], "RM12-28/杯"),
    drink("喜茶", "芝芝莓莓", ["果茶", "高热量"], "RM12-28/杯"),
    drink("喜茶", "酷黑莓桑", ["果茶"], "RM12-28/杯"),
    drink("奈雪的茶", "霸气橙子", ["果茶", "健康类"], "RM12-28/杯"),
    drink("奈雪的茶", "霸气芝士草莓", ["果茶", "高热量"], "RM14-30/杯"),
    drink("霸王茶姬", "伯牙绝弦", ["奶茶", "外卖热门"], "RM10-22/杯"),
    drink("霸王茶姬", "万里木兰", ["奶茶"], "RM10-22/杯"),
    drink("茶百道", "杨枝甘露", ["果茶", "高热量"], "RM10-22/杯"),
    drink("沪上阿姨", "血糯米奶茶", ["奶茶", "高热量"], "RM8-18/杯"),
    drink("一点点", "波霸奶茶", ["奶茶"], "RM8-18/杯"),
    drink("CoCo 都可", "百香双响炮", ["果茶", "外卖热门"], "RM8-18/杯"),
  ],
  日本: [
    drink("Starbucks Japan", "Matcha Tea Latte", ["奶茶", "外卖热门"], "RM18-30/杯"),
    drink("Starbucks Japan", "Coffee Frappuccino", ["咖啡", "冰沙", "高热量"], "RM20-34/杯"),
    drink("Tully's Coffee", "Honey Milk Latte", ["咖啡"], "RM16-28/杯"),
    drink("Doutor", "Iced Coffee", ["咖啡", "低糖"], "RM10-20/杯"),
    drink("Doutor", "Royal Milk Tea", ["奶茶"], "RM12-22/杯"),
    drink("Gong Cha Japan", "Black Milk Tea + Pearl", ["奶茶", "外卖热门"], "RM16-28/杯"),
    drink("Gong Cha Japan", "Matcha Milk Tea", ["奶茶"], "RM16-30/杯"),
    drink("The Alley Japan", "Brown Sugar Deerioca Milk", ["奶茶", "高热量"], "RM18-34/杯"),
    drink("Mister Donut", "Iced Café au Lait", ["咖啡"], "RM10-20/杯"),
    drink("FamilyMart Japan", "Frappe", ["冰沙", "高热量"], "RM9-18/杯"),
  ],
  韩国: [
    drink("Compose Coffee", "Iced Americano", ["咖啡", "低糖", "外卖热门"], "RM6-14/杯"),
    drink("Mega Coffee", "Mega Iced Americano", ["咖啡", "低糖"], "RM6-14/杯"),
    drink("Mega Coffee", "Strawberry Latte", ["果茶", "高热量"], "RM10-22/杯"),
    drink("Paik's Coffee", "Iced Latte", ["咖啡"], "RM8-18/杯"),
    drink("A Twosome Place", "Royal Milk Tea", ["奶茶"], "RM14-26/杯"),
    drink("Ediya Coffee", "Toffee Nut Latte", ["咖啡", "高热量"], "RM12-24/杯"),
    drink("Gong Cha Korea", "Milk Tea with Pearl", ["奶茶", "外卖热门"], "RM14-26/杯"),
    drink("Tiger Sugar Korea", "Brown Sugar Boba Milk", ["奶茶", "高热量"], "RM16-30/杯"),
    drink("Sulbing", "Mango Smoothie", ["冰沙", "果茶"], "RM18-32/杯"),
    drink("Hollys Coffee", "Vanilla Delight", ["咖啡", "高热量"], "RM14-26/杯"),
  ],
  泰国: [
    drink("Amazon Café", "Iced Amazon Coffee", ["咖啡", "外卖热门"], "RM6-14/杯"),
    drink("Amazon Café", "Thai Tea Frappe", ["奶茶", "冰沙", "高热量"], "RM8-18/杯"),
    drink("ChaTraMue", "Thai Milk Tea", ["奶茶", "外卖热门"], "RM6-14/杯"),
    drink("ChaTraMue", "Thai Green Tea", ["奶茶"], "RM6-14/杯"),
    drink("Inthanin", "Iced Latte", ["咖啡"], "RM7-16/杯"),
    drink("Kamu Tea", "Brown Sugar Fresh Milk", ["奶茶", "高热量"], "RM10-22/杯"),
    drink("KOI Thé Thailand", "Golden Bubble Milk Tea", ["奶茶"], "RM12-24/杯"),
    drink("Starbucks Thailand", "Green Tea Cream Frappuccino", ["冰沙", "高热量"], "RM18-30/杯"),
    drink("After You", "Thai Tea Kakigori Drink", ["冰沙", "高热量"], "RM16-30/杯"),
    drink("Mixue Thailand", "Lemon Tea", ["果茶", "低糖"], "RM4-10/杯"),
  ],
  台湾: [
    drink("50嵐", "珍珠奶茶", ["奶茶", "外卖热门"], "RM8-16/杯"),
    drink("50嵐", "四季春青茶", ["纯茶", "低糖"], "RM6-12/杯"),
    drink("迷客夏", "珍珠紅茶拿鐵", ["奶茶"], "RM10-20/杯"),
    drink("迷客夏", "青檸香茶", ["果茶"], "RM8-16/杯"),
    drink("清心福全", "烏龍綠茶", ["纯茶", "低糖"], "RM6-12/杯"),
    drink("CoCo 都可", "百香雙響炮", ["果茶", "外卖热门"], "RM8-16/杯"),
    drink("龜記", "紅柚翡翠", ["果茶"], "RM10-20/杯"),
    drink("春水堂", "珍珠奶茶", ["奶茶", "高热量"], "RM14-28/杯"),
    drink("星巴克台灣", "那堤", ["咖啡"], "RM14-26/杯"),
    drink("Louisa Coffee", "黑糖雪點奶茶", ["奶茶", "高热量"], "RM10-20/杯"),
  ],
  新加坡: [
    drink("LiHO Tea", "Brown Sugar Pearl Fresh Milk", ["奶茶", "高热量", "外卖热门"], "RM16-28/杯"),
    drink("LiHO Tea", "Da Hong Pao Milk Tea", ["奶茶"], "RM14-26/杯"),
    drink("KOI Thé Singapore", "Golden Bubble Milk Tea", ["奶茶", "外卖热门"], "RM16-30/杯"),
    drink("KOI Thé Singapore", "Yakult Green Tea", ["果茶", "低糖"], "RM14-26/杯"),
    drink("Gong Cha Singapore", "Earl Grey Milk Tea with 3Js", ["奶茶"], "RM16-30/杯"),
    drink("CHICHA San Chen", "Dong Ding Oolong Fresh Milk Tea", ["奶茶"], "RM16-32/杯"),
    drink("PlayMade", "Taiwan Milk Tea with Pink Cactus Pearl", ["奶茶"], "RM16-30/杯"),
    drink("Starbucks Singapore", "Vanilla Sweet Cream Cold Brew", ["咖啡"], "RM18-32/杯"),
    drink("Coffee Bean Singapore", "The Original Ice Blended", ["咖啡", "冰沙"], "RM18-32/杯"),
    drink("Boost Juice Singapore", "Mango Magic", ["果茶", "冰沙", "健康类"], "RM16-30/杯"),
  ],
  越南: [
    drink("Highlands Coffee", "Phin Sữa Đá", ["咖啡", "外卖热门"], "RM6-14/杯"),
    drink("Highlands Coffee", "Freeze Green Tea", ["冰沙", "高热量"], "RM8-18/杯"),
    drink("Phúc Long", "Milk Tea", ["奶茶"], "RM7-16/杯"),
    drink("Phúc Long", "Peach Tea", ["果茶", "纯茶"], "RM7-16/杯"),
    drink("The Coffee House", "Iced Latte", ["咖啡"], "RM7-16/杯"),
    drink("Trung Nguyên E-Coffee", "Vietnamese Iced Coffee", ["咖啡"], "RM6-14/杯"),
    drink("KOI Thé Vietnam", "Golden Bubble Milk Tea", ["奶茶"], "RM12-24/杯"),
    drink("Gong Cha Vietnam", "Milk Tea with Pearl", ["奶茶", "外卖热门"], "RM10-22/杯"),
    drink("TocoToco", "Tiger Sugar Milk Tea", ["奶茶", "高热量"], "RM8-18/杯"),
    drink("Mixue Vietnam", "Lemon Jasmine Tea", ["果茶", "低糖"], "RM4-10/杯"),
  ],
  印尼: [
    drink("Kopi Kenangan", "Kopi Kenangan Mantan", ["咖啡", "外卖热门"], "RM6-14/杯"),
    drink("Fore Coffee", "Butterscotch Sea Salt Latte", ["咖啡", "高热量"], "RM8-18/杯"),
    drink("Janji Jiwa", "Es Kopi Susu", ["咖啡"], "RM6-14/杯"),
    drink("Chatime Indonesia", "Pearl Milk Tea", ["奶茶"], "RM8-18/杯"),
    drink("Gulu Gulu", "Brown Slurppy Bobba", ["奶茶", "高热量"], "RM8-18/杯"),
    drink("Haus!", "Thai Tea", ["奶茶", "外卖热门"], "RM4-10/杯"),
    drink("Mixue Indonesia", "Ice Cream Tea", ["冰淇淋", "果茶"], "RM3-9/杯"),
    drink("Starbucks Indonesia", "Caramel Frappuccino", ["咖啡", "冰沙", "高热量"], "RM18-32/杯"),
    drink("J.CO", "Iced Jcoccino", ["咖啡"], "RM8-18/杯"),
    drink("Dum Dum Thai Drinks", "Thai Tea", ["奶茶"], "RM6-14/杯"),
  ],
  意大利: [
    drink("Starbucks Reserve Milan", "Caffè Latte", ["咖啡"], "RM22-42/杯"),
    drink("Starbucks Reserve Milan", "Cold Brew", ["咖啡", "低糖"], "RM22-42/杯"),
    drink("illy Caffè", "Espresso", ["咖啡", "低糖"], "RM8-18/杯"),
    drink("illy Caffè", "Cappuccino", ["咖啡"], "RM10-24/杯"),
    drink("Lavazza", "Caffè Crema", ["咖啡"], "RM10-22/杯"),
    drink("Caffè Napoli", "Iced Coffee Cream", ["咖啡", "高热量"], "RM12-26/杯"),
    drink("Venchi", "Cioccolata Fredda", ["冰沙", "高热量"], "RM18-38/杯"),
    drink("Grom", "Gelato Shake", ["冰淇淋", "高热量"], "RM18-38/杯"),
    drink("Bubble Tea Italia", "Classic Pearl Milk Tea", ["奶茶"], "RM18-35/杯"),
    drink("Machikō", "Matcha Latte", ["奶茶"], "RM18-35/杯"),
  ],
};

const FOOD_DATA = {
  马来西亚: {
    吉隆坡: [
      dish("椰浆饭", ["快餐", "高热量"], "RM8-18/人"),
      dish("肉骨茶", ["健康类"], "RM18-35/人"),
      dish("咖喱叻沙", ["高热量"], "RM12-24/人"),
      dish("印度煎饼", ["快餐", "嘴馋零嘴类"], "RM3-10/人"),
      dish("炸鸡饭", ["油炸类", "快餐", "高热量"], "RM10-22/人"),
      dish("素食杂饭", ["素食类", "健康类"], "RM8-16/人"),
      dish("沙爹", ["嘴馋零嘴类", "高热量"], "RM12-28/人"),
      dish("鸡丝河粉", ["低卡类", "健康类"], "RM9-18/人"),
      dish("香蕉叶饭", ["素食类", "高热量"], "RM12-28/人"),
      dish("水果罗惹", ["嘴馋零嘴类", "素食类"], "RM6-12/人"),
    ],
    槟城: [
      dish("槟城炒粿条", ["高热量"], "RM8-16/人"),
      dish("亚参叻沙", ["低卡类"], "RM7-15/人"),
      dish("蚝煎", ["油炸类", "嘴馋零嘴类"], "RM10-22/人"),
      dish("煎蕊", ["嘴馋零嘴类", "高热量"], "RM4-9/人"),
      dish("卤肉", ["油炸类", "高热量"], "RM10-24/人"),
      dish("白咖喱面", ["高热量"], "RM9-18/人"),
      dish("经济素菜饭", ["素食类", "健康类"], "RM7-15/人"),
      dish("清汤粿条汤", ["低卡类", "健康类"], "RM7-14/人"),
    ],
    柔佛: [
      dish("Laksa Johor", ["高热量"], "RM10-22/人"),
      dish("Mee Rebus", ["快餐", "高热量"], "RM7-15/人"),
      dish("Kacang Pool", ["高热量"], "RM9-18/人"),
      dish("乌达", ["嘴馋零嘴类"], "RM6-15/人"),
      dish("炸香蕉", ["油炸类", "嘴馋零嘴类"], "RM3-8/人"),
      dish("柔佛素炒面", ["素食类", "快餐"], "RM7-14/人"),
      dish("Soto Ayam", ["健康类"], "RM8-16/人"),
    ],
    沙巴: [
      dish("生肉面", ["健康类"], "RM9-18/人"),
      dish("Tuaran Mee", ["快餐"], "RM9-18/人"),
      dish("Hinava", ["低卡类", "健康类"], "RM16-32/人"),
      dish("沙巴海鲜", ["健康类"], "RM35-90/人"),
      dish("牛杂汤", ["健康类"], "RM10-22/人"),
      dish("炸鱼片粉", ["油炸类", "快餐"], "RM10-20/人"),
      dish("椰子布丁", ["嘴馋零嘴类"], "RM8-18/人"),
    ],
    砂拉越: [
      dish("砂拉越叻沙", ["高热量"], "RM8-18/人"),
      dish("哥罗面", ["快餐"], "RM6-14/人"),
      dish("Manok Pansoh", ["健康类"], "RM18-38/人"),
      dish("米林炒面", ["快餐", "高热量"], "RM7-16/人"),
      dish("炸蕨菜饼", ["油炸类", "嘴馋零嘴类"], "RM6-14/人"),
      dish("清炒米甸", ["素食类", "低卡类", "健康类"], "RM10-20/人"),
      dish("三色奶茶", ["嘴馋零嘴类", "高热量"], "RM5-12/人"),
    ],
    "全国 Mamak": [
      dish("Roti Canai", ["快餐", "素食类"], "RM2-4/人"),
      dish("Roti Telur", ["快餐", "高热量"], "RM3-6/人"),
      dish("Roti Tisu", ["嘴馋零嘴类", "高热量"], "RM5-9/人"),
      dish("Murtabak Ayam", ["高热量"], "RM9-18/人"),
      dish("Thosai", ["素食类", "低卡类", "健康类"], "RM3-7/人"),
      dish("Chapati + Dhal", ["素食类", "低卡类", "健康类"], "RM3-7/人"),
      dish("Nasi Kandar Ayam Goreng", ["油炸类", "高热量"], "RM12-28/人"),
      dish("Nasi Briyani Ayam", ["高热量"], "RM12-25/人"),
      dish("Nasi Lemak Telur", ["快餐", "高热量"], "RM5-10/人"),
      dish("Mee Goreng Mamak", ["快餐", "高热量"], "RM7-12/人"),
      dish("Maggi Goreng Telur", ["快餐", "高热量"], "RM6-11/人"),
      dish("Nasi Goreng Kampung", ["快餐", "高热量"], "RM8-14/人"),
      dish("Ayam Goreng Mamak", ["油炸类", "高热量"], "RM7-14/人"),
      dish("Roti John", ["快餐", "高热量"], "RM7-14/人"),
      dish("Teh Tarik", ["嘴馋零嘴类", "高热量"], "RM2-5/人"),
      dish("Milo Ais", ["嘴馋零嘴类", "高热量"], "RM3-6/人"),
    ],
    快餐连锁: [
      dish("McD · Big Mac", ["快餐", "高热量"], "RM14-24/人"),
      dish("McD · Ayam Goreng McD", ["快餐", "油炸类", "高热量"], "RM13-26/人"),
      dish("McD · Spicy Chicken McDeluxe", ["快餐", "油炸类", "高热量"], "RM15-27/人"),
      dish("McD · Chicken McNuggets", ["快餐", "油炸类"], "RM10-22/人"),
      dish("McD · French Fries", ["快餐", "油炸类", "嘴馋零嘴类"], "RM5-12/人"),
      dish("KFC · Zinger Burger", ["快餐", "油炸类", "高热量"], "RM14-26/人"),
      dish("KFC · Snack Plate", ["快餐", "油炸类", "高热量"], "RM18-30/人"),
      dish("KFC · Dinner Plate", ["快餐", "油炸类", "高热量"], "RM23-38/人"),
      dish("KFC · Cheezy Wedges", ["快餐", "嘴馋零嘴类", "高热量"], "RM7-14/人"),
      dish("Burger King · Whopper", ["快餐", "高热量"], "RM17-32/人"),
      dish("Burger King · Chicken Royale", ["快餐", "油炸类", "高热量"], "RM15-30/人"),
      dish("Burger King · Onion Rings", ["快餐", "油炸类", "嘴馋零嘴类"], "RM7-14/人"),
      dish("Pizza Hut · Personal Pizza", ["快餐", "高热量"], "RM12-25/人"),
      dish("Pizza Hut · Pasta", ["快餐", "高热量"], "RM15-28/人"),
      dish("Pizza Hut · Chicken Wings", ["快餐", "油炸类", "高热量"], "RM10-22/人"),
      dish("Subway · Turkey Sandwich", ["快餐", "低卡类", "健康类"], "RM13-24/人"),
      dish("Subway · Veggie Delite", ["快餐", "素食类", "低卡类", "健康类"], "RM10-20/人"),
    ],
    外卖平台热门: [
      dish("Village Park 风格 · Nasi Lemak Ayam Goreng", ["快餐", "油炸类", "高热量"], "RM15-30/人"),
      dish("Texas Chicken · 2pc Chicken Combo", ["快餐", "油炸类", "高热量"], "RM18-32/人"),
      dish("Domino's · Personal Pizza", ["快餐", "高热量"], "RM12-25/人"),
      dish("Secret Recipe · Chicken Chop", ["高热量"], "RM22-45/人"),
      dish("Nando's · Peri-Peri Chicken", ["健康类"], "RM25-55/人"),
      dish("Sushi King · Salmon Bento", ["快餐", "健康类"], "RM22-45/人"),
      dish("FamilyMart · Oden Set", ["快餐", "低卡类"], "RM8-18/人"),
      dish("Tealive · Signature Milk Tea", ["嘴馋零嘴类", "高热量"], "RM7-15/人"),
      dish("ZUS Coffee · Latte", ["嘴馋零嘴类"], "RM8-16/人"),
      dish("Korean Fried Chicken · Soy Garlic Wings", ["油炸类", "高热量"], "RM20-45/人"),
      dish("Salad Atelier 风格 · Chicken Salad Bowl", ["低卡类", "健康类"], "RM18-36/人"),
      dish("素食餐厅 · Lei Cha Rice", ["素食类", "健康类"], "RM12-25/人"),
    ],
  },
  中国: {
    四川: [
      dish("麻婆豆腐", ["素食类", "高热量"], "RM18-35/人"),
      dish("担担面", ["快餐", "高热量"], "RM12-24/人"),
      dish("火锅", ["高热量"], "RM45-120/人"),
      dish("口水鸡", ["低卡类"], "RM20-40/人"),
      dish("回锅肉", ["高热量"], "RM22-45/人"),
      dish("钵钵鸡", ["嘴馋零嘴类"], "RM18-38/人"),
      dish("凉拌木耳", ["素食类", "低卡类", "健康类"], "RM10-20/人"),
      dish("炸酥肉", ["油炸类", "高热量"], "RM18-36/人"),
    ],
    广东: [
      dish("早茶点心", ["嘴馋零嘴类"], "RM25-60/人"),
      dish("烧腊饭", ["快餐", "高热量"], "RM10-22/人"),
      dish("云吞面", ["快餐"], "RM9-18/人"),
      dish("艇仔粥", ["低卡类", "健康类"], "RM8-18/人"),
      dish("煲仔饭", ["高热量"], "RM16-35/人"),
      dish("肠粉", ["快餐", "低卡类"], "RM6-14/人"),
      dish("素斋煲", ["素食类", "健康类"], "RM18-38/人"),
      dish("炸两", ["油炸类", "高热量"], "RM8-16/人"),
    ],
    上海: [
      dish("小笼包", ["嘴馋零嘴类"], "RM14-28/人"),
      dish("生煎包", ["油炸类", "高热量"], "RM12-24/人"),
      dish("葱油拌面", ["快餐", "素食类"], "RM9-18/人"),
      dish("红烧肉", ["高热量"], "RM28-55/人"),
      dish("排骨年糕", ["油炸类", "高热量"], "RM18-36/人"),
      dish("上海素鸭", ["素食类"], "RM16-32/人"),
      dish("鸡汤馄饨", ["健康类"], "RM12-24/人"),
    ],
    北京: [
      dish("北京烤鸭", ["高热量"], "RM55-140/人"),
      dish("炸酱面", ["快餐"], "RM12-24/人"),
      dish("豆汁焦圈", ["油炸类", "嘴馋零嘴类"], "RM8-18/人"),
      dish("涮羊肉", ["健康类"], "RM45-100/人"),
      dish("卤煮", ["高热量"], "RM16-35/人"),
      dish("拍黄瓜", ["素食类", "低卡类", "健康类"], "RM8-15/人"),
      dish("驴打滚", ["嘴馋零嘴类"], "RM6-14/人"),
    ],
    云南: [
      dish("过桥米线", ["健康类"], "RM14-28/人"),
      dish("汽锅鸡", ["低卡类", "健康类"], "RM24-55/人"),
      dish("鲜花饼", ["嘴馋零嘴类"], "RM5-12/人"),
      dish("菌子火锅", ["素食类", "健康类"], "RM45-100/人"),
      dish("大理乳扇", ["嘴馋零嘴类"], "RM6-16/人"),
      dish("炸洋芋", ["油炸类", "高热量"], "RM6-14/人"),
    ],
  },
  日本: {
    东京: [
      dish("寿司", ["低卡类", "健康类"], "RM35-120/人"),
      dish("拉面", ["快餐", "高热量"], "RM22-45/人"),
      dish("天妇罗", ["油炸类", "高热量"], "RM28-70/人"),
      dish("亲子丼", ["快餐"], "RM18-36/人"),
      dish("荞麦面", ["低卡类", "健康类"], "RM18-35/人"),
      dish("文字烧", ["嘴馋零嘴类"], "RM25-55/人"),
      dish("便利店沙拉鸡", ["低卡类", "健康类", "快餐"], "RM10-18/人"),
    ],
    大阪: [
      dish("章鱼烧", ["嘴馋零嘴类"], "RM12-24/人"),
      dish("大阪烧", ["高热量"], "RM22-45/人"),
      dish("串炸", ["油炸类", "高热量"], "RM25-60/人"),
      dish("蛋包饭", ["快餐", "高热量"], "RM18-36/人"),
      dish("乌冬面", ["快餐"], "RM16-32/人"),
      dish("豆腐蔬菜锅", ["素食类", "健康类"], "RM28-55/人"),
      dish("抹茶团子", ["嘴馋零嘴类"], "RM8-18/人"),
    ],
    北海道: [
      dish("味噌拉面", ["高热量"], "RM24-48/人"),
      dish("海鲜丼", ["健康类"], "RM45-120/人"),
      dish("成吉思汗烤肉", ["高热量"], "RM40-90/人"),
      dish("汤咖喱", ["健康类"], "RM28-60/人"),
      dish("炸可乐饼", ["油炸类", "嘴馋零嘴类"], "RM8-18/人"),
      dish("牛奶冰淇淋", ["嘴馋零嘴类", "高热量"], "RM8-18/人"),
    ],
    冲绳: [
      dish("冲绳荞麦面", ["快餐"], "RM18-36/人"),
      dish("苦瓜炒蛋", ["低卡类", "健康类"], "RM18-35/人"),
      dish("海葡萄", ["低卡类", "健康类"], "RM16-32/人"),
      dish("塔可饭", ["快餐", "高热量"], "RM18-38/人"),
      dish("红芋甜点", ["嘴馋零嘴类"], "RM8-18/人"),
      dish("炸猪排饭", ["油炸类", "高热量"], "RM24-48/人"),
    ],
  },
  韩国: {
    首尔: [
      dish("韩式烤肉", ["高热量"], "RM45-120/人"),
      dish("部队锅", ["高热量"], "RM30-70/人"),
      dish("炸鸡", ["油炸类", "高热量"], "RM28-60/人"),
      dish("冷面", ["低卡类"], "RM18-35/人"),
      dish("紫菜包饭", ["快餐", "健康类"], "RM10-22/人"),
      dish("参鸡汤", ["健康类"], "RM35-70/人"),
      dish("拌饭", ["素食类", "健康类"], "RM18-36/人"),
      dish("鱼饼串", ["嘴馋零嘴类"], "RM6-14/人"),
    ],
    釜山: [
      dish("猪肉汤饭", ["健康类"], "RM18-38/人"),
      dish("鱼饼汤", ["嘴馋零嘴类"], "RM8-18/人"),
      dish("海鲜煎饼", ["油炸类", "高热量"], "RM22-48/人"),
      dish("麦面", ["低卡类"], "RM16-32/人"),
      dish("辣炒章鱼", ["健康类"], "RM28-65/人"),
      dish("豆腐锅", ["素食类", "健康类"], "RM18-36/人"),
    ],
    济州: [
      dish("黑猪肉", ["高热量"], "RM50-130/人"),
      dish("鲍鱼粥", ["低卡类", "健康类"], "RM28-65/人"),
      dish("海鲜锅", ["健康类"], "RM45-110/人"),
      dish("橘子甜点", ["嘴馋零嘴类"], "RM8-20/人"),
      dish("银带鱼汤", ["低卡类", "健康类"], "RM35-80/人"),
      dish("炸海鲜拼盘", ["油炸类", "高热量"], "RM32-75/人"),
    ],
  },
  泰国: {
    曼谷: [
      dish("冬阴功", ["低卡类", "健康类"], "RM16-35/人"),
      dish("打抛猪饭", ["快餐"], "RM10-22/人"),
      dish("船面", ["快餐"], "RM8-18/人"),
      dish("芒果糯米饭", ["嘴馋零嘴类", "高热量"], "RM8-18/人"),
      dish("泰式炒河粉", ["快餐", "高热量"], "RM10-24/人"),
      dish("炸春卷", ["油炸类", "嘴馋零嘴类"], "RM7-16/人"),
      dish("青木瓜沙拉", ["素食类", "低卡类", "健康类"], "RM8-18/人"),
    ],
    清迈: [
      dish("咖喱面", ["高热量"], "RM10-22/人"),
      dish("泰北香肠", ["嘴馋零嘴类"], "RM12-28/人"),
      dish("青木瓜沙拉", ["素食类", "低卡类", "健康类"], "RM8-18/人"),
      dish("烤猪颈肉", ["高热量"], "RM18-42/人"),
      dish("椰子鸡汤", ["低卡类", "健康类"], "RM16-35/人"),
      dish("炸昆虫小吃", ["油炸类", "嘴馋零嘴类"], "RM8-18/人"),
    ],
    普吉: [
      dish("福建面", ["快餐"], "RM12-26/人"),
      dish("海鲜烧烤", ["健康类"], "RM40-110/人"),
      dish("Massaman 咖喱", ["高热量"], "RM18-42/人"),
      dish("泰式煎饼", ["油炸类", "嘴馋零嘴类"], "RM6-15/人"),
      dish("虾酱炒饭", ["快餐", "高热量"], "RM12-28/人"),
      dish("热带水果碗", ["低卡类", "素食类", "健康类"], "RM10-22/人"),
    ],
  },
  台湾: {
    台北: [
      dish("牛肉面", ["高热量"], "RM18-38/人"),
      dish("卤肉饭", ["快餐", "高热量"], "RM8-18/人"),
      dish("盐酥鸡", ["油炸类", "嘴馋零嘴类", "高热量"], "RM8-20/人"),
      dish("豆花", ["嘴馋零嘴类", "素食类"], "RM5-12/人"),
      dish("蚵仔煎", ["油炸类"], "RM10-22/人"),
      dish("珍珠奶茶", ["嘴馋零嘴类", "高热量"], "RM6-16/人"),
      dish("蔬食便当", ["素食类", "健康类"], "RM12-24/人"),
      dish("鸡胸健康餐", ["低卡类", "健康类"], "RM16-32/人"),
    ],
    台南: [
      dish("担仔面", ["快餐"], "RM8-18/人"),
      dish("牛肉汤", ["低卡类", "健康类"], "RM16-35/人"),
      dish("虱目鱼粥", ["低卡类", "健康类"], "RM12-28/人"),
      dish("棺材板", ["油炸类", "高热量"], "RM8-18/人"),
      dish("碗粿", ["快餐"], "RM6-14/人"),
      dish("炸甜不辣", ["油炸类", "嘴馋零嘴类"], "RM6-16/人"),
      dish("素食米糕", ["素食类"], "RM8-18/人"),
    ],
    台中: [
      dish("太阳饼", ["嘴馋零嘴类"], "RM5-15/人"),
      dish("大面羹", ["快餐"], "RM6-14/人"),
      dish("东泉辣椒酱炒面", ["快餐", "高热量"], "RM8-18/人"),
      dish("珍珠奶茶", ["嘴馋零嘴类", "高热量"], "RM6-16/人"),
      dish("肉圆", ["高热量"], "RM7-16/人"),
      dish("炸鸡排", ["油炸类", "高热量"], "RM10-22/人"),
      dish("蔬菜汤面", ["素食类", "低卡类", "健康类"], "RM10-20/人"),
    ],
    花莲: [
      dish("扁食", ["快餐"], "RM8-18/人"),
      dish("炸蛋葱油饼", ["油炸类", "高热量"], "RM6-14/人"),
      dish("麻糬", ["嘴馋零嘴类"], "RM5-12/人"),
      dish("曼波鱼料理", ["低卡类", "健康类"], "RM25-55/人"),
      dish("原住民风味餐", ["健康类"], "RM30-70/人"),
      dish("野菜拼盘", ["素食类", "低卡类", "健康类"], "RM16-32/人"),
    ],
  },
  新加坡: {
    中区: [
      dish("海南鸡饭", ["快餐"], "RM18-35/人"),
      dish("辣椒螃蟹", ["高热量"], "RM90-220/人"),
      dish("叻沙", ["高热量"], "RM20-42/人"),
      dish("肉骨茶", ["健康类"], "RM22-48/人"),
      dish("咖椰吐司", ["嘴馋零嘴类"], "RM8-18/人"),
      dish("素食云吞面", ["素食类", "快餐"], "RM16-32/人"),
      dish("水果沙拉碗", ["低卡类", "健康类"], "RM18-35/人"),
    ],
    东部: [
      dish("加东叻沙", ["高热量"], "RM20-42/人"),
      dish("沙爹", ["嘴馋零嘴类", "高热量"], "RM18-42/人"),
      dish("福建虾面", ["快餐"], "RM18-38/人"),
      dish("娘惹糕", ["嘴馋零嘴类"], "RM8-18/人"),
      dish("椰浆饭", ["快餐", "高热量"], "RM16-32/人"),
      dish("炸五香", ["油炸类", "高热量"], "RM16-35/人"),
    ],
    西部: [
      dish("炒粿条", ["高热量"], "RM16-32/人"),
      dish("鱼头炉", ["健康类"], "RM40-95/人"),
      dish("印度煎饼", ["快餐", "嘴馋零嘴类"], "RM6-15/人"),
      dish("咖喱鱼头", ["高热量"], "RM45-110/人"),
      dish("罗惹", ["素食类", "嘴馋零嘴类"], "RM10-22/人"),
      dish("清汤鱼片米粉", ["低卡类", "健康类"], "RM18-36/人"),
    ],
  },
  越南: {
    河内: [
      dish("牛肉河粉", ["低卡类", "健康类", "快餐"], "RM8-18/人"),
      dish("炸春卷", ["油炸类", "嘴馋零嘴类"], "RM6-15/人"),
      dish("越式法包", ["快餐"], "RM6-14/人"),
      dish("鸡肉米线沙拉", ["低卡类", "健康类"], "RM8-18/人"),
      dish("椰奶甜品", ["嘴馋零嘴类"], "RM5-12/人"),
    ],
    胡志明市: [
      dish("越南碎米饭", ["快餐"], "RM8-18/人"),
      dish("甘蔗虾", ["油炸类", "高热量"], "RM12-26/人"),
      dish("素食河粉", ["素食类", "低卡类", "健康类"], "RM8-18/人"),
      dish("咖啡炼奶冰", ["嘴馋零嘴类", "高热量"], "RM5-12/人"),
      dish("越式火锅", ["健康类"], "RM28-70/人"),
    ],
    岘港: [
      dish("广南面", ["快餐"], "RM8-18/人"),
      dish("海鲜米粉", ["健康类"], "RM18-45/人"),
      dish("炸海鲜饼", ["油炸类", "高热量"], "RM10-24/人"),
      dish("热带水果盘", ["低卡类", "素食类", "健康类"], "RM6-16/人"),
      dish("椰子冻", ["嘴馋零嘴类"], "RM6-14/人"),
    ],
  },
  印尼: {
    雅加达: [
      dish("印尼炒饭", ["快餐", "高热量"], "RM8-18/人"),
      dish("沙爹饭", ["嘴馋零嘴类"], "RM12-26/人"),
      dish("炸鸡 Ayam Goreng", ["油炸类", "高热量"], "RM12-24/人"),
      dish("加多加多", ["素食类", "健康类"], "RM8-18/人"),
      dish("Soto Betawi", ["健康类"], "RM12-28/人"),
    ],
    巴厘岛: [
      dish("烤猪饭", ["高热量"], "RM16-36/人"),
      dish("Nasi Campur", ["快餐"], "RM10-24/人"),
      dish("素食能量碗", ["素食类", "低卡类", "健康类"], "RM18-38/人"),
      dish("炸香蕉", ["油炸类", "嘴馋零嘴类"], "RM5-12/人"),
      dish("海鲜烧烤", ["健康类"], "RM35-90/人"),
    ],
  },
  意大利: {
    罗马: [
      dish("Carbonara 意面", ["高热量"], "RM35-80/人"),
      dish("Supplì 炸饭团", ["油炸类", "嘴馋零嘴类"], "RM10-22/人"),
      dish("玛格丽特披萨", ["快餐", "高热量", "素食类"], "RM28-65/人"),
      dish("烤蔬菜拼盘", ["素食类", "低卡类", "健康类"], "RM25-55/人"),
      dish("Gelato", ["嘴馋零嘴类"], "RM10-24/人"),
    ],
    米兰: [
      dish("米兰烩饭", ["高热量"], "RM35-80/人"),
      dish("Panini", ["快餐"], "RM18-42/人"),
      dish("炸牛排 Cotoletta", ["油炸类", "高热量"], "RM55-130/人"),
      dish("番茄罗勒沙拉", ["素食类", "低卡类", "健康类"], "RM25-55/人"),
      dish("提拉米苏", ["嘴馋零嘴类", "高热量"], "RM18-40/人"),
    ],
  },
};

const MAMAK_MENU = FOOD_DATA.马来西亚["全国 Mamak"];

const FAST_FOOD_MENU_DATA = {
  马来西亚: FOOD_DATA.马来西亚.快餐连锁,
  中国: [
    dish("麦当劳 · 巨无霸", ["快餐", "高热量"], "RM14-25/人"),
    dish("麦当劳 · 麦辣鸡腿汉堡", ["快餐", "油炸类", "高热量"], "RM13-24/人"),
    dish("麦当劳 · 麦乐鸡", ["快餐", "油炸类"], "RM10-22/人"),
    dish("麦当劳 · 麦辣鸡翅", ["快餐", "油炸类", "嘴馋零嘴类"], "RM9-20/人"),
    dish("肯德基 · 香辣鸡腿堡", ["快餐", "油炸类", "高热量"], "RM14-26/人"),
    dish("肯德基 · 老北京鸡肉卷", ["快餐", "油炸类", "高热量"], "RM13-25/人"),
    dish("肯德基 · 吮指原味鸡", ["快餐", "油炸类", "高热量"], "RM12-26/人"),
    dish("肯德基 · 葡式蛋挞", ["嘴馋零嘴类", "高热量"], "RM5-12/人"),
    dish("必胜客 · 意式披萨", ["快餐", "高热量"], "RM22-55/人"),
    dish("德克士 · 脆皮炸鸡", ["快餐", "油炸类", "高热量"], "RM16-32/人"),
    dish("塔斯汀 · 中国汉堡", ["快餐", "高热量"], "RM9-20/人"),
    dish("华莱士 · 香辣鸡腿堡", ["快餐", "油炸类", "高热量"], "RM8-18/人"),
  ],
  日本: [
    dish("McDonald's Japan · Big Mac", ["快餐", "高热量"], "RM14-25/人"),
    dish("McDonald's Japan · Teriyaki McBurger", ["快餐", "高热量"], "RM12-22/人"),
    dish("McDonald's Japan · Ebi Filet-O", ["快餐", "油炸类"], "RM13-25/人"),
    dish("KFC Japan · Original Chicken", ["快餐", "油炸类", "高热量"], "RM11-22/人"),
    dish("KFC Japan · Chicken Filet Burger", ["快餐", "油炸类", "高热量"], "RM15-27/人"),
    dish("KFC Japan · Pepper Mayo Twister", ["快餐", "油炸类"], "RM13-24/人"),
    dish("MOS Burger · Teriyaki Burger", ["快餐", "高热量"], "RM14-28/人"),
    dish("MOS Burger · Rice Burger", ["快餐"], "RM12-26/人"),
    dish("Lotteria Japan · Shrimp Burger", ["快餐", "油炸类"], "RM13-26/人"),
    dish("Sukiya · Gyudon", ["快餐"], "RM10-24/人"),
    dish("Yoshinoya · Beef Bowl", ["快餐"], "RM10-24/人"),
    dish("CoCo Ichibanya · Curry Rice", ["快餐", "高热量"], "RM18-42/人"),
  ],
  韩国: [
    dish("McDonald's Korea · Big Mac Meal", ["快餐", "高热量"], "RM18-34/人"),
    dish("McDonald's Korea · McSpicy Basil Cream Cheese", ["快餐", "油炸类", "高热量"], "RM20-38/人"),
    dish("KFC Korea · Zinger Burger", ["快餐", "油炸类", "高热量"], "RM18-34/人"),
    dish("KFC Korea · Original Chicken", ["快餐", "油炸类"], "RM16-36/人"),
    dish("Lotteria · Bulgogi Burger", ["快餐", "高热量"], "RM14-28/人"),
    dish("Lotteria · Shrimp Burger", ["快餐", "油炸类"], "RM14-28/人"),
    dish("Mom's Touch · Thigh Burger", ["快餐", "油炸类", "高热量"], "RM16-30/人"),
    dish("BBQ Chicken · Golden Olive Chicken", ["油炸类", "高热量"], "RM35-80/人"),
    dish("BHC · Bburinkle Chicken", ["油炸类", "高热量"], "RM35-80/人"),
    dish("Isaac Toast · Ham Cheese Toast", ["快餐", "高热量"], "RM10-22/人"),
  ],
  泰国: [
    dish("McDonald's Thailand · Samurai Pork Burger", ["快餐", "高热量"], "RM13-24/人"),
    dish("McDonald's Thailand · McSpicy Chicken Burger", ["快餐", "油炸类", "高热量"], "RM14-26/人"),
    dish("McDonald's Thailand · Kaprao Crispy Chicken Rice", ["快餐", "油炸类", "高热量"], "RM10-22/人"),
    dish("KFC Thailand · Zinger Burger", ["快餐", "油炸类", "高热量"], "RM13-26/人"),
    dish("KFC Thailand · WingZ Zabb", ["快餐", "油炸类", "嘴馋零嘴类"], "RM10-22/人"),
    dish("KFC Thailand · Larb Rice Bowl", ["快餐", "高热量"], "RM10-22/人"),
    dish("Burger King Thailand · Whopper", ["快餐", "高热量"], "RM18-36/人"),
    dish("The Pizza Company · Personal Pizza", ["快餐", "高热量"], "RM16-35/人"),
    dish("Chester's · Grilled Chicken Rice", ["快餐", "健康类"], "RM10-24/人"),
    dish("Texas Chicken Thailand · Fried Chicken", ["快餐", "油炸类"], "RM14-28/人"),
  ],
  台湾: [
    dish("麥當勞台灣 · 大麥克", ["快餐", "高热量"], "RM14-26/人"),
    dish("麥當勞台灣 · 勁辣雞腿堡", ["快餐", "油炸类", "高热量"], "RM14-26/人"),
    dish("麥當勞台灣 · 麥脆鷄腿", ["快餐", "油炸类", "高热量"], "RM16-32/人"),
    dish("肯德基台灣 · 咔啦雞腿堡", ["快餐", "油炸类", "高热量"], "RM14-28/人"),
    dish("肯德基台灣 · 蛋撻", ["嘴馋零嘴类", "高热量"], "RM5-12/人"),
    dish("肯德基台灣 · 原味蛋撻禮盒", ["嘴馋零嘴类", "高热量"], "RM18-38/人"),
    dish("MOS Burger Taiwan · 海洋珍珠堡", ["快餐", "油炸类"], "RM14-28/人"),
    dish("頂呱呱 · 呱呱包", ["快餐", "油炸类", "高热量"], "RM12-26/人"),
    dish("必勝客台灣 · 個人披薩", ["快餐", "高热量"], "RM18-38/人"),
    dish("拿坡里 · 炸雞披薩套餐", ["快餐", "油炸类", "高热量"], "RM20-45/人"),
  ],
  新加坡: [
    dish("McDonald's Singapore · McSpicy", ["快餐", "油炸类", "高热量"], "RM17-32/人"),
    dish("McDonald's Singapore · Chicken McCrispy", ["快餐", "油炸类", "高热量"], "RM18-35/人"),
    dish("McDonald's Singapore · McNuggets", ["快餐", "油炸类"], "RM12-28/人"),
    dish("KFC Singapore · Zinger Meal", ["快餐", "油炸类", "高热量"], "RM20-38/人"),
    dish("KFC Singapore · Original Recipe Chicken", ["快餐", "油炸类"], "RM18-36/人"),
    dish("Burger King Singapore · Whopper", ["快餐", "高热量"], "RM20-40/人"),
    dish("Jollibee Singapore · Chickenjoy", ["快餐", "油炸类", "高热量"], "RM18-36/人"),
    dish("Texas Chicken Singapore · Honey Butter Biscuit Combo", ["快餐", "油炸类", "高热量"], "RM18-36/人"),
    dish("Subway Singapore · Veggie Delite", ["快餐", "素食类", "低卡类"], "RM14-26/人"),
    dish("Pizza Hut Singapore · Personal Pan Pizza", ["快餐", "高热量"], "RM18-40/人"),
  ],
  越南: [
    dish("KFC Vietnam · Fried Chicken", ["快餐", "油炸类", "高热量"], "RM10-24/人"),
    dish("KFC Vietnam · Chicken Rice", ["快餐"], "RM9-20/人"),
    dish("KFC Vietnam · Burger - Cơm - Mì Ý", ["快餐", "高热量"], "RM12-28/人"),
    dish("Lotteria Vietnam · Bulgogi Burger", ["快餐", "高热量"], "RM10-24/人"),
    dish("Lotteria Vietnam · Shrimp Burger", ["快餐", "油炸类"], "RM10-24/人"),
    dish("McDonald's Vietnam · Big Mac", ["快餐", "高热量"], "RM14-28/人"),
    dish("McDonald's Vietnam · McSpicy", ["快餐", "油炸类", "高热量"], "RM14-28/人"),
    dish("Pizza Hut Vietnam · Personal Pizza", ["快餐", "高热量"], "RM14-32/人"),
    dish("Popeyes Vietnam · Cajun Fried Chicken", ["快餐", "油炸类", "高热量"], "RM14-32/人"),
    dish("Highlands Coffee · Bánh Mì + Coffee", ["快餐"], "RM8-18/人"),
  ],
  印尼: [
    dish("McDonald's Indonesia · PaNas 1", ["快餐", "油炸类", "高热量"], "RM10-22/人"),
    dish("McDonald's Indonesia · Nasi Uduk McD", ["快餐", "高热量"], "RM10-24/人"),
    dish("McDonald's Indonesia · Bubur Ayam", ["快餐", "健康类"], "RM7-16/人"),
    dish("KFC Indonesia · Chicken + Rice Combo", ["快餐", "油炸类"], "RM10-24/人"),
    dish("KFC Indonesia · Cream Soup", ["快餐"], "RM5-12/人"),
    dish("Burger King Indonesia · Whopper", ["快餐", "高热量"], "RM16-34/人"),
    dish("A&W Indonesia · Waffle + Root Beer", ["快餐", "嘴馋零嘴类"], "RM12-26/人"),
    dish("HokBen · Bento Set", ["快餐"], "RM12-28/人"),
    dish("Richeese Factory · Fire Chicken", ["快餐", "油炸类", "高热量"], "RM12-28/人"),
    dish("J.CO · Donut + Coffee", ["嘴馋零嘴类", "高热量"], "RM8-18/人"),
  ],
  意大利: [
    dish("McDonald's Italia · Gran Crispy McBacon", ["快餐", "高热量"], "RM32-58/人"),
    dish("McDonald's Italia · Crispy McBacon", ["快餐", "高热量"], "RM24-45/人"),
    dish("McDonald's Italia · My Selection Chicken", ["快餐", "高热量"], "RM35-65/人"),
    dish("KFC Italia · Zinger Burger", ["快餐", "油炸类", "高热量"], "RM28-55/人"),
    dish("KFC Italia · Bucket", ["快餐", "油炸类", "高热量"], "RM45-120/人"),
    dish("KFC Italia · Colonel’s Burger", ["快餐", "油炸类"], "RM24-48/人"),
    dish("Burger King Italia · Whopper", ["快餐", "高热量"], "RM28-55/人"),
    dish("Burger King Italia · Crispy Chicken", ["快餐", "油炸类", "高热量"], "RM26-52/人"),
    dish("Spontini · Pizza Trancio", ["快餐", "高热量"], "RM18-38/人"),
    dish("Alice Pizza · Pizza al Taglio", ["快餐", "高热量"], "RM18-45/人"),
  ],
};

const DELIVERY_MENU_DATA = {
  马来西亚: FOOD_DATA.马来西亚.外卖平台热门,
  中国: [
    dish("外卖 · 黄焖鸡米饭", ["快餐", "高热量"], "RM12-26/人"),
    dish("外卖 · 麻辣烫自选", ["快餐", "高热量"], "RM15-35/人"),
    dish("外卖 · 兰州牛肉面", ["快餐"], "RM10-22/人"),
    dish("外卖 · 轻食鸡胸沙拉", ["低卡类", "健康类"], "RM18-38/人"),
    dish("外卖 · 瑞幸咖啡拿铁", ["嘴馋零嘴类"], "RM6-16/人"),
    dish("外卖 · 蜜雪冰城柠檬水", ["嘴馋零嘴类"], "RM3-9/人"),
  ],
  日本: [
    dish("外卖 · 牛丼", ["快餐"], "RM12-28/人"),
    dish("外卖 · 唐扬鸡便当", ["油炸类", "高热量"], "RM18-38/人"),
    dish("外卖 · 回转寿司拼盘", ["健康类"], "RM28-65/人"),
    dish("外卖 · 咖喱猪排饭", ["油炸类", "高热量"], "RM22-48/人"),
    dish("外卖 · 便利店沙拉鸡", ["低卡类", "健康类"], "RM10-20/人"),
  ],
  韩国: [
    dish("外卖 · 炸鸡半半", ["油炸类", "高热量"], "RM45-90/人"),
    dish("外卖 · 炒年糕", ["嘴馋零嘴类", "高热量"], "RM18-38/人"),
    dish("外卖 · 紫菜包饭", ["快餐"], "RM12-24/人"),
    dish("外卖 · 拌饭", ["健康类"], "RM18-36/人"),
    dish("外卖 · 韩式咖啡拿铁", ["嘴馋零嘴类"], "RM12-24/人"),
  ],
  泰国: [
    dish("外卖 · 打抛猪饭", ["快餐"], "RM8-18/人"),
    dish("外卖 · 泰式炒河粉", ["快餐", "高热量"], "RM10-22/人"),
    dish("外卖 · 青木瓜沙拉", ["低卡类", "健康类"], "RM8-18/人"),
    dish("外卖 · 烤猪颈肉", ["高热量"], "RM16-36/人"),
    dish("外卖 · 泰奶", ["嘴馋零嘴类", "高热量"], "RM5-12/人"),
  ],
  台湾: [
    dish("外卖 · 鹽酥雞", ["油炸类", "嘴馋零嘴类", "高热量"], "RM8-22/人"),
    dish("外卖 · 滷肉飯便當", ["快餐", "高热量"], "RM10-24/人"),
    dish("外卖 · 牛肉麵", ["高热量"], "RM18-38/人"),
    dish("外卖 · 珍珠奶茶", ["嘴馋零嘴类", "高热量"], "RM6-16/人"),
    dish("外卖 · 健康餐盒", ["低卡类", "健康类"], "RM16-36/人"),
  ],
  新加坡: [
    dish("外卖 · Chicken Rice", ["快餐"], "RM18-35/人"),
    dish("外卖 · Nasi Lemak", ["快餐", "高热量"], "RM18-35/人"),
    dish("外卖 · Thunder Tea Rice", ["素食类", "健康类"], "RM20-42/人"),
    dish("外卖 · Poke Bowl", ["低卡类", "健康类"], "RM25-55/人"),
    dish("外卖 · Bubble Tea", ["嘴馋零嘴类", "高热量"], "RM12-25/人"),
  ],
  越南: [
    dish("外卖 · 越南法包", ["快餐"], "RM6-14/人"),
    dish("外卖 · 牛肉河粉", ["低卡类", "健康类"], "RM8-18/人"),
    dish("外卖 · 碎米饭", ["快餐"], "RM8-18/人"),
    dish("外卖 · 炸春卷", ["油炸类", "嘴馋零嘴类"], "RM6-15/人"),
    dish("外卖 · 越南咖啡", ["嘴馋零嘴类"], "RM5-12/人"),
  ],
  印尼: [
    dish("外卖 · Nasi Goreng", ["快餐", "高热量"], "RM8-18/人"),
    dish("外卖 · Ayam Geprek", ["油炸类", "高热量"], "RM8-20/人"),
    dish("外卖 · Gado-Gado", ["素食类", "健康类"], "RM8-18/人"),
    dish("外卖 · Sate Ayam", ["嘴馋零嘴类"], "RM12-26/人"),
    dish("外卖 · Es Kopi Susu", ["嘴馋零嘴类"], "RM5-12/人"),
  ],
  意大利: [
    dish("外卖 · Pizza Margherita", ["快餐", "素食类", "高热量"], "RM25-55/人"),
    dish("外卖 · Panino Porchetta", ["快餐", "高热量"], "RM22-48/人"),
    dish("外卖 · Pasta Carbonara", ["高热量"], "RM35-75/人"),
    dish("外卖 · Insalata Bowl", ["低卡类", "健康类"], "RM28-60/人"),
    dish("外卖 · Gelato", ["嘴馋零嘴类"], "RM12-28/人"),
  ],
};

const TRAVEL_DATA = [
  destination("槟城乔治市", "马来西亚", "2-3", ["短途", "城市", "美食", "文化"], ["自驾游", "公共交通", "自由行"], { 穷游: "RM220-420", 低消费: "RM420-750", 舒适: "RM750-1300" }, "适合朋友各自提 5 个美食点后锁定抽选。"),
  destination("兰卡威", "马来西亚", "3", ["放松", "自然", "海岛", "亲子"], ["自驾游", "自由行"], { 低消费: "RM650-1000", 舒适: "RM1200-2200", 轻奢: "RM2600-5200" }, "租车会更顺，海滩和缆车行程弹性高。"),
  destination("马六甲", "马来西亚", "2", ["短途", "城市", "文化", "美食"], ["自驾游", "步行城市"], { 穷游: "RM180-350", 低消费: "RM350-650", 舒适: "RM700-1200" }, "周末短途友好，老街区域靠步行就够。"),
  destination("怡保", "马来西亚", "2", ["短途", "美食", "自然"], ["自驾游", "自由行"], { 穷游: "RM160-320", 低消费: "RM350-650", 舒适: "RM650-1100" }, "适合低消费自驾，美食密度高。"),
  destination("金马仑高原", "马来西亚", "2-3", ["自然", "放松", "亲子"], ["自驾游", "跟团"], { 低消费: "RM450-800", 舒适: "RM900-1500" }, "山路较多，自驾要预留时间。"),
  destination("沙巴仙本那", "马来西亚", "4", ["冒险", "自然", "海岛"], ["自由行", "跟团"], { 低消费: "RM1200-1900", 舒适: "RM2200-3800", 轻奢: "RM4500-7800" }, "跳岛、潜水和海景住宿会拉高预算。"),
  destination("古晋", "马来西亚", "3", ["自然", "文化", "美食"], ["自驾游", "自由行"], { 穷游: "RM450-750", 低消费: "RM800-1300", 舒适: "RM1500-2400" }, "适合慢节奏和雨林文化。"),
  destination("新加坡", "新加坡", "2", ["短途", "城市", "美食", "购物", "亲子"], ["公共交通", "步行城市"], { 穷游: "RM600-950", 低消费: "RM1000-1700", 舒适: "RM2000-3600", 轻奢: "RM4200-9000" }, "地铁方便，但住宿预算要抓高。"),
  destination("曼谷", "泰国", "3-4", ["城市", "美食", "购物"], ["公共交通", "自由行"], { 穷游: "RM650-1000", 低消费: "RM1100-1800", 舒适: "RM2200-3800", 轻奢: "RM4500-8500" }, "低消费选择很多，商场和夜市都能满足。"),
  destination("清迈", "泰国", "4-5", ["放松", "自然", "文化"], ["自驾游", "自由行", "跟团"], { 穷游: "RM700-1100", 低消费: "RM1200-1900", 舒适: "RM2200-3600" }, "适合穷游和机车/包车小环线。"),
  destination("普吉岛", "泰国", "4", ["海岛", "放松", "亲子"], ["自由行", "跟团"], { 低消费: "RM1300-2100", 舒适: "RM2600-4500", 轻奢: "RM5200-11000" }, "船票、海岛团和酒店等级差异大。"),
  destination("河内", "越南", "4", ["城市", "文化", "美食"], ["公共交通", "步行城市", "自由行"], { 穷游: "RM650-1000", 低消费: "RM1100-1700", 舒适: "RM2000-3300" }, "老城区步行友好，咖啡和小吃很适合低预算。"),
  destination("岘港", "越南", "4", ["放松", "自然", "海岛", "短途"], ["自由行", "自驾游"], { 穷游: "RM750-1150", 低消费: "RM1300-2000", 舒适: "RM2300-3800" }, "海岸、会安和巴拿山可以组合。"),
  destination("台南", "台湾", "3-4", ["美食", "城市", "文化"], ["公共交通", "步行城市", "自由行"], { 穷游: "RM900-1400", 低消费: "RM1500-2400", 舒适: "RM2800-4500" }, "吃东西比景点更重要，适合朋友锁定小吃名单。"),
  destination("台北", "台湾", "4", ["城市", "美食", "购物", "亲子"], ["公共交通", "步行城市"], { 低消费: "RM1700-2600", 舒适: "RM3200-5200", 轻奢: "RM6200-12000" }, "捷运方便，购物和夜市都好安排。"),
  destination("东京", "日本", "5", ["城市", "美食", "购物", "亲子"], ["公共交通", "步行城市"], { 低消费: "RM3300-5200", 舒适: "RM6000-9500", 轻奢: "RM12000-22000", 奢华: "RM25000+" }, "交通强但住宿贵，预算按季节浮动大。"),
  destination("大阪", "日本", "4-5", ["城市", "美食", "购物"], ["公共交通", "步行城市"], { 低消费: "RM2800-4500", 舒适: "RM5200-8500", 轻奢: "RM10000-18000" }, "适合关西城市跳点，美食密度高。"),
  destination("北海道道央", "日本", "5-6", ["自然", "亲子", "美食"], ["自驾游", "跟团"], { 舒适: "RM6500-10000", 轻奢: "RM12000-22000", 奢华: "RM26000+" }, "自驾体验好，但雪季要评估驾驶经验。"),
  destination("首尔", "韩国", "4", ["城市", "购物", "文化", "美食"], ["公共交通", "步行城市"], { 低消费: "RM2200-3500", 舒适: "RM4200-7000", 轻奢: "RM8500-16000" }, "地铁方便，购物预算容易超。"),
  destination("济州岛", "韩国", "4", ["自然", "海岛", "放松"], ["自驾游", "跟团"], { 低消费: "RM2500-3800", 舒适: "RM4500-7500", 轻奢: "RM9000-17000" }, "自驾最省路线时间，适合自然风景。"),
  destination("巴厘岛", "印尼", "4-5", ["海岛", "放松", "文化"], ["自由行", "自驾游"], { 低消费: "RM1500-2400", 舒适: "RM3200-6000", 轻奢: "RM7500-16000", 奢华: "RM20000+" }, "住宿跨度很大，Villa 会显著拉高预算。"),
  destination("香港", "中国", "3", ["城市", "购物", "美食"], ["公共交通", "步行城市"], { 低消费: "RM1800-2800", 舒适: "RM3600-6500", 轻奢: "RM8000-16000" }, "购物和餐厅预算最容易飘。"),
  destination("大理", "中国", "5", ["放松", "自然", "文化"], ["自驾游", "自由行"], { 穷游: "RM1200-1900", 低消费: "RM2200-3500", 舒适: "RM4200-7000" }, "适合慢旅行和环湖自驾。"),
  destination("京都", "日本", "5", ["文化", "城市", "放松"], ["公共交通", "步行城市"], { 低消费: "RM3600-5600", 舒适: "RM6500-10000", 轻奢: "RM12000-22000" }, "寺院、町屋和季节性住宿是预算关键。"),
  destination("迪拜", "阿联酋", "4", ["城市", "购物", "亲子"], ["公共交通", "自由行", "跟团"], { 舒适: "RM6500-10000", 轻奢: "RM12000-22000", 奢华: "RM30000+" }, "奢华体验多，预算上限很高。"),
  destination("巴黎", "法国", "5", ["城市", "文化", "购物"], ["公共交通", "步行城市"], { 舒适: "RM8500-13000", 轻奢: "RM16000-30000", 奢华: "RM45000+" }, "适合博物馆、餐厅和奢侈品购物。"),
];

const GLOBAL_TRAVEL_DATA = [
  ...TRAVEL_DATA,
  destination("刁曼岛", "马来西亚", "3-4", ["海岛", "自然", "放松"], ["自由行", "跟团"], { 低消费: "RM700-1300", 舒适: "RM1600-2800" }, "适合浮潜、入门潜水和安静海岛假期。", ["浮潜", "潜水", "海岛跳岛"]),
  destination("神山 / 京那巴鲁山", "马来西亚", "3-4", ["自然", "冒险"], ["跟团", "自由行"], { 低消费: "RM1200-2200", 舒适: "RM2600-4500" }, "爬山名额和向导要提前订，体力门槛较高。", ["爬山", "徒步", "摄影"]),
  destination("石垣岛", "日本", "4-5", ["海岛", "自然"], ["自由行", "自驾游"], { 舒适: "RM5200-8500", 轻奢: "RM10000-18000" }, "以珊瑚、海龟和蝠鲼潜点闻名，适合海岛慢旅行。", ["潜水", "浮潜", "海岛跳岛"]),
  destination("富士山五湖", "日本", "3-4", ["自然", "文化", "亲子"], ["公共交通", "自驾游"], { 低消费: "RM2600-4200", 舒适: "RM5200-8500" }, "适合看富士山、温泉和湖区摄影。", ["摄影", "温泉", "自驾风景", "徒步"]),
  destination("北海道二世谷", "日本", "4-6", ["自然", "冒险"], ["自驾游", "跟团"], { 舒适: "RM7800-13000", 轻奢: "RM15000-28000" }, "雪季滑雪预算较高，非雪季适合自驾和温泉。", ["滑雪", "温泉", "自驾风景"]),
  destination("屋久岛", "日本", "4-5", ["自然", "冒险"], ["自由行", "跟团"], { 舒适: "RM6000-10000", 轻奢: "RM12000-20000" }, "森林徒步和古杉路线很经典，雨具必备。", ["徒步", "摄影", "野生动物"]),
  destination("涛岛", "泰国", "4-5", ["海岛", "冒险", "放松"], ["自由行", "跟团"], { 低消费: "RM1200-2200", 舒适: "RM2600-4500" }, "潜水课程和浮潜点密集，适合第一次考潜水证。", ["潜水", "浮潜", "海岛跳岛"]),
  destination("甲米", "泰国", "4", ["海岛", "自然", "冒险"], ["自由行", "跟团"], { 低消费: "RM1200-2100", 舒适: "RM2600-4500" }, "石灰岩海岸、跳岛、攀岩和皮划艇都好安排。", ["浮潜", "海岛跳岛", "皮划艇", "摄影"]),
  destination("拉贾安帕特", "印尼", "6-8", ["海岛", "自然", "冒险"], ["跟团", "自由行"], { 舒适: "RM8000-14000", 轻奢: "RM18000-35000" }, "世界级潜水和珊瑚生态，交通复杂、预算较高。", ["潜水", "浮潜", "海岛跳岛", "摄影"]),
  destination("科莫多国家公园", "印尼", "4-5", ["自然", "冒险", "海岛"], ["跟团", "自由行"], { 舒适: "RM4500-8000", 轻奢: "RM10000-20000" }, "看科莫多龙、船宿、粉红沙滩和蝠鲼潜点。", ["潜水", "浮潜", "野生动物", "海岛跳岛"]),
  destination("布罗莫火山", "印尼", "3-4", ["自然", "冒险"], ["跟团", "自驾游"], { 低消费: "RM1800-3200", 舒适: "RM4200-7000" }, "日出和火山地貌很震撼，清晨温差大。", ["爬山", "摄影", "自驾风景"]),
  destination("巴拉望爱妮岛", "菲律宾", "5", ["海岛", "自然", "放松"], ["自由行", "跟团"], { 低消费: "RM2200-3800", 舒适: "RM4800-8000", 轻奢: "RM10000-20000" }, "泻湖、跳岛和浮潜很强，适合海岛控。", ["浮潜", "海岛跳岛", "皮划艇", "摄影"]),
  destination("科隆", "菲律宾", "5", ["海岛", "冒险", "自然"], ["自由行", "跟团"], { 低消费: "RM2300-4000", 舒适: "RM5200-8500" }, "沉船潜水、湖泊和跳岛路线丰富。", ["潜水", "浮潜", "海岛跳岛"]),
  destination("锡亚高", "菲律宾", "5-7", ["海岛", "冒险", "放松"], ["自由行"], { 低消费: "RM2200-3800", 舒适: "RM4800-8000" }, "冲浪、泻湖和机车环岛很适合年轻旅行。", ["冲浪", "海岛跳岛", "摄影"]),
  destination("马尔代夫环礁", "马尔代夫", "4-5", ["海岛", "放松", "亲子"], ["自由行", "跟团"], { 舒适: "RM6500-12000", 轻奢: "RM15000-35000", 奢华: "RM50000+" }, "浮潜、潜水和水上屋是预算重点。", ["浮潜", "潜水", "海岛跳岛"]),
  destination("加德满都 + 博卡拉", "尼泊尔", "6-8", ["文化", "自然", "冒险"], ["自由行", "跟团"], { 穷游: "RM2500-4200", 低消费: "RM4800-7500", 舒适: "RM9000-15000" }, "适合湖景、寺庙和喜马拉雅徒步入门。", ["徒步", "爬山", "文化探索", "摄影"]),
  destination("安纳普尔纳小环线", "尼泊尔", "8-12", ["自然", "冒险"], ["跟团", "自由行"], { 低消费: "RM5200-8500", 舒适: "RM10000-18000" }, "长线徒步需要体力、装备和高海拔准备。", ["徒步", "爬山", "摄影"]),
  destination("拉达克", "印度", "6-8", ["自然", "文化", "冒险"], ["自驾游", "跟团"], { 低消费: "RM4200-7000", 舒适: "RM8500-15000" }, "高原风景、寺院和公路旅行很强，注意适应海拔。", ["自驾风景", "文化探索", "摄影"]),
  destination("锡吉里耶 + 康提", "斯里兰卡", "6-7", ["文化", "自然", "野生动物"], ["自驾游", "跟团"], { 低消费: "RM3000-5200", 舒适: "RM6500-11000" }, "古城、茶园、火车和野生动物可以串联。", ["文化探索", "野生动物", "摄影"]),
  destination("下龙湾", "越南", "2-3", ["自然", "放松", "亲子"], ["跟团", "自由行"], { 低消费: "RM900-1600", 舒适: "RM2200-3800" }, "适合游船、皮划艇和石灰岩海景。", ["皮划艇", "摄影", "亲子乐园"]),
  destination("沙巴 / 萨帕", "越南", "3-4", ["自然", "文化"], ["自由行", "跟团"], { 穷游: "RM800-1400", 低消费: "RM1500-2600", 舒适: "RM3200-5200" }, "梯田徒步和少数民族村落体验。", ["徒步", "文化探索", "摄影"]),
  destination("暹粒吴哥窟", "柬埔寨", "3-4", ["文化", "摄影"], ["自由行", "跟团"], { 穷游: "RM900-1600", 低消费: "RM1800-3000", 舒适: "RM3800-6500" }, "日出、寺庙群和历史文化密度很高。", ["文化探索", "摄影"]),
  destination("张家界", "中国", "4-5", ["自然", "冒险", "亲子"], ["跟团", "自由行"], { 低消费: "RM2200-3800", 舒适: "RM4800-8000" }, "玻璃桥、森林公园和山地景观适合拍照。", ["徒步", "爬山", "摄影"]),
  destination("桂林阳朔", "中国", "4-5", ["自然", "放松", "文化"], ["自由行", "自驾游"], { 穷游: "RM1600-2600", 低消费: "RM3000-4800", 舒适: "RM5800-9500" }, "喀斯特山水、骑行和竹筏路线友好。", ["骑行", "摄影", "文化探索"]),
  destination("花莲太鲁阁", "台湾", "3-4", ["自然", "冒险"], ["自驾游", "自由行"], { 低消费: "RM1500-2600", 舒适: "RM3200-5500" }, "峡谷、海岸和步道适合自驾风景线。", ["徒步", "自驾风景", "摄影"]),
  destination("雪岳山", "韩国", "3-4", ["自然", "冒险"], ["公共交通", "跟团"], { 低消费: "RM2000-3300", 舒适: "RM4200-7000" }, "秋色和山岳徒步很经典。", ["徒步", "爬山", "摄影"]),
  destination("大堡礁", "澳大利亚", "4-6", ["海岛", "自然", "亲子"], ["跟团", "自由行"], { 舒适: "RM8500-14000", 轻奢: "RM17000-30000" }, "适合浮潜、潜水和亲子海洋活动。", ["浮潜", "潜水", "海岛跳岛"]),
  destination("宁格鲁海岸", "澳大利亚", "5-7", ["自然", "冒险"], ["自驾游", "跟团"], { 舒适: "RM9500-16000", 轻奢: "RM19000-35000" }, "季节性鲸鲨、珊瑚礁和西澳自驾。", ["浮潜", "潜水", "赏鲸", "自驾风景"]),
  destination("塔斯马尼亚", "澳大利亚", "6-8", ["自然", "放松", "冒险"], ["自驾游"], { 舒适: "RM9000-15000", 轻奢: "RM18000-32000" }, "国家公园、自驾、徒步和海岸风景很强。", ["徒步", "自驾风景", "野生动物", "摄影"]),
  destination("皇后镇", "新西兰", "5-7", ["自然", "冒险"], ["自驾游", "自由行"], { 舒适: "RM9500-16000", 轻奢: "RM19000-35000" }, "蹦极、湖景、滑雪和峡湾路线都可组合。", ["滑雪", "自驾风景", "皮划艇", "摄影"]),
  destination("汤加里罗国家公园", "新西兰", "3-4", ["自然", "冒险"], ["自驾游", "跟团"], { 舒适: "RM7500-12000", 轻奢: "RM15000-26000" }, "火山徒步路线经典，天气窗口很重要。", ["徒步", "爬山", "摄影"]),
  destination("斐济玛玛努卡群岛", "斐济", "5-6", ["海岛", "放松", "亲子"], ["自由行", "跟团"], { 舒适: "RM9000-16000", 轻奢: "RM20000-38000" }, "海岛跳岛、珊瑚和度假村体验。", ["浮潜", "潜水", "海岛跳岛"]),
  destination("大溪地波拉波拉", "法属波利尼西亚", "5-6", ["海岛", "放松"], ["自由行"], { 轻奢: "RM25000-45000", 奢华: "RM60000+" }, "顶级海岛和水上屋目的地，适合蜜月和预算充足时。", ["浮潜", "潜水", "摄影"]),
  destination("班夫国家公园", "加拿大", "5-7", ["自然", "冒险"], ["自驾游", "跟团"], { 舒适: "RM9000-15000", 轻奢: "RM18000-32000" }, "湖泊、雪山和自驾风景线非常经典。", ["徒步", "自驾风景", "摄影", "滑雪"]),
  destination("温哥华岛", "加拿大", "4-6", ["自然", "放松"], ["自驾游", "自由行"], { 舒适: "RM8500-14000", 轻奢: "RM17000-30000" }, "雨林、海岸、赏鲸和小镇慢旅行。", ["赏鲸", "徒步", "自驾风景"]),
  destination("黄石国家公园", "美国", "5-7", ["自然", "亲子", "冒险"], ["自驾游", "跟团"], { 舒适: "RM12000-20000", 轻奢: "RM25000-45000" }, "地热、野生动物和公路旅行路线经典。", ["野生动物", "自驾风景", "摄影"]),
  destination("夏威夷欧胡 + 茂宜", "美国", "5-7", ["海岛", "放松", "冒险"], ["自驾游", "自由行"], { 舒适: "RM12000-20000", 轻奢: "RM25000-45000" }, "冲浪、浮潜、火山和海岸公路都能组合。", ["冲浪", "浮潜", "自驾风景", "徒步"]),
  destination("阿拉斯加", "美国", "6-8", ["自然", "冒险"], ["自驾游", "跟团"], { 舒适: "RM15000-26000", 轻奢: "RM32000-60000" }, "冰川、野生动物、邮轮和极光季都值得规划。", ["野生动物", "赏鲸", "极光", "摄影"]),
  destination("尤卡坦 / 图卢姆", "墨西哥", "5-6", ["海岛", "文化", "放松"], ["自由行", "自驾游"], { 低消费: "RM6500-10000", 舒适: "RM12000-20000" }, "玛雅遗址、洞穴水井、浮潜和加勒比海滩。", ["浮潜", "潜水", "文化探索"]),
  destination("下加利福尼亚", "墨西哥", "5-7", ["自然", "冒险", "海岛"], ["自驾游", "跟团"], { 舒适: "RM11000-18000", 轻奢: "RM22000-40000" }, "季节性赏鲸、海狮和沙漠海岸景观。", ["赏鲸", "浮潜", "自驾风景"]),
  destination("阿雷纳尔 + 蒙特维德", "哥斯达黎加", "6-8", ["自然", "冒险", "亲子"], ["自驾游", "跟团"], { 舒适: "RM9500-16000", 轻奢: "RM19000-33000" }, "火山、云雾林、吊桥、温泉和野生动物。", ["野生动物", "温泉", "徒步", "摄影"]),
  destination("加拉帕戈斯群岛", "厄瓜多尔", "6-8", ["海岛", "自然", "冒险"], ["跟团"], { 舒适: "RM18000-32000", 轻奢: "RM38000-70000" }, "野生动物、浮潜和生态旅行预算较高。", ["浮潜", "潜水", "野生动物", "摄影"]),
  destination("马丘比丘 + 圣谷", "秘鲁", "6-8", ["文化", "自然", "冒险"], ["跟团", "自由行"], { 舒适: "RM10000-17000", 轻奢: "RM21000-38000" }, "印加遗址、高山景观和徒步路线很经典。", ["徒步", "文化探索", "摄影"]),
  destination("巴塔哥尼亚", "智利", "7-10", ["自然", "冒险"], ["跟团", "自驾游"], { 舒适: "RM16000-28000", 轻奢: "RM35000-65000" }, "百内国家公园、冰川和长线徒步。", ["徒步", "爬山", "摄影", "自驾风景"]),
  destination("阿塔卡马沙漠", "智利", "4-5", ["自然", "冒险"], ["跟团", "自驾游"], { 舒适: "RM12000-20000", 轻奢: "RM25000-45000" }, "沙漠、盐湖、星空和高原地貌。", ["沙漠", "摄影", "自驾风景"]),
  destination("里约热内卢", "巴西", "4-5", ["城市", "海岛", "文化"], ["自由行", "跟团"], { 舒适: "RM11000-18000", 轻奢: "RM22000-40000" }, "海滩、城市景观、桑巴和山海风景。", ["城市漫游", "文化探索", "摄影"]),
  destination("亚马逊雨林", "巴西", "5-7", ["自然", "冒险"], ["跟团"], { 舒适: "RM12000-22000", 轻奢: "RM28000-52000" }, "雨林生态、河流和野生动物观察，适合深度自然行。", ["野生动物", "皮划艇", "摄影"]),
  destination("冰岛环岛", "冰岛", "7-10", ["自然", "冒险"], ["自驾游", "跟团"], { 舒适: "RM14000-24000", 轻奢: "RM30000-55000" }, "瀑布、冰川、火山和极光季都很强，自驾要看天气。", ["自驾风景", "极光", "徒步", "摄影"]),
  destination("罗弗敦群岛", "挪威", "5-7", ["自然", "冒险"], ["自驾游", "自由行"], { 舒适: "RM14000-24000", 轻奢: "RM30000-55000" }, "峡湾、渔村、极光和摄影路线非常突出。", ["极光", "自驾风景", "摄影", "徒步"]),
  destination("因特拉肯", "瑞士", "4-5", ["自然", "冒险", "亲子"], ["公共交通", "自由行"], { 舒适: "RM12000-20000", 轻奢: "RM25000-45000" }, "雪山、湖区、滑翔伞和火车风景线。", ["爬山", "徒步", "自驾风景", "摄影"]),
  destination("采尔马特", "瑞士", "4-5", ["自然", "放松"], ["公共交通", "自由行"], { 舒适: "RM13000-22000", 轻奢: "RM28000-52000" }, "马特洪峰、滑雪和高山徒步路线。", ["滑雪", "爬山", "徒步", "摄影"]),
  destination("多洛米蒂", "意大利", "5-7", ["自然", "冒险"], ["自驾游", "自由行"], { 舒适: "RM12000-20000", 轻奢: "RM26000-48000" }, "山景公路、湖泊和徒步摄影路线密集。", ["徒步", "爬山", "自驾风景", "摄影"]),
  destination("阿马尔菲海岸", "意大利", "4-5", ["放松", "文化", "美食"], ["自驾游", "公共交通"], { 舒适: "RM11000-18000", 轻奢: "RM24000-45000" }, "海岸小镇、美食和风景路，旺季住宿贵。", ["自驾风景", "美食巡礼", "摄影"]),
  destination("霞慕尼", "法国", "4-5", ["自然", "冒险"], ["公共交通", "自由行"], { 舒适: "RM11000-19000", 轻奢: "RM24000-45000" }, "阿尔卑斯山地户外、滑雪和登山氛围强。", ["滑雪", "爬山", "徒步", "摄影"]),
  destination("加那利群岛", "西班牙", "5-7", ["海岛", "自然", "冒险"], ["自驾游", "自由行"], { 舒适: "RM10000-17000", 轻奢: "RM22000-40000" }, "火山、海岸、潜水和全年温和气候。", ["潜水", "徒步", "冲浪", "自驾风景"]),
  destination("亚速尔群岛", "葡萄牙", "5-7", ["自然", "海岛", "冒险"], ["自驾游", "跟团"], { 舒适: "RM11000-19000", 轻奢: "RM24000-45000" }, "火山湖、温泉、赏鲸和海岛自驾。", ["赏鲸", "温泉", "徒步", "自驾风景"]),
  destination("圣托里尼", "希腊", "3-4", ["海岛", "放松", "摄影"], ["自由行"], { 舒适: "RM9000-15000", 轻奢: "RM20000-38000" }, "日落、白色小镇和爱琴海摄影。", ["摄影", "海岛跳岛", "美食巡礼"]),
  destination("卡帕多奇亚", "土耳其", "3-4", ["文化", "自然", "摄影"], ["跟团", "自由行"], { 低消费: "RM4500-7500", 舒适: "RM9000-15000" }, "热气球、洞穴酒店和奇岩地貌。", ["摄影", "文化探索", "徒步"]),
  destination("撒哈拉沙漠", "摩洛哥", "4-5", ["自然", "文化", "冒险"], ["跟团", "自驾游"], { 低消费: "RM4800-8000", 舒适: "RM9500-16000" }, "沙漠营地、骑骆驼、星空和古城可串联。", ["沙漠", "露营", "摄影", "文化探索"]),
  destination("红海赫尔格达", "埃及", "4-5", ["海岛", "冒险", "放松"], ["自由行", "跟团"], { 舒适: "RM8000-14000", 轻奢: "RM17000-32000" }, "红海潜水和度假村体验，适合搭配古埃及文化线。", ["潜水", "浮潜", "海岛跳岛"]),
  destination("卢克索 + 开罗", "埃及", "5-7", ["文化", "摄影"], ["跟团", "自由行"], { 低消费: "RM6500-10000", 舒适: "RM12000-20000" }, "金字塔、神庙和尼罗河历史线。", ["文化探索", "摄影"]),
  destination("开普敦", "南非", "5-7", ["城市", "自然", "美食"], ["自驾游", "自由行"], { 舒适: "RM10000-17000", 轻奢: "RM22000-40000" }, "桌山、酒庄、海岸公路和城市美食。", ["爬山", "自驾风景", "美食巡礼", "摄影"]),
  destination("克鲁格国家公园", "南非", "4-6", ["自然", "冒险"], ["自驾游", "跟团"], { 舒适: "RM12000-22000", 轻奢: "RM28000-60000" }, "非洲野生动物 Safari，住宿级别决定预算。", ["野生动物", "摄影", "自驾风景"]),
  destination("马赛马拉", "肯尼亚", "4-6", ["自然", "冒险"], ["跟团"], { 舒适: "RM13000-23000", 轻奢: "RM30000-65000" }, "草原 Safari 和动物大迁徙季最热门。", ["野生动物", "摄影"]),
  destination("瓦塔穆海岸", "肯尼亚", "3-4", ["海岛", "自然"], ["自由行", "跟团"], { 舒适: "RM8500-15000", 轻奢: "RM18000-35000" }, "海洋国家公园、浮潜和海岸放松。", ["浮潜", "潜水", "野生动物"]),
  destination("乞力马扎罗", "坦桑尼亚", "6-8", ["自然", "冒险"], ["跟团"], { 舒适: "RM13000-23000", 轻奢: "RM28000-52000" }, "非洲高峰徒步挑战，需要向导和体能准备。", ["爬山", "徒步", "摄影"]),
  destination("桑给巴尔", "坦桑尼亚", "4-5", ["海岛", "文化", "放松"], ["自由行", "跟团"], { 舒适: "RM9000-16000", 轻奢: "RM20000-38000" }, "海滩、石头城、香料岛和潜水浮潜。", ["浮潜", "潜水", "文化探索"]),
  destination("塞舌尔", "塞舌尔", "5-6", ["海岛", "放松", "自然"], ["自由行"], { 轻奢: "RM18000-35000", 奢华: "RM50000+" }, "花岗岩海滩、海龟和轻奢海岛度假。", ["浮潜", "潜水", "野生动物", "摄影"]),
  destination("毛里求斯", "毛里求斯", "5-6", ["海岛", "亲子", "放松"], ["自驾游", "自由行"], { 舒适: "RM11000-19000", 轻奢: "RM24000-45000" }, "海滩、火山地貌、亲子度假和自驾。", ["浮潜", "自驾风景", "亲子乐园"]),
  destination("瓦迪拉姆 + 佩特拉", "约旦", "4-6", ["文化", "自然", "冒险"], ["自驾游", "跟团"], { 舒适: "RM8500-15000", 轻奢: "RM18000-33000" }, "沙漠营地、古城遗址和公路旅行。", ["沙漠", "露营", "文化探索", "摄影"]),
];

const TRAVEL_COUNTRIES = ["全部", ...new Set(GLOBAL_TRAVEL_DATA.map((item) => item.country))].sort((first, second) =>
  first === "全部" ? -1 : second === "全部" ? 1 : first.localeCompare(second, "zh-CN"),
);

const LOTTERY_DISCLAIMER = "号码由随机算法生成，仅供娱乐，不构成投注建议。";
const LOTTERY_SOURCE_NOTE = "资料为初版整理，玩法规则可能变动，后续需人工校对。";
const LOTTERY_LINE_OPTIONS = [1, 2, 3, 5];
const LOTTERY_DATA = [
  {
    id: "my-4d",
    country: "马来西亚",
    name: "4D",
    type: "digits",
    digits: 4,
    summary: "0000-9999 四位数随机。",
    source: "Sports Toto / 马来西亚 4D 运营商资料",
  },
  {
    id: "my-5d",
    country: "马来西亚",
    name: "5D",
    type: "digits",
    digits: 5,
    summary: "00000-99999 五位数随机。",
    source: "Sports Toto 产品资料",
  },
  {
    id: "my-6d",
    country: "马来西亚",
    name: "6D",
    type: "digits",
    digits: 6,
    summary: "000000-999999 六位数随机。",
    source: "Sports Toto 产品资料",
  },
  {
    id: "my-toto-650",
    country: "马来西亚",
    name: "Toto 6/50",
    type: "groups",
    summary: "6 个不重复号码，从 1-50。",
    source: "Sports Toto Star Toto 6/50 资料",
    groups: [{ label: "主号", count: 6, min: 1, max: 50, sort: true }],
  },
  {
    id: "my-power-toto-655",
    country: "马来西亚",
    name: "Power Toto 6/55",
    type: "groups",
    summary: "6 个不重复号码，从 1-55。",
    source: "Sports Toto Power Toto 6/55 资料",
    groups: [{ label: "主号", count: 6, min: 1, max: 55, sort: true }],
  },
  {
    id: "my-supreme-toto-658",
    country: "马来西亚",
    name: "Supreme Toto 6/58",
    type: "groups",
    summary: "6 个不重复号码，从 1-58。",
    source: "Sports Toto Supreme Toto 6/58 资料",
    groups: [{ label: "主号", count: 6, min: 1, max: 58, sort: true }],
  },
  {
    id: "sg-4d",
    country: "新加坡",
    name: "4D",
    type: "digits",
    digits: 4,
    summary: "0000-9999 四位数随机。",
    source: "Singapore Pools 4D Game Rules",
  },
  {
    id: "sg-toto-649",
    country: "新加坡",
    name: "TOTO 6/49",
    type: "groups",
    summary: "6 个不重复号码，从 1-49；附加号从剩余号码中抽出。",
    source: "Singapore Pools TOTO Game Rules",
    groups: [
      { label: "主号", count: 6, min: 1, max: 49, sort: true },
      { label: "附加号", count: 1, min: 1, max: 49, excludePrevious: true },
    ],
  },
  {
    id: "sg-sweep",
    country: "新加坡",
    name: "Singapore Sweep",
    type: "range",
    digits: 7,
    min: 1000000,
    max: 4499999,
    summary: "7 位 sweepstakes 号码，范围 1000000-4499999。",
    source: "Singapore Pools Singapore Sweep Game Rules",
  },
  {
    id: "us-powerball",
    country: "美国",
    name: "Powerball",
    type: "groups",
    summary: "5 个白球 1-69，加 1 个 Powerball 1-26。",
    source: "Powerball 官方玩法资料",
    groups: [
      { label: "白球", count: 5, min: 1, max: 69, sort: true },
      { label: "Powerball", count: 1, min: 1, max: 26 },
    ],
  },
  {
    id: "us-mega-millions",
    country: "美国",
    name: "Mega Millions",
    type: "groups",
    summary: "5 个白球 1-70，加 1 个 Mega Ball 1-24。",
    source: "Mega Millions 官方 FAQ",
    groups: [
      { label: "白球", count: 5, min: 1, max: 70, sort: true },
      { label: "Mega Ball", count: 1, min: 1, max: 24 },
    ],
  },
  {
    id: "us-pick-3",
    country: "美国",
    name: "Pick 3",
    type: "digits",
    digits: 3,
    summary: "000-999 三位数随机；各州规则不同，这里做简化版。",
    source: "美国州彩票 Pick 3 规则资料",
  },
  {
    id: "us-pick-4",
    country: "美国",
    name: "Pick 4",
    type: "digits",
    digits: 4,
    summary: "0000-9999 四位数随机；各州规则不同，这里做简化版。",
    source: "美国州彩票 Pick 4 规则资料",
  },
  {
    id: "us-pick-5",
    country: "美国",
    name: "Pick 5",
    type: "digits",
    digits: 5,
    summary: "00000-99999 五位数随机；各州规则不同，这里做简化版。",
    source: "美国州彩票 Pick 5 规则资料",
  },
  {
    id: "eu-euromillions",
    country: "欧洲",
    name: "EuroMillions",
    type: "groups",
    summary: "5 个主号 1-50，加 2 个 Lucky Stars 1-12。",
    source: "EuroMillions 官方 / National Lottery 资料",
    groups: [
      { label: "主号", count: 5, min: 1, max: 50, sort: true },
      { label: "Lucky Stars", count: 2, min: 1, max: 12, sort: true },
    ],
  },
  {
    id: "eu-uk-lotto",
    country: "欧洲",
    name: "UK Lotto",
    type: "groups",
    summary: "6 个不重复号码，从 1-59。",
    source: "The National Lottery UK Lotto 资料",
    groups: [{ label: "主号", count: 6, min: 1, max: 59, sort: true }],
  },
  {
    id: "eu-irish-lotto",
    country: "欧洲",
    name: "Irish Lotto",
    type: "groups",
    summary: "6 个主号 1-47，加 1 个 Bonus Ball。",
    source: "Irish National Lottery Lotto 资料",
    groups: [
      { label: "主号", count: 6, min: 1, max: 47, sort: true },
      { label: "Bonus Ball", count: 1, min: 1, max: 47, excludePrevious: true },
    ],
  },
  {
    id: "ca-lotto-649",
    country: "加拿大",
    name: "Lotto 6/49",
    type: "groups",
    summary: "Classic Draw 6 个号码，从 1-49；附 1 个 Bonus。",
    source: "加拿大 LOTTO 6/49 游戏条件资料",
    groups: [
      { label: "主号", count: 6, min: 1, max: 49, sort: true },
      { label: "Bonus", count: 1, min: 1, max: 49, excludePrevious: true },
    ],
  },
  {
    id: "ca-lotto-max",
    country: "加拿大",
    name: "Lotto Max",
    type: "groups",
    summary: "7 个主号 1-50，加 1 个 Bonus。",
    source: "OLG Lotto Max 游戏条件资料",
    groups: [
      { label: "主号", count: 7, min: 1, max: 50, sort: true },
      { label: "Bonus", count: 1, min: 1, max: 50, excludePrevious: true },
    ],
  },
  {
    id: "ph-3d",
    country: "菲律宾",
    name: "3D Lotto",
    type: "digits",
    digits: 3,
    summary: "000-999 三位数随机。",
    source: "PCSO 3D Lotto 资料",
  },
  {
    id: "ph-4d",
    country: "菲律宾",
    name: "4D Lotto",
    type: "digits",
    digits: 4,
    summary: "0000-9999 四位数随机。",
    source: "PCSO 4D Lotto 资料",
  },
  {
    id: "ph-642",
    country: "菲律宾",
    name: "Lotto 6/42",
    type: "groups",
    summary: "6 个不重复号码，从 1-42。",
    source: "PCSO Lotto 6/42 资料",
    groups: [{ label: "主号", count: 6, min: 1, max: 42, sort: true }],
  },
  {
    id: "ph-645",
    country: "菲律宾",
    name: "MegaLotto 6/45",
    type: "groups",
    summary: "6 个不重复号码，从 1-45。",
    source: "PCSO MegaLotto 6/45 资料",
    groups: [{ label: "主号", count: 6, min: 1, max: 45, sort: true }],
  },
  {
    id: "ph-649",
    country: "菲律宾",
    name: "SuperLotto 6/49",
    type: "groups",
    summary: "6 个不重复号码，从 1-49。",
    source: "PCSO SuperLotto 6/49 资料",
    groups: [{ label: "主号", count: 6, min: 1, max: 49, sort: true }],
  },
  {
    id: "ph-655",
    country: "菲律宾",
    name: "GrandLotto 6/55",
    type: "groups",
    summary: "6 个不重复号码，从 1-55。",
    source: "PCSO GrandLotto 6/55 资料",
    groups: [{ label: "主号", count: 6, min: 1, max: 55, sort: true }],
  },
  {
    id: "ph-658",
    country: "菲律宾",
    name: "UltraLotto 6/58",
    type: "groups",
    summary: "6 个不重复号码，从 1-58。",
    source: "PCSO UltraLotto 6/58 资料",
    groups: [{ label: "主号", count: 6, min: 1, max: 58, sort: true }],
  },
  {
    id: "tw-power-lottery",
    country: "台湾",
    name: "威力彩",
    type: "groups",
    summary: "第一區 6 个号码 1-38，第二區 1 个号码 1-8。",
    source: "台灣彩券电脑型彩券规则资料",
    groups: [
      { label: "第一區", count: 6, min: 1, max: 38, sort: true },
      { label: "第二區", count: 1, min: 1, max: 8 },
    ],
  },
  {
    id: "tw-lotto-649",
    country: "台湾",
    name: "大樂透",
    type: "groups",
    summary: "6 个主号 1-49，加 1 个特别号；简化随机版本。",
    source: "台灣彩券电脑型彩券规则资料",
    groups: [
      { label: "主号", count: 6, min: 1, max: 49, sort: true },
      { label: "特别号", count: 1, min: 1, max: 49, excludePrevious: true },
    ],
  },
  {
    id: "tw-daily-539",
    country: "台湾",
    name: "今彩539",
    type: "groups",
    summary: "5 个不重复号码，从 1-39。",
    source: "台灣彩券资料",
    groups: [{ label: "主号", count: 5, min: 1, max: 39, sort: true }],
  },
  {
    id: "tw-3star",
    country: "台湾",
    name: "3星彩",
    type: "digits",
    digits: 3,
    summary: "000-999 三位数随机；简化随机版本。",
    source: "台灣彩券资料",
  },
  {
    id: "tw-4star",
    country: "台湾",
    name: "4星彩",
    type: "digits",
    digits: 4,
    summary: "0000-9999 四位数随机；简化随机版本。",
    source: "台灣彩券资料",
  },
  {
    id: "hk-mark-six",
    country: "香港",
    name: "六合彩 Mark Six",
    type: "groups",
    summary: "6 个主号 1-49，加 1 个特别号；简化随机版本。",
    source: "HKJC Mark Six 规则资料",
    groups: [
      { label: "主号", count: 6, min: 1, max: 49, sort: true },
      { label: "特别号", count: 1, min: 1, max: 49, excludePrevious: true },
    ],
  },
  {
    id: "jp-mini-loto",
    country: "日本",
    name: "Mini Loto",
    type: "groups",
    summary: "5 个主号 1-31，加 1 个 Bonus。",
    source: "みずほ銀行 ミニロト资料",
    groups: [
      { label: "主号", count: 5, min: 1, max: 31, sort: true },
      { label: "Bonus", count: 1, min: 1, max: 31, excludePrevious: true },
    ],
  },
  {
    id: "jp-loto-6",
    country: "日本",
    name: "Loto 6",
    type: "groups",
    summary: "6 个主号 1-43，加 1 个 Bonus。",
    source: "みずほ銀行 ロト6 规则资料",
    groups: [
      { label: "主号", count: 6, min: 1, max: 43, sort: true },
      { label: "Bonus", count: 1, min: 1, max: 43, excludePrevious: true },
    ],
  },
  {
    id: "jp-loto-7",
    country: "日本",
    name: "Loto 7",
    type: "groups",
    summary: "7 个主号 1-37，加 2 个 Bonus。",
    source: "みずほ銀行 ロト7 规则资料",
    groups: [
      { label: "主号", count: 7, min: 1, max: 37, sort: true },
      { label: "Bonus", count: 2, min: 1, max: 37, excludePrevious: true, sort: true },
    ],
  },
  {
    id: "jp-numbers-3",
    country: "日本",
    name: "Numbers 3",
    type: "digits",
    digits: 3,
    summary: "000-999 三位数随机。",
    source: "みずほ銀行 ナンバーズ3 规则资料",
  },
  {
    id: "jp-numbers-4",
    country: "日本",
    name: "Numbers 4",
    type: "digits",
    digits: 4,
    summary: "0000-9999 四位数随机。",
    source: "みずほ銀行 ナンバーズ4 规则资料",
  },
  {
    id: "kr-lotto-645",
    country: "韩国",
    name: "Lotto 6/45",
    type: "groups",
    summary: "6 个主号 1-45，加 1 个 Bonus。",
    source: "동행복권 Lotto 6/45 资料",
    groups: [
      { label: "主号", count: 6, min: 1, max: 45, sort: true },
      { label: "Bonus", count: 1, min: 1, max: 45, excludePrevious: true },
    ],
  },
  {
    id: "th-l6",
    country: "泰国",
    name: "Government Lottery L6",
    type: "digits",
    digits: 6,
    summary: "6 位政府彩票号码；简化为 000000-999999 随机。",
    source: "Thailand Government Lottery Office 资料",
  },
  {
    id: "th-n3",
    country: "泰国",
    name: "N3 三位数字",
    type: "digits",
    digits: 3,
    summary: "3 位数字玩法；规则较新，先做简化随机版本。",
    source: "Thailand Government Lottery Office / 官方公告资料",
  },
];
const LOTTERY_COUNTRIES = ["全部", ...new Set(LOTTERY_DATA.map((item) => item.country))].sort((first, second) =>
  first === "全部" ? -1 : second === "全部" ? 1 : first.localeCompare(second, "zh-CN"),
);

const DAILY_TIPS = [
  { title: "轻一点的决定", text: "如果抽到的结果让你皱眉，那其实你已经知道自己不想要什么了。" },
  { title: "三秒规则", text: "按下随机后，第一反应通常很诚实。开心就去做，抗拒就重抽。" },
  { title: "今天别太完美", text: "随机不是替你负责，而是帮你打破僵住的那一分钟。" },
  { title: "先抽小事", text: "从午餐、咖啡、散步路线开始，给大脑省一点电。" },
  { title: "锁定朋友提案", text: "把 5 个朋友各自想去的地点锁住，就能只在这 5 个里随机。" },
];

const DEFAULT_CUSTOM_TEXT = "看电影\n去散步\n整理书桌\n喝一杯咖啡\n给朋友发消息\n早点睡";
const USER_ID_STORAGE_KEY = "choiceWheelAnonymousUserId";
const AUTH_TOKEN_STORAGE_KEY = "choiceWheelAuthToken";
const CLOUD_SYNC_ENDPOINT = "/api/user-data";
const AUTH_ENDPOINT = "/api/auth";
const WORLD_CHANNEL_ENDPOINT = "/api/world-channel";
const WORLD_SYNC_INTERVAL_MS = 15000;
const DEFAULT_WORLD_MESSAGES = [
  {
    id: "seed-1",
    user: "系统",
    text: "欢迎来到世界频道。本地原型会把消息保存在这个浏览器里。",
    time: "刚刚",
  },
  {
    id: "seed-2",
    user: "小转盘",
    text: "以后会加入好友和私聊，现在先用世界频道一起聊天。",
    time: "刚刚",
  },
];
const APP_NOTIFICATIONS = [
  {
    id: "recent-language-mobile-updates",
    type: "新功能 + 优化",
    title: "语言和手机页面变好用了",
    text: "语言入口和手机按钮位置整理得更清楚。",
    details: [
      "可以在「更多」里面切换中文、英文和马来文。",
      "手机上第一次打开会提醒你点「选择模式」，比较不容易找不到吃什么、喝什么、去哪玩。",
      "顶部按钮在小屏幕上更不容易挤在一起，通知数字也不会被切掉。",
    ],
  },
  {
    id: "recent-shopping-updates",
    type: "内容 + 优化",
    title: "购物随机内容更多了",
    text: "新增更多购物分类、预算和购买提醒。",
    details: [
      "现在可以按购物类别、花费高低和购买心情来抽建议。",
      "结果会附上大概预算、为什么适合你、以及先买不买的小提醒。",
      "手机上的购物标签更好点，不会因为太长而挤坏画面。",
    ],
  },
  {
    id: "recent-account-world-updates",
    type: "新功能",
    title: "账号和世界频道升级了",
    text: "登录、头像、记录和世界频道已支持云端同步。",
    details: [
      "可以注册和登录账号，名字、头像、最近记录和收藏会跟着账号保存。",
      "点右上角头像可以改显示名字、头像和密码。",
      "世界频道可以发文字和图片，大家能看到同一个聊天频道。",
    ],
  },
  {
    id: "recent-world-chat-polish",
    type: "优化",
    title: "世界频道更清爽",
    text: "聊天头像、图片预览和消息显示更直观。",
    details: [
      "消息会显示头像和名字，比较容易分清是谁发的。",
      "发图片前会先预览，确认后才送出去。",
      "图片发出去后不会露出原本的文件名。",
    ],
  },
  {
    id: "recent-notification-plan",
    type: "通知整理",
    title: "通知以后只讲更新内容",
    text: "之后只保留简短摘要，方便快速看完。",
    details: [
      "每条通知都会写是新功能、内容增加，还是体验变好。",
      "不会写太专业的词，只写你打开后能感受到的变化。",
      "好友和私聊以后做好时，也会在这里说明能怎么用。",
    ],
  },
];
const STORAGE_KEY = "choiceWheelState";

const state = {
  userId: "",
  mode: "food",
  worldOpen: false,
  language: "zh-CN",
  languageManuallySelected: false,
  currency: "MYR",
  food: {
    country: "马来西亚",
    region: "吉隆坡",
    category: "全部",
  },
  drink: {
    country: "马来西亚",
    brand: "全部",
    category: "全部",
  },
  travel: {
    country: "全部",
    mood: "全部",
    activity: "全部",
    level: "全部",
    transport: "全部",
  },
  number: {
    country: "马来西亚",
    gameId: "my-4d",
    lines: 1,
    allowRepeat: true,
    avoidFour: false,
  },
  shopping: {
    categoryId: "all",
    subcategoryId: "all",
    category: "生活补给",
    level: "全部",
    mindset: "全部",
  },
  auth: {
    currentUser: "",
    token: "",
  },
  users: [],
  worldMessages: [...DEFAULT_WORLD_MESSAGES],
  locked: {
    food: [],
    drink: [],
    travel: [],
    shopping: [],
    custom: [],
  },
  customText: DEFAULT_CUSTOM_TEXT,
  history: [],
  favorites: [],
  uploads: [],
  notificationReadIds: [],
  cloudSync: {
    loading: false,
    available: false,
    lastError: "",
  },
  worldSync: {
    loading: false,
    available: false,
    lastError: "",
  },
  currentResult: null,
};

const elements = {
  appRefreshButton: document.querySelector("#appRefreshButton"),
  brandTitle: document.querySelector(".brand strong"),
  brandSubtitle: document.querySelector(".brand small"),
  notificationButton: document.querySelector("#notificationButton"),
  notificationBadge: document.querySelector("#notificationBadge"),
  notificationPanel: document.querySelector("#notificationPanel"),
  profileAvatarButton: document.querySelector("#profileAvatarButton"),
  profilePanel: document.querySelector("#profilePanel"),
  moreMenuButton: document.querySelector("#moreMenuButton"),
  moreMenuButtonLabel: document.querySelector("#moreMenuButton strong"),
  moreMenuPanel: document.querySelector("#moreMenuPanel"),
  modeList: document.querySelector("#modeList"),
  modeMenuToggle: document.querySelector("#modeMenuToggle"),
  modeMenuLabel: document.querySelector("#modeMenuLabel"),
  sidebar: document.querySelector(".sidebar"),
  worldChannelButton: document.querySelector("#worldChannelButton"),
  worldCloseButton: document.querySelector("#worldCloseButton"),
  todayLabel: document.querySelector("#todayLabel"),
  currencyLabel: document.querySelector(".currency-switch span"),
  currencySelect: document.querySelector("#currencySelect"),
  actionRow: document.querySelector(".action-row"),
  modeTitle: document.querySelector("#modeTitle"),
  modeDescription: document.querySelector("#modeDescription"),
  controlHint: document.querySelector("#controlHint"),
  modeControls: document.querySelector("#modeControls"),
  previewPanel: document.querySelector(".preview-panel"),
  optionPreview: document.querySelector("#optionPreview"),
  previewCount: document.querySelector("#previewCount"),
  worldChatPanel: document.querySelector("#worldChatPanel"),
  worldChatList: document.querySelector("#worldChatList"),
  worldChatCount: document.querySelector("#worldChatCount"),
  worldAuthPanel: document.querySelector("#worldAuthPanel"),
  resultStage: document.querySelector("#resultStage"),
  resultLabel: document.querySelector("#resultLabel"),
  resultValue: document.querySelector("#resultValue"),
  resultMeta: document.querySelector("#resultMeta"),
  numberDigits: document.querySelector("#numberDigits"),
  randomButton: document.querySelector("#randomButton"),
  randomButtonLabel: document.querySelector("#randomButton span"),
  copyResultButton: document.querySelector("#copyResultButton"),
  shareResultButton: document.querySelector("#shareResultButton"),
  favoriteButton: document.querySelector("#favoriteButton"),
  surpriseModeButton: document.querySelector("#surpriseModeButton"),
  worldChannelTitle: document.querySelector("#worldChannelButton strong"),
  worldChannelSubtitle: document.querySelector("#worldChannelButton small"),
  dailyInspiration: document.querySelector("#dailyInspiration"),
  historyList: document.querySelector("#historyList"),
  historyCount: document.querySelector("#historyCount"),
  favoritesList: document.querySelector("#favoritesList"),
  favoriteCount: document.querySelector("#favoriteCount"),
  toast: document.querySelector("#toast"),
};

let toastTimer;
let pendingWorldImage = null;
let pendingProfileAvatarImage = null;
let authMode = "login";
let isProfilePanelOpen = false;
let isNotificationPanelOpen = false;
let isMoreMenuOpen = false;

function isValidAnonymousUserId(userId) {
  return /^anon_[a-zA-Z0-9_-]{12,80}$/.test(String(userId || ""));
}

function createAnonymousUserId() {
  const cryptoApi = window.crypto || window.msCrypto;
  const randomPart = cryptoApi?.randomUUID
    ? cryptoApi.randomUUID().replace(/-/g, "")
    : `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

  return `anon_${Date.now().toString(36)}_${randomPart.slice(0, 28)}`;
}

function ensureAnonymousUserId() {
  try {
    const existingUserId = localStorage.getItem(USER_ID_STORAGE_KEY);

    if (isValidAnonymousUserId(existingUserId)) {
      return existingUserId;
    }

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    if (isValidAnonymousUserId(saved.userId)) {
      localStorage.setItem(USER_ID_STORAGE_KEY, saved.userId);
      return saved.userId;
    }

    const newUserId = createAnonymousUserId();
    localStorage.setItem(USER_ID_STORAGE_KEY, newUserId);
    return newUserId;
  } catch {
    return createAnonymousUserId();
  }
}

function loadState() {
  state.userId = ensureAnonymousUserId();

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved) {
      return;
    }

    if (isValidAnonymousUserId(saved.userId)) {
      state.userId = saved.userId;
      localStorage.setItem(USER_ID_STORAGE_KEY, saved.userId);
    }

    state.mode = MODES[saved.mode] ? saved.mode : state.mode;
    state.worldOpen = Boolean(saved.worldOpen);
    state.languageManuallySelected = saved.languageManuallySelected === true;
    state.language = state.languageManuallySelected ? normalizeLanguage(saved.language) : "zh-CN";
    state.currency = CURRENCY_RATES[saved.currency] ? saved.currency : state.currency;
    state.food = { ...state.food, ...saved.food };
    state.travel = { ...state.travel, ...saved.travel };
    state.number = { ...state.number, ...saved.number };
    state.shopping = { ...state.shopping, ...saved.shopping };
    state.auth = { ...state.auth, ...saved.auth };
    state.auth.token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || state.auth.token || "";
    state.users = Array.isArray(saved.users)
      ? saved.users.map((user) => ({
        id: user.id || "",
        username: user.username,
        userId: user.userId || "",
        createdAt: user.createdAt || "",
        updatedAt: user.updatedAt || "",
        displayName: user.displayName || user.username,
        avatar: normalizeAvatar(user.avatar, user.displayName || user.username),
        avatarUrl: user.avatarUrl || "",
      }))
      : [];
    state.worldMessages = Array.isArray(saved.worldMessages) && saved.worldMessages.length
      ? saved.worldMessages.slice(-80)
      : [...DEFAULT_WORLD_MESSAGES];
    state.locked = {
      ...state.locked,
      ...(saved.locked || {}),
    };
    state.drink = { ...state.drink, ...saved.drink };
    state.customText = saved.customText || state.customText;
    state.history = Array.isArray(saved.history) ? saved.history.slice(0, 8) : [];
    state.favorites = Array.isArray(saved.favorites) ? saved.favorites.slice(0, 8) : [];
    state.uploads = Array.isArray(saved.uploads) ? saved.uploads.slice(0, 30) : [];
    state.notificationReadIds = Array.isArray(saved.notificationReadIds) ? saved.notificationReadIds : [];
  } catch {
    showToast("读取本地记录失败，已使用默认设置。");
  }
}

function saveState() {
  if (state.auth.token) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, state.auth.token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }

  const payload = {
    userId: state.userId,
    mode: state.mode,
    worldOpen: state.worldOpen,
    language: state.language,
    languageManuallySelected: state.languageManuallySelected,
    currency: state.currency,
    food: state.food,
    drink: state.drink,
    travel: state.travel,
    number: state.number,
    shopping: state.shopping,
    auth: state.auth,
    users: state.users.map((user) => ({
      id: user.id || "",
      username: user.username,
      userId: user.userId || "",
      displayName: user.displayName || user.username,
      avatar: normalizeAvatar(user.avatar, user.displayName || user.username),
      avatarUrl: user.avatarUrl || "",
      createdAt: user.createdAt || "",
      updatedAt: user.updatedAt || "",
    })),
    worldMessages: state.worldMessages,
    locked: state.locked,
    customText: state.customText,
    history: state.history,
    favorites: state.favorites,
    uploads: state.uploads,
    notificationReadIds: state.notificationReadIds,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : "zh-CN";
}

function getLocaleDictionary(language = state.language) {
  const locales = window.APP_LOCALES || {};
  return locales[normalizeLanguage(language)] || locales["zh-CN"] || {};
}

function t(key, fallback = "") {
  const currentDictionary = getLocaleDictionary();
  const fallbackDictionary = getLocaleDictionary("zh-CN");
  const translated = currentDictionary[key] ?? fallbackDictionary[key] ?? fallback;

  return translated === undefined || translated === null ? String(fallback || key) : String(translated);
}

function getModeText(modeKey, field) {
  return t(`mode.${modeKey}.${field}`, MODES[modeKey]?.[field] || "");
}

function getModeTitle(modeKey) {
  return getModeText(modeKey, "title");
}

function getLotteryDisclaimer() {
  return t("lottery.disclaimer", LOTTERY_DISCLAIMER);
}

function getDisplayModeEntries() {
  const orderedKeys = [...MODE_DISPLAY_ORDER, ...Object.keys(MODES).filter((key) => !MODE_DISPLAY_ORDER.includes(key))];

  return orderedKeys.map((key) => [key, MODES[key]]).filter(([, mode]) => mode);
}

function randomInt(max) {
  if (max <= 0) {
    return 0;
  }

  const cryptoApi = window.crypto || window.msCrypto;

  if (cryptoApi?.getRandomValues) {
    const values = new Uint32Array(1);
    cryptoApi.getRandomValues(values);
    return values[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function choose(items) {
  if (!items.length) {
    return null;
  }

  return items[randomInt(items.length)];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatBudget(budget) {
  if (!budget || state.currency === "MYR") {
    return budget;
  }

  const currency = CURRENCY_RATES[state.currency] || CURRENCY_RATES.MYR;

  return budget.replace(/RM\s*([\d,]+)(?:-([\d,]+))?(\+)?/g, (match, firstValue, secondValue, plusSign) => {
    const first = convertAmount(firstValue, currency);

    if (!secondValue) {
      return `≈ ${currency.label} ${first}${plusSign || ""}`;
    }

    const second = convertAmount(secondValue, currency);
    return `≈ ${currency.label} ${first}-${second}${plusSign || ""}`;
  });
}

function convertAmount(value, currency) {
  const amount = Number(String(value).replaceAll(",", ""));
  const converted = amount * currency.perMYR;

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: currency.decimals,
    minimumFractionDigits: currency.decimals,
  }).format(converted);
}

function parseCustomOptions() {
  return state.customText
    .split(/[\n,，、;；|]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((title) => ({
      title,
      meta: "自定义",
      budget: "按你的实际情况",
    }));
}

function formatDateLabel() {
  const formatter = new Intl.DateTimeFormat(normalizeLanguage(state.language), {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  elements.todayLabel.textContent = formatter.format(new Date());
}

function applyStaticTranslations() {
  document.documentElement.lang = normalizeLanguage(state.language);
  document.title = t("app.title", "随心转盘｜随机选择应用");
  elements.appRefreshButton.setAttribute("aria-label", t("top.refresh", "刷新随心转盘"));
  elements.appRefreshButton.title = t("top.refresh", "刷新随心转盘");
  elements.brandTitle.textContent = t("app.name", "随心转盘");
  elements.brandSubtitle.textContent = t("app.tagline", "把选择困难交给一点点随机");
  elements.currencyLabel.textContent = t("top.currency", "货币");
  elements.notificationButton.setAttribute("aria-label", t("top.notification", "通知"));
  elements.profileAvatarButton.setAttribute("aria-label", t("top.profile", "个人资料"));
  elements.moreMenuButton.setAttribute("aria-label", t("top.more", "更多"));
  elements.moreMenuButtonLabel.textContent = t("top.more", "更多");
  elements.randomButtonLabel.textContent = t("actions.random", "随机决定");
  elements.favoriteButton.textContent = t("actions.favorite", "收藏结果");
  elements.worldChannelTitle.textContent = t("world.title", "世界频道");
  elements.worldChannelSubtitle.textContent = t("world.subtitle", "打开独立聊天窗口");
  elements.notificationPanel.setAttribute("aria-label", t("top.notification", "通知"));
  elements.profilePanel.setAttribute("aria-label", t("top.profile", "个人资料"));
  elements.moreMenuPanel.setAttribute("aria-label", t("menu.more", "更多菜单"));
}

function renderModes() {
  elements.modeList.innerHTML = getDisplayModeEntries()
    .map(([key, mode]) => {
      const activeClass = key === state.mode ? " is-active" : "";
      return `
        <button class="mode-button${activeClass}" type="button" data-mode="${key}" aria-pressed="${key === state.mode}">
          <span class="mode-icon">${mode.icon}</span>
          <span class="mode-copy">
            <strong>${getModeText(key, "title")}</strong>
            <small>${getModeText(key, "short")}</small>
          </span>
        </button>
      `;
    })
    .join("");

  elements.modeList.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => switchMode(button.dataset.mode));
  });

  elements.modeMenuLabel.textContent = getModeTitle(state.mode);
  elements.worldChannelButton.classList.toggle("is-active", state.worldOpen);
  elements.worldChannelButton.setAttribute("aria-pressed", String(state.worldOpen));
  elements.worldChannelButton.onclick = toggleWorldChat;
}

function switchMode(mode) {
  if (!MODES[mode]) {
    return;
  }

  state.mode = mode;
  state.currentResult = null;
  elements.sidebar.classList.remove("is-menu-open");
  elements.modeMenuToggle.setAttribute("aria-expanded", "false");
  saveState();
  render();
  showToast(`已切换到「${getModeTitle(mode)}」`);
}

function render() {
  elements.currencySelect.value = state.currency;
  applyStaticTranslations();
  formatDateLabel();
  elements.actionRow.hidden = false;
  elements.previewPanel.hidden = false;
  elements.worldChatPanel.hidden = !state.worldOpen;
  elements.modeTitle.textContent = getModeText(state.mode, "title");
  elements.modeDescription.textContent = getModeText(state.mode, "description");
  elements.controlHint.textContent = getModeText(state.mode, "hint");
  elements.resultLabel.textContent = getModeText(state.mode, "label");
  elements.numberDigits.hidden = true;

  renderModes();
  renderModeStage();
  renderControls();
  renderPreview();
  renderWorldChannel();
  renderWorldControls();
  renderHistory();
  renderFavorites();
  renderTopUserTools();
}

function renderTopUserTools() {
  const currentUser = getCurrentUser();

  if (currentUser) {
    elements.profileAvatarButton.hidden = false;
    elements.profileAvatarButton.innerHTML = renderAvatarContent({
      avatar: getUserAvatar(currentUser),
      avatarUrl: getUserAvatarUrl(currentUser),
      name: getUserDisplayName(currentUser),
      className: "profile-avatar-image",
    });
    elements.profileAvatarButton.setAttribute("aria-label", `${t("top.profile", "个人资料")}：${getUserDisplayName(currentUser)}`);
    elements.profileAvatarButton.setAttribute("aria-expanded", String(isProfilePanelOpen));
  } else {
    elements.profileAvatarButton.hidden = true;
    elements.profileAvatarButton.innerHTML = "";
    isProfilePanelOpen = false;
  }

  elements.profilePanel.hidden = !isProfilePanelOpen || !currentUser;
  elements.notificationButton.setAttribute("aria-expanded", String(isNotificationPanelOpen));
  elements.notificationPanel.hidden = !isNotificationPanelOpen;
  elements.moreMenuButton.setAttribute("aria-expanded", String(isMoreMenuOpen));
  elements.moreMenuPanel.hidden = !isMoreMenuOpen;

  const unreadCount = APP_NOTIFICATIONS.filter((item) => !state.notificationReadIds.includes(item.id)).length;
  elements.notificationBadge.hidden = unreadCount === 0;
  elements.notificationBadge.textContent = String(unreadCount);

  renderNotificationPanel();
  renderProfilePanel();
  renderMoreMenuPanel();
}

function renderNotificationPanel() {
  if (elements.notificationPanel.hidden) {
    return;
  }

  elements.notificationPanel.innerHTML = `
    <div class="floating-panel-header">
        <div>
          <strong>${escapeHtml(t("top.notification", "通知"))}</strong>
          <small>简短通知和更新摘要</small>
        </div>
      <button class="ghost-button compact-ghost" id="notificationCloseButton" type="button">${escapeHtml(t("actions.close", "关闭"))}</button>
    </div>
    <div class="notification-list">
      ${APP_NOTIFICATIONS.map((item) => `
        <article class="notification-item">
          <div class="notification-item-title">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.type || "更新")}</span>
          </div>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `).join("")}
    </div>
  `;

  document.querySelector("#notificationCloseButton").addEventListener("click", closeNotificationPanel);
}

function renderProfilePanel() {
  const currentUser = getCurrentUser();

  if (elements.profilePanel.hidden || !currentUser) {
    return;
  }

  elements.profilePanel.innerHTML = `
    <form class="profile-form" id="profileForm">
      <div class="floating-panel-header">
        <div>
          <strong>${escapeHtml(t("top.profile", "个人资料"))}</strong>
          <small>换头像、改名字或密码</small>
        </div>
        <button class="ghost-button compact-ghost" id="profileCloseButton" type="button">${escapeHtml(t("actions.close", "关闭"))}</button>
      </div>
      <div class="profile-preview-row">
        <span class="world-avatar profile-preview-avatar" id="profilePreviewAvatar" aria-hidden="true">
          ${renderAvatarContent({
            avatar: getUserAvatar(currentUser),
            avatarUrl: getUserAvatarUrl(currentUser),
            name: getUserDisplayName(currentUser),
            className: "profile-preview-image",
          })}
        </span>
        <div>
          <strong id="profilePreviewName">${escapeHtml(getUserDisplayName(currentUser))}</strong>
          <small>右上角会显示这个头像</small>
        </div>
      </div>
      <div class="field">
        <label for="profileAvatarFile">头像图片</label>
        <label class="profile-image-picker" for="profileAvatarFile">
          <input id="profileAvatarFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
          选择图片头像
        </label>
        <small class="field-hint" id="profileAvatarStatus">可选 PNG / JPG / WebP / GIF，最大 2.5MB。</small>
      </div>
      <div class="field">
        <label for="profileAvatarInput">文字头像</label>
        <input id="profileAvatarInput" maxlength="2" value="${escapeHtml(getUserAvatar(currentUser))}" placeholder="不放图片时显示这个" />
      </div>
      <div class="field">
        <label for="profileNameInput">显示名字</label>
        <input id="profileNameInput" maxlength="20" value="${escapeHtml(getUserDisplayName(currentUser))}" placeholder="别人看到的名字" />
      </div>
      <div class="field">
        <label for="profileCurrentPassword">现在的密码</label>
        <input id="profileCurrentPassword" type="password" autocomplete="current-password" placeholder="要改密码时才需要填" />
      </div>
      <div class="field">
        <label for="profileNewPassword">新密码</label>
        <input id="profileNewPassword" type="password" autocomplete="new-password" placeholder="不改密码就留空" />
      </div>
      <div class="field">
        <label for="profileConfirmPassword">确认新密码</label>
        <input id="profileConfirmPassword" type="password" autocomplete="new-password" placeholder="再输入一次新密码" />
      </div>
      <div class="profile-form-actions">
        <button class="primary-button compact-primary" type="submit">保存资料</button>
        <button class="secondary-button profile-logout-button" id="profileLogoutButton" type="button">登出账号</button>
      </div>
    </form>
  `;

  const avatarInput = document.querySelector("#profileAvatarInput");
  const avatarFileInput = document.querySelector("#profileAvatarFile");
  const nameInput = document.querySelector("#profileNameInput");

  avatarInput.addEventListener("input", updateProfilePreview);
  avatarFileInput.addEventListener("change", prepareProfileAvatarImage);
  nameInput.addEventListener("input", updateProfilePreview);
  document.querySelector("#profileCloseButton").addEventListener("click", closeProfilePanel);
  document.querySelector("#profileLogoutButton").addEventListener("click", () => {
    closeProfilePanel();
    logoutUser();
  });
  document.querySelector("#profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveProfileChanges();
  });
}

function renderMoreMenuPanel() {
  if (elements.moreMenuPanel.hidden) {
    return;
  }

  elements.moreMenuPanel.innerHTML = `
    <div class="more-menu-list" role="menu" aria-label="${escapeHtml(t("menu.more", "更多操作"))}">
      <button class="more-menu-item" id="menuClearHistoryButton" type="button" role="menuitem">
        <strong>${escapeHtml(t("actions.clearHistory", "清空记录"))}</strong>
        <small>${escapeHtml(t("menu.clearHistory.desc", "清空最近决定和收藏"))}</small>
      </button>
      <button class="more-menu-item" type="button" role="menuitem" disabled>
        <strong>${escapeHtml(t("menu.settings", "设置"))}</strong>
        <small>${escapeHtml(t("menu.future", "未来预留"))}</small>
      </button>
      <label class="more-menu-language" for="languageSelect">
        <span>
          <strong>${escapeHtml(t("menu.language", "语言"))}</strong>
          <small>${escapeHtml(t("menu.future", "未来预留"))}</small>
        </span>
        <select id="languageSelect" aria-label="${escapeHtml(t("menu.language", "语言"))}">
          ${SUPPORTED_LANGUAGES.map((language) => `
            <option value="${language}" ${language === state.language ? "selected" : ""}>${LANGUAGE_LABELS[language]}</option>
          `).join("")}
        </select>
      </label>
    </div>
  `;

  document.querySelector("#menuClearHistoryButton").addEventListener("click", () => {
    closeMoreMenu();
    clearHistory();
  });
  document.querySelector("#languageSelect").addEventListener("change", (event) => changeLanguage(event.target.value));
}

function renderModeStage() {
  if (!state.currentResult || state.currentResult.mode !== state.mode) {
    elements.resultValue.textContent = "按下按钮，让今天轻一点";
    elements.resultMeta.textContent = "你可以先选模式，也可以直接随机。";
    elements.numberDigits.classList.remove("is-lottery");
    elements.numberDigits.hidden = true;
    elements.numberDigits.innerHTML = "";
    updateResultActionButtons(null);
    return;
  }

  updateResultActionButtons(state.currentResult);
}

function renderControls() {
  if (state.mode === "food") {
    renderFoodControls();
    return;
  }

  if (state.mode === "drink") {
    renderDrinkControls();
    return;
  }

  if (state.mode === "travel") {
    renderTravelControls();
    return;
  }

  if (state.mode === "number") {
    renderNumberControls();
    return;
  }

  if (state.mode === "shopping") {
    renderShoppingControls();
    return;
  }

  renderCustomControls();
}

function renderFoodControls() {
  const countries = Object.keys(FOOD_DATA);
  const currentCountry = FOOD_DATA[state.food.country] ? state.food.country : countries[0];
  const regions = Object.keys(FOOD_DATA[currentCountry]).filter((region) => !SPECIAL_REGION_KEYS.has(region));
  const currentRegion = regions.includes(state.food.region) ? state.food.region : regions[0];
  const currentCategory = FOOD_CATEGORIES.includes(state.food.category) ? state.food.category : "全部";

  state.food.country = currentCountry;
  state.food.region = currentRegion;
  state.food.category = currentCategory;

  elements.modeControls.innerHTML = `
    <div class="field">
      <label for="countrySelect">国家</label>
      <select id="countrySelect">
        ${countries.map((country) => `<option value="${country}" ${country === currentCountry ? "selected" : ""}>${country}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="regionSelect">地区</label>
      <select id="regionSelect">
        ${regions.map((region) => `<option value="${region}" ${region === currentRegion ? "selected" : ""}>${region}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="foodCategory">食物种类</label>
      <select id="foodCategory">
        ${FOOD_CATEGORIES.map((category) => `<option value="${category}" ${category === currentCategory ? "selected" : ""}>${category}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="foodNote">锁定用法</label>
      <input id="foodNote" value="Mamak / 快餐 / 外卖已放入食物种类" readonly />
    </div>
  `;

  document.querySelector("#countrySelect").addEventListener("change", (event) => {
    state.food.country = event.target.value;
    state.food.region = Object.keys(FOOD_DATA[state.food.country]).find((region) => !SPECIAL_REGION_KEYS.has(region));
    saveState();
    renderControls();
    renderPreview();
  });

  document.querySelector("#regionSelect").addEventListener("change", (event) => {
    state.food.region = event.target.value;
    saveState();
    renderPreview();
  });

  document.querySelector("#foodCategory").addEventListener("change", (event) => {
    state.food.category = event.target.value;
    saveState();
    renderPreview();
  });
}

function renderDrinkControls() {
  const countries = Object.keys(DRINK_MENU_DATA);
  const currentCountry = DRINK_MENU_DATA[state.drink.country] ? state.drink.country : countries[0];
  const brands = ["全部", ...getDrinkBrands(currentCountry)];
  const currentBrand = brands.includes(state.drink.brand) ? state.drink.brand : "全部";
  const currentCategory = DRINK_CATEGORIES.includes(state.drink.category) ? state.drink.category : "全部";

  state.drink.country = currentCountry;
  state.drink.brand = currentBrand;
  state.drink.category = currentCategory;

  elements.modeControls.innerHTML = `
    <div class="field">
      <label for="drinkCountry">国家</label>
      <select id="drinkCountry">
        ${countries.map((country) => `<option value="${country}" ${country === currentCountry ? "selected" : ""}>${country}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="drinkBrand">品牌 / 店铺</label>
      <select id="drinkBrand">
        ${brands.map((brand) => `<option value="${brand}" ${brand === currentBrand ? "selected" : ""}>${brand}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="drinkCategory">饮料类型</label>
      <select id="drinkCategory">
        ${DRINK_CATEGORIES.map((category) => `<option value="${category}" ${category === currentCategory ? "selected" : ""}>${category}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="drinkNote">菜单说明</label>
      <input id="drinkNote" value="参考外卖平台常见店铺，点候选可锁定" readonly />
    </div>
  `;

  document.querySelector("#drinkCountry").addEventListener("change", (event) => {
    state.drink.country = event.target.value;
    state.drink.brand = "全部";
    saveState();
    renderControls();
    renderPreview();
  });

  document.querySelector("#drinkBrand").addEventListener("change", (event) => {
    state.drink.brand = event.target.value;
    saveState();
    renderPreview();
  });

  document.querySelector("#drinkCategory").addEventListener("change", (event) => {
    state.drink.category = event.target.value;
    saveState();
    renderPreview();
  });
}

function renderWorldControls() {
  const currentUser = getCurrentUser();
  const isRegisterMode = authMode === "register";

  if (!currentUser) {
    elements.worldAuthPanel.innerHTML = `
      <form class="world-panel auth-panel" id="authForm">
        <div class="world-panel-header">
          <strong>${isRegisterMode ? "注册新账号" : "登入世界频道"}</strong>
          <small>发消息前先确认是你本人</small>
        </div>
        <div class="auth-mode-tabs" role="tablist" aria-label="登入注册切换">
          <button class="auth-mode-tab${!isRegisterMode ? " is-active" : ""}" type="button" data-auth-mode="login" aria-pressed="${!isRegisterMode}">登入</button>
          <button class="auth-mode-tab${isRegisterMode ? " is-active" : ""}" type="button" data-auth-mode="register" aria-pressed="${isRegisterMode}">注册</button>
        </div>
        <div class="field">
          <label for="authUsername">用户名</label>
          <input id="authUsername" autocomplete="username" maxlength="20" placeholder="2-20 字，例如 limke" />
          <small class="field-hint">可用中文、英文、数字、_ 和 -。</small>
        </div>
        <div class="field">
          <label for="authPassword">密码</label>
          <input id="authPassword" type="password" autocomplete="${isRegisterMode ? "new-password" : "current-password"}" maxlength="80" placeholder="至少 6 个字符" />
          <small class="field-hint">账号会保存在云端；请不要使用银行卡、邮箱等重要密码。</small>
        </div>
        ${isRegisterMode ? `
          <div class="field">
            <label for="authConfirmPassword">确认密码</label>
            <input id="authConfirmPassword" type="password" autocomplete="new-password" maxlength="40" placeholder="再输入一次密码" />
          </div>
        ` : ""}
        <div class="custom-actions">
          <button class="primary-button compact-primary" id="authSubmitButton" type="submit">${isRegisterMode ? "创建账号" : "登入"}</button>
          <button class="secondary-button" id="authSwitchButton" type="button">${isRegisterMode ? "已有账号？去登入" : "没有账号？去注册"}</button>
        </div>
        <ul class="auth-hint-list">
          <li>登入后可以发文字和图片；图片会先预览，点发送才发出。</li>
          <li>账号、头像、名字和世界频道会同步到云端。</li>
        </ul>
      </form>
      <div class="world-panel gcs-panel is-ready">
        <div class="world-panel-header">
          <strong>图片和记录</strong>
          <small>已准备好</small>
        </div>
        <div class="cloud-status-list">
          <span class="status-pill">✅ 图片可以发送</span>
          <span class="status-pill">✅ 世界频道已接到云端</span>
          <span class="status-pill" data-cloud-sync-status>${escapeHtml(getCloudSyncLabel())}</span>
          <span class="status-pill">🔒 重要钥匙不会显示给别人</span>
        </div>
        <p>这个版本先测试图片、记录和通知；好友和私聊会放在之后做。</p>
      </div>
    `;

    document.querySelectorAll("[data-auth-mode]").forEach((button) => {
      button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
    });
    document.querySelector("#authSwitchButton").addEventListener("click", () => setAuthMode(isRegisterMode ? "login" : "register"));
    document.querySelector("#authForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (authMode === "register") {
        registerUser();
        return;
      }

      loginUser();
    });
    return;
  }

  elements.worldAuthPanel.innerHTML = `
    <div class="world-panel identity-panel">
      <div class="world-identity-card">
        <span class="world-avatar world-identity-avatar" aria-hidden="true">
          ${renderAvatarContent({
            avatar: getUserAvatar(currentUser),
            avatarUrl: getUserAvatarUrl(currentUser),
            name: getUserDisplayName(currentUser),
            className: "world-avatar-image",
          })}
        </span>
        <div class="world-identity-copy">
          <strong>${escapeHtml(getUserDisplayName(currentUser))}</strong>
          <small data-cloud-sync-identity>${escapeHtml(getCloudIdentityText())}</small>
        </div>
      </div>
    </div>
    <form class="world-panel message-panel" id="worldMessageForm">
      <div class="field">
        <label for="worldMessageInput">发送到世界频道</label>
        <textarea id="worldMessageInput" maxlength="220" placeholder="写一句话，最多 220 字。"></textarea>
      </div>
      <div class="custom-actions">
        <button class="primary-button compact-primary" id="worldSendButton" type="submit">发送消息</button>
        <label class="image-upload-button">
          <input id="worldImageInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
          选择图片
        </label>
      </div>
      <div class="pending-image-preview" id="worldPendingImage" hidden>
        <img id="worldPendingImageThumb" alt="待发送图片缩略图" />
        <div>
          <strong id="worldPendingImageName"></strong>
          <small>图片已选择，点「发送消息」才会发出。</small>
        </div>
        <button class="ghost-button compact-ghost" id="clearWorldImageButton" type="button">移除</button>
      </div>
      <small class="upload-status" id="worldUploadStatus">选择图片后会先预览；点发送才上传。支持 PNG / JPG / WebP / GIF，最大 2.5MB。</small>
    </form>
  `;

  document.querySelector("#worldMessageForm").addEventListener("submit", (event) => {
    event.preventDefault();
    sendWorldMessage();
  });
  document.querySelector("#worldImageInput").addEventListener("change", prepareWorldImage);
  document.querySelector("#clearWorldImageButton").addEventListener("click", () => clearPendingWorldImage());
  updatePendingImagePreview();
}

function renderTravelControls() {
  const countryOptions = TRAVEL_COUNTRIES.includes(state.travel.country) ? TRAVEL_COUNTRIES : ["全部", ...TRAVEL_COUNTRIES];
  const currentCountry = countryOptions.includes(state.travel.country) ? state.travel.country : "全部";
  const currentActivity = TRAVEL_ACTIVITIES.includes(state.travel.activity) ? state.travel.activity : "全部";
  state.travel.country = currentCountry;
  state.travel.activity = currentActivity;

  elements.modeControls.innerHTML = `
    <div class="field travel-country-field">
      <label for="travelCountry">想去国家</label>
      <select id="travelCountry">
        ${countryOptions.map((country) => `<option value="${country}" ${country === currentCountry ? "selected" : ""}>${country}</option>`).join("")}
      </select>
      <div class="travel-chip-row" aria-label="热门国家快捷按钮">
        ${countryOptions.slice(0, 18).map((country) => `<button class="travel-filter-chip${country === currentCountry ? " is-active" : ""}" type="button" data-travel-country="${country}">${country}</button>`).join("")}
      </div>
    </div>
    <div class="field">
      <label for="travelMood">旅行心情</label>
      <select id="travelMood">
        ${TRAVEL_MOODS.map((mood) => `<option value="${mood}" ${mood === state.travel.mood ? "selected" : ""}>${mood}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="travelActivity">想要活动</label>
      <select id="travelActivity">
        ${TRAVEL_ACTIVITIES.map((activity) => `<option value="${activity}" ${activity === currentActivity ? "selected" : ""}>${activity}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="travelLevel">消费等级</label>
      <select id="travelLevel">
        ${TRAVEL_LEVELS.map((level) => `<option value="${level}" ${level === state.travel.level ? "selected" : ""}>${level}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="travelTransport">出行方式</label>
      <select id="travelTransport">
        ${TRAVEL_TRANSPORTS.map((transport) => `<option value="${transport}" ${transport === state.travel.transport ? "selected" : ""}>${transport}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="travelNote">朋友提案</label>
      <input id="travelNote" value="全球精选地点 + 国家/活动筛选；点候选可锁定朋友提案" readonly />
    </div>
  `;

  document.querySelector("#travelCountry").addEventListener("change", (event) => {
    state.travel.country = event.target.value;
    saveState();
    renderControls();
    renderPreview();
  });

  document.querySelectorAll("[data-travel-country]").forEach((button) => {
    button.addEventListener("click", () => {
      state.travel.country = button.dataset.travelCountry;
      saveState();
      renderControls();
      renderPreview();
    });
  });

  document.querySelector("#travelMood").addEventListener("change", (event) => {
    state.travel.mood = event.target.value;
    saveState();
    renderPreview();
  });

  document.querySelector("#travelActivity").addEventListener("change", (event) => {
    state.travel.activity = event.target.value;
    saveState();
    renderPreview();
  });

  document.querySelector("#travelLevel").addEventListener("change", (event) => {
    state.travel.level = event.target.value;
    saveState();
    renderPreview();
  });

  document.querySelector("#travelTransport").addEventListener("change", (event) => {
    state.travel.transport = event.target.value;
    saveState();
    renderPreview();
  });
}

function renderNumberControls() {
  const currentCountry = LOTTERY_COUNTRIES.includes(state.number.country) ? state.number.country : "马来西亚";
  const games = getLotteryGamesForCountry(currentCountry);
  const currentGame = games.find((game) => game.id === state.number.gameId) || games[0] || LOTTERY_DATA[0];
  const currentLines = normalizeLotteryLines(state.number.lines);

  state.number.country = currentCountry;
  state.number.gameId = currentGame.id;
  state.number.lines = currentLines;

  elements.modeControls.innerHTML = `
    <div class="field">
      <label for="lotteryCountry">国家 / 地区</label>
      <select id="lotteryCountry">
        ${LOTTERY_COUNTRIES.map((country) => `<option value="${escapeHtml(country)}" ${country === currentCountry ? "selected" : ""}>${escapeHtml(country)}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="lotteryGame">号码玩法</label>
      <select id="lotteryGame">
        ${games.map((game) => `<option value="${escapeHtml(game.id)}" ${game.id === currentGame.id ? "selected" : ""}>${escapeHtml(game.country)} · ${escapeHtml(game.name)}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="lotteryLines">生成注数</label>
      <select id="lotteryLines">
        ${LOTTERY_LINE_OPTIONS.map((lineCount) => `<option value="${lineCount}" ${lineCount === currentLines ? "selected" : ""}>${lineCount} 组号码</option>`).join("")}
      </select>
    </div>
    <div class="number-rule-card">
      <strong>${escapeHtml(currentGame.name)}</strong>
      <p>${escapeHtml(currentGame.summary)}</p>
      <small>${escapeHtml(getLotteryDisclaimer())} ${LOTTERY_SOURCE_NOTE}</small>
    </div>
    <label class="toggle-field">
      <input id="allowRepeat" type="checkbox" ${state.number.allowRepeat ? "checked" : ""} />
      数字型玩法允许重复数字
    </label>
    <label class="toggle-field">
      <input id="avoidFour" type="checkbox" ${state.number.avoidFour ? "checked" : ""} />
      尽量避开数字 4
    </label>
  `;

  document.querySelector("#lotteryCountry").addEventListener("change", (event) => {
    state.number.country = event.target.value;
    state.number.gameId = getLotteryGamesForCountry(state.number.country)[0]?.id || LOTTERY_DATA[0].id;
    saveState();
    renderControls();
    renderPreview();
  });

  document.querySelector("#lotteryGame").addEventListener("change", (event) => {
    state.number.gameId = event.target.value;
    saveState();
    renderControls();
    renderPreview();
  });

  document.querySelector("#lotteryLines").addEventListener("change", (event) => {
    state.number.lines = normalizeLotteryLines(event.target.value);
    saveState();
    renderPreview();
  });

  document.querySelector("#allowRepeat").addEventListener("change", (event) => {
    state.number.allowRepeat = event.target.checked;
    saveState();
    renderControls();
    renderPreview();
  });

  document.querySelector("#avoidFour").addEventListener("change", (event) => {
    state.number.avoidFour = event.target.checked;
    saveState();
    renderControls();
    renderPreview();
  });
}

function getShoppingRootNode(categoryId) {
  return SHOPPING_CATEGORY_TREE.find((category) => category.id === categoryId) || SHOPPING_CATEGORY_TREE[0];
}

function getShoppingChildren(rootNode) {
  const children = Array.isArray(rootNode?.children) ? rootNode.children : [];
  return children.length ? children : [{ id: "all", label: "全部" }];
}

function getShoppingChildNode(rootNode, childId) {
  const children = getShoppingChildren(rootNode);
  return children.find((child) => child.id === childId) || children[0];
}

function getShoppingCategoryPath(categoryId = state.shopping.categoryId, subcategoryId = state.shopping.subcategoryId) {
  const rootNode = getShoppingRootNode(categoryId);
  const childNode = getShoppingChildNode(rootNode, subcategoryId);

  if (rootNode.id === "all" || childNode.label === "全部") {
    return rootNode.label;
  }

  return `${rootNode.label} / ${childNode.label}`;
}

function getShoppingSourceCategories() {
  const rootNode = getShoppingRootNode(state.shopping.categoryId);

  if (rootNode.id === "all") {
    return Object.keys(SHOPPING_DATA);
  }

  return SHOPPING_CATEGORY_SOURCE_MAP[rootNode.id] || Object.keys(SHOPPING_DATA);
}

function getShoppingItemMindsets(item) {
  const text = `${item.title} ${item.category} ${item.subcategory} ${item.level} ${item.budget} ${item.tags.join(" ")} ${item.reason} ${item.priority}`;
  const mindsets = new Set();

  if (/(补货|日用品|清洁|洗衣|纸巾|牙|保险|安全|保护|需要|备用|通勤|健康|睡眠|维修|轮胎|车险)/i.test(text)) {
    mindsets.add("真的需要");
  }

  if (/(升级|高端|旗舰|性能|4K|电竞|NAS|镜头|相机|电脑|笔电|手机|平板|耳机|显示器|电脑表|Wi-Fi 7)/i.test(text)) {
    mindsets.add("升级装备");
  }

  if (/(礼物|奖励|香水|珠宝|名牌|奢侈|包|腕表|音响|体验|演唱会|收藏|氛围|游戏|甜点|花束)/i.test(text)) {
    mindsets.add("奖励自己");
  }

  if (/(先别买|想清楚|比价|愿望清单|24 小时|理性|收藏|预算|高消费|奢侈品)/i.test(text)) {
    mindsets.add("先收藏不买");
  }

  if (/(工作|办公|学习|开发|代码|服务器|域名|会议|打印|桌面|效率|课程|笔记|记账|ChatGPT|Copilot|设计软件|剪辑软件)/i.test(text)) {
    mindsets.add("工作需要");
  }

  if (/(旅行|户外|露营|潜水|浮潜|防水|行李|登山|徒步|转换插头|VPN|车载|自行车|滑板车|交通|汽车|GoPro)/i.test(text)) {
    mindsets.add("旅行需要");
  }

  if (item.level === "低消费" || /(小物|低消费|RM0|RM8|RM10|RM15|RM20|RM25|RM30|便宜|数据线|手机壳|清洁布|洗衣袋|水杯|拖鞋|雨伞)/i.test(text)) {
    mindsets.add("便宜小物");
  }

  if (/(长期|耐用|投资|保值|人体工学|办公椅|洗衣机|冰箱|空调|相机|镜头|电脑|笔电|NAS|腕表|珠宝|车|保险|家电)/i.test(text)) {
    mindsets.add("长期投资");
  }

  return [...mindsets];
}

function getShoppingSubcategoryLabels(childNode) {
  return [
    childNode.label,
    ...(SHOPPING_SUBCATEGORY_ALIAS_MAP[childNode.id] || []),
  ].filter(Boolean);
}

function matchesShoppingSubcategory(item, childNode) {
  const labels = getShoppingSubcategoryLabels(childNode);

  return labels.some((label) =>
    item.subcategory === label
    || item.tags.includes(label)
    || item.title.includes(label),
  );
}

function getFilteredShoppingItems() {
  const sourceCategories = getShoppingSourceCategories();
  const categoryPath = getShoppingCategoryPath();
  const rootNode = getShoppingRootNode(state.shopping.categoryId);
  const childNode = getShoppingChildNode(rootNode, state.shopping.subcategoryId);
  const items = sourceCategories.flatMap((category) =>
    (SHOPPING_DATA[category] || []).map((item) => {
      const normalizedItem = normalizeShoppingSuggestion(item, category);
      const itemCategoryPath = state.shopping.categoryId === "all"
        ? `${normalizedItem.category} / ${normalizedItem.subcategory}`
        : categoryPath;

      return {
        ...normalizedItem,
        categoryPath: itemCategoryPath,
        sourceCategory: category,
      };
    }),
  );
  const subcategoryItems = childNode.label === "全部"
    ? items
    : items.filter((item) => matchesShoppingSubcategory(item, childNode));
  const mindsetItems = state.shopping.mindset === "全部"
    ? subcategoryItems
    : subcategoryItems.filter((item) => getShoppingItemMindsets(item).includes(state.shopping.mindset));

  if (state.shopping.level === "全部") {
    return mindsetItems;
  }

  return mindsetItems.filter((item) => item.level === state.shopping.level);
}

function renderShoppingControls() {
  const currentRoot = getShoppingRootNode(state.shopping.categoryId);
  const children = getShoppingChildren(currentRoot);
  const currentChild = getShoppingChildNode(currentRoot, state.shopping.subcategoryId);
  const currentLevel = SHOPPING_LEVELS.includes(state.shopping.level) ? state.shopping.level : "全部";
  const currentMindset = SHOPPING_MINDSETS.includes(state.shopping.mindset) ? state.shopping.mindset : "全部";

  state.shopping.categoryId = currentRoot.id;
  state.shopping.subcategoryId = currentChild.id;
  state.shopping.category = getShoppingCategoryPath(currentRoot.id, currentChild.id);
  state.shopping.level = currentLevel;
  state.shopping.mindset = currentMindset;

  elements.modeControls.innerHTML = `
    <div class="field shopping-filter-field">
      <label for="shoppingRootCategory">一级分类</label>
      <select id="shoppingRootCategory">
        ${SHOPPING_CATEGORY_TREE.map((category) => `<option value="${escapeHtml(category.id)}" ${category.id === currentRoot.id ? "selected" : ""}>${escapeHtml(category.label)}</option>`).join("")}
      </select>
    </div>
    <div class="field shopping-filter-field">
      <label for="shoppingSubcategory">二级分类</label>
      <select id="shoppingSubcategory" ${currentRoot.id === "all" ? "disabled" : ""}>
        ${children.map((child) => `<option value="${escapeHtml(child.id)}" ${child.id === currentChild.id ? "selected" : ""}>${escapeHtml(child.label)}</option>`).join("")}
      </select>
    </div>
    <div class="field shopping-filter-field">
      <label for="shoppingLevel">消费等级</label>
      <select id="shoppingLevel">
        ${SHOPPING_LEVELS.map((level) => `<option value="${level}" ${level === currentLevel ? "selected" : ""}>${level}</option>`).join("")}
      </select>
    </div>
    <div class="field shopping-filter-field">
      <label for="shoppingMindset">购买心态</label>
      <select id="shoppingMindset">
        ${SHOPPING_MINDSETS.map((mindset) => `<option value="${mindset}" ${mindset === currentMindset ? "selected" : ""}>${mindset}</option>`).join("")}
      </select>
    </div>
  `;

  document.querySelector("#shoppingRootCategory").addEventListener("change", (event) => {
    const nextRoot = getShoppingRootNode(event.target.value);

    state.shopping.categoryId = nextRoot.id;
    state.shopping.subcategoryId = getShoppingChildren(nextRoot)[0].id;
    state.shopping.category = getShoppingCategoryPath(state.shopping.categoryId, state.shopping.subcategoryId);
    saveState();
    renderControls();
    renderPreview();
  });

  document.querySelector("#shoppingSubcategory").addEventListener("change", (event) => {
    state.shopping.subcategoryId = event.target.value;
    state.shopping.category = getShoppingCategoryPath(state.shopping.categoryId, state.shopping.subcategoryId);
    saveState();
    renderPreview();
  });

  document.querySelector("#shoppingLevel").addEventListener("change", (event) => {
    state.shopping.level = event.target.value;
    saveState();
    renderPreview();
  });

  document.querySelector("#shoppingMindset").addEventListener("change", (event) => {
    state.shopping.mindset = event.target.value;
    saveState();
    renderPreview();
  });
}

function renderCustomControls() {
  elements.modeControls.innerHTML = `
    <div class="custom-list">
      <label for="customText">候选项</label>
      <textarea id="customText" placeholder="输入选项，用换行、逗号或顿号分开">${escapeHtml(state.customText)}</textarea>
      <div class="custom-actions">
        <button class="secondary-button" id="sampleCustomButton" type="button">填入日常示例</button>
        <button class="secondary-button" id="clearCustomButton" type="button">清空输入</button>
      </div>
    </div>
  `;

  document.querySelector("#customText").addEventListener("input", (event) => {
    state.customText = event.target.value;
    saveState();
    renderPreview();
  });

  document.querySelector("#sampleCustomButton").addEventListener("click", () => {
    state.customText = DEFAULT_CUSTOM_TEXT;
    saveState();
    renderControls();
    renderPreview();
  });

  document.querySelector("#clearCustomButton").addEventListener("click", () => {
    state.customText = "";
    saveState();
    renderControls();
    renderPreview();
  });
}

function getDrinkBrands(country) {
  return [...new Set((DRINK_MENU_DATA[country] || []).map((item) => item.brand))].sort((first, second) =>
    first.localeCompare(second),
  );
}

function getFilteredDrinks() {
  const drinks = DRINK_MENU_DATA[state.drink.country] || [];

  return drinks.filter((item) => {
    const brandMatches = state.drink.brand === "全部" || item.brand === state.drink.brand;
    const categoryMatches = state.drink.category === "全部" || item.tags.includes(state.drink.category);

    return brandMatches && categoryMatches;
  });
}

function getCurrentOptions() {
  if (state.mode === "food") {
    if (state.food.category === "Mamak") {
      return state.food.country === "马来西亚" ? MAMAK_MENU : [];
    }

    if (state.food.category === "快餐连锁") {
      return FAST_FOOD_MENU_DATA[state.food.country] || [];
    }

    if (state.food.category === "外卖平台热门") {
      return DELIVERY_MENU_DATA[state.food.country] || [];
    }

    const dishes = FOOD_DATA[state.food.country][state.food.region];

    if (state.food.category === "全部") {
      return dishes;
    }

    return dishes.filter((item) => item.tags.includes(state.food.category));
  }

  if (state.mode === "drink") {
    return getFilteredDrinks();
  }

  if (state.mode === "travel") {
    return getFilteredTravel();
  }

  if (state.mode === "number") {
    const games = getLotteryGamesForCountry(state.number.country);
    const currentGame = games.find((game) => game.id === state.number.gameId) || games[0] || LOTTERY_DATA[0];
    const chips = [
      `${currentGame.country} · ${currentGame.name}`,
      currentGame.summary,
      `${normalizeLotteryLines(state.number.lines)} 组号码`,
      getLotteryDisclaimer(),
    ];

    if (!state.number.allowRepeat) {
      chips.push("数字型不重复");
    }

    if (state.number.avoidFour) {
      chips.push("尽量避开 4");
    }

    return chips.map((title) => ({ title }));
  }

  if (state.mode === "shopping") {
    return getFilteredShoppingItems();
  }

  return parseCustomOptions();
}

function renderPreview() {
  const options = getCurrentOptions();
  const lockedOptions = getActiveLockedOptions(options);
  const totalLocked = getLockedTitles().length;

  if (LOCKABLE_MODES.has(state.mode)) {
    const lockedText = lockedOptions.length ? ` · 本轮锁定 ${lockedOptions.length} 个` : totalLocked ? ` · 已锁定 ${totalLocked} 个` : "";
    elements.previewCount.textContent = `${options.length} 个选择${lockedText}`;
  } else {
    elements.previewCount.textContent = `${options.length} 个选择`;
  }

  if (!options.length) {
    elements.optionPreview.innerHTML = `<span class="chip is-muted">当前筛选没有候选项，换个条件试试</span>`;
    return;
  }

  const previewLimit = state.mode === "shopping" ? SHOPPING_PREVIEW_LIMIT : DEFAULT_PREVIEW_LIMIT;
  const hiddenCount = Math.max(options.length - previewLimit, 0);
  const optionMarkup = options
    .slice(0, previewLimit)
    .map((item) => renderOptionChip(item))
    .join("");
  const overflowHint = hiddenCount
    ? `<span class="chip preview-overflow-chip">还有 ${hiddenCount} 个候选未显示</span>`
    : "";
  const lockHint = LOCKABLE_MODES.has(state.mode)
    ? `<span class="chip lock-note">${lockedOptions.length ? "已启用锁定随机" : "点候选可锁定"}</span>`
    : "";
  const clearLockButton = LOCKABLE_MODES.has(state.mode) && totalLocked
    ? `<button class="chip clear-locks-chip" type="button" data-clear-locks="true">清除锁定</button>`
    : "";

  elements.optionPreview.innerHTML = `${optionMarkup}${overflowHint}${lockHint}${clearLockButton}`;
}

function renderWorldChannel() {
  elements.worldChatCount.textContent = `${state.worldMessages.length} 条消息`;
  elements.worldChatList.innerHTML = `
    <div class="world-chat">
      ${state.worldMessages
        .slice(-16)
        .map(
          (message) => `
            <article class="world-message">
              <span class="world-avatar world-message-avatar" aria-hidden="true">
                ${renderAvatarContent({
                  avatar: normalizeAvatar(message.avatar, message.user),
                  avatarUrl: getMessageAvatarUrl(message),
                  name: message.user,
                  className: "world-avatar-image",
                })}
              </span>
              <div class="world-message-main">
                <div class="world-message-header">
                  <strong>${escapeHtml(message.user)}</strong>
                  <small>${escapeHtml(message.time)}</small>
                </div>
                ${getWorldMessageText(message) ? `<p>${escapeHtml(getWorldMessageText(message))}</p>` : ""}
                ${renderWorldAttachment(message.attachment)}
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function scrollWorldChatToBottom() {
  if (elements.worldChatList) {
    elements.worldChatList.scrollTop = elements.worldChatList.scrollHeight;
  }
}

function renderWorldAttachment(attachment) {
  if (!attachment || attachment.type !== "image" || !attachment.url) {
    return "";
  }

  return `
    <a class="world-image-link" href="${escapeHtml(attachment.url)}" target="_blank" rel="noreferrer">
      <img src="${escapeHtml(attachment.url)}" alt="聊天图片" loading="lazy" />
    </a>
  `;
}

function renderOptionChip(item) {
  const details = getOptionDetails(item);

  if (!LOCKABLE_MODES.has(state.mode)) {
    return `<span class="chip">${escapeHtml(item.title)}</span>`;
  }

  const locked = isLocked(item.title);
  const lockedClass = locked ? " is-locked" : "";
  const shoppingClass = state.mode === "shopping" ? " shopping-option-chip" : "";
  const lockedIcon = locked ? "🔒" : "＋";

  return `
    <button class="chip option-chip${shoppingClass}${lockedClass}" type="button" data-lock-title="${escapeHtml(item.title)}" aria-pressed="${locked}">
      <span class="chip-pin">${lockedIcon}</span>
      <span class="chip-title">${escapeHtml(item.title)}</span>
      ${renderOptionChipDetail(item, details)}
    </button>
  `;
}

function renderOptionChipDetail(item, details) {
  if (!details) {
    return "";
  }

  if (state.mode !== "shopping") {
    return `<small class="chip-detail">${escapeHtml(details)}</small>`;
  }

  const budgetText = formatBudget(item.budget);
  const tagText = item.tags.length ? item.tags.slice(0, 3).join(" / ") : "暂无标签";

  return `
    <small class="chip-detail shopping-chip-detail">
      <span class="shopping-chip-budget">${escapeHtml(budgetText)}</span>
      <span class="shopping-chip-tags">${escapeHtml(tagText)}</span>
    </small>
  `;
}

function getOptionDetails(item) {
  if (state.mode === "food") {
    return `${item.tags.slice(0, 2).join(" · ")} · ${formatBudget(item.budget)}`;
  }

  if (state.mode === "drink") {
    return `${item.brand} · ${item.tags.slice(0, 2).join(" · ")} · ${formatBudget(item.budget)}`;
  }

  if (state.mode === "travel") {
    const activities = getDestinationActivities(item).slice(0, 3).join(" · ");
    return `${item.country} · ${activities} · ${getBudgetText(item)}`;
  }

  if (state.mode === "shopping") {
    const tagText = item.tags.length ? ` · ${item.tags.slice(0, 3).join(" / ")}` : " · 暂无标签";
    return `${formatBudget(item.budget)}${tagText}`;
  }

  if (state.mode === "custom") {
    return item.meta;
  }

  return "";
}

function getFilteredTravel() {
  return GLOBAL_TRAVEL_DATA.filter((item) => {
    const countryMatches = state.travel.country === "全部" || item.country === state.travel.country;
    const moodMatches = state.travel.mood === "全部" || item.tags.includes(state.travel.mood);
    const activityMatches = state.travel.activity === "全部" || getDestinationActivities(item).includes(state.travel.activity);
    const levelMatches = state.travel.level === "全部" || item.budgets[state.travel.level];
    const transportMatches = state.travel.transport === "全部" || item.transports.includes(state.travel.transport);

    return countryMatches && moodMatches && activityMatches && levelMatches && transportMatches;
  });
}

function getDestinationActivities(item) {
  const activities = new Set(item.activities || []);
  const searchableText = `${item.title} ${item.country} ${item.note} ${item.tags.join(" ")} ${item.transports.join(" ")}`;

  if (/(潜水|diving|沉船|珊瑚|蝠鲼|鲸鲨|红海|reef)/i.test(searchableText)) {
    activities.add("潜水");
  }

  if (/(浮潜|跳岛|泻湖|珊瑚|海岛|snorkel|reef)/i.test(searchableText)) {
    activities.add("浮潜");
  }

  if (/(山|爬山|登山|高峰|火山|高原|mount|peak)/i.test(searchableText)) {
    activities.add("爬山");
  }

  if (/(徒步|步道|森林|trail|hiking|国家公园)/i.test(searchableText)) {
    activities.add("徒步");
  }

  if (/(滑雪|雪季|雪山|ski)/i.test(searchableText)) {
    activities.add("滑雪");
  }

  if (/(冲浪|surf)/i.test(searchableText)) {
    activities.add("冲浪");
  }

  if (/(露营|营地|camp)/i.test(searchableText)) {
    activities.add("露营");
  }

  if (/(温泉|hot spring)/i.test(searchableText)) {
    activities.add("温泉");
  }

  if (/(沙漠|撒哈拉|desert)/i.test(searchableText)) {
    activities.add("沙漠");
  }

  if (/(极光|aurora)/i.test(searchableText)) {
    activities.add("极光");
  }

  if (/(野生动物|safari|动物|鲸|海龟|海狮|whale)/i.test(searchableText)) {
    activities.add("野生动物");
  }

  if (/(赏鲸|鲸|whale)/i.test(searchableText)) {
    activities.add("赏鲸");
  }

  if (/(骑行|自行车|cycling|bike)/i.test(searchableText)) {
    activities.add("骑行");
  }

  if (/(皮划艇|kayak|独木舟)/i.test(searchableText)) {
    activities.add("皮划艇");
  }

  if (/(漂流|rafting)/i.test(searchableText)) {
    activities.add("漂流");
  }

  if (/(文化|寺|古城|遗址|博物馆|历史|神庙)/i.test(searchableText)) {
    activities.add("文化探索");
  }

  if (/(美食|餐厅|小吃|咖啡|夜市)/i.test(searchableText)) {
    activities.add("美食巡礼");
  }

  if (/(城市|购物|商场|地铁)/i.test(searchableText)) {
    activities.add("城市漫游");
  }

  if (/(购物|奢侈品|商场)/i.test(searchableText)) {
    activities.add("购物");
  }

  if (/(亲子|乐园|家庭)/i.test(searchableText)) {
    activities.add("亲子乐园");
  }

  if (/(摄影|日出|日落|星空|风景|景观)/i.test(searchableText)) {
    activities.add("摄影");
  }

  if (/(自驾|公路|环岛|环线|road)/i.test(searchableText)) {
    activities.add("自驾风景");
  }

  return [...activities];
}

function getResult() {
  const options = getCurrentOptions();
  const pool = getRandomPool(options);
  const poolNote = getPoolNote(options);

  if (!pool.length) {
    return null;
  }

  if (state.mode === "food") {
    const dishResult = choose(pool);
    const sourceLabel = getFoodSourceLabel();

    return {
      mode: state.mode,
      title: dishResult.title,
      meta: `${sourceLabel} · ${dishResult.tags.join(" / ")} · 预算约 ${dishResult.budget}${poolNote}`,
    };
  }

  if (state.mode === "drink") {
    const drinkResult = choose(pool);

    return {
      mode: state.mode,
      title: drinkResult.title,
      meta: `${state.drink.country} · ${drinkResult.brand} · ${drinkResult.tags.join(" / ")} · 预算约 ${drinkResult.budget}${poolNote}`,
    };
  }

  if (state.mode === "travel") {
    const travelResult = choose(pool);
    const budgetText = getBudgetText(travelResult, false);
    const activityText = getDestinationActivities(travelResult).slice(0, 3).join(" / ");

    return {
      mode: state.mode,
      title: travelResult.title,
      meta: `${travelResult.country} · ${travelResult.days} 天 · ${activityText} · ${state.travel.transport === "全部" ? travelResult.transports[0] : state.travel.transport} · 预算约 ${budgetText}/人${poolNote}。${travelResult.note}`,
    };
  }

  if (state.mode === "number") {
    const game = getCurrentLotteryGame();
    const lines = Array.from({ length: normalizeLotteryLines(state.number.lines) }, () => generateLotteryLine(game));

    return {
      mode: state.mode,
      title: `${game.country} · ${game.name}`,
      meta: buildNumberMeta(game, lines),
      lotteryGameId: game.id,
      lotteryLines: lines,
    };
  }

  if (state.mode === "shopping") {
    const shoppingResult = choose(pool);

    return {
      mode: state.mode,
      title: shoppingResult.title,
      meta: buildShoppingResultMeta(shoppingResult, poolNote),
      shopping: buildShoppingResultDetails(shoppingResult),
    };
  }

  const customResult = choose(pool);

  return {
    mode: state.mode,
    title: customResult.title,
    meta: `来自你的 ${options.length} 个自定义选项${poolNote}`,
  };
}

function trimSentenceEnding(text) {
  return String(text || "").replace(/[。；;.\s]+$/u, "");
}

function normalizeSentence(text) {
  const sentence = trimSentenceEnding(text);
  return sentence ? `${sentence}。` : "";
}

function buildShoppingResultMeta(item, poolNote = "") {
  const parts = [
    item.category,
    item.subcategory,
    item.level,
    `预算约 ${item.budget}`,
  ].filter(Boolean);

  return `${parts.join(" · ")}${poolNote}`;
}

function buildShoppingResultDetails(item) {
  return {
    category: item.category || "",
    subcategory: item.subcategory || "",
    level: item.level || "",
    mindset: state.shopping.mindset || "全部",
    budget: item.budget || "",
    tags: Array.isArray(item.tags) ? [...item.tags] : [],
    reason: normalizeSentence(item.reason),
    priority: normalizeSentence(item.priority),
  };
}

function getShoppingResultDetails(item) {
  const shopping = item?.shopping && typeof item.shopping === "object" ? item.shopping : {};

  return {
    category: shopping.category || item?.category || "",
    subcategory: shopping.subcategory || item?.subcategory || "",
    level: shopping.level || item?.level || "",
    mindset: shopping.mindset || item?.mindset || "",
    budget: shopping.budget || item?.budget || "",
    tags: Array.isArray(shopping.tags) ? shopping.tags : Array.isArray(item?.tags) ? item.tags : [],
    reason: shopping.reason || item?.reason || "",
    priority: shopping.priority || item?.priority || "",
  };
}

function getShoppingReminderText(priority) {
  const sentence = trimSentenceEnding(String(priority || "").replace(/^提醒[:：]\s*/u, ""));
  return sentence ? `提醒：${sentence}。` : "";
}

function getShoppingContextLine(details) {
  const parts = [];

  if (details.mindset && details.mindset !== "全部") {
    parts.push(`心态：${details.mindset}`);
  }

  if (details.tags.length) {
    parts.push(`标签：${details.tags.slice(0, 4).join(" / ")}`);
  }

  return parts.join(" · ");
}

function getFoodSourceLabel() {
  if (SPECIAL_FOOD_CATEGORIES.has(state.food.category)) {
    return `${state.food.country} · ${state.food.category}`;
  }

  return `${state.food.country} · ${state.food.region}`;
}

function getBudgetText(item, shouldFormat = true) {
  let budgetText;

  if (state.travel.level !== "全部" && item.budgets[state.travel.level]) {
    budgetText = item.budgets[state.travel.level];
    return shouldFormat ? formatBudget(budgetText) : budgetText;
  }

  const firstLevel = TRAVEL_LEVELS.find((level) => level !== "全部" && item.budgets[level]);
  budgetText = firstLevel ? item.budgets[firstLevel] : "需按机票和住宿另估";
  return shouldFormat ? formatBudget(budgetText) : budgetText;
}

function getLockedTitles() {
  const titles = state.locked[state.mode];
  return Array.isArray(titles) ? titles : [];
}

function getActiveLockedOptions(options) {
  const lockedTitles = new Set(getLockedTitles());
  return options.filter((item) => lockedTitles.has(item.title));
}

function getRandomPool(options) {
  const activeLockedOptions = getActiveLockedOptions(options);
  return activeLockedOptions.length ? activeLockedOptions : options;
}

function getPoolNote(options) {
  const activeLockedOptions = getActiveLockedOptions(options);
  return activeLockedOptions.length ? ` · 从 ${activeLockedOptions.length} 个锁定候选中抽出` : "";
}

function isLocked(title) {
  return getLockedTitles().includes(title);
}

function toggleLock(title) {
  if (!LOCKABLE_MODES.has(state.mode)) {
    return;
  }

  const lockedTitles = getLockedTitles();

  if (lockedTitles.includes(title)) {
    state.locked[state.mode] = lockedTitles.filter((item) => item !== title);
    showToast(`已取消锁定「${title}」`);
  } else {
    state.locked[state.mode] = [...lockedTitles, title];
    showToast(`已锁定「${title}」`);
  }

  saveState();
  renderPreview();
}

function clearCurrentLocks() {
  if (!LOCKABLE_MODES.has(state.mode)) {
    return;
  }

  state.locked[state.mode] = [];
  saveState();
  renderPreview();
  showToast("当前模式的锁定候选已清除。");
}

function getAuthHeaders() {
  return state.auth.token
    ? { Authorization: `Bearer ${state.auth.token}` }
    : {};
}

async function authRequest(action, body = {}) {
  const response = await fetch(AUTH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      action,
      ...body,
    }),
  });
  const payload = await readJsonResponse(response);

  if (!response.ok || !payload.ok) {
    throw new Error(payload.detail || payload.error || "账号暂时处理不了");
  }

  return payload;
}

async function fetchCurrentAccount() {
  const response = await fetch(AUTH_ENDPOINT, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const payload = await readJsonResponse(response);

  if (!response.ok || !payload.ok) {
    throw new Error(payload.detail || payload.error || "请重新登入");
  }

  return payload;
}

function normalizeAccountUser(user) {
  return {
    id: user.id || "",
    username: user.username,
    userId: user.userId || "",
    displayName: user.displayName || user.username,
    avatar: normalizeAvatar(user.avatar, user.displayName || user.username),
    avatarUrl: user.avatarUrl || "",
    createdAt: user.createdAt || "",
    updatedAt: user.updatedAt || "",
  };
}

function rememberAuthUser(user) {
  const normalizedUser = normalizeAccountUser(user);
  state.users = [
    normalizedUser,
    ...state.users.filter((item) => item.username !== normalizedUser.username && item.id !== normalizedUser.id),
  ].slice(0, 6);

  return normalizedUser;
}

function applyAuthSession(payload) {
  const user = rememberAuthUser(payload.user);
  state.auth.currentUser = user.username;
  state.auth.token = payload.token || state.auth.token;
  state.userId = user.userId || state.userId;
  saveState();

  return user;
}

function clearAuthSession() {
  clearPendingWorldImage();
  state.auth.currentUser = "";
  state.auth.token = "";
  state.userId = ensureAnonymousUserId();
  saveState();
}

async function restoreAuthSession() {
  const savedToken = state.auth.token || localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (!savedToken) {
    if (state.auth.currentUser) {
      clearAuthSession();
      renderTopUserTools();
      renderWorldControls();
    }

    syncFromCloud();
    return;
  }

  state.auth.token = savedToken;

  try {
    const payload = await fetchCurrentAccount();
    applyAuthSession(payload);
    renderTopUserTools();
    renderWorldControls();
    await syncFromCloud();
  } catch (error) {
    console.warn("Auth session restore failed.", error);
    clearAuthSession();
    renderTopUserTools();
    renderWorldControls();
    syncFromCloud();
    showToast("登入已经过期，请重新登入。");
  }
}

function getCurrentUser() {
  if (!state.auth.currentUser) {
    return null;
  }

  return state.users.find((user) => user.username === state.auth.currentUser) || null;
}

function getCloudSyncLabel() {
  if (state.cloudSync.loading) {
    return "正在同步记录";
  }

  if (state.cloudSync.available) {
    return "记录已同步";
  }

  if (state.cloudSync.lastError) {
    return "暂时同步不了，先存在这台设备";
  }

  return "记录会先存在这台设备";
}

function getShortUserId() {
  if (!state.userId) {
    return "未生成";
  }

  return `${state.userId.slice(0, 18)}…`;
}

function getCloudIdentityText() {
  if (getCurrentUser()) {
    if (state.worldSync.available) {
      return "账号已登入，世界频道已连接";
    }

    return "账号已登入，世界频道正在连接";
  }

  return getCloudSyncLabel();
}

function getAvatarText(name) {
  return String(name || "游").trim().slice(0, 1).toUpperCase() || "游";
}

function normalizeAvatar(value, fallbackName = "游") {
  return String(value || "").trim().slice(0, 2) || getAvatarText(fallbackName);
}

function getUserDisplayName(user) {
  return user?.displayName || user?.username || "游客";
}

function getUserAvatar(user) {
  return normalizeAvatar(user?.avatar, getUserDisplayName(user));
}

function getUserAvatarUrl(user) {
  return String(user?.avatarUrl || "").trim();
}

function renderAvatarContent({ avatar, avatarUrl, name, className = "" }) {
  if (avatarUrl) {
    return `<img class="${className}" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name || "头像")}" loading="lazy" />`;
  }

  return escapeHtml(normalizeAvatar(avatar, name));
}

function getMessageAvatarUrl(message) {
  return String(message.avatarUrl || "").trim();
}

function getWorldMessageText(message) {
  const text = String(message.text || "");

  if (message.attachment?.type !== "image") {
    return text;
  }

  const attachmentName = String(message.attachment.name || "");

  if (attachmentName && text.includes(attachmentName)) {
    return text.split(attachmentName).join("").replace(/[：:\-\s]+$/g, "").trim() || "上传了一张图片";
  }

  if (text.startsWith("上传了一张图片")) {
    return "上传了一张图片";
  }

  return text;
}

function toggleWorldChat() {
  state.worldOpen = !state.worldOpen;
  elements.sidebar.classList.remove("is-menu-open");
  elements.modeMenuToggle.setAttribute("aria-expanded", "false");
  saveState();
  render();
  showToast(state.worldOpen ? "世界聊天窗口已打开。" : "世界聊天窗口已收起。");
}

function closeWorldChat() {
  state.worldOpen = false;
  saveState();
  render();
  showToast("世界聊天窗口已关闭。");
}

function setAuthMode(mode) {
  authMode = mode === "register" ? "register" : "login";
  renderWorldControls();
}

function getAuthFormValues() {
  const username = document.querySelector("#authUsername")?.value.trim();
  const password = document.querySelector("#authPassword")?.value;
  const confirmPassword = document.querySelector("#authConfirmPassword")?.value;

  return { username, password, confirmPassword };
}

function toggleProfilePanel() {
  if (!getCurrentUser()) {
    showToast("请先登入，再编辑个人资料。");
    return;
  }

  isProfilePanelOpen = !isProfilePanelOpen;
  isNotificationPanelOpen = false;
  isMoreMenuOpen = false;
  renderTopUserTools();
}

function closeProfilePanel() {
  isProfilePanelOpen = false;
  clearPendingProfileAvatarImage();
  renderTopUserTools();
}

function toggleNotificationPanel() {
  isNotificationPanelOpen = !isNotificationPanelOpen;
  isProfilePanelOpen = false;
  isMoreMenuOpen = false;

  if (isNotificationPanelOpen) {
    state.notificationReadIds = APP_NOTIFICATIONS.map((item) => item.id);
    saveState();
  }

  renderTopUserTools();
}

function closeNotificationPanel() {
  isNotificationPanelOpen = false;
  renderTopUserTools();
}

function toggleMoreMenu() {
  isMoreMenuOpen = !isMoreMenuOpen;
  isNotificationPanelOpen = false;
  isProfilePanelOpen = false;
  renderTopUserTools();
}

function closeMoreMenu() {
  if (!isMoreMenuOpen) {
    return;
  }

  isMoreMenuOpen = false;
  renderTopUserTools();
}

function handleDocumentClick(event) {
  if (!isMoreMenuOpen) {
    return;
  }

  if (event.target.closest("#moreMenuButton") || event.target.closest("#moreMenuPanel")) {
    return;
  }

  closeMoreMenu();
}

function handleGlobalKeydown(event) {
  if (event.key === "Escape" && isMoreMenuOpen) {
    closeMoreMenu();
  }
}

function updateProfilePreview() {
  const currentUser = getCurrentUser();
  const avatarInput = document.querySelector("#profileAvatarInput");
  const nameInput = document.querySelector("#profileNameInput");
  const avatarPreview = document.querySelector("#profilePreviewAvatar");
  const namePreview = document.querySelector("#profilePreviewName");
  const displayName = nameInput?.value.trim() || getUserDisplayName(currentUser);
  const avatar = normalizeAvatar(avatarInput?.value, displayName);
  const avatarUrl = pendingProfileAvatarImage?.previewUrl || getUserAvatarUrl(currentUser);

  if (avatarPreview) {
    avatarPreview.innerHTML = renderAvatarContent({
      avatar,
      avatarUrl,
      name: displayName,
      className: "profile-preview-image",
    });
  }

  if (namePreview) {
    namePreview.textContent = displayName;
  }
}

function setProfileAvatarStatus(message) {
  const status = document.querySelector("#profileAvatarStatus");

  if (status) {
    status.textContent = message;
  }
}

function prepareProfileAvatarImage(event) {
  const input = event.target;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  if (!IMAGE_CONTENT_TYPES.has(file.type)) {
    input.value = "";
    showToast("只支持 PNG / JPG / WebP / GIF 图片。");
    return;
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    input.value = "";
    showToast("头像图片不能超过 2.5MB。");
    return;
  }

  clearPendingProfileAvatarImage({ resetInput: false });
  pendingProfileAvatarImage = {
    file,
    previewUrl: URL.createObjectURL(file),
  };
  setProfileAvatarStatus("图片已选择，点「保存资料」后才会换上。");
  updateProfilePreview();
}

function clearPendingProfileAvatarImage(options = {}) {
  const { resetInput = true } = options;

  if (pendingProfileAvatarImage?.previewUrl) {
    URL.revokeObjectURL(pendingProfileAvatarImage.previewUrl);
  }

  pendingProfileAvatarImage = null;

  if (resetInput) {
    const input = document.querySelector("#profileAvatarFile");

    if (input) {
      input.value = "";
    }
  }
}

async function saveProfileChanges() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    showToast("请先登入，再编辑个人资料。");
    return;
  }

  const avatar = normalizeAvatar(document.querySelector("#profileAvatarInput")?.value, getUserDisplayName(currentUser));
  const displayName = document.querySelector("#profileNameInput")?.value.trim();
  const currentPassword = document.querySelector("#profileCurrentPassword")?.value || "";
  const newPassword = document.querySelector("#profileNewPassword")?.value || "";
  const confirmPassword = document.querySelector("#profileConfirmPassword")?.value || "";

  if (!displayName || displayName.length > 20) {
    showToast("名字需要 1-20 个字。");
    return;
  }

  if (newPassword || currentPassword || confirmPassword) {
    if (newPassword.length < 6) {
      showToast("新密码至少 6 个字符。");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("两次输入的新密码不一样。");
      return;
    }
  }

  const oldNames = new Set([currentUser.username, currentUser.displayName].filter(Boolean));
  let avatarUrl = getUserAvatarUrl(currentUser);

  if (pendingProfileAvatarImage) {
    try {
      setProfileAvatarStatus("正在保存头像图片…");
      const upload = await uploadImageThroughServer(pendingProfileAvatarImage.file);
      rememberUpload(upload, pendingProfileAvatarImage.file);
      avatarUrl = upload.url || upload.publicUrl || avatarUrl;
    } catch (error) {
      console.warn("Profile avatar upload failed.", error);
      setProfileAvatarStatus("头像图片暂时保存不了，请稍后再试。");
      showToast("头像图片暂时保存不了。");
      return;
    }
  }

  let updatedUser;

  try {
    const payload = await authRequest("update-profile", {
      displayName,
      avatar,
      avatarUrl,
      currentPassword,
      newPassword,
      confirmPassword,
    });
    updatedUser = applyAuthSession(payload);
  } catch (error) {
    showToast(error.message || "个人资料暂时保存不了。");
    return;
  }

  state.worldMessages = state.worldMessages.map((message) => {
    if (!oldNames.has(message.user)) {
      return message;
    }

    return {
      ...message,
      user: getUserDisplayName(updatedUser),
      avatar: getUserAvatar(updatedUser),
      avatarUrl: getUserAvatarUrl(updatedUser),
    };
  });

  clearPendingProfileAvatarImage();
  isProfilePanelOpen = false;
  saveState();
  renderWorldChannel();
  renderWorldControls();
  renderTopUserTools();
  showToast("个人资料已保存。");
}

async function registerUser() {
  const { username, password, confirmPassword } = getAuthFormValues();
  const submitButton = document.querySelector("#authSubmitButton");

  if (!isValidUsername(username)) {
    showToast("用户名需 2-20 字，只能包含字母、数字、中文、_ 或 -。");
    return;
  }

  if (!password || password.length < 6) {
    showToast("密码至少 6 个字符。");
    return;
  }

  if (password !== confirmPassword) {
    showToast("两次输入的密码不一样。");
    return;
  }

  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "正在创建账号…";
    }

    const payload = await authRequest("register", {
      username,
      password,
      confirmPassword,
    });
    applyAuthSession(payload);
    state.worldOpen = true;
    saveState();
    await syncFromCloud();
    await syncWorldMessages();
    render();
    showToast(`欢迎加入世界频道，${username}。`);
  } catch (error) {
    if (String(error.message || "").includes("已经")) {
      authMode = "login";
      renderWorldControls();
    }

    showToast(error.message || "账号创建失败，请稍后再试。");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "创建账号";
    }
  }
}

async function loginUser() {
  const { username, password } = getAuthFormValues();
  const submitButton = document.querySelector("#authSubmitButton");

  if (!isValidUsername(username)) {
    showToast("请输入正确的用户名。");
    return;
  }

  if (!password) {
    showToast("请输入密码。");
    return;
  }

  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "正在登入…";
    }

    const payload = await authRequest("login", {
      username,
      password,
    });
    const user = applyAuthSession(payload);
    state.worldOpen = true;
    saveState();
    await syncFromCloud();
    await syncWorldMessages();
    render();
    showToast(`欢迎回来，${getUserDisplayName(user)}。`);
  } catch (error) {
    showToast(error.message || "登入失败，请稍后再试。");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "登入";
    }
  }
}

function logoutUser() {
  clearAuthSession();
  render();
  syncFromCloud();
  showToast("已登出账号。");
}

function formatWorldTime(createdAt) {
  const date = createdAt ? new Date(createdAt) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "刚刚";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeWorldMessage(message) {
  return {
    id: message.id || `${Date.now()}-${randomInt(1000)}`,
    accountId: message.accountId || "",
    userId: message.userId || "",
    username: message.username || "",
    user: message.user || "游客",
    avatar: normalizeAvatar(message.avatar, message.user),
    avatarUrl: message.avatarUrl || "",
    text: message.text || "",
    attachment: message.attachment || null,
    createdAt: message.createdAt || new Date().toISOString(),
    time: message.time || formatWorldTime(message.createdAt),
  };
}

function mergeWorldMessages(currentMessages, incomingMessages) {
  const merged = new Map();

  [...currentMessages, ...incomingMessages].forEach((message) => {
    const normalizedMessage = normalizeWorldMessage(message);
    merged.set(normalizedMessage.id, normalizedMessage);
  });

  return [...merged.values()]
    .sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)))
    .slice(-80);
}

function setWorldSyncState(nextState) {
  state.worldSync = {
    ...state.worldSync,
    ...nextState,
  };

  const identityStatus = document.querySelector("[data-cloud-sync-identity]");

  if (identityStatus) {
    identityStatus.textContent = getCloudIdentityText();
  }
}

async function syncWorldMessages() {
  setWorldSyncState({ loading: true, lastError: "" });

  try {
    const response = await fetch(`${WORLD_CHANNEL_ENDPOINT}?limit=80`, {
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);

    if (!response.ok || !payload.ok) {
      throw new Error(payload.detail || payload.error || "读取世界频道失败");
    }

    state.worldMessages = Array.isArray(payload.messages) && payload.messages.length
      ? mergeWorldMessages([], payload.messages)
      : [...DEFAULT_WORLD_MESSAGES];
    setWorldSyncState({ loading: false, available: true, lastError: "" });
    saveState();
    renderWorldChannel();
    window.requestAnimationFrame(scrollWorldChatToBottom);
  } catch (error) {
    setWorldSyncState({ loading: false, available: false, lastError: error.message });
    console.warn("World channel sync failed; using local cache.", error);
  }
}

async function postWorldMessage({ text, attachment }) {
  const response = await fetch(WORLD_CHANNEL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      text,
      attachment,
    }),
  });
  const payload = await readJsonResponse(response);

  if (!response.ok || !payload.ok) {
    throw new Error(payload.detail || payload.error || "消息发送失败");
  }

  return payload.message;
}

function addWorldMessage(message) {
  state.worldMessages = mergeWorldMessages(state.worldMessages, [message]);
  state.worldOpen = true;
  saveState();
  render();
  window.requestAnimationFrame(scrollWorldChatToBottom);
  window.setTimeout(scrollWorldChatToBottom, 280);
}

async function sendWorldMessage() {
  const currentUser = getCurrentUser();
  const input = document.querySelector("#worldMessageInput");
  const sendButton = document.querySelector("#worldSendButton");
  const imageInput = document.querySelector("#worldImageInput");
  const text = input?.value.trim();
  const imageToSend = pendingWorldImage;

  if (!currentUser) {
    showToast("请先登入再发言。");
    return;
  }

  if (!text && !imageToSend) {
    showToast("先写一点内容，或选择一张图片再发送。");
    return;
  }

  sendButton.disabled = true;
  imageInput.disabled = true;

  try {
    let attachment = null;
    let messageText = text;

    if (imageToSend) {
      setUploadStatus("正在上传图片并发送到世界频道…");
      attachment = await uploadImageThroughServer(imageToSend.file);
      rememberUpload(attachment, imageToSend.file);
      messageText = messageText || "上传了一张图片";
      attachment = {
        type: "image",
        contentType: imageToSend.file.type,
        ...attachment,
      };
    }

    clearPendingWorldImage({ resetInput: false });
    const message = await postWorldMessage({
      text: messageText,
      attachment,
    });
    addWorldMessage(message);
    syncWorldMessages();

    input.value = "";
    setUploadStatus(imageToSend ? "图片已发送成功，可以继续选择下一张。" : "选择图片后会先预览；点发送才上传。支持 PNG / JPG / WebP / GIF，最大 2.5MB。");
    showToast(imageToSend ? "图片已发送到世界频道。" : "消息已发送到世界频道。");
  } catch (error) {
    console.warn("World image send failed.", error);
    if (String(error.message || "").includes("重新登入")) {
      clearAuthSession();
      render();
    }

    setUploadStatus("发送失败：世界频道暂时连不上，请稍后再试。");
    showToast(error.message || "发送失败，请稍后再试。");
  } finally {
    const currentSendButton = document.querySelector("#worldSendButton");
    const currentImageInput = document.querySelector("#worldImageInput");

    if (currentSendButton) {
      currentSendButton.disabled = false;
    }

    if (currentImageInput) {
      currentImageInput.disabled = false;
    }
  }
}

function prepareWorldImage(event) {
  const currentUser = getCurrentUser();
  const input = event.target;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  if (!currentUser) {
    input.value = "";
    showToast("请先登入再上传图片。");
    return;
  }

  if (!IMAGE_CONTENT_TYPES.has(file.type)) {
    input.value = "";
    showToast("只支持 PNG / JPG / WebP / GIF 图片。");
    return;
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    input.value = "";
    showToast("图片不能超过 2.5MB。");
    return;
  }

  clearPendingWorldImage({ resetInput: false });
  pendingWorldImage = {
    file,
    previewUrl: URL.createObjectURL(file),
  };
  updatePendingImagePreview();
  setUploadStatus("图片已选择，点「发送消息」才会上传并发出。");
  showToast("图片已加入待发送。");
}

function updatePendingImagePreview() {
  const previewPanel = document.querySelector("#worldPendingImage");
  const previewImage = document.querySelector("#worldPendingImageThumb");
  const previewName = document.querySelector("#worldPendingImageName");

  if (!previewPanel || !previewImage || !previewName) {
    return;
  }

  previewPanel.hidden = !pendingWorldImage;

  if (!pendingWorldImage) {
    previewImage.removeAttribute("src");
    previewName.textContent = "";
    return;
  }

  previewImage.src = pendingWorldImage.previewUrl;
  previewName.textContent = "图片已准备发送";
}

function clearPendingWorldImage(options = {}) {
  const { resetInput = true } = options;

  if (pendingWorldImage?.previewUrl) {
    URL.revokeObjectURL(pendingWorldImage.previewUrl);
  }

  pendingWorldImage = null;

  if (resetInput) {
    const input = document.querySelector("#worldImageInput");

    if (input) {
      input.value = "";
    }
  }

  updatePendingImagePreview();
  setUploadStatus("选择图片后会先预览；点发送才上传。支持 PNG / JPG / WebP / GIF，最大 2.5MB。");
}

async function uploadImageThroughSignedUrl(file) {
  const signedResponse = await fetch("/api/gcs-signed-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });
  const signedPayload = await readJsonResponse(signedResponse);

  if (!signedResponse.ok || !signedPayload.uploadUrl) {
    throw new Error(signedPayload.detail || signedPayload.error || "无法生成上传授权");
  }

  const uploadResponse = await fetch(signedPayload.uploadUrl, {
    method: signedPayload.method || "PUT",
    headers: signedPayload.headers || {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`图片上传失败：${uploadResponse.status}`);
  }

  return {
    url: signedPayload.viewUrl || signedPayload.publicUrl,
    publicUrl: signedPayload.publicUrl,
    objectName: signedPayload.objectName || signedPayload.filePath,
    filePath: signedPayload.filePath || signedPayload.objectName,
    transport: "signed-url",
  };
}

async function uploadImageThroughServer(file) {
  const uploadResponse = await fetch("/api/gcs-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
      data: await fileToBase64(file),
    }),
  });
  const uploadPayload = await readJsonResponse(uploadResponse);

  if (!uploadResponse.ok || !uploadPayload.url) {
    throw new Error(uploadPayload.detail || uploadPayload.error || "备用上传失败");
  }

  return {
    url: uploadPayload.url,
    publicUrl: uploadPayload.publicUrl,
    objectName: uploadPayload.objectName,
    filePath: uploadPayload.filePath || uploadPayload.objectName,
    transport: "server-upload",
  };
}

async function readJsonResponse(response) {
  const text = await response.text();

  try {
    return JSON.parse(text || "{}");
  } catch {
    return { error: text || response.statusText };
  }
}

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x8000) {
    const chunk = bytes.subarray(index, index + 0x8000);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function getItemTimestamp(item) {
  const createdAtTime = Date.parse(item.createdAt || "");

  if (Number.isFinite(createdAtTime)) {
    return createdAtTime;
  }

  const idTime = Number(String(item.id || "").split("-")[0]);
  return Number.isFinite(idTime) ? idTime : 0;
}

function mergeSyncedItems(localItems, cloudItems, limit) {
  const mergedMap = new Map();

  [...cloudItems, ...localItems].forEach((item) => {
    if (!item?.id) {
      return;
    }

    mergedMap.set(item.id, {
      ...mergedMap.get(item.id),
      ...item,
    });
  });

  return [...mergedMap.values()]
    .sort((first, second) => getItemTimestamp(second) - getItemTimestamp(first))
    .slice(0, limit);
}

function setCloudSyncState(nextState) {
  state.cloudSync = {
    ...state.cloudSync,
    ...nextState,
  };

  document.querySelectorAll("[data-cloud-sync-status]").forEach((element) => {
    element.textContent = getCloudSyncLabel();
  });

  const identityStatus = document.querySelector("[data-cloud-sync-identity]");

  if (identityStatus) {
    identityStatus.textContent = getCloudIdentityText();
  }
}

async function syncFromCloud() {
  if (!state.userId) {
    return;
  }

  setCloudSyncState({ loading: true, lastError: "" });

  try {
    const response = await fetch(`${CLOUD_SYNC_ENDPOINT}?userId=${encodeURIComponent(state.userId)}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);

    if (!response.ok || !payload.ok) {
      throw new Error(payload.detail || payload.error || "读取记录失败");
    }

    state.history = mergeSyncedItems(state.history, payload.data?.history || [], 8);
    state.favorites = mergeSyncedItems(state.favorites, payload.data?.favorites || [], 8);
    state.uploads = mergeSyncedItems(state.uploads, payload.data?.uploads || [], 30);
    setCloudSyncState({ loading: false, available: true, lastError: "" });
    saveState();
    renderHistory();
    renderFavorites();
  } catch (error) {
    setCloudSyncState({ loading: false, available: false, lastError: error.message });
    console.warn("Cloud sync unavailable; using local cache.", error);
    showToast("暂时同步不了，先显示本地记录。");
  }
}

async function syncCloudItem(collection, item) {
  if (!state.userId) {
    return null;
  }

  try {
    const response = await fetch(CLOUD_SYNC_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        userId: state.userId,
        collection,
        item,
      }),
    });
    const payload = await readJsonResponse(response);

    if (!response.ok || !payload.ok) {
      throw new Error(payload.detail || payload.error || "保存记录失败");
    }

    setCloudSyncState({ available: true, lastError: "" });
    return payload.item || item;
  } catch (error) {
    setCloudSyncState({ available: false, lastError: error.message });
    console.warn(`Cloud ${collection} sync failed; local cache kept.`, error);
    return null;
  }
}

async function syncCloudClear(collections) {
  if (!state.userId) {
    return;
  }

  try {
    const response = await fetch(CLOUD_SYNC_ENDPOINT, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        userId: state.userId,
        collections,
      }),
    });
    const payload = await readJsonResponse(response);

    if (!response.ok || !payload.ok) {
      throw new Error(payload.detail || payload.error || "清理记录失败");
    }

    setCloudSyncState({ available: true, lastError: "" });
  } catch (error) {
    setCloudSyncState({ available: false, lastError: error.message });
    console.warn("Cloud clear failed; local cache was cleared.", error);
  }
}

function rememberUpload(attachment, file) {
  const entry = {
    id: `${Date.now()}-${randomInt(1000)}`,
    imageUrl: attachment.url || attachment.publicUrl,
    publicUrl: attachment.publicUrl,
    filePath: attachment.filePath || attachment.objectName,
    fileName: file.name,
    contentType: file.type,
    createdAt: new Date().toISOString(),
  };

  state.uploads = [entry, ...state.uploads].slice(0, 30);
  saveState();
  syncCloudItem("uploads", entry);
  return entry;
}

function setUploadStatus(message) {
  const uploadStatus = document.querySelector("#worldUploadStatus");

  if (uploadStatus) {
    uploadStatus.textContent = message;
  }
}

function isValidUsername(username) {
  return /^[\w\u4e00-\u9fa5-]{2,20}$/u.test(username || "");
}

function normalizeLotteryLines(value) {
  const lineCount = Number(value);
  return LOTTERY_LINE_OPTIONS.includes(lineCount) ? lineCount : 1;
}

function getLotteryGamesForCountry(country) {
  if (country === "全部") {
    return LOTTERY_DATA;
  }

  return LOTTERY_DATA.filter((game) => game.country === country);
}

function getCurrentLotteryGame() {
  const games = getLotteryGamesForCountry(state.number.country);
  return games.find((game) => game.id === state.number.gameId) || games[0] || LOTTERY_DATA[0];
}

function generateDigitString(length) {
  const availableDigits = state.number.avoidFour
    ? ["0", "1", "2", "3", "5", "6", "7", "8", "9"]
    : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const pool = [...availableDigits];
  const digits = [];

  for (let index = 0; index < length; index += 1) {
    const source = state.number.allowRepeat ? availableDigits : pool;

    if (!source.length) {
      break;
    }

    const digitIndex = randomInt(source.length);
    digits.push(source[digitIndex]);

    if (!state.number.allowRepeat) {
      pool.splice(digitIndex, 1);
    }
  }

  return digits.join("").padEnd(length, "0");
}

function generateRangeString(game) {
  const min = Number(game.min) || 0;
  const max = Number(game.max) || min;
  const width = Number(game.digits) || String(max).length;

  for (let attempt = 0; attempt < 2000; attempt += 1) {
    const value = min + randomInt(max - min + 1);
    const text = String(value).padStart(width, "0");

    if (!state.number.avoidFour || !text.includes("4")) {
      return text;
    }
  }

  return String(min + randomInt(max - min + 1)).padStart(width, "0");
}

function generateLotteryLine(game) {
  if (game.type === "digits") {
    return {
      type: "digits",
      value: generateDigitString(game.digits),
    };
  }

  if (game.type === "range") {
    return {
      type: "range",
      value: generateRangeString(game),
    };
  }

  const previousValues = [];
  const groups = (game.groups || []).map((group) => {
    const exclusions = group.excludePrevious ? previousValues : [];
    const values = drawUniqueLotteryNumbers(group.count, group.min, group.max, exclusions);

    previousValues.push(...values);

    return {
      label: group.label,
      values: group.sort ? [...values].sort((first, second) => first - second) : values,
      width: String(group.max).length,
    };
  });

  return {
    type: "groups",
    groups,
  };
}

function drawUniqueLotteryNumbers(count, min, max, exclusions = []) {
  const excluded = new Set(exclusions);
  let pool = [];

  for (let value = min; value <= max; value += 1) {
    if (excluded.has(value)) {
      continue;
    }

    if (state.number.avoidFour && String(value).includes("4")) {
      continue;
    }

    pool.push(value);
  }

  if (pool.length < count) {
    pool = [];

    for (let value = min; value <= max; value += 1) {
      if (!excluded.has(value)) {
        pool.push(value);
      }
    }
  }

  const values = [];

  for (let index = 0; index < count && pool.length; index += 1) {
    const valueIndex = randomInt(pool.length);
    values.push(pool[valueIndex]);
    pool.splice(valueIndex, 1);
  }

  return values;
}

function formatLotteryBall(value, width) {
  return String(value).padStart(Math.max(2, width), "0");
}

function formatLotteryLine(line) {
  if (line.type === "digits" || line.type === "range") {
    return line.value;
  }

  return line.groups
    .map((group) => `${group.label} ${group.values.map((value) => formatLotteryBall(value, group.width)).join(" ")}`)
    .join(" · ");
}

function buildNumberMeta(game, lines) {
  const rules = [
    game.summary,
    `${lines.length} 组`,
    lines.map((line, index) => `#${index + 1} ${formatLotteryLine(line)}`).join(" ｜ "),
  ];

  if (!state.number.allowRepeat) {
    rules.push("数字型不重复");
  }

  if (state.number.avoidFour) {
    rules.push("尽量避开 4");
  }

  rules.push(getLotteryDisclaimer());
  return rules.join(" · ");
}

function updateResultActionButtons(result) {
  const hasResult = Boolean(result);
  const isNumberResult = result?.mode === "number";

  elements.copyResultButton.disabled = !hasResult;
  elements.copyResultButton.textContent = isNumberResult ? "复制号码" : "复制结果";
  elements.shareResultButton.hidden = typeof navigator.share !== "function";
  elements.shareResultButton.disabled = !hasResult || elements.shareResultButton.hidden;
}

function getResultShareTitle(result = state.currentResult) {
  if (!result) {
    return "随心转盘";
  }

  return result.mode === "number" ? getModeTitle("number") : getModeTitle(result.mode);
}

function getResultMetaLines(result) {
  const lines = [];

  if (result.meta) {
    lines.push(formatBudget(result.meta));
  }

  if (result.mode === "shopping") {
    const details = getShoppingResultDetails(result);
    const reason = normalizeSentence(details.reason);
    const reminder = getShoppingReminderText(details.priority);

    if (reason) {
      lines.push(reason);
    }

    if (reminder) {
      lines.push(reminder);
    }
  }

  return lines.filter(Boolean);
}

function getResultCopyText(result = state.currentResult) {
  if (!result) {
    return "";
  }

  if (result.mode === "number") {
    const lines = [
      getModeTitle("number"),
      "",
      result.title,
    ];

    if (Array.isArray(result.lotteryLines) && result.lotteryLines.length) {
      lines.push("");
      result.lotteryLines.forEach((line, index) => {
        lines.push(`第 ${index + 1} 组：${formatLotteryLine(line)}`);
      });
    }

    lines.push("", getLotteryDisclaimer());
    return lines.join("\n");
  }

  const lines = [
    getModeTitle(result.mode),
    "",
    result.title,
    ...getResultMetaLines(result),
  ];

  return lines.filter((line, index) => line || index === 1).join("\n");
}

async function writeClipboardText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      console.warn("Clipboard API failed; trying fallback.", error);
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("copy-failed");
  }
}

async function copyCurrentResult() {
  if (!state.currentResult) {
    showToast("先随机一次，再复制结果。");
    return;
  }

  try {
    await writeClipboardText(getResultCopyText());
    showToast(state.currentResult.mode === "number" ? "号码已复制。" : "结果已复制。");
  } catch (error) {
    showToast("复制失败，请手动长按结果复制。");
  }
}

async function shareCurrentResult() {
  if (!state.currentResult) {
    showToast("先随机一次，再分享结果。");
    return;
  }

  if (typeof navigator.share !== "function") {
    return;
  }

  try {
    await navigator.share({
      title: getResultShareTitle(),
      text: getResultCopyText(),
    });
  } catch (error) {
    if (error?.name !== "AbortError") {
      showToast("分享失败，可以先复制结果。");
    }
  }
}

function drawResult() {
  const result = getResult();

  if (!result) {
    showToast("当前筛选没有候选项，换个条件或输入候选后再随机。");
    return;
  }

  elements.resultStage.classList.add("is-spinning");
  elements.randomButton.disabled = true;

  window.setTimeout(() => {
    state.currentResult = result;
    renderResult(result);
    const historyEntry = addHistory(result);
    saveState();
    syncCloudItem("history", historyEntry);
    elements.resultStage.classList.remove("is-spinning");
    elements.randomButton.disabled = false;
  }, 520);
}

function renderResult(result) {
  elements.resultLabel.textContent = getModeText(result.mode, "label");
  elements.resultValue.textContent = result.mode === "number" ? result.title : result.title;
  elements.resultMeta.innerHTML = renderResultMeta(result);
  updateResultActionButtons(result);

  if (result.lotteryLines) {
    elements.numberDigits.hidden = false;
    elements.numberDigits.classList.add("is-lottery");
    elements.numberDigits.innerHTML = renderLotteryLines(result.lotteryLines);
    return;
  }

  if (result.digits) {
    elements.numberDigits.hidden = false;
    elements.numberDigits.classList.remove("is-lottery");
    elements.numberDigits.innerHTML = result.digits.map((digit) => `<span class="digit-box">${digit}</span>`).join("");
    return;
  }

  elements.numberDigits.hidden = true;
  elements.numberDigits.classList.remove("is-lottery");
  elements.numberDigits.innerHTML = "";
}

function renderResultMeta(result) {
  const lines = [formatBudget(result.meta)];

  if (result.mode === "shopping") {
    const details = getShoppingResultDetails(result);
    const reason = normalizeSentence(details.reason);
    const reminder = getShoppingReminderText(details.priority);

    if (reason) {
      lines.push(reason);
    }

    if (reminder) {
      lines.push(reminder);
    }
  }

  return lines
    .filter(Boolean)
    .map((line) => `<span>${escapeHtml(line)}</span>`)
    .join("<br>");
}

function renderLotteryLines(lines) {
  return lines
    .map((line, index) => {
      if (line.type === "digits" || line.type === "range") {
        return `
          <article class="lottery-line">
            <small>第 ${index + 1} 组</small>
            <strong class="lottery-ticket-number">${escapeHtml(line.value)}</strong>
          </article>
        `;
      }

      return `
        <article class="lottery-line">
          <small>第 ${index + 1} 组</small>
          ${line.groups
            .map(
              (group) => `
                <div class="lottery-group">
                  <span>${escapeHtml(group.label)}</span>
                  <div class="lottery-balls">
                    ${group.values.map((value) => `<b>${escapeHtml(formatLotteryBall(value, group.width))}</b>`).join("")}
                  </div>
                </div>
              `,
            )
            .join("")}
        </article>
      `;
    })
    .join("");
}

function addHistory(result) {
  const entry = {
    ...result,
    id: `${Date.now()}-${randomInt(1000)}`,
    createdAt: new Date().toISOString(),
    time: new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  };

  state.history = [entry, ...state.history].slice(0, 8);
  renderHistory();
  return entry;
}

function favoriteCurrent() {
  if (!state.currentResult) {
    showToast("先随机一次，再收藏结果。");
    return;
  }

  const exists = state.favorites.some(
    (item) => item.title === state.currentResult.title && item.mode === state.currentResult.mode,
  );

  if (exists) {
    showToast("这个结果已经在收藏里啦。");
    return;
  }

  const favoriteEntry = {
    ...state.currentResult,
    id: `${Date.now()}-${randomInt(1000)}`,
    createdAt: new Date().toISOString(),
  };

  state.favorites = [favoriteEntry, ...state.favorites].slice(0, 8);

  saveState();
  renderFavorites();
  syncCloudItem("favorites", favoriteEntry);
  showToast("已加入收藏。");
}

function renderHistory() {
  elements.historyCount.textContent = `${state.history.length} 条`;
  elements.historyList.innerHTML = renderStackItems(state.history, "还没有决定记录。按下随机按钮试试。");
}

function renderFavorites() {
  elements.favoriteCount.textContent = `${state.favorites.length} 个`;
  elements.favoritesList.innerHTML = renderStackItems(state.favorites, "收藏喜欢的结果，下次就不用重新纠结。");
}

function renderStackItems(items, emptyText) {
  if (!items.length) {
    return `<p class="empty-state">${emptyText}</p>`;
  }

  return items
    .map((item) => {
      const timeText = item.time ? ` · ${item.time}` : "";
      return `
        <article class="stack-item">
          <strong>${escapeHtml(item.title)}</strong>
          <small>${renderStackItemMeta(item, timeText)}</small>
        </article>
      `;
    })
    .join("");
}

function renderStackItemMeta(item, timeText) {
  const modeTitle = MODES[item.mode] ? getModeTitle(item.mode) : "旧记录";
  const lines = [
    `${modeTitle}${timeText}`,
    formatBudget(item.meta),
  ];

  if (item.mode === "shopping") {
    const details = getShoppingResultDetails(item);
    const contextLine = getShoppingContextLine(details);
    const reason = normalizeSentence(details.reason);
    const reminder = getShoppingReminderText(details.priority);

    if (contextLine) {
      lines.push(contextLine);
    }

    if (reason) {
      lines.push(reason);
    }

    if (reminder) {
      lines.push(reminder);
    }
  }

  return lines.filter(Boolean).map((line) => escapeHtml(line)).join("<br>");
}

function renderDailyInspiration() {
  const today = new Date();
  const seed = today.getFullYear() + today.getMonth() * 31 + today.getDate();
  const tip = DAILY_TIPS[seed % DAILY_TIPS.length];

  elements.dailyInspiration.innerHTML = `
    <strong>${tip.title}</strong>
    <p>${tip.text}</p>
  `;
}

function clearHistory() {
  state.history = [];
  state.favorites = [];
  saveState();
  renderHistory();
  renderFavorites();
  syncCloudClear(["history", "favorites"]);
  showToast("记录和收藏已清空。");
}

function surpriseMode() {
  const modes = Object.keys(MODES).filter((mode) => mode !== state.mode);
  switchMode(choose(modes));
}

function changeCurrency(currency) {
  if (!CURRENCY_RATES[currency]) {
    return;
  }

  state.currency = currency;
  saveState();
  renderPreview();
  renderHistory();
  renderFavorites();

  if (state.currentResult) {
    renderResult(state.currentResult);
  }

  showToast(`预算已切换为 ${currency}`);
}

function changeLanguage(language) {
  const nextLanguage = normalizeLanguage(language);

  if (state.language === nextLanguage) {
    return;
  }

  state.language = nextLanguage;
  state.languageManuallySelected = true;
  saveState();
  render();
  showToast(`${t("menu.language", "语言")}：${LANGUAGE_LABELS[nextLanguage]}`);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2400);
}

function refreshApp(event) {
  event.preventDefault();
  showToast("正在刷新应用…");
  window.setTimeout(() => {
    window.location.reload();
  }, 120);
}

elements.appRefreshButton.addEventListener("click", refreshApp);
elements.notificationButton.addEventListener("click", toggleNotificationPanel);
elements.profileAvatarButton.addEventListener("click", toggleProfilePanel);
elements.moreMenuButton.addEventListener("click", toggleMoreMenu);
elements.randomButton.addEventListener("click", drawResult);
elements.copyResultButton.addEventListener("click", copyCurrentResult);
elements.shareResultButton.addEventListener("click", shareCurrentResult);
elements.favoriteButton.addEventListener("click", favoriteCurrent);
elements.surpriseModeButton.addEventListener("click", surpriseMode);
elements.modeMenuToggle.addEventListener("click", () => {
  const expanded = !elements.sidebar.classList.contains("is-menu-open");
  elements.sidebar.classList.toggle("is-menu-open", expanded);
  elements.modeMenuToggle.setAttribute("aria-expanded", String(expanded));
});
elements.worldCloseButton.addEventListener("click", closeWorldChat);
elements.currencySelect.addEventListener("change", (event) => changeCurrency(event.target.value));
elements.optionPreview.addEventListener("click", (event) => {
  const clearButton = event.target.closest("[data-clear-locks]");

  if (clearButton) {
    clearCurrentLocks();
    return;
  }

  const lockButton = event.target.closest("[data-lock-title]");

  if (lockButton) {
    toggleLock(lockButton.dataset.lockTitle);
  }
});
document.addEventListener("click", handleDocumentClick);
document.addEventListener("keydown", handleGlobalKeydown);

loadState();
formatDateLabel();
renderDailyInspiration();
render();
restoreAuthSession();
syncWorldMessages();
window.setInterval(syncWorldMessages, WORLD_SYNC_INTERVAL_MS);
