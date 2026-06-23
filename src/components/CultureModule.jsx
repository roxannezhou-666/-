import { useState } from 'react'
import { getCultureLogs, saveCultureLog, deleteCultureLog, genId, todayStr } from '../data'

const emptyLog = () => ({ id: genId(), date: todayStr(), type: 'book', title: '', duration: '', review: '' })

export default function CultureModule() {
  const [logs, setLogs] = useState(getCultureLogs)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  function refresh() { setLogs(getCultureLogs()) }

  function openNew() { setEditing(emptyLog()); setShowForm(true) }
  function openEdit(log) { setEditing({ ...log }); setShowForm(true) }

  function handleSave() {
    if (!editing.title.trim()) return alert('请填写书名或电影名')
    if (!editing.review.trim()) return alert('请写一点心得')
    saveCultureLog(editing)
    refresh(); setShowForm(false); setEditing(null)
  }

  function handleDelete(id) {
    if (!confirm('确认删除？')) return
    deleteCultureLog(id); refresh()
  }

  return (
    <div className="module">
      <div className="module-header">
        <div className="module-title">📚 书籍 / 🎬 电影</div>
        <button className="btn-add" onClick={openNew}>+ 记录</button>
      </div>

      <div className="culture-hint">每周二选一：阅读 ≥ 2小时 或 看完 1 部电影</div>

      {logs.length === 0 ? (
        <div className="empty-state">还没有记录，本周看了什么？</div>
      ) : (
        <div className="log-list">
          {logs.map(log => (
            <div key={log.id} className="log-card">
              <div className="log-card-header">
                <div className="culture-meta">
                  <span className="culture-type-badge">{log.type === 'book' ? '📚 书' : '🎬 电影'}</span>
                  <span className="culture-title">{log.title}</span>
                  {log.duration && <span className="culture-duration">{log.duration}小时</span>}
                </div>
                <div className="log-actions">
                  <button className="btn-icon" onClick={() => openEdit(log)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleDelete(log.id)}>🗑️</button>
                </div>
              </div>
              <div className="log-date">{log.date}</div>
              <div className="log-content">{log.review}</div>
            </div>
          ))}
        </div>
      )}

      {showForm && editing && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">记录书籍 / 电影</div>

            <div className="form-group">
              <label>类型</label>
              <div className="type-toggle">
                <button
                  className={`type-btn ${editing.type === 'book' ? 'active' : ''}`}
                  onClick={() => setEditing(p => ({ ...p, type: 'book' }))}>📚 书籍</button>
                <button
                  className={`type-btn ${editing.type === 'movie' ? 'active' : ''}`}
                  onClick={() => setEditing(p => ({ ...p, type: 'movie' }))}>🎬 电影</button>
              </div>
            </div>

            <div className="form-group">
              <label>{editing.type === 'book' ? '书名' : '电影名'}</label>
              <input type="text"
                placeholder={editing.type === 'book' ? '书名' : '电影名'}
                value={editing.title}
                onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} />
            </div>

            {editing.type === 'book' && (
              <div className="form-group">
                <label>阅读时长（小时）</label>
                <input type="number" placeholder="本次阅读了多少小时" step="0.5"
                  value={editing.duration}
                  onChange={e => setEditing(p => ({ ...p, duration: e.target.value }))} />
              </div>
            )}

            <div className="form-group">
              <label>日期</label>
              <input type="date" value={editing.date}
                onChange={e => setEditing(p => ({ ...p, date: e.target.value }))} />
            </div>

            <div className="form-group">
              <label>心得</label>
              <textarea rows={4}
                placeholder={editing.type === 'book' ? '读了什么章节？有什么收获？' : '这部电影怎么样？印象最深的是什么？'}
                value={editing.review}
                onChange={e => setEditing(p => ({ ...p, review: e.target.value }))} />
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn-primary" onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
