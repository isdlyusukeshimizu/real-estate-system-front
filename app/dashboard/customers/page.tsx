import type { Metadata } from "next"
import CustomerManagement from "@/components/customer-management"

export const metadata: Metadata = {
  title: "顧客情報管理 | 登記簿情報取得システム",
}

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">顧客情報管理</h1>
        <p className="text-muted-foreground">相続不動産所有者の情報を管理し、効率的に対応します。</p>
      </div>
      <CustomerManagement />
    </div>
  )
}
