import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F9F7]">
      <h1 className="text-4xl font-bold mb-4">404 - ページが見つかりません</h1>
      <p className="text-xl mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
      <Link href="/dashboard" className="text-primary hover:underline">
        ダッシュボードに戻る
      </Link>
    </div>
  )
}
