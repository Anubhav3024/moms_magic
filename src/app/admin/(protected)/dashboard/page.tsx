"use client";

import React from "react";
import {
  BarChart3,
  Users,
  UtensilsCrossed,
  Tag,
  Clock,
  ChevronRight,
  TrendingUp,
  MessageSquareQuote,
  Sparkles,
  User,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MenuManager from "@/components/admin/MenuManager";
import DealsManager from "@/components/admin/DealsManager";
import StoryManager from "@/components/admin/StoryManager";
import ReservationsManager from "@/components/admin/ReservationsManager";
import TestimonialsManager from "@/components/admin/TestimonialsManager";
import TeamManager from "@/components/admin/TeamManager";
import ProfileManager from "@/components/admin/ProfileManager";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: string;
}

const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => (
  <div className="bg-white p-8 rounded-3xl shadow-warm border border-secondary/10">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-secondary/10 rounded-2xl text-secondary-accent">
        <Icon size={24} />
      </div>
      <span className="text-green-500 font-bold flex items-center text-sm">
        <TrendingUp size={16} className="mr-1" /> {trend}
      </span>
    </div>
    <p className="text-foreground/50 text-sm font-medium mb-1">{title}</p>
    <h3 className="text-3xl font-bold">{value}</h3>
  </div>
);

interface Reservation {
  userName: string;
  email: string;
  date: string;
  time: string;
  seats: number;
  paymentStatus: string;
  totalAmount: number;
}

interface DashboardData {
  counts: {
    menu: number;
    reservations: number;
    deals: number;
    testimonials: number;
  };
  revenue: number;
  recentReservations: Reservation[];
}

interface AdminProfile {
  name: string;
  email: string;
  role: string;
  profileImage: string;
}

const AdminDashboard = () => {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [adminProfile, setAdminProfile] = React.useState<AdminProfile | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("Dashboard");

  const router = useRouter();

  const handleLogout = () => {
    fetch("/api/admin/logout", { method: "POST" }).finally(() => {
      router.push("/admin/login");
    });
  };

  const fetchData = React.useCallback(async () => {
    try {
      const [statsRes, profileRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch("/api/admin/profile", { cache: "no-store" }),
      ]);
      if (statsRes.status === 401 || profileRes.status === 401) {
        router.push("/admin/login");
        return;
      }
      const stats = await statsRes.json();
      const profile = await profileRes.json();
      setData(stats);
      setAdminProfile(profile);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary/20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Menu Items":
        return <MenuManager />;
      case "Active Deals":
        return <DealsManager />;
      case "Our Story":
        return <StoryManager />;
      case "Booking Policies":
        return <ReservationsManager />;
      case "Testimonials":
        return <TestimonialsManager />;
      case "Team Access":
        return <TeamManager />;
      case "Admin Profile":
        return <ProfileManager onUpdate={fetchData} />;
      default:
        return (
          <div className="flex-1 p-8 lg:p-12 text-black">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h1 className="text-4xl font-display font-bold">
                  Welcome Back, {adminProfile?.name?.split(" ")[0] || "Admin"}
                </h1>
                <p className="text-foreground/50 mt-1">
                  The magic is happening! Here&apos;s what&apos;s new today.
                </p>
              </div>
              <div
                onClick={() => setActiveTab("Admin Profile")}
                className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="font-bold">
                    {adminProfile?.name || "Loading..."}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {adminProfile?.role || "Administrator"}
                  </p>
                </div>
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image
                    src={
                      adminProfile?.profileImage ||
                      "https://i.pravatar.cc/150?u=admin"
                    }
                    alt="Admin"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <StatCard
                title="Total Dishes"
                value={data?.counts?.menu || 0}
                icon={UtensilsCrossed}
                trend="+12.5%"
              />
              <StatCard
                title="Reservations"
                value={data?.counts?.reservations || 0}
                icon={Clock}
                trend="+8.2%"
              />
              <StatCard
                title="Total Revenue"
                value={`INR ${(data?.revenue || 0).toLocaleString()}`}
                icon={BarChart3}
                trend="+15.3%"
              />
              <StatCard
                title="Active Deals"
                value={data?.counts?.deals || 0}
                icon={Tag}
                trend="+3.1%"
              />
            </div>

            {/* Recent Reservations Table */}
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-warm border border-secondary/10 overflow-hidden text-black">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-display font-bold">
                  Recent Reservations
                </h2>
                <button
                  onClick={() => setActiveTab("Booking Policies")}
                  className="text-brand-red font-bold text-sm flex items-center hover:opacity-80"
                >
                  View All Policies <ChevronRight size={16} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="text-left py-4 text-sm font-bold opacity-40 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="text-left py-4 text-sm font-bold opacity-40 uppercase tracking-wider">
                        Date/Time
                      </th>
                      <th className="text-left py-4 text-sm font-bold opacity-40 uppercase tracking-wider">
                        Guests
                      </th>
                      <th className="text-left py-4 text-sm font-bold opacity-40 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right py-4 text-sm font-bold opacity-40 uppercase tracking-wider">
                        Payable
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/10">
                    {(data?.recentReservations || []).map(
                      (res: Reservation, i: number) => (
                        <tr
                          key={i}
                          className="hover:bg-primary/5 transition-colors"
                        >
                          <td className="py-6">
                            <p className="font-bold">{res.userName}</p>
                            <p className="text-xs text-foreground/40">
                              {res.email}
                            </p>
                          </td>
                          <td className="py-6 font-medium">
                            <p>{new Date(res.date).toLocaleDateString()}</p>
                            <p className="text-xs text-foreground/40">
                              {res.time}
                            </p>
                          </td>
                          <td className="py-6 font-bold">{res.seats} Ppl</td>
                          <td className="py-6">
                            <span
                              className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                                res.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-yellow-100 text-yellow-600"
                              }`}
                            >
                              {res.paymentStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-6 text-right font-bold text-brand-red">
                            INR {res.totalAmount}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
                {(!data?.recentReservations ||
                  data?.recentReservations.length === 0) && (
                  <div className="text-center py-10 text-foreground/40 font-bold">
                    No recent reservations magic yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-primary/20 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-secondary/10 p-8 hidden lg:flex flex-col h-full">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="relative">
            <div className="absolute -inset-1 bg-brand-red rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <Image
              src="/logo.png"
              alt="Logo"
              width={45}
              height={45}
              className="rounded-full shadow-md relative"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-display font-bold text-brand-red tracking-tight leading-none">
              Admin
            </span>
            <span className="text-xs font-bold text-secondary-accent uppercase tracking-[0.2em] mt-1">
              Magic
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {[
            { name: "Dashboard", icon: BarChart3 },
            { name: "Menu Items", icon: UtensilsCrossed },
            { name: "Active Deals", icon: Tag },
            { name: "Our Story", icon: Sparkles },
            { name: "Booking Policies", icon: Clock },
            { name: "Testimonials", icon: MessageSquareQuote },
            { name: "Team Access", icon: Users },
            { name: "Admin Profile", icon: User },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                activeTab === item.name
                  ? "bg-brand-red text-white shadow-lg shadow-brand-red/20"
                  : "text-foreground/60 hover:bg-primary/30"
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
          >
            <LogOut size={20} />
            Logout to Site
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
