"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, X } from "lucide-react"
import type { GameState, Player, Role } from "@/app/page"
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type RoleAssignmentProps = {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNext: () => void
  onBack: () => void
}

export function RoleAssignment({ gameState, setGameState, onNext, onBack }: RoleAssignmentProps) {
  const [error, setError] = useState<string | null>(null)
  const [activeRole, setActiveRole] = useState<Role | null>(null)

  const { players, selectedRoles } = gameState

  // Expand roles based on count (e.g. if Villager has count 3, create 3 separate role objects)
  const expandedRoles = selectedRoles.flatMap((role) =>
    Array(role.count)
      .fill(0)
      .map((_, index) => ({
        ...role,
        uniqueId: `${role.id}-${index}`,
      })),
  )

  // Check if all players have roles assigned
  const allPlayersAssigned = players.every((player) => player.role)

  // Set up DnD sensors for both mouse/touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  )

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const roleId = active.id as string

    const role = expandedRoles.find((r) => r.uniqueId === roleId)
    if (role) {
      setActiveRole(role)
    }
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over) {
      const roleId = active.id as string
      const playerId = over.id as string

      const role = expandedRoles.find((r) => r.uniqueId === roleId)
      const player = players.find((p) => p.id === playerId)

      if (role && player) {
        // If player already has a role, return that role to the pool
        if (player.role) {
          // Increment the count of the previous role in selectedRoles
          setGameState((prev) => ({
            ...prev,
            selectedRoles: prev.selectedRoles.map((r) => (r.id === player.role?.id ? { ...r, count: r.count + 1 } : r)),
          }))
        }

        // Assign new role to player
        setGameState((prev) => ({
          ...prev,
          players: prev.players.map((p) => (p.id === playerId ? { ...p, role } : p)),
          // Decrement the count of the assigned role in selectedRoles
          selectedRoles: prev.selectedRoles.map((r) => (r.id === role.id ? { ...r, count: r.count - 1 } : r)),
        }))
      }
    }

    setActiveRole(null)
  }

  // Remove role from player
  const removeRoleFromPlayer = (playerId: string) => {
    const player = players.find((p) => p.id === playerId)

    if (player?.role) {
      setGameState((prev) => ({
        ...prev,
        // Remove role from player
        players: prev.players.map((p) => (p.id === playerId ? { ...p, role: undefined } : p)),
        // Increment the count of the returned role in selectedRoles
        selectedRoles: prev.selectedRoles.map((r) => (r.id === player.role?.id ? { ...r, count: r.count + 1 } : r)),
      }))
    }

    setError(null)
  }

  // Handle next step
  const handleNext = () => {
    if (!allPlayersAssigned) {
      setError("All players must have roles assigned")
      return
    }

    onNext()
  }

  // Random assignment
  const assignRandomly = () => {
    // Create a copy of players without roles
    const playersWithoutRoles = [...players].filter((p) => !p.role)

    // Create a copy of all available roles
    const availableRoles = expandedRoles.filter((role) => {
      // Check if this role is already assigned to a player
      return !players.some((p) => p.role?.uniqueId === role.uniqueId)
    })

    // Shuffle the arrays
    const shuffledPlayers = [...playersWithoutRoles].sort(() => Math.random() - 0.5)
    const shuffledRoles = [...availableRoles].sort(() => Math.random() - 0.5)

    // Assign roles to players
    const updatedPlayers = [...players]

    shuffledPlayers.forEach((player, index) => {
      if (index < shuffledRoles.length) {
        const playerIndex = updatedPlayers.findIndex((p) => p.id === player.id)
        if (playerIndex >= 0) {
          updatedPlayers[playerIndex] = {
            ...updatedPlayers[playerIndex],
            role: shuffledRoles[index],
          }
        }
      }
    })

    // Update selected roles counts
    const updatedSelectedRoles = [...selectedRoles]
    shuffledRoles.forEach((role) => {
      const roleIndex = updatedSelectedRoles.findIndex((r) => r.id === role.id)
      if (roleIndex >= 0) {
        updatedSelectedRoles[roleIndex] = {
          ...updatedSelectedRoles[roleIndex],
          count: updatedSelectedRoles[roleIndex].count - 1,
        }
      }
    })

    setGameState((prev) => ({
      ...prev,
      players: updatedPlayers,
      selectedRoles: updatedSelectedRoles,
    }))

    setError(null)
  }

  const assignRoleToPlayer = (playerId: string, roleId: string) => {
    const player = players.find((p) => p.id === playerId)
    const role = selectedRoles.find((r) => r.id === roleId)

    if (!player || !role || role.count <= 0) return

    // If player already has a role, return that role to the pool
    if (player.role) {
      // Increment the count of the previous role in selectedRoles
      setGameState((prev) => ({
        ...prev,
        selectedRoles: prev.selectedRoles.map((r) => (r.id === player.role?.id ? { ...r, count: r.count + 1 } : r)),
      }))
    }

    // Find an available instance of this role
    const availableRoleInstance = expandedRoles.find(
      (r) => r.id === roleId && !players.some((p) => p.role?.uniqueId === r.uniqueId),
    )

    if (!availableRoleInstance) return

    // Assign new role to player
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === playerId ? { ...p, role: availableRoleInstance } : p)),
      // Decrement the count of the assigned role in selectedRoles
      selectedRoles: prev.selectedRoles.map((r) => (r.id === roleId ? { ...r, count: r.count - 1 } : r)),
    }))

    setError(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Assign Roles</CardTitle>
        <CardDescription>
          Drag roles and drop them onto players to assign them. You can reassign roles by dragging a new role to a
          player.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={assignRandomly}>
              Assign Randomly
            </Button>
          </div>

          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Players</h3>
                <SortableContext items={players.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {players.map((player) => (
                      <PlayerItem
                        key={player.id}
                        player={player}
                        onRemoveRole={() => removeRoleFromPlayer(player.id)}
                        availableRoles={selectedRoles.filter((role) => role.count > 0)}
                        onAssignRole={(roleId) => assignRoleToPlayer(player.id, roleId)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>

              <div>
                <h3 className="font-medium mb-2">Available Roles</h3>
                <SortableContext items={expandedRoles.map((r) => r.uniqueId)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {expandedRoles.map((role) => {
                      // Check if this role is already assigned
                      const isAssigned = players.some((p) => p.role?.uniqueId === role.uniqueId)

                      return <RoleItem key={role.uniqueId} role={role} isAssigned={isAssigned} />
                    })}
                  </div>
                </SortableContext>
              </div>
            </div>

            <DragOverlay>
              {activeRole && (
                <div className="p-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 opacity-80">
                  <span>{activeRole.icon}</span>
                  <span>{activeRole.name}</span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!allPlayersAssigned}>
          Start Game
        </Button>
      </CardFooter>
    </Card>
  )
}

type PlayerItemProps = {
  player: Player
  onRemoveRole: () => void
  availableRoles: Role[]
  onAssignRole: (roleId: string) => void
}

function PlayerItem({ player, onRemoveRole, availableRoles, onAssignRole }: PlayerItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: player.id,
    data: {
      type: "player",
      player,
    },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`p-3 bg-card rounded-md border flex items-center justify-between ${
        isDragging ? "opacity-50" : ""
      } ${player.role ? "border-primary" : ""}`}
    >
      <div className="flex items-center gap-2">
        <div className="font-medium">{player.name}</div>
        {player.role && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{player.role.icon}</span>
            <span>{player.role.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
              Assign
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableRoles.map((role) => (
              <DropdownMenuItem key={role.id} onClick={() => onAssignRole(role.id)}>
                <span className="mr-2">{role.icon}</span>
                {role.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {player.role && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemoveRole}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

type RoleItemProps = {
  role: Role & { uniqueId: string }
  isAssigned: boolean
}

function RoleItem({ role, isAssigned }: RoleItemProps) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useSortable({
    id: role.uniqueId,
    data: {
      type: "role",
      role,
    },
    disabled: isAssigned,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 bg-card rounded-md border flex items-center justify-between ${
        isDragging ? "opacity-50" : ""
      } ${isAssigned ? "opacity-50 bg-muted" : ""} transition-all duration-200`}
    >
      <div className="flex items-center gap-2">
        <span>{role.icon}</span>
        <span>{role.name}</span>
      </div>

      {isAssigned && <Check className="h-4 w-4 text-primary" />}
    </div>
  )
}
