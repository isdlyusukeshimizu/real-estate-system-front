"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"

// 抽出データの型定義
type ExtractedData = {
  id: string
  extractedAt: string // 情報取得日
  customerName: string // 顧客名
  postalCode: string // 郵便番号
  prefecture: string // 都道府県
  currentAddress: string // 顧客現在住所
  inheritanceAddress: string // 顧客相続住所
  phoneNumber: string // 電話番号
  status: "pending" | "registered" | "error"
}

// グローバルな顧客データを保持するための変数（customer-management.tsxと共有）
declare global {
  interface Window {
    globalCustomers: any[]
  }
}

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([])
  const [editableData, setEditableData] = useState<ExtractedData[]>([])
  const { toast } = useToast()
  const router = useRouter()

  // ファイル選択
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)

    // ファイルが選択されたらリセット
    if (file) {
      setIsUploading(false)
      setUploadProgress(0)
      setProcessingProgress(0)
      setIsProcessing(false)
      setIsComplete(false)
      setEstimatedTime(null)
      setElapsedTime(0)
      setExtractedData([])
      setEditableData([])
    }
  }

  // アップロード処理
  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "ファイルが選択されていません",
        description: "アップロードするPDFファイルを選択してください",
        variant: "destructive",
      })
      return
    }

    // ファイルサイズに基づいて推定時間を計算（実際のアプリケーションではサーバーから返される）
    const fileSizeMB = selectedFile.size / (1024 * 1024)
    const estimatedSeconds = Math.max(20, Math.round(fileSizeMB * 5)) // 5秒/MB、最低20秒
    setEstimatedTime(estimatedSeconds)

    setIsUploading(true)
    setUploadProgress(0)

    // アップロード進捗のシミュレーション
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + Math.random() * 10
        if (next >= 100) {
          clearInterval(uploadInterval)

          // アップロード完了後、処理開始
          setIsUploading(false)
          setIsProcessing(true)
          setProcessingProgress(0)

          // 経過時間のカウント開始
          const timerInterval = setInterval(() => {
            setElapsedTime((prev) => prev + 1)
          }, 1000)

          // 処理進捗のシミュレーション
          const processInterval = setInterval(() => {
            setProcessingProgress((prev) => {
              // 処理は少しずつ遅くなる
              const increment = Math.max(1, 10 - Math.floor(prev / 10))
              const next = prev + increment * Math.random()

              if (next >= 100) {
                clearInterval(processInterval)
                clearInterval(timerInterval)

                // 処理完了
                setIsProcessing(false)
                setIsComplete(true)

                // ダミーデータを生成
                const dummyData = generateDummyExtractedData()
                setExtractedData(dummyData)
                setEditableData(dummyData)

                toast({
                  title: "処理が完了しました",
                  description: `${selectedFile.name} の処理が完了しました。抽出データを確認してください。`,
                })

                return 100
              }
              return next
            })
          }, 500)

          return 100
        }
        return next
      })
    }, 200)
  }

  // 残り時間の計算
  const getRemainingTime = () => {
    if (!estimatedTime || !isProcessing) return null

    const remainingSeconds = Math.max(0, estimatedTime - elapsedTime)

    if (remainingSeconds <= 0) return "もうすぐ完了します..."

    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60

    if (minutes > 0) {
      return `残り約 ${minutes}分${seconds > 0 ? ` ${seconds}秒` : ""}`
    }

    return `残り約 ${seconds}秒`
  }

  // リセット
  const handleReset = () => {
    setSelectedFile(null)
    setIsUploading(false)
    setUploadProgress(0)
    setProcessingProgress(0)
    setIsProcessing(false)
    setIsComplete(false)
    setEstimatedTime(null)
    setElapsedTime(0)
    setExtractedData([])
    setEditableData([])
  }

  // 編集可能なデータの更新
  const handleDataChange = (id: string, field: keyof ExtractedData, value: string) => {
    setEditableData(editableData.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  // 完了処理
  const handleComplete = () => {
    // 顧客情報管理ページに連携するためのデータ変換処理
    const customersToAdd = editableData.map((data) => ({
      id: `CUST-${data.id}`,
      name: data.customerName,
      phoneNumber: data.phoneNumber || "",
      email: "",
      address: data.currentAddress,
      postalCode: data.postalCode,
      propertyAddress: data.inheritanceAddress,
      propertyType: "その他",
      status: "new" as const,
      assignedTo: "",
      lastContactDate: new Date().toISOString().split("T")[0],
      nextContactDate: "",
      notes: `受付台帳から自動抽出 (${data.extractedAt})`,
      source: "受付台帳",
      activities: [],
    }))

    // グローバル変数に追加
    if (typeof window !== "undefined") {
      if (!window.globalCustomers) {
        window.globalCustomers = []
      }
      window.globalCustomers = [...customersToAdd, ...window.globalCustomers]
    }

    toast({
      title: "データを顧客情報に登録しました",
      description: `${editableData.length}件のデータが顧客情報管理に登録されました`,
    })

    // 顧客情報管理ページに遷移
    router.push("/dashboard/customers")
  }

  // ダミーデータ生成
  const generateDummyExtractedData = (): ExtractedData[] => {
    const prefectures = ["東京都", "神奈川県", "埼玉県", "千葉県", "大阪府", "京都府", "兵庫県", "愛知県"]

    return Array.from({ length: 5 }, (_, i) => {
      const prefecture = prefectures[Math.floor(Math.random() * prefectures.length)]
      return {
        id: `${Date.now()}-${i}`,
        extractedAt: new Date().toISOString().split("T")[0],
        customerName: `相続者 太郎${i + 1}`,
        postalCode: `${100 + Math.floor(Math.random() * 900)}-${1000 + Math.floor(Math.random() * 9000)}`,
        prefecture: prefecture,
        currentAddress: `${prefecture}${["新宿区", "渋谷区", "中央区", "港区"][i % 4]}${i + 1}-${i + 1}-${i + 1}`,
        inheritanceAddress: `${prefecture}${["品川区", "目黒区", "世田谷区", "杉並区"][i % 4]}${i + 1}-${i + 1}-${i + 1}`,
        phoneNumber: `03-${1234 + i}-${5678 + i}`,
        status: i % 5 === 0 ? "registered" : i % 4 === 0 ? "error" : "pending",
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>受付台帳アップロード</CardTitle>
          <CardDescription>PDFファイルをアップロードして登記簿情報を自動抽出します</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isUploading || isProcessing}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={!selectedFile || isUploading || isProcessing || isComplete}>
                  <Upload className="mr-2 h-4 w-4" />
                  アップロード
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={isUploading || isProcessing}>
                  リセット
                </Button>
              </div>
            </div>

            {selectedFile && (
              <div className="rounded-md border p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      サイズ: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>

                    {isUploading && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">アップロード中...</p>
                          <p className="text-sm">{Math.round(uploadProgress)}%</p>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    {isProcessing && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
                            <p className="text-sm font-medium">処理中...</p>
                          </div>
                          <p className="text-sm">{Math.round(processingProgress)}%</p>
                        </div>
                        <Progress value={processingProgress} className="h-2" />

                        {estimatedTime && (
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">経過時間: {elapsedTime}秒</p>
                            <p className="text-xs text-muted-foreground">{getRemainingTime()}</p>
                          </div>
                        )}

                        <div className="bg-muted/30 rounded-md p-2 mt-2">
                          <p className="text-xs text-muted-foreground">
                            <AlertCircle className="h-3 w-3 inline-block mr-1" />
                            処理中はブラウザを閉じないでください。ファイルサイズによって処理時間が異なります。
                          </p>
                        </div>
                      </div>
                    )}

                    {isComplete && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <p className="font-medium">処理が完了しました</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isComplete && extractedData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg text-primary">抽出データ一覧</CardTitle>
                <CardDescription>受付台帳から抽出された相続不動産情報</CardDescription>
              </div>
              <Button onClick={handleComplete}>
                <CheckCircle className="mr-2 h-4 w-4" />
                完了して顧客情報に登録
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>顧客名</TableHead>
                    <TableHead>郵便番号</TableHead>
                    <TableHead>都道府県</TableHead>
                    <TableHead>顧客現在住所</TableHead>
                    <TableHead>相続住所</TableHead>
                    <TableHead>電話番号</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editableData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell>
                        <Input
                          value={data.customerName}
                          onChange={(e) => handleDataChange(data.id, "customerName", e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={data.postalCode}
                          onChange={(e) => handleDataChange(data.id, "postalCode", e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={data.prefecture}
                          onChange={(e) => handleDataChange(data.id, "prefecture", e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={data.currentAddress}
                          onChange={(e) => handleDataChange(data.id, "currentAddress", e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={data.inheritanceAddress}
                          onChange={(e) => handleDataChange(data.id, "inheritanceAddress", e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={data.phoneNumber}
                          onChange={(e) => handleDataChange(data.id, "phoneNumber", e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
