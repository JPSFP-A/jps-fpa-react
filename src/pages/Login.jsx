import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const JPS_LOGO = 'https://rvtaryvxiryfmurudjcx.supabase.co/storage/v1/object/public/Model/JPS-Logo-2022-Outline-No-Tag-2.png'
const WELCOME_BG = 'https://rvtaryvxiryfmurudjcx.supabase.co/storage/v1/object/public/Model/Welcome.jpg'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [dest,     setDest]     = useState('platform') // 'platform' | 'flash'

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const inputCls = `
    w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none transition-all
    bg-white/[0.08] border-white/[0.18] text-white placeholder-white/30
    focus:border-[#00aeef] focus:bg-[#00aeef]/[0.08]
  `

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden"
         style={{ background: 'linear-gradient(135deg,#001428 0%,#003da5 50%,#001428 100%)' }}>

      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${WELCOME_BG}')`,
          filter: 'brightness(0.35) saturate(0.8)',
        }}
      />

      {/* Blue overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg,rgba(0,10,30,.82) 0%,rgba(0,61,165,.35) 100%)' }}
      />

      {/* "Powering What Matters" top-right */}
      <div className="absolute top-4 right-6 z-10 text-[11px] font-bold tracking-wide"
           style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
        P<span style={{ color: '#00aeef' }}>●</span>wering What Matters
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-[420px] max-w-[92vw] rounded-2xl p-10"
        style={{
          background: '#0d1e3a',
          border: '1px solid rgba(0,174,239,0.25)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          animation: 'wsSlideIn 0.55s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <style>{`
          @keyframes wsSlideIn {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: none; }
          }
        `}</style>

        {/* Logo row */}
        <div className="flex items-center justify-center gap-3.5 mb-7">
          <img src={JPS_LOGO} alt="JPS" className="h-11" onError={e => { e.target.style.display='none' }} />
          <div style={{ width: 1, height: 42, background: 'rgba(255,255,255,0.35)' }} />
          <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            <div className="text-[22px] font-bold text-white tracking-tight leading-tight">FP&amp;A Cloud</div>
            <div className="text-[11px] font-normal uppercase tracking-widest mt-0.5"
                 style={{ color: 'rgba(255,255,255,0.55)' }}>
              Jamaica Public Service Co.
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div
          className="text-center text-[11px] uppercase tracking-[0.07em] mb-7 pt-4"
          style={{
            color: 'rgba(255,255,255,0.45)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'IBM Plex Sans, sans-serif',
          }}
        >
          Financial Planning &amp; Analysis Platform · v31.0
        </div>

        {/* Destination buttons */}
        <div className="flex gap-2 mb-5">
          {[
            { key: 'platform', icon: '📊', label: 'Full Platform' },
            { key: 'flash',    icon: '⚡', label: 'Flash Report' },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setDest(key)}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.04em] cursor-pointer transition-all border"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                background:     dest === key ? 'rgba(0,61,165,0.55)'   : 'rgba(255,255,255,0.06)',
                borderColor:    dest === key ? '#00aeef'                : 'rgba(255,255,255,0.18)',
                color:          dest === key ? '#fff'                   : 'rgba(255,255,255,0.55)',
                boxShadow:      dest === key ? '0 0 12px rgba(0,174,239,0.2)' : 'none',
              }}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Email */}
        <div className="mb-3.5">
          <label className="block text-[10px] font-bold uppercase tracking-[0.07em] mb-1.5"
                 style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('loginPwd')?.focus()}
            placeholder="you@jps.com.jm"
            autoComplete="email"
            className={inputCls}
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-[10px] font-bold uppercase tracking-[0.07em] mb-1.5"
                 style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Password
          </label>
          <input
            id="loginPwd"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="••••••••"
            autoComplete="current-password"
            className={inputCls}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-[13px] font-bold tracking-[0.05em] cursor-pointer transition-all disabled:opacity-60"
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            background: 'linear-gradient(135deg, #003da5, #00aeef)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,174,239,0.3)',
          }}
        >
          {loading ? 'Entering…' : 'Enter Platform →'}
        </button>

        {/* Error */}
        {error && (
          <div className="text-center text-[11px] font-semibold mt-3" style={{ color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-5 text-[9px] uppercase tracking-[0.05em]"
             style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          CONFIDENTIAL · Internal Use Only · JPS Finance &amp; Strategy
        </div>
      </div>
    </div>
  )
}
