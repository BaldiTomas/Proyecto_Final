// app/admin/UserManager.tsx
"use client";

import { registerUserOnChain } from "@/lib/contracts";
import { useEffect, useState } from "react";
import { userAPI } from "@/lib/api";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";

const roles = [
  { value: "admin", label: "Administrador" },
  { value: "producer", label: "Productor" },
  { value: "seller", label: "Vendedor" },
  { value: "distributor", label: "Distribuidor" },
  { value: "user", label: "Usuario" },
];

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  wallet_address?: string | null;
  is_active?: boolean;
};
type NewUser = Omit<User, "id"> & { password: string };

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    email: "",
    password: "",
    role: "user",
    wallet_address: null,
    is_active: true,
  });

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getUsers();
      setUsers(res.data.users);
    } catch {
      toast.error("Error al cargar usuarios");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setEditMode(false);
    setEditUserId(null);
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "user",
      wallet_address: null,
      is_active: true,
    });
  };

  const handleCreateOrUpdate = async () => {
    const { name, email, role, password, wallet_address } = newUser;
    if (!name || !email || !role || (!editMode && !password))
      return toast.error("Completa todos los campos");

    try {
      if (wallet_address) {
        await registerUserOnChain(wallet_address, name, email);
        toast.success(
          editMode
            ? "Usuario actualizado en blockchain"
            : "Usuario registrado en blockchain"
        );
      }
      if (editMode && editUserId) {
        await userAPI.updateUser(editUserId, newUser);
        toast.success("Usuario actualizado en backend");
      } else {
        await userAPI.registerUser(newUser);
        toast.success("Usuario creado en backend");
      }
      setIsOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      console.error("Error en handleCreateOrUpdate:", err);
      toast.error(err.message || "Error al guardar usuario");
    }
  };

  const handleEdit = (u: User) => {
    setNewUser({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      wallet_address: u.wallet_address ?? null,
      is_active: !!u.is_active,
    });
    setEditMode(true);
    setEditUserId(u.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await userAPI.deleteUser(id);
      toast.success("Usuario eliminado");
      fetchUsers();
    } catch {
      toast.error("Error al eliminar usuario");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          Gestión de Usuarios
        </h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                resetForm();
                setIsOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editMode ? "Editar Usuario" : "Crear Usuario"}
              </DialogTitle>
            </DialogHeader>
            {(["name", "email", "password"] as const).map((f) => (
              <div key={f} className="mb-4">
                <Label htmlFor={f} className="text-white">
                  {f === "name"
                    ? "Nombre"
                    : f === "email"
                    ? "Correo"
                    : "Contraseña"}
                </Label>
                <Input
                  id={f}
                  type={f === "password" ? "password" : "text"}
                  value={(newUser as any)[f]}
                  onChange={(e) =>
                    setNewUser({ ...newUser, [f]: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            ))}
            <div className="mb-4">
              <Label htmlFor="wallet_address" className="text-white">
                Dirección de Wallet
              </Label>
              <Input
                id="wallet_address"
                type="text"
                value={newUser.wallet_address ?? ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, wallet_address: e.target.value })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="role" className="text-white">
                Rol
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(r) => setNewUser({ ...newUser, role: r })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleCreateOrUpdate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editMode ? "Actualizar" : "Crear"}
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 text-gray-300"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <Card key={u.id} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">{u.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {u.email}
                  </CardDescription>
                </div>
                <Badge
                  className={`text-sm ${
                    u.is_active
                      ? "bg-green-900/20 text-green-400 border-green-600"
                      : "bg-red-900/20 text-red-400 border-red-600"
                  }`}
                >
                  {u.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-slate-600 text-gray-300"
                >
                  {roles.find((r) => r.value === u.role)?.label || u.role}
                </Badge>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(u)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(u.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
