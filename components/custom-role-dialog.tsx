/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Users, Moon, Sun, Eye, Heart, FlaskRoundIcon as Flask, Shield, Skull, Crown, Sparkles } from "lucide-react"
import type { Role } from "@/app/page"

type CustomRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddRole: (role: Omit<Role, "icon">) => void
}

export function CustomRoleDialog({ open, onOpenChange, onAddRole }: CustomRoleDialogProps) {
  const [roleName, setRoleName] = useState("")
  const [roleDescription, setRoleDescription] = useState("")
  const [roleTeam, setRoleTeam] = useState<"village" | "werewolf" | "special">("village")
  const [roleLimit, setRoleLimit] = useState(1)
  const [roleIcon, setRoleIcon] = useState("Users")

  const handleSubmit = () => {
    if (!roleName.trim()) return

    onAddRole({
      id: `custom-${Date.now()}`,
      name: roleName.trim(),
      description: roleDescription.trim() || "Custom role",
      iconName: roleIcon,
      team: roleTeam,
      limit: roleLimit,
      count: 0,
    })

    // Reset form
    setRoleName("")
    setRoleDescription("")
    setRoleTeam("village")
    setRoleLimit(1)
    setRoleIcon("Users")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Role</DialogTitle>
          <DialogDescription>Create a new role for your game. Fill in the details below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="col-span-3"
              placeholder="Role name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              className="col-span-3"
              placeholder="Role description and abilities"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="team" className="text-right">
              Team
            </Label>
            <Select value={roleTeam} onValueChange={(value: any) => setRoleTeam(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="village">Village</SelectItem>
                <SelectItem value="werewolf">Werewolf</SelectItem>
                <SelectItem value="special">Special</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">
              Icon
            </Label>
            <Select value={roleIcon} onValueChange={setRoleIcon}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select icon">
                  {roleIcon === "Users" && <Users className="h-4 w-4 mr-2" />}
                  {roleIcon === "Moon" && <Moon className="h-4 w-4 mr-2" />}
                  {roleIcon === "Sun" && <Sun className="h-4 w-4 mr-2" />}
                  {roleIcon === "Eye" && <Eye className="h-4 w-4 mr-2" />}
                  {roleIcon === "Heart" && <Heart className="h-4 w-4 mr-2" />}
                  {roleIcon === "Flask" && <Flask className="h-4 w-4 mr-2" />}
                  {roleIcon === "Shield" && <Shield className="h-4 w-4 mr-2" />}
                  {roleIcon === "Skull" && <Skull className="h-4 w-4 mr-2" />}
                  {roleIcon === "Crown" && <Crown className="h-4 w-4 mr-2" />}
                  {roleIcon === "Sparkles" && <Sparkles className="h-4 w-4 mr-2" />}
                  {roleIcon}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Users">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Users</span>
                  </div>
                </SelectItem>
                <SelectItem value="Moon">
                  <div className="flex items-center">
                    <Moon className="h-4 w-4 mr-2" />
                    <span>Moon</span>
                  </div>
                </SelectItem>
                <SelectItem value="Sun">
                  <div className="flex items-center">
                    <Sun className="h-4 w-4 mr-2" />
                    <span>Sun</span>
                  </div>
                </SelectItem>
                <SelectItem value="Eye">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    <span>Eye</span>
                  </div>
                </SelectItem>
                <SelectItem value="Heart">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    <span>Heart</span>
                  </div>
                </SelectItem>
                <SelectItem value="Flask">
                  <div className="flex items-center">
                    <Flask className="h-4 w-4 mr-2" />
                    <span>Flask</span>
                  </div>
                </SelectItem>
                <SelectItem value="Shield">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Shield</span>
                  </div>
                </SelectItem>
                <SelectItem value="Skull">
                  <div className="flex items-center">
                    <Skull className="h-4 w-4 mr-2" />
                    <span>Skull</span>
                  </div>
                </SelectItem>
                <SelectItem value="Crown">
                  <div className="flex items-center">
                    <Crown className="h-4 w-4 mr-2" />
                    <span>Crown</span>
                  </div>
                </SelectItem>
                <SelectItem value="Sparkles">
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>Sparkles</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="limit" className="text-right">
              Limit
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="limit"
                type="number"
                min="1"
                max="999"
                value={roleLimit}
                onChange={(e) => setRoleLimit(Number.parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">Maximum number of this role allowed</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
