import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

const pageTitles: Record<string, string> = {
  '/': 'דשבורד',
  '/clients': 'לקוחות',
  '/calendar': 'לוח תוכן',
  '/content': 'תוכן',
  '/reports': 'דוחות',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = {
    name: session.name,
    email: session.email,
    role: session.role,
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar user={user} />
      <div className="flex-1 mr-60 flex flex-col min-h-screen">
        <Header title="Social CMS" user={user} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
