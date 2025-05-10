"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, RefreshCw, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

// エラーの種類
type ErrorType = "parse_error" | "missing_data" | "invalid_format" | "system_error" | "timeout"

// エラーレポートの型定義
type ErrorReport = {
  id: string
  fileName: string
  uploadDate: string
  errorType: ErrorType
  errorMessage: string
  status: "pending" | "resolved" | "processing"
  processingProgress?: number
}

// エラータイプの表示名
const errorTypeLabels: Record<ErrorType, string> = {
  parse_error: "解析エラー",
  missing_data: "データ欠損",
  invalid_format: "無効なフォーマット",
  system_error: "システムエラー",
  timeout: "タイムアウト",
}

// ダミーデータ
const dummyErrors: ErrorReport[] = [
  {
    id: "ERR-001",
    fileName: "受付台帳_2023年6月.pdf",
    uploadDate: "2023-06-15",
    errorType: "parse_error",
    errorMessage: "PDFの解析に失敗しました。ファイルが破損している可能性があります。",
    status: "pending",
  },
  {
    id: "ERR-002",
    fileName: "受付台帳_2023年5月.pdf",
    uploadDate: "2023-06-10",
    errorType: "missing_data",
    errorMessage: "必要なデータが見つかりません。ページ3に情報が欠落しています。",
    status: "resolved",
  },
  {
    id: "ERR-003",
    fileName: "受付台帳_2023年4月.pdf",
    uploadDate: "2023-06-05",
    errorType: "invalid_format",
    errorMessage: "無効なフォーマットです。正しい受付台帳のフォーマットを使用してください。",
    status: "pending",
  },
  {
    id: "ERR-004",
    fileName: "受付台帳_2023年3月.pdf",
    uploadDate: "2023-06-01",
    errorType: "system_error",
    errorMessage: "システムエラーが発生しました。管理者に連絡してください。",
    status: "pending",
  },
  {
    id: "ERR-005",
    fileName: "受付台帳_2023年2月.pdf",
    uploadDate: "2023-05-20",
    errorType: "timeout",
    errorMessage: "処理がタイムアウトしました。ファイルサイズが大きすぎる可能性があります。",
    status: "pending",
  },
]

export default function ErrorReportList() {
  const [errors, setErrors] = useState<ErrorReport[]>(dummyErrors)
  const { toast } = useToast()

  // エラー解決
  const resolveError = (id: string) => {
    setErrors(errors.map((error) => (error.id === id ? { ...error, status: "resolved" } : error)))

    toast({
      title: "エラーを解決済みにしました",
      description: `ID: ${id} のエラーを解決済みとしてマークしました`,
    })
  }

  // エラー再処理
  const reprocessError = (id: string) => {
    // 処理中に変更
    setErrors(
      errors.map((error) => (error.id === id ? { ...error, status: "processing", processingProgress: 0 } : error)),
    )

    toast({
      title: "再処理を開始しました",
      description: `ID: ${id} のファイルを再処理しています`,
    })

    // 進捗をシミュレート
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5

      if (progress >= 100) {
        clearInterval(interval)
        progress = 100

        // 50%の確率で成功、50%の確率で失敗
        const success = Math.random() > 0.5

        setErrors(
          errors.map((error) =>
            error.id === id
              ? {
                  ...error,
                  status: success ? "resolved" : "pending",
                  processingProgress: undefined,
                  errorMessage: success ? "再処理に成功しました。データが正常に抽出されました。" : error.errorMessage,
                }
              : error,
          ),
        )

        toast({
          title: success ? "再処理が完了しました" : "再処理に失敗しました",
          description: success
            ? `ID: ${id} のファイルの再処理に成功しました`
            : `ID: ${id} のファイルの再処理に失敗しました。別の方法を試してください。`,
          variant: success ? "default" : "destructive",
        })
      } else {
        setErrors(errors.map((error) => (error.id === id ? { ...error, processingProgress: progress } : error)))
      }
    }, 500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>エラーレポート</CardTitle>
        <CardDescription>登記簿情報取得中に発生したエラーの一覧</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>ファイル名</TableHead>
                <TableHead>アップロード日</TableHead>
                <TableHead>エラータイプ</TableHead>
                <TableHead>エラーメッセージ</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    エラーレポートがありません
                  </TableCell>
                </TableRow>
              ) : (
                errors.map((error) => (
                  <TableRow key={error.id}>
                    <TableCell className="font-medium">{error.id}</TableCell>
                    <TableCell>{error.fileName}</TableCell>
                    <TableCell>{error.uploadDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{errorTypeLabels[error.errorType]}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <span className="text-sm">{error.errorMessage}</span>
                      </div>

                      {error.status === "processing" && error.processingProgress !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">処理中...</span>
                            <span className="text-xs font-medium">{error.processingProgress}%</span>
                          </div>
                          <Progress value={error.processingProgress} className="h-2 w-full" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {error.status === "pending" ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>未解決</span>
                        </Badge>
                      ) : error.status === "resolved" ? (
                        <Badge variant="success" className="flex items-center gap-1 bg-green-500">
                          <CheckCircle className="h-3 w-3" />
                          <span>解決済み</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3 animate-spin" />
                          <span>処理中</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {error.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => reprocessError(error.id)}>
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            再実行
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => resolveError(error.id)}>
                            解決済みにする
                          </Button>
                        </div>
                      ) : error.status === "processing" ? (
                        <Button variant="outline" size="sm" disabled>
                          <Clock className="h-3.5 w-3.5 mr-1 animate-spin" />
                          処理中...
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-green-600" disabled>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          解決済み
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
