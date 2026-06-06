(function () {
  const shoppingGlobal = typeof window !== "undefined" ? window : globalThis;

  function shop(title, level, budget, tags = []) {
    return { title, level, budget, tags };
  }

  function inferSubcategory(title, tags = [], sourceCategory = "") {
    const text = `${title} ${tags.join(" ")} ${sourceCategory}`;

    if (/iPhone|手机|phone/i.test(text)) return "手机";
    if (/平板|tablet|iPad/i.test(text)) return "平板";
    if (/耳机|音响|audio|speaker/i.test(text)) return "耳机 / 音响";
    if (/键盘|键帽|鼠标|电脑配件/i.test(text)) return "电脑配件";
    if (/充电|线|移动电源|支架/i.test(text)) return "充电器 / 线材";
    if (/腕表|手表|watch/i.test(text)) return sourceCategory === "奢侈品" ? "腕表" : "智能穿戴";
    if (/床单|浴巾|小夜灯|绿植|净水器/i.test(text)) return "家居用品";
    if (/剪刀|空气炸锅|咖啡豆/i.test(text)) return "厨房小工具";
    if (/洗衣|收纳|清新|扫地|清洁/i.test(text)) return "清洁收纳";
    if (/鞋|皮鞋|运动鞋/i.test(text)) return "鞋履";
    if (/包|通勤包|手袋/i.test(text)) return "包袋";
    if (/T|外套|大衣|帽子|袜/i.test(text)) return "服饰";
    if (/防晒|精华|护肤/i.test(text)) return "护肤";
    if (/唇膏|彩妆|眉/i.test(text)) return "彩妆";
    if (/香水/i.test(text)) return sourceCategory === "奢侈品" ? "高级香水" : "香水";
    if (/美容仪/i.test(text)) return "美容工具";
    if (/瑜伽/i.test(text)) return "瑜伽";
    if (/跑步|运动水壶/i.test(text)) return "跑步";
    if (/登山|露营|户外/i.test(text)) return "户外运动";
    if (/花束|卡片|礼盒|体验券|定制/i.test(text)) return "礼物";
    if (/钱包|丝巾|太阳眼镜|珠宝|旅行箱/i.test(text)) return "奢华配饰";
    if (/24 小时|愿望清单|比较|替代|预算/i.test(text)) return "效率工具";

    return "全部";
  }

  function inferCategory(sourceCategory, subcategory) {
    if (sourceCategory === "数码小物") {
      return ["电脑配件"].includes(subcategory) ? "电脑与配件" : "电子产品";
    }

    if (sourceCategory === "生活补给" || sourceCategory === "家里缺的") return "家居生活";
    if (sourceCategory === "穿搭") return "服饰穿搭";
    if (sourceCategory === "美妆护肤") return "美妆护理";
    if (sourceCategory === "运动户外") return subcategory === "户外运动" ? "旅行户外" : "健康运动";
    if (sourceCategory === "理性提醒") return "软件 / 订阅 / 数字产品";

    return sourceCategory;
  }

  function inferReason(item, category, subcategory) {
    if (item.reason) return item.reason;
    if (item.level === "理性") return "适合不确定是否真的需要时，先帮自己降温。";
    return `适合正在考虑${category} / ${subcategory}的人。`;
  }

  function inferPriority(item) {
    if (item.priority) return item.priority;
    if (item.level === "奢侈品" || item.level === "高消费") return "想清楚再买";
    if (item.level === "理性") return "先别买";
    return "按预算再买";
  }

  function normalizeShopItem(item, sourceCategory) {
    const subcategory = item.subcategory || inferSubcategory(item.title, item.tags, sourceCategory);
    const category = item.category || inferCategory(sourceCategory, subcategory);

    return {
      title: item.title,
      category,
      subcategory,
      level: item.level,
      budget: item.budget,
      tags: Array.isArray(item.tags) ? item.tags : [],
      reason: inferReason(item, category, subcategory),
      priority: inferPriority(item),
    };
  }

  function normalizeShoppingData(data) {
    return Object.fromEntries(
      Object.entries(data).map(([category, items]) => [
        category,
        items.map((item) => normalizeShopItem(item, category)),
      ]),
    );
  }

  const shoppingData = {
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
      {
        title: "iPhone 16 / 17 系列",
        category: "电子产品",
        subcategory: "手机",
        level: "高消费",
        budget: "RM3500-6500",
        tags: ["手机", "升级", "长期使用"],
        reason: "适合想升级主力手机的人",
        priority: "想清楚再买",
      },
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

  const shoppingCategoryTree = [
    {
      title: "日常购物",
      categories: ["生活补给", "家里缺的", "数码小物"],
    },
    {
      title: "个人风格",
      categories: ["穿搭", "美妆护肤", "运动户外"],
    },
    {
      title: "特别场景",
      categories: ["礼物", "奢侈品", "理性提醒"],
    },
  ];

  shoppingGlobal.SHOPPING_DATA = normalizeShoppingData(shoppingData);
  shoppingGlobal.SHOPPING_CATEGORY_TREE = shoppingCategoryTree;
})();
