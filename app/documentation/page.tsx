import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Users, Upload, UserCircle, Building, AlertTriangle, BookOpen } from "lucide-react"

export default function DocumentationPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            トップに戻る
          </Button>
        </Link>
        <Link href="/tutorials">
          <Button variant="outline" size="sm" className="mr-4">
            <BookOpen className="mr-2 h-4 w-4" />
            チュートリアルを見る
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">登記簿情報取得システム 利用マニュアル</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">システム概要</TabsTrigger>
          <TabsTrigger value="member">メンバー向け機能</TabsTrigger>
          <TabsTrigger value="owner">オーナー向け機能</TabsTrigger>
          <TabsTrigger value="faq">よくある質問</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>システム概要</CardTitle>
              <CardDescription>登記簿情報取得システムの概要と基本的な機能について説明します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">システムの目的</h3>
                <p>
                  本システムは、登記簿情報の取得・管理と、それに基づく顧客情報の管理を効率化するためのシステムです。登記簿情報をアップロードし、自動的に情報を抽出して顧客データベースを構築します。また、顧客へのアプローチ状況を記録・管理することができます。
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">ユーザー区分</h3>
                <p className="mb-4">本システムには以下の2種類のユーザー区分があります。</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <UserCircle className="mr-2 h-5 w-5" />
                        メンバー
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>
                        登記簿情報のアップロードや顧客情報の管理を行うユーザーです。日常的な業務を遂行するためのアカウントです。
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <Building className="mr-2 h-5 w-5" />
                        オーナー
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>
                        メンバーの管理や請求情報の確認を行うことができる管理者アカウントです。システム全体の運用を管理します。
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">システムの基本的な流れ</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>メンバーが登記簿情報をアップロードする</li>
                  <li>システムが自動的に情報を抽出し、顧客データベースに登録する</li>
                  <li>メンバーは顧客情報を確認し、必要に応じて編集・追加を行う</li>
                  <li>顧客へのアプローチ状況を記録し、進捗を管理する</li>
                  <li>オーナーはメンバーの活動状況や請求情報を確認する</li>
                </ol>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">システムへのアクセス</h3>
                <p>
                  システムへのアクセスはログイン画面から行います。ユーザー名とパスワードを入力してログインしてください。ログイン後は、ユーザー区分に応じたダッシュボードが表示されます。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="member" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>メンバー向け機能</CardTitle>
              <CardDescription>メンバーが利用できる機能について説明します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <UserCircle className="mr-2 h-5 w-5" />
                  顧客情報管理
                </h3>
                <p className="mb-4">
                  登記簿情報から抽出された顧客情報を管理するための機能です。顧客の基本情報や接触履歴を記録し、効率的な営業活動をサポートします。
                </p>

                <div className="space-y-3 pl-4">
                  <div>
                    <h4 className="font-medium">主な機能</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>顧客一覧の表示・検索・フィルタリング</li>
                      <li>顧客情報の編集・追加</li>
                      <li>顧客とのコミュニケーション履歴の記録</li>
                      <li>メール送信機能</li>
                      <li>住所の地図表示・比較</li>
                      <li>顧客データのCSVエクスポート</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">使い方のポイント</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>顧客ステータスを適切に更新することで、営業活動の進捗を視覚的に管理できます</li>
                      <li>活動記録を定期的に入力することで、チーム内での情報共有がスムーズになります</li>
                      <li>地図表示機能を活用して、物件の位置関係を把握しましょう</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  登記簿情報アップロード
                </h3>
                <p className="mb-4">
                  登記簿情報をシステムにアップロードし、自動的に情報を抽出するための機能です。PDFファイルをアップロードすることで、システムが自動的に情報を解析します。
                </p>

                <div className="space-y-3 pl-4">
                  <div>
                    <h4 className="font-medium">主な機能</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>登記簿PDFのアップロード</li>
                      <li>自動情報抽出の進捗確認</li>
                      <li>抽出結果の確認・修正</li>
                      <li>抽出データの顧客情報への変換</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">使い方のポイント</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>PDFは鮮明なものを使用することで、抽出精度が向上します</li>
                      <li>抽出結果は必ず確認し、必要に応じて修正してください</li>
                      <li>一度に複数のPDFをアップロードすることも可能です</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  エラーレポート
                </h3>
                <p className="mb-4">
                  情報抽出時に発生したエラーや問題を確認するための機能です。エラーの内容を確認し、適切な対応を行うことができます。
                </p>

                <div className="space-y-3 pl-4">
                  <div>
                    <h4 className="font-medium">主な機能</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>エラーの一覧表示</li>
                      <li>エラー内容の詳細確認</li>
                      <li>エラー対応状況の管理</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">使い方のポイント</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>定期的にエラーレポートを確認し、未対応のエラーがないか確認しましょう</li>
                      <li>解決できないエラーはオーナーに報告してください</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owner" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>オーナー向け機能</CardTitle>
              <CardDescription>オーナーが利用できる機能について説明します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  メンバー管理
                </h3>
                <p className="mb-4">
                  システムを利用するメンバーを管理するための機能です。メンバーの追加・編集・削除や、アクセス権限の設定を行うことができます。
                </p>

                <div className="space-y-3 pl-4">
                  <div>
                    <h4 className="font-medium">主な機能</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>メンバー一覧の表示</li>
                      <li>メンバーの追加・編集・削除</li>
                      <li>メンバーの活動状況の確認</li>
                      <li>パスワードのリセット</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">使い方のポイント</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>新しいメンバーを追加する際は、初期パスワードを設定し、メンバーに通知してください</li>
                      <li>退職者のアカウントは速やかに削除または無効化してください</li>
                      <li>定期的にメンバーの活動状況を確認し、必要に応じてフィードバックを行いましょう</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  請求管理
                </h3>
                <p className="mb-4">
                  登記簿情報の取得にかかった費用を管理するための機能です。取得した登記簿の件数に基づいて自動的に費用が計算されます。
                </p>

                <div className="space-y-3 pl-4">
                  <div>
                    <h4 className="font-medium">主な機能</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>月別の請求額一覧</li>
                      <li>登記簿取得履歴の確認</li>
                      <li>メンバー別の取得状況</li>
                      <li>請求データのエクスポート</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">使い方のポイント</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>請求額は登記簿1件あたり331円で自動計算されます</li>
                      <li>月末に請求データをエクスポートして、経理処理に利用してください</li>
                      <li>取得履歴から、誰がいつどの登記簿を取得したかを確認できます</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  エラーレポート
                </h3>
                <p className="mb-4">
                  システム全体で発生したエラーや問題を確認するための機能です。メンバーが報告したエラーも含めて、一元的に管理することができます。
                </p>

                <div className="space-y-3 pl-4">
                  <div>
                    <h4 className="font-medium">主な機能</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>全エラーの一覧表示</li>
                      <li>エラー内容の詳細確認</li>
                      <li>エラー対応状況の管理</li>
                      <li>エラー統計の確認</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">使い方のポイント</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>定期的にエラーレポートを確認し、システム全体の健全性を把握しましょう</li>
                      <li>頻発するエラーがある場合は、システム改善の検討が必要かもしれません</li>
                      <li>重要なエラーは優先的に対応してください</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>よくある質問</CardTitle>
              <CardDescription>システム利用に関するよくある質問と回答です。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">ログインと基本操作</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Q: パスワードを忘れてしまいました。どうすればよいですか？</h4>
                    <p className="pl-4 mt-1">
                      A:
                      ログイン画面の「パスワードをお忘れですか？」リンクをクリックし、登録したメールアドレスを入力してください。パスワードリセット用のリンクが送信されます。オーナーの場合は、システム管理者に連絡してください。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Q: ログアウトはどこからできますか？</h4>
                    <p className="pl-4 mt-1">
                      A:
                      画面右上のユーザー名の横にあるログアウトボタン、またはサイドバーの下部にあるログアウトボタンからログアウトできます。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Q: システムにアクセスできる端末に制限はありますか？</h4>
                    <p className="pl-4 mt-1">
                      A:
                      特に制限はありません。PCやタブレット、スマートフォンなど、インターネットに接続できる端末であれば利用可能です。ただし、画面サイズの関係上、PCでの利用を推奨しています。
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">登記簿情報のアップロード</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Q: どのような形式の登記簿ファイルをアップロードできますか？</h4>
                    <p className="pl-4 mt-1">
                      A:
                      現在はPDF形式のみ対応しています。スキャンしたPDFの場合は、テキスト認識が可能な鮮明なものを使用してください。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Q: アップロードしたファイルの処理にはどれくらい時間がかかりますか？</h4>
                    <p className="pl-4 mt-1">
                      A:
                      ファイルのサイズや内容によって異なりますが、通常は数分程度で処理が完了します。処理状況はアップロード画面で確認できます。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Q: 情報抽出に失敗した場合はどうすればよいですか？</h4>
                    <p className="pl-4 mt-1">
                      A:
                      エラーレポート画面でエラー内容を確認し、必要に応じて再アップロードを行ってください。解決しない場合は、手動で顧客情報を入力することも可能です。
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">顧客情報管理</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Q: 顧客情報を一括でインポートすることはできますか？</h4>
                    <p className="pl-4 mt-1">
                      A:
                      現在の機能では、CSVエクスポートのみ対応しています。一括インポート機能は今後のアップデートで追加される予定です。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Q: 顧客情報を誤って削除してしまいました。復元できますか？</h4>
                    <p className="pl-4 mt-1">
                      A:
                      削除した顧客情報の復元はできません。削除前に確認ダイアログが表示されますので、慎重に操作してください。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Q: 顧客へのメール送信履歴は保存されますか？</h4>
                    <p className="pl-4 mt-1">
                      A:
                      はい、メール送信履歴は活動記録として自動的に保存されます。送信内容や日時を後から確認することができます。
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">請求管理</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Q: 請求額はどのように計算されますか？</h4>
                    <p className="pl-4 mt-1">
                      A: 登記簿1件あたり331円で計算されます。月ごとの取得件数に基づいて自動的に計算されます。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Q: 請求データを外部システムに連携することはできますか？</h4>
                    <p className="pl-4 mt-1">
                      A:
                      請求データはCSV形式でエクスポートできますので、外部の会計システムなどにインポートして利用することができます。
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">その他</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Q: システムの動作が遅い場合はどうすればよいですか？</h4>
                    <p className="pl-4 mt-1">
                      A:
                      ブラウザのキャッシュをクリアするか、別のブラウザで試してみてください。問題が解決しない場合は、システム管理者に連絡してください。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Q: システムの機能追加や改善要望はどこに伝えればよいですか？</h4>
                    <p className="pl-4 mt-1">
                      A:
                      オーナーを通じてシステム開発者に連絡してください。定期的なアップデートで機能改善が行われる予定です。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
