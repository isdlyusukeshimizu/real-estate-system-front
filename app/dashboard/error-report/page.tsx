import type { Metadata } from "next"
import ErrorReportList from "@/components/error-report-list"

export const metadata: Metadata = {
  title: "エラーレポート | 登記簿情報取得システム",
}

export default function ErrorReportPage() {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">エラーレポート</h2>
      <ErrorReportList />
    </>
  )
}
