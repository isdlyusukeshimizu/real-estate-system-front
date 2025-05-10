"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileDown, Save, X } from "lucide-react"

// 仮のデータ型定義
type RegistryInfo = {
  id: string
  address: string
  owner: string
  phoneNumber: string
  registrationDate: string
}

// ダミーデータ生成関数
const generateDummyData = (): RegistryInfo[] => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: `${i + 1}`,
    address: `東京都渋谷区${i + 1}-${i + 1}-${i + 1}`,
    owner: `山田太郎${i + 1}`,
    phoneNumber: `03-${1234 + i}-${5678 + i}`,
    registrationDate: `2023-${String(5 + Math.floor(i / 30)).padStart(2, "0")}-${String((i % 30) + 1).padStart(2, "0")}`,
  }))
}

export default function RegistryInfoList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [registryInfos, setRegistryInfos] = useState<RegistryInfo[]>(generateDummyData())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<RegistryInfo | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const itemsPerPage = 10

  const filteredInfos = registryInfos.filter(
    (info) =>
      (info.address.includes(searchTerm) || info.owner.includes(searchTerm)) &&
      (startDate === "" || info.registrationDate >= startDate) &&
      (endDate === "" || info.registrationDate <= endDate),
  )

  const totalPages = Math.ceil(filteredInfos.length / itemsPerPage)
  const paginatedInfos = filteredInfos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleExportCSV = () => {
    // CSVエクスポートのロジックを実装
    const csvContent = [
      ["ID", "住所", "所有者", "電話番号", "登録日"],
      ...filteredInfos.map((info) => [info.id, info.address, info.owner, info.phoneNumber, info.registrationDate]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "registry_info.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleEdit = (info: RegistryInfo) => {
    setEditingId(info.id)
    setEditData({ ...info })
  }

  const handleSave = () => {
    if (editData) {
      setRegistryInfos((prevInfos) => prevInfos.map((info) => (info.id === editData.id ? editData : info)))
      setEditingId(null)
      setEditData(null)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData(null)
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
  }

  const confirmDelete = () => {
    if (deletingId) {
      setRegistryInfos((prevInfos) => prevInfos.filter((info) => info.id !== deletingId))
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <Input
          type="text"
          placeholder="検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-auto"
        />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full sm:w-auto"
        />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:w-auto" />
        <Button onClick={handleExportCSV} className="w-full sm:w-auto">
          <FileDown className="mr-2 h-4 w-4" /> CSVエクスポート
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>住所</TableHead>
              <TableHead>所有者</TableHead>
              <TableHead>電話番号</TableHead>
              <TableHead>登録日</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInfos.map((info) => (
              <TableRow key={info.id}>
                <TableCell>
                  {editingId === info.id ? (
                    <Input
                      value={editData?.address}
                      onChange={(e) => setEditData({ ...editData!, address: e.target.value })}
                    />
                  ) : (
                    info.address
                  )}
                </TableCell>
                <TableCell>
                  {editingId === info.id ? (
                    <Input
                      value={editData?.owner}
                      onChange={(e) => setEditData({ ...editData!, owner: e.target.value })}
                    />
                  ) : (
                    info.owner
                  )}
                </TableCell>
                <TableCell>
                  {editingId === info.id ? (
                    <Input
                      value={editData?.phoneNumber}
                      onChange={(e) => setEditData({ ...editData!, phoneNumber: e.target.value })}
                    />
                  ) : (
                    info.phoneNumber
                  )}
                </TableCell>
                <TableCell>
                  {editingId === info.id ? (
                    <Input
                      type="date"
                      value={editData?.registrationDate}
                      onChange={(e) => setEditData({ ...editData!, registrationDate: e.target.value })}
                    />
                  ) : (
                    info.registrationDate
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    {editingId === info.id ? (
                      <>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleSave}>
                          <Save className="mr-2 h-4 w-4" /> 保存
                        </Button>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleCancel}>
                          <X className="mr-2 h-4 w-4" /> キャンセル
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => handleEdit(info)}
                        >
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => handleDelete(info.id)}
                        >
                          削除
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div>
          {currentPage} / {totalPages} ページ
        </div>
        <div className="space-x-2">
          <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            前へ
          </Button>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            次へ
          </Button>
        </div>
      </div>
      {deletingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">本当に削除しますか？</h3>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeletingId(null)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                削除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
