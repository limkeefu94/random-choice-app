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
const MAX_SOURCE_IMAGE_BYTES = 12 * 1024 * 1024;
const AVATAR_CROP_SIZE = 512;
const WORLD_IMAGE_MAX_SIDE = 1600;
const IMAGE_OUTPUT_QUALITY = 0.85;
const WORLD_IMAGE_CROP_MODES = {
  original: { label: "原图", aspectRatio: null },
  square: { label: "方形", aspectRatio: 1 },
  landscape: { label: "横图", aspectRatio: 4 / 3 },
  portrait: { label: "竖图", aspectRatio: 3 / 4 },
};
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
const FEEDBACK_ENDPOINT = "/api/feedback";
const CLIENT_ERROR_ENDPOINT = "/api/client-error";
const WORLD_MESSAGE_MAX_LENGTH = 220;
const WORLD_PLACEHOLDERS = [
  "生活上想多了没用，先发一句。",
  "今天随机到什么奇怪东西？",
  "把你的选择困难丢出来～",
  "今天有什么小发现？",
  "刚刚随机到了什么？",
  "世界频道等你丢一句话。",
  "今天的灵感掉在哪里？",
];
const APP_VERSION = "0.6.3";
const RELEASE_NOTES = [
  {
    version: "0.6.3",
    title: "世界频道体验优化",
    date: "2026-06-12",
    summary: "这次主要压缩世界频道的输入区，让手机上可以看到更多消息，也让发言提示更自然。",
    userChanges: [
      "世界频道顶部和输入区变得更紧凑。",
      "账号在线状态移到输入区里，不再额外占一张卡。",
      "发言提示变得更自然，不再一开始显示字数限制。",
      "输入接近字数上限时，才会显示剩余字数。",
      "图片选择提示变得更简短。",
    ],
    technicalChanges: [
      "Compact world-channel header and composer layout.",
      "Moved world connection identity into the composer.",
      "Added dynamic remaining-character hint after 200 characters.",
      "Reduced persistent helper text in the world composer.",
      "Improved mobile space usage for the world channel panel.",
    ],
  },
  {
    version: "0.6.2",
    title: "图片裁剪交互修复",
    date: "2026-06-11",
    summary: "这次重新整理头像和世界频道图片裁剪，让拖动和缩放更稳定。",
    userChanges: [
      "头像裁剪可以拖动调整位置。",
      "头像裁剪支持鼠标滚轮缩放和手机双指缩放。",
      "修正头像裁剪弹窗显示层级。",
      "世界频道发图改为独立裁剪面板，手机上更好操作。",
      "登出后会清空本机记录和未发送内容。",
    ],
    technicalChanges: [
      "Rebuilt crop interaction with pan and zoom state.",
      "Added wheel and pinch zoom support.",
      "Improved crop modal cleanup and button handling.",
      "Moved world image crop controls into a top-level modal.",
      "Improved local-state cleanup on logout.",
    ],
  },
  {
    version: "0.6.1",
    title: "图片体验优化",
    date: "2026-06-10",
    summary: "这次让头像上传和世界频道发图更顺手。",
    userChanges: [
      "头像上传前可以先裁剪，显示会更整齐。",
      "世界频道发图片前可以先预览。",
      "发送图片时可以选择原图、方形、横图或竖图。",
    ],
    technicalChanges: [
      "Added canvas-based avatar crop.",
      "Added world image preview before upload.",
      "Added client-side image resize/compression.",
    ],
  },
  {
    version: "0.6.0",
    title: "我的主页",
    date: "2026-06-10",
    summary: "这次新增我的主页，可以查看和管理自己在世界频道发过的内容。",
    userChanges: [
      "点右上角头像会进入我的主页。",
      "可以看到自己发过的世界频道文字和图片。",
      "自己发过的内容可以编辑文字或移除。",
    ],
    technicalChanges: [
      "Added my profile panel.",
      "Added owner-only world message edit/delete support.",
      "Added soft delete handling for world messages.",
    ],
  },
  {
    version: "0.5.0",
    title: "设置和版本内容整理",
    date: "2026-06-08",
    summary: "这次把设置中心、版本内容和通知用途整理得更清楚。",
    userChanges: [
      "点版本号可以直接看到这次更新内容。",
      "反馈问题和清除记录放得更顺手。",
      "通知以后不再塞一堆更新说明，会留给点赞、私信和重要提醒。",
    ],
    technicalChanges: [
      "Added release notes panel.",
      "Separated notification usage from changelog content.",
      "Kept hideLotteryContent as backward-compatible settings data only.",
    ],
  },
];
const SOCIAL_FEATURES_ENABLED = window.SOCIAL_FEATURES_ENABLED === true || window.SOCIAL_FEATURES_ENABLED === "true";
const DEFAULT_PRIVACY_SETTINGS = Object.freeze({
  discoverable: false,
  showOnlineStatus: false,
  allowFriendRequests: false,
  allowDirectMessages: "friendsOnly",
});
const DEFAULT_WORLD_PREFERENCES = Object.freeze({
  language: "zh-CN",
  region: "global",
  topics: [],
  hideLottery: false,
});
const DEFAULT_ACCOUNT_SETTINGS = Object.freeze({
  privacy: Object.freeze({
    discoverable: true,
    allowFriendRequests: true,
    allowDirectMessages: "friendsOnly",
    showOnlineStatus: false,
    hideLotteryContent: false,
  }),
  preferences: Object.freeze({
    language: "zh-CN",
    currency: "MYR",
    worldRegion: "MY",
    worldTopics: Object.freeze(["general"]),
  }),
});
const DIRECT_MESSAGE_POLICIES = new Set(["friendsOnly", "everyone", "none"]);
const WORLD_REGION_OPTIONS = [
  { value: "global", label: "全球" },
  { value: "MY", label: "马来西亚" },
  { value: "SG", label: "新加坡" },
  { value: "CN", label: "中国" },
  { value: "TW", label: "台湾" },
  { value: "HK", label: "香港" },
  { value: "JP", label: "日本" },
  { value: "KR", label: "韩国" },
  { value: "TH", label: "泰国" },
  { value: "US", label: "美国" },
  { value: "EU", label: "欧洲" },
];
const FEEDBACK_TYPES = ["Bug / 错误", "功能建议", "UI 不好用", "内容错误", "其他"];
const CLIENT_ERROR_THROTTLE_MS = 60 * 1000;
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
    id: "notice-purpose-updated-v050",
    type: "系统提醒",
    title: "通知会留给重要消息",
    text: "以后这里主要放点赞、私信、好友申请和必要提醒。",
  },
  {
    id: "daily-inspiration-placeholder",
    type: "预留",
    title: "今日灵感提醒准备中",
    text: "之后可以在这里看到简短提醒，不会塞满更新日志。",
  },
  {
    id: "social-message-placeholder",
    type: "预留",
    title: "互动提醒会放这里",
    text: "有人点赞、发私信或申请好友时，再用红点提醒你。",
  },
];
const STORAGE_KEY = "choiceWheelState";

const state = {
  userId: "",
  mode: "food",
  worldOpen: false,
  features: {
    social: SOCIAL_FEATURES_ENABLED,
  },
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
  settingsPanel: document.querySelector("#settingsPanel"),
  feedbackPanel: document.querySelector("#feedbackPanel"),
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
let activeAvatarCrop = null;
let imageCropInteractionCleanups = new Map();
let isWorldImageProcessing = false;
let shouldRemoveProfileAvatarImage = false;
let authMode = "login";
let profilePanelView = "home";
let editingWorldMessageId = "";
let currentWorldPlaceholder = "";
let myWorldMessages = [];
let isMyWorldMessagesLoading = false;
let myWorldMessagesError = "";
let isProfilePanelOpen = false;
let isNotificationPanelOpen = false;
let isMoreMenuOpen = false;
let isFeedbackPanelOpen = false;
let isSettingsPanelOpen = false;
let isReleaseNotesPanelOpen = false;
const clientErrorThrottle = new Map();

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
      ? saved.users.map(normalizeAccountUser).filter((user) => user.username)
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
    users: state.users.map(normalizeAccountUser).filter((user) => user.username),
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
  elements.settingsPanel.setAttribute("aria-label", t("menu.settings", "设置"));
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
    elements.profileAvatarButton.setAttribute("aria-label", `我的主页：${getUserDisplayName(currentUser)}`);
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
  elements.settingsPanel.hidden = !isSettingsPanelOpen;
  elements.feedbackPanel.hidden = !isFeedbackPanelOpen;

  const unreadCount = APP_NOTIFICATIONS.filter((item) => !state.notificationReadIds.includes(item.id)).length;
  elements.notificationBadge.hidden = unreadCount === 0;
  elements.notificationBadge.textContent = String(unreadCount);

  renderNotificationPanel();
  renderProfilePanel();
  renderMoreMenuPanel();
  renderSettingsPanel();
  renderFeedbackPanel();
}

function renderNotificationPanel() {
  if (elements.notificationPanel.hidden) {
    return;
  }

  elements.notificationPanel.innerHTML = `
    <div class="floating-panel-header">
        <div>
          <strong>${escapeHtml(t("top.notification", "通知"))}</strong>
          <small>点赞、私信、好友申请和重要提醒</small>
        </div>
      <button class="ghost-button compact-ghost" id="notificationCloseButton" type="button">${escapeHtml(t("actions.close", "关闭"))}</button>
    </div>
    <div class="notification-list">
      ${APP_NOTIFICATIONS.map((item) => `
        <article class="notification-item">
          <div class="notification-item-title">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.type || "提醒")}</span>
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

  if (profilePanelView === "edit") {
    renderProfileEditorPanel(currentUser);
    return;
  }

  renderMyProfilePanel(currentUser);
}

function renderMyProfilePanel(currentUser) {
  const messages = getMyProfileMessages(currentUser);
  const feedMarkup = renderMyProfileFeed(messages);

  elements.profilePanel.innerHTML = `
    <div class="my-profile-page">
      <div class="floating-panel-header">
        <div>
          <strong>我的主页</strong>
          <small>查看资料和管理自己发布过的世界频道内容</small>
        </div>
        <button class="ghost-button compact-ghost" id="profileCloseButton" type="button">${escapeHtml(t("actions.close", "关闭"))}</button>
      </div>
      <section class="my-profile-hero">
        <span class="world-avatar my-profile-avatar" aria-hidden="true">
          ${renderAvatarContent({
            avatar: getUserAvatar(currentUser),
            avatarUrl: getUserAvatarUrl(currentUser),
            name: getUserDisplayName(currentUser),
            className: "profile-preview-image",
          })}
        </span>
        <div class="my-profile-identity">
          <strong>${escapeHtml(getUserDisplayName(currentUser))}</strong>
          <small>@${escapeHtml(currentUser.username || currentUser.userId || "user")}</small>
        </div>
      </section>
      <div class="my-profile-actions">
        <button class="primary-button compact-primary" id="myProfileEditButton" type="button">编辑资料</button>
        <button class="secondary-button" id="myProfileSettingsButton" type="button">设置</button>
      </div>
      <section class="my-profile-feed">
        <div class="my-profile-feed-heading">
          <div>
            <strong>我的世界频道内容</strong>
            <small>最近 20 条文字和图片</small>
          </div>
          <button class="ghost-button compact-ghost" id="myProfileRefreshButton" type="button" ${isMyWorldMessagesLoading ? "disabled" : ""}>
            ${isMyWorldMessagesLoading ? "更新中…" : "刷新"}
          </button>
        </div>
        ${myWorldMessagesError ? `<p class="my-profile-error">${escapeHtml(myWorldMessagesError)}</p>` : ""}
        ${feedMarkup}
      </section>
      <button class="secondary-button profile-logout-button" id="profileLogoutButton" type="button">登出账号</button>
    </div>
  `;

  bindMyProfilePanelEvents();
}

function renderProfileEditorPanel(currentUser) {
  elements.profilePanel.innerHTML = `
    <form class="profile-form" id="profileForm">
      <div class="floating-panel-header">
        <div>
          <strong>${escapeHtml(t("top.profile", "个人资料"))}</strong>
          <small>换头像、改名字或密码</small>
        </div>
        <button class="ghost-button compact-ghost" id="profileCloseButton" type="button">${escapeHtml(t("actions.close", "关闭"))}</button>
      </div>
      <button class="ghost-button compact-ghost profile-back-button" id="profileBackButton" type="button">返回我的主页</button>
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
        <small class="field-hint" id="profileAvatarStatus">可选 PNG / JPG / WebP / GIF，上传前会先裁剪压缩。</small>
      </div>
      <div class="field">
        <label for="profileNameInput">显示名字</label>
        <input id="profileNameInput" maxlength="20" value="${escapeHtml(getUserDisplayName(currentUser))}" placeholder="别人看到的名字" />
        <small class="field-hint">没有图片时，会自动用名字的第一个字当头像。</small>
      </div>
      <div class="field">
        <button class="secondary-button" id="profileRemoveAvatarButton" type="button">移除图片头像</button>
        <small class="field-hint">移除后会回到自动文字头像。</small>
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

  const avatarFileInput = document.querySelector("#profileAvatarFile");
  const nameInput = document.querySelector("#profileNameInput");

  avatarFileInput.addEventListener("change", prepareProfileAvatarImage);
  nameInput.addEventListener("input", updateProfilePreview);
  document.querySelector("#profileBackButton").addEventListener("click", openMyProfileHome);
  document.querySelector("#profileRemoveAvatarButton").addEventListener("click", removeProfileAvatarImage);
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

function bindMyProfilePanelEvents() {
  document.querySelector("#profileCloseButton")?.addEventListener("click", closeProfilePanel);
  document.querySelector("#myProfileEditButton")?.addEventListener("click", openProfileEditorFromHome);
  document.querySelector("#myProfileSettingsButton")?.addEventListener("click", () => {
    closeProfilePanel();
    openSettingsPanel();
  });
  document.querySelector("#myProfileRefreshButton")?.addEventListener("click", () => syncMyWorldMessages());
  document.querySelector("#myProfileOpenWorldButton")?.addEventListener("click", () => {
    closeProfilePanel();
    state.worldOpen = true;
    saveState();
    render();
  });
  document.querySelector("#profileLogoutButton")?.addEventListener("click", () => {
    closeProfilePanel();
    logoutUser();
  });

  document.querySelectorAll("[data-my-world-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      editingWorldMessageId = button.dataset.myWorldEdit || "";
      renderProfilePanel();
      window.setTimeout(() => document.querySelector("#myProfileEditText")?.focus(), 0);
    });
  });

  document.querySelectorAll("[data-my-world-cancel]").forEach((button) => {
    button.addEventListener("click", () => {
      editingWorldMessageId = "";
      renderProfilePanel();
    });
  });

  document.querySelectorAll("[data-my-world-save]").forEach((button) => {
    button.addEventListener("click", () => saveMyWorldMessageEdit(button.dataset.myWorldSave || ""));
  });

  document.querySelectorAll("[data-my-world-delete]").forEach((button) => {
    button.addEventListener("click", () => removeMyWorldMessage(button.dataset.myWorldDelete || ""));
  });
}

function openMyProfileHome() {
  profilePanelView = "home";
  editingWorldMessageId = "";
  clearPendingProfileAvatarImage();
  renderProfilePanel();
}

function openProfileEditorFromHome() {
  profilePanelView = "edit";
  editingWorldMessageId = "";
  clearPendingProfileAvatarImage({ renderPreview: false });
  renderProfilePanel();
}

function renderMyProfileFeed(messages) {
  if (isMyWorldMessagesLoading && !messages.length) {
    return `<div class="my-profile-empty"><strong>正在读取你的动态…</strong><small>稍等一下，世界频道内容马上回来。</small></div>`;
  }

  if (!messages.length) {
    return `
      <div class="my-profile-empty">
        <strong>你还没有发布内容</strong>
        <small>去世界频道分享一个随机结果吧。</small>
        <button class="secondary-button" id="myProfileOpenWorldButton" type="button">打开世界频道</button>
      </div>
    `;
  }

  return `
    <div class="my-profile-message-list">
      ${messages.map(renderMyProfileMessage).join("")}
    </div>
  `;
}

function renderMyProfileMessage(message) {
  const isEditing = editingWorldMessageId === message.id;
  const text = getWorldMessageText(message);
  const displayText = text || (message.attachment?.type === "image" ? "图片动态" : "（没有文字）");
  const likeMarkup = Number(message.likeCount) > 0 ? `<small>♡ ${Number(message.likeCount)}</small>` : "";

  return `
    <article class="my-profile-message">
      <div class="my-profile-message-header">
        <span>${escapeHtml(formatProfileMessageTime(message))}</span>
        ${likeMarkup}
      </div>
      ${isEditing ? renderMyProfileEditForm(message, displayText) : `<p class="my-profile-message-text">${escapeHtml(displayText)}</p>`}
      ${renderWorldAttachment(message.attachment)}
      <div class="my-profile-message-actions">
        ${isEditing
          ? `
            <button class="primary-button compact-primary" type="button" data-my-world-save="${escapeHtml(message.id)}">保存</button>
            <button class="secondary-button" type="button" data-my-world-cancel="${escapeHtml(message.id)}">取消</button>
          `
          : `
            <button class="secondary-button" type="button" data-my-world-edit="${escapeHtml(message.id)}">编辑文字</button>
            <button class="secondary-button settings-clear-button" type="button" data-my-world-delete="${escapeHtml(message.id)}">移除</button>
          `}
      </div>
    </article>
  `;
}

function renderMyProfileEditForm(message, displayText) {
  return `
    <div class="my-profile-edit">
      <label for="myProfileEditText">编辑文字</label>
      <textarea id="myProfileEditText" maxlength="220">${escapeHtml(message.text || displayText)}</textarea>
      <small>最多 220 字；图片本身不会被修改。</small>
    </div>
  `;
}

function getMyProfileMessages(currentUser) {
  const source = myWorldMessages.length ? myWorldMessages : state.worldMessages;

  return source
    .map(normalizeWorldMessage)
    .filter((message) => isOwnWorldMessage(message, currentUser))
    .filter((message) => !isDeletedWorldMessageClient(message))
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
    .slice(0, 20);
}

function isOwnWorldMessage(message, currentUser = getCurrentUser()) {
  if (!message || !currentUser) {
    return false;
  }

  return Boolean(
    (message.accountId && currentUser.id && message.accountId === currentUser.id)
      || (message.userId && currentUser.userId && message.userId === currentUser.userId)
      || (message.username && currentUser.username && message.username === currentUser.username),
  );
}

function isDeletedWorldMessageClient(message) {
  return message?.isDeleted === true || Boolean(message?.deletedAt);
}

function formatProfileMessageTime(message) {
  const date = message?.createdAt ? new Date(message.createdAt) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return message?.time || "刚刚";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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
      <button class="more-menu-item" id="menuFeedbackButton" type="button" role="menuitem">
        <strong>反馈问题</strong>
        <small>提交 Bug、建议或内容错误</small>
      </button>
      <button class="more-menu-item" id="menuSettingsButton" type="button" role="menuitem">
        <strong>${escapeHtml(t("menu.settings", "设置"))}</strong>
        <small>账号、隐私、偏好和应用信息</small>
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
  document.querySelector("#menuFeedbackButton").addEventListener("click", openFeedbackPanel);
  document.querySelector("#menuSettingsButton").addEventListener("click", openSettingsPanel);
  document.querySelector("#languageSelect").addEventListener("change", (event) => changeLanguage(event.target.value));
}

function getCurrentReleaseNote() {
  return RELEASE_NOTES.find((note) => note.version === APP_VERSION) || RELEASE_NOTES[0];
}

function renderReleaseNotesSection() {
  const releaseNote = getCurrentReleaseNote();

  if (!releaseNote) {
    return "";
  }

  return `
    <section class="settings-section release-notes-section" id="releaseNotesSection" aria-label="版本更新内容" ${isReleaseNotesPanelOpen ? "" : "hidden"}>
      <div class="settings-section-heading release-notes-heading">
        <div>
          <strong>v${escapeHtml(releaseNote.version)} · ${escapeHtml(releaseNote.title)}</strong>
          <small>${escapeHtml(releaseNote.date)} · ${escapeHtml(releaseNote.summary)}</small>
        </div>
        <button class="ghost-button compact-ghost release-notes-close" id="releaseNotesCloseButton" type="button">收起</button>
      </div>
      <div class="release-notes-grid">
        <div class="release-notes-card">
          <strong>这次你会看到</strong>
          <ul>
            ${releaseNote.userChanges.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>
        <div class="release-notes-card is-technical">
          <strong>技术整理</strong>
          <ul>
            ${releaseNote.technicalChanges.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>
      </div>
    </section>
  `;
}

function formatWorldTopics(topics) {
  const normalizedTopics = Array.isArray(topics) && topics.length ? topics : DEFAULT_ACCOUNT_SETTINGS.preferences.worldTopics;
  return normalizedTopics.join(", ");
}

function parseWorldTopics(value) {
  const topics = String(value || "")
    .split(/[,，、;；|]+/)
    .map((topic) => topic.trim().slice(0, 40))
    .filter(Boolean);

  return [...new Set(topics)].slice(0, 12).length ? [...new Set(topics)].slice(0, 12) : [...DEFAULT_ACCOUNT_SETTINGS.preferences.worldTopics];
}

function renderSettingsPanel() {
  if (elements.settingsPanel.hidden) {
    return;
  }

  const currentUser = getCurrentUser();
  const settings = normalizeAccountSettings(currentUser?.settings);
  const isLoggedIn = Boolean(currentUser);
  const disabled = isLoggedIn ? "" : "disabled";

  elements.settingsPanel.innerHTML = `
    <form class="settings-form" id="settingsForm">
      <div class="floating-panel-header">
        <div>
          <strong>设置中心</strong>
          <small>账号、隐私、偏好和应用信息集中整理</small>
        </div>
        <button class="ghost-button compact-ghost" id="settingsCloseButton" type="button">${escapeHtml(t("actions.close", "关闭"))}</button>
      </div>
      ${!isLoggedIn ? '<p class="settings-login-hint">登入后可以保存隐私和内容偏好到云端。</p>' : ""}
      <section class="settings-section">
        <div class="settings-section-heading">
          <strong>账号</strong>
          <small>${isLoggedIn ? escapeHtml(getUserDisplayName(currentUser)) : "尚未登入"}</small>
        </div>
        <div class="settings-action-grid">
          <button class="secondary-button" id="settingsEditProfileButton" type="button" ${disabled}>编辑个人资料</button>
          <button class="secondary-button" id="settingsPasswordButton" type="button" ${disabled}>修改密码</button>
          <button class="secondary-button profile-logout-button" id="settingsLogoutButton" type="button" ${disabled}>登出账号</button>
        </div>
      </section>
      <section class="settings-section">
        <div class="settings-section-heading">
          <strong>隐私</strong>
          <small>好友和世界频道相关设置先保存数据结构，功能入口暂不开放。</small>
        </div>
        <label class="settings-toggle">
          <span><strong>允许别人搜索到我</strong><small>为之后好友搜索预留</small></span>
          <input id="settingsDiscoverable" type="checkbox" ${settings.privacy.discoverable ? "checked" : ""} ${disabled} />
        </label>
        <label class="settings-toggle">
          <span><strong>允许好友申请</strong><small>功能未开放前不会显示好友入口</small></span>
          <input id="settingsAllowFriendRequests" type="checkbox" ${settings.privacy.allowFriendRequests ? "checked" : ""} ${disabled} />
        </label>
        <label class="settings-toggle">
          <span><strong>显示在线状态</strong><small>为之后世界频道和好友状态预留</small></span>
          <input id="settingsShowOnlineStatus" type="checkbox" ${settings.privacy.showOnlineStatus ? "checked" : ""} ${disabled} />
        </label>
        <div class="field">
          <label for="settingsAllowDirectMessages">允许私聊</label>
          <select id="settingsAllowDirectMessages" ${disabled}>
            <option value="everyone" ${settings.privacy.allowDirectMessages === "everyone" ? "selected" : ""}>所有人</option>
            <option value="friendsOnly" ${settings.privacy.allowDirectMessages === "friendsOnly" ? "selected" : ""}>仅好友</option>
            <option value="none" ${settings.privacy.allowDirectMessages === "none" ? "selected" : ""}>不允许</option>
          </select>
        </div>
      </section>
      <section class="settings-section">
        <div class="settings-section-heading">
          <strong>内容偏好</strong>
          <small>保存默认语言、货币和世界频道筛选偏好。</small>
        </div>
        <div class="settings-grid">
          <div class="field">
            <label for="settingsLanguage">默认语言</label>
            <select id="settingsLanguage" ${disabled}>
              ${SUPPORTED_LANGUAGES.map((language) => `<option value="${language}" ${settings.preferences.language === language ? "selected" : ""}>${LANGUAGE_LABELS[language]}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="settingsCurrency">默认货币</label>
            <select id="settingsCurrency" ${disabled}>
              ${Object.entries(CURRENCY_RATES).map(([code, currency]) => `<option value="${code}" ${settings.preferences.currency === code ? "selected" : ""}>${code} · ${escapeHtml(currency.label)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="settingsWorldRegion">世界频道地区</label>
            <select id="settingsWorldRegion" ${disabled}>
              ${WORLD_REGION_OPTIONS.map((region) => `<option value="${region.value}" ${settings.preferences.worldRegion === region.value ? "selected" : ""}>${region.label}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="settingsWorldTopics">世界频道主题筛选</label>
            <input id="settingsWorldTopics" value="${escapeHtml(formatWorldTopics(settings.preferences.worldTopics))}" placeholder="general, food, travel" ${disabled} />
          </div>
        </div>
      </section>
      <section class="settings-section">
        <div class="settings-section-heading">
          <strong>应用</strong>
          <small>当前版本、更新内容、反馈和本机记录。</small>
        </div>
        <button class="settings-version-button" id="settingsVersionButton" type="button" aria-expanded="${isReleaseNotesPanelOpen}">
          <span>当前版本</span>
          <strong>v${APP_VERSION}</strong>
          <small id="settingsVersionHint">${isReleaseNotesPanelOpen ? "更新内容已展开" : "点击查看更新内容"}</small>
        </button>
        <div class="settings-action-grid settings-utility-actions">
          <button class="secondary-button settings-feedback-button" id="settingsFeedbackButton" type="button">反馈问题</button>
          <button class="secondary-button settings-clear-button" id="settingsClearLocalButton" type="button">清除记录</button>
        </div>
      </section>
      ${renderReleaseNotesSection()}
      <section class="settings-section">
        <div class="settings-section-heading connected-apps-heading">
          <div>
            <strong>关联小应用</strong>
            <small>未来可以把随心转盘和更多生活奇思妙想小工具连接到同一个账号，方便同步个人资料、设置和使用记录。</small>
          </div>
          <span class="connected-apps-badge">开发中</span>
        </div>
        <div class="connected-apps-row" aria-label="关联小应用示例">
          <article class="connected-app-card is-current">
            <span class="connected-app-icon connected-app-icon-image">
              <img src="./assets/icons/app-icon.png" alt="" loading="lazy" />
            </span>
            <div class="connected-app-copy">
              <strong>随心转盘</strong>
              <small>当前应用</small>
            </div>
            <span class="connected-app-status is-current">当前</span>
          </article>
          <article class="connected-app-card is-disabled" aria-disabled="true">
            <span class="connected-app-icon">🧩</span>
            <div class="connected-app-copy">
              <strong>奇思妙想工具</strong>
              <small>计划中</small>
            </div>
            <span class="connected-app-status">计划中</span>
          </article>
          <article class="connected-app-card is-disabled" aria-disabled="true">
            <span class="connected-app-icon">🧩</span>
            <div class="connected-app-copy">
              <strong>生活记录工具</strong>
              <small>计划中</small>
            </div>
            <span class="connected-app-status">计划中</span>
          </article>
          <article class="connected-app-card is-disabled" aria-disabled="true">
            <span class="connected-app-icon">🧩</span>
            <div class="connected-app-copy">
              <strong>更多小工具</strong>
              <small>计划中</small>
            </div>
            <span class="connected-app-status">计划中</span>
          </article>
        </div>
        <p class="settings-footnote">当前只是占位展示：不会跳转外部应用，不会读取其他应用数据，也不会启动真实授权。</p>
      </section>
      <div class="settings-form-actions">
        <button class="primary-button compact-primary" id="settingsSubmitButton" type="submit" ${disabled}>保存设置</button>
      </div>
    </form>
  `;

  document.querySelector("#settingsCloseButton").addEventListener("click", closeSettingsPanel);
  document.querySelector("#settingsEditProfileButton").addEventListener("click", () => openProfileFromSettings());
  document.querySelector("#settingsPasswordButton").addEventListener("click", () => openProfileFromSettings("password"));
  document.querySelector("#settingsLogoutButton").addEventListener("click", () => {
    closeSettingsPanel();
    logoutUser();
  });
  document.querySelector("#settingsVersionButton").addEventListener("click", toggleReleaseNotesFromSettings);
  document.querySelector("#releaseNotesCloseButton")?.addEventListener("click", closeReleaseNotesFromSettings);
  document.querySelector("#settingsFeedbackButton").addEventListener("click", openFeedbackPanel);
  document.querySelector("#settingsClearLocalButton").addEventListener("click", clearHistory);
  document.querySelector("#settingsForm").addEventListener("submit", saveSettingsCenter);
}

function getSettingsFormPayload() {
  const existingSettings = normalizeAccountSettings(getCurrentUser()?.settings);

  return normalizeAccountSettings({
    privacy: {
      discoverable: document.querySelector("#settingsDiscoverable")?.checked,
      allowFriendRequests: document.querySelector("#settingsAllowFriendRequests")?.checked,
      allowDirectMessages: document.querySelector("#settingsAllowDirectMessages")?.value,
      showOnlineStatus: document.querySelector("#settingsShowOnlineStatus")?.checked,
      hideLotteryContent: existingSettings.privacy.hideLotteryContent,
    },
    preferences: {
      language: document.querySelector("#settingsLanguage")?.value,
      currency: document.querySelector("#settingsCurrency")?.value,
      worldRegion: document.querySelector("#settingsWorldRegion")?.value,
      worldTopics: parseWorldTopics(document.querySelector("#settingsWorldTopics")?.value),
    },
  });
}

async function saveSettingsCenter(event) {
  event.preventDefault();

  const currentUser = getCurrentUser();
  const submitButton = document.querySelector("#settingsSubmitButton");

  if (!currentUser) {
    showToast("请先登入后再保存设置。");
    return;
  }

  const settings = getSettingsFormPayload();

  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "正在保存…";
    }

    const payload = await authRequest("update-settings", { settings });
    const updatedUser = applyAuthSession(payload);
    const preferences = normalizeAccountSettings(updatedUser.settings).preferences;

    state.language = preferences.language;
    state.languageManuallySelected = true;
    state.currency = preferences.currency;
    saveState();
    render();
    showToast("设置已保存。");
  } catch (error) {
    reportClientError(error, {
      type: "auth-settings-update-failed",
      source: AUTH_ENDPOINT,
    });
    showToast(error.message || "设置暂时保存不了。");
  } finally {
    const currentSubmitButton = document.querySelector("#settingsSubmitButton");

    if (currentSubmitButton) {
      currentSubmitButton.disabled = false;
      currentSubmitButton.textContent = "保存设置";
    }
  }
}

function renderFeedbackPanel() {
  if (elements.feedbackPanel.hidden) {
    return;
  }

  elements.feedbackPanel.innerHTML = `
    <form class="feedback-form" id="feedbackForm">
      <div class="floating-panel-header">
        <div>
          <strong>反馈问题</strong>
          <small>Bug、建议、UI 或内容错误都可以告诉我</small>
        </div>
        <button class="ghost-button compact-ghost" id="feedbackCloseButton" type="button">${escapeHtml(t("actions.close", "关闭"))}</button>
      </div>
      <div class="field">
        <label for="feedbackType">反馈类型</label>
        <select id="feedbackType" name="type" required>
          ${FEEDBACK_TYPES.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label for="feedbackTitle">标题</label>
        <input id="feedbackTitle" name="title" maxlength="80" required placeholder="一句话说明问题" />
        <small class="field-hint">最多 80 字，不要填写密码或密钥。</small>
      </div>
      <div class="field">
        <label for="feedbackMessage">详细说明</label>
        <textarea id="feedbackMessage" name="message" maxlength="1000" required placeholder="发生了什么？你期待它怎么工作？"></textarea>
        <small class="field-hint">最多 1000 字，请不要提交密码、token 或 private key。</small>
      </div>
      <div class="field">
        <label for="feedbackContact">联系方式（可选）</label>
        <input id="feedbackContact" name="contact" maxlength="160" autocomplete="off" placeholder="Email / IG / Telegram，方便需要时追问" />
      </div>
      <div class="feedback-context">
        <span>当前模式：${escapeHtml(getModeTitle(state.mode))}</span>
        <span>设备：${window.innerWidth}×${window.innerHeight}</span>
      </div>
      <div class="feedback-form-actions">
        <button class="primary-button compact-primary" id="feedbackSubmitButton" type="submit">提交反馈</button>
      </div>
    </form>
  `;

  document.querySelector("#feedbackCloseButton").addEventListener("click", closeFeedbackPanel);
  document.querySelector("#feedbackForm").addEventListener("submit", submitFeedback);
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
          <small>登录后可发送</small>
        </div>
        <div class="auth-mode-tabs" role="tablist" aria-label="登入注册切换">
          <button class="auth-mode-tab${!isRegisterMode ? " is-active" : ""}" type="button" data-auth-mode="login" aria-pressed="${!isRegisterMode}">登入</button>
          <button class="auth-mode-tab${isRegisterMode ? " is-active" : ""}" type="button" data-auth-mode="register" aria-pressed="${isRegisterMode}">注册</button>
        </div>
        <div class="field">
          <label for="authUsername">用户名</label>
          <input id="authUsername" autocomplete="username" maxlength="20" placeholder="2-20 字，例如 xiaoming" />
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

  const displayName = getUserDisplayName(currentUser);
  const worldPlaceholder = getWorldPlaceholder();

  elements.worldAuthPanel.innerHTML = `
    <form class="world-panel message-panel world-composer-panel" id="worldMessageForm">
      <div class="world-composer-top">
        <div class="world-composer-user">
          <span class="world-avatar world-composer-avatar" aria-hidden="true">
            ${renderAvatarContent({
              avatar: getUserAvatar(currentUser),
              avatarUrl: getUserAvatarUrl(currentUser),
              name: displayName,
              className: "world-avatar-image",
            })}
          </span>
          <div class="world-composer-copy">
            <strong>${escapeHtml(displayName)}</strong>
            <small><span class="world-online-dot" aria-hidden="true"></span>在线</small>
          </div>
        </div>
      </div>
      <div class="field world-message-field">
        <label for="worldMessageInput">发一句到世界频道</label>
        <div class="world-textarea-wrap">
          <textarea id="worldMessageInput" maxlength="${WORLD_MESSAGE_MAX_LENGTH}" rows="2" placeholder="${escapeHtml(worldPlaceholder)}"></textarea>
          <small class="world-character-hint" id="worldCharacterHint" aria-live="polite" hidden></small>
        </div>
      </div>
      <div class="world-composer-actions">
        <button class="primary-button compact-primary" id="worldSendButton" type="submit">发送</button>
        <div class="world-image-action">
          <label class="image-upload-button">
            <input id="worldImageInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
            选择图片
          </label>
          <small class="upload-status" id="worldUploadStatus">先预览再发送</small>
        </div>
      </div>
      <div class="pending-image-preview" id="worldPendingImage" hidden>
        <img id="worldPendingImageThumb" alt="待发送图片缩略图" />
        <div class="world-crop-copy">
          <strong id="worldPendingImageName"></strong>
          <small id="worldPendingImageMeta">图片已准备，点「发送」才上传。</small>
        </div>
        <button class="ghost-button compact-ghost" id="clearWorldImageButton" type="button">移除</button>
      </div>
    </form>
  `;
  document.querySelector("#worldMessageForm").addEventListener("submit", (event) => {
    event.preventDefault();
    sendWorldMessage();
  });
  document.querySelector("#worldMessageInput").addEventListener("input", updateWorldCharacterHint);
  document.querySelector("#worldImageInput").addEventListener("change", prepareWorldImage);
  document.querySelector("#clearWorldImageButton").addEventListener("click", () => clearPendingWorldImage());
  updateWorldCharacterHint();
  updatePendingImagePreview();
}

function pickWorldPlaceholder() {
  currentWorldPlaceholder = randomChoice(WORLD_PLACEHOLDERS) || WORLD_PLACEHOLDERS[0] || "世界频道等你丢一句话。";
  return currentWorldPlaceholder;
}

function getWorldPlaceholder() {
  return currentWorldPlaceholder || pickWorldPlaceholder();
}

function getWorldCharacterHint(length) {
  const remaining = Math.max(WORLD_MESSAGE_MAX_LENGTH - length, 0);

  if (length >= WORLD_MESSAGE_MAX_LENGTH) {
    return "字数满了，先发出去吧";
  }

  if (length >= 215) {
    return `快满了，还剩 ${remaining} 字`;
  }

  if (length >= 200) {
    return `还可以输入 ${remaining} 字`;
  }

  return "";
}

function resizeWorldMessageInput(textarea = document.querySelector("#worldMessageInput")) {
  if (!textarea) {
    return;
  }

  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
}

function updateWorldCharacterHint() {
  const input = document.querySelector("#worldMessageInput");
  const hint = document.querySelector("#worldCharacterHint");

  if (!input || !hint) {
    return;
  }

  const textLength = input.value.length;
  const message = getWorldCharacterHint(textLength);
  hint.textContent = message;
  hint.hidden = !message;
  resizeWorldMessageInput(input);
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
  const visibleMessages = state.worldMessages.filter((message) => !isDeletedWorldMessageClient(message));

  elements.worldChatCount.textContent = `${visibleMessages.length} 条消息`;
  elements.worldChatList.innerHTML = `
    <div class="world-chat">
      ${visibleMessages
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

function normalizeBooleanSetting(value, fallback) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}

function normalizePrivacySettings(privacy) {
  const source = privacy && typeof privacy === "object" ? privacy : {};
  const allowDirectMessages = DIRECT_MESSAGE_POLICIES.has(source.allowDirectMessages)
    ? source.allowDirectMessages
    : DEFAULT_PRIVACY_SETTINGS.allowDirectMessages;

  return {
    discoverable: normalizeBooleanSetting(source.discoverable, DEFAULT_PRIVACY_SETTINGS.discoverable),
    showOnlineStatus: normalizeBooleanSetting(source.showOnlineStatus, DEFAULT_PRIVACY_SETTINGS.showOnlineStatus),
    allowFriendRequests: normalizeBooleanSetting(source.allowFriendRequests, DEFAULT_PRIVACY_SETTINGS.allowFriendRequests),
    allowDirectMessages,
  };
}

function normalizeWorldPreferenceSettings(worldPreferences) {
  const source = worldPreferences && typeof worldPreferences === "object" ? worldPreferences : {};
  const topics = Array.isArray(source.topics)
    ? [...new Set(source.topics.map((topic) => String(topic || "").trim().slice(0, 40)).filter(Boolean))].slice(0, 12)
    : [...DEFAULT_WORLD_PREFERENCES.topics];

  return {
    language: String(source.language || "").trim().slice(0, 20) || DEFAULT_WORLD_PREFERENCES.language,
    region: String(source.region || "").trim().slice(0, 60) || DEFAULT_WORLD_PREFERENCES.region,
    topics,
    hideLottery: normalizeBooleanSetting(source.hideLottery, DEFAULT_WORLD_PREFERENCES.hideLottery),
  };
}

function normalizeAccountSettings(settings) {
  const source = settings && typeof settings === "object" ? settings : {};
  const privacySource = source.privacy && typeof source.privacy === "object" ? source.privacy : {};
  const preferenceSource = source.preferences && typeof source.preferences === "object" ? source.preferences : {};
  const allowDirectMessages = DIRECT_MESSAGE_POLICIES.has(privacySource.allowDirectMessages)
    ? privacySource.allowDirectMessages
    : DEFAULT_ACCOUNT_SETTINGS.privacy.allowDirectMessages;
  const worldTopics = Array.isArray(preferenceSource.worldTopics)
    ? [...new Set(preferenceSource.worldTopics.map((topic) => String(topic || "").trim().slice(0, 40)).filter(Boolean))].slice(0, 12)
    : [...DEFAULT_ACCOUNT_SETTINGS.preferences.worldTopics];

  return {
    privacy: {
      discoverable: normalizeBooleanSetting(privacySource.discoverable, DEFAULT_ACCOUNT_SETTINGS.privacy.discoverable),
      allowFriendRequests: normalizeBooleanSetting(privacySource.allowFriendRequests, DEFAULT_ACCOUNT_SETTINGS.privacy.allowFriendRequests),
      allowDirectMessages,
      showOnlineStatus: normalizeBooleanSetting(privacySource.showOnlineStatus, DEFAULT_ACCOUNT_SETTINGS.privacy.showOnlineStatus),
      hideLotteryContent: normalizeBooleanSetting(privacySource.hideLotteryContent, DEFAULT_ACCOUNT_SETTINGS.privacy.hideLotteryContent),
    },
    preferences: {
      language: normalizeLanguage(preferenceSource.language || DEFAULT_ACCOUNT_SETTINGS.preferences.language),
      currency: CURRENCY_RATES[preferenceSource.currency] ? preferenceSource.currency : DEFAULT_ACCOUNT_SETTINGS.preferences.currency,
      worldRegion: String(preferenceSource.worldRegion || DEFAULT_ACCOUNT_SETTINGS.preferences.worldRegion).trim().slice(0, 60),
      worldTopics,
    },
  };
}

function normalizeAccountUser(user = {}) {
  const displayName = user.displayName || user.username;
  const settings = normalizeAccountSettings(user.settings);

  return {
    id: user.id || "",
    username: user.username,
    userId: user.userId || "",
    displayName,
    avatar: normalizeAvatar("", displayName),
    avatarUrl: user.avatarUrl || "",
    settings,
    privacy: normalizePrivacySettings(user.privacy),
    worldPreferences: normalizeWorldPreferenceSettings(user.worldPreferences),
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

function applyAccountPreferences(user) {
  const preferences = normalizeAccountSettings(user?.settings).preferences;

  state.language = normalizeLanguage(preferences.language);
  state.languageManuallySelected = true;

  if (CURRENCY_RATES[preferences.currency]) {
    state.currency = preferences.currency;
  }
}

function applyAuthSession(payload) {
  const user = rememberAuthUser(payload.user);
  applyAccountPreferences(user);
  state.auth.currentUser = user.username;
  state.auth.token = payload.token || state.auth.token;
  state.userId = user.userId || state.userId;
  saveState();

  return user;
}

function clearAuthSession(options = {}) {
  const { clearLocalRecords = false } = options;

  closeAvatarCropModal({ resetInput: true, silent: true, restorePrevious: false });
  clearPendingWorldImage({ updateStatus: false });
  clearPendingProfileAvatarImage({ renderPreview: false });
  cleanupAllImageCropInteractions();
  const worldInput = document.querySelector("#worldMessageInput");

  if (worldInput) {
    worldInput.value = "";
  }

  if (clearLocalRecords) {
    state.history = [];
    state.favorites = [];
    state.uploads = [];
    state.currentResult = null;
    state.users = [];
    myWorldMessages = [];
    myWorldMessagesError = "";
    editingWorldMessageId = "";
    profilePanelView = "home";
  }
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
  return Array.from(String(name || "游").trim())[0]?.toUpperCase() || "游";
}

function normalizeAvatar(value, fallbackName = "游") {
  return String(value || "").trim().slice(0, 2) || getAvatarText(fallbackName);
}

function getUserDisplayName(user) {
  return user?.displayName || user?.username || "游客";
}

function getUserAvatar(user) {
  return normalizeAvatar("", getUserDisplayName(user));
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
  if (state.worldOpen) {
    pickWorldPlaceholder();
  }
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
    showToast("请先登入，再查看我的主页。");
    return;
  }

  isProfilePanelOpen = !isProfilePanelOpen;
  profilePanelView = "home";
  editingWorldMessageId = "";
  clearPendingProfileAvatarImage({ renderPreview: false });
  isNotificationPanelOpen = false;
  isMoreMenuOpen = false;
  isFeedbackPanelOpen = false;
  isSettingsPanelOpen = false;
  renderTopUserTools();

  if (isProfilePanelOpen) {
    syncMyWorldMessages({ silent: true });
  }
}

function closeProfilePanel() {
  isProfilePanelOpen = false;
  profilePanelView = "home";
  editingWorldMessageId = "";
  clearPendingProfileAvatarImage();
  renderTopUserTools();
}

function toggleNotificationPanel() {
  isNotificationPanelOpen = !isNotificationPanelOpen;
  isProfilePanelOpen = false;
  isMoreMenuOpen = false;
  isFeedbackPanelOpen = false;
  isSettingsPanelOpen = false;

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
  isFeedbackPanelOpen = false;
  isSettingsPanelOpen = false;
  renderTopUserTools();
}

function closeMoreMenu() {
  if (!isMoreMenuOpen) {
    return;
  }

  isMoreMenuOpen = false;
  renderTopUserTools();
}

function openSettingsPanel() {
  isSettingsPanelOpen = true;
  isReleaseNotesPanelOpen = false;
  isMoreMenuOpen = false;
  isNotificationPanelOpen = false;
  isProfilePanelOpen = false;
  isFeedbackPanelOpen = false;
  renderTopUserTools();
}

function closeSettingsPanel() {
  if (!isSettingsPanelOpen) {
    return;
  }

  isSettingsPanelOpen = false;
  renderTopUserTools();
}

function openProfileFromSettings(target = "profile") {
  if (!getCurrentUser()) {
    showToast("请先登入再编辑账号。");
    return;
  }

  isSettingsPanelOpen = false;
  isProfilePanelOpen = true;
  profilePanelView = "edit";
  editingWorldMessageId = "";
  isMoreMenuOpen = false;
  isNotificationPanelOpen = false;
  isFeedbackPanelOpen = false;
  renderTopUserTools();

  if (target === "password") {
    window.setTimeout(() => document.querySelector("#profileCurrentPassword")?.focus(), 0);
  }
}

function toggleReleaseNotesFromSettings() {
  isReleaseNotesPanelOpen = !isReleaseNotesPanelOpen;
  updateReleaseNotesVisibility();

  if (isReleaseNotesPanelOpen) {
    window.setTimeout(() => document.querySelector(".release-notes-section")?.scrollIntoView({ block: "nearest" }), 0);
  }
}

function closeReleaseNotesFromSettings() {
  isReleaseNotesPanelOpen = false;
  updateReleaseNotesVisibility();
}

function updateReleaseNotesVisibility() {
  const releaseNotesSection = document.querySelector("#releaseNotesSection");
  const settingsVersionButton = document.querySelector("#settingsVersionButton");
  const settingsVersionHint = document.querySelector("#settingsVersionHint");

  if (releaseNotesSection) {
    releaseNotesSection.hidden = !isReleaseNotesPanelOpen;
  }

  if (settingsVersionButton) {
    settingsVersionButton.setAttribute("aria-expanded", String(isReleaseNotesPanelOpen));
  }

  if (settingsVersionHint) {
    settingsVersionHint.textContent = isReleaseNotesPanelOpen ? "更新内容已展开" : "点击查看更新内容";
  }
}

function openFeedbackPanel() {
  isFeedbackPanelOpen = true;
  isMoreMenuOpen = false;
  isNotificationPanelOpen = false;
  isProfilePanelOpen = false;
  isSettingsPanelOpen = false;
  renderTopUserTools();
  window.setTimeout(() => document.querySelector("#feedbackTitle")?.focus(), 0);
}

function closeFeedbackPanel() {
  if (!isFeedbackPanelOpen) {
    return;
  }

  isFeedbackPanelOpen = false;
  renderTopUserTools();
}

function handleDocumentClick(event) {
  if (!isMoreMenuOpen && !isFeedbackPanelOpen && !isSettingsPanelOpen) {
    return;
  }

  if (event.target.closest("#moreMenuButton") || event.target.closest("#moreMenuPanel")) {
    return;
  }

  if (event.target.closest("#feedbackPanel")) {
    return;
  }

  if (event.target.closest("#settingsPanel")) {
    return;
  }

  closeMoreMenu();
  closeFeedbackPanel();
  closeSettingsPanel();
}

function handleGlobalKeydown(event) {
  if (event.key === "Escape" && activeAvatarCrop) {
    closeAvatarCropModal({ resetInput: true });
  }

  if (event.key === "Escape" && isMoreMenuOpen) {
    closeMoreMenu();
  }

  if (event.key === "Escape" && isFeedbackPanelOpen) {
    closeFeedbackPanel();
  }

  if (event.key === "Escape" && isSettingsPanelOpen) {
    closeSettingsPanel();
  }
}

function getImageFileExtension(contentType) {
  if (contentType === "image/webp") {
    return "webp";
  }

  if (contentType === "image/png") {
    return "png";
  }

  return "jpg";
}

function makeProcessedImageName(file, suffix, contentType = "image/jpeg") {
  const baseName = String(file?.name || "image").replace(/\.[^.]+$/, "").replace(/[^\w\u4e00-\u9fa5-]+/g, "-").slice(0, 48) || "image";
  return `${baseName}-${suffix}.${getImageFileExtension(contentType)}`;
}

function validateSelectedImage(file, label = "图片") {
  if (!file) {
    return false;
  }

  if (!IMAGE_CONTENT_TYPES.has(file.type)) {
    showToast(`只支持 PNG / JPG / WebP / GIF ${label}。`);
    return false;
  }

  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    showToast(`${label}太大了，请选择 12MB 以内的图片。`);
    return false;
  }

  return true;
}

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片读取失败，请换一张图片试试。"));
    image.decoding = "async";
    image.src = url;
  });
}

function canvasToBlob(canvas, contentType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("图片处理失败，请换一张图片试试。"));
        return;
      }

      resolve(blob);
    }, contentType, quality);
  });
}

function getBaseCropRect(width, height, aspectRatio) {
  if (!aspectRatio) {
    return { x: 0, y: 0, width, height };
  }

  const sourceAspect = width / height;

  if (sourceAspect > aspectRatio) {
    const cropWidth = height * aspectRatio;
    return {
      x: (width - cropWidth) / 2,
      y: 0,
      width: cropWidth,
      height,
    };
  }

  const cropHeight = width / aspectRatio;
  return {
    x: 0,
    y: (height - cropHeight) / 2,
    width,
    height: cropHeight,
  };
}

function clampNumber(value, min, max, fallback = min) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(Math.max(number, min), max);
}

function normalizeCropState(crop = {}) {
  return {
    zoom: clampNumber(crop.zoom, 1, 3, 1),
    panX: clampNumber(crop.panX, -1, 1, 0),
    panY: clampNumber(crop.panY, -1, 1, 0),
    mode: crop.mode || "",
    aspectRatio: crop.aspectRatio || null,
  };
}

function createDefaultCropState(overrides = {}) {
  return normalizeCropState({
    zoom: 1,
    panX: 0,
    panY: 0,
    ...overrides,
  });
}

function getAdjustedCropRect(image, options) {
  const aspectRatio = options.aspectRatio || null;
  const cropState = normalizeCropState(options);
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const baseCrop = getBaseCropRect(imageWidth, imageHeight, aspectRatio);

  if (!aspectRatio) {
    return baseCrop;
  }

  const cropWidth = baseCrop.width / cropState.zoom;
  const cropHeight = baseCrop.height / cropState.zoom;
  const maxOffsetX = (imageWidth - cropWidth) / 2;
  const maxOffsetY = (imageHeight - cropHeight) / 2;
  const centerX = imageWidth / 2 - maxOffsetX * cropState.panX;
  const centerY = imageHeight / 2 - maxOffsetY * cropState.panY;

  return {
    x: Math.min(Math.max(centerX - cropWidth / 2, 0), imageWidth - cropWidth),
    y: Math.min(Math.max(centerY - cropHeight / 2, 0), imageHeight - cropHeight),
    width: cropWidth,
    height: cropHeight,
  };
}

function getCropRenderMetrics(frameEl, imgEl, state) {
  const frameRect = frameEl.getBoundingClientRect();
  const frameWidth = Math.max(frameRect.width, 1);
  const frameHeight = Math.max(frameRect.height, 1);
  const imageWidth = Math.max(imgEl.naturalWidth || imgEl.width || frameWidth, 1);
  const imageHeight = Math.max(imgEl.naturalHeight || imgEl.height || frameHeight, 1);
  const cropState = normalizeCropState(state);
  const coverScale = Math.max(frameWidth / imageWidth, frameHeight / imageHeight);
  const baseWidth = imageWidth * coverScale;
  const baseHeight = imageHeight * coverScale;
  const displayWidth = baseWidth * cropState.zoom;
  const displayHeight = baseHeight * cropState.zoom;

  return {
    frameWidth,
    frameHeight,
    imageWidth,
    imageHeight,
    baseWidth,
    baseHeight,
    displayWidth,
    displayHeight,
    maxPanX: Math.max((displayWidth - frameWidth) / 2, 0),
    maxPanY: Math.max((displayHeight - frameHeight) / 2, 0),
  };
}

function applyCropTransform(frameEl, imgEl, state) {
  const cropState = normalizeCropState(state);

  if (!cropState.aspectRatio) {
    frameEl.classList.add("is-original");
    imgEl.style.width = "100%";
    imgEl.style.height = "100%";
    imgEl.style.left = "0";
    imgEl.style.top = "0";
    imgEl.style.objectFit = "contain";
    imgEl.style.transform = "none";
    return cropState;
  }

  frameEl.classList.remove("is-original");
  const metrics = getCropRenderMetrics(frameEl, imgEl, cropState);
  const normalized = normalizeCropState({
    ...cropState,
    panX: metrics.maxPanX > 0 ? cropState.panX : 0,
    panY: metrics.maxPanY > 0 ? cropState.panY : 0,
  });

  imgEl.style.left = "50%";
  imgEl.style.top = "50%";
  imgEl.style.width = `${metrics.baseWidth}px`;
  imgEl.style.height = `${metrics.baseHeight}px`;
  imgEl.style.objectFit = "fill";
  imgEl.style.transform = `translate(-50%, -50%) translate(${normalized.panX * metrics.maxPanX}px, ${normalized.panY * metrics.maxPanY}px) scale(${normalized.zoom})`;
  return normalized;
}

function cleanupImageCropInteraction(key) {
  const cleanup = imageCropInteractionCleanups.get(key);

  if (cleanup) {
    cleanup();
    imageCropInteractionCleanups.delete(key);
  }
}

function cleanupAllImageCropInteractions() {
  [...imageCropInteractionCleanups.keys()].forEach(cleanupImageCropInteraction);
}

function setupImageCropInteraction({ key, frameEl, imgEl, getState, setState, onChange }) {
  if (!frameEl || !imgEl) {
    return;
  }

  cleanupImageCropInteraction(key);

  const pointers = new Map();
  let dragStart = null;
  let pinchStart = null;

  const commitState = (nextState, options = {}) => {
    const mergedState = normalizeCropState({
      ...getState(),
      ...nextState,
    });
    const normalizedState = applyCropTransform(frameEl, imgEl, mergedState);
    setState(normalizedState);
    if (options.notify !== false) {
      onChange?.(normalizedState);
    }
    return normalizedState;
  };

  const getPointerDistance = (first, second) => Math.hypot(first.x - second.x, first.y - second.y);
  const getPointerMidpoint = (first, second) => ({
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  });
  const getPanDelta = (startState, startMetrics, deltaX, deltaY) => ({
    panX: startState.panX + deltaX / Math.max(startMetrics.maxPanX || startMetrics.frameWidth / 2, 1),
    panY: startState.panY + deltaY / Math.max(startMetrics.maxPanY || startMetrics.frameHeight / 2, 1),
  });

  const onPointerDown = (event) => {
    const currentState = normalizeCropState(getState());

    if (!currentState.aspectRatio || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    event.preventDefault();
    frameEl.setPointerCapture?.(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 1) {
      dragStart = {
        pointer: { x: event.clientX, y: event.clientY },
        state: currentState,
        metrics: getCropRenderMetrics(frameEl, imgEl, currentState),
      };
      pinchStart = null;
      frameEl.classList.add("is-dragging");
      return;
    }

    if (pointers.size >= 2) {
      const [first, second] = [...pointers.values()];
      pinchStart = {
        distance: getPointerDistance(first, second) || 1,
        midpoint: getPointerMidpoint(first, second),
        state: currentState,
        metrics: getCropRenderMetrics(frameEl, imgEl, currentState),
      };
    }
  };

  const onPointerMove = (event) => {
    if (!pointers.has(event.pointerId)) {
      return;
    }

    event.preventDefault();
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size >= 2 && pinchStart) {
      const [first, second] = [...pointers.values()];
      const distance = getPointerDistance(first, second) || pinchStart.distance;
      const midpoint = getPointerMidpoint(first, second);
      const scale = distance / Math.max(pinchStart.distance, 1);
      const panDelta = getPanDelta(
        pinchStart.state,
        pinchStart.metrics,
        midpoint.x - pinchStart.midpoint.x,
        midpoint.y - pinchStart.midpoint.y,
      );

      commitState({
        ...panDelta,
        zoom: pinchStart.state.zoom * scale,
      });
      return;
    }

    if (pointers.size === 1 && dragStart) {
      const currentPointer = pointers.get(event.pointerId);
      commitState(getPanDelta(
        dragStart.state,
        dragStart.metrics,
        currentPointer.x - dragStart.pointer.x,
        currentPointer.y - dragStart.pointer.y,
      ));
    }
  };

  const onPointerEnd = (event) => {
    pointers.delete(event.pointerId);
    if (frameEl.hasPointerCapture?.(event.pointerId)) {
      frameEl.releasePointerCapture(event.pointerId);
    }

    if (!pointers.size) {
      dragStart = null;
      pinchStart = null;
      frameEl.classList.remove("is-dragging");
      return;
    }

    if (pointers.size === 1) {
      const [pointer] = [...pointers.values()];
      const currentState = normalizeCropState(getState());
      dragStart = {
        pointer,
        state: currentState,
        metrics: getCropRenderMetrics(frameEl, imgEl, currentState),
      };
      pinchStart = null;
    }
  };

  const onWheel = (event) => {
    const currentState = normalizeCropState(getState());

    if (!currentState.aspectRatio) {
      return;
    }

    event.preventDefault();
    const scale = Math.exp(-event.deltaY * 0.0016);
    commitState({
      zoom: currentState.zoom * scale,
    });
  };

  const onImageLoad = () => {
    if (key === "world" && pendingWorldImage && imgEl.naturalWidth && imgEl.naturalHeight) {
      pendingWorldImage.sourceWidth = imgEl.naturalWidth;
      pendingWorldImage.sourceHeight = imgEl.naturalHeight;
      syncWorldCropModalControls();
    }

    commitState(getState(), { notify: false });
  };
  const onDragStart = (event) => event.preventDefault();

  frameEl.addEventListener("pointerdown", onPointerDown);
  frameEl.addEventListener("pointermove", onPointerMove);
  frameEl.addEventListener("pointerup", onPointerEnd);
  frameEl.addEventListener("pointercancel", onPointerEnd);
  frameEl.addEventListener("lostpointercapture", onPointerEnd);
  frameEl.addEventListener("wheel", onWheel, { passive: false });
  imgEl.addEventListener("load", onImageLoad);
  imgEl.addEventListener("dragstart", onDragStart);

  if (imgEl.complete) {
    commitState(getState(), { notify: false });
  }

  imageCropInteractionCleanups.set(key, () => {
    frameEl.removeEventListener("pointerdown", onPointerDown);
    frameEl.removeEventListener("pointermove", onPointerMove);
    frameEl.removeEventListener("pointerup", onPointerEnd);
    frameEl.removeEventListener("pointercancel", onPointerEnd);
    frameEl.removeEventListener("lostpointercapture", onPointerEnd);
    frameEl.removeEventListener("wheel", onWheel);
    imgEl.removeEventListener("load", onImageLoad);
    imgEl.removeEventListener("dragstart", onDragStart);
    frameEl.classList.remove("is-dragging");
  });
}

function updateCropZoom(key, delta) {
  if (key === "avatar" && activeAvatarCrop) {
    setAvatarCropState({
      zoom: activeAvatarCrop.crop.zoom + delta,
    });
    refreshCropInteractionView("avatar");
    return;
  }

  if (key === "world" && pendingWorldImage?.crop) {
    setWorldCropState({
      zoom: pendingWorldImage.crop.zoom + delta,
    }, { invalidateFile: true });
    refreshCropInteractionView("world");
  }
}

function resetCropState(key) {
  if (key === "avatar" && activeAvatarCrop) {
    setAvatarCropState(createDefaultCropState({ aspectRatio: 1 }));
    refreshCropInteractionView("avatar");
    return;
  }

  if (key === "world" && pendingWorldImage?.crop) {
    const mode = getWorldCropMode(pendingWorldImage.mode);
    setWorldCropState(createDefaultCropState({
      mode,
      aspectRatio: WORLD_IMAGE_CROP_MODES[mode].aspectRatio,
    }), { invalidateFile: true });
    refreshCropInteractionView("world");
  }
}

function refreshCropInteractionView(key) {
  if (key === "avatar") {
    const frameEl = document.querySelector("#avatarCropFrame");
    const imgEl = document.querySelector("#avatarCropImage");

    if (frameEl && imgEl && activeAvatarCrop?.crop) {
      activeAvatarCrop.crop = applyCropTransform(frameEl, imgEl, activeAvatarCrop.crop);
      syncAvatarCropControls();
    }
    return;
  }

  if (key === "world") {
    const frameEl = document.querySelector("#worldCropFrame");
    const imgEl = document.querySelector("#worldCropImage");

    if (frameEl && imgEl && pendingWorldImage?.crop) {
      pendingWorldImage.crop = applyCropTransform(frameEl, imgEl, pendingWorldImage.crop);
    }
  }
}

function getOutputSize(sourceWidth, sourceHeight, aspectRatio, maxSide) {
  if (aspectRatio) {
    if (aspectRatio >= 1) {
      return {
        width: maxSide,
        height: Math.round(maxSide / aspectRatio),
      };
    }

    return {
      width: Math.round(maxSide * aspectRatio),
      height: maxSide,
    };
  }

  const longestSide = Math.max(sourceWidth, sourceHeight);
  const scale = longestSide > maxSide ? maxSide / longestSide : 1;

  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
}

async function processImageFile(file, options = {}) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageFromUrl(objectUrl);
    const aspectRatio = options.aspectRatio || null;
    const crop = getAdjustedCropRect(image, {
      aspectRatio,
      zoom: options.zoom,
      panX: options.panX,
      panY: options.panY,
    });
    const outputSize = getOutputSize(crop.width, crop.height, aspectRatio, options.maxSide || WORLD_IMAGE_MAX_SIDE);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });

    canvas.width = outputSize.width;
    canvas.height = outputSize.height;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);

    const contentType = options.contentType || "image/jpeg";
    const blob = await canvasToBlob(canvas, contentType, options.quality || IMAGE_OUTPUT_QUALITY);
    const suffix = options.suffix || (aspectRatio ? "crop" : "resized");
    const processedFile = new File([blob], makeProcessedImageName(file, suffix, contentType), {
      type: contentType,
      lastModified: Date.now(),
    });

    if (processedFile.size > MAX_IMAGE_UPLOAD_BYTES) {
      throw new Error("处理后的图片仍然太大，请换一张更小的图片。");
    }

    return {
      file: processedFile,
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function revokeObjectUrl(url) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

function getWorldCropMode(mode) {
  return WORLD_IMAGE_CROP_MODES[mode] ? mode : "original";
}

function openAvatarCropModal(file) {
  const previousPending = pendingProfileAvatarImage;
  const previousShouldRemove = shouldRemoveProfileAvatarImage;
  const statusEl = document.querySelector("#profileAvatarStatus");
  const previousStatusText = statusEl ? statusEl.textContent : "";

  closeAvatarCropModal({ resetInput: false, silent: true, restorePrevious: false });

  activeAvatarCrop = {
    file,
    previewUrl: URL.createObjectURL(file),
    crop: createDefaultCropState({ aspectRatio: 1 }),
    previousPending,
    previousShouldRemove,
    previousStatusText,
  };
  renderAvatarCropModal();
}

function renderAvatarCropModal() {
  if (!activeAvatarCrop) {
    return;
  }

  let modal = document.querySelector("#avatarCropModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "avatarCropModal";
    document.body.appendChild(modal);
  }

  cleanupImageCropInteraction("avatar");
  modal.className = "image-crop-modal avatar-image-crop-modal";
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="image-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="avatarCropTitle">
      <div class="floating-panel-header">
        <div>
          <strong id="avatarCropTitle">裁剪头像</strong>
          <small>固定 1:1 裁剪，保存后会上传圆形头像。</small>
        </div>
        <button class="ghost-button compact-ghost" id="avatarCropCancelTop" type="button">关闭</button>
      </div>
      <div class="image-crop-body">
        <div class="avatar-crop-layout">
          <div class="image-crop-frame is-circle" id="avatarCropFrame">
            <img id="avatarCropImage" src="${escapeHtml(activeAvatarCrop.previewUrl)}" alt="头像裁剪预览" />
          </div>
          <div class="avatar-crop-tips">
            <strong>圆形预览</strong>
            <small>拖动图片调整位置，滚轮或双指可以放大缩小。</small>
          </div>
        </div>
        <div class="crop-control-grid">
          <label>
            <span>缩放</span>
            <input id="avatarCropZoom" type="range" min="1" max="3" step="0.01" value="${activeAvatarCrop.crop.zoom}" />
          </label>
          <div class="crop-nudge-actions" aria-label="头像缩放快捷按钮">
            <button class="secondary-button" id="avatarCropZoomOut" type="button">－</button>
            <button class="secondary-button" id="avatarCropResetButton" type="button">重置</button>
            <button class="secondary-button" id="avatarCropZoomIn" type="button">＋</button>
          </div>
        </div>
      </div>
      <div class="image-crop-actions">
        <button class="primary-button compact-primary" id="avatarCropConfirmButton" type="button">使用这个头像</button>
        <button class="secondary-button" id="avatarCropCancelButton" type="button">取消</button>
      </div>
    </div>
  `;
  modal.hidden = false;
  modal.querySelector("#avatarCropCancelTop").addEventListener("click", () => closeAvatarCropModal({ resetInput: true }));
  modal.querySelector("#avatarCropCancelButton").addEventListener("click", () => closeAvatarCropModal({ resetInput: true }));
  modal.querySelector("#avatarCropConfirmButton").addEventListener("click", confirmAvatarCrop);
  modal.querySelector("#avatarCropZoomOut").addEventListener("click", () => updateCropZoom("avatar", -0.12));
  modal.querySelector("#avatarCropZoomIn").addEventListener("click", () => updateCropZoom("avatar", 0.12));
  modal.querySelector("#avatarCropResetButton").addEventListener("click", () => resetCropState("avatar"));
  modal.querySelector("#avatarCropZoom").addEventListener("input", (event) => {
    setAvatarCropState({ zoom: event.target.value });
    refreshCropInteractionView("avatar");
  });
  setupImageCropInteraction({
    key: "avatar",
    frameEl: modal.querySelector("#avatarCropFrame"),
    imgEl: modal.querySelector("#avatarCropImage"),
    getState: () => activeAvatarCrop?.crop || createDefaultCropState({ aspectRatio: 1 }),
    setState: setAvatarCropState,
  });
  syncAvatarCropControls();
  window.setTimeout(() => modal.focus({ preventScroll: true }), 0);
}

function closeAvatarCropModal(options = {}) {
  const { resetInput = true, silent = false, restorePrevious = true } = options;
  const modal = document.querySelector("#avatarCropModal");
  const previousPending = activeAvatarCrop?.previousPending;
  const previousShouldRemove = activeAvatarCrop?.previousShouldRemove;
  const previousStatusText = activeAvatarCrop?.previousStatusText;

  cleanupImageCropInteraction("avatar");
  revokeObjectUrl(activeAvatarCrop?.previewUrl);
  activeAvatarCrop = null;

  if (modal) {
    modal.hidden = true;
    modal.innerHTML = "";
  }

  if (resetInput) {
    const input = document.querySelector("#profileAvatarFile");

    if (input) {
      input.value = "";
    }

    pendingProfileAvatarImage = restorePrevious && previousPending !== undefined ? previousPending : null;
    shouldRemoveProfileAvatarImage = restorePrevious ? Boolean(previousShouldRemove) : false;
    setProfileAvatarStatus(restorePrevious && previousStatusText ? previousStatusText : "可选 PNG / JPG / WebP / GIF，上传前会先裁剪压缩。");
    updateProfilePreview();
  }

  if (!silent && !resetInput) {
    setProfileAvatarStatus("已取消头像裁剪，没有上传新图片。");
  }
}

function setAvatarCropState(nextState) {
  if (!activeAvatarCrop) {
    return createDefaultCropState({ aspectRatio: 1 });
  }

  activeAvatarCrop.crop = normalizeCropState({
    ...activeAvatarCrop.crop,
    ...nextState,
    aspectRatio: 1,
  });
  syncAvatarCropControls();
  return activeAvatarCrop.crop;
}

function syncAvatarCropControls() {
  const zoomInput = document.querySelector("#avatarCropZoom");

  if (zoomInput && activeAvatarCrop?.crop) {
    zoomInput.value = String(activeAvatarCrop.crop.zoom);
  }
}

async function confirmAvatarCrop() {
  if (!activeAvatarCrop) {
    return;
  }

  const confirmButton = document.querySelector("#avatarCropConfirmButton");

  try {
    if (confirmButton) {
      confirmButton.disabled = true;
      confirmButton.textContent = "正在处理…";
    }

    const crop = activeAvatarCrop;
    const processed = await processImageFile(crop.file, {
      aspectRatio: 1,
      maxSide: AVATAR_CROP_SIZE,
      contentType: "image/jpeg",
      suffix: "avatar",
      zoom: crop.crop.zoom,
      panX: crop.crop.panX,
      panY: crop.crop.panY,
    });

    clearPendingProfileAvatarImage({ resetInput: false, renderPreview: false });
    pendingProfileAvatarImage = {
      file: processed.file,
      previewUrl: URL.createObjectURL(processed.file),
      sourceName: crop.file.name,
    };
    shouldRemoveProfileAvatarImage = false;
    closeAvatarCropModal({ resetInput: false, silent: true, restorePrevious: false });
    setProfileAvatarStatus("头像已裁剪，点「保存资料」后上传。");
    updateProfilePreview();
  } catch (error) {
    reportClientError(error, {
      type: "avatar-crop-failed",
      source: "client-canvas",
    });
    const friendlyMsg = getFriendlyErrorMessage(error, "头像处理失败，请换一张图片试试。");
    showToast(friendlyMsg);
    setProfileAvatarStatus(friendlyMsg);
  } finally {
    const currentConfirmButton = document.querySelector("#avatarCropConfirmButton");

    if (currentConfirmButton) {
      currentConfirmButton.disabled = false;
      currentConfirmButton.textContent = "使用这个头像";
    }
  }
}

function updateProfilePreview() {
  const currentUser = getCurrentUser();
  const nameInput = document.querySelector("#profileNameInput");
  const avatarPreview = document.querySelector("#profilePreviewAvatar");
  const namePreview = document.querySelector("#profilePreviewName");
  const displayName = nameInput?.value.trim() || getUserDisplayName(currentUser);
  const avatar = normalizeAvatar("", displayName);
  const avatarUrl = pendingProfileAvatarImage?.previewUrl || (shouldRemoveProfileAvatarImage ? "" : getUserAvatarUrl(currentUser));

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

  if (!validateSelectedImage(file, "头像图片")) {
    input.value = "";
    return;
  }

  setProfileAvatarStatus("正在打开头像裁剪预览…");
  openAvatarCropModal(file);
}

function clearPendingProfileAvatarImage(options = {}) {
  const { resetInput = true, renderPreview = true } = options;

  revokeObjectUrl(pendingProfileAvatarImage?.previewUrl);

  pendingProfileAvatarImage = null;
  shouldRemoveProfileAvatarImage = false;

  if (resetInput) {
    const input = document.querySelector("#profileAvatarFile");

    if (input) {
      input.value = "";
    }
  }

  setProfileAvatarStatus("可选 PNG / JPG / WebP / GIF，上传前会先裁剪压缩。");

  if (renderPreview) {
    updateProfilePreview();
  }
}

function removeProfileAvatarImage() {
  clearPendingProfileAvatarImage({ renderPreview: false });
  shouldRemoveProfileAvatarImage = true;
  setProfileAvatarStatus("保存资料后会移除图片头像，改用名字第一个字。");
  updateProfilePreview();
}

async function saveProfileChanges() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    showToast("请先登入，再编辑个人资料。");
    return;
  }

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
  let avatarUrl = shouldRemoveProfileAvatarImage ? "" : getUserAvatarUrl(currentUser);

  if (pendingProfileAvatarImage) {
    try {
      setProfileAvatarStatus("正在保存头像图片…");
      const upload = await uploadImageThroughServer(pendingProfileAvatarImage.file);
      rememberUpload(upload, pendingProfileAvatarImage.file);
      avatarUrl = upload.url || upload.publicUrl || avatarUrl;
    } catch (error) {
      console.warn("Profile avatar upload failed.", error);
      reportClientError(error, {
        type: "gcs-upload-failed",
        source: "/api/gcs-upload",
      });
      const friendlyMsg = getFriendlyErrorMessage(error, "头像图片暂时保存不了，请稍后再试。");
      setProfileAvatarStatus(friendlyMsg);
      showToast(friendlyMsg);
      return;
    }
  }

  let updatedUser;

  try {
    const payload = await authRequest("update-profile", {
      displayName,
      avatarUrl,
      currentPassword,
      newPassword,
      confirmPassword,
    });
    updatedUser = applyAuthSession(payload);
  } catch (error) {
    reportClientError(error, {
      type: "auth-profile-update-failed",
      source: AUTH_ENDPOINT,
    });
    showToast(getFriendlyErrorMessage(error, "个人资料暂时保存不了。"));
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
  myWorldMessages = myWorldMessages.map((message) => {
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
    reportClientError(error, {
      type: "auth-register-failed",
      source: AUTH_ENDPOINT,
    });
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
    reportClientError(error, {
      type: "auth-login-failed",
      source: AUTH_ENDPOINT,
    });
    showToast(error.message || "登入失败，请稍后再试。");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "登入";
    }
  }
}

function logoutUser() {
  clearAuthSession({ clearLocalRecords: true });
  render();
  showToast("已登出，并清空本机记录。");
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
    channelId: message.channelId || "world",
    topic: message.topic || "general",
    language: message.language || "zh-CN",
    region: message.region || "global",
    accountId: message.accountId || "",
    userId: message.userId || "",
    username: message.username || "",
    user: message.user || "游客",
    avatar: normalizeAvatar(message.avatar, message.user),
    avatarUrl: message.avatarUrl || "",
    text: message.text || "",
    attachment: message.attachment || null,
    createdAt: message.createdAt || new Date().toISOString(),
    updatedAt: message.updatedAt || "",
    time: message.time || formatWorldTime(message.createdAt),
    likeCount: Number(message.likeCount) || 0,
    isDeleted: message.isDeleted === true,
    deletedAt: message.deletedAt || "",
    deletedBy: message.deletedBy || "",
  };
}

function mergeWorldMessages(currentMessages, incomingMessages) {
  const merged = new Map();

  [...currentMessages, ...incomingMessages].forEach((message) => {
    const normalizedMessage = normalizeWorldMessage(message);

    if (isDeletedWorldMessageClient(normalizedMessage)) {
      merged.delete(normalizedMessage.id);
      return;
    }

    merged.set(normalizedMessage.id, normalizedMessage);
  });

  return [...merged.values()]
    .filter((message) => !isDeletedWorldMessageClient(message))
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
      headers: getAuthHeaders(),
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
    reportClientError(error, {
      type: "world-channel-sync-failed",
      source: WORLD_CHANNEL_ENDPOINT,
    });
    console.warn("World channel sync failed; using local cache.", error);
  }
}

async function syncMyWorldMessages(options = {}) {
  const { silent = false } = options;
  const currentUser = getCurrentUser();

  if (!currentUser || isMyWorldMessagesLoading) {
    return;
  }

  isMyWorldMessagesLoading = true;
  myWorldMessagesError = "";

  if (isProfilePanelOpen && profilePanelView === "home" && !silent) {
    renderProfilePanel();
  }

  try {
    const response = await fetch(`${WORLD_CHANNEL_ENDPOINT}?mine=1&limit=20`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);

    if (!response.ok || !payload.ok) {
      throw new Error(payload.detail || payload.error || "读取我的动态失败");
    }

    myWorldMessages = Array.isArray(payload.messages)
      ? payload.messages
        .map(normalizeWorldMessage)
        .filter((message) => isOwnWorldMessage(message, currentUser))
        .filter((message) => !isDeletedWorldMessageClient(message))
        .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
        .slice(0, 20)
      : [];
  } catch (error) {
    myWorldMessagesError = "我的动态暂时读取失败，可以稍后再刷新。";
    reportClientError(error, {
      type: "world-profile-sync-failed",
      source: WORLD_CHANNEL_ENDPOINT,
    });

    if (!silent) {
      showToast(error.message || "我的动态暂时读取失败。");
    }
  } finally {
    isMyWorldMessagesLoading = false;

    if (isProfilePanelOpen && profilePanelView === "home") {
      renderProfilePanel();
    }
  }
}

async function updateOwnWorldMessage(messageId, text) {
  const response = await fetch(WORLD_CHANNEL_ENDPOINT, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      id: messageId,
      text,
    }),
  });
  const payload = await readJsonResponse(response);

  if (!response.ok || !payload.ok) {
    throw new Error(payload.detail || payload.error || "内容暂时保存不了");
  }

  return payload.message;
}

async function deleteOwnWorldMessage(messageId) {
  const response = await fetch(WORLD_CHANNEL_ENDPOINT, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      id: messageId,
    }),
  });
  const payload = await readJsonResponse(response);

  if (!response.ok || !payload.ok) {
    throw new Error(payload.detail || payload.error || "内容暂时移除不了");
  }

  return payload;
}

async function saveMyWorldMessageEdit(messageId) {
  const textarea = document.querySelector("#myProfileEditText");
  const text = textarea?.value.trim() || "";

  if (!messageId) {
    return;
  }

  if (!text) {
    showToast("文字内容不能为空。");
    return;
  }

  try {
    const message = await updateOwnWorldMessage(messageId, text);
    state.worldMessages = mergeWorldMessages(state.worldMessages, [message]);
    myWorldMessages = mergeMyWorldMessageCache(myWorldMessages, message);
    editingWorldMessageId = "";
    saveState();
    renderWorldChannel();
    renderProfilePanel();
    showToast("内容已更新。");
  } catch (error) {
    reportClientError(error, {
      type: "world-message-edit-failed",
      source: WORLD_CHANNEL_ENDPOINT,
    });
    showToast(error.message || "内容暂时保存不了。");
  }
}

async function removeMyWorldMessage(messageId) {
  if (!messageId) {
    return;
  }

  if (!window.confirm("移除后，世界频道不再显示这条内容。确定要移除吗？")) {
    return;
  }

  try {
    await deleteOwnWorldMessage(messageId);
    removeWorldMessageFromLocalCaches(messageId);
    editingWorldMessageId = "";
    saveState();
    renderWorldChannel();
    renderProfilePanel();
    showToast("内容已移除。");
  } catch (error) {
    reportClientError(error, {
      type: "world-message-delete-failed",
      source: WORLD_CHANNEL_ENDPOINT,
    });
    showToast(error.message || "内容暂时移除不了。");
  }
}

function mergeMyWorldMessageCache(messages, message) {
  const currentUser = getCurrentUser();
  const normalizedMessage = normalizeWorldMessage(message);

  if (!isOwnWorldMessage(normalizedMessage, currentUser) || isDeletedWorldMessageClient(normalizedMessage)) {
    return messages.filter((item) => item.id !== normalizedMessage.id);
  }

  const merged = new Map(messages.map((item) => [item.id, normalizeWorldMessage(item)]));
  merged.set(normalizedMessage.id, normalizedMessage);

  return [...merged.values()]
    .filter((item) => !isDeletedWorldMessageClient(item))
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
    .slice(0, 20);
}

function removeWorldMessageFromLocalCaches(messageId) {
  state.worldMessages = state.worldMessages.filter((message) => message.id !== messageId);
  myWorldMessages = myWorldMessages.filter((message) => message.id !== messageId);
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
  myWorldMessages = mergeMyWorldMessageCache(myWorldMessages, message);
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

  if (imageToSend && isWorldImageProcessing) {
    showToast("图片还在处理中，请等一下再发送。");
    return;
  }

  if (imageToSend && !imageToSend.file) {
    openWorldImageCropModal();
    showToast("请先点「使用这张图」确认图片。");
    return;
  }

  sendButton.disabled = true;
  imageInput.disabled = true;

  try {
    let attachment = null;
    let messageText = text;

    if (imageToSend) {
      const processedImage = imageToSend;

      if (!processedImage?.file) {
        throw new Error("图片还没准备好，请重新选择一次。");
      }

      setUploadStatus("正在上传图片并发送到世界频道…");
      attachment = await uploadImageThroughServer(processedImage.file);
      rememberUpload(attachment, processedImage.file);
      messageText = messageText || "上传了一张图片";
      attachment = {
        type: "image",
        contentType: processedImage.file.type,
        ...attachment,
      };
    }

    const message = await postWorldMessage({
      text: messageText,
      attachment,
    });
    clearPendingWorldImage();
    addWorldMessage(message);
    syncWorldMessages();

    input.value = "";
    updateWorldCharacterHint();
    setUploadStatus(imageToSend ? "图片已发送成功。" : "先预览再发送");
    showToast(imageToSend ? "图片已发送到世界频道。" : "消息已发送到世界频道。");
  } catch (error) {
    console.warn("World image send failed.", error);
    reportClientError(error, {
      type: imageToSend ? "world-message-image-send-failed" : "world-message-send-failed",
      source: WORLD_CHANNEL_ENDPOINT,
    });
    if (String(error.message || "").includes("重新登入")) {
      clearAuthSession();
      render();
    }

    const errorMessage = getFriendlyErrorMessage(error, imageToSend ? "图片发送失败，请稍后再试。" : "发送失败，请稍后再试。");
    setUploadStatus(errorMessage);
    showToast(errorMessage);
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

async function prepareWorldImage(event) {
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

  if (!validateSelectedImage(file, "图片")) {
    input.value = "";
    return;
  }

  clearPendingWorldImage({ resetInput: false, updateStatus: false });
  pendingWorldImage = {
    sourceFile: file,
    sourcePreviewUrl: URL.createObjectURL(file),
    file: null,
    previewUrl: "",
    mode: "original",
    crop: createDefaultCropState({
      mode: "original",
      aspectRatio: WORLD_IMAGE_CROP_MODES.original.aspectRatio,
    }),
    width: 0,
    height: 0,
    sourceWidth: 0,
    sourceHeight: 0,
    error: "",
  };
  updatePendingImagePreview();
  openWorldImageCropModal();
  setUploadStatus("调整后使用");
}

function getWorldCropFrameAspect(mode, dimensions = {}) {
  const cropMode = getWorldCropMode(mode);
  const aspectRatio = WORLD_IMAGE_CROP_MODES[cropMode].aspectRatio;

  if (!aspectRatio) {
    const sourceWidth = Number(dimensions.width || dimensions.sourceWidth);
    const sourceHeight = Number(dimensions.height || dimensions.sourceHeight);

    if (Number.isFinite(sourceWidth) && Number.isFinite(sourceHeight) && sourceWidth > 0 && sourceHeight > 0) {
      return `${sourceWidth} / ${sourceHeight}`;
    }

    return "4 / 3";
  }

  if (aspectRatio === 1) {
    return "1 / 1";
  }

  return aspectRatio > 1 ? "4 / 3" : "3 / 4";
}

function openWorldImageCropModal() {
  if (!pendingWorldImage?.sourceFile) {
    return;
  }

  renderWorldImageCropModal();
}

function renderWorldImageCropModal() {
  if (!pendingWorldImage?.sourceFile) {
    return;
  }

  let modal = document.querySelector("#worldImageCropModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "worldImageCropModal";
    document.body.appendChild(modal);
  }

  const mode = getWorldCropMode(pendingWorldImage.mode);
  const modeConfig = WORLD_IMAGE_CROP_MODES[mode];

  cleanupImageCropInteraction("world");
  modal.className = "image-crop-modal world-image-crop-modal";
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="image-crop-dialog world-image-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="worldImageCropTitle">
      <div class="floating-panel-header">
        <div>
          <strong id="worldImageCropTitle">调整图片</strong>
          <small>选择比例后拖动图片调整位置，滚轮或双指可以放大缩小。</small>
        </div>
        <button class="ghost-button compact-ghost" id="worldImageCropCancelTop" type="button">关闭</button>
      </div>
      <div class="image-crop-body">
        <div class="world-crop-modal-layout">
          <div class="image-crop-frame world-crop-frame${modeConfig.aspectRatio ? "" : " is-original"}" id="worldCropFrame" style="--world-crop-frame-aspect: ${getWorldCropFrameAspect(mode, pendingWorldImage)};">
            <img id="worldCropImage" src="${escapeHtml(pendingWorldImage.sourcePreviewUrl)}" alt="待发送图片裁剪预览" />
          </div>
          <div class="avatar-crop-tips">
            <strong id="worldCropPreviewTitle">${escapeHtml(modeConfig.label)}预览</strong>
            <small id="worldCropPreviewMeta">${modeConfig.aspectRatio ? "拖动图片调整位置，滚轮或双指可以放大缩小。" : "原图模式会保留比例，只压缩尺寸。"}</small>
          </div>
        </div>
        <div class="world-crop-options" id="worldCropOptions" aria-label="图片裁剪比例">
          ${Object.entries(WORLD_IMAGE_CROP_MODES).map(([cropMode, option]) => `
            <button class="world-crop-option${cropMode === mode ? " is-active" : ""}" type="button" data-world-crop-mode="${cropMode}">
              ${escapeHtml(option.label)}
            </button>
          `).join("")}
        </div>
        <div class="crop-nudge-actions world-crop-tools" id="worldCropTools" aria-label="图片缩放快捷按钮">
          <button class="secondary-button" id="worldCropZoomOut" type="button">－</button>
          <button class="secondary-button" id="worldCropResetButton" type="button">重置</button>
          <button class="secondary-button" id="worldCropZoomIn" type="button">＋</button>
        </div>
      </div>
      <div class="image-crop-actions">
        <button class="primary-button compact-primary" id="worldImageCropConfirmButton" type="button">使用这张图</button>
        <button class="secondary-button" id="worldImageCropCancelButton" type="button">取消</button>
      </div>
    </div>
  `;
  modal.hidden = false;
  modal.querySelector("#worldImageCropCancelTop").addEventListener("click", () => closeWorldImageCropModal({ clearPending: true }));
  modal.querySelector("#worldImageCropCancelButton").addEventListener("click", () => closeWorldImageCropModal({ clearPending: true }));
  modal.querySelector("#worldImageCropConfirmButton").addEventListener("click", confirmWorldImageCrop);
  modal.querySelectorAll("[data-world-crop-mode]").forEach((button) => {
    button.addEventListener("click", () => changeWorldImageCropMode(button.dataset.worldCropMode));
  });
  modal.querySelector("#worldCropZoomOut").addEventListener("click", () => updateCropZoom("world", -0.12));
  modal.querySelector("#worldCropZoomIn").addEventListener("click", () => updateCropZoom("world", 0.12));
  modal.querySelector("#worldCropResetButton").addEventListener("click", () => resetCropState("world"));

  setupImageCropInteraction({
    key: "world",
    frameEl: modal.querySelector("#worldCropFrame"),
    imgEl: modal.querySelector("#worldCropImage"),
    getState: () => pendingWorldImage?.crop || createDefaultCropState({
      mode,
      aspectRatio: modeConfig.aspectRatio,
    }),
    setState: (nextState) => setWorldCropState(nextState, { invalidateFile: false }),
    onChange: (nextState) => setWorldCropState(nextState, { invalidateFile: true }),
  });
  syncWorldCropModalControls();
  window.setTimeout(() => modal.focus({ preventScroll: true }), 0);
}

function closeWorldImageCropModal(options = {}) {
  const { clearPending = false, focusInput = true } = options;
  const modal = document.querySelector("#worldImageCropModal");

  cleanupImageCropInteraction("world");

  if (modal) {
    modal.hidden = true;
    modal.innerHTML = "";
  }

  if (clearPending) {
    clearPendingWorldImage({ closeModal: false });
    if (focusInput) {
      window.setTimeout(() => document.querySelector("#worldMessageInput")?.focus({ preventScroll: true }), 0);
    }
    return;
  }

  if (focusInput) {
    window.setTimeout(() => document.querySelector("#worldMessageInput")?.focus({ preventScroll: true }), 0);
  }
}

function syncWorldCropModalControls() {
  const modal = document.querySelector("#worldImageCropModal");

  if (!modal || modal.hidden || !pendingWorldImage) {
    return;
  }

  const mode = getWorldCropMode(pendingWorldImage.mode);
  const modeConfig = WORLD_IMAGE_CROP_MODES[mode];
  const frameEl = modal.querySelector("#worldCropFrame");
  const titleEl = modal.querySelector("#worldCropPreviewTitle");
  const metaEl = modal.querySelector("#worldCropPreviewMeta");
  const cropTools = modal.querySelectorAll("#worldCropZoomOut, #worldCropZoomIn, #worldCropResetButton");

  if (frameEl) {
    frameEl.style.setProperty("--world-crop-frame-aspect", getWorldCropFrameAspect(mode, pendingWorldImage));
    frameEl.classList.toggle("is-original", !modeConfig.aspectRatio);
  }

  if (titleEl) {
    titleEl.textContent = isWorldImageProcessing ? "正在处理图片…" : `${modeConfig.label}预览`;
  }

  if (metaEl) {
    metaEl.textContent = pendingWorldImage.error
      ? pendingWorldImage.error
      : modeConfig.aspectRatio
        ? "拖动图片调整位置，滚轮或双指可以放大缩小。"
        : "原图模式会保留比例，只压缩尺寸。";
  }

  modal.querySelectorAll("[data-world-crop-mode]").forEach((button) => {
    const isActive = button.dataset.worldCropMode === mode;
    button.classList.toggle("is-active", isActive);
    button.disabled = isWorldImageProcessing;
  });
  cropTools.forEach((button) => {
    button.disabled = isWorldImageProcessing || !modeConfig.aspectRatio;
  });
}

function updatePendingImagePreview() {
  const previewPanel = document.querySelector("#worldPendingImage");
  const previewImage = document.querySelector("#worldPendingImageThumb");
  const previewName = document.querySelector("#worldPendingImageName");
  const previewMeta = document.querySelector("#worldPendingImageMeta");

  if (!previewPanel || !previewImage || !previewName) {
    return;
  }

  const hasConfirmedImage = Boolean(pendingWorldImage?.file);
  previewPanel.hidden = !hasConfirmedImage;

  if (!hasConfirmedImage) {
    previewImage.removeAttribute("src");
    previewName.textContent = "";
    if (previewMeta) {
      previewMeta.textContent = "";
    }
    return;
  }

  const modeConfig = WORLD_IMAGE_CROP_MODES[getWorldCropMode(pendingWorldImage.mode)];
  previewImage.src = pendingWorldImage.previewUrl || pendingWorldImage.sourcePreviewUrl;
  previewName.textContent = `${modeConfig.label}图片已准备`;

  if (previewMeta) {
    previewMeta.textContent = pendingWorldImage.error
      ? pendingWorldImage.error
      : `${pendingWorldImage.width}×${pendingWorldImage.height} · ${formatFileSize(pendingWorldImage.file.size)}`;
  }
}

function clearPendingWorldImage(options = {}) {
  const { resetInput = true, updateStatus = true, closeModal = true } = options;

  if (closeModal) {
    closeWorldImageCropModal({ clearPending: false, focusInput: false });
  }

  cleanupImageCropInteraction("world");
  revokeObjectUrl(pendingWorldImage?.previewUrl);
  revokeObjectUrl(pendingWorldImage?.sourcePreviewUrl);
  pendingWorldImage = null;
  isWorldImageProcessing = false;

  if (resetInput) {
    const input = document.querySelector("#worldImageInput");

    if (input) {
      input.value = "";
    }
  }

  updatePendingImagePreview();

  if (updateStatus) {
    setUploadStatus("先预览再发送");
  }
}

function changeWorldImageCropMode(mode) {
  if (!pendingWorldImage || isWorldImageProcessing) {
    return;
  }

  const cropMode = getWorldCropMode(mode);
  const cropOption = WORLD_IMAGE_CROP_MODES[cropMode];
  setWorldCropState({
    ...(pendingWorldImage.crop || {}),
    mode: cropMode,
    aspectRatio: cropOption.aspectRatio,
  }, { invalidateFile: true });
  pendingWorldImage.mode = cropMode;
  pendingWorldImage.error = "";
  syncWorldCropModalControls();
  refreshCropInteractionView("world");
  updatePendingImagePreview();
}

function setWorldCropState(nextState, options = {}) {
  if (!pendingWorldImage) {
    return createDefaultCropState();
  }

  const mode = getWorldCropMode(nextState.mode || pendingWorldImage.mode);
  const cropOption = WORLD_IMAGE_CROP_MODES[mode];
  pendingWorldImage.crop = normalizeCropState({
    ...pendingWorldImage.crop,
    ...nextState,
    mode,
    aspectRatio: cropOption.aspectRatio,
  });
  pendingWorldImage.mode = mode;

  if (options.invalidateFile) {
    revokeObjectUrl(pendingWorldImage.previewUrl);
    pendingWorldImage.file = null;
    pendingWorldImage.previewUrl = "";
    pendingWorldImage.width = 0;
    pendingWorldImage.height = 0;
    pendingWorldImage.error = "";
  }

  syncWorldCropModalControls();
  return pendingWorldImage.crop;
}

async function confirmWorldImageCrop() {
  if (!pendingWorldImage?.sourceFile) {
    return;
  }

  const confirmButton = document.querySelector("#worldImageCropConfirmButton");

  try {
    if (confirmButton) {
      confirmButton.disabled = true;
      confirmButton.textContent = "正在处理…";
    }

    const processedImage = await processPendingWorldImageMode(pendingWorldImage.mode || "original");

    if (!processedImage?.file) {
      throw new Error("图片还没准备好，请重新选择一次。");
    }

    closeWorldImageCropModal({ clearPending: false });
    updatePendingImagePreview();
    setUploadStatus("图片已准备，点发送。");
    showToast("图片已准备，点发送才上传。");
  } catch (error) {
    reportClientError(error, {
      type: "world-image-confirm-failed",
      source: "client-canvas",
    });
    const friendlyMsg = getFriendlyErrorMessage(error, "图片处理失败，请换一张图片试试。");
    if (pendingWorldImage) {
      pendingWorldImage.error = friendlyMsg;
    }
    syncWorldCropModalControls();
    setUploadStatus(friendlyMsg);
    showToast(friendlyMsg);
  } finally {
    const currentConfirmButton = document.querySelector("#worldImageCropConfirmButton");

    if (currentConfirmButton) {
      currentConfirmButton.disabled = false;
      currentConfirmButton.textContent = "使用这张图";
    }
  }
}

async function processPendingWorldImageMode(mode) {
  if (!pendingWorldImage?.sourceFile) {
    return null;
  }

  const sourceFile = pendingWorldImage.sourceFile;
  const sourcePreviewUrl = pendingWorldImage.sourcePreviewUrl;
  const cropMode = getWorldCropMode(mode || pendingWorldImage.mode);
  const cropOption = WORLD_IMAGE_CROP_MODES[cropMode];
  const cropState = normalizeCropState({
    ...pendingWorldImage.crop,
    mode: cropMode,
    aspectRatio: cropOption.aspectRatio,
  });

  isWorldImageProcessing = true;
  pendingWorldImage = {
    ...pendingWorldImage,
    mode: cropMode,
    crop: cropState,
    error: "",
  };
  syncWorldCropModalControls();
  updatePendingImagePreview();

  try {
    const processed = await processImageFile(sourceFile, {
      aspectRatio: cropOption.aspectRatio,
      maxSide: WORLD_IMAGE_MAX_SIDE,
      contentType: "image/jpeg",
      suffix: cropMode,
      zoom: cropState.zoom,
      panX: cropState.panX,
      panY: cropState.panY,
    });

    if (!pendingWorldImage || pendingWorldImage.sourceFile !== sourceFile || pendingWorldImage.sourcePreviewUrl !== sourcePreviewUrl) {
      return null;
    }

    revokeObjectUrl(pendingWorldImage.previewUrl);
    pendingWorldImage = {
      ...pendingWorldImage,
      file: processed.file,
      previewUrl: URL.createObjectURL(processed.file),
      width: processed.width,
      height: processed.height,
      error: "",
    };
    setUploadStatus(`${cropOption.label}图片已准备。`);
    return pendingWorldImage;
  } catch (error) {
    if (!pendingWorldImage || pendingWorldImage.sourceFile !== sourceFile || pendingWorldImage.sourcePreviewUrl !== sourcePreviewUrl) {
      return null;
    }

    pendingWorldImage = {
      ...pendingWorldImage,
      file: null,
      error: getFriendlyErrorMessage(error, "图片处理失败，请换一张图片试试。"),
    };
    reportClientError(error, {
      type: "world-image-process-failed",
      source: "client-canvas",
    });
    setUploadStatus(pendingWorldImage.error);
    showToast(pendingWorldImage.error);
    return null;
  } finally {
    isWorldImageProcessing = false;
    syncWorldCropModalControls();
    updatePendingImagePreview();
  }
}
function formatFileSize(size) {
  const bytes = Number(size) || 0;

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
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
    const error = new Error(signedPayload.detail || signedPayload.error || "无法生成上传授权");
    reportClientError(error, {
      type: "gcs-signed-url-failed",
      source: "/api/gcs-signed-url",
    });
    throw error;
  }

  const uploadResponse = await fetch(signedPayload.uploadUrl, {
    method: signedPayload.method || "PUT",
    headers: signedPayload.headers || {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const error = new Error(`图片上传失败：${uploadResponse.status}`);
    reportClientError(error, {
      type: "gcs-upload-failed",
      source: signedPayload.uploadUrl ? "gcs-signed-upload" : "/api/gcs-signed-url",
    });
    throw error;
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
    const error = new Error(uploadPayload.detail || uploadPayload.error || "备用上传失败");
    reportClientError(error, {
      type: "gcs-upload-failed",
      source: "/api/gcs-upload",
    });
    throw error;
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

function redactClientErrorText(value) {
  return String(value || "")
    .replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/gi, "[redacted private key]")
    .replace(/([?&](?:auth[_-]?token|token|password|private[_-]?key|api[_-]?key|gcp[_-]?key)=)[^&#\s]*/gi, "$1[redacted]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, "Bearer [redacted token]")
    .replace(/\b(password|passcode|token|private[_\s-]?key|api[_\s-]?key|gcp[_\s-]?key)\s*[:=]\s*\S+/gi, "$1=[redacted]");
}

function cleanClientErrorText(value, maxLength) {
  return redactClientErrorText(value).trim().slice(0, maxLength);
}

function getFriendlyErrorMessage(error, defaultMessage = "操作失败，请稍后再试。") {
  const msg = String(error?.message || error || "");
  if (!msg) {
    return defaultMessage;
  }

  if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Network Error")) {
    return "网络连接失败，请检查网络设置或稍后再试。";
  }
  if (msg.includes("413") || msg.includes("too large") || msg.includes("Too Large")) {
    return "图片太大，请换一张小一点的图片试试。";
  }
  if (msg.includes("403") || msg.includes("Forbidden") || msg.includes("没有权限")) {
    return "您的登录状态已失效，请重新登录。";
  }
  if (msg.includes("500") || msg.includes("502") || msg.includes("503") || msg.includes("504")) {
    return "服务器目前繁忙，请稍后再试。";
  }
  if (msg.includes("timeout") || msg.includes("超时")) {
    return "上传超时，请检查您的网络连接并重试。";
  }
  if (msg.includes("upload") || msg.includes("GCS")) {
    return "图片上传失败，请换个网络或稍后再试。";
  }

  return msg;
}

function getErrorMessage(error) {
  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error || "Unknown client error");
  }
}

function getErrorStack(error) {
  if (error?.stack) {
    return error.stack;
  }

  if (error?.reason?.stack) {
    return error.reason.stack;
  }

  return "";
}

function getClientErrorPayload(error, context = {}) {
  return {
    message: cleanClientErrorText(context.message || getErrorMessage(error), 500) || "Unknown client error",
    stack: cleanClientErrorText(context.stack || getErrorStack(error), 4000),
    source: cleanClientErrorText(context.source, 500),
    line: Number.isFinite(Number(context.line)) ? Number(context.line) : 0,
    column: Number.isFinite(Number(context.column)) ? Number(context.column) : 0,
    type: cleanClientErrorText(context.type || "client-error", 80),
    url: cleanClientErrorText(window.location.href, 1200),
    pageMode: cleanClientErrorText(`${state.mode} · ${getModeTitle(state.mode)}`, 80),
    userAgent: cleanClientErrorText(navigator.userAgent, 500),
    screenWidth: window.screen?.width || window.innerWidth,
    screenHeight: window.screen?.height || window.innerHeight,
  };
}

function reportClientError(error, context = {}) {
  try {
    const payload = getClientErrorPayload(error, context);
    const key = `${payload.type}:${payload.message}`;
    const now = Date.now();
    const lastSentAt = clientErrorThrottle.get(key) || 0;

    if (now - lastSentAt < CLIENT_ERROR_THROTTLE_MS) {
      return;
    }

    clientErrorThrottle.set(key, now);

    fetch(CLIENT_ERROR_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
  }
}

function shouldReportCloudSyncError(error) {
  if (state.auth.token) {
    return true;
  }

  return !/Authentication required|Invalid or expired token/i.test(String(error?.message || ""));
}

function installClientErrorHandlers() {
  const previousOnError = window.onerror;
  const previousUnhandledRejection = window.onunhandledrejection;

  window.onerror = function handleWindowError(message, source, line, column, error) {
    reportClientError(error || message, {
      type: "js-error",
      message,
      source,
      line,
      column,
    });

    if (typeof previousOnError === "function") {
      return previousOnError.apply(this, arguments);
    }

    return false;
  };

  window.onunhandledrejection = function handleUnhandledRejection(event) {
    reportClientError(event.reason, {
      type: "promise-error",
      source: "window.unhandledrejection",
    });

    if (typeof previousUnhandledRejection === "function") {
      return previousUnhandledRejection.call(this, event);
    }

    return undefined;
  };
}

function getFeedbackPayload(form) {
  const formData = new FormData(form);

  return {
    type: String(formData.get("type") || "其他"),
    title: String(formData.get("title") || "").trim().slice(0, 80),
    message: String(formData.get("message") || "").trim().slice(0, 1000),
    contact: String(formData.get("contact") || "").trim().slice(0, 160),
    pageMode: `${state.mode} · ${getModeTitle(state.mode)}`,
    url: window.location.href,
    userAgent: navigator.userAgent,
    screenWidth: window.screen?.width || window.innerWidth,
    screenHeight: window.screen?.height || window.innerHeight,
    userId: state.userId || "",
  };
}

async function submitFeedback(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = document.querySelector("#feedbackSubmitButton");
  const payload = getFeedbackPayload(form);

  if (!payload.title) {
    showToast("请先写一个反馈标题。");
    return;
  }

  if (!payload.message) {
    showToast("请补充详细说明。");
    return;
  }

  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "正在提交…";
    }

    const response = await fetch(FEEDBACK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const result = await readJsonResponse(response);

    if (!response.ok || !result.ok) {
      throw new Error(result.detail || result.error || "反馈暂时提交不了");
    }

    form.reset();
    closeFeedbackPanel();
    showToast("已收到反馈，谢谢你");
  } catch (error) {
    console.warn("Feedback submit failed.", error);
    showToast("反馈暂时提交不了，请稍后再试。");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "提交反馈";
    }
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
    if (shouldReportCloudSyncError(error)) {
      reportClientError(error, {
        type: "cloud-sync-read-failed",
        source: CLOUD_SYNC_ENDPOINT,
      });
    }
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
    if (shouldReportCloudSyncError(error)) {
      reportClientError(error, {
        type: "cloud-sync-write-failed",
        source: CLOUD_SYNC_ENDPOINT,
        message: `Cloud ${collection} sync failed: ${error.message || error}`,
      });
    }
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
    if (shouldReportCloudSyncError(error)) {
      reportClientError(error, {
        type: "cloud-sync-clear-failed",
        source: CLOUD_SYNC_ENDPOINT,
      });
    }
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

installClientErrorHandlers();
loadState();
formatDateLabel();
renderDailyInspiration();
render();
restoreAuthSession();
syncWorldMessages();
window.setInterval(syncWorldMessages, WORLD_SYNC_INTERVAL_MS);
