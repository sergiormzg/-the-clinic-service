import React from 'react'
import LoginScreen from './LoginScreen.jsx'
import { obtenerSesionActual, observarSesion } from '../supabase.js'

export default function AuthGate({ children }) {
  const [session, setSession] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true
    let subscription = null

    obtenerSesionActual()
      .then((currentSession) => {
        if (!active) return
        setSession(currentSession)
      })
      .catch(() => {
        if (!active) return
        setSession(null)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    const authListener = observarSesion((nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    subscription = authListener?.data?.subscription || authListener?.subscription || null

    return () => {
      active = false
      subscription?.unsubscribe?.()
    }
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#d1d5db', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
        Cargando acceso seguro...
      </div>
    )
  }

  if (!session) {
    return <LoginScreen onLogin={() => window.location.reload()} />
  }

  return children
}
