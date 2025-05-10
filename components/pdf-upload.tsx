"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function PdfUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
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
          timerRef.current = setInterval(() => {
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
                if (timerRef.current) {
                  clearInterval(timerRef.current)
                  timerRef.current = null
                }

                // 処理完了
                setIsProcessing(false)
                setIsComplete(true)

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

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
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
                ref={fileInputRef}
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

          <div className="rounded-md border p-4 bg-muted/30">
            <h3 className="text-sm font-medium mb-2">アップロードの注意点</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>PDFファイル形式の受付台帳のみ対応しています</li>
              <li>ファイルサイズは20MB以下にしてください</li>
              <li>処理時間の目安: 5MB = 約25秒、10MB = 約50秒、20MB = 約100秒</li>
              <li>処理中はブラウザを閉じないでください</li>
              <li>抽出されたデータは下部の「抽出データ一覧」に表示されます</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
