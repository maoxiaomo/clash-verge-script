// =========================
// Clash Verge Rev 扩展脚本（修订版）
// 主要修订：
//   1. SmartAi 组的 filter 原来不生效 -> 改为显式排除港澳台的策略组列表
//   2. 国家分组正则修正（US/UK/DE/FR 误吞 Russia/Ukraine/Sweden/Frankfurt）
//   3. groupBaseOption.interval 10000s -> 300s
//   4. 规则顺序修正：private/lancidr 前置、github.io 前置、AI 前置于 GEOIP,google
//   5. 流媒体从 YouTube 组中拆出；删除无任何规则引用的空转组「全局拦截」
//   6. 补 sniffer / profile.store-selected；udp 强开同时覆盖 proxy-providers
//   7. 删除死规则 gstatic.com / googleapis.cn（已被 geosite:google 覆盖）；补国内游戏平台直连；
//      测速参数放宽（timeout 5s / tolerance 100）；无 provider 时自动裁掉空的国家组
//   8. 苹果服务独立成组（默认 DIRECT，可面板切换）；流媒体组改 fallback + Netflix 解锁检测；
//      国外 DoH 精简为 Cloudflare + Google
//   9. 新增「负载均衡」组，仅作为「国际域名」「漏网之鱼」的可选项，不进 coreProxies
//  10. 地区匹配加国旗 emoji（很多机场节点名只有国旗没有文字）；地区扩到 30 个；
//      中转节点（🇭🇰 → 🇺🇸）按最后出现的地区归组，不再同时进两个地区组
//  11. 国家码只把英文字母当边界，"🇰🇷KR_1"、"US_2"、"DE01" 这类名字也能正确归组
//      （下划线属于 \w，原来的 \bKR\b 匹配不到 KR_1）；新增节点名清理（去推广域名）
//  12. 新增「其他节点」组，收纳没有匹配到任何地区的节点
// =========================

// =========================
// 1. DNS 配置区域
// =========================

// 国内DNS服务器
const domesticNameservers = [
  "https://223.5.5.5/dns-query", // 阿里DoH
  "https://doh.pub/dns-query"    // 腾讯DoH
];
// 国外DNS服务器
// 只留两家：OpenDNS / Yandex 在国内链路上经常慢或不通，mihomo 并发查询时只会拖长超时场景
const foreignNameservers = [
  "https://1.1.1.1/dns-query", // CloudflareDNS
  "https://8.8.8.8/dns-query"  // GoogleDNS
];

const dnsConfig = {
  "enable": true,
  // 只给本机用就保持 127.0.0.1；需要给局域网其他设备当 DNS 时才改回 0.0.0.0
  "listen": "127.0.0.1:1053",
  "ipv6": false,
  "prefer-h3": false,
  "respect-rules": true,
  "use-system-hosts": false,
  "cache-algorithm": "arc",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": [
    // 本地主机/设备
    "+.lan",
    "+.local",
    // Windows网络出现小地球图标
    "+.msftconnecttest.com",
    "+.msftncsi.com",
    // QQ快速登录检测失败
    "localhost.ptlogin2.qq.com",
    "localhost.sec.qq.com",
    // 微信快速登录检测失败
    "localhost.work.weixin.qq.com",
    // 反向解析 / NTP
    "+.in-addr.arpa",
    "+.ip6.arpa",
    "time.*.com",
    "time.*.gov",
    "pool.ntp.org",
    // 游戏 / P2P（走 fake-ip 会导致 NAT 类型异常）
    "+.stun.*.*",
    "+.stun.*.*.*",
    "+.xboxlive.com",
    "*.srv.nintendo.net",
    "*.stun.playstation.net"
  ],
  "default-nameserver": ["223.5.5.5", "1.2.4.8"],
  // 注意：这里必须保持“纯国外 DoH”，混入国内 DNS 会导致国外域名被污染
  "nameserver": [...foreignNameservers],
  "proxy-server-nameserver": [...domesticNameservers],
  "direct-nameserver": [...domesticNameservers],
  "nameserver-policy": {
    // 扩大国内域名的覆盖面，减少国内站点绕道国外 DoH 解析
    "geosite:private,cn,apple-cn,microsoft@cn,category-games@cn": domesticNameservers
  }
};

// =========================
// 2. 规则集定义 (Rule Providers)
// =========================

const ruleProviderCommon = {
  "type": "http",
  "format": "yaml",
  "interval": 86400
};

const ruleProviders = {
  "reject": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
    "path": "./ruleset/loyalsoldier/reject.yaml"
  },
  "proxy": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
    "path": "./ruleset/loyalsoldier/proxy.yaml"
  },
  "direct": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt",
    "path": "./ruleset/loyalsoldier/direct.yaml"
  },
  "private": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
    "path": "./ruleset/loyalsoldier/private.yaml"
  },
  "gfw": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
    "path": "./ruleset/loyalsoldier/gfw.yaml"
  },
  "tld-not-cn": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt",
    "path": "./ruleset/loyalsoldier/tld-not-cn.yaml"
  },
  "cncidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
    "path": "./ruleset/loyalsoldier/cncidr.yaml"
  },
  "lancidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
    "path": "./ruleset/loyalsoldier/lancidr.yaml"
  },
  "AI": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/AI.txt",
    "path": "./ruleset/xiaolin-007/AI.yaml"
  }
};

// =========================
// 3. 详细规则列表 (Rules)
// 顺序原则：私有 -> 广告 -> 精细业务 -> 通用规则集 -> 国内兜底 -> MATCH
// =========================

const rules = [
  // --- 0. 自定义直连 ---

  // --- 1. 私有域名 / 局域网（必须最前，避免被 tld-not-cn 等提前捞走）---
  "GEOSITE,private,全局直连",
  "RULE-SET,private,全局直连",
  "RULE-SET,lancidr,全局直连,no-resolve",
  "GEOIP,LAN,全局直连,no-resolve",

  // --- 2. 广告拦截 ---
  "GEOSITE,category-ads-all,广告过滤",
  "RULE-SET,reject,广告过滤",

  // --- 3. AI 服务（放在 GEOIP,google 之前，避免被谷歌 IP 段抢走）---
  "GEOSITE,openai,SmartAi",
  "GEOSITE,anthropic,SmartAi",
  "GEOSITE,huggingface,SmartAi",
  "RULE-SET,AI,SmartAi",

  // --- 4. 流媒体（YouTube 与需要解锁的流媒体分开）---
  "GEOSITE,youtube,YouTube",
  "GEOSITE,netflix,流媒体",
  "GEOIP,netflix,流媒体,no-resolve",
  "GEOSITE,disney,流媒体",
  "GEOSITE,spotify,流媒体",
  "GEOSITE,tiktok,流媒体",
  "GEOSITE,hbo,流媒体",
  "GEOSITE,primevideo,流媒体",

  // --- 5. Google ---
  "GEOSITE,google,谷歌服务",
  "GEOIP,google,谷歌服务,no-resolve",

  // --- 6. 社交平台（域名 + IP 双维度，Telegram 常直连 IP）---
  "GEOSITE,telegram,国际域名",
  "GEOIP,telegram,国际域名,no-resolve",
  "GEOSITE,twitter,国际域名",
  "GEOIP,twitter,国际域名,no-resolve",
  "GEOSITE,facebook,国际域名",
  "GEOIP,facebook,国际域名,no-resolve",
  "GEOSITE,instagram,国际域名",

  // --- 7. 开发平台（github.io 必须前置，否则会被 GEOSITE,github 吞掉）---
  "DOMAIN-SUFFIX,github.io,国际域名",
  "GEOSITE,github,GitHub",
  "GEOSITE,gitlab,GitHub",

  // --- 8. 微软 / 苹果 / 国内游戏平台（@cn 变体必须在主体之前）---
  "GEOSITE,microsoft@cn,全局直连",
  "GEOSITE,apple-cn,全局直连",
  "GEOSITE,category-games@cn,全局直连",
  "GEOSITE,microsoft,国际域名",
  // 苹果服务交给独立策略组，默认 DIRECT，可在面板一键切代理
  "GEOSITE,apple,苹果服务",

  // --- 9. 自定义补充 ---
  // 注：gstatic.com / googleapis.cn 都在 geosite:google 里，写在这里是死规则，已删除；
  //     它们会被上面的「谷歌服务」接管。如需单独分流，必须挪到 GEOSITE,google 之前。
  "DOMAIN,v2rayse.com,国际域名",

  // --- 10. 通用规则集 ---
  "RULE-SET,proxy,国际域名",
  "RULE-SET,gfw,国际域名",
  "RULE-SET,tld-not-cn,国际域名",

  // --- 11. 国内兜底 ---
  "RULE-SET,direct,全局直连",
  "RULE-SET,cncidr,全局直连,no-resolve",
  "GEOSITE,CN,全局直连",
  "GEOIP,CN,全局直连,no-resolve",

  // --- 12. 最终匹配 ---
  "MATCH,漏网之鱼"
];

// =========================
// 4. 代理组配置
// =========================

const groupBaseOption = {
  "interval": 300,   // 秒。原来的 10000 ≈ 2.8 小时，url-test 几乎不会自动切换
  "timeout": 5000,   // 3s 对欧美远端节点偏紧，网络抖动时会误判为不可用
  "url": "https://www.gstatic.com/generate_204",
  "lazy": true,
  "max-failed-times": 3,
  "hidden": false
};

// url-test 容差(ms)。50 太敏感会来回横跳，100~150 更稳
const TOLERANCE = 100;

// 机场的“信息节点”（官网/剩余流量/到期时间等）统一排除
// 注意别把档位名当信息节点：Premium / VIP / 高级 这类词很多机场用在正常节点上，不要加进来
const EXCLUDE_INFO = "官网|套餐|流量|异常|剩余|地址|到期|重置|订阅|邀请|返利|防失联|Expire|Traffic|Reset|Official";

// 回国/落地大陆的节点：不能进任何出国策略组，否则被选中时国外站点全部不通。
// 「中国」后面加否定断言：不少机场把香港/台湾节点命名成「中国香港 01」「中国台湾 02」，
// 只写「中国」会把这些正常节点一起排除掉。
const EXCLUDE_HOME = "中国(?!香港|台湾|台灣|澳门|澳門)|回国|回國";

// 国家码的边界判定：不能用 \b。
// 机场常见命名 "🇰🇷KR_1"、"US_2"、"DE_01" 里，国家码后面紧跟下划线，
// 而下划线属于 \w，R 和 _ 之间没有词边界，\bKR\b 直接失配 —— 这类节点会归不了组。
// 这里只把英文字母当边界，数字、下划线、连字符、空格、emoji 全都算分隔符：
//   命中：KR_1 / US-2 / DE01 / [JP] / 🇸🇬SG
//   不命中：Frankfurt(FR) / Russia(US) / Australia(AU) / Ruk1ng001(RU)
// 用 (?:^|[^A-Za-z]) 而不是 lookbehind，兼容性更好。
const codeToken = code => `(?:^|[^A-Za-z])${code}(?![A-Za-z])`;

// 国家/地区匹配：
//   text  —— 国旗 emoji、中文名、城市、英文全称，按原样参与匹配
//   codes —— 2~3 位国家码，自动套上上面的边界判定
// 匹配到多个地区时取最后出现的那个（中转节点写成「入口 → 落地」，最后一个是落地地区）。
// 用不到的地区直接删掉整条即可（组的显示顺序 = 这里的书写顺序）
const countryConfig = {
  // --- 东亚 / 东南亚 ---
  "香港":     { text: "🇭🇰|香港|港|Hong ?Kong", codes: ["HK", "HKG"], iconCode: "hk" },
  // 只用「澳门」不用裸的「澳」，否则会吃掉澳大利亚的节点
  "澳门":     { text: "🇲🇴|澳门|澳門|Macao|Macau", codes: ["MO", "MAC"], iconCode: "mo" },
  "台湾":     { text: "🇹🇼|台湾|台灣|臺灣|台北|新北|彰化|Taiwan|Taipei", codes: ["TW", "TWN"], iconCode: "tw" },
  "日本":     { text: "🇯🇵|日本|东京|東京|大阪|埼玉|Japan|Tokyo|Osaka", codes: ["JP", "JPN"], iconCode: "jp" },
  "韩国":     { text: "🇰🇷|韩国|韓國|首尔|首爾|Korea|Seoul", codes: ["KR", "KOR"], iconCode: "kr" },
  "新加坡":   { text: "🇸🇬|新加坡|狮城|獅城|Singapore", codes: ["SG", "SGP"], iconCode: "sg" },
  "马来西亚": { text: "🇲🇾|马来西亚|馬來西亞|吉隆坡|Malaysia|Kuala ?Lumpur", codes: ["MY", "MYS"], iconCode: "my" },
  "泰国":     { text: "🇹🇭|泰国|泰國|曼谷|Thailand|Bangkok", codes: ["TH", "THA"], iconCode: "th" },
  "越南":     { text: "🇻🇳|越南|胡志明|河内|Vietnam|Viet ?Nam|Hanoi", codes: ["VN", "VNM"], iconCode: "vn" },
  "菲律宾":   { text: "🇵🇭|菲律宾|菲律賓|马尼拉|馬尼拉|Philippines|Manila", codes: ["PH", "PHL"], iconCode: "ph" },
  "印尼":     { text: "🇮🇩|印尼|印度尼西亚|雅加达|雅加達|Indonesia|Jakarta", codes: ["ID", "IDN"], iconCode: "id" },
  // 印度(?!尼) 防止吃掉「印度尼西亚」
  "印度":     { text: "🇮🇳|印度(?!尼)|孟买|孟買|India|Mumbai", codes: ["IN", "IND"], iconCode: "in" },

  // --- 中东 ---
  "阿联酋":   { text: "🇦🇪|阿联酋|阿聯酋|迪拜|杜拜|阿布扎比|Dubai|Emirates", codes: ["AE", "ARE"], iconCode: "ae" },
  "土耳其":   { text: "🇹🇷|土耳其|伊斯坦布尔|伊斯坦堡|Turkey|Turkiye|Istanbul", codes: ["TR", "TUR"], iconCode: "tr" },

  // --- 美洲 ---
  "美国":     { text: "🇺🇸|美国|美國|洛杉矶|洛杉磯|圣何塞|聖何塞|西雅图|芝加哥|达拉斯|纽约|紐約|硅谷|凤凰城|阿什本|" +
                      "United ?States|Los ?Angeles|San ?Jose|Seattle|Chicago|Dallas|New ?York",
                codes: ["US", "USA"], iconCode: "us" },
  // 故意不给加拿大配 CA：美国节点常写 "US-CA"（加州），会被误判成加拿大
  "加拿大":   { text: "🇨🇦|加拿大|多伦多|多倫多|温哥华|溫哥華|蒙特利尔|Canada|Toronto|Vancouver|Montreal",
                codes: ["CAN"], iconCode: "ca" },
  "巴西":     { text: "🇧🇷|巴西|圣保罗|聖保羅|Brazil|Sao ?Paulo", codes: ["BR", "BRA"], iconCode: "br" },
  "阿根廷":   { text: "🇦🇷|阿根廷|布宜诺斯|Argentina|Buenos ?Aires", codes: ["AR", "ARG"], iconCode: "ar" },

  // --- 欧洲 ---
  "英国":     { text: "🇬🇧|英国|英國|伦敦|倫敦|United ?Kingdom|London", codes: ["UK", "GB", "GBR"], iconCode: "gb" },
  "德国":     { text: "🇩🇪|德国|德國|法兰克福|法蘭克福|Germany|Frankfurt", codes: ["DE", "DEU"], iconCode: "de" },
  "法国":     { text: "🇫🇷|法国|法國|巴黎|France|Paris", codes: ["FR", "FRA"], iconCode: "fr" },
  "荷兰":     { text: "🇳🇱|荷兰|荷蘭|阿姆斯特丹|Netherlands|Amsterdam", codes: ["NL", "NLD"], iconCode: "nl" },
  "瑞士":     { text: "🇨🇭|瑞士|苏黎世|蘇黎世|日内瓦|日內瓦|Switzerland|Zurich|Geneva", codes: ["CH", "CHE"], iconCode: "ch" },
  "瑞典":     { text: "🇸🇪|瑞典|斯德哥尔摩|斯德哥爾摩|Sweden|Stockholm", codes: ["SE", "SWE"], iconCode: "se" },
  "波兰":     { text: "🇵🇱|波兰|波蘭|华沙|華沙|Poland|Warsaw", codes: ["PL", "POL"], iconCode: "pl" },
  "西班牙":   { text: "🇪🇸|西班牙|马德里|馬德里|巴塞罗那|巴塞隆納|Spain|Madrid|Barcelona", codes: ["ES", "ESP"], iconCode: "es" },
  // 罗马(?!尼) 防止「罗马尼亚」被意大利抢走（罗马是罗马尼亚的前缀）
  "意大利":   { text: "🇮🇹|意大利|義大利|米兰|米蘭|罗马(?!尼)|羅馬(?!尼)|Italy|Milan|Rome", codes: ["IT", "ITA"], iconCode: "it" },
  "罗马尼亚": { text: "🇷🇴|罗马尼亚|羅馬尼亞|布加勒斯特|Romania|Bucharest", codes: ["RO", "ROU"], iconCode: "ro" },
  "俄罗斯":   { text: "🇷🇺|俄罗斯|俄羅斯|莫斯科|圣彼得堡|Russia|Moscow", codes: ["RU", "RUS"], iconCode: "ru" },

  // --- 大洋洲 ---
  "澳大利亚": { text: "🇦🇺|澳大利亚|澳大利亞|澳洲|悉尼|墨尔本|墨爾本|Australia|Sydney|Melbourne",
                codes: ["AU", "AUS"], iconCode: "au" }
};

// 把 text 和加了边界的 codes 拼成这个地区的完整匹配片段
const matchOf = conf => [conf.text, ...conf.codes.map(codeToken)].join("|");

// 所有地区的关键词合集，用于「其他节点」的反向筛选
const ALL_COUNTRY_TOKENS = Object.keys(countryConfig).map(name => matchOf(countryConfig[name])).join("|");

// 「其他节点」filter：不含任何地区关键词，也不是流量/到期信息节点、不是回国节点。
// 因为地区组按「最后出现的地区」归组，只要名字里出现过任一地区关键词，
// 必然会被其中一个地区组收走，所以这里取反集刚好不重不漏。
const buildOtherFilter = () =>
  `^(?!.*(${EXCLUDE_INFO}))(?!.*(${EXCLUDE_HOME}))(?!.*(?:${ALL_COUNTRY_TOKENS})).*$`;

// 生成地区组 filter：命中本地区关键词，且其后不再出现其它地区的关键词。
// 中转节点通常写成「入口 → 落地」，如「🇭🇰 香港 → 🇺🇸 美国」，
// 取最后出现的地区当作落地地区，避免同一节点被同时归入两个地区组。
const buildCountryFilter = countryName => {
  const own = matchOf(countryConfig[countryName]);
  const others = Object.keys(countryConfig)
    .filter(other => other !== countryName)
    .map(other => matchOf(countryConfig[other]))
    .join("|");
  return `^(?!.*(${EXCLUDE_INFO}))(?!.*(${EXCLUDE_HOME})).*(?:${own})(?!.*(?:${others}))`;
};

// 节点名清理：不少机场/免费订阅在节点名里塞推广域名，例如
//   "🔴🇰🇷[🤖📺🎭✨]_github.com/Ruk1ng001_5b8e1a9b"
// pattern 用 regexp2 语法（和 filter 同一个引擎），target 是替换后的内容。
// 重要：末尾那串随机码不要删——它是这类节点唯一的区分标识，删掉会出现大量同名节点，
// 而 provider 内同名节点会互相覆盖，直接导致节点数量减少。
// 想连开头的 🔴/🟡 一起去掉，就再加一条 { pattern: "^[🔴🟠🟡🟢🔵⚪⚫]+", target: "" }。
const CLEAN_NODE_NAME = true;
const NAME_CLEANUP = [
  // 推广域名：_github.com/xxx_ / t.me/xxx / @某某频道
  { pattern: "_?(?:https?://)?(?:www\\.)?(?:github\\.com|t\\.me|telegram\\.me|youtube\\.com)/[^\\s_|]+_?", target: "_" },
  // 连续空格收敛
  { pattern: "[ \\t]{2,}", target: " " }
];


// 不适合跑 AI 服务的地区（IP 纯净度 / 风控 / 服务方不支持）
// 香港澳门：OpenAI 不提供服务；俄罗斯：OpenAI / Anthropic 明确不支持，登录即封号
const AI_EXCLUDE_COUNTRIES = ["香港节点", "澳门节点", "台湾节点", "俄罗斯节点"];

// 是否为所有节点强开 UDP。若某些节点实际不支持 UDP，强开会让 UDP 流量黑洞而非回落 TCP，
// 遇到游戏/语音异常时把这里改成 false。
const FORCE_UDP = true;

const ICON_BASE =
  "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons";

// 主程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  config["dns"] = dnsConfig;

  // 域名嗅探：客户端直连 IP 或使用 QUIC 时，靠嗅探还原域名，否则域名规则全部失效落到 MATCH
  config["sniffer"] = {
    "enable": true,
    "force-dns-mapping": true,
    "parse-pure-ip": true,
    "override-destination": false,
    "sniff": {
      "HTTP": { "ports": [80, "8080-8880"], "override-destination": true },
      "TLS": { "ports": [443, 8443] },
      "QUIC": { "ports": [443, 8443] }
    },
    "skip-domain": ["+.push.apple.com", "+.apple.com", "Mijia Cloud", "dlg.io.mi.com"]
  };

  // 记住手动选择的节点与 fake-ip 映射，避免更新订阅/重启后重置
  config["profile"] = {
    "store-selected": true,
    "store-fake-ip": true
  };

  // 延迟测试排除 TCP/TLS 握手耗时（否则同一节点的延迟波动很大，url-test 容易误切）
  config["unified-delay"] = true;
  // 对多 IP 的目标同时发起连接取最快，改善首包延迟
  config["tcp-concurrent"] = true;

  // 0. 节点名清理。订阅节点交给内核的 override.proxy-name 处理（脚本拿不到订阅内容）；
  //    内联节点在这里直接改名，改名后若与已有节点重名则保留原名，避免节点互相覆盖。
  if (CLEAN_NODE_NAME && NAME_CLEANUP.length > 0) {
    if (Array.isArray(config["proxies"])) {
      const used = new Set(config["proxies"].map(proxy => proxy?.name));
      config["proxies"].forEach(proxy => {
        if (typeof proxy?.name !== "string") return;
        let cleaned = proxy.name;
        NAME_CLEANUP.forEach(rule => {
          cleaned = cleaned.replace(new RegExp(rule.pattern, "g"), rule.target);
        });
        cleaned = cleaned.replace(/^[_\-\s|]+|[_\-\s|]+$/g, "").trim();
        if (cleaned && cleaned !== proxy.name && !used.has(cleaned)) {
          used.delete(proxy.name);
          used.add(cleaned);
          proxy.name = cleaned;
        }
      });
    }
    const providersForRename = config["proxy-providers"];
    if (providersForRename && typeof providersForRename === "object") {
      Object.values(providersForRename).forEach(provider => {
        provider["override"] = {
          ...(provider["override"] || {}),
          "proxy-name": [...(provider["override"]?.["proxy-name"] || []), ...NAME_CLEANUP]
        };
      });
    }
  }

  // 1. 国家分组：include-all + filter（排除信息节点）
  // 空组处理：订阅里若没有某地区节点，该 url-test 组会是空的。只有当节点全部内联在
  // config.proxies（没有 proxy-providers）时才能可靠判断，这时自动裁掉空组；
  // 用订阅（provider）的话节点列表在运行时才拉取，无法预判，需要自己删 countryConfig 条目。
  const localProxyNames = Array.isArray(config["proxies"])
    ? config["proxies"].map(proxy => proxy?.name ?? "")
    : [];
  const canPruneEmpty = proxyProviderCount === 0 && localProxyNames.length > 0;
  // 判空用的正则与真正下发给内核的 filter 完全一致（含落地地区判定），
  // 否则「🇭🇰 → 🇺🇸」这种中转节点会让香港组通过判空检查、却在运行时是空组。
  // 正则编译失败时一律保留该组，宁可多一个空组也不要误删有节点的组。
  const hasNodeFor = filter => {
    try {
      const filterRe = new RegExp(filter, "i");
      return localProxyNames.some(name => filterRe.test(name));
    } catch (err) {
      return true;
    }
  };

  const countryGroups = Object.keys(countryConfig)
    .map(name => ({ name, conf: countryConfig[name], filter: buildCountryFilter(name) }))
    .filter(entry => !canPruneEmpty || hasNodeFor(entry.filter))
    .map(entry => ({
      ...groupBaseOption,
      "name": `${entry.name}节点`,
      "type": "url-test",
      "tolerance": TOLERANCE,
      "include-all": true,
      "filter": `(?i)${entry.filter}`,
      "icon": `${ICON_BASE}/flags/${entry.conf.iconCode}.svg`
    }));

  const countryGroupNames = countryGroups.map(group => group.name);

  // 1b. 其他节点：没有匹配到任何地区分组的节点都进这里，避免这些节点只能在「手动选择」里找。
  // 同样受自动裁剪控制：内联节点且没有落单节点时，不生成这个空组。
  const otherFilter = buildOtherFilter();
  const otherGroups = (!canPruneEmpty || hasNodeFor(otherFilter))
    ? [{
        ...groupBaseOption,
        "name": "其他节点",
        "type": "url-test",
        "tolerance": TOLERANCE,
        "include-all": true,
        "filter": `(?i)${otherFilter}`,
        "icon": `${ICON_BASE}/unknown.svg`
      }]
    : [];
  const otherGroupNames = otherGroups.map(group => group.name);

  const coreProxies = ["自动选择", "手动选择", ...countryGroupNames, ...otherGroupNames];
  const aiProxies = [...countryGroupNames.filter(name => !AI_EXCLUDE_COUNTRIES.includes(name)), ...otherGroupNames];

  config["proxy-groups"] = [
    // 2. 核心策略组
    {
      ...groupBaseOption,
      "name": "自动选择",
      "type": "url-test",
      "tolerance": TOLERANCE,
      "include-all": true,
      "filter": `(?i)^(?!.*(${EXCLUDE_INFO}|${EXCLUDE_HOME})).*$`,
      "icon": `${ICON_BASE}/reddit.svg`
    },
    {
      ...groupBaseOption,
      "name": "手动选择",
      "type": "select",
      "include-all": true,
      "filter": `(?i)^(?!.*(${EXCLUDE_INFO})).*$`,
      "icon": `${ICON_BASE}/adjust.svg`
    },
    {
      ...groupBaseOption,
      "name": "负载均衡",
      "type": "load-balance",
      // consistent-hashing：同一域名固定同一节点，登录态和视频播放不会因换 IP 中断。
      // 想让多线程下载摊到多个节点可改 round-robin，但那样会让出口 IP 频繁变化，
      // 视频、AI、需要登录的站点容易触发风控，不要用于这些场景。
      "strategy": "consistent-hashing",
      "include-all": true,
      "filter": `(?i)^(?!.*(${EXCLUDE_INFO}|${EXCLUDE_HOME})).*$`,
      "icon": `${ICON_BASE}/balance.svg`
    },

    // 3. 功能策略组
    {
      ...groupBaseOption,
      "name": "谷歌服务",
      "type": "select",
      "proxies": coreProxies,
      "icon": `${ICON_BASE}/google.svg`
    },
    {
      ...groupBaseOption,
      "name": "YouTube",
      "type": "select",
      "proxies": coreProxies,
      "icon": `${ICON_BASE}/youtube.svg`
    },
    {
      ...groupBaseOption,
      "name": "流媒体",
      "type": "fallback",
      // 用 Netflix 剧集页做解锁检测：能解锁返回 200，被地区拦截返回 404，节点不通则超时。
      // fallback 会自动跳到第一个「解锁且可用」的地区组，解锁失效时无需手动切。
      "url": "https://www.netflix.com/title/81280792",
      "expected-status": "200",
      "interval": 600,  // 探测比 generate_204 重，间隔放长一些
      // 注意：fallback 组在面板上不可手动指定，顺序即优先级。想手选就临时改用「手动选择」。
      "proxies": [...countryGroupNames, "手动选择"],
      "icon": `${ICON_BASE}/netflix.svg`
    },
    {
      ...groupBaseOption,
      "name": "SmartAi",
      "type": "select",
      // 原版同时写了 proxies 和 filter，filter 在有显式 proxies 时不生效，
      // 导致 AI 流量可能落到香港节点被风控。这里改为直接给出剔除港台的列表。
      "proxies": [...aiProxies, "手动选择"],
      "icon": `${ICON_BASE}/chatgpt.svg`
    },
    {
      ...groupBaseOption,
      "name": "GitHub",
      "type": "select",
      "proxies": [...coreProxies, "全局直连"],
      "icon": `${ICON_BASE}/github.svg`
    },
    {
      ...groupBaseOption,
      "name": "国际域名",
      "type": "select",
      // 负载均衡只出现在这里和「漏网之鱼」，不进 coreProxies，
      // 避免 SmartAi / 谷歌服务 / 流媒体 误选后因出口 IP 变化触发风控
      "proxies": [...coreProxies, "负载均衡"],
      "icon": `${ICON_BASE}/guard.svg`
    },
    {
      ...groupBaseOption,
      "name": "苹果服务",
      "type": "select",
      // 默认 DIRECT：苹果推送/iCloud 走代理容易导致推送延迟、App Store 异常，
      // 且苹果在国内有 CDN。需要切区或代理时在面板改成任意节点即可。
      "proxies": ["DIRECT", ...coreProxies],
      "icon": `${ICON_BASE}/apple.svg`
    },

    // 4. 控制策略组
    {
      ...groupBaseOption,
      "name": "广告过滤",
      "type": "select",
      "proxies": ["REJECT", "DIRECT"],
      "icon": `${ICON_BASE}/bug.svg`
    },
    {
      ...groupBaseOption,
      "name": "全局直连",
      "type": "select",
      "proxies": ["DIRECT", "REJECT", ...coreProxies],
      "icon": `${ICON_BASE}/link.svg`
    },
    {
      ...groupBaseOption,
      "name": "漏网之鱼",
      "type": "select",
      "proxies": [...coreProxies, "负载均衡"],
      "icon": `${ICON_BASE}/fish.svg`
    },

    // 5. 国家策略组
    ...countryGroups,
    ...otherGroups
  ];

  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;

  // UDP 处理：原版只改 config.proxies，对订阅（proxy-providers）拉取的节点无效，
  // 这里同时通过 provider 的 override 生效。
  if (FORCE_UDP) {
    if (Array.isArray(config["proxies"])) {
      config["proxies"].forEach(proxy => {
        proxy.udp = true;
      });
    }
    const providers = config["proxy-providers"];
    if (providers && typeof providers === "object") {
      Object.values(providers).forEach(provider => {
        provider["override"] = { ...(provider["override"] || {}), udp: true };
      });
    }
  }

  return config;
}
