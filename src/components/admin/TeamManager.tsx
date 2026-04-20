"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Trash2,
  Edit2,
  X,
  Loader2,
  DollarSign,
  Calendar,
  Camera,
  User,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Employee {
  _id: string;
  name: string;
  position: string;
  joiningDate: string;
  salary: number;
  profileImage?: string;
}

const TeamManager = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    joiningDate: new Date().toISOString().split("T")[0],
    salary: 0,
    profileImage: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/team", { cache: "no-store" });
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingEmployee ? "PUT" : "POST";
    const url = editingEmployee
      ? `/api/team/${editingEmployee._id}`
      : "/api/team";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingEmployee(null);
        setFormData({
          name: "",
          position: "",
          joiningDate: new Date().toISOString().split("T")[0],
          salary: 0,
          profileImage: "",
        });
        fetchEmployees();
      }
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      setFormData((prev) => ({ ...prev, profileImage: result.secure_url }));
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this employee record?"))
      return;
    try {
      await fetch(`/api/team/${id}`, { method: "DELETE" });
      fetchEmployees();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      position: emp.position,
      joiningDate: new Date(emp.joiningDate).toISOString().split("T")[0],
      salary: emp.salary,
      profileImage: emp.profileImage || "",
    });
    setIsModalOpen(true);
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-brand-red" size={48} />
      </div>
    );

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-primary/20 text-black">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold text-secondary-accent">
            Team Access & Ops
          </h1>
          <p className="text-foreground/50 mt-1">
            Manage employee records, roles, and payroll details
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setFormData({
              name: "",
              position: "",
              joiningDate: new Date().toISOString().split("T")[0],
              salary: 0,
              profileImage: "",
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-brand-red text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all"
        >
          <Plus size={20} /> Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {employees.map((emp) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={emp._id}
            className="bg-white p-8 rounded-[2rem] shadow-warm border border-secondary/10 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 relative overflow-hidden flex items-center justify-center text-secondary-accent border-2 border-white shadow-sm">
                {emp.profileImage ? (
                  <Image
                    src={emp.profileImage}
                    alt={emp.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Users size={32} />
                )}
              </div>
              <div>
                <h3 className="font-bold text-2xl">{emp.name}</h3>
                <p className="text-brand-red font-bold text-sm uppercase tracking-widest">
                  {emp.position}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:flex md:gap-12 flex-1 md:justify-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1 flex items-center gap-1">
                  <Calendar size={10} /> Joined
                </p>
                <p className="font-bold">
                  {emp.joiningDate
                    ? new Date(emp.joiningDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1 flex items-center gap-1">
                  <DollarSign size={10} /> Salary to be Paid
                </p>
                <p className="font-bold text-green-600">
                  INR {(emp.salary || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => openEdit(emp)}
                className="w-12 h-12 flex items-center justify-center bg-secondary/10 text-secondary-accent rounded-xl hover:bg-secondary/20 transition-all font-bold"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(emp._id)}
                className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}

        {employees.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-secondary/20">
            <Users size={64} className="mx-auto text-secondary/10 mb-4" />
            <p className="text-xl font-bold text-foreground/30">
              No employee records found.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-xl rounded-3xl p-10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-display font-bold">
                {editingEmployee ? "Edit Employee" : "New Team Entry"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-primary/20 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-primary/20 relative overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
                    {formData.profileImage ? (
                      <Image
                        src={formData.profileImage}
                        alt="Employee"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User size={48} className="text-secondary/20" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="animate-spin text-brand-red" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="emp-img-upload"
                  />
                  <label
                    htmlFor="emp-img-upload"
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-red text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all"
                  >
                    <Camera size={18} />
                  </label>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-3 text-center">
                  Employee Photo
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-60 ml-2">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-red/10"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2">
                    Position
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Master Chef"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-red/10"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2">
                    Joining Date
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-red/10"
                    value={formData.joiningDate}
                    onChange={(e) =>
                      setFormData({ ...formData, joiningDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-60 ml-2">
                  Monthly Salary (INR)
                </label>
                <input
                  required
                  type="number"
                  className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-red/10"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: Number(e.target.value) })
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-brand-red text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-brand-red/20 transition-all"
              >
                {editingEmployee ? "Update Record" : "Save Entry"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;
