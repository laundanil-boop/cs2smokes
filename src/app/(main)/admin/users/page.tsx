'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Ban, CheckCircle, Shield, Trash2, Edit, Search, Users, FileText, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface User {
  id: string
  email: string
  username: string
  role: string
  banned: boolean
  banReason?: string | null
  createdAt: Date
  _count: {
    lineups: number
    comments: number
    favorites: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [userToBan, setUserToBan] = useState<User | null>(null)
  const [banReason, setBanReason] = useState('')
  const [banning, setBanning] = useState(false)

  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<string>('user')
  const [editing, setEditing] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const result = await response.json()
      if (result.success) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleBan = async () => {
    if (!userToBan) return
    setBanning(true)
    try {
      const response = await fetch(`/api/admin/users/${userToBan.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          banned: !userToBan.banned,
          reason: banReason 
        }),
      })
      const result = await response.json()
      if (result.success) {
        await fetchUsers()
        setBanDialogOpen(false)
        setUserToBan(null)
        setBanReason('')
      }
    } catch (error) {
      console.error('Error banning user:', error)
    } finally {
      setBanning(false)
    }
  }

  const handleEditRole = async () => {
    if (!userToEdit) return
    setEditing(true)
    try {
      const response = await fetch(`/api/admin/users/${userToEdit.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const result = await response.json()
      if (result.success) {
        await fetchUsers()
        setEditRoleDialogOpen(false)
        setUserToEdit(null)
      }
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setEditing(false)
    }
  }

  const openBanDialog = (user: User) => {
    setUserToBan(user)
    setBanReason(user.banReason || '')
    setBanDialogOpen(true)
  }

  const openEditRoleDialog = (user: User) => {
    setUserToEdit(user)
    setNewRole(user.role)
    setEditRoleDialogOpen(true)
  }

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    if (searchQuery && !user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false
    }
    if (statusFilter === 'banned' && !user.banned) {
      return false
    }
    if (statusFilter === 'active' && user.banned) {
      return false
    }
    return true
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Пользователи</h1>
        <p className="text-muted-foreground">
          Управление пользователями и модерация
        </p>
      </div>

      {/* Фильтры */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Поиск</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени или email..."
                className="pl-10 bg-gray-900 border-gray-700"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Роль</label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Все роли" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Статус</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Все" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="banned">Забаненные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Показано: {filteredUsers.length} из {users.length}
        </div>
      </div>

      {/* Таблица пользователей */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Пользователь</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Роль</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Статус</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Активность</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-white">{user.username}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      user.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                      user.role === 'moderator' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.banned ? (
                      <span className="flex items-center gap-1 text-red-400 text-sm">
                        <Ban className="w-4 h-4" />
                        Забанен
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Активен
                      </span>
                    )}
                    {user.banned && user.banReason && (
                      <div className="text-xs text-gray-500 mt-1">{user.banReason}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {user._count.lineups}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {user._count.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {user._count.favorites}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditRoleDialog(user)}
                        className="h-8 px-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={user.banned ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => openBanDialog(user)}
                        className="h-8 px-2"
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Диалог бана */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{userToBan?.banned ? 'Разбанить пользователя?' : 'Забанить пользователя?'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              {userToBan?.banned 
                ? `Разбанить ${userToBan?.username}?` 
                : `Забанить ${userToBan?.username}?`}
            </p>
            {!userToBan?.banned && (
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Причина бана</label>
                <Input
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Нарушение правил..."
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBanDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              variant={userToBan?.banned ? "outline" : "destructive"} 
              onClick={handleBan}
              disabled={banning}
            >
              {banning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {userToBan?.banned ? 'Разбанить' : 'Забанить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования роли */}
      <Dialog open={editRoleDialogOpen} onOpenChange={setEditRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить роль пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              Пользователь: <span className="text-white font-medium">{userToEdit?.username}</span>
            </p>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Новая роль</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditRoleDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditRole} disabled={editing}>
              {editing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
