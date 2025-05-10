"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// 月次データ
const monthlyData = [
  { name: "1月", リスト数: 120, アポ獲得: 45, 成約: 22, 失注: 23 },
  { name: "2月", リスト数: 140, アポ獲得: 52, 成約: 28, 失注: 24 },
  { name: "3月", リスト数: 160, アポ獲得: 65, 成約: 35, 失注: 30 },
  { name: "4月", リスト数: 180, アポ獲得: 72, 成約: 40, 失注: 32 },
  { name: "5月", リスト数: 200, アポ獲得: 85, 成約: 48, 失注: 37 },
  { name: "6月", リスト数: 220, アポ獲得: 95, 成約: 55, 失注: 40 },
]

// ステータス別データ
const statusData = [
  { name: "担当者登録", value: 120, color: "#8884d8" },
  { name: "未アタック", value: 80, color: "#82ca9d" },
  { name: "アタック済み", value: 40, color: "#ffc658" },
  { name: "アポ獲得", value: 30, color: "#ff8042" },
  { name: "成約", value: 20, color: "#0088fe" },
  { name: "失注", value: 10, color: "#ff0000" },
]

// 営業担当者別データ
const salesPersonData = [
  { name: "田中", リスト数: 50, アポ獲得: 20, 成約: 12, 失注: 8 },
  { name: "佐藤", リスト数: 45, アポ獲得: 18, 成約: 10, 失注: 8 },
  { name: "鈴木", リスト数: 55, アポ獲得: 25, 成約: 15, 失注: 10 },
  { name: "高橋", リスト数: 40, アポ獲得: 15, 成約: 8, 失注: 7 },
  { name: "伊藤", リスト数: 60, アポ獲得: 30, 成約: 18, 失注: 12 },
]

// KPI計算
const calculateKPIs = (data: any[]) => {
  const latestMonth = data[data.length - 1]
  const totalLists = latestMonth.リスト数
  const totalAppointments = latestMonth.アポ獲得
  const totalContracts = latestMonth.成約
  const totalLosses = latestMonth.失注

  const appointmentRate = (totalAppointments / totalLists) * 100
  const contractRate = (totalContracts / totalAppointments) * 100

  return {
    totalLists,
    totalAppointments,
    totalContracts,
    totalLosses,
    appointmentRate,
    contractRate,
  }
}

export default function SalesMetrics() {
  const [period, setPeriod] = useState("monthly")
  const kpis = calculateKPIs(monthlyData)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="status">ステータス分析</TabsTrigger>
          <TabsTrigger value="salesperson">営業担当者別</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">リスト総数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.totalLists}</div>
                <p className="text-xs text-muted-foreground">今月の取得リスト総数</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">アポ獲得数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.totalAppointments}</div>
                <p className="text-xs text-muted-foreground">アポ獲得率: {kpis.appointmentRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">成約数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.totalContracts}</div>
                <p className="text-xs text-muted-foreground">成約率: {kpis.contractRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">失注数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.totalLosses}</div>
                <p className="text-xs text-muted-foreground">
                  失注率: {((kpis.totalLosses / kpis.totalAppointments) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>月次推移</CardTitle>
              <CardDescription>月別の取得リスト件数とアポ獲得・成約・失注の推移</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="リスト数" fill="#8884d8" />
                    <Bar dataKey="アポ獲得" fill="#82ca9d" />
                    <Bar dataKey="成約" fill="#0088fe" />
                    <Bar dataKey="失注" fill="#ff0000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ステータス別分布</CardTitle>
              <CardDescription>現在の取得リストのステータス別分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ステータス推移</CardTitle>
              <CardDescription>過去6ヶ月のステータス推移</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="アポ獲得" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="成約" stackId="a" fill="#0088fe" />
                    <Bar dataKey="失注" stackId="a" fill="#ff0000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salesperson" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>営業担当者別パフォーマンス</CardTitle>
              <CardDescription>営業担当者別のリスト数・アポ獲得・成約・失注</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesPersonData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="リスト数" fill="#8884d8" />
                    <Bar dataKey="アポ獲得" fill="#82ca9d" />
                    <Bar dataKey="成約" fill="#0088fe" />
                    <Bar dataKey="失注" fill="#ff0000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>アポ獲得率ランキング</CardTitle>
                <CardDescription>営業担当者別のアポ獲得率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesPersonData
                    .map((person) => ({
                      ...person,
                      rate: (person.アポ獲得 / person.リスト数) * 100,
                    }))
                    .sort((a, b) => b.rate - a.rate)
                    .map((person, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-16 font-medium">{person.name}</span>
                        <div className="flex-1 h-2 bg-secondary ml-2 mr-2">
                          <div className="h-full bg-primary" style={{ width: `${person.rate}%` }} />
                        </div>
                        <span className="w-16 text-right">{person.rate.toFixed(1)}%</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>成約率ランキング</CardTitle>
                <CardDescription>営業担当者別の成約率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesPersonData
                    .map((person) => ({
                      ...person,
                      rate: (person.成約 / person.アポ獲得) * 100,
                    }))
                    .sort((a, b) => b.rate - a.rate)
                    .map((person, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-16 font-medium">{person.name}</span>
                        <div className="flex-1 h-2 bg-secondary ml-2 mr-2">
                          <div className="h-full bg-primary" style={{ width: `${person.rate}%` }} />
                        </div>
                        <span className="w-16 text-right">{person.rate.toFixed(1)}%</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
