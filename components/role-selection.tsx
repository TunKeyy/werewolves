"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info, Minus, Plus } from "lucide-react"
import type { GameState, Role } from "@/app/page"

type RoleSelectionProps = {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNext: () => void
  onBack: () => void
}

export function RoleSelection({ gameState, setGameState, onNext, onBack }: RoleSelectionProps) {
  const [error, setError] = useState<string | null>(null)

  const { players, availableRoles, selectedRoles } = gameState
  const playerCount = players.length
  const selectedRoleCount = selectedRoles.reduce((acc, role) => acc + role.count, 0)

  const addRole = (role: Role) => {
    // Check if role has reached its limit
    if (role.limit !== 999 && role.count >= role.limit) {
      setError(`You can only have ${role.limit} ${role.name}(s)`)
      return
    }

    // Check if we already have enough roles
    if (selectedRoleCount >= playerCount) {
      setError(`You already have ${playerCount} roles selected`)
      return
    }

    setError(null)

    // Check if role is already selected
    const existingRoleIndex = selectedRoles.findIndex((r) => r.id === role.id)

    if (existingRoleIndex >= 0) {
      // Update count of existing role
      const updatedRoles = [...selectedRoles]
      updatedRoles[existingRoleIndex] = {
        ...updatedRoles[existingRoleIndex],
        count: updatedRoles[existingRoleIndex].count + 1,
      }

      setGameState((prev) => ({
        ...prev,
        selectedRoles: updatedRoles,
      }))
    } else {
      // Add new role with count 1
      setGameState((prev) => ({
        ...prev,
        selectedRoles: [...prev.selectedRoles, { ...role, count: 1 }],
      }))
    }
  }

  const removeRole = (role: Role) => {
    const existingRoleIndex = selectedRoles.findIndex((r) => r.id === role.id)

    if (existingRoleIndex >= 0) {
      const updatedRoles = [...selectedRoles]

      if (updatedRoles[existingRoleIndex].count > 1) {
        // Decrease count if more than 1
        updatedRoles[existingRoleIndex] = {
          ...updatedRoles[existingRoleIndex],
          count: updatedRoles[existingRoleIndex].count - 1,
        }
      } else {
        // Remove role if count is 1
        updatedRoles.splice(existingRoleIndex, 1)
      }

      setGameState((prev) => ({
        ...prev,
        selectedRoles: updatedRoles,
      }))
    }

    setError(null)
  }

  const handleNext = () => {
    if (selectedRoleCount < playerCount) {
      setError(`You need to select ${playerCount} roles in total`)
      return
    }

    if (selectedRoleCount > playerCount) {
      setError(`You have selected too many roles (${selectedRoleCount}/${playerCount})`)
      return
    }

    onNext()
  }

  // Group roles by team
  const villageRoles = availableRoles.filter((role) => role.team === "village")
  const werewolfRoles = availableRoles.filter((role) => role.team === "werewolf")
  const specialRoles = availableRoles.filter((role) => role.team === "special")

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Select Roles</CardTitle>
          <CardDescription>
            Choose roles for all players. You need to select exactly {playerCount} roles in total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-muted p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">
                Selected Roles ({selectedRoleCount}/{playerCount})
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedRoles.length === 0 ? (
                  <div className="text-muted-foreground">No roles selected yet</div>
                ) : (
                  selectedRoles.map((role) => (
                    <Badge key={role.id} variant="secondary" className="flex items-center gap-1 py-1.5">
                      <span className="mr-1">{role.icon}</span>
                      {role.name}
                      {role.count > 1 && <span className="text-xs ml-1">×{role.count}</span>}
                      <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => removeRole(role)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Village Team</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {villageRoles.map((role) => (
                    <RoleCard
                      key={role.id}
                      role={role}
                      onAdd={() => addRole(role)}
                      selectedCount={selectedRoles.find((r) => r.id === role.id)?.count || 0}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Werewolf Team</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {werewolfRoles.map((role) => (
                    <RoleCard
                      key={role.id}
                      role={role}
                      onAdd={() => addRole(role)}
                      selectedCount={selectedRoles.find((r) => r.id === role.id)?.count || 0}
                    />
                  ))}
                </div>
              </div>

              {specialRoles.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Special Roles</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {specialRoles.map((role) => (
                      <RoleCard
                        key={role.id}
                        role={role}
                        onAdd={() => addRole(role)}
                        selectedCount={selectedRoles.find((r) => r.id === role.id)?.count || 0}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleNext}>Next: Assign Roles</Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}

type RoleCardProps = {
  role: Role
  onAdd: () => void
  selectedCount: number
}

function RoleCard({ role, onAdd, selectedCount }: RoleCardProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-card rounded-md border">
      <div className="flex items-center gap-2">
        <div className="text-lg">{role.icon}</div>
        <div>
          <div className="font-medium">{role.name}</div>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                  <Info className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[200px]">
                <p>{role.description}</p>
              </TooltipContent>
            </Tooltip>
            {selectedCount > 0 && (
              <Badge variant="outline" className="ml-1 text-xs">
                {selectedCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onAdd} disabled={role.limit !== 999 && selectedCount >= role.limit}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
