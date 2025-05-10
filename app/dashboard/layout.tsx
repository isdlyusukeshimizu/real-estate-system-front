"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Users,
  FileText,
  AlertTriangle,
  LogOut,
  Menu,
  Upload,
  UserCircle,
  Building,
  LayoutDashboard,
} from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"

// ユーザータイプの定義
type UserType = "member" | "owner"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userType, setUserType] = useState<UserType>("member")
  const [username, setUsername] = useState<string>("")
  const router = useRouter()
  const pathname = usePathname()

  // コンポーネントがマウントされたときにセッションストレージからユーザー情報を取得
  useEffect(() => {
    const storedUserType = sessionStorage.getItem("userType") as UserType
    const storedUsername = sessionStorage.getItem("username")

    if (storedUserType) {
      setUserType(storedUserType)
    }

    if (storedUsername) {
      setUsername(storedUsername)
    } else if (typeof window !== "undefined") {
      // ユーザー情報がない場合はログインページにリダイレクト
      // pathname が /login でない場合のみリダイレクト
      if (!window.location.pathname.includes("/login")) {
        router.push("/login")
      }
    }
  }, [router])

  // ユーザータイプに応じたアクセス制限
  useEffect(() => {
    if (userType && pathname) {
      // メンバー専用ページへのアクセス制限（オーナーはすべてのページにアクセス可能）
      if (userType === "member" && (pathname.includes("/members") || pathname.includes("/billing"))) {
        router.push("/dashboard")
      }

      // チュートリアルページへのアクセスを制限
      if (pathname.includes("/tutorials")) {
        if (userType === "member") {
          router.push("/dashboard")
        } else {
          router.push("/dashboard/members")
        }
      }
    }
  }, [userType, pathname, router])

  const handleLogout = () => {
    // セッションストレージをクリア
    sessionStorage.removeItem("userType")
    sessionStorage.removeItem("username")
    // ログアウト処理を実装
    router.push("/login")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // ユーザータイプに応じてナビゲーションアイテムを変更
  const memberNavItems = [
    { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
    { href: "/dashboard/customers", label: "顧客情報管理", icon: UserCircle },
    { href: "/dashboard/upload", label: "登記簿情報アップロード", icon: Upload },
    { href: "/dashboard/error-report", label: "エラーレポート", icon: AlertTriangle },
  ]

  const ownerNavItems = [
    { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
    { href: "/dashboard/customers", label: "顧客情報管理", icon: UserCircle },
    { href: "/dashboard/upload", label: "登記簿情報アップロード", icon: Upload },
    { href: "/dashboard/members", label: "メンバー管理", icon: Users },
    { href: "/dashboard/billing", label: "請求管理", icon: FileText },
  ]

  const navItems = userType === "owner" ? ownerNavItems : memberNavItems

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        {/* モバイルヘッダー */}
        <div className="md:hidden bg-primary text-white p-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold">登記簿情報取得システム</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white">
              <LogOut size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white">
              <Menu size={24} />
            </Button>
          </div>
        </div>

        {/* サイドバー */}
        <aside
          className={`fixed md:static inset-0 z-20 bg-primary w-64 min-h-0 md:min-h-screen p-4 
                     ${isSidebarOpen ? "block" : "hidden"} md:block text-white
                     transition-all duration-300 ease-in-out relative`}
        >
          <div className="hidden md:block mb-6">
            <h1 className="text-xl font-bold">登記簿情報取得システム</h1>
          </div>

          {/* ユーザー情報 */}
          <div className="mb-6 p-3 bg-primary-foreground/10 rounded-lg">
            <div className="flex items-center gap-2">
              {userType === "owner" ? <Building className="h-5 w-5" /> : <UserCircle className="h-5 w-5" />}
              <div>
                <p className="font-medium">{username || "ユーザー"}</p>
                <p className="text-xs opacity-70">{userType === "owner" ? "オーナー" : "メンバー"}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col h-[calc(100%-80px)]">
            <ul className="space-y-2 flex-grow">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-2 p-2 rounded
                                ${
                                  isActive
                                    ? "bg-[#00604F] text-white"
                                    : "hover:bg-[#00604F] text-white/80 hover:text-white"
                                }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* ログアウトボタン - サイドバーの幅に合わせる */}
            <div className="mt-auto">
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-start p-2 text-white/80 hover:text-white hover:bg-[#00604F] rounded"
              >
                <LogOut size={20} className="mr-2" />
                <span>ログアウト</span>
              </Button>
            </div>
          </nav>
        </aside>

        {/* オーバーレイ */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-10 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm z-10 hidden md:block">
            <div className="py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-lg font-semibold">
                {userType === "owner" ? "オーナーダッシュボード" : "メンバーダッシュボード"}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {userType === "owner" ? "オーナー" : "メンバー"}としてログイン中
                  </span>
                  <span className="font-medium">{username}</span>
                </div>
                {/* ヘッダーにログアウトボタンを追加 */}
                <Button onClick={handleLogout} variant="outline" size="sm" className="flex items-center gap-1">
                  <LogOut size={16} />
                  <span>ログアウト</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F9F7]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
