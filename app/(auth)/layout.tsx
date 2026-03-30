export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-brand-50 px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo / branding */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-3">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-900">CuotApp</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión escolar transparente</p>
        </div>
        {children}
      </div>
    </div>
  )
}
