<script setup lang="ts">
import { ref } from 'vue'
import axios, { type AxiosResponse } from 'axios'
import { useAppStore } from '@/stores'

const appStore = useAppStore()
appStore.setPageTitle('接口调试')

const method = ref('GET')
const url = ref('/health')
const requestBody = ref('')
const bearerToken = ref('')
const headers = ref<Array<{ key: string; value: string }>>([
  { key: 'Content-Type', value: 'application/json' },
])

const quickEndpoints = [
  { label: '健康检查', method: 'GET', url: '/health' },
  { label: '登录', method: 'POST', url: '/v1/auth/login', body: '{\n  "username": "admin",\n  "password": "admin123"\n}' },
  { label: '当前用户', method: 'GET', url: '/v1/auth/me' },
  { label: '用户列表', method: 'GET', url: '/v1/users' },
  { label: '用户详情', method: 'GET', url: '/v1/users/1' },
  { label: '更新用户', method: 'PUT', url: '/v1/users/2', body: '{\n  "nickname": "测试",\n  "email": "t@t.com",\n  "role": "editor"\n}' },
  { label: '删除用户', method: 'DELETE', url: '/v1/users/3' },
]

function applyQuick(ep: typeof quickEndpoints[0]) {
  method.value = ep.method
  url.value = ep.url
  requestBody.value = ep.body || ''
}

interface RespItem {
  status: number; statusText: string; headers: Record<string, string>; body: unknown; time: number; timestamp: number
}

const response = ref<RespItem | null>(null)
const loading = ref(false)
const errorMsg = ref('')
const history = ref<Array<{ method: string; url: string; time: number; status: number }>>([])

function addHeader() { headers.value.push({ key: '', value: '' }) }
function removeHeader(i: number) { headers.value.splice(i, 1) }
function formatJson(o: unknown) { try { return JSON.stringify(o, null, 2) } catch { return String(o) } }

async function sendRequest() {
  loading.value = true; errorMsg.value = ''; response.value = null
  const start = performance.now()

  const h: Record<string, string> = {}
  headers.value.forEach(hd => { if (hd.key.trim()) h[hd.key.trim()] = hd.value })
  if (bearerToken.value.trim()) h['Authorization'] = `Bearer ${bearerToken.value.trim()}`

  let body: unknown = null
  if (requestBody.value.trim()) {
    try { body = JSON.parse(requestBody.value) }
    catch { errorMsg.value = '请求体 JSON 格式错误'; loading.value = false; return }
  }

  try {
    const res: AxiosResponse = await axios({
      method: method.value,
      url: `/api${url.value}`,
      headers: h,
      data: method.value !== 'GET' && method.value !== 'DELETE' ? body : undefined,
      timeout: 30000,
    })
    const elapsed = Math.round(performance.now() - start)
    response.value = { status: res.status, statusText: res.statusText, headers: res.headers as Record<string, string>, body: res.data, time: elapsed, timestamp: Date.now() }
    history.value.unshift({ method: method.value, url: url.value, time: elapsed, status: res.status })
    if (history.value.length > 50) history.value.pop()
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - start)
    if (err.response) {
      response.value = { status: err.response.status, statusText: err.response.statusText, headers: err.response.headers as Record<string, string>, body: err.response.data, time: elapsed, timestamp: Date.now() }
      history.value.unshift({ method: method.value, url: url.value, time: elapsed, status: err.response.status })
      if (history.value.length > 50) history.value.pop()
    } else {
      errorMsg.value = err.message || '请求失败'
    }
  } finally { loading.value = false }
}

function replay(h: typeof history.value[0]) { method.value = h.method; url.value = h.url; sendRequest() }
function sClass(s: number) { return s >= 200 && s < 300 ? 'ok' : s >= 400 && s < 500 ? 'warn' : 'err' }
function tClass(t: number) { return t < 100 ? 'fast' : t < 500 ? 'mid' : 'slow' }
</script>

<template>
  <div class="tester">
    <div class="cols">
      <!-- 请求 -->
      <div class="card">
        <h3>📤 请求配置</h3>
        <div class="req-line">
          <select v-model="method" class="msel">
            <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
          </select>
          <span class="pfx">/api</span>
          <input v-model="url" class="urli" placeholder="如 /health 或 /v1/auth/login" @keyup.enter="sendRequest" />
          <button class="bgo" :disabled="loading" @click="sendRequest">{{ loading ? '⏳' : '🚀 发送' }}</button>
        </div>

        <div class="sec">
          <label>🔐 Bearer Token</label>
          <input v-model="bearerToken" class="inp" placeholder="粘贴 JWT Token（可选）" />
        </div>

        <div class="sec">
          <div class="row between"><label>📋 请求头</label><button class="bmini" @click="addHeader">+ 添加</button></div>
          <div v-for="(hd, i) in headers" :key="i" class="hr">
            <input v-model="hd.key" placeholder="Key" class="ism" /><input v-model="hd.value" placeholder="Value" class="ism" /><button class="bx" @click="removeHeader(i)">×</button>
          </div>
        </div>

        <div v-if="method !== 'GET' && method !== 'DELETE'" class="sec">
          <label>📝 请求体 (JSON)</label>
          <textarea v-model="requestBody" rows="8" class="ta" spellcheck="false" />
        </div>

        <div class="sec">
          <label>⚡ 快捷端点</label>
          <div class="ql">
            <button v-for="(ep, i) in quickEndpoints" :key="i" class="qb" :class="`m-${ep.method.toLowerCase()}`" @click="applyQuick(ep)">
              <span class="mb">{{ ep.method }}</span><span class="mu">{{ ep.url }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 响应 -->
      <div class="card">
        <h3>📥 响应结果</h3>
        <div v-if="errorMsg" class="errb">{{ errorMsg }}</div>
        <div v-if="response" class="metab">
          <span :class="sClass(response.status)">状态: {{ response.status }} {{ response.statusText }}</span>
          <span :class="tClass(response.time)">耗时: {{ response.time }}ms</span>
          <span>{{ new Date(response.timestamp).toLocaleTimeString() }}</span>
        </div>
        <div v-if="response" class="sec">
          <label>📋 响应头</label>
          <div class="rhb"><div v-for="(v,k) in response.headers" :key="k" class="rhr"><span class="rhk">{{ k }}</span><span class="rhv">{{ v }}</span></div></div>
        </div>
        <div v-if="response" class="sec fg">
          <label>📦 响应体</label>
          <pre class="rb">{{ formatJson(response.body) }}</pre>
        </div>
        <div v-if="!response && !errorMsg && !loading" class="emp"><div class="eicon">📡</div><p>选择一个端点或输入地址后点击发送</p></div>
        <div v-if="loading" class="ld">⏳ 请求中...</div>
      </div>
    </div>

    <!-- 历史 -->
    <div v-if="history.length" class="card hc">
      <h4>📜 请求历史</h4>
      <div class="hl">
        <div v-for="(h,i) in history.slice(0,15)" :key="i" class="hi" @click="replay(h)">
          <span :class="`mb bg-${h.method.toLowerCase()}`">{{ h.method }}</span>
          <span class="hu">{{ h.url }}</span>
          <span :class="sClass(h.status)">{{ h.status }}</span>
          <span class="ht">{{ h.time }}ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tester{max-width:1400px;margin:0 auto}
.cols{display:flex;gap:20px;align-items:flex-start;
  @media(max-width:900px){flex-direction:column}
}
.card{flex:1;min-width:0;background:#fff;border-radius:10px;box-shadow:0 1px 6px rgba(0,0,0,.06);padding:20px;margin-bottom:20px;
  h3,h4{font-size:16px;font-weight:600;color:#1a202c;margin:0 0 14px;padding-bottom:10px;border-bottom:2px solid #f0f2f5}
}
.hc{margin-top:0}
.req-line{display:flex;gap:0;margin-bottom:14px}
.msel{width:90px;height:40px;padding:0 4px;font-size:14px;font-weight:700;color:#fff;background:$primary-color;border:none;border-radius:6px 0 0 6px;text-align:center;cursor:pointer}
.pfx{display:flex;align-items:center;padding:0 10px;font-size:13px;font-weight:600;color:#fff;background:#2d3748;height:40px;white-space:nowrap}
.urli{flex:1;height:40px;padding:0 12px;font-size:14px;border:1px solid #d1d5db;border-left:none;border-right:none;outline:none;font-family:Consolas,Monaco,monospace;&:focus{border-color:$primary-color}}
.bgo{min-width:90px;height:40px;padding:0 16px;font-size:14px;font-weight:600;color:#fff;background:$primary-color;border:none;border-radius:0 6px 6px 0;cursor:pointer;&:hover:not(:disabled){background:color-mix(in srgb,$primary-color,#000 10%)}&:disabled{opacity:.6;cursor:not-allowed}}
.sec{margin-bottom:14px;label{display:block;font-size:13px;font-weight:600;color:#4a5568;margin-bottom:4px}}
.fg{flex:1;display:flex;flex-direction:column}
.row{display:flex;align-items:center}
.between{justify-content:space-between}
.inp{width:100%;height:36px;padding:0 10px;font-size:13px;border:1px solid #d1d5db;border-radius:6px;outline:none;font-family:Consolas,Monaco,monospace;box-sizing:border-box;&:focus{border-color:$primary-color;box-shadow:0 0 0 2px rgba(64,158,255,.15)}}
.bmini{padding:2px 10px;font-size:12px;color:$primary-color;border:1px solid $primary-color;border-radius:4px;background:transparent;cursor:pointer;&:hover{background:$primary-color;color:#fff}}
.hr{display:flex;gap:4px;margin-bottom:4px}
.ism{flex:1;height:30px;padding:0 6px;font-size:13px;border:1px solid #e2e8f0;border-radius:4px;outline:none;font-family:Consolas,Monaco,monospace;&:focus{border-color:$primary-color}}
.bx{width:26px;height:30px;font-size:16px;color:#a0aec0;border-radius:4px;cursor:pointer;&:hover{color:$danger-color;background:rgba(245,101,101,.08)}}
.ta{width:100%;padding:10px;font-size:13px;font-family:Consolas,Monaco,monospace;border:1px solid #d1d5db;border-radius:6px;outline:none;resize:vertical;box-sizing:border-box;line-height:1.5;&:focus{border-color:$primary-color;box-shadow:0 0 0 2px rgba(64,158,255,.15)}}
.metab{display:flex;gap:16px;padding:8px 12px;background:#f7f8fa;border-radius:6px;margin-bottom:12px;font-size:13px;font-weight:500;color:#4a5568;flex-wrap:wrap;.ok{color:#22c55e}.warn{color:#f59e0b}.err{color:$danger-color}.fast{color:#22c55e}.mid{color:#f59e0b}.slow{color:$danger-color}}
.rhb{max-height:160px;overflow-y:auto;background:#f7f8fa;border-radius:6px;padding:6px 10px}
.rhr{display:flex;font-size:12px;font-family:Consolas,Monaco,monospace;padding:2px 0;border-bottom:1px solid #edeff2;&:last-child{border-bottom:none}.rhk{font-weight:600;color:#2d3748;min-width:130px;flex-shrink:0}.rhv{color:#6b7280;word-break:break-all}}
.rb{flex:1;margin:0;padding:12px;font-size:13px;font-family:Consolas,Monaco,monospace;white-space:pre-wrap;word-break:break-all;background:#1e293b;color:#e2e8f0;border-radius:6px;overflow-x:auto;line-height:1.5;max-height:480px;overflow-y:auto}
.errb{padding:10px 14px;background:#fef2f2;color:$danger-color;border-radius:6px;font-size:14px;margin-bottom:12px;border:1px solid #fecaca}
.emp{text-align:center;padding:60px 20px;color:#9ca3af;.eicon{font-size:48px;margin-bottom:12px}p{font-size:14px;margin:0}}
.ld{text-align:center;padding:40px;color:$primary-color;font-size:16px}
.ql{display:flex;flex-wrap:wrap;gap:6px}
.qb{display:flex;align-items:center;gap:4px;padding:4px 10px;font-size:12px;border:1px solid #e2e8f0;border-radius:16px;cursor:pointer;background:#fff;transition:background .15s,border .15s;&:hover{background:#f0f4ff;border-color:$primary-color}.mu{font-family:Consolas,Monaco,monospace;color:#4a5568}}
.mb{font-weight:700;font-size:10px;padding:1px 5px;border-radius:3px;color:#fff}
.m-get .mb,.bg-get{background:#22c55e}
.m-post .mb,.bg-post{background:#3b82f6}
.m-put .mb,.bg-put{background:#f59e0b}
.m-patch .mb,.bg-patch{background:#8b5cf6}
.m-delete .mb,.bg-delete{background:$danger-color}
.hl{display:flex;flex-wrap:wrap;gap:6px}
.hi{display:flex;align-items:center;gap:6px;padding:4px 12px;font-size:12px;background:#f7f8fa;border-radius:16px;cursor:pointer;border:1px solid transparent;transition:background .15s,border .15s;&:hover{background:#eef2ff;border-color:$primary-color}.hu{font-family:Consolas,Monaco,monospace;color:#4a5568}.ht{color:#9ca3af}}
.hi .ok{color:#22c55e}.hi .warn{color:#f59e0b}.hi .err{color:$danger-color}
</style>