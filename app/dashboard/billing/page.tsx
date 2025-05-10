import type { Metadata } from "next"
import BillingManagement from "@/components/dashboard/billing-management"

export const metadata: Metadata = {
  title: "請求管理 | 登記簿情報自動取得サービス",
}

export default function BillingPage() {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">請求管理</h2>
      <BillingManagement />
    </>
  )
}
