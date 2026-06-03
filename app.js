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
    description: "按心情、消费等级和出行方式抽一个目的地，随机后会给出预算范围。",
    hint: "可按穷游、低消费、自驾游等条件筛选",
    label: "旅行目的地",
  },
  number: {
    icon: "🔢",
    title: "四位号码怎么选？",
    short: "4D 娱乐号码",
    description: "生成 0000 到 9999 的四位号码，可避开重复或特定数字。",
    hint: "号码仅供娱乐，不构成投注建议",
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

const FOOD_CATEGORIES = ["全部", "Mamak", "快餐连锁", "外卖平台热门", "油炸类", "素食类", "低卡类", "快餐", "嘴馋零嘴类", "高热量", "健康类"];
const SPECIAL_FOOD_CATEGORIES = new Set(["Mamak", "快餐连锁", "外卖平台热门"]);
const SPECIAL_REGION_KEYS = new Set(["全国 Mamak", "快餐连锁", "外卖平台热门"]);
const DRINK_CATEGORIES = ["全部", "奶茶", "咖啡", "果茶", "纯茶", "冰沙", "冰淇淋", "低糖", "高热量", "健康类", "外卖热门"];
const IMAGE_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;
const FALLBACK_IMAGE_UPLOAD_BYTES = 2.5 * 1024 * 1024;
const TRAVEL_MOODS = ["全部", "短途", "放松", "自然", "城市", "美食", "文化", "冒险", "购物", "海岛", "亲子"];
const TRAVEL_LEVELS = ["全部", "穷游", "低消费", "舒适", "轻奢", "奢华"];
const TRAVEL_TRANSPORTS = ["全部", "公共交通", "自驾游", "自由行", "跟团", "步行城市"];
const SHOPPING_LEVELS = ["全部", "低消费", "中等", "高消费", "奢侈品", "理性"];
const LOCKABLE_MODES = new Set(["food", "drink", "travel", "shopping", "custom"]);
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

function destination(title, country, days, tags, transports, budgets, note) {
  return { title, country, days, tags, transports, budgets, note };
}

function shop(title, level, budget, tags = []) {
  return { title, level, budget, tags };
}

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

const SHOPPING_DATA = {
  生活补给: [
    shop("洗衣凝珠", "低消费", "RM18-45"),
    shop("牙线", "低消费", "RM8-25"),
    shop("护手霜", "低消费", "RM12-45"),
    shop("收纳盒", "低消费", "RM15-60"),
    shop("香氛蜡烛", "中等", "RM40-160"),
    shop("咖啡豆", "中等", "RM35-120"),
    shop("空气清新机滤芯", "中等", "RM80-220"),
    shop("扫地机器人耗材", "中等", "RM60-180"),
  ],
  数码小物: [
    shop("手机支架", "低消费", "RM10-45"),
    shop("机械键盘键帽", "中等", "RM80-260"),
    shop("快充充电线", "低消费", "RM18-60"),
    shop("蓝牙追踪器", "中等", "RM90-180"),
    shop("桌面灯", "中等", "RM90-380"),
    shop("移动电源", "中等", "RM80-280"),
    shop("降噪耳机", "高消费", "RM500-1800"),
    shop("平板电脑", "高消费", "RM1200-4800"),
  ],
  穿搭: [
    shop("基础白 T", "低消费", "RM25-90"),
    shop("舒服运动鞋", "中等", "RM180-650"),
    shop("通勤包", "中等", "RM120-600"),
    shop("防晒外套", "中等", "RM120-450"),
    shop("帽子", "低消费", "RM25-120"),
    shop("袜子套装", "低消费", "RM20-80"),
    shop("羊毛大衣", "高消费", "RM600-2200"),
    shop("皮鞋", "高消费", "RM450-1800"),
  ],
  家里缺的: [
    shop("床单", "中等", "RM80-350"),
    shop("浴巾", "低消费", "RM25-120"),
    shop("厨房剪刀", "低消费", "RM20-80"),
    shop("空气炸锅纸", "低消费", "RM10-35"),
    shop("绿植", "低消费", "RM20-150"),
    shop("小夜灯", "低消费", "RM20-90"),
    shop("人体工学椅", "高消费", "RM600-2500"),
    shop("净水器", "高消费", "RM500-3000"),
  ],
  美妆护肤: [
    shop("防晒霜", "中等", "RM40-180"),
    shop("保湿精华", "中等", "RM80-350"),
    shop("修眉刀", "低消费", "RM8-35"),
    shop("唇膏", "低消费", "RM18-90"),
    shop("香水小样", "中等", "RM45-180"),
    shop("美容仪", "高消费", "RM500-2600"),
  ],
  运动户外: [
    shop("瑜伽垫", "低消费", "RM35-180"),
    shop("运动水壶", "低消费", "RM25-120"),
    shop("跑步腰包", "低消费", "RM25-100"),
    shop("登山鞋", "高消费", "RM450-1600"),
    shop("露营椅", "中等", "RM80-380"),
    shop("运动手表", "高消费", "RM700-3200"),
  ],
  礼物: [
    shop("花束", "中等", "RM80-280"),
    shop("手写卡片套装", "低消费", "RM10-45"),
    shop("甜点礼盒", "中等", "RM60-220"),
    shop("香氛礼盒", "中等", "RM120-500"),
    shop("体验券", "高消费", "RM200-1200"),
    shop("定制饰品", "高消费", "RM300-1800"),
  ],
  奢侈品: [
    shop("设计师钱包", "奢侈品", "RM1800-6500", ["入门奢侈品"]),
    shop("经典丝巾", "奢侈品", "RM1200-4500", ["配饰"]),
    shop("香水正装", "奢侈品", "RM500-1800", ["入门奢侈品"]),
    shop("太阳眼镜", "奢侈品", "RM900-3500", ["配饰"]),
    shop("设计师手袋", "奢侈品", "RM6500-45000+", ["包袋"]),
    shop("机械腕表", "奢侈品", "RM8000-80000+", ["腕表"]),
    shop("高级珠宝", "奢侈品", "RM10000-100000+", ["珠宝"]),
    shop("奢华旅行箱", "奢侈品", "RM4500-18000", ["旅行"]),
  ],
  理性提醒: [
    shop("先等 24 小时", "理性", "RM0"),
    shop("加入愿望清单", "理性", "RM0"),
    shop("比较三家价格", "理性", "RM0"),
    shop("用现有替代品", "理性", "RM0"),
    shop("这个月先不买", "理性", "RM0"),
    shop("只买预算内版本", "理性", "按预算上限"),
  ],
};

const DAILY_TIPS = [
  { title: "轻一点的决定", text: "如果抽到的结果让你皱眉，那其实你已经知道自己不想要什么了。" },
  { title: "三秒规则", text: "按下随机后，第一反应通常很诚实。开心就去做，抗拒就重抽。" },
  { title: "今天别太完美", text: "随机不是替你负责，而是帮你打破僵住的那一分钟。" },
  { title: "先抽小事", text: "从午餐、咖啡、散步路线开始，给大脑省一点电。" },
  { title: "锁定朋友提案", text: "把 5 个朋友各自想去的地点锁住，就能只在这 5 个里随机。" },
];

const DEFAULT_CUSTOM_TEXT = "看电影\n去散步\n整理书桌\n喝一杯咖啡\n给朋友发消息\n早点睡";
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
    text: "接上真实后台后，这里可以升级成所有用户实时同步的公共频道。",
    time: "刚刚",
  },
];
const STORAGE_KEY = "choiceWheelState";

const state = {
  mode: "food",
  worldOpen: false,
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
    mood: "全部",
    level: "全部",
    transport: "全部",
  },
  number: {
    allowRepeat: true,
    avoidFour: false,
  },
  shopping: {
    category: "生活补给",
    level: "全部",
  },
  auth: {
    currentUser: "",
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
  currentResult: null,
};

const elements = {
  modeList: document.querySelector("#modeList"),
  modeMenuToggle: document.querySelector("#modeMenuToggle"),
  modeMenuLabel: document.querySelector("#modeMenuLabel"),
  sidebar: document.querySelector(".sidebar"),
  worldChannelButton: document.querySelector("#worldChannelButton"),
  worldCloseButton: document.querySelector("#worldCloseButton"),
  todayLabel: document.querySelector("#todayLabel"),
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
  favoriteButton: document.querySelector("#favoriteButton"),
  surpriseModeButton: document.querySelector("#surpriseModeButton"),
  clearHistoryButton: document.querySelector("#clearHistoryButton"),
  dailyInspiration: document.querySelector("#dailyInspiration"),
  historyList: document.querySelector("#historyList"),
  historyCount: document.querySelector("#historyCount"),
  favoritesList: document.querySelector("#favoritesList"),
  favoriteCount: document.querySelector("#favoriteCount"),
  toast: document.querySelector("#toast"),
};

let toastTimer;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved) {
      return;
    }

    state.mode = MODES[saved.mode] ? saved.mode : state.mode;
    state.worldOpen = Boolean(saved.worldOpen);
    state.currency = CURRENCY_RATES[saved.currency] ? saved.currency : state.currency;
    state.food = { ...state.food, ...saved.food };
    state.travel = { ...state.travel, ...saved.travel };
    state.number = { ...state.number, ...saved.number };
    state.shopping = { ...state.shopping, ...saved.shopping };
    state.auth = { ...state.auth, ...saved.auth };
    state.users = Array.isArray(saved.users) ? saved.users : [];
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
  } catch {
    showToast("读取本地记录失败，已使用默认设置。");
  }
}

function saveState() {
  const payload = {
    mode: state.mode,
    worldOpen: state.worldOpen,
    currency: state.currency,
    food: state.food,
    drink: state.drink,
    travel: state.travel,
    number: state.number,
    shopping: state.shopping,
    auth: state.auth,
    users: state.users,
    worldMessages: state.worldMessages,
    locked: state.locked,
    customText: state.customText,
    history: state.history,
    favorites: state.favorites,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
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
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  elements.todayLabel.textContent = formatter.format(new Date());
}

function renderModes() {
  elements.modeList.innerHTML = Object.entries(MODES)
    .map(([key, mode]) => {
      const activeClass = key === state.mode ? " is-active" : "";
      return `
        <button class="mode-button${activeClass}" type="button" data-mode="${key}" aria-pressed="${key === state.mode}">
          <span class="mode-icon">${mode.icon}</span>
          <span class="mode-copy">
            <strong>${mode.title}</strong>
            <small>${mode.short}</small>
          </span>
        </button>
      `;
    })
    .join("");

  elements.modeList.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => switchMode(button.dataset.mode));
  });

  elements.modeMenuLabel.textContent = MODES[state.mode].title;
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
  showToast(`已切换到「${MODES[mode].title}」`);
}

function render() {
  const mode = MODES[state.mode];
  elements.currencySelect.value = state.currency;
  elements.actionRow.hidden = false;
  elements.previewPanel.hidden = false;
  elements.worldChatPanel.hidden = !state.worldOpen;
  elements.modeTitle.textContent = mode.title;
  elements.modeDescription.textContent = mode.description;
  elements.controlHint.textContent = mode.hint;
  elements.resultLabel.textContent = mode.label;
  elements.numberDigits.hidden = true;

  renderModes();
  renderModeStage();
  renderControls();
  renderPreview();
  renderWorldChannel();
  renderWorldControls();
  renderHistory();
  renderFavorites();
}

function renderModeStage() {
  if (!state.currentResult || state.currentResult.mode !== state.mode) {
    elements.resultValue.textContent = "按下按钮，让今天轻一点";
    elements.resultMeta.textContent = "你可以先选模式，也可以直接随机。";
    elements.numberDigits.innerHTML = "";
  }
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

  if (!currentUser) {
    elements.worldAuthPanel.innerHTML = `
      <form class="world-panel auth-panel" id="authForm">
        <div class="world-panel-header">
          <strong>登入 / 注册</strong>
          <small>本地原型账户，不要用真实密码</small>
        </div>
        <div class="field">
          <label for="authUsername">用户名</label>
          <input id="authUsername" autocomplete="username" maxlength="20" placeholder="例如 limke" />
        </div>
        <div class="field">
          <label for="authPassword">密码</label>
          <input id="authPassword" type="password" autocomplete="current-password" maxlength="40" placeholder="至少 4 个字符" />
        </div>
        <div class="custom-actions">
          <button class="primary-button compact-primary" id="loginButton" type="button">登入</button>
          <button class="secondary-button" id="registerButton" type="button">注册</button>
        </div>
      </form>
      <div class="world-panel gcs-panel">
        <div class="world-panel-header">
          <strong>Google Cloud Storage</strong>
          <small>等待接后台</small>
        </div>
        <p>前端不能直接放 GCS 服务账号密钥。后续需要后端生成上传授权，用来存头像、图片或频道附件。</p>
      </div>
    `;

    document.querySelector("#loginButton").addEventListener("click", loginUser);
    document.querySelector("#registerButton").addEventListener("click", registerUser);
    document.querySelector("#authForm").addEventListener("submit", (event) => {
      event.preventDefault();
      loginUser();
    });
    return;
  }

  elements.worldAuthPanel.innerHTML = `
    <div class="world-panel identity-panel">
      <div class="world-panel-header">
        <strong>已登入：${escapeHtml(currentUser.username)}</strong>
        <button class="ghost-button compact-ghost" id="logoutButton" type="button">登出</button>
      </div>
      <p>这是本地世界频道原型；真正上线后会把登入、消息和附件同步到云端。</p>
    </div>
    <form class="world-panel message-panel" id="worldMessageForm">
      <div class="field">
        <label for="worldMessageInput">发送到世界频道</label>
        <textarea id="worldMessageInput" maxlength="220" placeholder="写一句话，最多 220 字。"></textarea>
      </div>
      <div class="custom-actions">
        <button class="primary-button compact-primary" type="submit">发送消息</button>
        <label class="image-upload-button">
          <input id="worldImageInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
          上传图片
        </label>
      </div>
      <small class="upload-status" id="worldUploadStatus">支持 PNG / JPG / WebP / GIF，最大 8MB。</small>
    </form>
  `;

  document.querySelector("#logoutButton").addEventListener("click", logoutUser);
  document.querySelector("#worldMessageForm").addEventListener("submit", (event) => {
    event.preventDefault();
    sendWorldMessage();
  });
  document.querySelector("#worldImageInput").addEventListener("change", uploadWorldImage);
}

function renderTravelControls() {
  elements.modeControls.innerHTML = `
    <div class="field">
      <label for="travelMood">旅行心情</label>
      <select id="travelMood">
        ${TRAVEL_MOODS.map((mood) => `<option value="${mood}" ${mood === state.travel.mood ? "selected" : ""}>${mood}</option>`).join("")}
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
      <input id="travelNote" value="锁定 5 个地点后，只在这些地点里随机" readonly />
    </div>
  `;

  document.querySelector("#travelMood").addEventListener("change", (event) => {
    state.travel.mood = event.target.value;
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
  elements.modeControls.innerHTML = `
    <label class="toggle-field">
      <input id="allowRepeat" type="checkbox" ${state.number.allowRepeat ? "checked" : ""} />
      允许重复数字
    </label>
    <label class="toggle-field">
      <input id="avoidFour" type="checkbox" ${state.number.avoidFour ? "checked" : ""} />
      不包含数字 4
    </label>
  `;

  document.querySelector("#allowRepeat").addEventListener("change", (event) => {
    state.number.allowRepeat = event.target.checked;
    saveState();
    renderPreview();
  });

  document.querySelector("#avoidFour").addEventListener("change", (event) => {
    state.number.avoidFour = event.target.checked;
    saveState();
    renderPreview();
  });
}

function renderShoppingControls() {
  const categories = Object.keys(SHOPPING_DATA);
  const currentCategory = SHOPPING_DATA[state.shopping.category] ? state.shopping.category : categories[0];
  const currentLevel = SHOPPING_LEVELS.includes(state.shopping.level) ? state.shopping.level : "全部";

  state.shopping.category = currentCategory;
  state.shopping.level = currentLevel;

  elements.modeControls.innerHTML = `
    <div class="field">
      <label for="shoppingCategory">购物类别</label>
      <select id="shoppingCategory">
        ${categories.map((category) => `<option value="${category}" ${category === currentCategory ? "selected" : ""}>${category}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="shoppingLevel">消费等级</label>
      <select id="shoppingLevel">
        ${SHOPPING_LEVELS.map((level) => `<option value="${level}" ${level === currentLevel ? "selected" : ""}>${level}</option>`).join("")}
      </select>
    </div>
  `;

  document.querySelector("#shoppingCategory").addEventListener("change", (event) => {
    state.shopping.category = event.target.value;
    saveState();
    renderControls();
    renderPreview();
  });

  document.querySelector("#shoppingLevel").addEventListener("change", (event) => {
    state.shopping.level = event.target.value;
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
    const chips = ["0000 - 9999", "四位数补零", "仅供娱乐"];

    if (!state.number.allowRepeat) {
      chips.push("不重复");
    }

    if (state.number.avoidFour) {
      chips.push("避开 4");
    }

    return chips.map((title) => ({ title }));
  }

  if (state.mode === "shopping") {
    const items = SHOPPING_DATA[state.shopping.category];

    if (state.shopping.level === "全部") {
      return items;
    }

    return items.filter((item) => item.level === state.shopping.level);
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

  const optionMarkup = options
    .slice(0, 24)
    .map((item) => renderOptionChip(item))
    .join("");
  const lockHint = LOCKABLE_MODES.has(state.mode)
    ? `<span class="chip lock-note">${lockedOptions.length ? "已启用锁定随机" : "点候选可锁定"}</span>`
    : "";
  const clearLockButton = LOCKABLE_MODES.has(state.mode) && totalLocked
    ? `<button class="chip clear-locks-chip" type="button" data-clear-locks="true">清除锁定</button>`
    : "";

  elements.optionPreview.innerHTML = `${optionMarkup}${lockHint}${clearLockButton}`;
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
              <div>
                <strong>${escapeHtml(message.user)}</strong>
                <small>${escapeHtml(message.time)}</small>
              </div>
              ${message.text ? `<p>${escapeHtml(message.text)}</p>` : ""}
              ${renderWorldAttachment(message.attachment)}
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderWorldAttachment(attachment) {
  if (!attachment || attachment.type !== "image" || !attachment.url) {
    return "";
  }

  const imageName = attachment.name || "上传图片";

  return `
    <a class="world-image-link" href="${escapeHtml(attachment.url)}" target="_blank" rel="noreferrer">
      <img src="${escapeHtml(attachment.url)}" alt="${escapeHtml(imageName)}" loading="lazy" />
      <span>${escapeHtml(imageName)}</span>
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
  const lockedIcon = locked ? "🔒" : "＋";

  return `
    <button class="chip option-chip${lockedClass}" type="button" data-lock-title="${escapeHtml(item.title)}" aria-pressed="${locked}">
      <span class="chip-pin">${lockedIcon}</span>
      <span>${escapeHtml(item.title)}</span>
      ${details ? `<small class="chip-detail">${escapeHtml(details)}</small>` : ""}
    </button>
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
    return `${item.country} · ${getBudgetText(item)}`;
  }

  if (state.mode === "shopping") {
    return `${item.level} · ${formatBudget(item.budget)}`;
  }

  if (state.mode === "custom") {
    return item.meta;
  }

  return "";
}

function getFilteredTravel() {
  return TRAVEL_DATA.filter((item) => {
    const moodMatches = state.travel.mood === "全部" || item.tags.includes(state.travel.mood);
    const levelMatches = state.travel.level === "全部" || item.budgets[state.travel.level];
    const transportMatches = state.travel.transport === "全部" || item.transports.includes(state.travel.transport);

    return moodMatches && levelMatches && transportMatches;
  });
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

    return {
      mode: state.mode,
      title: travelResult.title,
      meta: `${travelResult.country} · ${travelResult.days} 天 · ${state.travel.transport === "全部" ? travelResult.transports[0] : state.travel.transport} · 预算约 ${budgetText}/人${poolNote}。${travelResult.note}`,
    };
  }

  if (state.mode === "number") {
    const digits = generateDigits();

    return {
      mode: state.mode,
      title: digits.join(""),
      meta: buildNumberMeta(),
      digits,
    };
  }

  if (state.mode === "shopping") {
    const shoppingResult = choose(pool);

    return {
      mode: state.mode,
      title: shoppingResult.title,
      meta: `${state.shopping.category} · ${shoppingResult.level} · 预算约 ${shoppingResult.budget}${poolNote}`,
    };
  }

  const customResult = choose(pool);

  return {
    mode: state.mode,
    title: customResult.title,
    meta: `来自你的 ${options.length} 个自定义选项${poolNote}`,
  };
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

function getCurrentUser() {
  if (!state.auth.currentUser) {
    return null;
  }

  return state.users.find((user) => user.username === state.auth.currentUser) || null;
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

function getAuthFormValues() {
  const username = document.querySelector("#authUsername")?.value.trim();
  const password = document.querySelector("#authPassword")?.value;

  return { username, password };
}

function registerUser() {
  const { username, password } = getAuthFormValues();

  if (!isValidUsername(username)) {
    showToast("用户名需 2-20 字，只能包含字母、数字、中文、_ 或 -。");
    return;
  }

  if (!password || password.length < 4) {
    showToast("密码至少 4 个字符；本地原型请勿使用真实密码。");
    return;
  }

  if (state.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    showToast("这个用户名已经注册。");
    return;
  }

  state.users.push({
    username,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  });
  state.auth.currentUser = username;
  state.worldOpen = true;
  saveState();
  render();
  showToast(`欢迎加入世界频道，${username}。`);
}

function loginUser() {
  const { username, password } = getAuthFormValues();
  const user = state.users.find((item) => item.username.toLowerCase() === username?.toLowerCase());

  if (!user || user.passwordHash !== hashPassword(password || "")) {
    showToast("用户名或密码不正确。");
    return;
  }

  state.auth.currentUser = user.username;
  state.worldOpen = true;
  saveState();
  render();
  showToast(`欢迎回来，${user.username}。`);
}

function logoutUser() {
  state.auth.currentUser = "";
  saveState();
  render();
  showToast("已登出世界频道。");
}

function addWorldMessage({ user, text, attachment }) {
  state.worldMessages = [
    ...state.worldMessages,
    {
      id: `${Date.now()}-${randomInt(1000)}`,
      user,
      text,
      attachment,
      time: new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    },
  ].slice(-80);
  state.worldOpen = true;
  saveState();
  render();
}

function sendWorldMessage() {
  const currentUser = getCurrentUser();
  const input = document.querySelector("#worldMessageInput");
  const text = input?.value.trim();

  if (!currentUser) {
    showToast("请先登入再发言。");
    return;
  }

  if (!text) {
    showToast("先写一点内容再发送。");
    return;
  }

  addWorldMessage({
    user: currentUser.username,
    text,
  });
  input.value = "";
  showToast("消息已发送到世界频道。");
}

async function uploadWorldImage(event) {
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
    showToast("图片不能超过 8MB。");
    return;
  }

  const uploadStatus = document.querySelector("#worldUploadStatus");
  const uploadButton = document.querySelector(".image-upload-button");
  input.disabled = true;
  uploadButton?.classList.add("is-uploading");
  setUploadStatus("正在上传图片到 Google Cloud Storage…");
  let uploadSucceeded = false;

  try {
    const attachment = await uploadImageThroughSignedUrl(file);
    addImageMessage(currentUser.username, file, attachment);
    uploadSucceeded = true;
    showToast("图片已上传到世界频道。");
  } catch (signedUrlError) {
    try {
      if (file.size > FALLBACK_IMAGE_UPLOAD_BYTES) {
        throw signedUrlError;
      }

      setUploadStatus("直传被拦截，正在使用 Vercel 备用上传…");
      const attachment = await uploadImageThroughServer(file);
      addImageMessage(currentUser.username, file, attachment);
      uploadSucceeded = true;
      showToast("图片已通过备用通道上传。");
    } catch (fallbackError) {
      setUploadStatus(`上传失败：${fallbackError.message || signedUrlError.message}`);
      showToast("图片上传失败，请检查 GCS 权限或 CORS。");
    }
  } finally {
    input.value = "";
    input.disabled = false;
    uploadButton?.classList.remove("is-uploading");

    if (!uploadSucceeded && (uploadStatus?.textContent.startsWith("正在") || uploadStatus?.textContent.startsWith("直传"))) {
      setUploadStatus("支持 PNG / JPG / WebP / GIF，最大 8MB。");
    }
  }
}

function addImageMessage(username, file, attachment) {
  addWorldMessage({
    user: username,
    text: `上传了一张图片：${file.name}`,
    attachment: {
      type: "image",
      name: file.name,
      contentType: file.type,
      ...attachment,
    },
  });
  setUploadStatus("图片已上传成功。");
}

async function uploadImageThroughSignedUrl(file) {
  const signedResponse = await fetch("/api/gcs-signed-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
    throw new Error(`GCS 上传失败：${uploadResponse.status}`);
  }

  return {
    url: signedPayload.viewUrl || signedPayload.publicUrl,
    publicUrl: signedPayload.publicUrl,
    objectName: signedPayload.objectName || signedPayload.filePath,
    transport: "signed-url",
  };
}

async function uploadImageThroughServer(file) {
  const uploadResponse = await fetch("/api/gcs-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

function setUploadStatus(message) {
  const uploadStatus = document.querySelector("#worldUploadStatus");

  if (uploadStatus) {
    uploadStatus.textContent = message;
  }
}

function isValidUsername(username) {
  return /^[\w\u4e00-\u9fa5-]{2,20}$/u.test(username || "");
}

function hashPassword(password) {
  let hash = 5381;

  for (const character of String(password)) {
    hash = (hash * 33) ^ character.charCodeAt(0);
  }

  return `local-${(hash >>> 0).toString(36)}`;
}

function generateDigits() {
  const availableDigits = state.number.avoidFour
    ? ["0", "1", "2", "3", "5", "6", "7", "8", "9"]
    : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const pool = [...availableDigits];
  const digits = [];

  for (let index = 0; index < 4; index += 1) {
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

  return digits;
}

function buildNumberMeta() {
  const rules = ["四位随机"];

  if (!state.number.allowRepeat) {
    rules.push("不重复");
  }

  if (state.number.avoidFour) {
    rules.push("不含 4");
  }

  rules.push("仅供娱乐");
  return rules.join(" · ");
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
    addHistory(result);
    saveState();
    elements.resultStage.classList.remove("is-spinning");
    elements.randomButton.disabled = false;
  }, 520);
}

function renderResult(result) {
  elements.resultLabel.textContent = MODES[result.mode].label;
  elements.resultValue.textContent = result.mode === "number" ? "你的四位号码" : result.title;
  elements.resultMeta.textContent = formatBudget(result.meta);

  if (result.digits) {
    elements.numberDigits.hidden = false;
    elements.numberDigits.innerHTML = result.digits.map((digit) => `<span class="digit-box">${digit}</span>`).join("");
    return;
  }

  elements.numberDigits.hidden = true;
  elements.numberDigits.innerHTML = "";
}

function addHistory(result) {
  const entry = {
    ...result,
    id: `${Date.now()}-${randomInt(1000)}`,
    time: new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  };

  state.history = [entry, ...state.history].slice(0, 8);
  renderHistory();
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

  state.favorites = [
    {
      ...state.currentResult,
      id: `${Date.now()}-${randomInt(1000)}`,
    },
    ...state.favorites,
  ].slice(0, 8);

  saveState();
  renderFavorites();
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
          <small>${MODES[item.mode].title}${timeText}<br>${escapeHtml(formatBudget(item.meta))}</small>
        </article>
      `;
    })
    .join("");
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

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2400);
}

elements.randomButton.addEventListener("click", drawResult);
elements.favoriteButton.addEventListener("click", favoriteCurrent);
elements.clearHistoryButton.addEventListener("click", clearHistory);
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

loadState();
formatDateLabel();
renderDailyInspiration();
render();
