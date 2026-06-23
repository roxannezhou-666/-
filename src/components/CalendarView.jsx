import { useState } from 'react'
import { TYPES, loadAll, getMonthDays, todayStr, formatDate, getWeekday } from '../data'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function CalendarView({ onSelectDay }) {
  const today = todayStr()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-11

  const allData = loadAll()
  const days = getMonthDays(year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const now = new Date()
    // 不允许翻到未来月份
    if (year === now.getFullYear() && month === now.getMonth()) return
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // 获取某天有哪些类型的记录（用于显示圆点）
  function getDayTypes(dateStr) {
    const logs = allData[dateStr] || []
    const types = [...new Set(logs.map(l => l.type))]
    return types
  }

  return (
    <div className="calendar-wrap">
      {/* 月份导航 */}
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
        <div className="cal-title">
          <span className="cal-year">{year}</span>
          <span className="cal-month">{month + 1}月</span>
        </div>
        <button
          className="cal-nav-btn"
          onClick={nextMonth}
          disabled={year === now.getFullYear() && month === now.getMonth()}
        >›</button>
      </div>

      {/* 星期头 */}
      <div className="cal-weekdays">
        {WEEKDAYS.map(w => (
          <div key={w} className="cal-weekday">{w}</div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="cal-grid">
        {days.map(({ dateStr, currentMonth }) => {
          const types = getDayTypes(dateStr)
          const isToday = dateStr === today
          const isFuture = dateStr > today
          const hasRecord = types.length > 0

          return (
            <div
              key={dateStr}
              className={[
                'cal-day',
                !currentMonth && 'other-month',
                isToday && 'today',
                isFuture && 'future',
                hasRecord && 'has-record',
              ].filter(Boolean).join(' ')}
              onClick={() => !isFuture && onSelectDay(dateStr)}
            >
              <span className="cal-day-num">
                {parseInt(dateStr.slice(8))}
              </span>
              {/* 类型圆点 */}
              {types.length > 0 && (
                <div className="cal-dots">
                  {types.map(t => (
                    <span
                      key={t}
                      className="cal-dot"
                      style={{ background: TYPES[t]?.color }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 图例 */}
      <div className="cal-legend">
        {Object.values(TYPES).map(t => (
          <div key={t.id} className="legend-item">
            <span className="legend-dot" style={{ background: t.color }} />
            <span>{t.emoji} {t.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
