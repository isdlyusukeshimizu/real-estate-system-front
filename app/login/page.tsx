"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ThemeProvider } from "@/components/theme-provider"
import { Lock, User, Building, UserCircle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ユーザータイプの定義
type UserType = "member" | "owner"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [userType, setUserType] = useState<UserType>("member")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // 簡易的な検証
    if (!username || !password) {
      setError("ユーザー名とパスワードを入力してください")
      return
    }

    // ダミーログイン - どんなIDとパスワードでもログイン可能に
    // ユーザータイプに応じてセッションストレージにユーザー情報を保存
    sessionStorage.setItem("userType", userType)
    sessionStorage.setItem("username", username)

    // ユーザータイプに応じて遷移先を変更
    if (userType === "member") {
      router.push("/dashboard") // メンバーはダッシュボードへ
    } else {
      router.push("/dashboard/members") // オーナーはメンバー管理へ
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="flex items-center justify-center min-h-screen bg-[#F5F9F7]">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">登記簿情報取得システム</h1>
            <p className="text-muted-foreground mt-2">ログインして登記簿情報を管理しましょう</p>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">ログイン</CardTitle>
            </CardHeader>
            <CardContent>
              {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>}

              <Tabs value={userType} onValueChange={(value) => setUserType(value as UserType)} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="member" className="flex items-center">
                    <UserCircle className="mr-2 h-4 w-4" />
                    メンバー
                  </TabsTrigger>
                  <TabsTrigger value="owner" className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    オーナー
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    ユーザー名
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="ユーザー名を入力"
                      className="pl-10"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">
                      パスワード
                    </label>
                    <Link href="/reset-password" className="text-sm text-primary hover:underline">
                      パスワードを忘れた場合
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="パスワードを入力"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {userType === "member" ? "メンバーとしてログイン" : "オーナーとしてログイン"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">どんなIDとパスワードでもログイン可能です</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <p className="text-sm text-muted-foreground mr-2">アカウントをお持ちでない方は</p>
              <Link href="/register" className="text-sm text-primary hover:underline">
                新規登録
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  )
}
