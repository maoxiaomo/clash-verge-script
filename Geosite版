// =========================
// 1. DNS 配置区域
// =========================

// 国内DNS服务器
const domesticNameservers = [
  "https://223.5.5.5/dns-query", // 阿里DoH
  "https://doh.pub/dns-query"    // 腾讯DoH
];
// 国外DNS服务器
const foreignNameservers = [
  "https://208.67.222.222/dns-query", // OpenDNS
  "https://77.88.8.8/dns-query",      // YandexDNS
  "https://1.1.1.1/dns-query",        // CloudflareDNS
  "https://8.8.4.4/dns-query",        // GoogleDNS  
];

const dnsConfig = {
  "enable": true,
  "listen": "0.0.0.0:1053",
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
    // 追加以下条目
    "+.in-addr.arpa", 
    "+.ip6.arpa",
    "time.*.com",
    "time.*.gov",
    "pool.ntp.org",
    // 微信快速登录检测失败
    "localhost.work.weixin.qq.com"
  ],
  "default-nameserver": ["223.5.5.5","1.2.4.8"],
  "nameserver": [...foreignNameservers],
  "proxy-server-nameserver":[...domesticNameservers],
  "direct-nameserver":[...domesticNameservers],
  "nameserver-policy": {
    "geosite:private,cn": domesticNameservers
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
  },
};

// =========================
// 3. 详细规则列表 (Rules - GeoSite + GeoIP Enhanced)
// =========================

const rules = [
  
  // --- 2. 广告拦截 ---
  "GEOSITE,category-ads-all,广告过滤",
  "RULE-SET,reject,广告过滤",
  
  "GEOSITE,youtube,YouTube", // YouTube IP通常包含在Google GeoIP中
  "GEOSITE,spotify,YouTube",
  "GEOSITE,disney,YouTube",
  "GEOSITE,tiktok,YouTube",
  "GEOSITE,netflix,YouTube",
  "GEOIP,netflix,YouTube,no-resolve",
      // Google 服务
  "GEOSITE,google,谷歌服务",
  "GEOIP,google,谷歌服务,no-resolve",

  
  // Telegram (非常重要，TG常使用直接IP连接)
  "GEOSITE,telegram,国际域名",
  "GEOIP,telegram,国际域名,no-resolve",


  // Twitter
  "GEOSITE,twitter,国际域名",
  "GEOIP,twitter,国际域名,no-resolve",

  // Facebook
  "GEOSITE,facebook,国际域名",
  "GEOIP,facebook,国际域名,no-resolve",

  // --- 4. 其他服务 (GeoSite) ---
  "GEOSITE,openai,SmartAi",       
  "GEOSITE,anthropic,SmartAi",
  "GEOSITE,huggingface,SmartAi",  
  "RULE-SET,AI,SmartAi",


  "GEOSITE,github,GitHub",
  "GEOSITE,gitlab,GitHub",
  "DOMAIN-SUFFIX,github.io,国际域名",

  "GEOSITE,instagram,国际域名",

  // --- 5. 微软/苹果 分流 ---
  "GEOSITE,microsoft@cn,全局直连",
  "GEOSITE,apple-cn,全局直连",
  "GEOSITE,microsoft,国际域名",
  "GEOSITE,apple,国际域名",

  // --- 6. 自定义补充 ---
  "DOMAIN-SUFFIX,googleapis.cn,国际域名",
  "DOMAIN-SUFFIX,gstatic.com,国际域名",
  "DOMAIN,v2rayse.com,国际域名",
  
  // --- 7. 通用规则集 ---
  "RULE-SET,proxy,国际域名",
  "RULE-SET,gfw,国际域名",
  "RULE-SET,tld-not-cn,国际域名",
  "RULE-SET,private,全局直连",
  
  // --- 8. 兜底直连 (GeoSite + GeoIP) ---
  "RULE-SET,direct,全局直连",
  "RULE-SET,lancidr,全局直连,no-resolve",
  "RULE-SET,cncidr,全局直连,no-resolve",
  
  // CN 域名
  "GEOSITE,CN,全局直连",
  // CN IP (极为重要，防止国内流量走代理)
  "GEOIP,CN,全局直连,no-resolve",
  
  // 局域网 IP
  "GEOIP,LAN,全局直连,no-resolve",
  
  // --- 9. 最终匹配 ---
  "MATCH,漏网之鱼"
];

// =========================
// 4. 代理组配置
// =========================

const groupBaseOption = {
  "interval": 10000,
  "timeout": 3000,
  "url": "https://www.gstatic.com/generate_204",
  "lazy": true,
  "max-failed-times": 3,
  "hidden": false
};

// 主程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  config["dns"] = dnsConfig;
  
  // 1. 国家分组配置
  const countryConfig = {
    "美国": { filter: "(?i)US|United States|America|美", iconCode: "us" },
    "日本": { filter: "(?i)JP|Japan|日本", iconCode: "jp" },
    "新加坡": { filter: "(?i)SG|Singapore|狮城|新加坡", iconCode: "sg" },
    "台湾": { filter: "(?i)^(?!.*(HK|Hong|Kong|港)).*(TW|Taiwan|Taipei|台|灣)", iconCode: "tw" },
    "韩国": { filter: "(?i)KR|Korea|韩|韓", iconCode: "kr" },
    "英国": { filter: "(?i)UK|United Kingdom|England|英", iconCode: "gb" },
    "德国": { filter: "(?i)DE|Germany|德", iconCode: "de" },
    "法国": { filter: "(?i)FR|France|法", iconCode: "fr" },
    "香港": { filter: "(?i)HK|Hong|Kong|港", iconCode: "hk" }
  };

  const countryGroups = Object.entries(countryConfig).map(([name, conf]) => ({
    ...groupBaseOption,
    "name": `${name}节点`,
    "type": "url-test", 
    "tolerance": 50,    
    "include-all": true,
    "filter": conf.filter,
    "icon": `https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/${conf.iconCode}.svg`
  }));
  
  const countryGroupNames = countryGroups.map(group => group.name);
  const coreProxies = ["自动选择", "手动选择", ...countryGroupNames];

  config["proxy-groups"] = [
    // 2. 核心策略组
    {
      ...groupBaseOption,
      "name": "自动选择",
      "type": "url-test",
      "tolerance": 50,
      "include-all": true,
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余|地址|中国|关注)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/reddit.svg"
    },
    {
      ...groupBaseOption,
      "name": "手动选择",
      "type": "select",
      "include-all": true, 
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余|地址|中国|关注)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg" 
    },

    // 3. 功能策略组
    {
      ...groupBaseOption,
      "name": "谷歌服务",
      "type": "select",
      "proxies": coreProxies, 
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg"
    },
    {
      ...groupBaseOption,
      "name": "YouTube",
      "type": "select",
      "proxies": coreProxies, 
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg"
    },
    {
      ...groupBaseOption,
      "name": "SmartAi",
      "type": "select", 
      "proxies": coreProxies, 
      "filter": "(?i)^(?!.*(港|HK|Hong|CN|China|中|回国|澳门|MO)).*(美国|US|日本|JP|新加坡|SG|台湾|TW|韩国|KR|英国|UK|德国|DE|法国|FR|加拿大|CA|澳大利亚|AU|节点)",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg"
    },
    {
      ...groupBaseOption,
      "name": "GitHub",
      "type": "select",
      "proxies": ["全局直连", ...coreProxies], 
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/github.svg"
    },
    {
      ...groupBaseOption,
      "name": "国际域名",
      "type": "select",
      "proxies": coreProxies,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/guard.svg"
    },
    
    // 4. 控制策略组
    {
      ...groupBaseOption,
      "name": "广告过滤",
      "type": "select",
      "proxies": ["REJECT", "DIRECT"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/bug.svg" 
    },
    {
      ...groupBaseOption,
      "name": "全局直连",
      "type": "select",
      "proxies": ["DIRECT", "REJECT", ...coreProxies],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg" 
    },
    {
      ...groupBaseOption,
      "name": "全局拦截",
      "type": "select",
      "proxies": ["REJECT", "DIRECT"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/block.svg" 
    },
    {
      ...groupBaseOption,
      "name": "漏网之鱼",
      "type": "select",
      "proxies": coreProxies,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg"
    },
    
    // 5. 国家策略组
    ...countryGroups
  ];

  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;
  
  if(config["proxies"]) {
    config["proxies"].forEach(proxy => {
      proxy.udp = true;
    });
  }
  
  return config;
}
