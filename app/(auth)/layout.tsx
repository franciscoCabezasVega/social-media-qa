export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {children}
      </div>
    </div>
  )
}
