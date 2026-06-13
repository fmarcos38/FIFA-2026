import { useState } from 'react'
import { loginAdmin } from '../../services/api'
import './styles.css'

function LoginPanel({ open, onClose, onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [status, setStatus] = useState({ type: 'idle', text: '' })

  if (!open) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ type: 'loading', text: 'Validando acceso...' })

    try {
      const data = await loginAdmin(form)
      onLogin(data.token)
      onClose()
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'No se pudo conectar con el back' })
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="login-panel" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">
          x
        </button>
        <span className="eyebrow">Admin local</span>
        <h2>Ingresar al modo edicion</h2>
        <label>
          Usuario
          <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
        </label>
        <label>
          Clave
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
        <button className="primary-action login-submit" type="submit">
          Entrar
        </button>
        {status.text && <p className={`login-status ${status.type}`}>{status.text}</p>}
      </form>
    </div>
  )
}

export default LoginPanel
