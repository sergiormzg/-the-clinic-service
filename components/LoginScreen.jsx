import React, { useState } from 'react'
import { iniciarSesion } from '../supabase'

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await iniciarSesion(email, password)
      onLogin?.(result)
    } catch (err) {
      setError(err?.message || 'No fue posible iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f172a',padding:'20px'}}>
      <form onSubmit={handleSubmit} style={{width:'100%',maxWidth:'420px',background:'#111827',padding:'32px',borderRadius:'18px',boxShadow:'0 10px 30px rgba(0,0,0,.35)',border:'1px solid #1f2937'}}>
        <div style={{textAlign:'center',marginBottom:'24px'}}>
          <h1 style={{color:'#22c55e',margin:0,fontSize:'28px'}}>THE CLINIC</h1>
          <p style={{color:'#9ca3af',marginTop:'8px'}}>Panel administrativo</p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <input
            type='email'
            placeholder='Correo electrónico'
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
            style={{padding:'14px',borderRadius:'12px',border:'1px solid #374151',background:'#1f2937',color:'white'}}
          />

          <input
            type='password'
            placeholder='Contraseña'
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
            style={{padding:'14px',borderRadius:'12px',border:'1px solid #374151',background:'#1f2937',color:'white'}}
          />

          {error ? (
            <div style={{background:'#7f1d1d',padding:'12px',borderRadius:'10px',color:'#fecaca',fontSize:'14px'}}>
              {error}
            </div>
          ) : null}

          <button
            type='submit'
            disabled={loading}
            style={{padding:'14px',borderRadius:'12px',border:'none',background:'#22c55e',color:'#052e16',fontWeight:'bold',cursor:'pointer'}}
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </div>
      </form>
    </div>
  )
}
