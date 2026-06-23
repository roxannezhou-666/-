import { useState } from 'react'
import { TYPES, genId, saveLog, deleteLog, getDayLogs, formatDate, getWeekday, getSubtypes, addSubtype } from '../data'

// ---- 各类型空记录模板 ----
function emptyLog(type) {
  const base = { id: genId(), type }
  if (type === 'skill')      return { ...base, subtype: 'AI coding', duration: '', work: '' }
  if (type === 'accumulate') return { ...base, subtype: '书籍', title: '', duration: '', thought: '' }
  if (type === 'health')     return { ...base, subtype: '饮食', food: '', exercise: '', note: '' }
  return base
}

// ---- 子类型选择器（含新增）----
function SubtypeSelector({ typeId, value, onChange }) {
  const t = TYPES[typeId]
  const [adding, setAdding] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const subtypes = getSubtypes(typeId)

  function handleAdd() {
    const name = inputVal.trim()
    if (!name) return
    addSubtype(typeId, name)
    onChange(name)
    setInputVal('')
    setAdding(false)
  }

  return (
    <div className="subtype-toggle">
      {subtypes.map(s => (
        <button key={s}
          className={`subtype-btn ${value === s ? 'active' : ''}`}
          style={value === s ? { background: t.color, color: '#fff', borderColor: t.color } : {}}
          onClick={() => onChange(s)}>{s}</button>
      ))}
      {adding ? (
        <span className="subtype-add-input">
          <input
            autoFocus
            placeholder="输入名称"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
          />
          <button className="subtype-btn" style={{ background: t.color, color: '#fff', borderColor: t.color }} onClick={handleAdd}>确定</button>
          <button className="subtype-btn" onClick={() => setAdding(false)}>取消</button>
        </span>
      ) : (
        <button className="subtype-btn subtype-add-btn" onClick={() => setAdding(true)}>＋</button>
      )}
    </div>
  )
}

// ---- 技能表单 ----
function SkillForm({ log, onChange }) {
  return (
    <>
      <div className="form-group">
        <label>类型</label>
        <SubtypeSelector typeId="skill" value={log.subtype} onChange={s => onChange({ ...log, subtype: s })} />
      </div>
      <div className="form-group">
        <label>今日投入时长（小时）</label>
        <input type="number" step="0.5" min="0" placeholder="例如 1.5"
          value={log.duration} onChange={e => onChange({ ...log, duration: e.target.value })} />
      </div>
      <div className="form-group">
        <label>作品 / 产出（可选）</label>
        <textarea rows={3}
          placeholder={log.subtype === 'AI coding' ? '今天做了什么，比如：完成了登录页面的布局' : '今天画了什么，比如：临摹了一张人物速写'}
          value={log.work} onChange={e => onChange({ ...log, work: e.target.value })} />
      </div>
    </>
  )
}

// ---- 积累表单 ----
function AccumulateForm({ log, onChange }) {
  const titleLabel = log.subtype === '书籍' ? '书名' : log.subtype === '电影' ? '电影名' : '纪录片名'
  return (
    <>
      <div className="form-group">
        <label>类型</label>
        <SubtypeSelector typeId="accumulate" value={log.subtype} onChange={s => onChange({ ...log, subtype: s })} />
      </div>
      <div className="form-group">
        <label>{titleLabel}</label>
        <input type="text" placeholder="名称"
          value={log.title} onChange={e => onChange({ ...log, title: e.target.value })} />
      </div>
      <div className="form-group">
        <label>投入时长（小时）</label>
        <input type="number" step="0.5" min="0" placeholder="例如 1"
          value={log.duration} onChange={e => onChange({ ...log, duration: e.target.value })} />
      </div>
      <div className="form-group">
        <label>个人思考</label>
        <textarea rows={4} placeholder="有什么感悟、收获或想法？"
          value={log.thought} onChange={e => onChange({ ...log, thought: e.target.value })} />
      </div>
    </>
  )
}

// ---- 健康表单 ----
function HealthForm({ log, onChange }) {
  return (
    <>
      <div className="form-group">
        <label>类型</label>
        <SubtypeSelector typeId="health" value={log.subtype} onChange={s => onChange({ ...log, subtype: s })} />
      </div>
      {log.subtype === '饮食' ? (
        <div className="form-group">
          <label>今日饮食记录</label>
          <textarea rows={3} placeholder={'早餐：燕麦 + 鸡蛋\n午餐：沙拉\n晚餐：...'}
            value={log.food} onChange={e => onChange({ ...log, food: e.target.value })} />
        </div>
      ) : (
        <>
          <div className="form-group">
            <label>运动项目</label>
            <input type="text" placeholder="例如：深蹲 60kg × 5组，跑步 5km"
              value={log.exercise} onChange={e => onChange({ ...log, exercise: e.target.value })} />
          </div>
          <div className="form-group">
            <label>备注（可选）</label>
            <textarea rows={2} placeholder="身体状态、感受等"
              value={log.note} onChange={e => onChange({ ...log, note: e.target.value })} />
          </div>
        </>
      )}
    </>
  )
}

// ---- 记录摘要 ----
function LogSummary({ log }) {
  if (log.type === 'skill')
    return <>{log.subtype} · {log.duration || 0}h{log.work ? <div className="day-log-detail">{log.work}</div> : null}</>
  if (log.type === 'accumulate')
    return <>{log.subtype} · {log.title}{log.duration ? ` · ${log.duration}h` : ''}{log.thought ? <div className="day-log-detail">{log.thought}</div> : null}</>
  if (log.type === 'health' && log.subtype === '饮食')
    return <>饮食{log.food ? <div className="day-log-detail">{log.food}</div> : null}</>
  if (log.type === 'health' && log.subtype === '运动')
    return <>运动 · {log.exercise}{log.note ? <div className="day-log-detail">{log.note}</div> : null}</>
  return null
}

// ---- 主弹窗组件 ----
export default function DayModal({ dateStr, onClose, onSaved }) {
  const [logs, setLogs] = useState(() => getDayLogs(dateStr))
  const [adding, setAdding] = useState(null)
  const [editingId, setEditingId] = useState(null)

  function refresh() {
    setLogs(getDayLogs(dateStr))
    onSaved?.()
  }

  function startAdd(type) { setAdding(emptyLog(type)); setEditingId(null) }
  function startEdit(log) { setAdding({ ...log }); setEditingId(log.id) }
  function cancelForm()   { setAdding(null); setEditingId(null) }

  function handleSave() {
    if (!adding) return
    if (adding.type === 'skill' && !adding.duration) return alert('请填写投入时长')
    if (adding.type === 'accumulate' && !adding.title) return alert('请填写名称')
    if (adding.type === 'health' && adding.subtype === '饮食' && !adding.food) return alert('请填写饮食记录')
    if (adding.type === 'health' && adding.subtype === '运动' && !adding.exercise) return alert('请填写运动项目')
    saveLog(dateStr, adding)
    refresh(); cancelForm()
  }

  function handleDelete(logId) {
    if (!confirm('确认删除？')) return
    deleteLog(dateStr, logId); refresh()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box day-modal" onClick={e => e.stopPropagation()}>

        {/* 标题栏 */}
        <div className="day-modal-header">
          <div>
            <div className="day-modal-date">{formatDate(dateStr)}</div>
            <div className="day-modal-weekday">{getWeekday(dateStr)}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* 已有记录 */}
        {!adding && logs.length > 0 && (
          <div className="day-logs">
            {logs.map(log => {
              const t = TYPES[log.type]
              return (
                <div key={log.id} className="day-log-item"
                  style={{ borderLeftColor: t.color, background: t.lightColor }}>
                  <div className="day-log-meta">
                    <span className="day-log-type" style={{ color: t.color }}>{t.emoji} {t.label}</span>
                    <div className="day-log-actions">
                      <button className="btn-icon" onClick={() => startEdit(log)}>✏️</button>
                      <button className="btn-icon" onClick={() => handleDelete(log.id)}>🗑️</button>
                    </div>
                  </div>
                  <div className="day-log-summary"><LogSummary log={log} /></div>
                </div>
              )
            })}
          </div>
        )}

        {/* 表单 */}
        {adding ? (
          <div className="add-form">
            <div className="add-form-title" style={{ color: TYPES[adding.type].color }}>
              {TYPES[adding.type].emoji} {editingId ? '编辑' : '新增'}{TYPES[adding.type].label}记录
            </div>
            {adding.type === 'skill'      && <SkillForm      log={adding} onChange={setAdding} />}
            {adding.type === 'accumulate' && <AccumulateForm log={adding} onChange={setAdding} />}
            {adding.type === 'health'     && <HealthForm     log={adding} onChange={setAdding} />}
            <div className="modal-footer">
              <button className="btn-secondary" onClick={cancelForm}>取消</button>
              <button className="btn-primary" style={{ background: TYPES[adding.type].color }} onClick={handleSave}>保存</button>
            </div>
          </div>
        ) : (
          /* 添加按钮 */
          <div className="add-type-btns">
            <div className="add-type-label">+ 添加记录</div>
            <div className="add-type-row">
              {Object.values(TYPES).map(t => (
                <button key={t.id} className="add-type-btn"
                  style={{ '--type-color': t.color, '--type-light': t.lightColor }}
                  onClick={() => startAdd(t.id)}>
                  <span className="add-type-emoji">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
