const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT_DIR = path.resolve(__dirname, "..");
const MAX_REPORT_ITEMS = 50;
const LOCALE_FILES = {
  "zh-CN": "locales/zh-CN.js",
  en: "locales/en.js",
  ms: "locales/ms.js",
};
const PRIMARY_SCAN_FILES = ["app.js", "index.html"];
const CORE_PREFIXES = [
  "common.",
  "mode.",
  "settings.",
  "notification.",
  "world.",
  "gift.",
  "home.",
  "result.",
  "filter.",
  "candidate.",
  "travelFilter.",
  "travel.",
  "error.",
  "empty.",
  "confirm.",
];
const RESERVED_PREFIXES = ["friend.", "chat.", "prize.", "onboarding."];
const HELPER_PREFIXES = {
  commonText: "common",
  homeText: "home",
  resultText: "result",
  settingsText: "settings",
  notificationText: "notification",
  worldText: "world",
  giftText: "gift",
  filterText: "filter",
  candidateText: "candidate",
};
const LOCALE_FALLBACK_HELPERS = [
  "t(",
  "commonText(",
  "homeText(",
  "resultText(",
  "settingsText(",
  "notificationText(",
  "worldText(",
  "giftText(",
  "filterText(",
  "candidateText(",
  "fixedLabelText(",
  "formatLocaleText(",
  "getModeText(",
  "getModeTitle(",
];
const HIGH_RISK_CHINESE_PATTERNS = [
  /showToast\(\s*[`'"]/,
  /window\.confirm\(\s*[`'"]/,
  /\.textContent\s*=\s*[`'"]/,
  /\.innerHTML\s*=\s*[`'"]/,
  /setAttribute\([^,]+,\s*[`'"]/,
  /placeholder\s*=/,
  /aria-label\s*=/,
  /<title\b/i,
  /<h[1-6]\b/i,
  /<label\b/i,
  /<button\b/i,
  /<span\b/i,
  /<strong\b/i,
  /<small\b/i,
  /<p\b/i,
];
const ENGLISH_UI_TERMS = [
  "Copy result",
  "Share",
  "Home features",
  "World Channel",
  "Save Result",
  "Settings",
  "Feedback",
  "Sign in",
  "Register",
];
const LEGACY_UI_CHINESE_ALLOW_PATTERNS = [
  /profile/i,
  /myProfile/i,
  /feedback/i,
  /lottery/i,
  /customText|sampleCustom|clearCustom/i,
  /worldImageViewer|worldImageCrop|worldCrop/i,
  /avatarCrop/i,
  /submitButton\.textContent/,
  /confirmButton\.textContent/,
  /currentConfirmButton\.textContent/,
  /window\.confirm\("移除后/,
  /<small>第 \$\{index \+ 1\} 组<\/small>/,
  /我的主页|我的世界频道内容|查看资料和管理|最近 20 条|换头像|右上角会显示|没有图片时|移除后会回到|保存资料|编辑文字|最多 220 字/,
  /这次你会看到|技术整理|反馈问题|Bug、建议|最多 80 字|最多 1000 字|设备：/,
  /图片加载失败|这张图片没有文字说明|滚轮缩放|固定 1:1|圆形预览|拖动图片|头像缩放快捷按钮|<span>缩放<\/span>/,
  /选择比例后|图片已准备/,
  />保存<\/button>|>取消<\/button>|>移除<\/button>/,
];

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT_DIR, relativePath), "utf8");
}

function lineNumberAt(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function isCoreKey(key) {
  return CORE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function isReservedKey(key) {
  return RESERVED_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function loadLocale(language, file) {
  const source = readFile(file);
  const sandbox = { window: { APP_LOCALES: {} } };
  vm.runInNewContext(source, sandbox, { filename: file });
  const dictionary = sandbox.window.APP_LOCALES?.[language];

  if (!dictionary || typeof dictionary !== "object") {
    throw new Error(`${file} did not expose window.APP_LOCALES[${language}]`);
  }

  return dictionary;
}

function pushLimited(target, message) {
  target.total += 1;

  if (target.items.length < MAX_REPORT_ITEMS) {
    target.items.push(message);
  }
}

function printGroup(prefix, group) {
  group.items.forEach((message) => console.log(`${prefix} ${message}`));

  if (group.total > group.items.length) {
    console.log(`${prefix} ... ${group.total - group.items.length} more`);
  }
}

function createGroup() {
  return { total: 0, items: [] };
}

const failures = createGroup();
const warnings = createGroup();
const allowed = createGroup();

let dictionaries;

try {
  dictionaries = Object.fromEntries(
    Object.entries(LOCALE_FILES).map(([language, file]) => [language, loadLocale(language, file)]),
  );
} catch (error) {
  pushLimited(failures, `Locale load failed: ${error.message}`);
  dictionaries = {};
}

const languageKeys = Object.fromEntries(
  Object.entries(dictionaries).map(([language, dictionary]) => [language, new Set(Object.keys(dictionary))]),
);
const canonicalKeys = [...(languageKeys["zh-CN"] || new Set())].sort();

function checkLocaleKeyConsistency() {
  Object.entries(languageKeys).forEach(([language, keys]) => {
    const missingFromLanguage = canonicalKeys.filter((key) => !keys.has(key));
    const extraInLanguage = [...keys].filter((key) => !languageKeys["zh-CN"]?.has(key)).sort();

    missingFromLanguage.forEach((key) => {
      const report = `Missing key in ${language}: ${key}`;
      if (isCoreKey(key)) {
        pushLimited(failures, report);
      } else if (isReservedKey(key)) {
        pushLimited(warnings, `${report} (reserved future key)`);
      } else {
        pushLimited(failures, report);
      }
    });

    extraInLanguage.forEach((key) => {
      const report = `Extra key in ${language}: ${key}`;
      if (isCoreKey(key)) {
        pushLimited(failures, report);
      } else {
        pushLimited(warnings, report);
      }
    });
  });
}

function checkSuspiciousLocaleValues() {
  Object.entries(dictionaries).forEach(([language, dictionary]) => {
    Object.entries(dictionary).forEach(([key, value]) => {
      const text = String(value ?? "");
      const trimmed = text.trim();

      if (!trimmed) {
        pushLimited(failures, `Empty locale value in ${language}: ${key}`);
      }

      if (/\?{4,}/.test(text) || text.includes("锟") || text.includes("�")) {
        pushLimited(failures, `Suspicious locale value in ${language}: ${key} = ${text}`);
      }

      if (["undefined", "null", "[object Object]"].includes(trimmed)) {
        pushLimited(failures, `Unsafe locale value in ${language}: ${key} = ${text}`);
      }
    });
  });
}

function extractUsedKeys() {
  const source = readFile("app.js");
  const used = [];
  const directPattern = /\bt\(\s*["']([^"'`]+)["']/g;
  let match;

  while ((match = directPattern.exec(source))) {
    used.push({ key: match[1], line: lineNumberAt(source, match.index), helper: "t" });
  }

  Object.entries(HELPER_PREFIXES).forEach(([helper, prefix]) => {
    const pattern = new RegExp("\\b" + helper + "\\(\\s*[\"']([^\"'`]+)[\"']", "g");

    while ((match = pattern.exec(source))) {
      used.push({
        key: `${prefix}.${match[1]}`,
        line: lineNumberAt(source, match.index),
        helper,
      });
    }
  });

  return used;
}

function checkUsedLocaleKeys() {
  const usedKeys = extractUsedKeys();

  usedKeys.forEach(({ key, line, helper }) => {
    const missingLanguages = Object.entries(languageKeys)
      .filter(([, keys]) => !keys.has(key))
      .map(([language]) => language);

    if (!missingLanguages.length) {
      return;
    }

    const message = `Missing used key ${key} from ${missingLanguages.join(", ")} (app.js:${line}, ${helper})`;

    if (isCoreKey(key)) {
      pushLimited(failures, message);
    } else if (isReservedKey(key)) {
      pushLimited(warnings, message);
    } else {
      pushLimited(failures, message);
    }
  });
}

function isAppDataOrReleaseLine(lineNumber) {
  return lineNumber < 2250;
}

function isLocaleFallbackLine(line) {
  return LOCALE_FALLBACK_HELPERS.some((helper) => line.includes(helper));
}

function isKnownLegacyUiChineseLine(line) {
  return LEGACY_UI_CHINESE_ALLOW_PATTERNS.some((pattern) => pattern.test(line));
}

function checkHardcodedChinese() {
  PRIMARY_SCAN_FILES.forEach((file) => {
    const lines = readFile(file).split(/\r?\n/);

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      if (!/\p{Script=Han}/u.test(line) || /^\s*\/\//.test(line)) {
        return;
      }

      if (file === "app.js" && isAppDataOrReleaseLine(lineNumber)) {
        pushLimited(allowed, `${file}:${lineNumber} Chinese data/release/fallback text allowed`);
        return;
      }

      if (file === "app.js" && isLocaleFallbackLine(line)) {
        pushLimited(allowed, `${file}:${lineNumber} Chinese locale fallback allowed`);
        return;
      }

      const isHighRisk = HIGH_RISK_CHINESE_PATTERNS.some((pattern) => pattern.test(line));

      if (file === "index.html") {
        const level = isHighRisk ? "bootstrap UI fallback" : "static fallback";
        pushLimited(warnings, `Hardcoded Chinese ${level} in ${file}:${lineNumber}: ${line.trim().slice(0, 140)}`);
        return;
      }

      if (isHighRisk && !isKnownLegacyUiChineseLine(line)) {
        pushLimited(failures, `Hardcoded Chinese UI in ${file}:${lineNumber}: ${line.trim().slice(0, 140)}`);
        return;
      }

      if (isHighRisk) {
        pushLimited(warnings, `Legacy hardcoded Chinese UI in ${file}:${lineNumber}: ${line.trim().slice(0, 140)}`);
        return;
      }

      pushLimited(warnings, `Hardcoded Chinese text in ${file}:${lineNumber}: ${line.trim().slice(0, 140)}`);
    });
  });
}

function checkHardcodedEnglishWarnings() {
  PRIMARY_SCAN_FILES.forEach((file) => {
    const lines = readFile(file).split(/\r?\n/);

    lines.forEach((line, index) => {
      if (isLocaleFallbackLine(line) || /^\s*\/\//.test(line)) {
        return;
      }

      ENGLISH_UI_TERMS.forEach((term) => {
        if (line.includes(term)) {
          pushLimited(warnings, `Possible hardcoded English UI in ${file}:${index + 1}: ${term}`);
        }
      });
    });
  });
}

checkLocaleKeyConsistency();
checkSuspiciousLocaleValues();
checkUsedLocaleKeys();
checkHardcodedChinese();
checkHardcodedEnglishWarnings();

const languageCount = Object.keys(LOCALE_FILES).length;
const keyCount = canonicalKeys.length;
const hardcodedChineseFailures = failures.items.filter((item) => item.includes("Hardcoded Chinese")).length;
const missingKeyFailures = failures.items.filter((item) => item.includes("Missing")).length;
const suspiciousFailures = failures.items.filter((item) => item.includes("Suspicious") || item.includes("Unsafe") || item.includes("Empty")).length;

console.log(`[i18n] Locale key check ${missingKeyFailures ? "failed" : "passed"}: ${languageCount} languages, ${keyCount} keys`);
console.log(`[i18n] Hardcoded UI Chinese: ${hardcodedChineseFailures} fail, ${warnings.total} warnings`);
console.log(`[i18n] Missing keys: ${missingKeyFailures} fail`);
console.log(`[i18n] Suspicious locale values: ${suspiciousFailures} fail`);
console.log(`[i18n] Allowed data/fallback Chinese lines: ${allowed.total}`);

if (failures.total) {
  printGroup("[i18n][fail]", failures);
}

if (warnings.total) {
  printGroup("[i18n][warn]", warnings);
}

if (allowed.total && process.env.I18N_AUDIT_VERBOSE === "1") {
  printGroup("[i18n][allow]", allowed);
}

if (failures.total) {
  process.exit(1);
}
