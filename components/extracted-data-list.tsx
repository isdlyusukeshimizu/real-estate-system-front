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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, MoreHorizontal, Search, Trash2, Edit, CheckCircle, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// 抽出データの型定義
type ExtractedData = {
  id: string
  extractedAt: string // 情報取得日
  customerName: string // 顧客名
  postalCode: string // 郵便番号
  prefecture: string // 都道府県
  currentAddress: string // 顧客現在住所
  inheritanceAddress: string // 顧客相続住所
  status: "pending" | "registered" | "error"
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

// ダミーデータ生成
const generateDummyData = (): ExtractedData[] => {
  return Array.from({ length: 10 }, (_, i) => {
    const prefecture = prefectures[Math.floor(Math.random() * prefectures.length)]
    return {
      id: `EXT-${1000 + i}`,
      extractedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      customerName: `相続者 太郎${i + 1}`,
      postalCode: `${100 + Math.floor(Math.random() * 900)}-${1000 + Math.floor(Math.random() * 9000)}`,
      prefecture: prefecture,
      currentAddress: `${prefecture}${["新宿区", "渋谷区", "中央区", "港区"][i % 4]}${i + 1}-${i + 1}-${i + 1}`,
      inheritanceAddress: `${prefecture}${["品川区", "目黒区", "世田谷区", "杉並区"][i % 4]}${i + 1}-${i + 1}-${i + 1}`,
      status: i % 5 === 0 ? "registered" : i % 4 === 0 ? "error" : "pending",
    }
  })
}

export default function ExtractedDataList() {
  const [extractedData, setExtractedData] = useState<ExtractedData[]>(generateDummyData())
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedData, setSelectedData] = useState<ExtractedData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  // 検索フィルター
  const filteredData = extractedData.filter(
    (data) =>
      data.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.currentAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.inheritanceAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.prefecture.includes(searchTerm),
  )

  // 編集処理
  const handleEdit = () => {
    if (!selectedData) return

    setExtractedData(extractedData.map((data) => (data.id === selectedData.id ? selectedData : data)))
    setIsEditDialogOpen(false)
    setSelectedData(null)

    toast({
      title: "データを更新しました",
      description: "抽出データが正常に更新されました",
    })
  }

  // 削除処理
  const handleDelete = () => {
    if (!selectedData) return

    setExtractedData(extractedData.filter((data) => data.id !== selectedData.id))
    setIsDeleteDialogOpen(false)
    setSelectedData(null)

    toast({
      title: "データを削除しました",
      description: "抽出データが正常に削除されました",
    })
  }

  // 取得リストに登録
  const handleRegisterToList = (data: ExtractedData) => {
    // 実際のアプリケーションでは、取得リストに登録するAPIを呼び出す
    // ここではステータスを更新するだけ
    setExtractedData(
      extractedData.map((item) => (item.id === data.id ? { ...item, status: "registered" as const } : item)),
    )

    toast({
      title: "取得リストに登録しました",
      description: "データが取得リスト管理に未割り当てとして登録されました",
    })
  }

  // 地図で見る
  const handleViewMap = (address: string) => {
    // 実際のアプリケーションでは、地図アプリを起動するAPIを呼び出す
    toast({
      title: "地図を表示しています",
      description: `${address}`,
    })
  }

  // CSVエクスポート
  const handleExportCSV = () => {
    const csvContent = [
      ["ID", "情報取得日", "顧客名", "郵便番号", "都道府県", "顧客現在住所", "顧客相続住所"],
      ...filteredData.map((data) => [
        data.id,
        data.extractedAt,
        data.customerName,
        data.postalCode,
        data.prefecture,
        data.currentAddress,
        data.inheritanceAddress,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "extracted_data.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg text-primary">抽出データ一覧</CardTitle>
            <CardDescription>受付台帳から抽出された相続不動産情報</CardDescription>
          </div>
          <Button onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSVエクスポート
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="検索..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>情報取得日</TableHead>
                  <TableHead>顧客名</TableHead>
                  <TableHead>郵便番号</TableHead>
                  <TableHead>都道府県</TableHead>
                  <TableHead>顧客現在住所</TableHead>
                  <TableHead>顧客相続住所</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      抽出データがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell>{data.extractedAt}</TableCell>
                      <TableCell className="font-medium">{data.customerName}</TableCell>
                      <TableCell>{data.postalCode}</TableCell>
                      <TableCell>{data.prefecture}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="truncate max-w-[200px]" title={data.currentAddress}>
                            {data.currentAddress}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-1 text-primary"
                            onClick={() => handleViewMap(data.currentAddress)}
                          >
                            <MapPin size={16} />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="truncate max-w-[200px]" title={data.inheritanceAddress}>
                            {data.inheritanceAddress}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-1 text-primary"
                            onClick={() => handleViewMap(data.inheritanceAddress)}
                          >
                            <MapPin size={16} />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            data.status === "registered"
                              ? "default"
                              : data.status === "error"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {data.status === "registered" ? "登録済み" : data.status === "error" ? "エラー" : "未登録"}
                        </Badge>
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
                                setSelectedData(data)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            {data.status !== "registered" && (
                              <DropdownMenuItem onClick={() => handleRegisterToList(data)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                取得リストに登録
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedData(data)
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
        </div>
      </CardContent>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>抽出データ編集</DialogTitle>
            <DialogDescription>抽出された相続不動産情報を編集します。</DialogDescription>
          </DialogHeader>
          {selectedData && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="customerName" className="text-right">
                  顧客名
                </label>
                <Input
                  id="customerName"
                  value={selectedData.customerName}
                  onChange={(e) => setSelectedData({ ...selectedData, customerName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="postalCode" className="text-right">
                  郵便番号
                </label>
                <Input
                  id="postalCode"
                  value={selectedData.postalCode}
                  onChange={(e) => setSelectedData({ ...selectedData, postalCode: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="prefecture" className="text-right">
                  都道府県
                </label>
                <Input
                  id="prefecture"
                  value={selectedData.prefecture}
                  onChange={(e) => setSelectedData({ ...selectedData, prefecture: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="currentAddress" className="text-right">
                  顧客現在住所
                </label>
                <Input
                  id="currentAddress"
                  value={selectedData.currentAddress}
                  onChange={(e) => setSelectedData({ ...selectedData, currentAddress: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="inheritanceAddress" className="text-right">
                  顧客相続住所
                </label>
                <Input
                  id="inheritanceAddress"
                  value={selectedData.inheritanceAddress}
                  onChange={(e) => setSelectedData({ ...selectedData, inheritanceAddress: e.target.value })}
                  className="col-span-3"
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
            <DialogTitle>データ削除の確認</DialogTitle>
            <DialogDescription>このデータを削除してもよろしいですか？この操作は元に戻せません。</DialogDescription>
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
    </Card>
  )
}
