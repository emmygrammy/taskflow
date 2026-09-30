import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

type Task = { id: number; text: string; done: boolean; createdAt: number }
type Filter = 'all' | 'active' | 'completed'

const starterTasks: Task[] = [
  { id: 1, text: 'Plan my week', done: false, createdAt: 1 },
  { id: 2, text: 'Take a proper lunch break', done: false, createdAt: 2 },
  { id: 3, text: 'Tidy up my workspace', done: true, createdAt: 3 },
]

function readTasks(): Task[] {
  try {
    const saved = localStorage.getItem('little-list-tasks')
    return saved ? JSON.parse(saved) as Task[] : starterTasks
  } catch {
    return starterTasks
  }
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(readTasks)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => localStorage.setItem('little-list-tasks', JSON.stringify(tasks)), [tasks])

  const visibleTasks = useMemo(() => tasks.filter(task => filter === 'all' || (filter === 'active' ? !task.done : task.done)), [tasks, filter])
  const remaining = tasks.filter(task => !task.done).length

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setTasks(current => [{ id: Date.now(), text: trimmed, done: false, createdAt: Date.now() }, ...current])
    setText('')
  }

  function saveEdit(id: number) {
    const trimmed = editText.trim()
    if (trimmed) setTasks(current => current.map(task => task.id === id ? { ...task, text: trimmed } : task))
    setEditingId(null)
  }

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <header className="mb-9 flex items-center justify-between">
          <a className="brand" href="#" aria-label="Little List home"><span className="brand-mark">✳</span> little list</a>
          <span className="date-label">A LITTLE SPACE TO THINK</span>
        </header>

        <section className="paper-card overflow-hidden rounded-3xl">
          <div className="px-6 pb-7 pt-8 sm:px-10 sm:pb-9 sm:pt-10">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">YOUR DAY, AT YOUR PACE</p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Make room for <span>what matters.</span></h1>
              </div>
              <div className="progress-badge" aria-label={`${remaining} tasks remaining`}><strong>{remaining}</strong><small>LEFT</small></div>
            </div>

            <form onSubmit={addTask} className="add-form flex items-center gap-2 rounded-2xl p-2">
              <span className="add-plus" aria-hidden="true">＋</span>
              <input value={text} onChange={event => setText(event.target.value)} placeholder="Add something to your list..." aria-label="New task" />
              <button className="add-button" type="submit" disabled={!text.trim()}>Add task <span aria-hidden="true">↗</span></button>
            </form>

            <div className="mt-8 flex items-center justify-between gap-3">
              <div className="filter-tabs" role="tablist" aria-label="Filter tasks">
                {(['all', 'active', 'completed'] as Filter[]).map(option => <button key={option} role="tab" aria-selected={filter === option} className={filter === option ? 'filter-tab selected' : 'filter-tab'} onClick={() => setFilter(option)}>{option[0].toUpperCase() + option.slice(1)}</button>)}
              </div>
              <span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
            </div>

            <div className="task-list mt-4">
              {visibleTasks.length ? visibleTasks.map((task, index) => (
                <div className={`task-row ${task.done ? 'is-done' : ''}`} key={task.id} style={{ animationDelay: `${index * 45}ms` }}>
                  <button className="check-button" type="button" onClick={() => setTasks(current => current.map(item => item.id === task.id ? { ...item, done: !item.done } : item))} aria-label={task.done ? `Mark ${task.text} as not done` : `Mark ${task.text} as done`}>{task.done && <span>✓</span>}</button>
                  {editingId === task.id ? <input className="edit-input" value={editText} autoFocus aria-label="Edit task" onChange={event => setEditText(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') saveEdit(task.id); if (event.key === 'Escape') setEditingId(null) }} /> : <span className="task-text">{task.text}</span>}
                  <div className="task-actions">
                    {editingId === task.id ? <button className="icon-button save-action" onClick={() => saveEdit(task.id)} aria-label="Save task">Save</button> : <button className="icon-button" onClick={() => { setEditingId(task.id); setEditText(task.text) }} aria-label={`Edit ${task.text}`} title="Edit task"><EditIcon /></button>}
                    <button className="icon-button delete-action" onClick={() => setTasks(current => current.filter(item => item.id !== task.id))} aria-label={`Delete ${task.text}`} title="Delete task"><TrashIcon /></button>
                  </div>
                </div>
              )) : <div className="empty-state"><span className="empty-sparkle">✳</span><p>{filter === 'all' ? 'Your list is clear.' : `No ${filter} tasks right now.`}</p><small>{filter === 'all' ? 'Add a little task whenever you’re ready.' : 'Try another view or add something new.'}</small></div>}
            </div>
          </div>
          <footer className="card-footer flex flex-wrap items-center justify-between gap-2 px-6 py-4 sm:px-10"><span>One thing at a time is plenty.</span><button onClick={() => setTasks(current => current.filter(task => !task.done))} disabled={!tasks.some(task => task.done)}>Clear completed</button></footer>
        </section>
        <p className="page-note">A softer way to get things done <span>✿</span></p>
      </div>
    </main>
  )
}

function EditIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" /></svg> }
function TrashIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg> }

createRoot(document.getElementById('app')!).render(<React.StrictMode><App /></React.StrictMode>)
