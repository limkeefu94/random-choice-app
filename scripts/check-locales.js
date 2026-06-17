const fs = require("fs");
const vm = require("vm");

const LOCALE_FILES = {
  "zh-CN": "locales/zh-CN.js",
  en: "locales/en.js",
  ms: "locales/ms.js",
};

const REQUIRED_KEYS = [
  "common.close",
  "common.cancel",
  "common.save",
  "common.done",
  "common.comingSoon",
  "mode.food.title",
  "mode.drink.title",
  "mode.travel.title",
  "mode.number.title",
  "mode.shopping.title",
  "mode.gift.title",
  "mode.custom.title",
  "mode.eat.title",
  "mode.buy.title",
  "mode.lottery.title",
  "mode.world.title",
  "home.featuresTitle",
  "home.chooseMode",
  "home.socialEntry",
  "home.inspirationTitle",
  "home.recentTitle",
  "home.favoritesTitle",
  "inspiration.smallFirst.title",
  "inspiration.smallFirst.text",
  "travelFilter.countryIntent",
  "travelFilter.mood",
  "travelFilter.activity",
  "travelFilter.budget",
  "travelFilter.transport",
  "travelFilter.friendSuggestion",
  "travel.days",
  "label.全部",
  "label.马来西亚",
  "label.日本",
  "label.韩国",
  "label.自驾游",
  "label.购物",
  "label.温泉",
  "result.randomPick",
  "result.copyResult",
  "result.share",
  "result.saveResult",
  "result.budgetApprox",
  "result.budgetApproxPerPerson",
  "result.pressButtonPrompt",
  "result.pressButtonHint",
  "filter.title",
  "filter.budget",
  "filter.country",
  "filter.region",
  "filter.foodCategory",
  "candidate.title",
  "candidate.count",
  "settings.title",
  "settings.privacy",
  "settings.friends",
  "settings.notifications",
  "settings.contentPreferences",
  "settings.app",
  "notification.title",
  "notification.markAllRead",
  "notification.clearLocal",
  "notification.empty",
  "notification.system",
  "notification.release",
  "notification.friendRequest",
  "world.title",
  "world.short",
  "world.openWindow",
  "world.signInTitle",
  "world.signInToPost",
  "world.username",
  "world.usernamePlaceholder",
  "world.usernameHint",
  "world.imageAndRecords",
  "world.imageReady",
  "world.worldConnectedCloud",
  "world.syncPausedLocalOnly",
  "world.secretNotShown",
  "world.sharedPhoto",
  "world.loginToPost",
  "world.loginToLike",
  "gift.title",
  "gift.startPairing",
  "gift.copyResult",
  "gift.confirmCopyHidden",
  "friend.search",
  "friend.comingSoon",
  "chat.privateChat",
  "chat.groupChat",
  "prize.title",
  "prize.comingSoon",
  "onboarding.welcomeTitle",
  "error.generic",
  "empty.noNotifications",
  "confirm.copyHiddenResults",
];

function loadLocale(language, file) {
  const source = fs.readFileSync(file, "utf8");
  const sandbox = { window: { APP_LOCALES: {} } };
  vm.runInNewContext(source, sandbox, { filename: file });
  const dictionary = sandbox.window.APP_LOCALES?.[language];

  if (!dictionary || typeof dictionary !== "object") {
    throw new Error(`${file} did not expose window.APP_LOCALES[${language}]`);
  }

  return dictionary;
}

const dictionaries = Object.fromEntries(
  Object.entries(LOCALE_FILES).map(([language, file]) => [language, loadLocale(language, file)]),
);
const languageKeys = Object.fromEntries(
  Object.entries(dictionaries).map(([language, dictionary]) => [language, new Set(Object.keys(dictionary))]),
);
const canonicalKeys = [...languageKeys["zh-CN"]].sort();
let hasError = false;

for (const [language, keys] of Object.entries(languageKeys)) {
  const missingFromLanguage = canonicalKeys.filter((key) => !keys.has(key));
  const extraInLanguage = [...keys].filter((key) => !languageKeys["zh-CN"].has(key)).sort();

  if (missingFromLanguage.length || extraInLanguage.length) {
    hasError = true;
    console.error(`[locale] ${language} key mismatch`);
    if (missingFromLanguage.length) {
      console.error(`  missing: ${missingFromLanguage.join(", ")}`);
    }
    if (extraInLanguage.length) {
      console.error(`  extra: ${extraInLanguage.join(", ")}`);
    }
  }
}

for (const [language, dictionary] of Object.entries(dictionaries)) {
  const missingRequired = REQUIRED_KEYS.filter((key) => !(key in dictionary));

  if (missingRequired.length) {
    hasError = true;
    console.error(`[locale] ${language} missing required keys: ${missingRequired.join(", ")}`);
  }

  Object.entries(dictionary).forEach(([key, value]) => {
    const text = String(value ?? "");

    if (!text.trim()) {
      hasError = true;
      console.error(`[locale] ${language}.${key} is empty`);
    }

    if (/\?{4,}/.test(text) || text.includes("�")) {
      hasError = true;
      console.error(`[locale] ${language}.${key} looks corrupted: ${text}`);
    }

    if (/\bundefined\b|\bnull\b|\[object Object\]/.test(text)) {
      hasError = true;
      console.error(`[locale] ${language}.${key} contains unsafe placeholder text: ${text}`);
    }
  });
}

if (hasError) {
  process.exit(1);
}

console.log(`[locale] ${Object.keys(LOCALE_FILES).length} languages, ${canonicalKeys.length} keys checked`);
