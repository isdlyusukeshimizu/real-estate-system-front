import type { Metadata } from "next"
import MemberManagement from "@/components/dashboard/member-management"

export const metadata: Metadata = {
  title: "メンバー管理 | 登記簿情報自動取得サービス",
}

export default function MembersPage() {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">メンバー管理</h2>
      <MemberManagement />
    </>
  )
}
