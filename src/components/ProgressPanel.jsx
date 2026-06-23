import { useState } from 'react'
import {
  getFitnessLogs, getDrawingLogs, getCultureLogs,
  getWeekRange, getMonthRange, inRange
} from '../data'

export default function ProgressPanel() {
  const [period, setPeriod] = useState('week') // 'week' | 'month'
  const [offset, setOffset] = useState(0)

  const range = period === 'week' ? getWeekRange(offset) : getMonthRange(offset)

  // 筛选在范围内的记录
  const fitnessLogs = getFitnessLogs().filter(l => inRange(l.date, range.start, range.end))
  const drawingLogs = getDrawingLogs().filter(l => inRange(l.date, range.start, range.end))
  const cultureLogs = getCultureLogs().filter(l => inRange(l.date, range.start, range.end))

  // 书籍/电影达标判断
  const bookHours = cultureLogs
    .filter(l => l.type === 'book')
    .reduce((sum, l) => sum + (parseFloat(l.duration) || 0), 0)
  const movieCount = cultureLogs.filter(l => l.type === 'movie').length
  const cultureGoalMet = bookHours >= 2 || movieCount >= 1

  // 健身训练次数
  const fitnessCount = fitnessLogs.length
  // 绘画打卡次数
  const drawingCount = drawingLogs.length

  const stats = [
    {
      icon: '💪',
      label: '健身',
      value: `${fitnessCount} 次`,
      sub: fitnessCount > 0 ? `最近：${fitnessLogs[0]?.date}` : '本期还没训练',
      color: '#6366f1',
      met: fitnessCount > 0,
    },
    {
      icon: '🎨',
      label: '绘画',
      value: `${drawingCount} 次`,
      sub: drawingCount > 0 ? `最近：${drawingLogs[0]?.date}` : '本期还没打卡',
      color: '#ec4899',
      met: drawingCount > 0,
    },
    {
      icon: '📚🎬',
      label: '书籍/电影',
      value: cultureGoalMet ? '✅ 已达标' : '未达标',
      sub: `阅读 ${bookHours.toFixed(1)}h · 电影 ${movieCount} 部`,
      color: '#10b981',
      met: cultureGoalMet,
    },
  ]

  return (
    <div className="progress-panel">
      {/* 周期切换 */}
      <div className="progress-header">
        <div className="period-toggle">
          <button className={`period-btn ${period === 'week' ? 'active' : ''}`}
            onClick={() => { setPeriod('week'); setOffset(0) }}>按周</button>
          <button className={`period-btn ${period === 'month' ? 'active' : ''}`}
            onClick={() => { setPeriod('month'); setOffset(0) }}>按月</button>
        </div>
        <div className="period-nav">
          <button className="nav-btn" onClick={() => setOffset(o => o - 1)}>‹</button>
          <span className="period-label">{range.label}</span>
          <button className="nav-btn" onClick={() => setOffset(o => Math.min(o + 1, 0))}>›</button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.met ? 'met' : ''}`}
            style={{ '--stat-color': s.color }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 健身详情 */}
      {fitnessLogs.length > 0 && (
        <div className="period-detail">
          <div className="detail-title">💪 本期训练明细</div>
          {fitnessLogs.map(log => (
            <div key={log.id} className="detail-row">
              <span className="detail-date">{log.date}</span>
              <span className="detail-content">
                {log.items.map(i => `${i.name}${i.weight ? ' ' + i.weight + i.unit : ''}${i.reps ? ' ' + i.reps + '次' : ''}`).join(' · ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 文化详情 */}
      {cultureLogs.length > 0 && (
        <div className="period-detail">
          <div className="detail-title">📚🎬 本期书影明细</div>
          {cultureLogs.map(log => (
            <div key={log.id} className="detail-row">
              <span className="detail-date">{log.date}</span>
              <span className="detail-content">
                {log.type === 'book' ? `📚 ${log.title}${log.duration ? ' · ' + log.duration + 'h' : ''}` : `🎬 ${log.title}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
