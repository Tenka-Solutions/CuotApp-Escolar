export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <span className="text-xl font-bold text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white">CuotApp</h1>
          <p className="mt-1 text-sm text-white/60">Gestión escolar transparente</p>
        </div>
        {children}
      </div>
    </div>
  )
}
