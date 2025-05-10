"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  MoreHorizontal,
  Search,
  Trash2,
  Edit,
  MapPin,
  Calendar,
  FileText,
  UserPlus,
  Mail,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// MapViewerコンポーネントをインポート
import MapViewer from "@/components/map-viewer"

// 顧客データの型定義
type Customer = {
  id: string
  name: string
  phoneNumber: string
  email: string
  address: string
  postalCode: string
  propertyAddress: string
  propertyType: string
  status: "new" | "contacted" | "negotiating" | "contracted" | "closed" | "lost"
  assignedTo: string
  lastContactDate: string
  nextContactDate: string
  notes: string
  source: string
  activities: Activity[]
}

// 活動記録の型定義
type Activity = {
  id: string
  date: string
  type: "call" | "email" | "meeting" | "note" | "other"
  description: string
  createdBy: string
  result?: string
}

// ダミーデータ生成
const generateDummyCustomers = (): Customer[] => {
  const statuses: Customer["status"][] = ["new", "contacted", "negotiating", "contracted", "closed", "lost"]
  const sources = ["受付台帳", "紹介", "Web問い合わせ", "電話営業", "その他"]
  const propertyTypes = ["一戸建て", "マンション", "土地", "店舗", "事務所", "その他"]
  const salespeople = ["佐藤 一郎", "鈴木 次郎", "田中 三郎", "高橋 四郎", "渡辺 五郎"]

  return Array.from({ length: 15 }, (_, i) => {
    // ダミーの活動記録を生成
    const activityCount = Math.floor(Math.random() * 5) + 1
    const activities: Activity[] = Array.from({ length: activityCount }, (_, j) => {
      const activityTypes: Activity["type"][] = ["call", "email", "meeting", "note", "other"]
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)]
      const daysAgo = Math.floor(Math.random() * 30) + j * 5
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      let description = ""
      let result = ""

      switch (activityType) {
        case "call":
          description = "電話で連絡"
          result = Math.random() > 0.5 ? "応答あり、次回訪問の約束" : "不在、後日再度連絡予定"
          break
        case "email":
          description = "メールで資料送付"
          result = Math.random() > 0.5 ? "返信あり、興味を示す" : "返信待ち"
          break
        case "meeting":
          description = "訪問面談"
          result = Math.random() > 0.7 ? "契約に前向き" : "検討中"
          break
        case "note":
          description = "備考追加"
          result = "情報更新"
          break
        case "other":
          description = "その他の活動"
          result = "継続フォロー"
          break
      }

      return {
        id: `ACT-${i}-${j}`,
        date,
        type: activityType,
        description,
        createdBy: salespeople[Math.floor(Math.random() * salespeople.length)],
        result,
      }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // 日付の新しい順にソート

    return {
      id: `CUST-${1000 + i}`,
      name: `相続者 太郎${i + 1}`,
      phoneNumber: `03-${1234 + i}-${5678 + i}`,
      email: i % 3 === 0 ? `customer${i + 1}@example.com` : "",
      address: `東京都新宿区西新宿${i + 1}-${i + 1}-${i + 1}`,
      postalCode: `160-00${10 + i}`,
      propertyAddress: `東京都渋谷区恵比寿${i + 1}-${i + 1}-${i + 1}`,
      propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      assignedTo: salespeople[Math.floor(Math.random() * salespeople.length)],
      lastContactDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      nextContactDate:
        Math.random() > 0.3
          ? new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : "",
      notes: Math.random() > 0.5 ? "前回の訪問では不在でした。次回は事前に電話連絡が必要です。" : "",
      source: sources[Math.floor(Math.random() * sources.length)],
      activities: activities,
    }
  })
}

// グローバルな顧客データを保持するための変数
let globalCustomers: Customer[] = []

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    status: "new",
  })
  const [activeTab, setActiveTab] = useState("all")
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    type: "note",
    date: new Date().toISOString().split("T")[0],
  })
  const { toast } = useToast()

  // CustomerManagement関数内に以下のステートを追加
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [mapAddress, setMapAddress] = useState<string | undefined>(undefined)
  const [mapCurrentAddress, setMapCurrentAddress] = useState<string | undefined>(undefined)
  const [mapInheritanceAddress, setMapInheritanceAddress] = useState<string | undefined>(undefined)

  // メール送信用のステートを追加
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    body: "",
  })

  // 初期化時にデータを読み込む
  useEffect(() => {
    if (globalCustomers.length === 0) {
      globalCustomers = generateDummyCustomers()
    }
    setCustomers(globalCustomers)
  }, [])

  // 検索フィルター
  const filteredCustomers = customers.filter(
    (customer) =>
      (activeTab === "all" || customer.status === activeTab) &&
      (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  // 編集処理
  const handleEdit = () => {
    if (!selectedCustomer) return

    const updatedCustomers = customers.map((customer) =>
      customer.id === selectedCustomer.id ? selectedCustomer : customer,
    )
    setCustomers(updatedCustomers)
    globalCustomers = updatedCustomers

    setIsEditDialogOpen(false)
    setSelectedCustomer(null)

    toast({
      title: "顧客情報を更新しました",
      description: "顧客データが正常に更新されました",
    })
  }

  // 削除処理
  const handleDelete = () => {
    if (!selectedCustomer) return

    const updatedCustomers = customers.filter((customer) => customer.id !== selectedCustomer.id)
    setCustomers(updatedCustomers)
    globalCustomers = updatedCustomers

    setIsDeleteDialogOpen(false)
    setSelectedCustomer(null)

    toast({
      title: "顧客を削除しました",
      description: "顧客データが正常に削除されました",
    })
  }

  // 新規顧客追加
  const handleAddCustomer = () => {
    const id = `CUST-${1000 + customers.length}`
    const newCustomerData: Customer = {
      id,
      name: newCustomer.name || "",
      phoneNumber: newCustomer.phoneNumber || "",
      email: newCustomer.email || "",
      address: newCustomer.address || "",
      postalCode: newCustomer.postalCode || "",
      propertyAddress: newCustomer.propertyAddress || "",
      propertyType: newCustomer.propertyType || "その他",
      status: (newCustomer.status as Customer["status"]) || "new",
      assignedTo: newCustomer.assignedTo || "",
      lastContactDate: newCustomer.lastContactDate || new Date().toISOString().split("T")[0],
      nextContactDate: newCustomer.nextContactDate || "",
      notes: newCustomer.notes || "",
      source: newCustomer.source || "その他",
      activities: [],
    }

    const updatedCustomers = [newCustomerData, ...customers]
    setCustomers(updatedCustomers)
    globalCustomers = updatedCustomers

    setIsAddDialogOpen(false)
    setNewCustomer({
      status: "new",
    })

    toast({
      title: "顧客を追加しました",
      description: "新しい顧客データが正常に追加されました",
    })
  }

  // 活動記録追加
  const handleAddActivity = () => {
    if (!selectedCustomer || !newActivity.description) return

    const activity: Activity = {
      id: `ACT-${selectedCustomer.id}-${Date.now()}`,
      date: newActivity.date || new Date().toISOString().split("T")[0],
      type: newActivity.type as Activity["type"],
      description: newActivity.description,
      createdBy: "現在のユーザー", // 実際のシステムでは現在ログインしているユーザー名
      result: newActivity.result,
    }

    const updatedCustomer = {
      ...selectedCustomer,
      activities: [activity, ...selectedCustomer.activities],
      lastContactDate: activity.date,
    }

    const updatedCustomers = customers.map((customer) =>
      customer.id === selectedCustomer.id ? updatedCustomer : customer,
    )
    setCustomers(updatedCustomers)
    globalCustomers = updatedCustomers

    setIsActivityDialogOpen(false)
    setNewActivity({
      type: "note",
      date: new Date().toISOString().split("T")[0],
    })

    toast({
      title: "活動記録を追加しました",
      description: "顧客の活動記録が正常に追加されました",
    })
  }

  // 地図を表示する関数
  const handleViewMap = (address: string) => {
    setMapAddress(address)
    setMapCurrentAddress(undefined)
    setMapInheritanceAddress(undefined)
    setIsMapOpen(true)
  }

  // 現在住所と相続住所を比較する関数
  const handleCompareAddresses = (customer: Customer) => {
    setMapAddress(undefined)
    setMapCurrentAddress(customer.address)
    setMapInheritanceAddress(customer.propertyAddress)
    setIsMapOpen(true)
  }

  // メール送信ダイアログを開く
  const handleSendEmail = (email: string) => {
    setEmailData({
      to: email,
      subject: "",
      body: "",
    })
    setIsEmailDialogOpen(true)
  }

  // メール送信処理
  const handleSubmitEmail = () => {
    toast({
      title: "メールを送信しました",
      description: `${emailData.to} 宛にメールを送信しました`,
    })
    setIsEmailDialogOpen(false)
  }

  // ステータスの表示名
  const getStatusLabel = (status: Customer["status"]) => {
    switch (status) {
      case "new":
        return "新規"
      case "contacted":
        return "接触済"
      case "negotiating":
        return "商談中"
      case "contracted":
        return "契約済"
      case "closed":
        return "成約"
      case "lost":
        return "失注"
      default:
        return status
    }
  }

  // ステータスのテキストカラー
  const getStatusTextColor = (status: Customer["status"]) => {
    switch (status) {
      case "new":
        return "text-blue-600"
      case "contacted":
        return "text-gray-600"
      case "negotiating":
        return "text-purple-600"
      case "contracted":
        return "text-green-600"
      case "closed":
        return "text-green-700 font-bold"
      case "lost":
        return "text-red-600"
      default:
        return ""
    }
  }

  // 活動タイプのアイコンと表示名
  const getActivityTypeInfo = (type: Activity["type"]) => {
    switch (type) {
      case "call":
        return { icon: <Calendar className="h-4 w-4" />, label: "電話" }
      case "email":
        return { icon: <Calendar className="h-4 w-4" />, label: "メール" }
      case "meeting":
        return { icon: <Calendar className="h-4 w-4" />, label: "面談" }
      case "note":
        return { icon: <FileText className="h-4 w-4" />, label: "メモ" }
      case "other":
        return { icon: <MoreHorizontal className="h-4 w-4" />, label: "その他" }
    }
  }

  // CSVエクスポート
  const handleExportCSV = () => {
    const csvContent = [
      [
        "ID",
        "氏名",
        "電話番号",
        "メールアドレス",
        "顧客現在住所",
        "郵便番号",
        "相続住所",
        "物件種別",
        "ステータス",
        "担当者",
        "最終接触日",
        "次回接触予定日",
        "メモ",
        "情報源",
      ],
      ...filteredCustomers.map((customer) => [
        customer.id,
        customer.name,
        customer.phoneNumber,
        customer.email,
        customer.address,
        customer.postalCode,
        customer.propertyAddress,
        customer.propertyType,
        getStatusLabel(customer.status),
        customer.assignedTo,
        customer.lastContactDate,
        customer.nextContactDate,
        customer.notes,
        customer.source,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "customers.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg text-primary">登記簿情報顧客一覧</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              新規顧客
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSVエクスポート
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="顧客名、住所、電話番号で検索..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">すべて</TabsTrigger>
              <TabsTrigger value="new">新規</TabsTrigger>
              <TabsTrigger value="contacted">接触済</TabsTrigger>
              <TabsTrigger value="negotiating">商談中</TabsTrigger>
              <TabsTrigger value="contracted">契約済</TabsTrigger>
              <TabsTrigger value="closed">成約</TabsTrigger>
              <TabsTrigger value="lost">失注</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>顧客名</TableHead>
                      <TableHead>顧客現在住所</TableHead>
                      <TableHead>相続住所</TableHead>
                      <TableHead>電話番号</TableHead>
                      <TableHead>メールアドレス</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>担当者</TableHead>
                      <TableHead>次回接触</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          該当する顧客データがありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">
                            <div>{customer.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {customer.address}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 ml-1"
                                onClick={() => handleViewMap(customer.address)}
                              >
                                <MapPin size={16} />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {customer.propertyAddress}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 ml-1"
                                onClick={() => handleViewMap(customer.propertyAddress)}
                              >
                                <MapPin size={16} />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{customer.phoneNumber || "-"}</TableCell>
                          <TableCell>{customer.email || "-"}</TableCell>
                          <TableCell>
                            <Select
                              value={customer.status}
                              onValueChange={(value) => {
                                const updatedCustomer = { ...customer, status: value as Customer["status"] }
                                const updatedCustomers = customers.map((c) =>
                                  c.id === customer.id ? updatedCustomer : c,
                                )
                                setCustomers(updatedCustomers)
                                globalCustomers = updatedCustomers
                              }}
                            >
                              <SelectTrigger className="w-[120px] border-none">
                                <span className={getStatusTextColor(customer.status)}>
                                  {getStatusLabel(customer.status)}
                                </span>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">新規</SelectItem>
                                <SelectItem value="contacted">接触済</SelectItem>
                                <SelectItem value="negotiating">商談中</SelectItem>
                                <SelectItem value="contracted">契約済</SelectItem>
                                <SelectItem value="closed">成約</SelectItem>
                                <SelectItem value="lost">失注</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{customer.assignedTo || "-"}</TableCell>
                          <TableCell>
                            {customer.nextContactDate ? (
                              <div className="flex items-center">
                                <Calendar size={14} className="mr-1 text-muted-foreground" />
                                {customer.nextContactDate}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">メニューを開く</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>アクション</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCustomer(customer)
                                    setIsEditDialogOpen(true)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  編集
                                </DropdownMenuItem>
                                {customer.email && (
                                  <DropdownMenuItem onClick={() => handleSendEmail(customer.email)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    メール送信
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCustomer(customer)
                                    setIsActivityDialogOpen(true)
                                  }}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  活動記録
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCompareAddresses(customer)}>
                                  <MapPin className="mr-2 h-4 w-4" />
                                  住所を地図で比較
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedCustomer(customer)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  削除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>顧客情報編集</DialogTitle>
            <DialogDescription>顧客情報を編集します。</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  顧客名
                </label>
                <Input
                  id="name"
                  value={selectedCustomer.name}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phoneNumber" className="text-right">
                  電話番号
                </label>
                <Input
                  id="phoneNumber"
                  value={selectedCustomer.phoneNumber}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phoneNumber: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right">
                  メールアドレス
                </label>
                <Input
                  id="email"
                  type="email"
                  value={selectedCustomer.email}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="address" className="text-right">
                  顧客現在住所
                </label>
                <Input
                  id="address"
                  value={selectedCustomer.address}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="propertyAddress" className="text-right">
                  相続住所
                </label>
                <Input
                  id="propertyAddress"
                  value={selectedCustomer.propertyAddress}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, propertyAddress: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="status" className="text-right">
                  ステータス
                </label>
                <Select
                  value={selectedCustomer.status}
                  onValueChange={(value) =>
                    setSelectedCustomer({ ...selectedCustomer, status: value as Customer["status"] })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">新規</SelectItem>
                    <SelectItem value="contacted">接触済</SelectItem>
                    <SelectItem value="negotiating">商談中</SelectItem>
                    <SelectItem value="contracted">契約済</SelectItem>
                    <SelectItem value="closed">成約</SelectItem>
                    <SelectItem value="lost">失注</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="assignedTo" className="text-right">
                  担当者
                </label>
                <Input
                  id="assignedTo"
                  value={selectedCustomer.assignedTo}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, assignedTo: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="nextContactDate" className="text-right">
                  次回接触予定日
                </label>
                <Input
                  id="nextContactDate"
                  type="date"
                  value={selectedCustomer.nextContactDate}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, nextContactDate: e.target.value })}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="notes" className="text-right pt-2">
                  メモ
                </label>
                <Textarea
                  id="notes"
                  value={selectedCustomer.notes}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, notes: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>顧客削除の確認</DialogTitle>
            <DialogDescription>この顧客を削除してもよろしいですか？この操作は元に戻せません。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新規顧客追加ダイアログ */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>新規顧客登録</DialogTitle>
            <DialogDescription>新しい顧客情報を登録します。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-name" className="text-right">
                顧客名 *
              </label>
              <Input
                id="new-name"
                value={newCustomer.name || ""}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-phoneNumber" className="text-right">
                電話番号
              </label>
              <Input
                id="new-phoneNumber"
                value={newCustomer.phoneNumber || ""}
                onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-email" className="text-right">
                メールアドレス
              </label>
              <Input
                id="new-email"
                type="email"
                value={newCustomer.email || ""}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-address" className="text-right">
                顧客現在住所
              </label>
              <Input
                id="new-address"
                value={newCustomer.address || ""}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-propertyAddress" className="text-right">
                相続住所 *
              </label>
              <Input
                id="new-propertyAddress"
                value={newCustomer.propertyAddress || ""}
                onChange={(e) => setNewCustomer({ ...newCustomer, propertyAddress: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-status" className="text-right">
                ステータス
              </label>
              <Select
                value={newCustomer.status as string}
                onValueChange={(value) => setNewCustomer({ ...newCustomer, status: value as Customer["status"] })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">新規</SelectItem>
                  <SelectItem value="contacted">接触済</SelectItem>
                  <SelectItem value="negotiating">商談中</SelectItem>
                  <SelectItem value="contracted">契約済</SelectItem>
                  <SelectItem value="closed">成約</SelectItem>
                  <SelectItem value="lost">失注</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-assignedTo" className="text-right">
                担当者
              </label>
              <Input
                id="new-assignedTo"
                value={newCustomer.assignedTo || ""}
                onChange={(e) => setNewCustomer({ ...newCustomer, assignedTo: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-source" className="text-right">
                情報源
              </label>
              <Select
                value={newCustomer.source || ""}
                onValueChange={(value) => setNewCustomer({ ...newCustomer, source: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="情報源を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="受付台帳">受付台帳</SelectItem>
                  <SelectItem value="紹介">紹介</SelectItem>
                  <SelectItem value="Web問い合わせ">Web問い合わせ</SelectItem>
                  <SelectItem value="電話営業">電話営業</SelectItem>
                  <SelectItem value="その他">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="new-notes" className="text-right pt-2">
                メモ
              </label>
              <Textarea
                id="new-notes"
                value={newCustomer.notes || ""}
                onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAddCustomer} disabled={!newCustomer.name || !newCustomer.propertyAddress}>
              登録
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 活動記録ダイアログ */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>活動記録</DialogTitle>
            <DialogDescription>{selectedCustomer?.name}さんの活動記録を管理します。</DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4">
              {/* 新規活動記録フォーム */}
              <div className="border rounded-md p-4 bg-muted/30">
                <h4 className="text-sm font-medium mb-3">新規活動記録</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="activity-date" className="text-right text-sm">
                      日付
                    </label>
                    <Input
                      id="activity-date"
                      type="date"
                      value={newActivity.date || ""}
                      onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="activity-type" className="text-right text-sm">
                      種類
                    </label>
                    <Select
                      value={newActivity.type}
                      onValueChange={(value) => setNewActivity({ ...newActivity, type: value as Activity["type"] })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="活動種類を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">電話</SelectItem>
                        <SelectItem value="email">メール</SelectItem>
                        <SelectItem value="meeting">面談</SelectItem>
                        <SelectItem value="note">メモ</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <label htmlFor="activity-description" className="text-right text-sm pt-2">
                      内容 *
                    </label>
                    <Textarea
                      id="activity-description"
                      value={newActivity.description || ""}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      className="col-span-3"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <label htmlFor="activity-result" className="text-right text-sm pt-2">
                      結果
                    </label>
                    <Textarea
                      id="activity-result"
                      value={newActivity.result || ""}
                      onChange={(e) => setNewActivity({ ...newActivity, result: e.target.value })}
                      className="col-span-3"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddActivity} disabled={!newActivity.description}>
                      記録を追加
                    </Button>
                  </div>
                </div>
              </div>

              {/* 活動記録履歴 */}
              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-3">活動履歴</h4>
                {selectedCustomer.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">活動記録がありません</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {selectedCustomer.activities.map((activity) => {
                      const typeInfo = getActivityTypeInfo(activity.type)
                      return (
                        <div key={activity.id} className="border-b pb-3 last:border-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                                {typeInfo.icon}
                                <span>{typeInfo.label}</span>
                              </div>
                              <span className="text-sm font-medium">{activity.date}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">記録者: {activity.createdBy}</span>
                          </div>
                          <p className="text-sm mt-2">{activity.description}</p>
                          {activity.result && (
                            <div className="mt-1 text-sm">
                              <span className="font-medium text-xs">結果: </span>
                              {activity.result}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActivityDialogOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* メール送信ダイアログ */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>メール送信</DialogTitle>
            <DialogDescription>顧客にメールを送信します。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email-to" className="text-right">
                宛先
              </label>
              <Input
                id="email-to"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                className="col-span-3"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email-subject" className="text-right">
                件名
              </label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="col-span-3"
                placeholder="件名を入力してください"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="email-body" className="text-right pt-2">
                本文
              </label>
              <Textarea
                id="email-body"
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                className="col-span-3"
                rows={10}
                placeholder="メール本文を入力してください"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSubmitEmail} disabled={!emailData.subject || !emailData.body}>
              送信
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MapViewer
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        address={mapAddress}
        currentAddress={mapCurrentAddress}
        inheritanceAddress={mapInheritanceAddress}
        title="住所の地図表示"
        showButtons={false}
      />
    </Card>
  )
}
