"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Pill, Brain } from "lucide-react"

const reminders = [
  {
    id: 1,
    title: "Obat Darah Tinggi",
    time: "08:00",
    days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    type: "medication",
    notes: "Minum setelah sarapan",
  },
  {
    id: 2,
    title: "Vitamin B Complex",
    time: "12:00",
    days: ["Senin", "Rabu", "Jumat"],
    type: "medication",
    notes: "Minum setelah makan siang",
  },
  {
    id: 3,
    title: "Latihan Memori",
    time: "16:00",
    days: ["Senin", "Rabu", "Jumat"],
    type: "therapy",
    notes: "Bermain Memory Match selama 15 menit",
  },
]

export default function RemindersPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengingat</h1>
          <p className="text-muted-foreground">Kelola pengingat obat dan jadwal terapi Anda</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Tambah Pengingat</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Pengingat Baru</DialogTitle>
              <DialogDescription>Buat pengingat untuk obat atau terapi Anda</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul</Label>
                <Input id="title" placeholder="Nama obat atau terapi" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipe</Label>
                <Select defaultValue="medication">
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Pilih tipe pengingat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">Obat</SelectItem>
                    <SelectItem value="therapy">Terapi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Waktu</Label>
                <Input id="time" type="time" />
              </div>
              <div className="grid gap-2">
                <Label>Hari</Label>
                <div className="flex flex-wrap gap-2">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
                    <Button key={day} variant="outline" size="sm" className="h-8 w-8 p-0">
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Catatan</Label>
                <Input id="notes" placeholder="Catatan tambahan" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setOpen(false)}>
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="medication">Obat</TabsTrigger>
          <TabsTrigger value="therapy">Terapi</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4">
            {reminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="medication" className="mt-4">
          <div className="grid gap-4">
            {reminders
              .filter((reminder) => reminder.type === "medication")
              .map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="therapy" className="mt-4">
          <div className="grid gap-4">
            {reminders
              .filter((reminder) => reminder.type === "therapy")
              .map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReminderCard({ reminder }: { reminder: any }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{reminder.title}</CardTitle>
          {reminder.type === "medication" ? (
            <Pill className="h-5 w-5 text-blue-500" />
          ) : (
            <Brain className="h-5 w-5 text-purple-500" />
          )}
        </div>
        <CardDescription>{reminder.type === "medication" ? "Obat" : "Terapi"}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{reminder.time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{reminder.days.join(", ")}</span>
          </div>
        </div>
        {reminder.notes && <p className="mt-2 text-sm text-muted-foreground">{reminder.notes}</p>}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
          Hapus
        </Button>
      </CardFooter>
    </Card>
  )
}

