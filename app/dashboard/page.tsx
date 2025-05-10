"use client"

import { useEffect, useState } from "react"
import SalesMetrics from "@/components/dashboard/sales-metrics"
import AcquisitionList from "@/components/dashboard/acquisition-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DashboardPage() {
  const [username, setUsername] = useState<string>("")

  // コンポーネントがマウントされたときにセッションストレージからユーザー情報を取得
  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  // サンプルデータ
  const recentCustomers = [
    {
      id: "CUST-1001",
      name: "相続者 太郎1",
      phoneNumber: "03-1234-5678",
      status: "new",
      assignedTo: "佐藤 一郎",
      date: "2023-05-01",
    },
    {
      id: "CUST-1002",
      name: "相続者 太郎2",
      phoneNumber: "03-1235-5679",
      status: "contacted",
      assignedTo: "鈴木 次郎",
      date: "2023-05-02",
    },
    {
      id: "CUST-1003",
      name: "相続者 太郎3",
      phoneNumber: "03-1236-5680",
      status: "negotiating",
      assignedTo: "田中 三郎",
      date: "2023-05-03",
    },
    {
      id: "CUST-1004",
      name: "相続者 太郎4",
      phoneNumber: "03-1237-5681",
      status: "contracted",
      assignedTo: "高橋 四郎",
      date: "2023-05-04",
    },
    {
      id: "CUST-1005",
      name: "相続者 太郎5",
      phoneNumber: "03-1238-5682",
      status: "closed",
      assignedTo: "渡辺 五郎",
      date: "2023-05-05",
    },
  ]

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">登記簿情報ダッシュボード</h2>

      {/* 上部の6つの統計カードを削除 */}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">最近の顧客</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>顧客名</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead>登録日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phoneNumber}</TableCell>
                  <TableCell>
                    <span
                      className={`text-${customer.status === "new" ? "blue" : customer.status === "contacted" ? "gray" : customer.status === "negotiating" ? "purple" : customer.status === "contracted" || customer.status === "closed" ? "green" : "red"}-600`}
                    >
                      {customer.status === "new"
                        ? "新規"
                        : customer.status === "contacted"
                          ? "接触済"
                          : customer.status === "negotiating"
                            ? "商談中"
                            : customer.status === "contracted"
                              ? "契約済"
                              : customer.status === "closed"
                                ? "成約"
                                : "失注"}
                    </span>
                  </TableCell>
                  <TableCell>{customer.assignedTo}</TableCell>
                  <TableCell>{customer.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SalesMetrics />
      <div className="h-8" />
      <AcquisitionList />
    </>
  )
}
