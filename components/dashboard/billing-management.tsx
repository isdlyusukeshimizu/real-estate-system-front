"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Search, User, Calendar, MapPin } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 請求データの型定義
type BillingStatus = "pending" | "paid" | "overdue" | "cancelled"

type RegistryRecord = {
  id: string
  address: string
  prefecture: string
  city: string
  registryType: string
  requestDate: string
  receivedDate: string
  requestedBy: string
}

type BillingRecord = {
  id: string
  invoiceNumber: string
  clientName: string
  amount: number
  issueDate: string
  dueDate: string
  status: BillingStatus
  paymentMethod?: string
  paymentDate?: string
  registryRecords: RegistryRecord[]
}

// ステータスの表示名マッピング
const statusDisplayMap: Record<BillingStatus, string> = {
  pending: "未払い",
  paid: "支払い済み",
  overdue: "支払い遅延",
  cancelled: "キャンセル",
}

// ステータスのバッジバリアントマッピング
const statusVariantMap: Record<BillingStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  overdue: "destructive",
  cancelled: "outline",
}

// 都道府県リスト
const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
]

// 登記簿種類
const registryTypes = ["土地", "建物", "区分建物", "土地・建物"]

// ダミーデータ生成
const generateDummyRegistryRecords = (count: number): RegistryRecord[] => {
  const records: RegistryRecord[] = []
  const members = ["佐藤 一郎", "鈴木 次郎", "田中 三郎", "高橋 四郎", "渡辺 五郎"]

  for (let i = 0; i < count; i++) {
    const prefecture = prefectures[Math.floor(Math.random() * prefectures.length)]
    const city = `${prefecture}${Math.floor(Math.random() * 10) + 1}市`
    const address = `${prefecture}${city}${Math.floor(Math.random() * 10) + 1}丁目${Math.floor(Math.random() * 20) + 1}番地${Math.floor(Math.random() * 10) + 1}`

    const requestDate = new Date()
    requestDate.setDate(requestDate.getDate() - Math.floor(Math.random() * 30))

    const receivedDate = new Date(requestDate)
    receivedDate.setDate(receivedDate.getDate() + Math.floor(Math.random() * 5) + 1)

    records.push({
      id: `REG-${10000 + i}`,
      address: address,
      prefecture: prefecture,
      city: city,
      registryType: registryTypes[Math.floor(Math.random() * registryTypes.length)],
      requestDate: requestDate.toISOString().split("T")[0],
      receivedDate: receivedDate.toISOString().split("T")[0],
      requestedBy: members[Math.floor(Math.random() * members.length)],
    })
  }

  return records
}

// ダミーデータ生成
const generateDummyBillingData = (): BillingRecord[] => {
  const currentDate = new Date()
  const records: BillingRecord[] = []

  // 過去6ヶ月分のデータを生成
  for (let i = 0; i < 6; i++) {
    const month = new Date(currentDate)
    month.setMonth(currentDate.getMonth() - i)

    const issueDate = new Date(month)
    issueDate.setDate(1)

    const dueDate = new Date(month)
    dueDate.setDate(15)

    // 各月に複数の請求書を追加
    for (let j = 0; j < 3 + Math.floor(Math.random() * 3); j++) {
      const status: BillingStatus =
        i === 0 ? (j % 3 === 0 ? "pending" : "paid") : i === 1 ? (j % 4 === 0 ? "overdue" : "paid") : "paid"

      // 登記簿取得記録を生成
      const registryCount = Math.floor(Math.random() * 10) + 1
      const registryRecords = generateDummyRegistryRecords(registryCount)

      // 金額は331円×登記簿件数
      const amount = 331 * registryCount

      const record: BillingRecord = {
        id: `BILL-${1000 + i * 10 + j}`,
        invoiceNumber: `INV-${month.getFullYear()}${(month.getMonth() + 1).toString().padStart(2, "0")}-${(j + 1).toString().padStart(3, "0")}`,
        clientName: `クライアント${j + 1}`,
        amount: amount,
        issueDate: issueDate.toISOString().split("T")[0],
        dueDate: dueDate.toISOString().split("T")[0],
        status: status,
        registryRecords: registryRecords,
      }

      if (status === "paid") {
        const paymentDate = new Date(dueDate)
        paymentDate.setDate(dueDate.getDate() - Math.floor(Math.random() * 10))
        record.paymentDate = paymentDate.toISOString().split("T")[0]
        record.paymentMethod = ["銀行振込", "クレジットカード", "口座振替"][Math.floor(Math.random() * 3)]
      }

      records.push(record)
    }
  }

  return records
}

const dummyBillingRecords = generateDummyBillingData()

export default function BillingManagement() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>(dummyBillingRecords)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<BillingStatus | "all">("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [selectedBilling, setSelectedBilling] = useState<BillingRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // 月のリストを生成
  const months = Array.from(
    new Set(
      billingRecords.map((record) => {
        const date = new Date(record.issueDate)
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`
      }),
    ),
  ).sort((a, b) => b.localeCompare(a))

  // フィルタリング
  const filteredRecords = billingRecords.filter((record) => {
    const matchesSearch =
      record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.clientName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || record.status === statusFilter

    const matchesMonth = monthFilter === "all" || record.issueDate.startsWith(monthFilter)

    return matchesSearch && matchesStatus && matchesMonth
  })

  // 合計金額計算
  const totalAmount = filteredRecords.reduce((sum, record) => sum + record.amount, 0)
  const paidAmount = filteredRecords
    .filter((record) => record.status === "paid")
    .reduce((sum, record) => sum + record.amount, 0)
  const pendingAmount = filteredRecords
    .filter((record) => record.status === "pending")
    .reduce((sum, record) => sum + record.amount, 0)
  const overdueAmount = filteredRecords
    .filter((record) => record.status === "overdue")
    .reduce((sum, record) => sum + record.amount, 0)

  // 登記簿詳細を表示
  const handleViewDetails = (record: BillingRecord) => {
    setSelectedBilling(record)
    setIsDetailsOpen(true)
  }

  // CSVエクスポート
  const handleExportCSV = () => {
    const csvContent = [
      ["請求書番号", "クライアント名", "金額", "発行日", "支払期限", "ステータス", "支払方法", "支払日", "登記簿件数"],
      ...filteredRecords.map((record) => [
        record.invoiceNumber,
        record.clientName,
        record.amount.toString(),
        record.issueDate,
        record.dueDate,
        statusDisplayMap[record.status],
        record.paymentMethod || "",
        record.paymentDate || "",
        record.registryRecords.length.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "billing_records.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>請求管理</CardTitle>
              <CardDescription>受付台帳取得費用の請求と支払い状況の管理</CardDescription>
            </div>
            <Button onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSVエクスポート
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総請求額</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{filteredRecords.length}件の請求書</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">入金済み</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">¥{paidAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredRecords.filter((r) => r.status === "paid").length}件
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">未払い</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">¥{pendingAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredRecords.filter((r) => r.status === "pending").length}件
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">支払い遅延</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">¥{overdueAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredRecords.filter((r) => r.status === "overdue").length}件
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
                  すべて
                </TabsTrigger>
                <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
                  未払い
                </TabsTrigger>
                <TabsTrigger value="paid" onClick={() => setStatusFilter("paid")}>
                  支払い済み
                </TabsTrigger>
                <TabsTrigger value="overdue" onClick={() => setStatusFilter("overdue")}>
                  支払い遅延
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="検索..."
                    className="pl-8 w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={monthFilter} onValueChange={(value) => setMonthFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="月で絞り込み" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべての月</SelectItem>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month.replace("-", "年")}月
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>請求書番号</TableHead>
                    <TableHead>クライアント名</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead>発行日</TableHead>
                    <TableHead>支払期限</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>登記簿件数</TableHead>
                    <TableHead>詳細</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {record.invoiceNumber}
                        </div>
                      </TableCell>
                      <TableCell>{record.clientName}</TableCell>
                      <TableCell className="text-right">¥{record.amount.toLocaleString()}</TableCell>
                      <TableCell>{record.issueDate}</TableCell>
                      <TableCell>{record.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariantMap[record.status]}>{statusDisplayMap[record.status]}</Badge>
                      </TableCell>
                      <TableCell>{record.registryRecords.length}件</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(record)}>
                          詳細
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* 登記簿詳細ダイアログ */}
      {selectedBilling && isDetailsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">登記簿取得詳細</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsDetailsOpen(false)}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">請求書番号</p>
                <p className="font-medium">{selectedBilling.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">クライアント名</p>
                <p className="font-medium">{selectedBilling.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">合計金額</p>
                <p className="font-medium">¥{selectedBilling.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">登記簿取得件数</p>
                <p className="font-medium">{selectedBilling.registryRecords.length}件（@331円）</p>
              </div>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>住所</TableHead>
                    <TableHead>種類</TableHead>
                    <TableHead>取得依頼日</TableHead>
                    <TableHead>取得完了日</TableHead>
                    <TableHead>依頼者</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBilling.registryRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          {record.address}
                        </div>
                      </TableCell>
                      <TableCell>{record.registryType}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {record.requestDate}
                        </div>
                      </TableCell>
                      <TableCell>{record.receivedDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          {record.requestedBy}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                閉じる
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
