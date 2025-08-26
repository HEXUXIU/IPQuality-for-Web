# API 集成文档

## 概述

IP 质量查询系统通过 Cloudflare Worker 后端聚合多个 IP 数据服务，提供全面的 IP 信息查询功能。Worker 支持以下数据源：

## IP 数据库服务

### ipinfo.io
- **URL**: `https://ipinfo.io/{ip}/json`
- **需要 API 密钥**: 否
- **数据字段**:
  - `country`: 国家代码
  - `city`: 城市
  - `isp`: ISP 信息
  - `asn`: ASN 编号
  - `loc`: 经纬度坐标

### ip-api.com
- **URL**: `http://ip-api.com/json/{ip}?lang=zh-CN`
- **需要 API 密钥**: 否
- **数据字段**:
  - `country`: 国家
  - `city`: 城市
  - `isp`: ISP 信息
  - `org`: 组织信息
  - `asn`: ASN 编号

### ip.sb
- **URL**: `https://api.ip.sb/geoip?ip={ip}`
- **需要 API 密钥**: 否
- **数据字段**:
  - `country`: 国家
  - `city`: 城市
  - `organization`: 组织信息
  - `asn`: ASN 编号

### ip.gs
- **URL**: `https://ip.gs/json?ip={ip}`
- **需要 API 密钥**: 否
- **数据字段**:
  - `country`: 国家
  - `city`: 城市
  - `isp`: ISP 信息

### ipregistry.co
- **URL**: `https://api.ipregistry.co/{ip}?key=tryout`
- **需要 API 密钥**: 否（使用试用密钥）
- **数据字段**:
  - `location.country.code`: 国家代码
  - `location.city`: 城市
  - `company.name`: 公司名称
  - `connection.asn`: ASN 编号

### ipdata.co
- **URL**: `https://api.ipdata.co/{ip}?api-key={API_KEY}`
- **需要 API 密钥**: 是
- **数据字段**:
  - `country_code`: 国家代码
  - `city`: 城市
  - `org`: 组织信息
  - `asn.asn`: ASN 编号

### ipwhois.app
- **URL**: `https://ipwhois.app/json/{ip}`
- **需要 API 密钥**: 否
- **数据字段**:
  - `country_code`: 国家代码
  - `city`: 城市
  - `isp`: ISP 信息
  - `connection.asn`: ASN 编号

## 风险评估服务

### IPQualityScore (IPQS)
- **URL**: `https://www.ipqualityscore.com/api/json/ip/{API_KEY}/{ip}`
- **需要 API 密钥**: 是
- **数据字段**:
  - `country`: 国家
  - `city`: 城市
  - `organization`: 组织信息
  - `fraud_score`: 欺诈分数
  - `proxy`: 代理检测
  - `vpn`: VPN 检测
  - `tor`: Tor 网络检测

### Scamalytics
- **URL**: `https://scamalytics.com/ip/{ip}`
- **需要 API 密钥**: 否
- **数据字段**:
  - `score.risk`: 风险分数
  - `signals.proxy`: 代理检测
  - `signals.vpn`: VPN 检测
  - `signals.tor`: Tor 网络检测

### AbuseIPDB
- **URL**: `https://api.abuseipdb.com/api/v2/check?ipAddress={ip}`
- **需要 API 密钥**: 是（通过请求头传递）
- **数据字段**:
  - `data.abuseConfidenceScore`: 滥用置信度分数
  - `data.isp`: ISP 信息
  - `data.countryCode`: 国家代码

### vpnapi.io
- **URL**: `https://vpnapi.io/api/{ip}?key={API_KEY}`
- **需要 API 密钥**: 是
- **数据字段**:
  - `security.vpn`: VPN 检测
  - `security.proxy`: 代理检测
  - `security.tor`: Tor 网络检测

### ip2location
- **URL**: `https://api.ip2location.io/?key={API_KEY}&ip={ip}`
- **需要 API 密钥**: 是
- **数据字段**:
  - `country_code`: 国家代码
  - `city_name`: 城市名称
  - `isp`: ISP 信息
  - `as`: ASN 编号

## CDN 和代理检测

### Cloudflare
- **URL**: `https://ip.nodeget.com/json`
- **需要 API 密钥**: 否
- **数据字段**:
  - `ip.riskScore`: 风险分数
  - `ip.proxy`: 代理检测

## API 响应标准化

所有 API 响应都会被标准化为统一的格式，前端通过 `standardized` 字段访问标准化数据。

## 错误处理

API 错误会被标准化为以下格式：
- `forbidden`: 403 错误
- `rate_limited`: 429 错误（请求过于频繁）
- `server_error`: 500+ 错误（服务器错误）