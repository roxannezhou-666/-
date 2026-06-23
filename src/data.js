// ============================================================
// 数据层
// 三种类型：skill（技能）/ accumulate（积累）/ health（健康）
// 每天可以有多条记录，每条记录属于某种类型
// ============================================================

export const TYPES = {
  skill: {
    id: 'skill',
    label: '技能',
    color: '#6366f1',      // 紫
    lightColor: '#eef2ff',
    emoji: '⚡',
    subtypes: ['AI coding', '绘画'],
  },
  accumulate: {
    id: 'accumulate',
    label: '积累',
    color: '#f59e0b',      // 橙
    lightColor: '#fffbeb',
    emoji: '📖',
    subtypes: ['书籍', '电影', '纪录片'],
  },
  health: {
    id: 'health',
    label: '健康',
    color: '#10b981',      // 绿
    lightColor: '#f0fdf4',
    emoji: '🌿',
    subtypes: ['饮食', '运动'],
  },
}

// ---- 存储 key ----
const STORAGE_KEY = 'daily_tracker_v2'

// ---- 读取所有记录 ----
// 数据结构：{ "2025-06-22": [ { id, type, subtype, ...fields } ] }
export function loadAll() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v ? JSON.parse(v) : {}
  } catch { return {} }
}

// ---- 保存所有记录 ----
function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ---- 获取某天的记录 ----
export function getDayLogs(dateStr) {
  return loadAll()[dateStr] || []
}

// ---- 保存某条记录（新增或编辑）----
export function saveLog(dateStr, log) {
  const all = loadAll()
  if (!all[dateStr]) all[dateStr] = []
  const idx = all[dateStr].findIndex(l => l.id === log.id)
  if (idx >= 0) all[dateStr][idx] = log
  else all[dateStr].push(log)
  saveAll(all)
}

// ---- 删除某条记录 ----
export function deleteLog(dateStr, logId) {
  const all = loadAll()
  if (!all[dateStr]) return
  all[dateStr] = all[dateStr].filter(l => l.id !== logId)
  if (all[dateStr].length === 0) delete all[dateStr]
  saveAll(all)
}

// ---- 自定义子类型存取 ----
const SUBTYPES_KEY = 'daily_tracker_subtypes_v1'

export function loadSubtypes() {
  try {
    const v = localStorage.getItem(SUBTYPES_KEY)
    return v ? JSON.parse(v) : {}
  } catch { return {} }
}

export function addSubtype(typeId, name) {
  const all = loadSubtypes()
  if (!all[typeId]) all[typeId] = []
  if (!all[typeId].includes(name)) all[typeId].push(name)
  localStorage.setItem(SUBTYPES_KEY, JSON.stringify(all))
}

export function getSubtypes(typeId) {
  const defaults = TYPES[typeId]?.subtypes || []
  const custom = loadSubtypes()[typeId] || []
  return [...new Set([...defaults, ...custom])]
}

// ---- 工具函数 ----
export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function getWeekday(dateStr) {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return '周' + days[new Date(dateStr + 'T00:00:00').getDay()]
}

// 获取某月所有天（含前后补位）
export function getMonthDays(year, month) {
  // month: 0-11
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekday = firstDay.getDay() // 0=周日
  const days = []

  // 前补位（上月末尾）
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ dateStr: d.toISOString().slice(0, 10), currentMonth: false })
  }
  // 本月
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    days.push({ dateStr: date.toISOString().slice(0, 10), currentMonth: true })
  }
  // 后补位（凑满6行42格）
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ dateStr: d.toISOString().slice(0, 10), currentMonth: false })
  }
  return days
}
