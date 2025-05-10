"use client"

import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, MoreHorizontal, Search, ChevronDown, Edit, Trash, MapPin, Calendar } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/ui/date-picker"
import MapViewer from "@/components/map-viewer"

// 取得リストの型定義
type AcquisitionStatus =
  | "unassigned" // 担当者登録
  | "not_attacked" // 未アタック
  | "attacked" // アタック済み
  | "appointment" // アポ獲得
  | "contract" // 成約
  | "lost" // 失注

type AcquisitionList = {
  id: string
  customerName: string // 顧客名
  postalCode: string // 郵便番号
  prefecture: string // 都道府県
  currentAddress: string // 顧客現在住所
  inheritanceAddress: string // 顧客相続住所
  phoneNumber: string // 電話番号（後から追加される情報）
  email: string // メールアドレス（後から追加される情報）
  status: AcquisitionStatus
  assignedTo: string | null
  lastUpdated: string
  acquisitionDate: string // 情報取得日
  notes: string
}

// ステータスの表示名マッピング
const statusDisplayMap: Record<AcquisitionStatus, string> = {
  unassigned: "担当者登録",
  not_attacked: "未アタック",
  attacked: "アタック済み",
  appointment: "アポ獲得",
  contract: "成約",
  lost: "失注",
}

// ステータスのバッジバリアントマッピング
const statusVariantMap: Record<AcquisitionStatus, "default" | "secondary" | "outline" | "destructive"> = {
  unassigned: "outline",
  not_attacked: "secondary",
  attacked: "secondary",
  appointment: "default",
  contract: "default",
  lost: "destructive",
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

// ダミーデータ
const dummyLists: AcquisitionList[] = Array.from({ length: 50 }, (_, i) => {
  const prefecture = prefectures[Math.floor(Math.random() * prefectures.length)]
  const acquisitionDate = new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]
  return {
    id: `LIST-${1000 + i}`,
    customerName: `相続者 太郎${i + 1}`,
    postalCode: `${100 + Math.floor(Math.random() * 900)}-${1000 + Math.floor(Math.random() * 9000)}`,
    prefecture: prefecture,
    currentAddress: `${prefecture}${["新宿区", "渋谷区", "中央区", "港区"][i % 4]}${i + 1}-${i + 1}-${i + 1}`,
    inheritanceAddress: `${prefecture}${["品川区", "目黒区", "世田谷区", "杉並区"][i % 4]}${i + 1}-${i + 1}-${i + 1}`,
    phoneNumber: i % 3 === 0 ? `03-${1234 + i}-${5678 + i}` : "", // 一部のデータのみ電話番号あり
    email: i % 4 === 0 ? `contact${i + 1}@example.com` : "", // 一部のデータのみメールアドレスあり
    status: ["unassigned", "not_attacked", "attacked", "appointment", "contract", "lost"][i % 6] as AcquisitionStatus,
    assignedTo: i % 6 === 0 ? null : ["田中太郎", "佐藤花子", "鈴木一郎", "高橋次郎", "伊藤三郎"][i % 5],
    lastUpdated: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    acquisitionDate: acquisitionDate,
    notes: i % 3 === 0 ? "重要顧客" : i % 3 === 1 ? "フォローアップ必要" : "",
  }
})

// 担当者リスト
const salesPersons = ["田中太郎", "佐藤花子", "鈴木一郎", "高橋次郎", "伊藤三郎"]

export default function AcquisitionList() {
  const [lists, setLists] = useState<AcquisitionList[]>(dummyLists)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<AcquisitionStatus | "all">("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string | "all" | "unassigned">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedList, setSelectedList] = useState<AcquisitionList | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [listToDelete, setListToDelete] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [mapAddress, setMapAddress] = useState<string | undefined>(undefined)
  const [mapCurrentAddress, setMapCurrentAddress] = useState<string | undefined>(undefined)
  const [mapInheritanceAddress, setMapInheritanceAddress] = useState<string | undefined>(undefined)

  const itemsPerPage = 10

  // フィルタリング
  const filteredLists = lists.filter((list) => {
    const matchesSearch =
      list.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.currentAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.inheritanceAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.prefecture.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || list.status === statusFilter

    const matchesAssignee =
      assigneeFilter === "all" ||
      (assigneeFilter === "unassigned" && list.assignedTo === null) ||
      list.assignedTo === assigneeFilter

    // 期間フィルタリング
    const acquisitionDate = new Date(list.acquisitionDate)
    const matchesDateRange = (!startDate || acquisitionDate >= startDate) && (!endDate || acquisitionDate <= endDate)

    return matchesSearch && matchesStatus && matchesAssignee && matchesDateRange
  })

  // ページネーション
  const totalPages = Math.ceil(filteredLists.length / itemsPerPage)
  const paginatedLists = filteredLists.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // ステータス更新
  const updateStatus = (id: string, newStatus: AcquisitionStatus) => {
    setLists(
      lists.map((list) =>
        list.id === id ? { ...list, status: newStatus, lastUpdated: new Date().toISOString().split("T")[0] } : list,
      ),
    )
    toast({
      title: "ステータスを更新しました",
      description: `ID: ${id} のステータスを ${statusDisplayMap[newStatus]} に変更しました`,
    })
  }

  // 担当者割り当て
  const assignToSalesPerson = (id: string, salesPerson: string | null) => {
    setLists(
      lists.map((list) =>
        list.id === id
          ? {
              ...list,
              assignedTo: salesPerson,
              status: salesPerson ? (list.status === "unassigned" ? "not_attacked" : list.status) : "unassigned",
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : list,
      ),
    )
    toast({
      title: "担当者を更新しました",
      description: `ID: ${id} の担当者を ${salesPerson || "未割り当て"} に変更しました`,
    })
  }

  // リスト編集
  const handleEditList = () => {
    if (!selectedList) return

    setLists(lists.map((list) => (list.id === selectedList.id ? selectedList : list)))
    toast({
      title: "リスト情報を更新しました",
      description: `ID: ${selectedList.id} の情報を更新しました`,
    })
    setIsEditDialogOpen(false)
    setSelectedList(null)
  }

  // リスト削除
  const handleDeleteList = () => {
    if (!listToDelete) return

    setLists(lists.filter((list) => list.id !== listToDelete))
    toast({
      title: "リストを削除しました",
      description: `ID: ${listToDelete} のリストを削除しました`,
      variant: "destructive",
    })
    setListToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  // 地図を表示する関数
  const handleViewMap = (address: string) => {
    setMapAddress(address)
    setMapCurrentAddress(undefined)
    setMapInheritanceAddress(undefined)
    setIsMapOpen(true)
  }

  // 現在住所と相続住所を比較する関数
  const handleCompareAddresses = (list: AcquisitionList) => {
    setMapAddress(undefined)
    setMapCurrentAddress(list.currentAddress)
    setMapInheritanceAddress(list.inheritanceAddress)
    setIsMapOpen(true)
  }

  // 期間フィルターのリセット
  const resetDateFilter = () => {
    setStartDate(undefined)
    setEndDate(undefined)
  }

  // CSVエクスポート
  const handleExportCSV = () => {
    const csvContent = [
      [
        "ID",
        "顧客名",
        "郵便番号",
        "都道府県",
        "顧客現在住所",
        "相続住所",
        "電話番号",
        "メールアドレス",
        "ステータス",
        "担当者",
        "最終更新日",
        "情報取得日",
        "備考",
      ],
      ...filteredLists.map((list) => [
        list.id,
        list.customerName,
        list.postalCode,
        list.prefecture,
        list.currentAddress,
        list.inheritanceAddress,
        list.phoneNumber,
        list.email,
        statusDisplayMap[list.status],
        list.assignedTo || "",
        list.lastUpdated,
        list.acquisitionDate,
        list.notes,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "registry_info_list.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: "CSVをエクスポートしました",
        description: `${filteredLists.length}件のデータをエクスポートしました`,
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>登記簿情報リスト</CardTitle>
              <CardDescription>取得した登記簿情報の管理と更新</CardDescription>
            </div>
            <Button onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSVエクスポート
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
                  すべて
                </TabsTrigger>
                <TabsTrigger value="unassigned" onClick={() => setStatusFilter("unassigned")}>
                  担当者登録
                </TabsTrigger>
                <TabsTrigger value="not_attacked" onClick={() => setStatusFilter("not_attacked")}>
                  未アタック
                </TabsTrigger>
                <TabsTrigger value="appointment" onClick={() => setStatusFilter("appointment")}>
                  アポ獲得
                </TabsTrigger>
                <TabsTrigger value="contract" onClick={() => setStatusFilter("contract")}>
                  成約
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

                <Select value={assigneeFilter} onValueChange={(value) => setAssigneeFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="担当者で絞り込み" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべての担当者</SelectItem>
                    <SelectItem value="unassigned">未割り当て</SelectItem>
                    {salesPersons.map((person) => (
                      <SelectItem key={person} value={person}>
                        {person}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 期間指定フィルター */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">情報取得日で絞り込み:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DatePicker selected={startDate} onSelect={setStartDate} placeholder="開始日" />
                <span>～</span>
                <DatePicker selected={endDate} onSelect={setEndDate} placeholder="終了日" />
                <Button variant="outline" size="sm" onClick={resetDateFilter}>
                  リセット
                </Button>
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>顧客名</TableHead>
                    <TableHead>郵便番号</TableHead>
                    <TableHead>都道府県</TableHead>
                    <TableHead>顧客現在住所</TableHead>
                    <TableHead>相続住所</TableHead>
                    <TableHead>情報取得日</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>担当者</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLists.map((list) => (
                    <TableRow key={list.id}>
                      <TableCell className="font-medium">{list.customerName}</TableCell>
                      <TableCell>{list.postalCode}</TableCell>
                      <TableCell>{list.prefecture}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="truncate max-w-[150px]" title={list.currentAddress}>
                            {list.currentAddress}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-1 text-primary"
                            onClick={() => handleViewMap(list.currentAddress)}
                          >
                            <MapPin size={16} />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="truncate max-w-[150px]" title={list.inheritanceAddress}>
                            {list.inheritanceAddress}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-1 text-primary"
                            onClick={() => handleViewMap(list.inheritanceAddress)}
                          >
                            <MapPin size={16} />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{list.acquisitionDate}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 px-2 py-0 flex items-center gap-1">
                              <Badge variant={statusVariantMap[list.status]}>{statusDisplayMap[list.status]}</Badge>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuLabel>ステータス変更</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateStatus(list.id, "unassigned")}>
                              担当者登録
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(list.id, "not_attacked")}>
                              未アタック
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(list.id, "attacked")}>
                              アタック済み
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(list.id, "appointment")}>
                              アポ獲得
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(list.id, "contract")}>成約</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(list.id, "lost")}>失注</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 px-2 py-0 flex items-center gap-1">
                              {list.assignedTo || (
                                <Badge variant="outline" className="bg-muted">
                                  未割り当て
                                </Badge>
                              )}
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuLabel>担当者割り当て</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => assignToSalesPerson(list.id, null)}>
                              未割り当て
                            </DropdownMenuItem>
                            {salesPersons.map((person) => (
                              <DropdownMenuItem key={person} onClick={() => assignToSalesPerson(list.id, person)}>
                                {person}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">メニューを開く</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>アクション</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedList(list)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setListToDelete(list.id)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleCompareAddresses(list)}>
                                <MapPin className="mr-2 h-4 w-4" />
                                住所を地図で比較
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {filteredLists.length} 件中 {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredLists.length)} 件表示
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  前へ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  次へ
                </Button>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>登記簿情報編集</DialogTitle>
            <DialogDescription>登記簿情報を編集します。</DialogDescription>
          </DialogHeader>
          {selectedList && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="customerName" className="text-right">
                  顧客名
                </label>
                <Input
                  id="customerName"
                  value={selectedList.customerName}
                  onChange={(e) => setSelectedList({ ...selectedList, customerName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="postalCode" className="text-right">
                  郵便番号
                </label>
                <Input
                  id="postalCode"
                  value={selectedList.postalCode}
                  onChange={(e) => setSelectedList({ ...selectedList, postalCode: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="prefecture" className="text-right">
                  都道府県
                </label>
                <Input
                  id="prefecture"
                  value={selectedList.prefecture}
                  onChange={(e) => setSelectedList({ ...selectedList, prefecture: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="currentAddress" className="text-right">
                  顧客現在住所
                </label>
                <Input
                  id="currentAddress"
                  value={selectedList.currentAddress}
                  onChange={(e) => setSelectedList({ ...selectedList, currentAddress: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="inheritanceAddress" className="text-right">
                  相続住所
                </label>
                <Input
                  id="inheritanceAddress"
                  value={selectedList.inheritanceAddress}
                  onChange={(e) => setSelectedList({ ...selectedList, inheritanceAddress: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="acquisitionDate" className="text-right">
                  情報取得日
                </label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={selectedList.acquisitionDate}
                  onChange={(e) => setSelectedList({ ...selectedList, acquisitionDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phoneNumber" className="text-right">
                  電話番号
                </label>
                <Input
                  id="phoneNumber"
                  value={selectedList.phoneNumber}
                  onChange={(e) => setSelectedList({ ...selectedList, phoneNumber: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right">
                  メールアドレス
                </label>
                <Input
                  id="email"
                  value={selectedList.email}
                  onChange={(e) => setSelectedList({ ...selectedList, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="status" className="text-right">
                  ステータス
                </label>
                <Select
                  value={selectedList.status}
                  onValueChange={(value: AcquisitionStatus) => setSelectedList({ ...selectedList, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusDisplayMap).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="assignedTo" className="text-right">
                  担当者
                </label>
                <Select
                  value={selectedList.assignedTo || "unassigned"}
                  onValueChange={(value) =>
                    setSelectedList({
                      ...selectedList,
                      assignedTo: value === "unassigned" ? null : value,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="担当者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">未割り当て</SelectItem>
                    {salesPersons.map((person) => (
                      <SelectItem key={person} value={person}>
                        {person}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="notes" className="text-right">
                  備考
                </label>
                <Input
                  id="notes"
                  value={selectedList.notes}
                  onChange={(e) => setSelectedList({ ...selectedList, notes: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleEditList}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>リスト削除の確認</DialogTitle>
            <DialogDescription>このリストを削除してもよろしいですか？この操作は元に戻せません。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteList}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 地図表示ダイアログ */}
      <MapViewer
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        address={mapAddress}
        currentAddress={mapCurrentAddress}
        inheritanceAddress={mapInheritanceAddress}
        title="住所の地図表示"
        showButtons={false}
      />
    </div>
  )
}
