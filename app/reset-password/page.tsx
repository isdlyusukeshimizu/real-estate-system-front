"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ThemeProvider } from "@/components/theme-provider"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "メールアドレスを入力してください",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // 実際のアプリケーションではAPIリクエストを送信
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)

      toast({
        title: "パスワードリセットメールを送信しました",
        description: "メールに記載されたリンクからパスワードをリセットしてください",
      })
    }, 1500)
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="flex items-center justify-center min-h-screen bg-[#F5F9F7]">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">登記簿情報取得システム</h1>
            <p className="text-muted-foreground mt-2">パスワードをリセットします</p>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">パスワードリセット</CardTitle>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    登録したメールアドレスを入力してください。パスワードリセット用のリンクをメールで送信します。
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        メールアドレス
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="登録したメールアドレスを入力"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "送信中..." : "リセットリンクを送信"}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 p-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium">メールを送信しました</h3>
                  <p className="text-sm text-muted-foreground">
                    {email} 宛にパスワードリセット用のリンクを送信しました。
                    メールに記載されたリンクをクリックして、パスワードをリセットしてください。
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    メールが届かない場合は、迷惑メールフォルダをご確認いただくか、
                    <br />
                    別のメールアドレスで再度お試しください。
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Link href="/login" className="flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4" />
                ログイン画面に戻る
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  )
}
