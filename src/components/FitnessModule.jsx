import { useState } from 'react'
import { getFitnessLogs, saveFitnessLog, deleteFitnessLog, genId, todayStr } from '../data'

const emptyItem = () => ({ id: genId(), name: '', weight: '', unit: 'kg', reps: '' })
const emptyLog = () => ({ id: genId(), date: todayStr(), items: [emptyItem()] })

export default function FitnessModule() {
  const [logs, setLogs] = useState(getFitnessLogs)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  function refresh() { setLogs(getFitnessLogs()) }

  function openNew() { setEditing(emptyLog()); setShowForm(true) }
  function openEdit(log) { setEditing(JSON.parse(JSON.stringify(log))); setShowForm(true) }

  function handleSave() {
    const validItems = editing.items.filter(i => i.name.trim())
    if (!validItems.length) return alert('请至少填写一个训练项目')
    saveFitnessLog({ ...editing, items: validItems })
    refresh(); setShowForm(false); setEditing(null)
  }

  function handleDelete(id) {
    if (!confirm('确认删除？')) return
    deleteFitnessLog(id); refresh()
  }

  function updateItem(itemId, field, value) {
    setEditing(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
    }))
  }

  return (
    <div className="module">
      <div className="module-header">
        <div className="module-title">💪 健身</div>
        <button className="btn-add" onClick={openNew}>+ 记录训练</button>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">还没有训练记录，开始第一次吧！</div>
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
              <div className="fitness-items">
                {log.items.map(item => (
                  <div key={item.id} className="fitness-item-tag">
                    <span className="item-name">{item.name}</span>
                    {item.weight && <span className="item-detail">{item.weight}{item.unit}</span>}
                    {item.reps && <span className="item-detail">{item.reps}次</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && editing && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">记录训练</div>
            <div className="form-group">
              <label>日期</label>
              <input type="date" value={editing.date}
                onChange={e => setEditing(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>训练项目</label>
              {editing.items.map(item => (
                <div key={item.id} className="fitness-item-row">
                  <input className="input-name" placeholder="项目（如深蹲）"
                    value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                  <input className="input-weight" placeholder="重量" type="number"
                    value={item.weight} onChange={e => updateItem(item.id, 'weight', e.target.value)} />
                  <select value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)}>
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                    <option value="-">无</option>
                  </select>
                  <input className="input-reps" placeholder="次数" type="number"
                    value={item.reps} onChange={e => updateItem(item.id, 'reps', e.target.value)} />
                  {editing.items.length > 1 && (
                    <button className="btn-remove"
                      onClick={() => setEditing(p => ({ ...p, items: p.items.filter(i => i.id !== item.id) }))}>×</button>
                  )}
                </div>
              ))}
              <button className="btn-text"
                onClick={() => setEditing(p => ({ ...p, items: [...p.items, emptyItem()] }))}>+ 添加项目</button>
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
