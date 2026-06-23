import { useState } from 'react'
import { getDrawingLogs, saveDrawingLog, deleteDrawingLog, genId, todayStr } from '../data'

const emptyLog = () => ({ id: genId(), date: todayStr(), content: '' })

export default function DrawingModule() {
  const [logs, setLogs] = useState(getDrawingLogs)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  function refresh() { setLogs(getDrawingLogs()) }

  function openNew() { setEditing(emptyLog()); setShowForm(true) }
  function openEdit(log) { setEditing({ ...log }); setShowForm(true) }

  function handleSave() {
    if (!editing.content.trim()) return alert('请填写今天画了什么')
    saveDrawingLog(editing)
    refresh(); setShowForm(false); setEditing(null)
  }

  function handleDelete(id) {
    if (!confirm('确认删除？')) return
    deleteDrawingLog(id); refresh()
  }

  return (
    <div className="module">
      <div className="module-header">
        <div className="module-title">🎨 绘画</div>
        <button className="btn-add" onClick={openNew}>+ 打卡</button>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">还没有绘画记录，今天画了什么？</div>
      ) : (
        <div className="log-list">
          {logs.map(log => (
            <div key={log.id} className="log-card">
              <div className="log-card-header">
                <span className="log-date">{log.date}</span>
                <div className="log-actions">
                  <button className="btn-icon" onClick={() => openEdit(log)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleDelete(log.id)}>🗑️</button>
                </div>
              </div>
              <div className="log-content">{log.content}</div>
            </div>
          ))}
        </div>
      )}

      {showForm && editing && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">绘画打卡</div>
            <div className="form-group">
              <label>日期</label>
              <input type="date" value={editing.date}
                onChange={e => setEditing(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>今天画了什么？</label>
              <textarea rows={4} placeholder="描述今天的绘画内容，比如：临摹了一张人物速写，练习了手部结构..."
                value={editing.content}
                onChange={e => setEditing(p => ({ ...p, content: e.target.value }))} />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn-primary" onClick={handleSave}>打卡</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
