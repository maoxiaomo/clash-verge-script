# 脚本说明

本仓库收录了几份 Clash Verge Rev / mihomo 的扩展脚本（覆写脚本），是同一套配置在不同阶段的演进版本。
本文说明每份文件的定位、差异和适用场景，方便挑选。

> 所有 `.js` 都是 **Clash Verge Rev 的「扩展脚本」**：在「订阅 → 编辑 → 扩展脚本」中引入，
> 入口函数是 `main(config)`，接收订阅解析后的配置对象，返回改写后的配置。
> `mihomo party.yaml` 是给 Mihomo Party 用的完整 YAML 配置，不是扩展脚本。

---

## 一览

| 文件 | 行数 | 策略组数 | 地区分组 | Smart 组 | sniffer | 说明 |
|---|---|---|---|---|---|---|
| [clash-verge-script-smart.js](clash-verge-script-smart.js) | 744 | 15 | 30 个（自动） | ✅ | ✅ | **当前主力版**，Smart 内核专用 |
| [clash-verge-script.js](clash-verge-script.js) | 634 | 14 | 30 个（自动） | ❌ | ✅ | 同上去掉 Smart，官方内核可用 |
| [Geosite版.js](Geosite版.js) | 356 | 11 | 有 | ❌ | ❌ | 精简版，规则以 geosite 为主 |
| [扩展脚本-优化版.js](扩展脚本-优化版.js) | 411 | 17 | ❌ | ✅ | ❌ | 按服务分组，无地区组 |
| [扩展脚本-地区分组.js](扩展脚本-地区分组.js) | 446 | 22 | 6 个（手写） | ❌ | ❌ | 按服务 + 6 个固定地区组 |
| [扩展脚本（原始）.js](扩展脚本（原始）.js) | 405 | 18 | ❌ | ❌ | ❌ | 最初版本，保留作参照 |

---

## clash-verge-script-smart.js —— 当前主力版

**⚠️ 需要 [vernesong/mihomo](https://github.com/vernesong/mihomo/releases) 的 Smart 内核（Alpha 分支）。**
官方 mihomo / Clash.Meta 内核不认识 `type: smart` 和 `lgbm-*` 配置项，会直接加载失败。
用官方内核请改用 `clash-verge-script.js`，或把脚本里的 `ENABLE_SMART` 改成 `false`
（改完这些键都不会写进配置，可正常在官方内核运行）。

### 相比 clash-verge-script.js 增加的内容

**1. 「智能选择」smart 组**

Smart 内核根据真实业务连接的历史质量（时延、丢包、成功率）挑节点，可选用 LightGBM 模型预测权重。
和 url-test 的区别：url-test 只看一条测速 URL 的延迟，smart 看的是实际连接表现。

```
lgbm-auto-update: true          模型自动更新
lgbm-update-interval: 72        更新间隔（小时）
lgbm-url: Model-large.bin       官方三档模型中的大档
profile.smart-collector-size: 100
```

组内参数：`uselightgbm: true`、`prefer-asn: true`、`tolerance: 100`、`collectdata: false`。
`policy-priority`（按节点名调权重）留了 `SMART_POLICY_PRIORITY` 常量，默认空，需要按自己机场的
节点命名填，例如 `"Premium:0.9;SG:1.3"`。

「智能选择」是除「广告过滤」（REJECT）、「全局直连」「苹果服务」（DIRECT）外所有策略组的默认首选。

**2. AI 分流改用 [VPSDance/ai-proxy-rules](https://github.com/VPSDance/ai-proxy-rules)**

多源合并（v2fly / blackmatrix7 等）+ 每日自动同步，覆盖 90 个 AI 服务商，替换了原来的
`xiaolin-007/AI.txt`。三个规则集，顺序有讲究：

```
GEOSITE,google-gemini,SmartAi
RULE-SET,google-ai,SmartAi      Google AI 独立开关，便于单独换出口
RULE-SET,ai-cn,全局直连          国内 AI 平台，必须在 ai-all 之前
RULE-SET,ai-all,SmartAi          全量聚合
GEOSITE,openai / anthropic / huggingface,SmartAi   下载失败时的兜底
```

`ai-cn` 的 55 条（通义、文心、豆包、DeepSeek、Kimi、智谱、腾讯、小米、MiniMax、火山）
**全部也在 `ai-all` 里**，顺序反了就会被代理走。

**3. 修复 Google AI Studio 报 `An unknown error occurred`**

根因是出口 IP 不统一。AI Studio 一个页面要打好几个域名，其中 `alkalimakersuite-pa.clients6.google.com`、
`webchannel-alkalimakersuite-pa.clients6.google.com` 这类后端很容易漏配，落到「谷歌服务」组，
和主域名用了两个不同出口，Google 判为异常流量。两处改动：

- 所有 Google AI 域名前置于 `GEOSITE,google`，统一进 SmartAi 组
- **SmartAi 组只放 url-test 地区组，不放 smart 组**

第二条尤其重要：smart 组按「源地址 + 目标地址」粘节点，同一个站点的不同 API 域名会被分到
**不同节点**上；而 url-test 组同一时刻全组共用一个节点，出口稳定。AI 站点必须用后者。
同理，「流媒体」这个 fallback 组也刻意不放 smart 组——它靠 Netflix 剧集页做解锁探测，
smart 会随时间换节点，探测结果就飘了。

---

## clash-verge-script.js —— 官方内核版

上面那份去掉 Smart 相关内容，其余功能一致，任何 mihomo / Clash.Meta 内核都能跑。
两份共有的核心设计：

### 地区分组（30 个，自动生成）

`countryConfig` 里每个地区配 `text`（国旗 emoji + 中文名 + 城市 + 英文全称）和 `codes`（国家码），
自动生成 url-test 组。几个容易踩的坑都处理了：

- **国家码不能用 `\b` 判边界**。机场常见命名 `🇰🇷KR_1`、`US_2`、`DE01`，下划线属于 `\w`，
  `R` 和 `_` 之间没有词边界，`\bKR\b` 直接失配。改用 `(?:^|[^A-Za-z])CODE(?![A-Za-z])`，
  只把英文字母当边界 —— 能命中 `KR_1`/`US-2`/`DE01`/`[JP]`，不会误吞 `Frankfurt(FR)`、
  `Russia(US)`、`Ruk1ng001(RU)`
- **中转节点按落地地区归组**。`🇭🇰 香港 → 🇺🇸 美国` 取最后出现的地区，不会同时进两个组
- **加拿大故意不配 `CA`**：美国节点常写 `US-CA`（加州），会被误判成加拿大
- **`澳门` 不用裸的 `澳`**（会吃掉澳大利亚）、**`印度(?!尼)`**（防印度尼西亚）、
  **`罗马(?!尼)`**（防罗马尼亚被意大利抢走）
- **回国节点排除**用 `中国(?!香港|台湾|台灣|澳门|澳門)`，避免误伤「中国香港 01」这类正常节点
- 节点全部内联在 `config.proxies` 时（没有 proxy-providers），**自动裁掉空的地区组**
- 匹配不到任何地区的节点收进「其他节点」组，不会只能在「手动选择」里翻

### 其他

- **节点名清理**：去掉机场塞在节点名里的推广域名（`_github.com/xxx_`、`t.me/xxx`）。
  内联节点直接改名，订阅节点通过 provider 的 `override.proxy-name` 处理。
  末尾随机码**不删** —— 它是这类节点唯一的区分标识，删了会出现大量同名节点互相覆盖
- **sniffer**：客户端直连 IP 或走 QUIC 时靠嗅探还原域名，否则域名规则全部失效落到 MATCH
- **DNS**：`nameserver` 保持纯国外 DoH（混国内 DNS 会导致国外域名被污染），
  国内域名走 `nameserver-policy` 分流；监听 `127.0.0.1:1053`（只给本机用）
- **流媒体组**用 fallback + Netflix 剧集页探测，解锁失效自动跳到下一个地区组
- **苹果服务**独立成组、默认 DIRECT（走代理易导致推送延迟、App Store 异常，且苹果国内有 CDN）
- **负载均衡组**（consistent-hashing）只出现在「国际域名」「漏网之鱼」，
  不进 `coreProxies` —— 避免 AI / 谷歌 / 流媒体误选后因出口 IP 变化触发风控
- `unified-delay`（排除握手耗时）、`tcp-concurrent`、`store-selected`、`store-fake-ip`

---

## Geosite版.js

精简版，11 个策略组，规则以内核自带 geosite 为主，外部规则集依赖少。
有地区分组但数量少于主力版，没有 sniffer 和 `store-selected`，DNS 监听 `0.0.0.0:1053`。
适合想要配置简单、外部依赖少的场景。

## 扩展脚本-优化版.js

17 个策略组，**按服务细分**（电报消息、TikTok、微软服务、苹果服务、哔哩哔哩港澳台、Spotify 等），
每类服务配独立规则集（blackmatrix7 系）。**没有地区分组**，节点靠「智能选择」「自动选择」「手动选择」
三个全量组来选。含一个早期的 smart 组配置（`strategy: sticky-sessions`、`tolerance: 50`）。

> 注：`strategy: sticky-sessions` 在 mihomo v1.19.17 已弃用（行为内置），新版本无需再配。

## 扩展脚本-地区分组.js

22 个策略组，在「优化版」的服务分组基础上加了 6 个**手写**地区组
（美国-自动 / 香港-自动 / 台湾-自动 / 日本-自动 / 韩国-自动 / 新加坡-自动）。
和主力版的区别是地区组硬编码、数量固定，不做国家码边界和中转节点的特殊处理。

## 扩展脚本（原始）.js

最初版本，18 个策略组，含「延迟选优」「故障转移」两个组。保留作演进参照。

## mihomo party.yaml

给 [Mihomo Party](https://github.com/mihomo-party-org/clash-party) 用的完整 YAML 配置，
不是扩展脚本，用法不同（直接作为配置文件导入，而非在订阅上做覆写）。

---

## 怎么选

- **用 Smart 内核** → `clash-verge-script-smart.js`
- **用官方内核，想要地区分组** → `clash-verge-script.js`
- **想要配置简单、外部规则集依赖少** → `Geosite版.js`
- **不需要地区分组，习惯按服务切换** → `扩展脚本-优化版.js`

## 用法

Clash Verge Rev → 订阅右键「编辑文件」→ 或在「设置 → 扩展脚本」中引入 `.js`，保存后重启内核生效。

几个可能需要按自己情况改的常量：

| 常量 | 位置 | 说明 |
|---|---|---|
| `ENABLE_SMART` | smart 版 | 官方内核改 `false` |
| `SMART_POLICY_PRIORITY` | smart 版 | 按节点名调权重，需按机场命名填 |
| `AI_EXCLUDE_REGIONS` | smart 版 / 主力版 | 从 SmartAi 组剔除的风控地区 |
| `FORCE_UDP` | 全部 | 节点实际不支持 UDP 时改 `false`，否则 UDP 流量会黑洞而非回落 TCP |
| `CLEAN_NODE_NAME` | 主力版 | 关掉节点名清理 |
| `TOLERANCE` | 主力版 | url-test 容差（ms），默认 100 |
| `countryConfig` | 主力版 | 增删地区，书写顺序 = 面板显示顺序 |

---

仅供个人使用。
