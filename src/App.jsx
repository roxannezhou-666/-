import { useState, useCallback } from 'react'
import CalendarView from './components/CalendarView'
import DayModal from './components/LogForm'
import { todayStr, TYPES, loadAll } from './data'
import './App.css'

export default function App() {
  const [selectedDay, setSelectedDay] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // 保存后刷新日历（让圆点更新）
  const handleSaved = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  // 统计本月各类型总时长
  function getMonthStats() {
    const now = new Date()
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const all = loadAll()
    const stats = { skill: 0, accumulate: 0, health: 0 }
    Object.entries(all).forEach(([date, logs]) => {
      if (!date.startsWith(prefix)) return
      logs.forEach(log => {
        if (log.type === 'skill' || log.type === 'accumulate') {
          stats[log.type] += parseFloat(log.duration) || 0
        }
        if (log.type === 'health') stats.health += 1
      })
    })
    return stats
  }

  const stats = getMonthStats()
  const now = new Date()

  return (
    <div className="app">
      {/* 顶部 */}
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <h1 className="app-title">每日记录便签</h1>
            <p className="app-subtitle">{now.getFullYear()}年{now.getMonth() + 1}月</p>
          </div>
          <button className="today-btn" onClick={() => setSelectedDay(todayStr())}>
            记录今天
          </button>
        </div>

        {/* 本月统计 */}
        <div className="month-stats">
          {Object.values(TYPES).map(t => (
            <div key={t.id} className="month-stat-item">
              <span className="stat-dot" style={{ background: t.color }} />
              <span className="stat-name">{t.label}</span>
              <span className="stat-val" style={{ color: t.color }}>
                {t.id === 'health'
                  ? `${stats.health}条`
                  : `${stats[t.id].toFixed(1)}h`}
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* 日历 */}
      <main className="app-main">
        <CalendarView key={refreshKey} onSelectDay={setSelectedDay} />
      </main>

      {/* 当日弹窗 */}
      {selectedDay && (
        <DayModal
          dateStr={selectedDay}
          onClose={() => setSelectedDay(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
