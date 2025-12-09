// 国内DNS服务器
const domesticNameservers = [
  "https://223.5.5.5/dns-query", // 阿里DoH
  "https://doh.pub/dns-query" // 腾讯DoH
];
// 国外DNS服务器
const foreignNameservers = [
  "https://208.67.222.222/dns-query", // OpenDNS
  "https://77.88.8.8/dns-query", //YandexDNS
  "https://1.1.1.1/dns-query", // CloudflareDNS
  "https://8.8.4.4/dns-query", // GoogleDNS  
];
// DNS配置
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
// 规则集通用配置
const ruleProviderCommon = {
  "type": "http",
  "format": "yaml",
  "interval": 86400
};
// 规则集配置
const ruleProviders = {
  "reject": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
    "path": "./ruleset/loyalsoldier/reject.yaml"
  },
  "icloud": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt",
    "path": "./ruleset/loyalsoldier/icloud.yaml"
  },
  "apple": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt",
    "path": "./ruleset/loyalsoldier/apple.yaml"
  },
  "google": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt",
    "path": "./ruleset/loyalsoldier/google.yaml"
  },
  // 【新增 GitHub 规则集】
  "github": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/GitHub/GitHub.yaml",
    "path": "./ruleset/blackmatrix7/github.yaml"
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
  "telegramcidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
    "path": "./ruleset/loyalsoldier/telegramcidr.yaml"
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
  "applications": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt",
    "path": "./ruleset/loyalsoldier/applications.yaml"
  },
  "YouTube": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/YouTube.txt",
    "path": "./ruleset/xiaolin-007/YouTube.yaml"
  },
  "Netflix": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/Netflix.txt",
    "path": "./ruleset/xiaolin-007/Netflix.yaml"
  },
  "Spotify": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/Spotify.txt",
    "path": "./ruleset/xiaolin-007/Spotify.yaml"
  },
  "BilibiliHMT": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/BilibiliHMT.txt",
    "path": "./ruleset/xiaolin-007/BilibiliHMT.yaml"    
  },
  "AI": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/AI.txt",
    "path": "./ruleset/xiaolin-007/AI.yaml"    
  },
  "TikTok": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/TikTok.txt",
    "path": "./ruleset/xiaolin-007/TikTok.yaml"    
  },
};
// 规则
const rules = [
  // 自定义规则
  "DOMAIN-SUFFIX,googleapis.cn,智能选择",
  "DOMAIN-SUFFIX,gstatic.com,智能选择",
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,智能选择",
  "DOMAIN-SUFFIX,github.io,智能选择",
  "DOMAIN,v2rayse.com,智能选择",
  // Loyalsoldier 规则集
  "RULE-SET,applications,全局直连",
  "RULE-SET,private,全局直连",
  "RULE-SET,reject,广告过滤",
  "RULE-SET,icloud,苹果服务", // 修正 icloud 规则指向 '苹果服务' 组
  "RULE-SET,apple,苹果服务",
  "RULE-SET,YouTube,YouTube",
  // 【修正 Netflix 规则，合并到 YouTube 组】
  "RULE-SET,Netflix,YouTube", 
  "RULE-SET,Spotify,Spotify",
  "RULE-SET,BilibiliHMT,哔哩哔哩港澳台",
  "RULE-SET,AI,SmartAi",
  "RULE-SET,TikTok,TikTok",
  "RULE-SET,google,谷歌服务",
  // 【新增 GitHub 规则】
  "RULE-SET,github,GitHub",
  "RULE-SET,proxy,智能选择",
  "RULE-SET,gfw,智能选择",
  "RULE-SET,tld-not-cn,智能选择",
  "RULE-SET,direct,全局直连",
  "RULE-SET,lancidr,全局直连,no-resolve",
  "RULE-SET,cncidr,全局直连,no-resolve",
  "RULE-SET,telegramcidr,电报消息,no-resolve",
  // 其他规则
  "GEOSITE,CN,全局直连",
  "GEOIP,LAN,全局直连,no-resolve",
  "GEOIP,CN,全局直连,no-resolve",
  "MATCH,漏网之鱼"
];
// 代理组通用配置
const groupBaseOption = {
  "interval": 10000,
  "timeout": 3000,
  "url": "https://www.gstatic.com/generate_204",
  "lazy": true,
  "max-failed-times": 3,
  "hidden": false
};

// Smart 模式配置
const smartGroupConfig = {
  "name": "智能选择",
  "type": "smart",
  "uselightgbm": true, 
  "collectdata": false,
  "strategy": "sticky-sessions", 
  "tolerance": 50, // 容差值，防止频繁跳动
  "max-retry": 3,  // 最大重试次数，增强容错
  "prefer-asn": true 
};


// 程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }


  // 【新增】LightGBM 全局自动更新配置 (Model-large.bin)
  config["lgbm-auto-update"] = true;
  config["lgbm-update-interval"] = 72;
  config["lgbm-url"] = "https://github.com/vernesong/mihomo/releases/download/LightGBM-Model/Model-large.bin";

  // 覆盖原配置中DNS配置
  config["dns"] = dnsConfig;
  
  // 【新增：在核心列表中加入自动选择】
  // 定义核心代理选择列表 (不含全局直连)
  const coreProxies = ["智能选择", "自动选择", "手动选择"];


  // 覆盖原配置中的代理组
  config["proxy-groups"] = [
    // 1. 智能选择 (顶端)
    {
      ...groupBaseOption,
      ...smartGroupConfig, // 合并 Smart 配置
      "include-all": true,
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余|地址|中国)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/android.svg"
    },
    // 2. 自动选择 (新增，位于第二位)
    {
      ...groupBaseOption,
      "name": "自动选择",
      "type": "url-test",
      "tolerance": 50,
      "include-all": true,
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余|地址|中国)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/reddit.svg"
    },
    // 3. 手动选择 (第三排)
    {
      ...groupBaseOption,
      "name": "手动选择",
      "type": "select",
      "include-all": true, 
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余|地址|中国)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg" 
    },
    // 应用组 (使用 coreProxies，已包含自动选择)
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
      "proxies": coreProxies, // 此组现在也处理 Netflix 流量
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg"
    },
    // 【已移除 Netflix 代理组】
    {
      ...groupBaseOption,
      "name": "电报消息",
      "type": "select",
      "proxies": coreProxies,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg"
    },
    {
      ...groupBaseOption,
      "name": "SmartAi",
      "type": "select", 
      "proxies": coreProxies,
      // 移除 filter: 避免与手动选择组重复过滤
      "filter": "(?i)^(?!.*(港|HK|Hong|CN|China|中|回国)).*(美国|US|日本|JP|新加坡|SG|台湾|TW|韩国|KR|英国|UK|德国|DE|法国|FR|加拿大|CA|澳大利亚|AU)",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg"
    },
        // 【新增 GitHub 代理组】
    {
      ...groupBaseOption,
      "name": "GitHub",
      "type": "select",
      "proxies": ["全局直连","智能选择", "自动选择", "手动选择"], 
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/github.svg"
    },
    {
      ...groupBaseOption,
      "name": "TikTok",
      "type": "select",
      "proxies": ["全局直连", "智能选择", "自动选择", "手动选择"], 
      "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/tiktok.svg"
    },
    {
      ...groupBaseOption,
      "name": "微软服务",
      "type": "select",
      "proxies": ["全局直连","智能选择", "自动选择", "手动选择"], 
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg" 
    },
    {
      ...groupBaseOption,
      "name": "苹果服务",
      "type": "select",
      "proxies": ["全局直连", "智能选择", "自动选择", "手动选择"], 
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg" 
    },
    {
      ...groupBaseOption,
      "name": "哔哩哔哩港澳台",
      "type": "select",
      "proxies": ["全局直连","智能选择", "自动选择", "手动选择"], 
      "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/bilibili.svg"
    },
    {
      ...groupBaseOption,
      "name": "Spotify",
      "type": "select",
      "proxies": coreProxies,
      "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/spotify.svg" 
    },
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
      "proxies": ["DIRECT","REJECT","智能选择", "自动选择", "手动选择"],
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
      "proxies": ["智能选择", "自动选择", "手动选择"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg"
    }
  ];

  // 覆盖原配置中的规则
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;
// 添加判断
  if(config["proxies"]) {
    config["proxies"].forEach(proxy => {
      // 为每个节点设置 udp = true
      proxy.udp = true

    })
  }
  // 返回修改后的配置
  return config;
}
