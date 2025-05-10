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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, MoreHorizontal, Search, Trash2, Edit, UserPlus, Mail, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

// メンバーデータの型定義
type MemberRole = "admin" | "manager" | "staff"
type MemberStatus = "active" | "inactive" | "pending"

type Member = {
  id: string
  name: string
  email: string
  phoneNumber: string
  role: MemberRole
  status: MemberStatus
  joinDate: string
  lastActive: string
  registryCount: number
  notes: string
  permissions: {
    canUpload: boolean
    canEdit: boolean
    canDelete: boolean
    canManageCustomers: boolean
  }
}

// ダミーデータ生成
const generateDummyMembers = (): Member[] => {
  const roles: MemberRole[] = ["admin", "manager", "staff"]
  const statuses: MemberStatus[] = ["active", "inactive", "pending"]

  return Array.from({ length: 10 }, (_, i) => {
    const joinDate = new Date()
    joinDate.setMonth(joinDate.getMonth() - Math.floor(Math.random() * 12))

    const lastActive = new Date()
    if (i % 3 === 0) {
      lastActive.setDate(lastActive.getDate() - Math.floor(Math.random() * 30))
    } else {
      lastActive.setHours(lastActive.getHours() - Math.floor(Math.random() * 24))
    }

    const role = roles[Math.floor(Math.random() * roles.length)]

    return {
      id: `MEM-${1000 + i}`,
      name: `社員 ${i + 1}`,
      email: `member${i + 1}@example.com`,
      phoneNumber: `080-${1234 + i}-${5678 + i}`,
      role: role,
      status: i % 5 === 0 ? "pending" : i % 7 === 0 ? "inactive" : "active",
      joinDate: joinDate.toISOString().split("T")[0],
      lastActive: lastActive.toISOString().split("T")[0],
      registryCount: Math.floor(Math.random() * 100),
      notes: i % 3 === 0 ? "新入社員研修中" : "",
      permissions: {
        canUpload: role === "admin" || role === "manager" || Math.random() > 0.3,
        canEdit: role === "admin" || role === "manager" || Math.random() > 0.5,
        canDelete: role === "admin" || Math.random() > 0.7,
        canManageCustomers: role === "admin" || role === "manager" || Math.random() > 0.4,
      },
    }
  })
}

export default function MemberManagement() {
  const [members, setMembers] = useState<Member[]>(generateDummyMembers())
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [newMember, setNewMember] = useState<Partial<Member>>({
    role: "staff",
    status: "pending",
    permissions: {
      canUpload: true,
      canEdit: false,
      canDelete: false,
      canManageCustomers: false,
    },
  })
  const [activeTab, setActiveTab] = useState<MemberStatus | "all">("all")
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    body: "",
  })
  const { toast } = useToast()

  // 検索フィルター
  const filteredMembers = members.filter(
    (member) =>
      (activeTab === "all" || member.status === activeTab) &&
      (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phoneNumber.includes(searchTerm)),
  )

  // 編集処理
  const handleEdit = () => {
    if (!selectedMember) return

    setMembers(members.map((member) => (member.id === selectedMember.id ? selectedMember : member)))
    setIsEditDialogOpen(false)
    setSelectedMember(null)

    toast({
      title: "メンバー情報を更新しました",
      description: "メンバーデータが正常に更新されました",
    })
  }

  // 削除処理
  const handleDelete = () => {
    if (!selectedMember) return

    setMembers(members.filter((member) => member.id !== selectedMember.id))
    setIsDeleteDialogOpen(false)
    setSelectedMember(null)

    toast({
      title: "メンバーを削除しました",
      description: "メンバーデータが正常に削除されました",
    })
  }

  // 新規メンバー追加
  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return

    const id = `MEM-${1000 + members.length}`
    const newMemberData: Member = {
      id,
      name: newMember.name || "",
      email: newMember.email || "",
      phoneNumber: newMember.phoneNumber || "",
      role: (newMember.role as MemberRole) || "staff",
      status: (newMember.status as MemberStatus) || "pending",
      joinDate: new Date().toISOString().split("T")[0],
      lastActive: new Date().toISOString().split("T")[0],
      registryCount: 0,
      notes: newMember.notes || "",
      permissions: newMember.permissions || {
        canUpload: true,
        canEdit: false,
        canDelete: false,
        canManageCustomers: false,
      },
    }

    setMembers([newMemberData, ...members])
    setIsAddDialogOpen(false)
    setNewMember({
      role: "staff",
      status: "pending",
      permissions: {
        canUpload: true,
        canEdit: false,
        canDelete: false,
        canManageCustomers: false,
      },
    })

    toast({
      title: "メンバーを追加しました",
      description: "新しいメンバーが正常に追加されました",
    })
  }

  // メール送信処理
  const handleSendEmail = (email: string) => {
    setEmailData({
      to: email,
      subject: "",
      body: "",
    })
    setIsEmailDialogOpen(true)
  }

  // メール送信実行
  const handleSubmitEmail = () => {
    toast({
      title: "メールを送信しました",
      description: `${emailData.to} 宛にメールを送信しました`,
    })
    setIsEmailDialogOpen(false)
  }

  // ステータスの表示名とテキストスタイル
  const getStatusInfo = (status: MemberStatus) => {
    switch (status) {
      case "active":
        return { label: "アクティブ", textColor: "text-green-600" }
      case "inactive":
        return { label: "非アクティブ", textColor: "text-gray-500" }
      case "pending":
        return { label: "保留中", textColor: "text-amber-500" }
    }
  }

  // ロールの表示名
  const getRoleLabel = (role: MemberRole) => {
    switch (role) {
      case "admin":
        return "管理者"
      case "manager":
        return "マネージャー"
      case "staff":
        return "スタッフ"
    }
  }

  // CSVエクスポート
  const handleExportCSV = () => {
    const csvContent = [
      [
        "ID",
        "名前",
        "メールアドレス",
        "電話番号",
        "役割",
        "ステータス",
        "参加日",
        "最終アクティブ",
        "登記簿取得数",
        "メモ",
      ],
      ...filteredMembers.map((member) => [
        member.id,
        member.name,
        member.email,
        member.phoneNumber,
        getRoleLabel(member.role),
        getStatusInfo(member.status).label,
        member.joinDate,
        member.lastActive,
        member.registryCount.toString(),
        member.notes,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "members.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg text-primary">メンバー管理</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              新規メンバー
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSVエクスポート
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="名前、メール、電話番号で検索..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as MemberStatus | "all")}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">すべて</TabsTrigger>
              <TabsTrigger value="active">アクティブ</TabsTrigger>
              <TabsTrigger value="inactive">非アクティブ</TabsTrigger>
              <TabsTrigger value="pending">保留中</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名前</TableHead>
                      <TableHead>メールアドレス</TableHead>
                      <TableHead>電話番号</TableHead>
                      <TableHead>役割</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>参加日</TableHead>
                      <TableHead>登記簿取得数</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          該当するメンバーデータがありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => {
                        const statusInfo = getStatusInfo(member.status)
                        return (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>{member.phoneNumber}</TableCell>
                            <TableCell>{getRoleLabel(member.role)}</TableCell>
                            <TableCell>
                              <Select
                                value={member.status}
                                onValueChange={(value) => {
                                  const updatedMember = { ...member, status: value as MemberStatus }
                                  setMembers(members.map((m) => (m.id === member.id ? updatedMember : m)))
                                }}
                              >
                                <SelectTrigger className="w-[120px] border-none">
                                  <span className={statusInfo.textColor}>{statusInfo.label}</span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">アクティブ</SelectItem>
                                  <SelectItem value="inactive">非アクティブ</SelectItem>
                                  <SelectItem value="pending">保留中</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                {member.joinDate}
                              </div>
                            </TableCell>
                            <TableCell>{member.registryCount}件</TableCell>
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
                                      setSelectedMember(member)
                                      setIsEditDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    編集
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSendEmail(member.email)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    メール送信
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      setSelectedMember(member)
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
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>メンバー情報編集</DialogTitle>
            <DialogDescription>メンバー情報を編集します。</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  名前
                </label>
                <Input
                  id="name"
                  value={selectedMember.name}
                  onChange={(e) => setSelectedMember({ ...selectedMember, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right">
                  メールアドレス
                </label>
                <Input
                  id="email"
                  type="email"
                  value={selectedMember.email}
                  onChange={(e) => setSelectedMember({ ...selectedMember, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phoneNumber" className="text-right">
                  電話番号
                </label>
                <Input
                  id="phoneNumber"
                  value={selectedMember.phoneNumber}
                  onChange={(e) => setSelectedMember({ ...selectedMember, phoneNumber: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="role" className="text-right">
                  役割
                </label>
                <Select
                  value={selectedMember.role}
                  onValueChange={(value) => setSelectedMember({ ...selectedMember, role: value as MemberRole })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="役割を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">管理者</SelectItem>
                    <SelectItem value="manager">マネージャー</SelectItem>
                    <SelectItem value="staff">スタッフ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="status" className="text-right">
                  ステータス
                </label>
                <Select
                  value={selectedMember.status}
                  onValueChange={(value) => setSelectedMember({ ...selectedMember, status: value as MemberStatus })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">アクティブ</SelectItem>
                    <SelectItem value="inactive">非アクティブ</SelectItem>
                    <SelectItem value="pending">保留中</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-right pt-2">権限</label>
                <div className="col-span-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="canUpload" className="text-sm">
                      登記簿アップロード
                    </label>
                    <Switch
                      id="canUpload"
                      checked={selectedMember.permissions.canUpload}
                      onCheckedChange={(checked) =>
                        setSelectedMember({
                          ...selectedMember,
                          permissions: { ...selectedMember.permissions, canUpload: checked },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="canEdit" className="text-sm">
                      データ編集
                    </label>
                    <Switch
                      id="canEdit"
                      checked={selectedMember.permissions.canEdit}
                      onCheckedChange={(checked) =>
                        setSelectedMember({
                          ...selectedMember,
                          permissions: { ...selectedMember.permissions, canEdit: checked },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="canDelete" className="text-sm">
                      データ削除
                    </label>
                    <Switch
                      id="canDelete"
                      checked={selectedMember.permissions.canDelete}
                      onCheckedChange={(checked) =>
                        setSelectedMember({
                          ...selectedMember,
                          permissions: { ...selectedMember.permissions, canDelete: checked },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="canManageCustomers" className="text-sm">
                      顧客管理
                    </label>
                    <Switch
                      id="canManageCustomers"
                      checked={selectedMember.permissions.canManageCustomers}
                      onCheckedChange={(checked) =>
                        setSelectedMember({
                          ...selectedMember,
                          permissions: { ...selectedMember.permissions, canManageCustomers: checked },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="notes" className="text-right pt-2">
                  メモ
                </label>
                <Textarea
                  id="notes"
                  value={selectedMember.notes}
                  onChange={(e) => setSelectedMember({ ...selectedMember, notes: e.target.value })}
                  className="col-span-3"
                  rows={3}
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
            <DialogTitle>メンバー削除の確認</DialogTitle>
            <DialogDescription>このメンバーを削除してもよろしいですか？この操作は元に戻せません。</DialogDescription>
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

      {/* 新規メンバー追加ダイアログ */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>新規メンバー追加</DialogTitle>
            <DialogDescription>新しいメンバー情報を入力してください。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-name" className="text-right">
                名前
              </label>
              <Input
                id="new-name"
                value={newMember.name || ""}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-email" className="text-right">
                メールアドレス
              </label>
              <Input
                id="new-email"
                type="email"
                value={newMember.email || ""}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-phone" className="text-right">
                電話番号
              </label>
              <Input
                id="new-phone"
                value={newMember.phoneNumber || ""}
                onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-role" className="text-right">
                役割
              </label>
              <Select
                value={newMember.role}
                onValueChange={(value) => setNewMember({ ...newMember, role: value as MemberRole })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="役割を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理者</SelectItem>
                  <SelectItem value="manager">マネージャー</SelectItem>
                  <SelectItem value="staff">スタッフ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-status" className="text-right">
                ステータス
              </label>
              <Select
                value={newMember.status}
                onValueChange={(value) => setNewMember({ ...newMember, status: value as MemberStatus })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">アクティブ</SelectItem>
                  <SelectItem value="inactive">非アクティブ</SelectItem>
                  <SelectItem value="pending">保留中</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="new-notes" className="text-right pt-2">
                メモ
              </label>
              <Textarea
                id="new-notes"
                value={newMember.notes || ""}
                onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAddMember} disabled={!newMember.name || !newMember.email}>
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* メール送信ダイアログ */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>メール送信</DialogTitle>
            <DialogDescription>メンバーにメールを送信します。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email-to" className="text-right">
                宛先
              </label>
              <Input id="email-to" value={emailData.to} readOnly className="col-span-3 bg-muted" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email-subject" className="text-right">
                件名
              </label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="email-body" className="text-right pt-2">
                本文
              </label>
              <Textarea
                id="email-body"
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                className="col-span-3"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSubmitEmail} disabled={!emailData.subject || !emailData.body}>
              送信
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
