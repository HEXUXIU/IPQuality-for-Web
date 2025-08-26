/**
 * =========================================================
 * IP 质量查询 Worker v0.11
 * 用于 IP 查询聚合
 *
 * 功能特性：
 * - 将 IP 查询去中心化，聚合多个数据源
 * - 支持 IPQS API 查询（需在前端传 Key）
 * - 逻辑防滥用（基于 IP + API 权重）
 * - 请求并发支持
 * - 响应压缩（Gzip / Brotli）
 * - IP 校验（IPv4/IPv6）
 * - API 响应标准化，前端统一使用 standardized 字段
 * - 响应信息增强，包含 URL 和原始数据
 * - Map 内存自动清理过期的 timestamps
 * - CORS 支持
 *
 * 注意事项：
 * - rateMap 存储在 Worker 内存中，可以实现高效
 * - 如需持久化可考虑使用 Cloudflare KV
 * =========================================================
 */

/////////////////////////////
// ======== 压缩模块 ========
/////////////////////////////
async function gzipEncode(str){
        const cs = new CompressionStream("gzip");
        const writer = cs.writable.getWriter();
        writer.write(new TextEncoder().encode(str));
        writer.close();
        return new Response(cs.readable).arrayBuffer();
      }
      
      async function brotliEncode(str) {
        // 直接降级到 gzip 压缩，避免 Illegal invocation 错误
        return gzipEncode(str);
      }
      
      /////////////////////////////
      // ======== 配置模块 ========
      /////////////////////////////
      const MAX_CONCURRENT = 3;
      const DEFAULT_TIMEOUT = 5000;
      const RATE_LIMIT = 20;
      const RATE_WINDOW = 60*1000; // 1 分钟
      
      // 逻辑防滥用存储
      const rateMap = new Map();
      
      // 扩展 API 配置
      const API_CONFIG = {
        // IP数据库服务
        ipinfo:  { url: "https://ipinfo.io/{ip}/json", requiresKey: false, weight: 1 },
        ipapi:   { url: "http://ip-api.com/json/{ip}?lang=zh-CN", requiresKey: false, weight: 1 },
        ipsb:    { url: "https://api.ip.sb/geoip?ip={ip}", requiresKey: false, weight: 1 },
        ipgs:    { url: "https://ip.gs/json?ip={ip}", requiresKey: false, weight: 1 },
        skk:     { url: "https://api.skk.moe/ip?ip={ip}", requiresKey: false, weight: 1 },
        ipzx:    { url: "https://ip.zxinc.org/?ip={ip}", requiresKey: false, weight: 1 },
        ipregistry: { url: "https://api.ipregistry.co/{ip}?key=tryout", requiresKey: false, weight: 1 },
        ipdata:  { url: "https://api.ipdata.co/{ip}?api-key={API_KEY}", requiresKey: true, weight: 1 },
        ipwhois: { url: "https://ipwhois.app/json/{ip}", requiresKey: false, weight: 1 },
        
        // 风险评估服务
        ipqs:    { url: "https://www.ipqualityscore.com/api/json/ip/{API_KEY}/{ip}", requiresKey: true, weight: 2 },
        scamalytics: { url: "https://scamalytics.com/ip/{ip}", requiresKey: false, weight: 1 },
        abuseipdb: { url: "https://api.abuseipdb.com/api/v2/check?ipAddress={ip}", requiresKey: true, weight: 1 },
        vpnapi:  { url: "https://vpnapi.io/api/{ip}?key={API_KEY}", requiresKey: true, weight: 1 },
        ip2location: { url: "https://api.ip2location.io/?key={API_KEY}&ip={ip}", requiresKey: true, weight: 1 },
        
        // CDN和代理检测
        cloudflare: { url: "https://ip.nodeget.com/json", requiresKey: false, weight: 1 }
      };
      
      /////////////////////////////
      // ======== IP 校验模块 ========
      /////////////////////////////
      const isValidIPv4 = ip=>{
        const parts = ip.split(".");
        if(parts.length!==4) return false;
        return parts.every(n=>/^\d+$/.test(n) && parseInt(n)<=255);
      };
      const isValidIPv6 = ip=>{
        const parts = ip.split(":");
        if(parts.length<3 || parts.length>8) return false;
        return parts.every(p=>p.length===0||/^[0-9a-fA-F]{0,4}$/.test(p));
      };
      const isValidIP = ip=>isValidIPv4(ip)||isValidIPv6(ip);
      
      /////////////////////////////
      // ======== fetch 封装模块 ========
      /////////////////////////////
      async function fetchWithTimeout(url, timeout=DEFAULT_TIMEOUT){
        const controller = new AbortController();
        const id = setTimeout(()=>controller.abort(), timeout);
        const start = Date.now();
        try{
          const res = await fetch(url,{signal:controller.signal});
          
          // 处理不同服务的响应
          const text = await res.text();
          let data;
          try {
            // 首先尝试直接解析
            data = JSON.parse(text);
          } catch {
            // 如果失败，尝试清理文本后再解析
            try {
              // 清理可能的乱码字符
              const cleanedText = text.replace(/\u0000/g, "").replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
              data = JSON.parse(cleanedText);
            } catch {
              data = {error:"Invalid JSON", rawText: text.substring(0, 200) + (text.length > 200 ? "..." : "")};
            }
          }
          
          return { data, elapsed: Date.now()-start, status: res.status, error:null };
        }catch(e){
          return { data:null, elapsed: Date.now()-start, status:0, error:`${e.message} (url: ${url})` };
        }finally{ clearTimeout(id); }
      }
      
      function getApiUrl(apiName, ip, apiKeys){
        const cfg = API_CONFIG[apiName];
        if(!cfg || !cfg.url) return null;
        let url = cfg.url.replace("{ip}",ip);
        
        // 根据不同服务替换API密钥
        if(apiName==="ipqs" && apiKeys.ipqs){
          url = url.replace("{API_KEY}", apiKeys.ipqs);
        } else if(apiName==="abuseipdb" && apiKeys.abuseipdb){
          // AbuseIPDB使用请求头传递API密钥
          return { url, headers: { "Key": apiKeys.abuseipdb } };
        } else if(apiName==="ipdata" && apiKeys.ipdata){
          url = url.replace("{API_KEY}", apiKeys.ipdata);
        } else if(apiName==="vpnapi" && apiKeys.vpnapi){
          url = url.replace("{API_KEY}", apiKeys.vpnapi);
        } else if(apiName==="ip2location" && apiKeys.ip2location){
          url = url.replace("{API_KEY}", apiKeys.ip2location);
        } else if(cfg.requiresKey){
          return null; // 需要API密钥但未提供
        }
        
        return url;
      }
      
      /////////////////////////////
      // ======== API 数据标准化模块 ========
      /////////////////////////////
      const transformFns = {
        // IP数据库服务数据标准化
        ipinfo: data=>({ 
          country: data.country, 
          city: data.city, 
          isp: data.org,
          asn: data.org? data.org.split(" ")[0] : null,
          loc: data.loc
        }),
        ipapi: data=>({ 
          country: data.country, 
          city: data.city, 
          isp: data.isp,
          org: data.org,
          asn: data.as? data.as.split(" ")[0] : null
        }),
        ipsb: data=>({ 
          country: data.country, 
          city: data.city, 
          isp: data.organization,
          asn: data.asn
        }),
        ipgs: data=>({ 
          country: data.country, 
          city: data.city, 
          isp: data.isp
        }),
        skk: data=>({ 
          country: data.country, 
          city: data.city, 
          isp: data.isp
        }),
        ipzx: data=>({ 
          country: data.country, 
          city: data.city, 
          isp: data.isp
        }),
        ipregistry: data=>({
          country: data.location? data.location.country.code : null,
          city: data.location? data.location.city : null,
          isp: data.company? data.company.name : null,
          asn: data.connection? data.connection.asn : null
        }),
        ipdata: data=>({
          country: data.country_code,
          city: data.city,
          isp: data.org,
          asn: data.asn? data.asn.asn : null
        }),
        ipwhois: data=>({
          country: data.country_code,
          city: data.city,
          isp: data.isp,
          asn: data.connection? data.connection.asn : null
        }),
        
        // 风险评估服务数据标准化
        ipqs: data=>({ 
          country: data.country, 
          city: data.city, 
          isp: data.organization,
          fraud_score: data.fraud_score,
          proxy: data.proxy,
          vpn: data.vpn,
          tor: data.tor
        }),
        scamalytics: data=>({
          fraud_score: data.score? data.score.risk : null,
          proxy: data.signals? data.signals.proxy : null,
          vpn: data.signals? data.signals.vpn : null,
          tor: data.signals? data.signals.tor : null
        }),
        abuseipdb: data=>({
          abuse_score: data.data? data.data.abuseConfidenceScore : null,
          isp: data.data? data.data.isp : null,
          country: data.data? data.data.countryCode : null
        }),
        vpnapi: data=>({
          security: data.security? {
            vpn: data.security.vpn,
            proxy: data.security.proxy,
            tor: data.security.tor
          } : null
        }),
        ip2location: data=>({
          country: data.country_code,
          city: data.city_name,
          isp: data.isp,
          asn: data.as
        }),
        
        // CDN和代理检测数据标准化
        cloudflare: data=>({
          risk_score: data.ip? data.ip.riskScore : null,
          proxy: data.ip? data.ip.proxy : null
        })
      };
      
      /////////////////////////////
      // ======== API 调用模块 ========
      /////////////////////////////
      async function processIp(ip, targetApis, order="concurrent", apiKeys={}){
        const results = {};
      
        const workerFn = async(api)=>{
          const urlConfig = getApiUrl(api, ip, apiKeys);
          if(!urlConfig) return { data:null, elapsed:0, status:0, error:"API配置缺失或缺少API密钥" };
          
          // 处理需要特殊请求头的API（如AbuseIPDB）
          let res;
          if(typeof urlConfig === "object" && urlConfig.headers){
            res = await fetchWithTimeout(urlConfig.url, DEFAULT_TIMEOUT, { headers: urlConfig.headers });
          } else {
            res = await fetchWithTimeout(urlConfig);
          }
      
          // 简化错误信息
          if(res.status===403) res.error="forbidden";
          if(res.status===429) res.error="rate_limited";
          if(res.status>=500) res.error="server_error";
      
          // 应用标准化处理
          const transform = transformFns[api];
          if(transform && res.data && !res.data.error) {
            // 清理原始数据，移除乱码字段
            const cleanedData = {};
            for (const [key, value] of Object.entries(res.data)) {
              if (typeof value === "string" && /\u0000/.test(value)) {
                // 跳过包含乱码的字段
                continue;
              }
              cleanedData[key] = value;
            }
            res.standardized = transform(cleanedData);
          }
      
          return res;
        };
      
        if(order==="sequential"){
          for(const api of targetApis) results[api]=await workerFn(api);
        }else{
          const queue=[...targetApis];
          const active=[];
          while(queue.length || active.length){
            while(active.length<MAX_CONCURRENT && queue.length){
              const apiName = queue.shift();
              const p = workerFn(apiName).then(r=>{
                results[apiName]=r;
                active.splice(active.indexOf(p),1);
              });
              active.push(p);
            }
            if(active.length) await Promise.race(active);
          }
        }
      
        return results;
      }
      
      /////////////////////////////
      // ======== 限流模块 ========
      /////////////////////////////
      function checkRateLimit(clientIP){
        const now = Date.now();
        const record = rateMap.get(clientIP) || {timestamps:[], weight:1};
        const valid = record.timestamps.filter(ts=>ts>now-RATE_WINDOW);
        const totalWeight = valid.reduce((acc,w)=>acc+record.weight,0);
      
        if(totalWeight>=RATE_LIMIT) return false;
      
        valid.push(now);
        // 限制 timestamps 数组长度，防止内存泄漏
        if(valid.length>100) valid.splice(0, valid.length-100);
        record.timestamps = valid;
        rateMap.set(clientIP,record);
      
        // 清理长时间未使用的 IP
        for(const [key, rec] of rateMap){
          if(!rec.timestamps.length || Math.max(...rec.timestamps)<now-RATE_WINDOW){
            rateMap.delete(key);
          }
        }
      
        return true;
      }
      
      /////////////////////////////
      // ======== Worker 入口 ========
      /////////////////////////////
      export default {
        async fetch(request){
          const url = new URL(request.url);
          const ipParam = url.searchParams.get("ip");
          const apiParam = url.searchParams.get("api")?.toLowerCase();
          const ipqsKey = url.searchParams.get("ipqs_key");
          const abuseipdbKey = url.searchParams.get("abuseipdb_key");
          const ipdataKey = url.searchParams.get("ipdata_key");
          const vpnapiKey = url.searchParams.get("vpnapi_key");
          const ip2locationKey = url.searchParams.get("ip2location_key");
          const debug = url.searchParams.get("debug")==="1";
          const orderParam = url.searchParams.get("order") || "concurrent";
      
          if(!ipParam || !isValidIP(ipParam))
            return new Response(JSON.stringify({error:"Invalid IP"}),{status:400,headers:{"Content-Type":"application/json"}});
      
          const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
          if(!checkRateLimit(clientIP))
            return new Response(JSON.stringify({error:"Rate limit exceeded"}),{status:429,headers:{"Content-Type":"application/json"}});
      
          // 构建API密钥对象
          const apiKeys = {
            ipqs: ipqsKey,
            abuseipdb: abuseipdbKey,
            ipdata: ipdataKey,
            vpnapi: vpnapiKey,
            ip2location: ip2locationKey
          };
          
          const targetApis = apiParam ? [apiParam] : Object.keys(API_CONFIG);
          const results = await processIp(ipParam,targetApis,orderParam,apiKeys);
      
          // 为调试目的保留原始信息，但不返回给普通用户
          const body = JSON.stringify({ip:ipParam, results});
          const headers = {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"};
          
          // 检查客户端是否支持压缩
          const acceptEncoding = request.headers.get("Accept-Encoding") || "";
          console.log("Accept-Encoding:", acceptEncoding);
          
          // 直接返回未压缩的响应
          return new Response(body, {status:200, headers});
        }
      };