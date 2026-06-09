import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from "react-router";

import {
  Activity, AlertTriangle, ArrowRight, ArrowUpRight, BarChart3, Bell, Building2, Calendar as CalIcon,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Dumbbell, Eye, EyeOff, FileBarChart,
  Filter, Home, KeyRound, LayoutGrid, LineChart as LineIcon, Lock, LogOut, Mail, MessageSquare, Moon, Sun,
  MoreHorizontal, Pencil, Phone, PieChart as PieIcon, Plus, QrCode, Receipt, Search, Settings,
  Shield, ShieldCheck, Sparkles, Trash2, TrendingUp, Users, UserPlus, Wallet, Wrench, X,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

/* ───────────────────────────── Types & data ───────────────────────────── */

type Role = "owner" | "staff" | "trainer" | "member";

const ROLE_META: Record<Role, { name: string; person: string; initials: string; tone: string }> = {
  owner:   { name: "Chủ phòng tập",     person: "Nguyễn Quang Huy",  initials: "QH", tone: "from-violet-500 to-indigo-600" },
  staff:   { name: "Nhân viên quản lý", person: "Trần Mỹ Linh",       initials: "ML", tone: "from-emerald-400 to-teal-600" },
  trainer: { name: "Huấn luyện viên",   person: "Lê Đức Mạnh",        initials: "ĐM", tone: "from-amber-400 to-orange-600" },
  member:  { name: "Hội viên",          person: "Phạm Khánh An",      initials: "KA", tone: "from-sky-400 to-cyan-600" },
};

const ACCOUNTS: { role: Role; email: string; password: string }[] = [
  { role: "owner",   email: "owner@gymos.vn",   password: "owner@123"   },
  { role: "staff",   email: "staff@gymos.vn",   password: "staff@123"   },
  { role: "trainer", email: "trainer@gymos.vn", password: "trainer@123" },
  { role: "member",  email: "member@gymos.vn",  password: "member@123"  },
];

type Nav = { id: string; label: string; icon: any; children?: { id: string; label: string }[] };

const NAV: Record<Role, Nav[]> = {
  owner: [
    { id: "home",       label: "Trang chủ",         icon: Home },
    { id: "staff",      label: "Quản lý nhân sự",   icon: Users, children: [
      { id: "staff",     label: "Danh sách nhân sự" },
      { id: "attendance",label: "Chấm công nhân sự" },
    ]},
    { id: "packages",   label: "Quản lý gói tập",   icon: LayoutGrid },
    { id: "rooms",      label: "Quản lý phòng tập", icon: Building2 },
    { id: "equipment",  label: "Quản lý thiết bị",  icon: Dumbbell, children: [
      { id: "equipment",             label: "Danh sách loại thiết bị" },
      { id: "equipment.maintenance", label: "Xử lý bảo trì" },
    ]},
    { id: "feedback",   label: "Phản hồi hội viên", icon: MessageSquare },
    { id: "reports",    label: "Báo cáo thống kê",  icon: BarChart3, children: [
      { id: "reports",         label: "Báo cáo chung" },
      { id: "reports.revenue", label: "Thống kê doanh thu" },
      { id: "reports.members", label: "Thống kê hội viên" },
      { id: "reports.staff",   label: "Thống kê nhân sự" },
    ]},
  ],
  staff: [
    { id: "home",        label: "Trang chủ",         icon: Home },
    { id: "members",     label: "Quản lý hội viên",  icon: Users, children: [
      { id: "members",   label: "Danh sách hội viên" },
      { id: "feedback",  label: "Phản hồi hội viên" },
    ]},
    { id: "maintenance", label: "Bảo trì thiết bị",  icon: Wrench },
  ],
  trainer: [
    { id: "home",     label: "Trang chủ",        icon: Home },
    { id: "students", label: "Quản lý học viên", icon: Users },
  ],
  member: [
    { id: "home",     label: "Trang chủ",       icon: Home },
    { id: "renew",    label: "Gia hạn gói tập", icon: CreditCard },
    { id: "history",    label: "Lịch sử tập luyện",  icon: CalIcon },
    { id: "mpayments",  label: "Lịch sử thanh toán", icon: Receipt },
    { id: "mfeedback",  label: "Phản hồi",            icon: MessageSquare },
  ],
};

const STAFF = [
  { code: "NS001", name: "Trần Mỹ Linh",   role: "Nhân viên quản lý", email: "linh.tm@gymos.vn",   phone: "0901 234 567", join: "12/03/2023", status: "Đang làm" },
  { code: "NS002", name: "Lê Đức Mạnh",     role: "Huấn luyện viên",   email: "manh.ld@gymos.vn",   phone: "0938 111 222", join: "04/06/2023", status: "Đang làm" },
  { code: "NS003", name: "Phan Thu Hà",     role: "Huấn luyện viên",   email: "ha.pt@gymos.vn",     phone: "0912 888 919", join: "20/09/2023", status: "Đang làm" },
  { code: "NS004", name: "Nguyễn Văn Khoa", role: "Nhân viên quản lý", email: "khoa.nv@gymos.vn",   phone: "0977 545 121", join: "01/11/2023", status: "Nghỉ phép" },
  { code: "NS005", name: "Đỗ Anh Tuấn",     role: "Huấn luyện viên",   email: "tuan.da@gymos.vn",   phone: "0902 343 998", join: "15/01/2024", status: "Đang làm" },
  { code: "NS006", name: "Vũ Thị Bích",     role: "Nhân viên quản lý", email: "bich.vt@gymos.vn",   phone: "0913 234 565", join: "07/02/2024", status: "Đang làm" },
];

const PACKAGES = [
  { id: "PK01", name: "Gym Starter",    type: "12 buổi",   vip: false, trainer: false, price: 1200000,  status: "Đang kinh doanh" },
  { id: "PK02", name: "Gym Pro 3 tháng",type: "3 tháng",   vip: false, trainer: false, price: 2400000,  status: "Đang kinh doanh" },
  { id: "PK03", name: "Elite VIP 6T",   type: "6 tháng",   vip: true,  trainer: true,  price: 9800000,  status: "Đang kinh doanh" },
  { id: "PK04", name: "Yoga Flow 1T",   type: "1 tháng",   vip: false, trainer: false, price: 850000,   status: "Đang kinh doanh" },
  { id: "PK05", name: "Personal 24B",   type: "24 buổi",   vip: false, trainer: true,  price: 5600000,  status: "Đang kinh doanh" },
  { id: "PK06", name: "Combo Cardio",   type: "20 buổi",   vip: false, trainer: false, price: 1900000,  status: "Ngừng kinh doanh" },
];

const ROOMS = [
  { id: "PT01", name: "Sảnh Gym A",     type: "Gym",     count: 24, status: "Hoạt động" },
  { id: "PT02", name: "Cardio Zone",    type: "Cardio",  count: 18, status: "Hoạt động" },
  { id: "PT03", name: "Yoga Studio",    type: "Yoga",    count: 8,  status: "Hoạt động" },
  { id: "PT04", name: "Fitness Lab",    type: "Fitness", count: 14, status: "Bảo trì" },
  { id: "PT05", name: "Boxing Room",    type: "Other",   count: 9,  status: "Hoạt động" },
];

const EQUIPMENT_TYPES = [
  { id: "ET01", name: "Máy chạy bộ",     category: "Cardio",  brand: "Matrix",  warranty: 24, count: 12, desc: "Máy chạy bộ điện tử cao cấp dùng cho khu Cardio." },
  { id: "ET02", name: "Xe đạp tĩnh",     category: "Cardio",  brand: "Keiser",  warranty: 18, count: 10, desc: "Xe đạp tĩnh với hệ thống kháng lực từ tính." },
  { id: "ET03", name: "Tạ đa năng",      category: "Gym",     brand: "Smith",   warranty: 36, count: 8,  desc: "Giàn tạ đa năng cho khu vực Free Weight." },
  { id: "ET04", name: "Máy kéo cáp",     category: "Gym",     brand: "Hoist",   warranty: 24, count: 6,  desc: "Máy tập kéo cáp toàn thân." },
  { id: "ET05", name: "Thảm Yoga",       category: "Yoga",    brand: "Liforme", warranty: 12, count: 30, desc: "Thảm Yoga chống trượt, dày 6mm." },
  { id: "ET06", name: "Bao đấm Boxing",  category: "Other",   brand: "Everlast",warranty: 12, count: 5,  desc: "Bao đấm tiêu chuẩn thi đấu." },
];

const EQUIPMENT_ITEMS = [
  { code: "TB-128", typeId: "ET01", room: "Cardio Zone", purchased: "10/03/2024", status: "Đang bảo trì" },
  { code: "TB-129", typeId: "ET01", room: "Cardio Zone", purchased: "10/03/2024", status: "Hoạt động" },
  { code: "TB-130", typeId: "ET01", room: "Cardio Zone", purchased: "10/03/2024", status: "Hoạt động" },
  { code: "TB-076", typeId: "ET02", room: "Cardio Zone", purchased: "22/06/2024", status: "Đang bảo trì" },
  { code: "TB-077", typeId: "ET02", room: "Cardio Zone", purchased: "22/06/2024", status: "Hoạt động" },
  { code: "TB-204", typeId: "ET03", room: "Sảnh Gym A",  purchased: "14/01/2024", status: "Đang bảo trì" },
  { code: "TB-205", typeId: "ET03", room: "Sảnh Gym A",  purchased: "14/01/2024", status: "Hoạt động" },
  { code: "TB-311", typeId: "ET04", room: "Fitness Lab", purchased: "05/11/2024", status: "Đang bảo trì" },
  { code: "TB-401", typeId: "ET05", room: "Yoga Studio", purchased: "01/02/2025", status: "Hoạt động" },
  { code: "TB-501", typeId: "ET06", room: "Boxing Room", purchased: "12/04/2025", status: "Hoạt động" },
];

const MAINTENANCE = [
  { code: "TB-128", name: "Máy chạy bộ Matrix",  room: "Cardio Zone", who: "Trần Mỹ Linh", date: "21/05/2026", desc: "Băng tải bị lệch, kêu lớn khi chạy >10km/h", status: "Chờ xử lý" },
  { code: "TB-204", name: "Tạ đa năng Smith",    room: "Sảnh Gym A",  who: "Lê Đức Mạnh",  date: "20/05/2026", desc: "Kẹt thanh đẩy ở vị trí cao nhất",         status: "Đang xử lý" },
  { code: "TB-076", name: "Xe đạp tĩnh Keiser",  room: "Cardio Zone", who: "Phan Thu Hà",  date: "18/05/2026", desc: "Màn hình hiển thị nhấp nháy",              status: "Đã xử lý" },
  { code: "TB-311", name: "Máy kéo cáp Hoist",   room: "Fitness Lab", who: "Nguyễn Văn Khoa", date: "17/05/2026", desc: "Dây cáp bị sờn cần thay mới",       status: "Chờ xử lý" },
];

const FEEDBACK = [
  { id: "FB-091", member: "Phạm Khánh An",  type: "Thiết bị",  content: "Phòng tắm thiếu khăn vào giờ cao điểm, mong shop bổ sung thêm.", date: "22/05/2026", status: "Chờ xử lý" },
  { id: "FB-090", member: "Hoàng Minh Tú",  type: "Nhân viên", content: "Đề xuất thêm lớp Yoga buổi tối thứ 4 và thứ 6.",                date: "21/05/2026", status: "Đã phản hồi" },
  { id: "FB-089", member: "Bùi Quỳnh Anh",  type: "Nhân viên", content: "PT Mạnh hướng dẫn rất tâm huyết, cảm ơn trung tâm!",            date: "20/05/2026", status: "Đã phản hồi" },
  { id: "FB-088", member: "Ngô Hữu Đức",    type: "Thiết bị",  content: "Máy chạy số 4 ở Cardio Zone hơi kêu, cần kiểm tra.",            date: "20/05/2026", status: "Chờ xử lý" },
];

const MEMBERS = [
  { code: "HV0241", name: "Phạm Khánh An",   phone: "0901 222 333", pkg: "Elite VIP 6T", remain: "Hết hạn 12/11/2026", status: "Đang hoạt động" },
  { code: "HV0240", name: "Hoàng Minh Tú",   phone: "0912 545 121", pkg: "Gym Pro 3T",    remain: "32 ngày",            status: "Đang hoạt động" },
  { code: "HV0239", name: "Bùi Quỳnh Anh",   phone: "0938 119 200", pkg: "Personal 24B",  remain: "14 buổi",            status: "Đang hoạt động" },
  { code: "HV0238", name: "Ngô Hữu Đức",     phone: "0977 343 998", pkg: "Gym Starter",   remain: "3 buổi",             status: "Sắp hết hạn" },
  { code: "HV0237", name: "Trịnh Bảo Long",  phone: "0902 565 232", pkg: "Yoga Flow 1T",  remain: "Hết hạn 02/04/2026", status: "Đã hết hạn" },
  { code: "HV0236", name: "Lý Thanh Vy",     phone: "0913 444 010", pkg: "Combo Cardio",  remain: "8 buổi",             status: "Đang hoạt động" },
];

const REVENUE = [
  { m: "T12", v: 142 }, { m: "T1", v: 168 }, { m: "T2", v: 154 },
  { m: "T3", v: 189 }, { m: "T4", v: 212 }, { m: "T5", v: 246 },
];
const NEW_MEMBERS = [
  { m: "T12", v: 24 }, { m: "T1", v: 31 }, { m: "T2", v: 28 },
  { m: "T3", v: 38 }, { m: "T4", v: 44 }, { m: "T5", v: 52 },
];
const PKG_BREAKDOWN = [
  { name: "Gym Pro",  value: 38, color: "#6C63FF" },
  { name: "Elite VIP",value: 22, color: "#00C9A7" },
  { name: "Personal", value: 18, color: "#FFB547" },
  { name: "Yoga",     value: 14, color: "#38BDF8" },
  { name: "Cardio",   value: 8,  color: "#FF5C5C" },
];

/* ───────────────────────────── Primitives ───────────────────────────── */

const cn = (...x: (string | false | undefined)[]) => x.filter(Boolean).join(" ");

function Badge({ tone = "default", children }: { tone?: "default" | "violet" | "emerald" | "amber" | "red" | "sky" | "gray"; children: React.ReactNode }) {
  const map: Record<string, string> = {
    default:  "bg-muted text-foreground/80 border-border",
    violet:   "bg-[#6C63FF]/12 text-[#3F36C9] border-[#6C63FF]/40 dark:bg-[#6C63FF]/15 dark:text-[#A8A2FF] dark:border-[#6C63FF]/30",
    emerald:  "bg-[#00C9A7]/20 text-[#005E4F] border-[#00C9A7]/50 dark:bg-[#00C9A7]/15 dark:text-[#5FE6CB] dark:border-[#00C9A7]/30",
    amber:    "bg-[#FFB547]/25 text-[#6B3500] border-[#FFB547]/60 dark:bg-[#FFB547]/15 dark:text-[#FFD89B] dark:border-[#FFB547]/30",
    red:      "bg-[#FF5C5C]/15 text-[#991B1B] border-[#FF5C5C]/50 dark:bg-[#FF5C5C]/15 dark:text-[#FFA0A0] dark:border-[#FF5C5C]/30",
    sky:      "bg-sky-400/20 text-sky-900 border-sky-400/50 dark:bg-sky-400/15 dark:text-sky-300 dark:border-sky-400/30",
    gray:     "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium tracking-wide", map[tone])}>
      {children}
    </span>
  );
}

function StatusPill({ value }: { value: string }) {
  const t =
    /hoạt động|đang làm|đang kinh doanh|đã phản hồi|đã xử lý/i.test(value) ? "emerald" :
    /chờ|sắp/i.test(value) ? "amber" :
    /bảo trì|đang xử lý/i.test(value) ? "sky" :
    /hết hạn|ngừng|nghỉ phép/i.test(value) ? "red" : "gray";
  return <Badge tone={t as any}>● {value}</Badge>;
}

function Button({
  children, variant = "primary", icon: Icon, onClick, className, ...props
}: { children?: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"; icon?: any; onClick?: () => void; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const map: Record<string, string> = {
    primary:   "bg-[#6C63FF] hover:bg-[#7A72FF] text-white shadow-[0_8px_24px_-12px_rgba(108,99,255,0.8)]",
    secondary: "bg-[#00C9A7] hover:bg-[#13d9b7] text-[#07120F]",
    outline:   "border border-border hover:border-border text-foreground bg-muted/40",
    ghost:     "hover:bg-accent text-foreground/80",
    danger:    "bg-[#FF5C5C] hover:bg-[#ff7575] text-white",
  };
  return (
    <button onClick={onClick} className={cn(
      "inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-[13px] font-medium transition-all active:scale-[0.98]",
      map[variant], className)} {...props}>
      {Icon && <Icon className="size-4 stroke-[1.75]" />}
      {children}
    </button>
  );
}

function IconBtn({ icon: Icon, tone = "default", onClick }: { icon: any; tone?: "default" | "danger"; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "inline-flex items-center justify-center size-8 rounded-md border border-transparent hover:border-border hover:bg-accent text-muted-foreground hover:text-foreground transition",
      tone === "danger" && "hover:text-[#FF8C8C]"
    )}>
      <Icon className="size-4 stroke-[1.75]" />
    </button>
  );
}

function Input({ icon: Icon, placeholder, type = "text", className, value, onChange }: any) {
  const controlled = onChange !== undefined;
  return (
    <div className={cn("relative", className)}>
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground stroke-[1.75]" />}
      <input type={type} {...(controlled ? { value: value ?? "", onChange } : { defaultValue: value })} placeholder={placeholder} className={cn(
        "w-full h-10 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground/60",
        "focus:outline-none focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/15 transition px-3",
        Icon && "pl-9"
      )} />
    </div>
  );
}

function Card({ children, className, padded = true }: { children: React.ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl bg-card border border-border card-shadow",
      padded && "p-5", className
    )}>{children}</div>
  );
}

function SectionTitle({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h1 className="font-display text-[22px] tracking-tight">{title}</h1>
        {sub && <p className="text-[13px] text-muted-foreground mt-1">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-6">
        <div onClick={(e) => e.stopPropagation()} className={cn("glass rounded-2xl border border-border w-full shadow-2xl my-auto", wide ? "max-w-2xl" : "max-w-md")}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-display">{title}</h3>
            <button onClick={onClose} className="size-8 rounded-md hover:bg-accent grid place-items-center"><X className="size-4" /></button>
          </div>
          <div className="p-5">{children}</div>
          {footer && <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body
  );
}

function Field({ label, children, hint }: { label: React.ReactNode; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] uppercase tracking-wider text-muted-foreground flex items-center gap-0.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

/* ───────────────────────────── Sidebar + Header ───────────────────────────── */

function Sidebar({ role, theme, onToggleTheme, onLogout }: { role: Role; theme: "light" | "dark"; onToggleTheme: () => void; onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const view = location.pathname === "/" ? "home" : location.pathname.slice(1).replace(/\//g, ".");
  const [open, setOpen] = useState<string | null>(null);
  const nav = NAV[role];
  return (
    <aside className="w-[244px] shrink-0 h-screen sticky top-0 bg-sidebar border-r border-border/60 flex flex-col">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="relative size-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#3F39C7] grid place-items-center shadow-[0_8px_20px_-8px_rgba(108,99,255,0.7)]">
            <Dumbbell className="size-4 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[#00C9A7] border-2 border-sidebar" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-bold">GymOS</div>
            <div className="text-[10.5px] text-muted-foreground tracking-wider uppercase">Operations Suite</div>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4 flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/40">
        <div className={cn("size-8 rounded-lg grid place-items-center text-white text-[12px] font-semibold bg-gradient-to-br", ROLE_META[role].tone)}>
          {ROLE_META[role].initials}
        </div>
        <div className="flex-1 text-left leading-tight min-w-0">
          <div className="text-[12.5px] font-medium truncate">{ROLE_META[role].person}</div>
          <div className="text-[10.5px] text-muted-foreground truncate">{ROLE_META[role].name}</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        <div className="px-2 pb-2 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground/60">Workspace</div>
        {nav.map((item) => {
          const isActive = view === item.id || view.startsWith(item.id + ".") || item.children?.some((c) => c.id === view);
          const isOpen = open === item.id || isActive;
          return (
            <div key={item.id}>
              <button
                onClick={() => { item.children ? setOpen(isOpen ? null : item.id) : navigate(item.id === "home" ? "/" : "/" + item.id.replace(/\./g, "/")); }}
                className={cn(
                  "w-full group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] transition-all",
                  isActive ? "bg-sidebar-accent text-foreground" : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/60"
                )}>
                {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#6C63FF]" />}
                <item.icon className={cn("size-[17px] stroke-[1.75]", isActive ? "text-[#4F46E5] dark:text-[#A8A2FF]" : "text-muted-foreground")} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.children && <ChevronRight className={cn("size-3.5 text-muted-foreground transition-transform", isOpen && "rotate-90")} />}
              </button>
              {item.children && isOpen && (
                <div className="ml-9 my-1 border-l border-border pl-2 space-y-0.5">
                  {item.children.map((c) => (
                    <button key={c.id} onClick={() => navigate("/" + c.id.replace(/\./g, "/"))}
                      className={cn("w-full text-left px-2.5 py-1.5 text-[12.5px] rounded-md transition",
                        view === c.id ? "text-foreground bg-sidebar-accent" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60")}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border/60 space-y-1">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 border border-border mb-1">
          <button onClick={() => theme === "dark" && onToggleTheme()} className={cn(
            "flex-1 flex items-center justify-center gap-1.5 h-7 rounded-md text-[11.5px] font-medium transition",
            theme === "light" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}><Sun className="size-3.5" /> Light</button>
          <button onClick={() => theme === "light" && onToggleTheme()} className={cn(
            "flex-1 flex items-center justify-center gap-1.5 h-7 rounded-md text-[11.5px] font-medium transition",
            theme === "dark" ? "bg-[#2e3245] text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}><Moon className="size-3.5" /> Dark</button>
        </div>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] text-[#B91C1C] dark:text-[#FFA0A0] hover:bg-[#FF5C5C]/10">
          <LogOut className="size-4 stroke-[1.75]" /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}

function Header({ role, breadcrumb, onLogout }: { role: Role; breadcrumb: string[]; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [cf, setCf] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNw, setShowNw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const mismatch = nw.length > 0 && cf.length > 0 && nw !== cf;
  const rules = [
    { id: "len",  label: "Tối thiểu 8 ký tự",                 ok: nw.length >= 8 },
    { id: "case", label: "Có chữ hoa và chữ thường",          ok: /[a-z]/.test(nw) && /[A-Z]/.test(nw) },
    { id: "num",  label: "Có ít nhất 1 chữ số",               ok: /\d/.test(nw) },
    { id: "sym",  label: "Có ký tự đặc biệt (!@#…)",          ok: /[^A-Za-z0-9]/.test(nw) },
    { id: "diff", label: "Khác mật khẩu hiện tại",            ok: nw.length > 0 && nw !== cur },
  ];
  const score = rules.filter((r) => r.ok).length;
  const strengthLabel = nw.length === 0 ? "" : score <= 2 ? "Yếu" : score === 3 ? "Trung bình" : score === 4 ? "Khá mạnh" : "Mạnh";
  const strengthTone = score <= 2 ? "bg-[#FF5C5C]" : score === 3 ? "bg-[#FFB547]" : score === 4 ? "bg-sky-500" : "bg-[#00C9A7]";
  const canSubmit = cur.length > 0 && rules.every((r) => r.ok) && nw === cf;
  const [saved, setSaved] = useState(false);
  const resetForm = () => { setCur(""); setNw(""); setCf(""); setSaved(false); setShowCur(false); setShowNw(false); setShowCf(false); };
  return (
    <header className="h-16 px-7 flex items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className={cn(i === breadcrumb.length - 1 && "text-foreground font-medium")}>{b}</span>
            {i < breadcrumb.length - 1 && <ChevronRight className="size-3.5 opacity-50" />}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2.5 pr-1 pl-1 py-1 rounded-lg hover:bg-accent/60 transition">
            <div className={cn("size-8 rounded-lg grid place-items-center text-white text-[12px] font-semibold bg-gradient-to-br", ROLE_META[role].tone)}>
              {ROLE_META[role].initials}
            </div>
            <div className="leading-tight text-left">
              <div className="text-[12.5px] font-medium">Xin chào, {ROLE_META[role].person.split(" ").pop()}</div>
              <div className="text-[10.5px] text-muted-foreground">{ROLE_META[role].name}</div>
            </div>
            <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 rounded-xl bg-popover border border-border shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-border/60 flex items-center gap-2.5">
                  <div className={cn("size-9 rounded-lg grid place-items-center text-white text-[12px] font-semibold bg-gradient-to-br", ROLE_META[role].tone)}>
                    {ROLE_META[role].initials}
                  </div>
                  <div className="leading-tight">
                    <div className="text-[12.5px] font-medium">{ROLE_META[role].person}</div>
                    <div className="text-[10.5px] text-muted-foreground">{ROLE_META[role].name}</div>
                  </div>
                </div>
                <div className="p-1.5">
                  <button onClick={() => { setOpen(false); setPwOpen(true); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-foreground hover:bg-accent/60 transition">
                    <KeyRound className="size-4 stroke-[1.75]" /> Đổi mật khẩu
                  </button>
                  <button onClick={() => { setOpen(false); onLogout(); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#B91C1C] dark:text-[#FFA0A0] hover:bg-[#FF5C5C]/10 transition">
                    <LogOut className="size-4 stroke-[1.75]" /> Đăng xuất
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal open={pwOpen} onClose={() => { setPwOpen(false); resetForm(); }} title="Đổi mật khẩu"
        footer={saved ? <Button icon={CheckCircle2} onClick={() => { setPwOpen(false); resetForm(); }}>Đóng</Button>
        : <>
          <Button variant="ghost" onClick={() => { setPwOpen(false); resetForm(); }}>Hủy</Button>
          <Button icon={CheckCircle2} className={cn(!canSubmit && "opacity-50 cursor-not-allowed pointer-events-none")}
            onClick={() => canSubmit && setSaved(true)}>Lưu thay đổi</Button>
        </>}>
        {saved ? (
          <div className="text-center py-6">
            <div className="size-14 rounded-full bg-[#00C9A7]/18 grid place-items-center mx-auto">
              <CheckCircle2 className="size-7 text-[#00866F] dark:text-[#5FE6CB]" />
            </div>
            <h3 className="font-display text-[17px] mt-4">Đã cập nhật mật khẩu</h3>
            <p className="text-[12.5px] text-muted-foreground mt-1">Lần đăng nhập kế tiếp hãy dùng mật khẩu mới của bạn.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { label: "Mật khẩu hiện tại", v: cur, set: setCur, show: showCur, toggle: () => setShowCur(!showCur), key: "cur" },
              { label: "Mật khẩu mới",       v: nw,  set: setNw,  show: showNw,  toggle: () => setShowNw(!showNw),   key: "nw"  },
              { label: "Xác nhận mật khẩu mới", v: cf, set: setCf, show: showCf, toggle: () => setShowCf(!showCf), key: "cf" },
            ].map((f) => {
              const fieldMismatch = f.key === "cf" && mismatch;
              return (
                <Field key={f.label} label={f.label}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input type={f.show ? "text" : "password"} value={f.v} onChange={(e) => f.set(e.target.value)} placeholder="••••••••"
                      className={cn("w-full h-10 rounded-lg bg-input-background border pl-9 pr-9 text-[13.5px] focus:outline-none transition",
                        fieldMismatch ? "border-[#FF5C5C]/60 focus:border-[#FF5C5C] focus:ring-2 focus:ring-[#FF5C5C]/15"
                                      : "border-border focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/15")} />
                    <button type="button" onClick={f.toggle} title={f.show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 size-6 grid place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                      {f.show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                  {f.key === "nw" && nw.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[11.5px] mb-1">
                        <span className="text-muted-foreground">Độ mạnh mật khẩu</span>
                        <span className="font-medium">{strengthLabel}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full transition-all", strengthTone)} style={{ width: `${(score / rules.length) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </Field>
              );
            })}

            <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Yêu cầu mật khẩu</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                {rules.map((r) => (
                  <li key={r.id} className={cn("flex items-center gap-1.5 text-[12px]",
                    r.ok ? "text-[#00866F] dark:text-[#5FE6CB]" : "text-muted-foreground")}>
                    {r.ok ? <CheckCircle2 className="size-3.5" /> : <X className="size-3.5 opacity-60" />}
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>

            {mismatch && (
              <div className="text-[12px] text-[#991B1B] dark:text-[#FFA0A0] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FF5C5C]/10 border border-[#FF5C5C]/30">
                <AlertTriangle className="size-3.5" /> Mật khẩu xác nhận không khớp với mật khẩu mới.
              </div>
            )}
          </div>
        )}
      </Modal>
    </header>
  );
}

/* ───────────────────────────── Screens ───────────────────────────── */

function ThemeToggle({ theme, onToggle, floating }: { theme: "light" | "dark"; onToggle: () => void; floating?: boolean }) {
  return (
    <button onClick={onToggle} className={cn(
      "inline-flex items-center justify-center size-9 rounded-lg border border-border bg-card hover:bg-accent transition",
      floating && "fixed top-5 right-5 z-50 shadow-lg"
    )} title={theme === "dark" ? "Chuyển sang Light" : "Chuyển sang Dark"}>
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

function Login({ onEnter, theme, onToggleTheme }: { onEnter: (role: Role) => void; theme: "light" | "dark"; onToggleTheme: () => void }) {
  const [email, setEmail] = useState("owner@gymos.vn");
  const [password, setPassword] = useState("owner@123");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const acc = ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password);
    if (!acc) { setError("Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại."); return; }
    setError(null);
    onEnter(acc.role);
  };
  const quickFill = (a: typeof ACCOUNTS[number]) => { setEmail(a.email); setPassword(a.password); setError(null); };
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative">
      <ThemeToggle theme={theme} onToggle={onToggleTheme} floating />
      <div className="dark text-foreground relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0F1117] via-[#15172A] to-[#1B0E2E] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute -top-32 -left-20 size-[420px] rounded-full bg-[#6C63FF]/15 blur-[140px]" />
        <div className="absolute -bottom-32 right-0 size-[420px] rounded-full bg-[#00C9A7]/10 blur-[140px]" />

        <div className="relative flex items-center gap-2.5">
          <div className="size-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#3F39C7] grid place-items-center">
            <Dumbbell className="size-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-[17px]">GymOS</div>
            <div className="text-[10.5px] text-muted-foreground tracking-wider uppercase">Operations Suite</div>
          </div>
        </div>

        <div className="relative space-y-6 max-w-md">
          <h1 className="font-display text-[44px] leading-[1.05] tracking-tight font-bold">
            Vận hành phòng tập như <span className="bg-gradient-to-r from-[#A8A2FF] to-[#5FE6CB] bg-clip-text text-transparent">một SaaS hiện đại</span>.
          </h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Theo dõi hội viên, lịch chấm công, doanh thu, thiết bị bảo trì — tất cả trong một dashboard duy nhất, được thiết kế cho 4 vai trò vận hành.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 lg:p-16 bg-background">
        <div className="w-full max-w-[400px] text-foreground">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="size-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#3F39C7] grid place-items-center"><Dumbbell className="size-5 text-white" /></div>
            <div className="font-display font-bold text-[17px]">GymOS</div>
          </div>
          <h2 className="font-display text-[28px] font-bold tracking-tight">Chào mừng trở lại 👋</h2>

          <div className="mt-8 space-y-4">
            <Field label="Email"><Input icon={Mail} placeholder="ban@gymos.vn" value={email} onChange={(e: any) => { setEmail(e.target.value); setError(null); }} /></Field>
            <Field label="Mật khẩu">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground stroke-[1.75]" />
                <input
                  type={showLoginPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  className="w-full h-10 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/15 transition pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPw(!showLoginPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-6 grid place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition"
                  title={showLoginPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showLoginPw ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </Field>
            {error && <div className="text-[12.5px] text-[#FF7B7B] flex items-start gap-1.5"><AlertTriangle className="size-3.5 mt-0.5 shrink-0" />{error}</div>}
            <Button className="w-full h-11 justify-center" onClick={submit} icon={ArrowRight}>Đăng nhập</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeWidgets({ role }: { role: Role }) {
  const navigate = useNavigate();
  const setView = (v: string) => navigate(v === "home" ? "/" : "/" + v.replace(/\./g, "/"));
  const widgets: Record<Role, { icon: any; title: string; desc: string; view: string; tone: string }[]> = {
    owner: [
      { icon: Users,        title: "Quản lý nhân sự",   desc: "Danh sách, chấm công, đánh giá nhân sự",  view: "staff",      tone: "from-[#6C63FF]/20 to-transparent" },
      { icon: LayoutGrid,   title: "Quản lý gói tập",   desc: "Thiết kế và quản lý gói dịch vụ",         view: "packages",   tone: "from-[#00C9A7]/20 to-transparent" },
      { icon: Building2,    title: "Quản lý phòng tập", desc: "Các khu vực và thiết bị trong phòng",     view: "rooms",      tone: "from-[#FFB547]/20 to-transparent" },
      { icon: Dumbbell,     title: "Quản lý thiết bị",  desc: "Theo dõi loại, lịch sử bảo trì",          view: "equipment",  tone: "from-[#FF5C5C]/20 to-transparent" },
      { icon: MessageSquare,title: "Phản hồi hội viên", desc: "Xử lý phản hồi và yêu cầu hỗ trợ",        view: "feedback",   tone: "from-sky-500/20 to-transparent" },
      { icon: BarChart3,    title: "Báo cáo thống kê",  desc: "Doanh thu, hội viên, nhân sự",            view: "reports",    tone: "from-violet-500/20 to-transparent" },
    ],
    staff: [
      { icon: Users,        title: "Danh sách hội viên",desc: "Tra cứu, sửa, gia hạn hội viên",          view: "members",     tone: "from-[#6C63FF]/20 to-transparent" },
      { icon: UserPlus,     title: "Thêm hội viên",     desc: "Tạo hội viên mới + thanh toán",           view: "members.new", tone: "from-[#00C9A7]/20 to-transparent" },
      { icon: MessageSquare,title: "Phản hồi hội viên", desc: "Tiếp nhận và phản hồi yêu cầu",           view: "feedback",    tone: "from-[#FFB547]/20 to-transparent" },
      { icon: Wrench,       title: "Bảo trì thiết bị",  desc: "Gửi và theo dõi yêu cầu bảo trì",         view: "maintenance", tone: "from-[#FF5C5C]/20 to-transparent" },
    ],
    trainer: [
      { icon: Users,       title: "Học viên của tôi", desc: "Xem và quản lý danh sách học viên", view: "students", tone: "from-[#FFB547]/20 to-transparent" },
      { icon: CreditCard,  title: "Gia hạn gói tập",  desc: "Gia hạn gói tập cho học viên",      view: "renew",    tone: "from-[#6C63FF]/20 to-transparent" },
      { icon: KeyRound,    title: "Đổi mật khẩu",     desc: "Cập nhật mật khẩu tài khoản",       view: "changepw", tone: "from-[#00C9A7]/20 to-transparent" },
    ],
    member: [
      { icon: CreditCard,   title: "Gia hạn gói tập",   desc: "Đăng ký hoặc gia hạn gói hiện tại",       view: "renew",      tone: "from-[#6C63FF]/20 to-transparent" },
      { icon: CalIcon,      title: "Lịch sử tập luyện", desc: "Xem lại các buổi tập đã check in",         view: "history",    tone: "from-[#00C9A7]/20 to-transparent" },
      { icon: MessageSquare,title: "Gửi phản hồi",      desc: "Đóng góp ý kiến cho phòng tập",            view: "mfeedback",  tone: "from-[#FFB547]/20 to-transparent" },
    ],
  };

  const me = ROLE_META[role];
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/30 p-8">
        <div className="relative space-y-6">
          <div className="space-y-3">
            <Badge tone="violet">{me.name}</Badge>
            <h1 className="font-display text-[32px] font-bold tracking-tight leading-tight">
              Xin chào, {me.person.split(" ").pop()} 👋
            </h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Hôm nay là <span className="text-foreground">Chủ Nhật, 07/06/2026</span>. Chúc bạn một ngày làm việc hiệu quả tại GymOS.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Activity, label: "Check in hôm nay", value: "128", tone: "emerald" },
              { icon: TrendingUp, label: "Doanh thu hôm nay", value: "12.4 tr", tone: "violet" },
              { icon: Wrench, label: "Yêu cầu bảo trì mở", value: "4", tone: "amber" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-xl bg-muted/70 border border-border p-3">
                <div className={cn("size-9 grid place-items-center rounded-lg",
                  s.tone === "emerald" && "bg-[#00C9A7]/15 text-[#00866F] dark:text-[#5FE6CB]",
                  s.tone === "violet" && "bg-[#6C63FF]/15 text-[#4F46E5] dark:text-[#A8A2FF]",
                  s.tone === "amber" && "bg-[#FFB547]/15 text-[#A66A00] dark:text-[#FFD89B]")}>
                  <s.icon className="size-4 stroke-[1.75]" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                  <div className="font-display font-bold text-[18px]">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display">Truy cập nhanh</h2>
          <span className="text-[12px] text-muted-foreground">{widgets[role].length} chức năng</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets[role].map((w) => (
            <button key={w.title} onClick={() => setView(w.view)}
              className="group relative overflow-hidden text-left rounded-2xl p-5 bg-card border border-border hover:border-[#6C63FF]/40 transition-all hover:-translate-y-0.5">
              <div className="relative flex items-start justify-between">
                <div className="size-11 rounded-xl grid place-items-center bg-muted border border-border group-hover:bg-[#6C63FF]/20 group-hover:border-[#6C63FF]/30 transition">
                  <w.icon className="size-5 stroke-[1.75] text-[#4F46E5] dark:text-[#A8A2FF]" />
                </div>
                <div className="size-8 rounded-lg grid place-items-center border border-border group-hover:bg-[#6C63FF] group-hover:border-[#6C63FF] transition">
                  <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground" />
                </div>
              </div>
              <div className="relative mt-5">
                <div className="font-display font-semibold text-[15px]">{w.title}</div>
                <div className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">{w.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Staff form (shared by Add + Edit) ── */
export type StaffRecord = {
  code: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  join: string;
  status: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
};

const Req = () => <span className="text-[#FF5C5C] ml-0.5">*</span>;

function StaffForm({ data, onSubmit, onCancel }: { data?: StaffRecord; onSubmit?: (data: any) => void; onCancel?: () => void }) {
  const isEdit = !!data;
  const [formData, setFormData] = useState({
    name: data?.name ?? "",
    dateOfBirth: data?.dateOfBirth ?? "",
    gender: data?.gender ?? "Nam",
    phone: data?.phone ?? "",
    address: data?.address ?? "",
    role: data?.role ?? "Nhân viên quản lý",
    email: data?.email ?? "",
    password: "",
    status: data?.status ?? "Đang làm"
  });

  const handleChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  
  const needsAccount = /Nhân viên|Huấn luyện/.test(formData.role);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(formData); }} className="grid grid-cols-2 gap-4">
      {isEdit && (
        <Field label="Mã nhân sự">
          <Input value={data!.code} readOnly className="bg-muted opacity-70" />
        </Field>
      )}
      <Field label={<>Họ tên<Req /></>}><Input placeholder="Nguyễn Văn A" value={formData.name} onChange={(e: any) => handleChange("name", e.target.value)} required /></Field>
      <Field label={<>Ngày sinh<Req /></>}><Input type="date" value={formData.dateOfBirth} onChange={(e: any) => handleChange("dateOfBirth", e.target.value)} required /></Field>
      <Field label={<>Giới tính<Req /></>}>
        <div className="flex gap-2">{["Nam", "Nữ", "Khác"].map((g, i) => (
          <button type="button" key={g} onClick={() => handleChange("gender", g)} className={cn("h-10 flex-1 rounded-lg border text-[13px]", formData.gender === g ? "border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF] dark:text-white" : "border-border text-muted-foreground hover:bg-accent")}>{g}</button>
        ))}</div>
      </Field>
      <Field label={<>Số điện thoại<Req /></>}><Input icon={Phone} placeholder="09xx xxx xxx" value={formData.phone} onChange={(e: any) => handleChange("phone", e.target.value)} required /></Field>
      <Field label={<>Địa chỉ<Req /></>}><Input placeholder="Số nhà, đường, quận…" value={formData.address} onChange={(e: any) => handleChange("address", e.target.value)} required /></Field>
      <Field label={<>Role<Req /></>}>
        <div className="relative">
          <select value={formData.role} onChange={(e) => handleChange("role", e.target.value)} className="w-full h-10 rounded-lg bg-input-background border border-border px-3 text-[13px] appearance-none">
            <option>Nhân viên quản lý</option><option>Huấn luyện viên</option><option>Chủ phòng tập</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
      </Field>
      {needsAccount && (
        <>
          <Field label={<>Email đăng nhập<Req /></>}>
            <Input icon={Mail} placeholder="email@gymos.vn" value={formData.email} onChange={(e: any) => handleChange("email", e.target.value)} required={!isEdit} />
          </Field>
          <Field label={<>{isEdit ? "Đặt lại mật khẩu" : "Mật khẩu"}</>} hint={isEdit ? "Để trống nếu không đổi" : "Mặc định 123456 nếu để trống"}>
            <Input icon={Lock} type="password" placeholder="••••••••" value={formData.password} onChange={(e: any) => handleChange("password", e.target.value)} />
          </Field>
        </>
      )}
      {isEdit && (
        <Field label={<>Trạng thái<Req /></>}>
          <div className="relative">
            <select value={formData.status} onChange={(e) => handleChange("status", e.target.value)} className="w-full h-10 rounded-lg bg-input-background border border-border px-3 text-[13px] appearance-none">
              <option>Đang làm</option><option>Nghỉ phép</option><option>Đã thôi việc</option><option>Đã vô hiệu hóa</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
        </Field>
      )}
      
      {/* Footer actions built into form */}
      <div className="col-span-2 flex items-center justify-end gap-2 pt-4 mt-2 border-t border-border">
        <Button variant="ghost" type="button" onClick={onCancel}>Hủy</Button>
        <Button icon={CheckCircle2} type="submit">{isEdit ? "Lưu thay đổi" : "Lưu nhân sự"}</Button>
      </div>
    </form>
  );
}

/* ── Staff list ── */
function StaffList({ staffs, refresh, onSelect, onEdit = () => {} }: { staffs: StaffRecord[]; refresh: () => void; onSelect: (id: string) => void; onEdit?: (code: string) => void }) {
  const [modal, setModal] = useState<"new" | "del" | null>(null);
  const [delTarget, setDelTarget] = useState<StaffRecord | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"Tất cả" | "Nhân viên quản lý" | "Huấn luyện viên">("Tất cả");

  const filtered = staffs.filter((s) => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""));
    const matchR = roleFilter === "Tất cả" || s.role === roleFilter;
    return matchQ && matchR;
  });

  return (
    <div className="space-y-5">
      <SectionTitle title="Danh sách nhân sự" sub={`Hiển thị ${filtered.length} / ${staffs.length} nhân sự`} actions={
        <>
          <Button icon={Plus} onClick={() => setModal("new")}>Thêm nhân sự</Button>
        </>
      } />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-md flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, mã nhân sự, email, SĐT…"
            className="w-full h-10 rounded-lg bg-input-background border border-border pl-9 pr-9 text-[13.5px] focus:outline-none focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/15 transition"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 size-6 grid place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(["Tất cả", "Nhân viên quản lý", "Huấn luyện viên"] as const).map((c) => (
            <button key={c} onClick={() => setRoleFilter(c)} className={cn(
              "h-9 px-3 rounded-lg text-[12.5px] border transition",
              roleFilter === c
                ? "bg-[#6C63FF]/15 border-[#6C63FF]/40 text-[#6C63FF] dark:text-[#4F46E5] dark:text-[#A8A2FF]"
                : "border-border text-muted-foreground hover:text-foreground hover:border-[#6C63FF]/30"
            )}>{c}</button>
          ))}
        </div>
      </div>

      <Card padded={false}>
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="size-12 rounded-2xl bg-muted/60 border border-border grid place-items-center mx-auto">
              <Search className="size-5 text-muted-foreground" />
            </div>
            <h3 className="font-display mt-4">Không tìm thấy kết quả</h3>
            <p className="text-[13px] text-muted-foreground mt-1">Thử thay đổi từ khóa hoặc bộ lọc role.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setQuery(""); setRoleFilter("Tất cả"); }}>Xóa bộ lọc</Button>
          </div>
        ) : (
          <>
            <DataTable
              head={["Mã NS", "Họ tên", "Role", "Email", "SĐT", "Ngày vào", "Trạng thái", ""]}
              rows={filtered.map((s) => [
                <span className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{s.code}</span>,
                <button onClick={() => onSelect(s.code)} className="flex items-center gap-2.5 text-left hover:text-[#4F46E5] dark:text-[#A8A2FF]">
                  <div className="size-7 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#3F39C7] grid place-items-center text-[10.5px] text-white font-semibold">
                    {s.name.split(" ").slice(-2).map(n => n[0]).join("")}
                  </div>
                  <span className="font-medium">{s.name}</span>
                </button>,
                <Badge tone={s.role.includes("Huấn") ? "amber" : "sky"}>{s.role}</Badge>,
                <span className="text-muted-foreground">{s.email}</span>,
                <span className="font-mono text-[12.5px]">{s.phone}</span>,
                s.join,
                <StatusPill value={s.status} />,
                <div className="flex items-center justify-end gap-0.5">
                  <IconBtn icon={Eye} onClick={() => onSelect(s.code)} />
                  <IconBtn icon={Pencil} onClick={() => onEdit?.(s.code)} />
                  <IconBtn icon={Trash2} tone="danger" onClick={() => { setDelTarget(s); setModal("del"); }} />
                </div>,
              ])}
            />
            <Pagination />
          </>
        )}
      </Card>

      <Modal open={modal === "new"} onClose={() => setModal(null)} title="Thêm nhân sự mới" wide>
        <StaffForm 
          onCancel={() => setModal(null)} 
          onSubmit={(data) => {
            fetch("http://localhost:5000/api/v1/staffs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }).then(res => res.json()).then(() => {
              refresh();
              setModal(null);
            });
          }} 
        />
      </Modal>

      <Modal open={modal === "del"} onClose={() => setModal(null)} title="Xác nhận xóa"
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Hủy</Button><Button variant="danger" icon={Trash2} onClick={() => {
          if (delTarget) {
            fetch(`http://localhost:5000/api/v1/staffs/${delTarget.code}`, { method: "DELETE" })
              .then(res => res.json()).then(() => { refresh(); setModal(null); });
          }
        }}>Xác nhận xóa</Button></>}>
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-[#FF5C5C]/15 grid place-items-center text-[#B91C1C] dark:text-[#FFA0A0]"><Trash2 className="size-5" /></div>
          <div>
            <p className="text-[14px]">Bạn có chắc muốn xóa nhân sự <span className="font-semibold">{delTarget?.name ?? ""}</span>?</p>
            <p className="text-[12.5px] text-muted-foreground mt-1">Hành động này sẽ chuyển trạng thái nhân sự sang "Đã vô hiệu hóa" và không thể hoàn tác từ giao diện.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground/80">
            {head.map((h, i) => (
              <th key={i} className={cn("px-5 py-3 font-medium border-b border-border/70", i === head.length - 1 && "text-right")}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={cn("transition", i % 2 === 1 && "bg-muted/30", "hover:bg-accent/60")}>
              {r.map((c, j) => (
                <td key={j} className={cn("px-5 py-3.5 border-b border-border/50 align-middle", j === r.length - 1 && "text-right")}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination() {
  return (
    <div className="flex items-center justify-between px-5 py-4 text-[12.5px] text-muted-foreground">
      <div>Hiển thị 1–6 trên 32 kết quả</div>
      <div className="flex items-center gap-1">
        {["‹", "1", "2", "3", "4", "›"].map((p, i) => (
          <button key={i} className={cn("size-8 grid place-items-center rounded-md text-[12.5px]",
            i === 1 ? "bg-[#6C63FF] text-white" : "hover:bg-accent border border-border")}>{p}</button>
        ))}
      </div>
    </div>
  );
}

/* ── Staff Detail ── */
function StaffDetail({ id, staffs, refresh, onBack, onEdit = () => {} }: { id: string; staffs: StaffRecord[]; refresh: () => void; onBack: () => void; onEdit?: (code: string) => void }) {
  const s = staffs.find((x) => x.code === id);
  if (!s) return <div className="text-center p-10 text-muted-foreground">Không tìm thấy nhân viên.</div>;
  const [delOpen, setDelOpen] = useState(false);
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOffset = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const monthNames = ["01","02","03","04","05","06","07","08","09","10","11","12"];
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const v = (i * 7) % 11;
    return v < 6 ? "ok" : v < 9 ? "late" : i % 5 === 0 ? "absent" : "ok";
  });
  const okCount = days.filter((d) => d === "ok").length;
  const lateCount = days.filter((d) => d === "late").length;
  const absentCount = days.filter((d) => d === "absent").length;
  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); };
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-[12.5px] text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ChevronRight className="size-3.5 rotate-180" /> Quay lại danh sách nhân sự
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="size-24 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#3F39C7] grid place-items-center text-white font-display text-[28px] font-bold">
                {s.name.split(" ").slice(-2).map((n) => n[0]).join("")}
              </div>
              <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-[#00C9A7] border-4 border-card" />
            </div>
            <h2 className="font-display text-[20px] mt-4">{s.name}</h2>
            <div className="mt-1.5"><Badge tone="amber">{s.role}</Badge></div>
            <div className="mt-1 font-mono text-[12px] text-muted-foreground">{s.code}</div>
          </div>

          <dl className="mt-6 space-y-3 text-[13px]">
            {[
              ["Email", s.email, Mail],
              ["Số điện thoại", s.phone, Phone],
              ["Ngày sinh", "12/04/1995", CalIcon],
              ["Địa chỉ", "Số 12, Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội", Building2],
              ["Ngày vào làm", s.join, ShieldCheck],
            ].map(([k, v, I]: any) => (
              <div key={k} className="flex items-start gap-3 py-2 border-b border-border/60 last:border-0">
                <I className="size-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-[11px] text-muted-foreground">{k}</div>
                  <div className="mt-0.5">{v}</div>
                </div>
              </div>
            ))}
          </dl>
          <div className="flex gap-2 mt-5">
            <Button variant="outline" icon={Pencil} className="flex-1 justify-center" onClick={() => onEdit?.(s.code)}>Sửa</Button>
            <Button variant="danger" icon={Trash2} className="flex-1 justify-center" onClick={() => setDelOpen(true)}>Xóa</Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display">Lịch chấm công — Tháng {monthNames[calMonth]} / {calYear}</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">Trực quan hóa thời gian đi làm trong tháng hiện tại.</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="size-8 rounded-md border border-border hover:bg-accent grid place-items-center text-muted-foreground hover:text-foreground transition">
                <ChevronRight className="size-4 rotate-180" />
              </button>
              <button onClick={nextMonth} className="size-8 rounded-md border border-border hover:bg-accent grid place-items-center text-muted-foreground hover:text-foreground transition">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { k: "Tổng ngày đi làm", v: okCount, tone: "emerald" },
              { k: "Đi chưa đủ giờ",    v: lateCount, tone: "amber" },
              { k: "Vắng",              v: absentCount, tone: "red" },
            ].map((m: any) => (
              <div key={m.k} className="rounded-xl border border-border p-4 bg-muted/40">
                <div className="text-[11px] uppercase text-muted-foreground tracking-wider">{m.k}</div>
                <div className="font-display font-bold text-[26px] mt-1">{m.v}</div>
                <div className="mt-1"><Badge tone={m.tone}>Tháng {monthNames[calMonth]}/{calYear}</Badge></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {"T2 T3 T4 T5 T6 T7 CN".split(" ").map((d) => (
              <div key={d} className="text-[10.5px] uppercase tracking-wider text-muted-foreground py-1">{d}</div>
            ))}
            {Array.from({ length: firstDayOffset }).map((_, i) => <div key={"x" + i} />)}
            {days.map((d, i) => (
              <div key={i} className={cn(
                "aspect-[4/3] rounded-lg grid place-items-center text-[12px] font-medium relative",
                d === "ok" && "bg-[#00C9A7]/15 text-[#00866F] dark:text-[#5FE6CB] border border-[#00C9A7]/25",
                d === "late" && "bg-[#FFB547]/15 text-[#A66A00] dark:text-[#FFD89B] border border-[#FFB547]/25",
                d === "absent" && "bg-muted/40 text-muted-foreground/40 border border-border/60"
              )}>
                {i + 1}
                {d === "ok" && <span className="absolute bottom-1 right-1 size-1 rounded-full bg-[#00C9A7]" />}
                {d === "late" && <span className="absolute bottom-1 right-1 size-1 rounded-full bg-[#FFB547]" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={delOpen} onClose={() => setDelOpen(false)} title="Xác nhận xóa"
        footer={<><Button variant="ghost" onClick={() => setDelOpen(false)}>Hủy</Button><Button variant="danger" icon={Trash2} onClick={() => {
          fetch(`http://localhost:5000/api/v1/staffs/${s.code}`, { method: "DELETE" })
            .then(res => res.json()).then(() => {
              setDelOpen(false);
              refresh();
              onBack();
            });
        }}>Xác nhận xóa</Button></>}>
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-[#FF5C5C]/15 grid place-items-center text-[#B91C1C] dark:text-[#FFA0A0]"><Trash2 className="size-5" /></div>
          <div>
            <p className="text-[14px]">Bạn có chắc muốn xóa nhân sự <span className="font-semibold">{s.name}</span>?</p>
            <p className="text-[12.5px] text-muted-foreground mt-1">Hành động này sẽ chuyển trạng thái nhân sự sang "Đã vô hiệu hóa" và không thể hoàn tác từ giao diện.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Attendance ── */
function Attendance({ staffs }: { staffs: StaffRecord[] }) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState<boolean[]>([true, true, true, true, true, false, false]);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<StaffRecord | null>(null);
  const [recent, setRecent] = useState<{ code: string; name: string; time: string; kind: "in" | "out" }[]>(() => {
    try {
      const saved = localStorage.getItem("gym_recent_activities");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem("gym_recent_activities", JSON.stringify(recent));
  }, [recent]);
  const suggestions = query.trim().length === 0
    ? []
    : staffs.filter((s) =>
        s.code.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
  const doCheck = (s: StaffRecord) => {
    const last = recent.find((r) => r.code === s.code);
    const kind: "in" | "out" = last?.kind === "in" ? "out" : "in";
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setRecent([{ code: s.code, name: s.name, time, kind }, ...recent.filter((r) => r.code !== s.code)].slice(0, 5));
    setPicked(null); setQuery("");
  };
  return (
    <div className="space-y-5">
      <SectionTitle title="Chấm công nhân sự" sub="Tìm theo tên hoặc mã nhân sự để check in / check out, hoặc thiết lập khung giờ làm việc." />
      <div className="grid lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3">
          <div className="max-w-lg mx-auto py-4">
            <div className="text-center">
              <div className="size-16 rounded-2xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 grid place-items-center mx-auto">
                <KeyRound className="size-7 text-[#4F46E5] dark:text-[#A8A2FF]" />
              </div>
              <h3 className="font-display text-[18px] mt-4">Chấm công nhanh</h3>
              <p className="text-[12.5px] text-muted-foreground mt-1">Gõ tên hoặc mã nhân sự — hệ thống tự gợi ý và xác định check in / check out.</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="relative">
                <Input icon={Search} placeholder="Gõ tên, mã NS hoặc email…"
                  value={query} onChange={(e: any) => { setQuery(e.target.value); setPicked(null); }} />
                {suggestions.length > 0 && !picked && (
                  <div className="absolute z-20 left-0 right-0 mt-1.5 rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
                    {suggestions.map((s) => (
                      <button key={s.code} type="button" onClick={() => { setPicked(s); setQuery(`${s.name} (${s.code})`); }}
                        className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-muted/60 border-b border-border/60 last:border-0 transition">
                        <div className="size-9 rounded-lg bg-muted border border-border grid place-items-center text-[11px] font-mono">{s.name.split(" ").slice(-2).map((n) => n[0]).join("")}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium truncate">{s.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{s.code} · {s.role}</div>
                        </div>
                        <Badge tone={s.role === "Huấn luyện viên" ? "amber" : "sky"}>{s.role}</Badge>
                      </button>
                    ))}
                  </div>
                )}
                {query && suggestions.length === 0 && !picked && (
                  <div className="absolute z-20 left-0 right-0 mt-1.5 rounded-xl border border-border bg-popover shadow-xl px-3 py-3 text-[12.5px] text-muted-foreground">
                    Không tìm thấy nhân sự phù hợp với "{query}".
                  </div>
                )}
              </div>

              {picked && (
                <div className="rounded-xl border border-[#6C63FF]/40 bg-[#6C63FF]/8 dark:bg-[#6C63FF]/10 p-3 flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#3F39C7] grid place-items-center text-white font-display font-semibold text-[13px]">
                    {picked.name.split(" ").slice(-2).map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[13.5px] font-medium truncate">{picked.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{picked.code} · {picked.role}</div>
                  </div>
                  <button onClick={() => { setPicked(null); setQuery(""); }} className="size-7 rounded-md hover:bg-accent grid place-items-center"><X className="size-3.5" /></button>
                </div>
              )}

              <Button className="w-full h-11 justify-center" icon={CheckCircle2}
                onClick={() => picked && doCheck(picked)}>
                {picked
                  ? (recent.find((r) => r.code === picked.code)?.kind === "in" ? "Check out ngay" : "Check in ngay")
                  : "Chọn nhân sự để chấm công"}
              </Button>
            </div>

            <div className="mt-8 border-t border-border/60 pt-6">
              <h3 className="font-display">Khung giờ làm việc</h3>
              <p className="text-[12.5px] text-muted-foreground mt-1">Cấu hình hiện tại áp dụng cho toàn bộ nhân sự.</p>
              <div className="mt-4 space-y-2">
                {[
                  { d: "T2 → T6", in: "06:30", out: "21:00" },
                  { d: "Thứ 7",   in: "08:00", out: "20:00" },
                  { d: "Chủ Nhật",in: "08:00", out: "12:00" },
                ].map((r) => (
                  <div key={r.d} className="flex items-center justify-between rounded-lg bg-muted/40 border border-border/70 px-3 py-2.5">
                    <span className="text-[13px]">{r.d}</span>
                    <span className="font-mono text-[12px] text-muted-foreground">{r.in} → {r.out}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" icon={Pencil} className="w-full justify-center mt-4" onClick={() => setOpen(true)}>
                Thay đổi giờ vào / tan ca
              </Button>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
            <span>Hoạt động gần đây</span>
            <span className="flex items-center gap-1 normal-case tracking-normal text-[11.5px]"><Activity className="size-3.5" /> {recent.length} lượt hôm nay</span>
          </div>
          <ul className="space-y-1.5">
            {recent.map((r) => (
              <li key={r.code + r.time} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] text-muted-foreground">{r.code}</span>
                  <span className="text-[13px]">{r.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={r.kind === "in" ? "emerald" : "amber"}>{r.kind === "in" ? "Check in" : "Check out"}</Badge>
                  <span className="font-mono text-[12px] text-muted-foreground">{r.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Thiết lập giờ làm việc" wide
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button><Button>Lưu thay đổi</Button></>}>
        <div className="space-y-4">
          <Field label="Chọn các ngày làm việc">
            <div className="flex flex-wrap gap-2">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d, i) => (
                <button key={d} type="button" onClick={() => setDays(days.map((v, idx) => idx === i ? !v : v))}
                  className={cn(
                    "h-10 px-4 rounded-lg border text-[13px] transition",
                    days[i] ? "bg-[#6C63FF]/15 border-[#6C63FF]/40 text-[#6C63FF] dark:text-white"
                            : "border-border text-muted-foreground hover:border-[#6C63FF]/30"
                  )}>{d}</button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Giờ vào ca"><Input type="time" value="06:30" /></Field>
            <Field label="Giờ tan ca"><Input type="time" value="21:00" /></Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Packages ── */
type PackageRecord = (typeof PACKAGES)[number];

function PackageForm({ data, onSubmit, formId }: { data?: PackageRecord; onSubmit: (e: React.FormEvent, data: Omit<PackageRecord, "id">) => void; formId: string }) {
  const inferType: "session" | "duration" = data
    ? /buổi/i.test(data.type) ? "session" : "duration"
    : "session";
  const [pkgType, setPkgType] = useState<"session" | "duration">(inferType);
  const [name, setName] = useState(data?.name ?? "");
  const numMatch = data?.type.match(/\d+/)?.[0] ?? "";
  const [num, setNum] = useState(numMatch);
  
  const initialUnit = data ? (data.type.includes("tháng") ? "month" : data.type.includes("tuần") ? "week" : data.type.includes("ngày") ? "day" : "month") : "month";
  const [unit, setUnit] = useState(initialUnit);
  
  const [price, setPrice] = useState(data ? data.price.toString() : "");
  const [vip, setVip] = useState(data?.vip ?? false);
  const [trainer, setTrainer] = useState(data?.trainer ?? false);
  const [status, setStatus] = useState(data?.status ?? "Đang kinh doanh");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !num || !price) return;
    const finalType = pkgType === "session" ? `${num} buổi` : `${num} ${unit === "month" ? "tháng" : unit === "week" ? "tuần" : "ngày"}`;
    onSubmit(e, {
      name,
      type: finalType,
      vip,
      trainer,
      price: parseInt(price.replace(/\D/g, "") || "0"),
      status
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <Field label="Loại gói">
        <div className="grid grid-cols-2 gap-2">
          {([["session", "Theo số buổi"], ["duration", "Theo thời gian"]] as const).map(([k, label]) => {
            const active = pkgType === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setPkgType(k)}
                className={cn(
                  "h-11 rounded-lg border text-[13px] transition",
                  active
                    ? "border-[#6C63FF] bg-[#6C63FF]/10 text-foreground font-medium ring-1 ring-[#6C63FF]/40"
                    : "border-border text-muted-foreground hover:border-[#6C63FF]/40 hover:text-foreground"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={<>Tên gói tập<Req /></>}>
          <Input placeholder={pkgType === "session" ? "VD: Gym Pro 24 buổi" : "VD: Gym Pro 6 tháng"} value={name} onChange={(e: any) => setName(e.target.value)} required />
        </Field>
        {pkgType === "session" ? (
          <Field label={<>Số buổi<Req /></>}><Input placeholder="VD: 24" type="number" value={num} onChange={(e: any) => setNum(e.target.value)} required /></Field>
        ) : (
          <Field label={<>Thời hạn<Req /></>}>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input placeholder="VD: 6" type="number" value={num} onChange={(e: any) => setNum(e.target.value)} required />
              <select value={unit} onChange={(e: any) => setUnit(e.target.value)} className="h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
                <option value="month">Tháng</option>
                <option value="week">Tuần</option>
                <option value="day">Ngày</option>
              </select>
            </div>
          </Field>
        )}
        <Field label={<>Giá (VND)<Req /></>}><Input placeholder="VD: 2.400.000" value={price} onChange={(e: any) => setPrice(e.target.value)} required /></Field>
        <Field label="Tùy chọn">
          <div className="space-y-2 pt-1">
            {([["VIP", vip, setVip], ["Kèm Huấn luyện viên", trainer, setTrainer], ["Đang kinh doanh", status === "Đang kinh doanh", (v: boolean) => setStatus(v ? "Đang kinh doanh" : "Ngừng kinh doanh")]] as const).map(([n, on, setter]) => (
              <div key={n as string} className="flex items-center justify-between bg-muted/40 px-3 py-2 rounded-lg border border-border/70 cursor-pointer select-none" onClick={() => setter(!on)}>
                <span className="text-[13px]">{n}</span>
                <div className={cn("w-9 h-5 rounded-full p-0.5 transition", on ? "bg-[#6C63FF]" : "bg-accent")}>
                  <div className={cn("size-4 rounded-full bg-white transition", on && "translate-x-4")} />
                </div>
              </div>
            ))}
          </div>
        </Field>
      </div>
    </form>
  );
}

function Packages() {
  const [list, setList] = useState<PackageRecord[]>([]);

  const fetchPackages = () => {
    fetch("http://localhost:5000/api/v1/packages")
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setList(res.data.map((d: any) => {
            let t = "";
            if (d.packageType === "session") t = `${d.numberOfWorkout || 0} buổi`;
            else t = `${d.duration || 0} tháng`;
            return {
              id: d.packageId,
              name: d.packageName,
              type: t,
              vip: d.vipIncluded,
              trainer: d.trainerIncluded,
              price: Number(d.price),
              status: d.status || "Đang kinh doanh"
            };
          }));
        }
      });
  };

  useEffect(() => {
    fetchPackages();
  }, []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [typeFilter, setTypeFilter] = useState<string>("Tất cả");
  const [filterVip, setFilterVip] = useState(false);
  const [filterTrainer, setFilterTrainer] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = list.filter((p) =>
    (statusFilter === "Tất cả" || p.status === statusFilter) &&
    (typeFilter === "Tất cả" || (typeFilter === "session" ? /buổi/i.test(p.type) : !/buổi/i.test(p.type))) &&
    (!filterVip || p.vip) &&
    (!filterTrainer || p.trainer) &&
    (p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase()))
  );
  const viewing = viewId ? list.find((p) => p.id === viewId) : null;
  const editing = editId ? list.find((p) => p.id === editId) : null;
  const deleting = deleteId ? list.find((p) => p.id === deleteId) : null;

  const handleAdd = (e: React.FormEvent, data: Omit<PackageRecord, "id">) => {
    const isSession = data.type.includes("buổi");
    const num = parseInt(data.type.replace(/\D/g, "") || "0");
    const payload = {
      packageName: data.name,
      packageType: isSession ? "session" : "duration",
      numberOfWorkout: isSession ? num : null,
      duration: !isSession ? num : null,
      vipIncluded: data.vip,
      trainerIncluded: data.trainer,
      price: data.price,
      status: data.status
    };
    fetch("http://localhost:5000/api/v1/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(() => {
      fetchPackages();
      setOpen(false);
    });
  };

  const handleEdit = (e: React.FormEvent, data: Omit<PackageRecord, "id">) => {
    if (!editId) return;
    const isSession = data.type.includes("buổi");
    const num = parseInt(data.type.replace(/\D/g, "") || "0");
    const payload = {
      packageName: data.name,
      packageType: isSession ? "session" : "duration",
      numberOfWorkout: isSession ? num : null,
      duration: !isSession ? num : null,
      vipIncluded: data.vip,
      trainerIncluded: data.trainer,
      price: data.price,
      status: data.status
    };
    fetch(`http://localhost:5000/api/v1/packages/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(() => {
      fetchPackages();
      setEditId(null);
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    fetch(`http://localhost:5000/api/v1/packages/${deleteId}`, {
      method: "DELETE"
    }).then(() => {
      fetchPackages();
      setDeleteId(null);
    });
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Quản lý gói tập" sub={`${list.length} gói dịch vụ — ${list.filter(p => p.status === "Đang kinh doanh").length} đang kinh doanh`}
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Thêm gói tập</Button>} />
      <div className="flex flex-wrap items-center gap-3">
        <Input icon={Search} placeholder="Tìm theo tên gói…" className="max-w-xs" value={query} onChange={(e: any) => setQuery(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Đang kinh doanh">Đang kinh doanh</option>
          <option value="Ngừng kinh doanh">Ngừng kinh doanh</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          <option value="Tất cả">Tất cả loại</option>
          <option value="session">Theo số buổi</option>
          <option value="duration">Theo thời gian</option>
        </select>
        <label className="flex items-center gap-2 text-[13px] cursor-pointer select-none">
          <input type="checkbox" checked={filterVip} onChange={(e) => setFilterVip(e.target.checked)} className="size-4 rounded accent-[#6C63FF]" />
          VIP
        </label>
        <label className="flex items-center gap-2 text-[13px] cursor-pointer select-none">
          <input type="checkbox" checked={filterTrainer} onChange={(e) => setFilterTrainer(e.target.checked)} className="size-4 rounded accent-[#6C63FF]" />
          Có Trainer
        </label>
      </div>

      {/* Table layout at full-width (xl+), card layout at smaller */}
      <div className="hidden xl:block">
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Mã / Tên gói", "Loại", "Giá", "Phân loại", "Trạng thái", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="bg-card hover:bg-muted/30 transition">
                  <td className="px-4 py-3">
                    <div className="font-mono text-[11px] text-muted-foreground">{p.id}</div>
                    <div className="font-medium">{p.name}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                  <td className="px-4 py-3 font-display font-bold">{p.price.toLocaleString("vi-VN")} <span className="text-[11px] text-muted-foreground font-normal">₫</span></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.vip && <Badge tone="amber">★ VIP</Badge>}
                      {p.trainer && <Badge tone="violet">Có Trainer</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusPill value={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <IconBtn icon={Eye} onClick={() => setViewId(p.id)} />
                      <IconBtn icon={Pencil} onClick={() => setEditId(p.id)} />
                      <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteId(p.id)} />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-10">Không có gói nào khớp với bộ lọc hiện tại</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <Card key={p.id} className="relative overflow-hidden group hover:border-[#6C63FF]/40 transition">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-border" />
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[11px] text-muted-foreground">{p.id}</div>
                <h3 className="font-display text-[17px] mt-0.5">{p.name}</h3>
                <div className="text-[12.5px] text-muted-foreground mt-0.5">{p.type}</div>
              </div>
              <IconBtn icon={MoreHorizontal} />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.vip && <Badge tone="amber">★ VIP</Badge>}
              {p.trainer && <Badge tone="violet">Có Trainer</Badge>}
              <StatusPill value={p.status} />
            </div>
            <div className="flex items-end justify-between mt-5 pt-4 border-t border-border/70">
              <div>
                <div className="text-[11px] text-muted-foreground">Giá</div>
                <div className="font-display font-bold text-[22px]">{p.price.toLocaleString("vi-VN")}<span className="text-[12px] text-muted-foreground font-normal ml-1">₫</span></div>
              </div>
              <div className="flex gap-1.5">
                <IconBtn icon={Eye} onClick={() => setViewId(p.id)} />
                <IconBtn icon={Pencil} onClick={() => setEditId(p.id)} />
                <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteId(p.id)} />
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="md:col-span-2 text-center text-muted-foreground py-10">Không có gói nào khớp với bộ lọc hiện tại</Card>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Thêm gói tập mới" wide
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button><Button type="submit" form="add-pkg-form">Lưu gói tập</Button></>}>
        <PackageForm formId="add-pkg-form" onSubmit={handleAdd} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditId(null)} title={`Chỉnh sửa gói — ${editing?.name ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditId(null)}>Hủy</Button><Button type="submit" form="edit-pkg-form" icon={CheckCircle2}>Lưu thay đổi</Button></>}>
        {editing && <PackageForm formId="edit-pkg-form" data={editing} onSubmit={handleEdit} />}
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewId(null)} title={`Chi tiết gói — ${viewing?.name ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setViewId(null)}>Đóng</Button><Button icon={Pencil} onClick={() => { const id = viewing!.id; setViewId(null); setEditId(id); }}>Chỉnh sửa</Button></>}>
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 rounded-xl bg-muted/40 border border-border/70">
              <div>
                <div className="font-mono text-[11px] text-muted-foreground">{viewing.id}</div>
                <h3 className="font-display text-[19px] mt-0.5">{viewing.name}</h3>
                <div className="text-[12.5px] text-muted-foreground mt-0.5">{viewing.type}</div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {viewing.vip && <Badge tone="amber">★ VIP</Badge>}
                  {viewing.trainer && <Badge tone="violet">Có Trainer</Badge>}
                  <StatusPill value={viewing.status} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-muted-foreground">Giá niêm yết</div>
                <div className="font-display font-bold text-[26px]">{viewing.price.toLocaleString("vi-VN")} <span className="text-[12px] text-muted-foreground font-normal">₫</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Mã gói", viewing.id],
                ["Loại gói", /buổi/i.test(viewing.type) ? "Theo số buổi" : "Theo thời gian"],
                ["Thời lượng / Số buổi", viewing.type],
                ["Trạng thái", viewing.status],
                ["VIP", viewing.vip ? "Có" : "Không"],
                ["Huấn luyện viên", viewing.trainer ? "Có" : "Không"],
              ].map(([k, v]) => (
                <div key={k as string} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/70 bg-card">
                  <span className="text-[12px] text-muted-foreground">{k}</span>
                  <span className="text-[13px] font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleteId(null)} title="Xóa gói tập"
        footer={<>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button icon={Trash2} onClick={handleDelete}>Xóa gói</Button>
        </>}>
        {deleting && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Bạn có chắc chắn muốn xóa gói <span className="font-medium">{deleting.name}</span> ({deleting.id})?</p>
            <p className="text-[12.5px] text-muted-foreground">Hành động này sẽ chuyển trạng thái gói tập sang "Đã vô hiệu hóa" và không thể hoàn tác từ giao diện. Hội viên đang sử dụng gói sẽ không bị ảnh hưởng cho đến khi gia hạn.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Rooms ── */
type RoomRecord = (typeof ROOMS)[number];
const ROOM_TYPES = ["Gym", "Cardio", "Yoga", "Fitness", "Other"] as const;
const ROOM_STATUSES = ["Hoạt động", "Bảo trì", "Tạm đóng"] as const;

function RoomForm({ data }: { data?: RoomRecord }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label={<>Mã phòng<Req /></>}><Input placeholder="VD: PT06" value={data?.id} /></Field>
      <Field label={<>Tên phòng<Req /></>}><Input placeholder="VD: Sảnh Gym B" value={data?.name} /></Field>
      <Field label={<>Loại phòng<Req /></>}>
        <select defaultValue={data?.type ?? "Gym"} className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label={<>Trạng thái<Req /></>}>
        <select defaultValue={data?.status ?? "Hoạt động"} className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          {ROOM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <div className="col-span-2">
        <Field label="Ghi chú">
          <textarea placeholder="Mô tả khu vực, lưu ý vận hành…" className="w-full min-h-[88px] rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/15 transition px-3 py-2 text-[13px]" />
        </Field>
      </div>
    </div>
  );
}

function Rooms({ onSelect }: { onSelect?: (id: string) => void }) {
  const [list, setList] = useState<RoomRecord[]>(ROOMS);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Tất cả");
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = list.filter((r) =>
    (typeFilter === "Tất cả" || r.type === typeFilter) &&
    (statusFilter === "Tất cả" || r.status === statusFilter) &&
    (r.name.toLowerCase().includes(query.toLowerCase()) || r.id.toLowerCase().includes(query.toLowerCase()))
  );
  const editing = editId ? list.find((r) => r.id === editId) : null;
  const deleting = deleteId ? list.find((r) => r.id === deleteId) : null;
  const totalDevices = list.reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-5">
      <SectionTitle title="Quản lý phòng tập" sub={`${list.length} khu vực, tổng ${totalDevices} thiết bị đang vận hành`}
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Thêm phòng tập</Button>} />
      <div className="flex flex-wrap items-center gap-3">
        <Input icon={Search} placeholder="Tìm theo tên hoặc mã phòng…" className="max-w-md" value={query} onChange={(e: any) => setQuery(e.target.value)} />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          <option value="Tất cả">Tất cả loại phòng</option>
          {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          <option value="Tất cả">Tất cả trạng thái</option>
          {ROOM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((r) => {
          const deviceCount = EQUIPMENT_ITEMS.filter((e) => e.room === r.name).length;
          return (
          <Card key={r.id} className="group hover:border-[#6C63FF]/40 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-muted border border-border grid place-items-center">
                  <Building2 className="size-5 text-[#4F46E5] dark:text-[#A8A2FF]" />
                </div>
                <div>
                  <div className="font-mono text-[11px] text-muted-foreground">{r.id}</div>
                  <h3 className="font-display text-[16px]">{r.name}</h3>
                </div>
              </div>
              <Badge tone={r.type === "Gym" ? "violet" : r.type === "Cardio" ? "red" : r.type === "Yoga" ? "emerald" : r.type === "Fitness" ? "amber" : "sky"}>{r.type}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
                <div className="text-[10.5px] uppercase text-muted-foreground tracking-wider">Thiết bị</div>
                <div className="font-display font-bold text-[20px] mt-0.5">{deviceCount}</div>
              </div>
              <div className="rounded-lg bg-muted/40 border border-border/60 p-3 flex flex-col justify-between">
                <div className="text-[10.5px] uppercase text-muted-foreground tracking-wider">Trạng thái</div>
                <StatusPill value={r.status} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 mt-4 pt-4 border-t border-border/70">
              <IconBtn icon={Eye} onClick={() => onSelect?.(r.id)} />
              <IconBtn icon={Pencil} onClick={() => setEditId(r.id)} />
              <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteId(r.id)} />
            </div>
          </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3 text-center text-muted-foreground py-10">Không có phòng nào khớp với bộ lọc hiện tại</Card>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Thêm phòng tập mới" wide
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button><Button onClick={() => setOpen(false)}>Lưu phòng tập</Button></>}>
        <RoomForm />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditId(null)} title={`Chỉnh sửa phòng — ${editing?.name ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditId(null)}>Hủy</Button><Button icon={CheckCircle2} onClick={() => setEditId(null)}>Lưu thay đổi</Button></>}>
        {editing && <RoomForm data={editing} />}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleteId(null)} title="Xóa phòng tập"
        footer={<>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button icon={Trash2} onClick={() => { setList(list.filter((r) => r.id !== deleteId)); setDeleteId(null); }}>Xóa phòng</Button>
        </>}>
        {deleting && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Bạn có chắc chắn muốn xóa phòng <span className="font-medium">{deleting.name}</span> ({deleting.id})?</p>
            <p className="text-[12.5px] text-muted-foreground">Hành động này sẽ chuyển trạng thái phòng tập và {EQUIPMENT_ITEMS.filter((e) => e.room === deleting.name).length} thiết bị thuộc phòng này sang trạng thái "Đã vô hiệu hóa" và không thể hoàn tác từ giao diện. Hãy đảm bảo các thiết bị cần giữ lại đã được chuyển sang khu vực khác trước khi xóa.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function RoomDeviceForm({ data }: { data?: { code?: string; typeId?: string; pos?: string; status?: string } }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label={<>Loại thiết bị<Req /></>}>
        <select defaultValue={data?.typeId ?? EQUIPMENT_TYPES[0].id} className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          {EQUIPMENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </Field>
      <Field label={<>Mã thiết bị<Req /></>}><Input placeholder="VD: TB-602" value={data?.code} /></Field>
      <Field label={<>Vị trí trong phòng<Req /></>}><Input placeholder="VD: Hàng 2 — Slot 5" value={data?.pos} /></Field>
      <Field label={<>Tình trạng<Req /></>}>
        <select defaultValue={data?.status ?? "Hoạt động"} className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          {["Hoạt động", "Đang bảo trì", "Tạm ngưng"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
    </div>
  );
}

type RoomDevice = { code: string; typeId: string; pos: string; status: string };

function RoomDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const room = ROOMS.find((r) => r.id === id) ?? ROOMS[0];
  const initial: RoomDevice[] = EQUIPMENT_ITEMS
    .filter((e) => e.room === room.name)
    .map((e, i) => ({ code: e.code, typeId: e.typeId, pos: `Hàng ${Math.floor(i / 4) + 1} — Slot ${(i % 4) + 1}`, status: e.status }));
  const [devices, setDevices] = useState<RoomDevice[]>(initial);
  const [editRoom, setEditRoom] = useState(false);
  const [delRoom, setDelRoom] = useState(false);
  const [addDev, setAddDev] = useState(false);
  const [editDev, setEditDev] = useState<RoomDevice | null>(null);
  const [delDev, setDelDev] = useState<RoomDevice | null>(null);

  const typeName = (tid: string) => EQUIPMENT_TYPES.find((t) => t.id === tid)?.name ?? tid;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-[12.5px] text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ChevronRight className="size-3.5 rotate-180" /> Quay lại danh sách phòng tập
      </button>

      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-xl bg-muted border border-border grid place-items-center">
              <Building2 className="size-6 text-[#4F46E5] dark:text-[#A8A2FF]" />
            </div>
            <div>
              <div className="font-mono text-[11px] text-muted-foreground">{room.id}</div>
              <h2 className="font-display text-[20px] mt-0.5">{room.name}</h2>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge tone={room.type === "Gym" ? "violet" : room.type === "Cardio" ? "red" : room.type === "Yoga" ? "emerald" : room.type === "Fitness" ? "amber" : "sky"}>{room.type}</Badge>
                <StatusPill value={room.status} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={Pencil} onClick={() => setEditRoom(true)}>Sửa</Button>
            <Button variant="danger" icon={Trash2} onClick={() => setDelRoom(true)}>Xóa</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            ["Mã phòng", room.id],
            ["Loại phòng", room.type],
            ["Số thiết bị", `${devices.length} máy`],
            ["Trạng thái", room.status],
          ].map(([k, v]) => (
            <div key={k} className="px-3 py-2.5 rounded-lg border border-border/70 bg-muted/30">
              <div className="text-[11px] text-muted-foreground">{k}</div>
              <div className="text-[13px] font-medium mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display">Thiết bị trong phòng này</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">{devices.length} thiết bị đang được vận hành tại khu vực này.</p>
          </div>
          <Button icon={Plus} onClick={() => setAddDev(true)}>Thêm thiết bị vào phòng</Button>
        </div>

        <DataTable
          head={["Mã TB", "Tên loại", "Vị trí", "Trạng thái", "Hành động"]}
          rows={devices.map((d) => [
            <span key="c" className="font-mono text-[12px]">{d.code}</span>,
            typeName(d.typeId),
            d.pos,
            <StatusPill key="s" value={d.status} />,
            <div key="a" className="flex items-center gap-1 justify-end">
              <IconBtn icon={Pencil} onClick={() => setEditDev(d)} />
              <IconBtn icon={Trash2} tone="danger" onClick={() => setDelDev(d)} />
            </div>,
          ])}
        />
        {devices.length === 0 && (
          <div className="text-center text-muted-foreground py-8 text-[13px]">Chưa có thiết bị nào trong phòng này.</div>
        )}
      </Card>

      <Modal open={editRoom} onClose={() => setEditRoom(false)} title={`Chỉnh sửa phòng — ${room.name}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditRoom(false)}>Hủy</Button><Button icon={CheckCircle2} onClick={() => setEditRoom(false)}>Lưu thay đổi</Button></>}>
        <RoomForm data={room} />
      </Modal>

      <Modal open={delRoom} onClose={() => setDelRoom(false)} title="Xóa phòng tập"
        footer={<>
          <Button variant="ghost" onClick={() => setDelRoom(false)}>Hủy</Button>
          <Button icon={Trash2} onClick={() => { setDelRoom(false); onBack(); }}>Xóa phòng</Button>
        </>}>
        <div className="space-y-3">
          <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
          <p className="text-[14px]">Bạn có chắc chắn muốn xóa phòng <span className="font-medium">{room.name}</span> ({room.id})?</p>
          <p className="text-[12.5px] text-muted-foreground">{devices.length} thiết bị thuộc phòng này cần được chuyển sang khu vực khác trước khi xóa.</p>
        </div>
      </Modal>

      <Modal open={addDev} onClose={() => setAddDev(false)} title="Thêm thiết bị vào phòng" wide
        footer={<><Button variant="ghost" onClick={() => setAddDev(false)}>Hủy</Button><Button icon={CheckCircle2} onClick={() => {
          setDevices([...devices, { code: `TB-${600 + devices.length + 1}`, typeId: EQUIPMENT_TYPES[0].id, pos: `Hàng ${devices.length + 1} — Slot 1`, status: "Hoạt động" }]);
          setAddDev(false);
        }}>Thêm thiết bị</Button></>}>
        <RoomDeviceForm />
      </Modal>

      <Modal open={!!editDev} onClose={() => setEditDev(null)} title={`Chỉnh sửa thiết bị — ${editDev?.code ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditDev(null)}>Hủy</Button><Button icon={CheckCircle2} onClick={() => setEditDev(null)}>Lưu thay đổi</Button></>}>
        {editDev && <RoomDeviceForm data={editDev} />}
      </Modal>

      <Modal open={!!delDev} onClose={() => setDelDev(null)} title="Xóa thiết bị khỏi phòng"
        footer={<>
          <Button variant="ghost" onClick={() => setDelDev(null)}>Hủy</Button>
          <Button icon={Trash2} onClick={() => { setDevices(devices.filter((d) => d.code !== delDev!.code)); setDelDev(null); }}>Xóa thiết bị</Button>
        </>}>
        {delDev && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Bạn có chắc chắn muốn xóa thiết bị <span className="font-mono">{delDev.code}</span> khỏi phòng <span className="font-medium">{room.name}</span>?</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Equipment management (owner) ── */
type EquipmentType = (typeof EQUIPMENT_TYPES)[number];
type EquipmentItem = (typeof EQUIPMENT_ITEMS)[number];
type MaintenanceRecord = (typeof MAINTENANCE)[number];
const EQUIPMENT_CATEGORIES = ["Cardio", "Gym", "Yoga", "Fitness", "Other"] as const;

function EquipmentTypeForm({ data, onChange }: { data?: Partial<EquipmentType>; onChange: (d: Partial<EquipmentType>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label={<>Mã loại<Req /></>}><Input placeholder="VD: ET07" value={data?.code || ""} onChange={(e: any) => onChange({ ...data, code: e.target.value })} /></Field>
      <Field label={<>Tên loại thiết bị<Req /></>}><Input placeholder="VD: Máy tập đẩy ngực" value={data?.name || ""} onChange={(e: any) => onChange({ ...data, name: e.target.value })} /></Field>
      <Field label={<>Phân loại<Req /></>}>
        <select value={data?.category || "Cardio"} onChange={(e) => onChange({ ...data, category: e.target.value as any })} className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          {EQUIPMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label={<>Hãng / Nhà sản xuất<Req /></>}><Input placeholder="VD: Matrix" value={data?.brand || ""} onChange={(e: any) => onChange({ ...data, brand: e.target.value })} /></Field>
      <Field label={<>Bảo hành (tháng)<Req /></>}><Input placeholder="VD: 24" type="number" value={data?.warranty?.toString() || ""} onChange={(e: any) => onChange({ ...data, warranty: parseInt(e.target.value) || 0 })} /></Field>
      <div className="col-span-2">
        <Field label={<>Mô tả<Req /></>}>
          <textarea value={data?.desc || ""} onChange={(e) => onChange({ ...data, desc: e.target.value })} placeholder="Mô tả chi tiết loại thiết bị…" className="w-full min-h-[88px] rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/15 transition px-3 py-2 text-[13px]" />
        </Field>
      </div>
    </div>
  );
}

function EquipmentItemForm({ data, onChange, roomList }: { data?: Partial<EquipmentItem>; onChange: (d: Partial<EquipmentItem>) => void; roomList?: any[] }) {
  const rooms = roomList || ROOMS;
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label={<>Mã thiết bị<Req /></>}><Input placeholder="VD: TB-602" value={data?.code || ""} onChange={(e: any) => onChange({ ...data, code: e.target.value })} /></Field>
      <Field label={<>Phòng / Khu vực<Req /></>}>
        <select value={data?.room || rooms[0]?.name} onChange={(e) => onChange({ ...data, room: e.target.value })} className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          {rooms.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
        </select>
      </Field>
      <Field label={<>Ngày mua<Req /></>}><Input placeholder="DD/MM/YYYY" value={data?.purchased || ""} onChange={(e: any) => onChange({ ...data, purchased: e.target.value })} /></Field>
      <Field label={<>Trạng thái<Req /></>}>
        <select value={data?.status || "Hoạt động"} onChange={(e) => onChange({ ...data, status: e.target.value })} className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          <option value="Hoạt động">Hoạt động</option>
          <option value="Đang bảo trì">Đang bảo trì</option>
          <option value="Ngừng sử dụng">Ngừng sử dụng</option>
        </select>
      </Field>
    </div>
  );
}

function Equipment() {
  const [types, setTypes] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [typeQuery, setTypeQuery] = useState("");

  const fetchEquipmentsData = () => {
    Promise.all([
      fetch("http://localhost:5000/api/v1/equipment-types").then(res => res.json()),
      fetch("http://localhost:5000/api/v1/equipments").then(res => res.json()),
      fetch("http://localhost:5000/api/v1/rooms").then(res => res.json())
    ]).then(([typesRes, itemsRes, roomsRes]) => {
      if (Array.isArray(typesRes)) setTypes(typesRes.map((t: any) => ({ id: t.typeId, code: t.typeCode || t.typeId.split('-')[0].toUpperCase(), name: t.equipmentName, category: t.category, brand: t.brand, warranty: t.warrantyDuration, desc: t.description })));
      if (Array.isArray(itemsRes)) setItems(itemsRes.map((i: any) => ({ id: i.equipmentId, code: i.equipmentCode, typeId: i.typeId, room: i.Room?.roomName, purchased: i.importDate, status: i.usageStatus })));
      if (Array.isArray(roomsRes) && roomsRes.length > 0) setRooms(roomsRes.map((r: any) => ({ id: r.roomId, name: r.roomName })));
    }).catch(console.error);
  };

  useEffect(() => {
    fetchEquipmentsData();
  }, []);
  const [catFilter, setCatFilter] = useState<string>("Tất cả");
  const [addType, setAddType] = useState(false);
  const [viewTypeId, setViewTypeId] = useState<string | null>(null);
  const [editTypeId, setEditTypeId] = useState<string | null>(null);
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null);
  const [addItemForType, setAddItemForType] = useState<string | null>(null);
  const [editItemCode, setEditItemCode] = useState<string | null>(null);
  const [deleteItemCode, setDeleteItemCode] = useState<string | null>(null);
  const [typeForm, setTypeForm] = useState<Partial<EquipmentType>>({});
  const [itemForm, setItemForm] = useState<Partial<EquipmentItem>>({});

  const filteredTypes = types.filter((t) =>
    (catFilter === "Tất cả" || t.category === catFilter) &&
    (t.name.toLowerCase().includes(typeQuery.toLowerCase()) || t.code.toLowerCase().includes(typeQuery.toLowerCase()))
  );
  const viewingType = viewTypeId ? types.find((t) => t.id === viewTypeId) : null;
  const editingType = editTypeId ? types.find((t) => t.id === editTypeId) : null;
  const deletingType = deleteTypeId ? types.find((t) => t.id === deleteTypeId) : null;
  const editingItem = editItemCode ? items.find((i) => i.code === editItemCode) : null;
  const deletingItem = deleteItemCode ? items.find((i) => i.code === deleteItemCode) : null;
  const totalItems = items.length;
  const inMaintenance = items.filter((i) => i.status === "Đang bảo trì").length;

  return (
    <div className="space-y-5">
      <SectionTitle title="Danh sách loại thiết bị" sub={`${types.length} loại — ${totalItems} máy đang quản lý, ${inMaintenance} đang bảo trì`}
        actions={<Button icon={Plus} onClick={() => { setTypeForm({ category: "Cardio" }); setAddType(true); }}>Thêm loại thiết bị</Button>} />

      <div className="flex flex-wrap items-center gap-3">
        <Input icon={Search} placeholder="Tìm theo tên loại hoặc mã…" className="max-w-xs" value={typeQuery} onChange={(e: any) => setTypeQuery(e.target.value)} />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          <option value="Tất cả">Tất cả phân loại</option>
          {EQUIPMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table at xl+ */}
      <div className="hidden xl:block">
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Mã / Tên", "Phân loại", "Hãng", "Bảo hành", "Số lượng", "Đang BT", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTypes.map((t) => {
                const its = items.filter((i) => i.typeId === t.id);
                return (
                  <tr key={t.id} className="bg-card hover:bg-muted/30 transition">
                    <td className="px-4 py-3">
                      <div className="font-mono text-[11px] text-muted-foreground">{t.code}</div>
                      <div className="font-medium">{t.name}</div>
                    </td>
                    <td className="px-4 py-3"><Badge tone={t.category === "Cardio" ? "red" : t.category === "Gym" ? "violet" : t.category === "Yoga" ? "emerald" : t.category === "Fitness" ? "amber" : "sky"}>{t.category}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{t.brand}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.warranty} tháng</td>
                    <td className="px-4 py-3 font-display font-bold">{its.length}</td>
                    <td className="px-4 py-3 font-display font-bold text-[#FFB547]">{its.filter((i) => i.status === "Đang bảo trì").length}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <IconBtn icon={Eye} onClick={() => setViewTypeId(t.id)} />
                        <IconBtn icon={Pencil} onClick={() => { setTypeForm(t); setEditTypeId(t.id); }} />
                        <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteTypeId(t.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTypes.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted-foreground py-10">Không có loại thiết bị nào khớp với bộ lọc</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards at smaller screens */}
      <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTypes.map((t) => {
          const itemsOfType = items.filter((i) => i.typeId === t.id);
          return (
            <Card key={t.id} className="group hover:border-[#6C63FF]/40 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-muted border border-border grid place-items-center">
                    <Dumbbell className="size-5 text-[#4F46E5] dark:text-[#A8A2FF]" />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] text-muted-foreground">{t.code}</div>
                    <h3 className="font-display text-[16px]">{t.name}</h3>
                  </div>
                </div>
                <Badge tone={t.category === "Cardio" ? "red" : t.category === "Gym" ? "violet" : t.category === "Yoga" ? "emerald" : t.category === "Fitness" ? "amber" : "sky"}>{t.category}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
                  <div className="text-[10.5px] uppercase text-muted-foreground tracking-wider">Số lượng</div>
                  <div className="font-display font-bold text-[20px] mt-0.5">{itemsOfType.length}</div>
                </div>
                <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
                  <div className="text-[10.5px] uppercase text-muted-foreground tracking-wider">Đang bảo trì</div>
                  <div className="font-display font-bold text-[20px] mt-0.5 text-[#FFB547]">{itemsOfType.filter((i) => i.status === "Đang bảo trì").length}</div>
                </div>
              </div>
              <div className="text-[12px] text-muted-foreground mt-3 line-clamp-2">{t.desc}</div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/70">
                <span className="text-[11.5px] text-muted-foreground">{t.brand} • BH {t.warranty}t</span>
                <div className="flex gap-1">
                  <IconBtn icon={Eye} onClick={() => setViewTypeId(t.id)} />
                  <IconBtn icon={Pencil} onClick={() => { setTypeForm(t); setEditTypeId(t.id); }} />
                  <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteTypeId(t.id)} />
                </div>
              </div>
            </Card>
          );
        })}
        {filteredTypes.length === 0 && (
          <Card className="md:col-span-2 text-center text-muted-foreground py-10">Không có loại thiết bị nào khớp với bộ lọc</Card>
        )}
      </div>

      {/* ── Type modals ── */}
      <Modal open={addType} onClose={() => setAddType(false)} title="Thêm loại thiết bị mới" wide
        footer={<><Button variant="ghost" onClick={() => setAddType(false)}>Hủy</Button><Button onClick={() => {
          fetch("http://localhost:5000/api/v1/equipment-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ typeCode: typeForm.code || `ET-${Date.now().toString().slice(-4)}`, equipmentName: typeForm.name || "Loại mới", category: typeForm.category || "Cardio", brand: typeForm.brand || "", warrantyDuration: typeForm.warranty || 0, description: typeForm.desc || "" })
          }).then(() => {
            fetchEquipmentsData();
            setAddType(false);
          });
        }}>Lưu loại thiết bị</Button></>}>
        <EquipmentTypeForm data={typeForm} onChange={setTypeForm} />
      </Modal>
      <Modal open={!!editingType} onClose={() => setEditTypeId(null)} title={`Chỉnh sửa loại — ${editingType?.name ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditTypeId(null)}>Hủy</Button><Button icon={CheckCircle2} onClick={() => {
          fetch(`http://localhost:5000/api/v1/equipment-types/${editTypeId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ equipmentName: typeForm.name, category: typeForm.category, brand: typeForm.brand, warrantyDuration: typeForm.warranty, description: typeForm.desc })
          }).then(() => {
            fetchEquipmentsData();
            setEditTypeId(null);
          });
        }}>Lưu thay đổi</Button></>}>
        {editingType && <EquipmentTypeForm data={typeForm} onChange={setTypeForm} />}
      </Modal>
      <Modal open={!!deletingType} onClose={() => setDeleteTypeId(null)} title="Xóa loại thiết bị"
        footer={<><Button variant="ghost" onClick={() => setDeleteTypeId(null)}>Hủy</Button>
          <Button icon={Trash2} onClick={() => { 
            fetch(`http://localhost:5000/api/v1/equipment-types/${deleteTypeId}`, { method: "DELETE" }).then(() => {
              fetchEquipmentsData();
              setDeleteTypeId(null);
            });
          }}>Xóa loại</Button></>}>
        {deletingType && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Bạn có chắc chắn muốn xóa loại <span className="font-medium">{deletingType.name}</span> ({deletingType.id})?</p>
            <p className="text-[12.5px] text-muted-foreground">{items.filter((i) => i.typeId === deletingType.id).length} thiết bị thuộc loại này cũng sẽ bị xóa khỏi hệ thống.</p>
          </div>
        )}
      </Modal>
      <Modal open={!!viewingType} onClose={() => setViewTypeId(null)} title={`Chi tiết loại — ${viewingType?.name ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setViewTypeId(null)}>Đóng</Button>
          <Button variant="outline" icon={Trash2} onClick={() => { const id = viewingType!.id; setViewTypeId(null); setDeleteTypeId(id); }}>Xóa loại</Button>
          <Button icon={Pencil} onClick={() => { const id = viewingType!.id; setViewTypeId(null); setTypeForm(viewingType!); setEditTypeId(id); }}>Sửa loại</Button></>}>
        {viewingType && (
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 rounded-xl bg-muted/40 border border-border/70">
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-xl bg-card border border-border grid place-items-center"><Dumbbell className="size-6 text-[#4F46E5] dark:text-[#A8A2FF]" /></div>
                <div>
                  <div className="font-mono text-[11px] text-muted-foreground">{viewingType.id}</div>
                  <h3 className="font-display text-[19px] mt-0.5">{viewingType.name}</h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Badge tone="violet">{viewingType.category}</Badge>
                    <Badge tone="sky">{viewingType.brand}</Badge>
                    <Badge tone="amber">BH {viewingType.warranty} tháng</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-muted-foreground">Tổng thiết bị</div>
                <div className="font-display font-bold text-[26px]">{items.filter((i) => i.typeId === viewingType.id).length}</div>
              </div>
            </div>
            <p className="text-[13px] text-muted-foreground">{viewingType.desc}</p>
            <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/70">
                <h4 className="font-display">Danh sách thiết bị</h4>
                <Button icon={Plus} onClick={() => { setItemForm({ room: ROOMS[0].name, status: "Hoạt động" }); setAddItemForType(viewingType.id); }}>Thêm thiết bị</Button>
              </div>
              {items.filter((i) => i.typeId === viewingType.id).length === 0
                ? <p className="text-[13px] text-muted-foreground text-center py-6">Chưa có thiết bị nào.</p>
                : <DataTable head={["Mã TB", "Phòng", "Ngày mua", "Trạng thái", ""]}
                    rows={items.filter((i) => i.typeId === viewingType.id).map((i) => [
                      <span className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{i.code}</span>,
                      <Badge tone="sky">{i.room}</Badge>,
                      i.purchased,
                      <StatusPill value={i.status} />,
                      <div className="flex items-center justify-end gap-0.5">
                        <IconBtn icon={Pencil} onClick={() => { setItemForm(i); setEditItemCode(i.code); }} />
                        <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteItemCode(i.code)} />
                      </div>,
                    ])} />
              }
            </div>
          </div>
        )}
      </Modal>
      <Modal open={!!addItemForType} onClose={() => setAddItemForType(null)} title="Thêm thiết bị mới" wide
        footer={<><Button variant="ghost" onClick={() => setAddItemForType(null)}>Hủy</Button><Button onClick={() => {
          const rId = rooms.find(r => r.name === (itemForm.room || rooms[0]?.name))?.id;
          fetch("http://localhost:5000/api/v1/equipments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ equipmentCode: itemForm.code || `TB-${Date.now().toString().slice(-4)}`, typeId: addItemForType, roomId: rId, importDate: itemForm.purchased || new Date().toLocaleDateString('vi-VN'), usageStatus: itemForm.status || "Hoạt động" })
          }).then(() => {
            fetchEquipmentsData();
            setAddItemForType(null);
          });
        }}>Lưu thiết bị</Button></>}>
        <EquipmentItemForm data={itemForm} onChange={setItemForm} roomList={rooms} />
      </Modal>
      <Modal open={!!editingItem} onClose={() => setEditItemCode(null)} title={`Chỉnh sửa thiết bị — ${editingItem?.code ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditItemCode(null)}>Hủy</Button><Button icon={CheckCircle2} onClick={() => {
          const target = items.find(i => i.code === editItemCode);
          const rId = rooms.find(r => r.name === (itemForm.room || target?.room))?.id;
          fetch(`http://localhost:5000/api/v1/equipments/${target?.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ equipmentCode: itemForm.code, roomId: rId, importDate: itemForm.purchased, usageStatus: itemForm.status })
          }).then(() => {
            fetchEquipmentsData();
            setEditItemCode(null);
          });
        }}>Lưu thay đổi</Button></>}>
        {editingItem && <EquipmentItemForm data={itemForm} onChange={setItemForm} roomList={rooms} />}
      </Modal>
      <Modal open={!!deletingItem} onClose={() => setDeleteItemCode(null)} title="Xóa thiết bị"
        footer={<><Button variant="ghost" onClick={() => setDeleteItemCode(null)}>Hủy</Button>
          <Button icon={Trash2} onClick={() => { 
            const target = items.find(i => i.code === deleteItemCode);
            fetch(`http://localhost:5000/api/v1/equipments/${target?.id}`, { method: "DELETE" }).then(() => {
              fetchEquipmentsData();
              setDeleteItemCode(null);
            });
          }}>Xóa thiết bị</Button></>}>
        {deletingItem && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Xóa thiết bị <span className="font-medium font-mono">{deletingItem.code}</span> tại {deletingItem.room}?</p>
            <p className="text-[12.5px] text-muted-foreground">Mọi lịch sử bảo trì gắn với thiết bị này sẽ không còn liên kết.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Equipment Maintenance (Owner) ── */
function EquipmentMaintenance() {
  const [maintList, setMaintList] = useState<any[]>([]);
  const [maintStatus, setMaintStatus] = useState<string>("Tất cả");
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteMaint, setDeleteMaint] = useState<string | null>(null);

  const fetchReports = () => {
    fetch("http://localhost:5000/api/v1/equipment-reports")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMaintList(data.map((r: any) => ({ id: r.reportId, code: r.Equipment?.equipmentCode, name: r.Equipment?.EquipmentType?.equipmentName, room: r.Equipment?.Room?.roomName, who: r.reporterName, date: r.reportDate, status: r.resolveStatus, desc: r.errorDescription })));
        }
      }).catch(console.error);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredMaint = maintList.filter((m) => maintStatus === "Tất cả" || m.status === maintStatus);
  const viewing = viewId ? maintList.find((m) => m.code === viewId) : null;
  const deletingMaint = deleteMaint ? maintList.find((m) => m.code === deleteMaint) : null;

  const handleMaintenance = (code: string) => {
    const report = maintList.find(m => m.code === code);
    if (!report) return;
    fetch(`http://localhost:5000/api/v1/equipment-reports/${report.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolveStatus: "Đang xử lý" })
    }).then(() => { fetchReports(); setViewId(null); });
  };
  const handleComplete = (code: string) => {
    const report = maintList.find(m => m.code === code);
    if (!report) return;
    fetch(`http://localhost:5000/api/v1/equipment-reports/${report.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolveStatus: "Đã xử lý" })
    }).then(() => { fetchReports(); setViewId(null); });
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Xử lý bảo trì" sub="Theo dõi và cập nhật trạng thái yêu cầu bảo trì thiết bị" />
      <div className="grid grid-cols-4 gap-3">
        {[
          { k: "Chờ xử lý",    v: maintList.filter((m) => m.status === "Chờ xử lý").length,  tone: "amber" },
          { k: "Đang xử lý",   v: maintList.filter((m) => m.status === "Đang xử lý").length, tone: "sky" },
          { k: "Đã xử lý",     v: maintList.filter((m) => m.status === "Đã xử lý").length,   tone: "emerald" },
          { k: "Tổng yêu cầu", v: maintList.length,                                           tone: "violet" },
        ].map((s: any) => (
          <Card key={s.k}>
            <div className="text-[11px] uppercase text-muted-foreground tracking-wider">{s.k}</div>
            <div className="font-display font-bold text-[28px] mt-1">{s.v}</div>
            <Badge tone={s.tone}>Tháng này</Badge>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select value={maintStatus} onChange={(e) => setMaintStatus(e.target.value)} className="h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Chờ xử lý">Chờ xử lý</option>
          <option value="Đang xử lý">Đang xử lý</option>
          <option value="Đã xử lý">Đã xử lý</option>
        </select>
      </div>
      <Card padded={false}>
        <DataTable
          head={["Mã TB", "Tên thiết bị", "Phòng", "Người báo", "Ngày báo", "Trạng thái", ""]}
          rows={filteredMaint.map((m) => [
            <span className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{m.code}</span>,
            <span className="font-medium">{m.name}</span>,
            <Badge tone="sky">{m.room}</Badge>,
            m.who, m.date,
            <StatusPill value={m.status} />,
            <div className="flex items-center justify-end gap-0.5">
              <IconBtn icon={Eye} onClick={() => setViewId(m.code)} />
              <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteMaint(m.code)} />
            </div>,
          ])}
        />
        {filteredMaint.length === 0 && <div className="text-center text-muted-foreground py-10 text-[13px]">Không có yêu cầu nào ở trạng thái "{maintStatus}"</div>}
      </Card>

      {/* Detail popup */}
      <Modal open={!!viewing} onClose={() => setViewId(null)} title="Chi tiết yêu cầu bảo trì"
        footer={<>
          <Button variant="ghost" onClick={() => setViewId(null)}>Đóng</Button>
          {viewing?.status === "Chờ xử lý" && (
            <Button icon={ShieldCheck} onClick={() => handleMaintenance(viewing.code)}>Bảo trì thiết bị</Button>
          )}
          {viewing?.status === "Đang xử lý" && (
            <Button icon={CheckCircle2} onClick={() => handleComplete(viewing.code)}>Hoàn thành bảo trì</Button>
          )}
        </>}>
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Mã thiết bị", viewing.code],
                ["Tên thiết bị", viewing.name],
                ["Phòng", viewing.room],
                ["Người báo", viewing.who],
                ["Ngày báo", viewing.date],
                ["Trạng thái", <StatusPill value={viewing.status} />],
              ].map(([k, v]) => (
                <div key={k as string} className="flex flex-col gap-1 px-3 py-2.5 rounded-lg border border-border/70 bg-muted/30">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</span>
                  <span className="text-[13px] font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-3 py-2.5 rounded-lg border border-border/70 bg-muted/30">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Mô tả lỗi</div>
              <p className="text-[13px] leading-relaxed">{viewing.desc}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deletingMaint} onClose={() => setDeleteMaint(null)} title="Xóa yêu cầu bảo trì"
        footer={<><Button variant="ghost" onClick={() => setDeleteMaint(null)}>Hủy</Button>
          <Button icon={Trash2} onClick={() => { 
            const target = maintList.find(m => m.code === deleteMaint);
            fetch(`http://localhost:5000/api/v1/equipment-reports/${target?.id}`, { method: "DELETE" }).then(() => {
              fetchReports();
              setDeleteMaint(null);
            });
          }}>Xóa yêu cầu</Button></>}>
        {deletingMaint && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Xóa yêu cầu bảo trì <span className="font-medium font-mono">{deletingMaint.code}</span> — {deletingMaint.name}?</p>
            <p className="text-[12.5px] text-muted-foreground">Hành động này không thể hoàn tác. Lịch sử báo lỗi do {deletingMaint.who} sẽ bị xóa.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Equipment maintenance (owner) ── */
function MaintenanceOwner() {
  const [list, setList] = useState<any[]>(MAINTENANCE);
  const [items, setItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [addOpen, setAddOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<any>({});

  const fetchReports = () => {
    fetch("http://localhost:5000/api/v1/equipment-reports")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setList(data.map((r: any) => ({ id: r.reportId, code: r.Equipment?.equipmentCode, name: r.Equipment?.EquipmentType?.equipmentName, room: r.Equipment?.Room?.roomName, who: r.reporterName, date: r.reportDate, status: r.resolveStatus, desc: r.errorDescription })));
        }
      }).catch(console.error);
    fetch("http://localhost:5000/api/v1/equipments").then(res => res.json()).then(data => {
      if (Array.isArray(data)) setItems(data.map((i: any) => ({ id: i.equipmentId, code: i.equipmentCode, room: i.Room?.roomName })));
    }).catch(console.error);
  };

  useEffect(() => { fetchReports(); }, []);

  const filtered = list.filter((m) => statusFilter === "Tất cả" || m.status === statusFilter);
  const viewing = viewId ? list.find((m) => m.code === viewId) : null;
  const deleting = deleteId ? list.find((m) => m.code === deleteId) : null;

  return (
    <div className="space-y-5">
      <SectionTitle title="Thiết bị đang bảo trì" sub="Quy trình 2 bước: Owner đánh dấu hết bảo trì → Staff xác nhận gỡ"
        actions={<Button icon={Plus} onClick={() => setAddOpen(true)}>Thêm yêu cầu bảo trì</Button>} />
      <div className="grid grid-cols-4 gap-3">
        {[
          { k: "Chờ xử lý", v: list.filter((m) => m.status === "Chờ xử lý").length, tone: "amber" },
          { k: "Đang xử lý", v: list.filter((m) => m.status === "Đang xử lý").length, tone: "sky" },
          { k: "Đã xử lý",   v: list.filter((m) => m.status === "Đã xử lý").length, tone: "emerald" },
          { k: "Tổng yêu cầu", v: list.length, tone: "violet" },
        ].map((s: any) => (
          <Card key={s.k}>
            <div className="text-[11px] uppercase text-muted-foreground tracking-wider">{s.k}</div>
            <div className="font-display font-bold text-[28px] mt-1">{s.v}</div>
            <Badge tone={s.tone}>Tháng này</Badge>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Chờ xử lý">Chờ xử lý</option>
          <option value="Đang xử lý">Đang xử lý</option>
          <option value="Đã xử lý">Đã xử lý</option>
        </select>
      </div>

      <Card padded={false}>
        <DataTable
          head={["Mã TB", "Tên thiết bị", "Phòng", "Người báo", "Ngày báo", "Mô tả lỗi", "Trạng thái", ""]}
          rows={filtered.map((m) => [
            <span className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{m.code}</span>,
            <span className="font-medium">{m.name}</span>,
            <Badge tone="sky">{m.room}</Badge>,
            m.who, m.date,
            <span className="text-muted-foreground max-w-xs line-clamp-1">{m.desc}</span>,
            <StatusPill value={m.status} />,
            <div className="flex items-center justify-end gap-0.5">
              <IconBtn icon={Eye} onClick={() => setViewId(m.code)} />
              <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteId(m.code)} />
            </div>,
          ])}
        />
        {filtered.length === 0 && <div className="text-center text-muted-foreground py-10 text-[13px]">Không có yêu cầu nào ở trạng thái "{statusFilter}"</div>}
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Thêm yêu cầu bảo trì" wide
        footer={<>
          <Button variant="ghost" onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button icon={CheckCircle2} onClick={() => {
            fetch("http://localhost:5000/api/v1/equipment-reports", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ equipmentId: addForm.equipmentId || items[0]?.id, reportDate: addForm.date || new Date().toLocaleDateString('vi-VN'), errorDescription: addForm.desc || "", reporterName: "Trần Mỹ Linh", resolveStatus: "Chờ xử lý" })
            }).then(() => { fetchReports(); setAddOpen(false); });
          }}>Gửi yêu cầu</Button>
        </>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label={<>Chọn thiết bị<Req /></>}>
              <select value={addForm.equipmentId || items[0]?.id} onChange={e => setAddForm({...addForm, equipmentId: e.target.value})} className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
                {items.map((i) => <option key={i.id} value={i.id}>{i.code} — {i.room}</option>)}
              </select>
            </Field>
          </div>
          <Field label={<>Ngày báo<Req /></>}><Input type="date" value={addForm.date || ""} onChange={(e: any) => setAddForm({...addForm, date: e.target.value})} /></Field>
          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground px-3 py-2.5 rounded-lg bg-muted/40 border border-border/60">
              <span>Người báo:</span>
              <span className="font-medium text-foreground">Trần Mỹ Linh</span>
              <Badge tone="sky">Tự động</Badge>
            </div>
          </div>
          <div className="col-span-2">
            <Field label={<>Mô tả lỗi<Req /></>}>
              <textarea value={addForm.desc || ""} onChange={e => setAddForm({...addForm, desc: e.target.value})} rows={4} placeholder="Mô tả hiện tượng, mức độ hư hỏng…" className="w-full rounded-lg bg-input-background border border-border p-3 text-[13.5px] focus:outline-none focus:border-[#6C63FF]/60 resize-none" />
            </Field>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewId(null)} title="Chi tiết yêu cầu bảo trì" wide
        footer={<>
          <Button variant="ghost" onClick={() => setViewId(null)}>Đóng</Button>
          {viewing?.status === "Đã xử lý" && (
            <Button icon={CheckCircle2} onClick={() => {
              fetch(`http://localhost:5000/api/v1/equipment-reports/${viewing.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resolveStatus: "Hoàn thành" })
              }).then(() => { fetchReports(); setViewId(null); });
            }}>Kết thúc bảo trì</Button>
          )}
        </>}>
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13.5px]">
              {[
                ["Mã thiết bị", <span className="font-mono text-[#4F46E5] dark:text-[#A8A2FF]">{viewing.code}</span>],
                ["Tên thiết bị", viewing.name],
                ["Phòng", <Badge tone="sky">{viewing.room}</Badge>],
                ["Người báo", viewing.who],
                ["Ngày báo", viewing.date],
                ["Trạng thái", <StatusPill value={viewing.status} />],
              ].map(([k, v]: any) => (
                <div key={k as string} className="flex flex-col gap-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Mô tả lỗi</span>
              <p className="mt-1 text-[13.5px] bg-muted/40 rounded-lg p-3 border border-border/60">{viewing.desc}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleteId(null)} title="Xóa yêu cầu bảo trì"
        footer={<>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button icon={Trash2} onClick={() => { setList(list.filter((m) => m.code !== deleteId)); setDeleteId(null); }}>Xóa yêu cầu</Button>
        </>}>
        {deleting && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Xóa yêu cầu bảo trì <span className="font-medium font-mono">{deleting.code}</span> — {deleting.name}?</p>
            <p className="text-[12.5px] text-muted-foreground">Hành động này không thể hoàn tác. Lịch sử báo lỗi do {deleting.who} sẽ bị xóa.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Feedback ── */
function Feedback() {
  type FeedbackRecord = (typeof FEEDBACK)[number];
  const [list, setList] = useState<FeedbackRecord[]>(FEEDBACK);
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [typeFilter, setTypeFilter] = useState<"Tất cả" | "Thiết bị" | "Nhân viên">("Tất cả");
  const [reply, setReply] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = list.filter((f) =>
    (statusFilter === "Tất cả" || f.status === statusFilter) &&
    (typeFilter === "Tất cả" || f.type === typeFilter)
  );
  const replying = reply ? list.find((f) => f.id === reply) : null;
  const deleting = deleteId ? list.find((f) => f.id === deleteId) : null;
  const pending = list.filter((f) => f.status === "Chờ xử lý").length;

  return (
    <div className="space-y-5">
      <SectionTitle title="Phản hồi hội viên" sub={`${list.length} phản hồi — ${pending} đang chờ xử lý`} />
      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Chờ xử lý">Chờ xử lý</option>
          <option value="Đã phản hồi">Đã phản hồi</option>
        </select>
        <div className="flex items-center gap-2">
          {(["Tất cả", "Thiết bị", "Nhân viên"] as const).map((c) => (
            <button key={c} onClick={() => setTypeFilter(c)} className={cn(
              "h-9 px-3 rounded-lg text-[12.5px] border transition",
              typeFilter === c
                ? "bg-[#6C63FF]/15 border-[#6C63FF]/40 text-[#6C63FF] dark:text-[#4F46E5] dark:text-[#A8A2FF]"
                : "border-border text-muted-foreground hover:text-foreground hover:border-[#6C63FF]/30"
            )}>{c}</button>
          ))}
        </div>
      </div>
      <Card padded={false}>
        <DataTable
          head={["Mã PH", "Hội viên", "Loại", "Nội dung", "Ngày tạo", "Trạng thái", ""]}
          rows={filtered.map((f) => [
            <span className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{f.id}</span>,
            <span className="font-medium">{f.member}</span>,
            <Badge tone={f.type === "Thiết bị" ? "amber" : "sky"}>{f.type}</Badge>,
            <span className="text-muted-foreground line-clamp-1 max-w-md">{f.content}</span>,
            f.date,
            <StatusPill value={f.status} />,
            <div className="flex items-center justify-end gap-0.5">
              {f.status !== "Đã phản hồi" && <IconBtn icon={MessageSquare} onClick={() => setReply(f.id)} />}
              <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteId(f.id)} />
            </div>,
          ])}
        />
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10 text-[13px]">Không có phản hồi nào khớp với bộ lọc</div>
        )}
      </Card>

      <Modal open={!!replying} onClose={() => setReply(null)} title="Xử lý phản hồi" wide
        footer={<>
          <Button variant="ghost" onClick={() => setReply(null)}>Hủy</Button>
          <Button icon={ArrowRight} onClick={() => {
            setList(list.map((f) => f.id === reply ? { ...f, status: "Đã phản hồi" } : f));
            setReply(null);
          }}>Gửi phản hồi</Button>
        </>}>
        {replying && (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/60 border border-border/70 p-4">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground"><span className="font-mono text-[#4F46E5] dark:text-[#A8A2FF]">{replying.id}</span> · {replying.member} · {replying.date}</div>
              <p className="mt-2 text-[13.5px] leading-relaxed">{replying.content}</p>
            </div>
            <Field label="Nội dung trả lời">
              <textarea rows={4} placeholder="Cảm ơn bạn đã phản hồi…"
                className="w-full rounded-lg bg-input-background border border-border p-3 text-[13.5px] focus:outline-none focus:border-[#6C63FF]/60 resize-none" />
            </Field>
          </div>
        )}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleteId(null)} title="Xóa phản hồi"
        footer={<>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button icon={Trash2} onClick={() => { setList(list.filter((f) => f.id !== deleteId)); setDeleteId(null); }}>Xóa phản hồi</Button>
        </>}>
        {deleting && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Xóa phản hồi <span className="font-mono font-medium">{deleting.id}</span> của {deleting.member}?</p>
            <p className="text-[12.5px] text-muted-foreground">Hành động này không thể hoàn tác.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Reports ── */
function Reports({ view }: { view: string }) {
  return (
    <div className="space-y-5">
      {view === "reports" && <ReportsOverview />}
      {view === "reports.revenue" && <RevenueReport />}
      {view === "reports.members" && <MembersReport />}
      {view === "reports.staff" && <StaffReport />}
    </div>
  );
}

function ReportsOverview() {
  return (
    <>
      <SectionTitle title="Báo cáo chung" sub="Tổng quan hiệu suất vận hành tháng 05 / 2026"
        actions={<><Button variant="outline" icon={CalIcon}>Tháng 05/2026</Button><Button icon={FileBarChart}>Xuất báo cáo</Button></>} />
      <div className="grid grid-cols-4 gap-4">
        {[
          { k: "Doanh thu tháng",  v: "246 tr", d: "+18.4%", icon: Wallet,     tone: "violet" },
          { k: "Hội viên mới",     v: "52",     d: "+12 HV",  icon: UserPlus,   tone: "emerald" },
          { k: "Tổng hội viên",    v: "1,248",  d: "+4.1%",   icon: Users,      tone: "amber" },
          { k: "Nhân sự",          v: "32",     d: "Ổn định", icon: ShieldCheck,tone: "sky" },
        ].map((s: any) => (
          <Card key={s.k}>
            <div className="flex items-start justify-between">
              <div className={cn("size-10 rounded-xl grid place-items-center",
                s.tone === "violet" && "bg-[#6C63FF]/15 text-[#4F46E5] dark:text-[#A8A2FF]",
                s.tone === "emerald" && "bg-[#00C9A7]/15 text-[#00866F] dark:text-[#5FE6CB]",
                s.tone === "amber" && "bg-[#FFB547]/15 text-[#A66A00] dark:text-[#FFD89B]",
                s.tone === "sky" && "bg-sky-400/15 text-sky-700 dark:text-sky-300")}>
                <s.icon className="size-5 stroke-[1.75]" />
              </div>
              <Badge tone={s.tone}>{s.d}</Badge>
            </div>
            <div className="text-[11px] uppercase text-muted-foreground tracking-wider mt-4">{s.k}</div>
            <div className="font-display font-bold text-[26px] mt-1">{s.v}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display">Doanh thu 6 tháng gần nhất</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">Đơn vị: triệu VND</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#6C63FF]" />Doanh thu</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={REVENUE}>
                <defs>
                  <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} interval={0} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} width={36} domain={[0, 300]} ticks={[0, 60, 120, 180, 240, 300]} />
                <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} />
                <Area type="monotone" dataKey="v" stroke="#6C63FF" strokeWidth={2.5} fill="url(#grad-revenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-display">Hội viên đăng ký mới</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Theo tháng</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={NEW_MEMBERS}>
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} interval={0} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} width={36} domain={[0, 60]} ticks={[0, 15, 30, 45, 60]} />
                <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} />
                <Bar dataKey="v" fill="#00C9A7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}

function RevenueReport() {
  const txns = [
    { who: "Phạm Khánh An", pkg: "Elite VIP 6T", amt: 9800000, pm: "Thẻ NH", d: "23/05/2026" },
    { who: "Hoàng Minh Tú", pkg: "Gym Pro 3T",    amt: 2400000, pm: "QR",     d: "22/05/2026" },
    { who: "Bùi Quỳnh Anh", pkg: "Personal 24B",  amt: 5600000, pm: "Tiền mặt", d: "22/05/2026" },
    { who: "Ngô Hữu Đức",   pkg: "Gym Starter",   amt: 1200000, pm: "QR",     d: "21/05/2026" },
  ];
  const [tab, setTab] = useState<"day" | "month" | "quarter" | "year">("month");
  const [day, setDay] = useState("2026-05-23");
  const [quarter, setQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4">("Q2");
  const [year, setYear] = useState("2026");

  const dayData = ["06h","08h","10h","12h","14h","16h","18h","20h","22h"].map((h, i) => ({ d: h, v: Math.round(2 + Math.sin(i / 1.3) * 3 + i / 1.5) }));
  const monthData = Array.from({ length: 14 }, (_, i) => ({ d: `${i + 10}/05`, v: 6 + Math.round(Math.sin(i / 1.4) * 4 + i / 2) }));
  const QUARTER_MONTHS: Record<string, string[]> = { Q1: ["T1","T2","T3"], Q2: ["T4","T5","T6"], Q3: ["T7","T8","T9"], Q4: ["T10","T11","T12"] };
  const quarterData = QUARTER_MONTHS[quarter].map((m, i) => ({ d: m, v: 160 + i * 28 + (quarter === "Q2" ? 20 : 0) }));
  const yearData = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"].map((m, i) => ({ d: m, v: 120 + Math.round(Math.sin(i / 1.6) * 50 + i * 8) }));
  const dataset = tab === "day" ? dayData : tab === "month" ? monthData : tab === "quarter" ? quarterData : yearData;
  const total = dataset.reduce((s, d) => s + d.v, 0);
  const totalLabel = tab === "day" || tab === "month" ? `${total} triệu` : `${(total).toLocaleString("vi-VN")} triệu`;
  const maxV = Math.max(...dataset.map((d) => d.v));
  const yMax = Math.ceil(maxV * 1.15 / 5) * 5 || 5;
  const ticks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax].map((n) => Math.round(n));

  return (
    <>
      <SectionTitle title="Thống kê doanh thu" sub="Phân tích doanh thu theo nhiều mốc thời gian" />

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex p-1 rounded-xl border border-border bg-muted/40">
          {([["day", "Ngày"], ["month", "Tháng"], ["quarter", "Quý"], ["year", "Năm"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={cn(
              "h-8 px-4 rounded-lg text-[12.5px] transition",
              tab === k ? "bg-card text-foreground card-shadow" : "text-muted-foreground hover:text-foreground"
            )}>{l}</button>
          ))}
        </div>
        {tab === "day" && <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="h-9 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]" />}
        {tab === "quarter" && (
          <>
            <select value={quarter} onChange={(e) => setQuarter(e.target.value as any)} className="h-9 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
              <option value="Q1">Quý 1</option><option value="Q2">Quý 2</option><option value="Q3">Quý 3</option><option value="Q4">Quý 4</option>
            </select>
            <input value={year} onChange={(e) => setYear(e.target.value)} className="h-9 w-24 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]" />
          </>
        )}
        {tab === "year" && <input value={year} onChange={(e) => setYear(e.target.value)} className="h-9 w-28 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]" />}
        <div className="ml-auto"><Button icon={FileBarChart}>Xuất báo cáo</Button></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><div className="text-[11px] uppercase text-muted-foreground tracking-wider">Tổng doanh thu kỳ này</div><div className="font-display font-bold text-[28px] mt-1">{totalLabel}</div><Badge tone="violet">{tab === "day" ? day : tab === "quarter" ? `${quarter} / ${year}` : tab === "year" ? `Năm ${year}` : "Tháng 05/2026"}</Badge></Card>
        <Card><div className="text-[11px] uppercase text-muted-foreground tracking-wider">Đỉnh cao</div><div className="font-display font-bold text-[28px] mt-1">{maxV} tr</div><Badge tone="emerald">{dataset.find((d) => d.v === maxV)?.d}</Badge></Card>
        <Card><div className="text-[11px] uppercase text-muted-foreground tracking-wider">Trung bình</div><div className="font-display font-bold text-[28px] mt-1">{Math.round(total / dataset.length)} tr</div><Badge tone="sky">{dataset.length} mốc</Badge></Card>
      </div>

      <Card>
        <h3 className="font-display mb-4">Diễn biến doanh thu — {tab === "day" ? "theo giờ" : tab === "month" ? "hằng ngày" : tab === "quarter" ? "theo tháng trong quý" : "12 tháng"}</h3>
        <div className="h-64">
          <ResponsiveContainer>
            {tab === "month" || tab === "day" ? (
              <LineChart data={dataset}>
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} interval={0} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} width={36} domain={[0, yMax]} ticks={ticks} />
                <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} />
                <Line type="monotone" dataKey="v" stroke="#6C63FF" strokeWidth={2.5} dot={{ fill: "#6C63FF", r: 3 }} />
              </LineChart>
            ) : (
              <BarChart data={dataset}>
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} interval={0} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} width={44} domain={[0, yMax]} ticks={ticks} />
                <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} />
                <Bar dataKey="v" fill="#6C63FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>
      <Card padded={false}>
        <DataTable
          head={["Hội viên", "Gói tập", "Số tiền", "Phương thức", "Ngày", ""]}
          rows={txns.map((t) => [
            <span className="font-medium">{t.who}</span>,
            <Badge tone="violet">{t.pkg}</Badge>,
            <span className="font-mono">{t.amt.toLocaleString("vi-VN")} ₫</span>,
            <Badge tone={t.pm === "Tiền mặt" ? "amber" : t.pm === "QR" ? "emerald" : "sky"}>{t.pm}</Badge>,
            t.d,
            <IconBtn icon={Receipt} />,
          ])}
        />
      </Card>
    </>
  );
}

function MembersReport() {
  return (
    <>
      <SectionTitle title="Thống kê hội viên" sub="Cơ cấu hội viên theo gói tập"
        actions={<Button variant="outline" icon={CalIcon}>Tháng 05/2026</Button>} />
      <div className="grid grid-cols-3 gap-4">
        <Card><div className="text-[11px] uppercase text-muted-foreground tracking-wider">Hội viên mới</div><div className="font-display font-bold text-[28px] mt-1">52</div><Badge tone="emerald">+12 so với tháng trước</Badge></Card>
        <Card><div className="text-[11px] uppercase text-muted-foreground tracking-wider">Lượt gia hạn</div><div className="font-display font-bold text-[28px] mt-1">87</div><Badge tone="violet">+5.4%</Badge></Card>
        <Card><div className="text-[11px] uppercase text-muted-foreground tracking-wider">Tổng hội viên</div><div className="font-display font-bold text-[28px] mt-1">1,248</div><Badge tone="amber">Mục tiêu 1,300</Badge></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <h3 className="font-display mb-4">Hội viên theo tháng</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={NEW_MEMBERS}>
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} interval={0} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} width={36} domain={[0, 60]} ticks={[0, 15, 30, 45, 60]} />
                <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} />
                <Bar dataKey="v" fill="#6C63FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-display mb-2">Phân bổ theo gói</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={PKG_BREAKDOWN} dataKey="value" innerRadius={55} outerRadius={88} paddingAngle={3}>
                  {PKG_BREAKDOWN.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {PKG_BREAKDOWN.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: p.color }} />{p.name}</span>
                <span className="font-mono text-muted-foreground">{p.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function StaffReport() {
  return (
    <>
      <SectionTitle title="Thống kê nhân sự" sub="Hiệu suất chấm công tháng 05/2026"
        actions={<Button variant="outline" icon={CalIcon}>Tháng 05/2026</Button>} />
      <Card padded={false}>
        <DataTable
          head={["Nhân sự", "Số ngày đi làm", "Đi chưa đủ giờ", "Vắng", "Hiệu suất", ""]}
          rows={STAFF.slice(0, 6).map((s, i) => {
            const perf = 95 - i * 4;
            return [
              <span className="font-medium">{s.name}</span>,
              <span className="font-mono">{24 - i}</span>,
              <span className="font-mono">{i}</span>,
              <span className="font-mono">{i > 1 ? 1 : 0}</span>,
              <div className="flex items-center gap-2 max-w-[160px]">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#00C9A7]" style={{ width: `${perf}%` }} /></div>
                <span className="font-mono text-[12px] text-muted-foreground">{perf}%</span>
              </div>,
              <IconBtn icon={Eye} />,
            ];
          })}
        />
      </Card>
    </>
  );
}

/* ── Members ── */
type MemberRecord = (typeof MEMBERS)[number];
const MEMBER_STATUSES = ["Đang hoạt động", "Sắp hết hạn", "Đã hết hạn"] as const;

function MemberForm({ data, disablePackage }: { data?: MemberRecord; disablePackage?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label={<>Mã hội viên<Req /></>}><Input placeholder="VD: HV0242" value={data?.code} /></Field>
      <Field label={<>Họ và tên<Req /></>}><Input placeholder="VD: Nguyễn Văn A" value={data?.name} /></Field>
      <Field label={<>Số điện thoại<Req /></>}><Input icon={Phone} placeholder="09xx xxx xxx" value={data?.phone} /></Field>
      <Field label={<>Email<Req /></>}><Input icon={Mail} placeholder="email@example.com" /></Field>
      <Field label={<>Gói tập<Req /></>}>
        <select disabled={disablePackage} defaultValue={data?.pkg ?? PACKAGES[0].name}
          className={cn("w-full h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]",
            disablePackage && "opacity-50 cursor-not-allowed")}>
          {PACKAGES.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
        {disablePackage && <p className="text-[11px] text-muted-foreground/70 mt-1">Dùng chức năng "Gia hạn gói tập" để thay đổi</p>}
      </Field>
      <Field label={<>Hạn / Số buổi còn lại<Req /></>}>
        <input disabled={disablePackage} defaultValue={data?.remain ?? ""} placeholder="VD: 32 ngày hoặc 14 buổi"
          className={cn("w-full h-10 rounded-lg bg-input-background border border-border px-3 text-[13.5px] focus:outline-none focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/15 transition",
            disablePackage && "opacity-50 cursor-not-allowed")} />
        {disablePackage && <p className="text-[11px] text-muted-foreground/70 mt-1">Dùng chức năng "Gia hạn gói tập" để thay đổi</p>}
      </Field>
      <Field label={<>Trạng thái<Req /></>}>
        <select defaultValue={data?.status ?? "Đang hoạt động"} className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          {MEMBER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label={<>Ngày sinh<Req /></>}><Input type="date" /></Field>
      <div className="col-span-2"><Field label={<>Địa chỉ<Req /></>}><Input placeholder="Số nhà, đường, quận, thành phố" /></Field></div>
    </div>
  );
}

function MembersList({ onSelect, onAdd, readonly, disablePackage }: { onSelect: (id: string) => void; onAdd: () => void; readonly?: boolean; disablePackage?: boolean }) {
  const [list, setList] = useState<MemberRecord[]>(MEMBERS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = list.filter((m) =>
    (statusFilter === "Tất cả" || m.status === statusFilter) &&
    (m.name.toLowerCase().includes(query.toLowerCase()) || m.code.toLowerCase().includes(query.toLowerCase()) || m.phone.includes(query))
  );
  const editing = editId ? list.find((m) => m.code === editId) : null;
  const deleting = deleteId ? list.find((m) => m.code === deleteId) : null;
  const newThisWeek = list.filter((m) => m.status === "Đang hoạt động").length;

  return (
    <div className="space-y-5">
      <SectionTitle title="Danh sách hội viên" sub={`${list.length} hội viên hiển thị — ${newThisWeek} đang hoạt động`}
        actions={<Button icon={UserPlus} onClick={onAdd}>Thêm hội viên</Button>} />
      <div className="flex flex-wrap items-center gap-3">
        <Input icon={Search} placeholder="Tìm theo tên, SĐT, mã HV…" className="max-w-md" value={query} onChange={(e: any) => setQuery(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          <option value="Tất cả">Tất cả trạng thái</option>
          {MEMBER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <Card padded={false}>
        <DataTable
          head={["Mã HV", "Họ tên", "SĐT", "Gói tập", "Hạn / Số buổi còn lại", "Trạng thái", ""]}
          rows={filtered.map((m) => [
            <span className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{m.code}</span>,
            <button onClick={() => onSelect(m.code)} className="flex items-center gap-2.5 text-left hover:text-[#4F46E5] dark:text-[#A8A2FF]">
              <div className="size-7 rounded-full bg-gradient-to-br from-sky-400 to-cyan-600 grid place-items-center text-[10.5px] text-white font-semibold">
                {m.name.split(" ").slice(-2).map(n => n[0]).join("")}
              </div>
              <span className="font-medium">{m.name}</span>
            </button>,
            <span className="font-mono text-[12.5px]">{m.phone}</span>,
            <Badge tone="violet">{m.pkg}</Badge>,
            <span className="text-muted-foreground">{m.remain}</span>,
            <StatusPill value={m.status} />,
            <div className="flex items-center justify-end gap-0.5">
              <IconBtn icon={Eye} onClick={() => onSelect(m.code)} />
              <IconBtn icon={Pencil} onClick={() => setEditId(m.code)} />
              {!readonly && <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteId(m.code)} />}
            </div>,
          ])}
        />
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10 text-[13px]">Không có hội viên nào khớp với bộ lọc</div>
        )}
        <Pagination />
      </Card>

      <Modal open={!!editing} onClose={() => setEditId(null)} title={`Chỉnh sửa hội viên — ${editing?.name ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditId(null)}>Hủy</Button><Button icon={CheckCircle2} onClick={() => setEditId(null)}>Lưu thay đổi</Button></>}>
        {editing && <MemberForm data={editing} disablePackage={disablePackage} />}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleteId(null)} title="Xóa hội viên"
        footer={<>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button icon={Trash2} onClick={() => { setList(list.filter((m) => m.code !== deleteId)); setDeleteId(null); }}>Xóa hội viên</Button>
        </>}>
        {deleting && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Xóa hội viên <span className="font-medium">{deleting.name}</span> ({deleting.code})?</p>
            <p className="text-[12.5px] text-muted-foreground">Toàn bộ lịch sử tập luyện, thanh toán và phản hồi của hội viên này sẽ bị xóa khỏi hệ thống.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function NewMember({ onBack }: { onBack?: () => void }) {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<"card" | "qr" | "cash">("card");
  const [pay, setPay] = useState<"card" | "qr" | "cash" | null>(null);
  const sellable = PACKAGES.filter((p) => p.status === "Đang kinh doanh");
  const [pkgId, setPkgId] = useState(sellable[0].id);
  const pkg = sellable.find((p) => p.id === pkgId)!;
  if (pay) return <Payment kind={pay} onBack={() => setPay(null)} />;
  return (
    <div className="space-y-6">
      {onBack && (
        <button onClick={onBack} className="text-[12.5px] text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ChevronLeft className="size-4" /> Quay lại danh sách hội viên
        </button>
      )}
      <SectionTitle title="Thêm hội viên mới" sub="Quy trình 2 bước: thông tin cá nhân → chọn gói & thanh toán" />
      <div className="flex items-center gap-3">
        {["Thông tin cá nhân", "Chọn gói & thanh toán"].map((s, i) => (
          <div key={s} className="flex items-center gap-3 flex-1">
            <div className={cn("size-9 rounded-full grid place-items-center font-display font-semibold text-[13px]",
              i <= step ? "bg-[#6C63FF] text-white" : "bg-muted text-muted-foreground border border-border")}>
              {i < step ? <CheckCircle2 className="size-4" /> : i + 1}
            </div>
            <div className="flex-1">
              <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">Bước {i + 1}</div>
              <div className={cn("text-[13.5px] font-medium", i <= step ? "text-foreground" : "text-muted-foreground")}>{s}</div>
            </div>
            {i === 0 && <div className={cn("flex-1 h-px", step >= 1 ? "bg-[#6C63FF]" : "bg-accent")} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Field label={<>Họ và tên<Req /></>}><Input placeholder="Nguyễn Văn A" /></Field>
            <Field label={<>Ngày sinh<Req /></>}><Input type="date" /></Field>
            <Field label={<>Giới tính<Req /></>}>
              <div className="flex gap-2">{["Nam", "Nữ", "Khác"].map((g, i) => (
                <button key={g} className={cn("h-10 flex-1 rounded-lg border text-[13px]", i === 0 ? "border-[#6C63FF] bg-[#6C63FF]/10" : "border-border text-muted-foreground")}>{g}</button>
              ))}</div>
            </Field>
            <Field label={<>Nghề nghiệp<Req /></>}><Input placeholder="VD: Kỹ sư phần mềm" /></Field>
            <Field label={<>Số điện thoại<Req /></>}><Input icon={Phone} placeholder="09xx xxx xxx" /></Field>
            <Field label={<>Email<Req /></>}><Input icon={Mail} placeholder="email@example.com" /></Field>
            <div className="col-span-2"><Field label={<>Địa chỉ<Req /></>}><Input placeholder="Số nhà, đường, quận, thành phố" /></Field></div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost">Hủy</Button>
            <Button icon={ArrowRight} onClick={() => setStep(1)}>Tiếp tục</Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <>
          <Card>
            <h3 className="font-display mb-4">Chọn gói tập</h3>
            <Field label="Gói tập">
              <div className="relative">
                <select value={pkgId} onChange={(e) => setPkgId(e.target.value)}
                  className="w-full h-10 rounded-lg bg-input-background border border-border px-3 text-[13px] appearance-none">
                  {sellable.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name} — {p.type} — {p.price.toLocaleString("vi-VN")}₫{p.vip ? " ★VIP" : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </Field>
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-display font-semibold text-[16px]">{pkg.name}</div>
                <div className="text-[12px] text-muted-foreground">{pkg.type}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  {pkg.vip && <Badge tone="amber">★ VIP</Badge>}
                  {pkg.trainer && <Badge tone="violet">Yêu cầu HLV</Badge>}
                </div>
              </div>
              <div className="font-display font-bold text-[22px]">{pkg.price.toLocaleString("vi-VN")} ₫</div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {pkg.trainer && (
                <Field label="Huấn luyện viên" hint="Bắt buộc khi gói có Trainer">
                  <div className="relative">
                    <select className="w-full h-10 rounded-lg bg-input-background border border-border px-3 text-[13px] appearance-none">
                      <option>Lê Đức Mạnh</option><option>Phan Thu Hà</option><option>Đỗ Anh Tuấn</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  </div>
                </Field>
              )}
              <Field label="Phương thức thanh toán">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: "card", l: "Thẻ NH", i: CreditCard },
                    { k: "qr",   l: "QR Code", i: QrCode },
                    { k: "cash", l: "Tiền mặt", i: Wallet },
                  ].map((p) => {
                    const active = method === p.k;
                    return (
                      <button key={p.k} type="button" onClick={() => setMethod(p.k as any)}
                        className={cn(
                          "h-10 rounded-lg border flex items-center justify-center gap-1.5 text-[12.5px] transition",
                          active
                            ? "border-[#6C63FF] bg-[#6C63FF]/10 text-foreground font-medium ring-1 ring-[#6C63FF]/40"
                            : "border-border text-muted-foreground hover:border-[#6C63FF]/40 hover:text-foreground"
                        )}>
                        <p.i className="size-3.5" /> {p.l}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          </Card>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>← Quay lại</Button>
            <Button icon={ArrowRight} onClick={() => setPay(method)}>Tiến hành thanh toán bằng {method === "card" ? "Thẻ NH" : method === "qr" ? "QR Code" : "Tiền mặt"}</Button>
          </div>
        </>
      )}
    </div>
  );
}

function Payment({ kind, onBack }: { kind: "card" | "qr" | "cash"; onBack: () => void }) {
  const [done, setDone] = useState(false);
  const TOTAL = 300;
  const [remain, setRemain] = useState(TOTAL);
  const [qrKey, setQrKey] = useState(0);
  useEffect(() => {
    if (kind !== "qr") return;
    setRemain(TOTAL);
    const t = setInterval(() => setRemain((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [kind, qrKey]);
  const expired = kind === "qr" && remain === 0;
  const mm = String(Math.floor(remain / 60)).padStart(2, "0");
  const ss = String(remain % 60).padStart(2, "0");
  const warn = remain <= 60;
  const pct = (remain / TOTAL) * 100;
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-[12.5px] text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ChevronRight className="size-3.5 rotate-180" /> Quay lại
      </button>
      <SectionTitle title={kind === "card" ? "Thanh toán bằng thẻ ngân hàng" : kind === "qr" ? "Thanh toán bằng QR" : "Thanh toán bằng tiền mặt"} />
      <div className="grid lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3">
          {kind === "card" && (
            <div className="space-y-4">
              <div className="rounded-2xl p-6 bg-gradient-to-br from-[#6C63FF] via-[#5147D6] to-[#1F1B6E] text-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 size-48 rounded-full bg-accent" />
                <div className="absolute right-10 bottom-4 size-24 rounded-full bg-muted" />
                <div className="relative">
                  <div className="flex justify-between items-start">
                    <div className="text-[11px] uppercase tracking-wider opacity-70">GymOS · Payment</div>
                    <CreditCard className="size-5" />
                  </div>
                  <div className="font-mono text-[20px] tracking-[0.25em] mt-8">•••• •••• •••• 4242</div>
                  <div className="flex justify-between items-end mt-4 text-[12px]">
                    <div><div className="opacity-60 text-[10px]">Chủ thẻ</div><div className="font-semibold uppercase">Nguyen Van A</div></div>
                    <div><div className="opacity-60 text-[10px]">Hết hạn</div><div className="font-semibold">12/28</div></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Số thẻ"><Input value="4242 4242 4242 4242" /></Field>
                <Field label="Chủ thẻ"><Input value="NGUYEN VAN A" /></Field>
                <Field label="Hết hạn"><Input value="12/28" /></Field>
                <Field label="CVV"><Input type="password" value="123" /></Field>
              </div>
            </div>
          )}
          {kind === "qr" && !expired && (
            <div className="text-center py-6">
              <div className="size-56 rounded-2xl bg-white mx-auto grid place-items-center p-3">
                <div className="size-full grid grid-cols-12 grid-rows-12 gap-px">
                  {Array.from({ length: 144 }).map((_, i) => (
                    <div key={i} className={(i * 7 + (i % 5)) % 3 === 0 ? "bg-black" : "bg-white"} />
                  ))}
                </div>
              </div>
              <div className="mt-4 text-[12.5px] text-muted-foreground">Quét bằng app ngân hàng để thanh toán</div>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/70 border border-border text-[12px] font-mono">
                Vietcombank · 0123 456 789 · Nội dung: GYMOS HV0241
              </div>
              <div className="mt-5 max-w-xs mx-auto">
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${pct}%`, background: warn ? "#FF5C5C" : "#FFB547" }} />
                </div>
                <div className={cn("font-mono mt-3", warn ? "text-[#FF5C5C]" : "text-[#FFB547]")} style={{ fontSize: 36, fontWeight: 700 }}>{mm}:{ss}</div>
                <div className="text-[12px] text-muted-foreground mt-1">Thời gian còn lại để thanh toán</div>
              </div>
            </div>
          )}
          {kind === "qr" && expired && (
            <div className="text-center py-10 space-y-4">
              <div className="size-16 rounded-2xl bg-[#FF5C5C]/15 grid place-items-center mx-auto">
                <X className="size-8 text-[#FF5C5C]" />
              </div>
              <div>
                <h3 className="font-display text-[18px]">Mã QR đã hết hạn</h3>
                <p className="text-[12.5px] text-muted-foreground mt-1">Vui lòng tạo mã mới để tiếp tục thanh toán.</p>
              </div>
              <Button icon={QrCode} onClick={() => setQrKey((k) => k + 1)}>Tạo mã mới</Button>
            </div>
          )}
          {kind === "cash" && (
            <div className="space-y-4">
              <Field label="Số tiền cần thu"><Input value="2.400.000 ₫" /></Field>
              <Field label="Khách đưa"><Input value="3.000.000 ₫" /></Field>
              <div className="rounded-xl border border-[#00C9A7]/30 bg-[#00C9A7]/10 p-4 flex items-center justify-between">
                <span className="text-[13px] text-[#00866F] dark:text-[#5FE6CB]">Tiền thối khách</span>
                <span className="font-display font-bold text-[22px] text-[#00866F] dark:text-[#5FE6CB]">600.000 ₫</span>
              </div>
            </div>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-display">Tóm tắt đơn hàng</h3>
          <div className="mt-4 space-y-3 text-[13px]">
            {[["Gói tập", "Gym Pro 3 tháng"], ["Hội viên", "Nguyễn Văn A"], ["Huấn luyện viên", "Lê Đức Mạnh"], ["Ngày bắt đầu", "24/05/2026"]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex justify-between text-[12.5px] text-muted-foreground"><span>Tạm tính</span><span>2.400.000 ₫</span></div>
            <div className="flex justify-between text-[12.5px] text-muted-foreground mt-1"><span>VAT</span><span>0 ₫</span></div>
            <div className="flex justify-between mt-3"><span className="font-display">Tổng thanh toán</span><span className="font-display font-bold text-[22px]">2.400.000 ₫</span></div>
          </div>
          {kind !== "qr" && (
            <Button className="w-full justify-center mt-5 h-11" icon={CheckCircle2} onClick={() => setDone(true)}>Xác nhận thanh toán</Button>
          )}
          {kind === "qr" && !expired && (
            <div className="mt-5 text-[11.5px] text-muted-foreground text-center">Giao dịch sẽ được xác nhận tự động sau khi nhận được thanh toán.</div>
          )}
        </Card>
      </div>

      <Modal open={done} onClose={() => setDone(false)} title="Thanh toán thành công"
        footer={<Button icon={ArrowRight} onClick={() => { setDone(false); onBack(); }}>Hoàn tất</Button>}>
        <div className="space-y-3">
          <div className="size-12 rounded-full bg-[#00C9A7]/15 grid place-items-center"><CheckCircle2 className="size-6 text-[#00C9A7]" /></div>
          <p className="text-[14px]">Đã ghi nhận thanh toán {kind === "card" ? "qua thẻ ngân hàng" : kind === "qr" ? "qua mã QR" : "tiền mặt"} thành công.</p>
          <p className="text-[12.5px] text-muted-foreground">Hóa đơn đã được gửi qua email của hội viên. Bạn có thể in biên lai ở mục Thanh toán trong hồ sơ hội viên.</p>
        </div>
      </Modal>
    </div>
  );
}

function MemberDetail({ id, onBack, onDeleted, onRenew, readonly, disablePackage }: { id?: string | null; onBack: () => void; onDeleted?: () => void; onRenew?: () => void; readonly?: boolean; disablePackage?: boolean }) {
  const baseMember = (id ? MEMBERS.find((m) => m.code === id) : undefined) ?? MEMBERS[0];
  const [member, setMember] = useState<MemberRecord>(baseMember);
  const [checked, setChecked] = useState(false);
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [delDayIdx, setDelDayIdx] = useState<number | null>(null);
  const [days, setDays] = useState([
    { d: "23/05/2026", in: "06:42", out: "08:11", dur: "1g 29p", note: "PT: Lê Đức Mạnh — Push day" },
    { d: "21/05/2026", in: "07:05", out: "08:34", dur: "1g 29p", note: "PT: Lê Đức Mạnh — Pull day" },
    { d: "19/05/2026", in: "18:22", out: "19:51", dur: "1g 29p", note: "Cardio tự do" },
    { d: "17/05/2026", in: "06:50", out: "08:20", dur: "1g 30p", note: "PT: Lê Đức Mạnh — Leg day" },
  ]);
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const [payments] = useState([
    { code: "PAY-20251112", d: "12/11/2025", desc: "Đăng ký Elite VIP 6 tháng", method: "Thẻ NH", amount: 8990000, status: "Thành công" },
    { code: "PAY-20250812", d: "12/08/2025", desc: "Gia hạn Premium 3 tháng", method: "QR Code", amount: 4490000, status: "Thành công" },
    { code: "PAY-20250512", d: "12/05/2025", desc: "Đăng ký Premium 3 tháng", method: "Tiền mặt", amount: 4490000, status: "Thành công" },
  ]);
  const [feedbacks] = useState([
    { d: "22/05/2026", c: "Phòng tắm thiếu khăn vào giờ cao điểm…", s: "Chờ xử lý", r: null as string | null },
    { d: "12/05/2026", c: "Đề xuất thêm lớp Yoga buổi tối thứ 4 và thứ 6.", s: "Đã phản hồi", r: "Cảm ơn bạn đã đóng góp. Trung tâm sẽ mở lớp Yoga thứ 6 từ tuần sau." },
  ]);

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-[12.5px] text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ChevronRight className="size-3.5 rotate-180" /> Quay lại danh sách hội viên
      </button>
      <Card>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex items-center gap-4 flex-1">
            <div className="size-20 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-600 grid place-items-center text-white font-display text-[24px] font-bold">
              {member.name.split(" ").slice(-2).map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="font-mono text-[12px] text-muted-foreground">{member.code}</div>
              <h2 className="font-display text-[22px] mt-0.5">{member.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[12.5px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{member.phone}</span>
                <span className="flex items-center gap-1.5"><Mail className="size-3.5" />{member.name.split(" ").slice(-1)[0].toLowerCase()}@gmail.com</span>
                <span className="flex items-center gap-1.5"><CalIcon className="size-3.5" />02/07/1996</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" icon={Pencil} onClick={() => setEdit(true)}>Sửa</Button>
            {!readonly && <Button variant="danger" icon={Trash2} onClick={() => setDel(true)}>Xóa</Button>}
            {onRenew && <Button variant="outline" icon={CreditCard} onClick={onRenew}>Gia hạn gói</Button>}
            <Button variant={checked ? "danger" : "secondary"} icon={CheckCircle2} onClick={() => setChecked(!checked)}>
              {checked ? "Check out hôm nay" : "Check in hôm nay"}
            </Button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl bg-gradient-to-br from-[#6C63FF]/10 to-transparent border border-[#6C63FF]/20 p-4">
            <div className="flex items-center gap-2"><Badge tone="amber">★ VIP</Badge><Badge tone="violet">Trainer</Badge></div>
            <div className="font-display font-semibold text-[16px] mt-2">{member.pkg}</div>
            <div className="text-[12px] text-muted-foreground">Bắt đầu 12/11/2025</div>
          </div>
          <div className="rounded-xl bg-muted/40 border border-border/70 p-4">
            <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">Hạn sử dụng</div>
            <div className="font-display font-bold text-[20px] mt-1">12/11/2026</div>
            <div className="text-[12px] text-[#00866F] dark:text-[#5FE6CB]">Còn 172 ngày</div>
          </div>
          <div className="rounded-xl bg-muted/40 border border-border/70 p-4">
            <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">Số buổi đã tập</div>
            <div className="font-display font-bold text-[20px] mt-1">{days.length} / —</div>
            <div className="text-[12px] text-muted-foreground">Trung bình 4 buổi / tuần</div>
          </div>
        </div>
      </Card>

      <Card padded={false}>
        <div className="px-5 pt-4 flex items-center gap-1">
          {["Lịch sử tập luyện", "Thanh toán", "Phản hồi"].map((t, i) => (
            <button key={t} onClick={() => setTab(i as 0 | 1 | 2)}
              className={cn("px-3 py-2 text-[12.5px] rounded-md transition",
                tab === i ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}>{t}</button>
          ))}
        </div>

        {tab === 0 && (
          <DataTable
            head={["Ngày", "Giờ vào", "Giờ ra", "Tổng thời gian", "Ghi chú", ""]}
            rows={days.map((d, idx) => [
              d.d, d.in, d.out, d.dur,
              <span className="text-muted-foreground">{d.note}</span>,
              <IconBtn icon={Trash2} tone="danger" onClick={() => setDelDayIdx(idx)} />,
            ])}
          />
        )}

        {tab === 1 && (
          <>
            <DataTable
              head={["Mã giao dịch", "Ngày", "Nội dung", "Phương thức", "Số tiền", "Trạng thái"]}
              rows={payments.map((p) => [
                <span className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{p.code}</span>,
                p.d,
                <span>{p.desc}</span>,
                <Badge tone={p.method === "Thẻ NH" ? "violet" : p.method === "QR Code" ? "sky" : "amber"}>{p.method}</Badge>,
                <span className="font-display font-semibold">{p.amount.toLocaleString("vi-VN")} ₫</span>,
                <StatusPill value={p.status} />,
              ])}
            />
            {payments.length === 0 && <div className="text-center text-muted-foreground py-10 text-[13px]">Chưa có giao dịch nào</div>}
          </>
        )}

        {tab === 2 && (
          <div className="p-5 space-y-3">
            {feedbacks.map((f, i) => (
              <div key={i} className="rounded-xl border border-border/70 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span>{member.name} · {f.d}</span><StatusPill value={f.s} />
                </div>
                <p className="mt-2 text-[14px]">{f.c}</p>
                {f.r && (
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-[#00C9A7]/40 bg-[#00C9A7]/[0.04] rounded-r-lg py-2.5 pr-3">
                    <div className="text-[11px] text-[#00866F] dark:text-[#5FE6CB]">Trả lời từ quản lý</div>
                    <p className="text-[13px] mt-1">{f.r}</p>
                  </div>
                )}
              </div>
            ))}
            {feedbacks.length === 0 && <div className="text-center text-muted-foreground py-6 text-[13px]">Hội viên chưa có phản hồi nào</div>}
          </div>
        )}
      </Card>

      <Modal open={edit} onClose={() => setEdit(false)} title={`Chỉnh sửa hội viên — ${member.name}`} wide
        footer={<><Button variant="ghost" onClick={() => setEdit(false)}>Hủy</Button><Button icon={CheckCircle2} onClick={() => setEdit(false)}>Lưu thay đổi</Button></>}>
        <MemberForm data={member} disablePackage={disablePackage} />
      </Modal>

      <Modal open={del} onClose={() => setDel(false)} title="Xóa hội viên"
        footer={<>
          <Button variant="ghost" onClick={() => setDel(false)}>Hủy</Button>
          <Button icon={Trash2} onClick={() => { setDel(false); onDeleted?.(); onBack(); }}>Xóa hội viên</Button>
        </>}>
        <div className="space-y-3">
          <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
          <p className="text-[14px]">Xóa hội viên <span className="font-medium">{member.name}</span> ({member.code})?</p>
          <p className="text-[12.5px] text-muted-foreground">Toàn bộ lịch sử tập luyện, thanh toán và phản hồi sẽ bị xóa khỏi hệ thống.</p>
        </div>
      </Modal>

      <Modal open={delDayIdx !== null} onClose={() => setDelDayIdx(null)} title="Xóa ngày tập luyện"
        footer={<>
          <Button variant="ghost" onClick={() => setDelDayIdx(null)}>Hủy</Button>
          <Button icon={Trash2} onClick={() => { setDays(days.filter((_, i) => i !== delDayIdx)); setDelDayIdx(null); }}>Xóa ngày</Button>
        </>}>
        {delDayIdx !== null && days[delDayIdx] && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Xóa buổi tập ngày <span className="font-medium">{days[delDayIdx].d}</span> ({days[delDayIdx].in} – {days[delDayIdx].out})?</p>
            <p className="text-[12.5px] text-muted-foreground">Hành động này không thể hoàn tác.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Member views ── */
function MemberHistory() {
  const days = Array.from({ length: 31 }, (_, i) => i % 2 === 0 || i % 5 === 0);
  return (
    <div className="space-y-5">
      <SectionTitle title="Lịch sử tập luyện" sub="Theo dõi tiến độ của bạn trong tháng này" />
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2"><Badge tone="amber">★ VIP</Badge><Badge tone="violet">Có Trainer</Badge></div>
            <h3 className="font-display text-[20px] mt-2">Elite VIP 6 tháng</h3>
            <div className="text-[12.5px] text-muted-foreground">PT phụ trách: Lê Đức Mạnh · Bắt đầu 12/11/2025</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Hết hạn sau</div>
            <div className="font-display font-bold text-[28px] text-[#00866F] dark:text-[#5FE6CB]">172 ngày</div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-2">
          <h3 className="font-display">Tháng 05 / 2026</h3>
          <div className="grid grid-cols-7 gap-1.5 mt-4 text-center">
            {"T2 T3 T4 T5 T6 T7 CN".split(" ").map((d) => (<div key={d} className="text-[10px] text-muted-foreground py-1">{d}</div>))}
            {Array.from({ length: 3 }).map((_, i) => <div key={"x" + i} />)}
            {days.map((d, i) => (
              <div key={i} className={cn("aspect-square rounded-lg grid place-items-center text-[11.5px] relative",
                d ? "bg-[#00C9A7]/15 text-[#00866F] dark:text-[#5FE6CB] border border-[#00C9A7]/30" : "bg-muted/40 text-muted-foreground border border-border/60")}>
                {i + 1}
                {d && <span className="absolute bottom-0.5 right-0.5 size-1 rounded-full bg-[#00C9A7]" />}
              </div>
            ))}
          </div>
          <div className="mt-4 text-[12px] text-muted-foreground">✓ 18 buổi tập trong tháng — chuỗi 5 ngày liên tiếp 🔥</div>
        </Card>
        <Card className="lg:col-span-3" padded={false}>
          <div className="px-5 pt-5"><h3 className="font-display">Buổi tập gần đây</h3></div>
          <DataTable
            head={["Ngày", "Giờ vào", "Giờ ra", "Thời lượng", "Ghi chú"]}
            rows={[
              ["23/05/2026", "06:42", "08:11", "1g 29p", "Push day"],
              ["21/05/2026", "07:05", "08:34", "1g 29p", "Pull day"],
              ["19/05/2026", "18:22", "19:51", "1g 29p", "Cardio tự do"],
              ["17/05/2026", "06:50", "08:20", "1g 30p", "Leg day"],
              ["15/05/2026", "07:00", "08:40", "1g 40p", "Full body"],
            ].map((r) => r.map((c, i) => i === 4 ? <span className="text-muted-foreground">{c}</span> : c))}
          />
        </Card>
      </div>
    </div>
  );
}

function MemberPayments() {
  const [methodFilter, setMethodFilter] = useState<string>("Tất cả");
  const payments = [
    { code: "PAY-20251112", d: "12/11/2025", desc: "Đăng ký Elite VIP 6 tháng",   method: "Thẻ NH",    amount: 8990000, status: "Thành công" },
    { code: "PAY-20250812", d: "12/08/2025", desc: "Gia hạn Premium 3 tháng",      method: "QR Code",   amount: 4490000, status: "Thành công" },
    { code: "PAY-20250512", d: "12/05/2025", desc: "Đăng ký Premium 3 tháng",      method: "Tiền mặt",  amount: 4490000, status: "Thành công" },
    { code: "PAY-20241112", d: "12/11/2024", desc: "Đăng ký Basic 1 tháng",        method: "Tiền mặt",  amount: 890000,  status: "Thành công" },
    { code: "PAY-20240810", d: "10/08/2024", desc: "Đăng ký Basic 1 tháng",        method: "QR Code",   amount: 890000,  status: "Thành công" },
  ];
  const filtered = payments.filter((p) => methodFilter === "Tất cả" || p.method === methodFilter);
  const total = payments.reduce((s, p) => s + p.amount, 0);
  const methodBadgeTone = (m: string) => m === "Thẻ NH" ? "violet" : m === "QR Code" ? "sky" : "amber";

  return (
    <div className="space-y-5">
      <SectionTitle title="Lịch sử thanh toán" sub="Toàn bộ giao dịch gắn với tài khoản của bạn" />

      {/* Gói hiện tại */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Badge tone="amber">★ Gói hiện tại</Badge>
            <h3 className="font-display text-[20px] mt-2">Elite VIP 6 tháng</h3>
            <div className="text-[12.5px] text-muted-foreground mt-0.5">Bắt đầu 12/11/2025 · Còn 172 ngày — Hết hạn 12/11/2026</div>
          </div>
          <StatusPill value="Đang hoạt động" />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tổng chi tiêu",     value: total.toLocaleString("vi-VN") + " ₫", tone: "violet" },
          { label: "Số giao dịch",      value: payments.length + " giao dịch",        tone: "sky" },
          { label: "Lần thanh toán gần nhất", value: payments[0].d,                   tone: "emerald" },
        ].map((s) => (
          <Card key={s.label}>
            <div className="text-[11px] uppercase text-muted-foreground tracking-wider">{s.label}</div>
            <div className="font-display font-bold text-[20px] mt-1 leading-tight">{s.value}</div>
            <Badge tone={s.tone as any} className="mt-1.5">Tổng cộng</Badge>
          </Card>
        ))}
      </div>

      {/* Filter + Table */}
      <Card padded={false}>
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-border/70">
          <span className="text-[13px] text-muted-foreground">Lọc theo phương thức:</span>
          {["Tất cả", "Thẻ NH", "QR Code", "Tiền mặt"].map((m) => (
            <button key={m} onClick={() => setMethodFilter(m)}
              className={cn("h-7 px-3 rounded-full text-[12px] border transition",
                methodFilter === m
                  ? "bg-[#6C63FF] border-[#6C63FF] text-white"
                  : "border-border text-muted-foreground hover:border-[#6C63FF]/50 hover:text-foreground")}>
              {m}
            </button>
          ))}
        </div>
        <DataTable
          head={["Mã giao dịch", "Ngày", "Nội dung", "Phương thức", "Số tiền", "Trạng thái"]}
          rows={filtered.map((p) => [
            <span className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{p.code}</span>,
            p.d,
            <span className="text-muted-foreground">{p.desc}</span>,
            <Badge tone={methodBadgeTone(p.method) as any}>{p.method}</Badge>,
            <span className="font-display font-semibold">{p.amount.toLocaleString("vi-VN")} ₫</span>,
            <StatusPill value={p.status} />,
          ])}
        />
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10 text-[13px]">Không có giao dịch nào cho phương thức "{methodFilter}"</div>
        )}
      </Card>
    </div>
  );
}

type MyFeedback = { id: string; d: string; c: string; s: string; r: string | null; type: "Thiết bị" | "Nhân viên"; ref?: string };
function MemberFeedback() {
  const [list, setList] = useState<MyFeedback[]>([
    { id: "f1", d: "22/05/2026", c: "Phòng tắm thiếu khăn vào giờ cao điểm…", s: "Chờ xử lý", r: null, type: "Thiết bị" },
    { id: "f2", d: "12/05/2026", c: "Đề xuất thêm lớp Yoga buổi tối thứ 4 và thứ 6.", s: "Đã phản hồi", r: "Cảm ơn bạn đã đóng góp. Trung tâm sẽ mở lớp Yoga thứ 6 từ tuần sau. ❤️", type: "Nhân viên" },
  ]);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [fbType, setFbType] = useState<"Thiết bị" | "Nhân viên">("Thiết bị");
  const [ref, setRef] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleting = deleteId ? list.find((f) => f.id === deleteId) : null;

  const today = new Date().toLocaleDateString("vi-VN");
  const submit = () => {
    if (!content.trim()) return;
    setList([{ id: "f" + Date.now(), d: today, c: content.trim(), s: "Chờ xử lý", r: null, type: fbType, ref: ref || undefined }, ...list]);
    setContent(""); setRef("");
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Phản hồi của tôi" sub={`${list.length} phản hồi — theo dõi tiến độ xử lý`}
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Tạo phản hồi mới</Button>} />
      <div className="space-y-3">
        {list.map((f) => (
          <Card key={f.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span>Bạn · {f.d}</span>
                  <Badge tone={f.type === "Thiết bị" ? "amber" : "sky"}>{f.type}</Badge>
                  <StatusPill value={f.s} />
                </div>
                <p className="mt-2 text-[14px]">{f.c}</p>
                {f.r && (
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-[#00C9A7]/40 bg-[#00C9A7]/[0.04] rounded-r-lg py-2.5 pr-3">
                    <div className="text-[11px] text-[#00866F] dark:text-[#5FE6CB]">Trả lời từ quản lý</div>
                    <p className="text-[13px] mt-1">{f.r}</p>
                  </div>
                )}
              </div>
              <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteId(f.id)} />
            </div>
          </Card>
        ))}
        {list.length === 0 && (
          <Card><div className="text-center text-muted-foreground py-6 text-[13px]">Bạn chưa gửi phản hồi nào</div></Card>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tạo phản hồi mới"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button><Button icon={ArrowRight} onClick={submit}>Gửi phản hồi</Button></>}>
        <div className="space-y-4">
          <Field label="Loại phản hồi">
            <div className="flex gap-2">
              {(["Thiết bị", "Nhân viên"] as const).map((t) => (
                <button key={t} type="button" onClick={() => { setFbType(t); setRef(""); }}
                  className={cn("h-10 px-4 rounded-lg border text-[13px] transition flex-1",
                    fbType === t ? "bg-[#6C63FF]/15 border-[#6C63FF]/40 text-[#6C63FF] dark:text-white" : "border-border text-muted-foreground hover:border-[#6C63FF]/30")}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
          {fbType === "Thiết bị" && (
            <Field label="Thiết bị liên quan (tùy chọn)">
              <select value={ref} onChange={(e) => setRef(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
                <option value="">— Không chọn —</option>
                {EQUIPMENT_ITEMS.map((i) => <option key={i.code} value={i.code}>{i.code} — {i.room}</option>)}
              </select>
            </Field>
          )}
          {fbType === "Nhân viên" && (
            <Field label="Nhân viên liên quan (tùy chọn)">
              <select value={ref} onChange={(e) => setRef(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
                <option value="">— Không chọn —</option>
                {STAFF.map((s) => <option key={s.code} value={s.code}>{s.code} — {s.name} ({s.role})</option>)}
              </select>
            </Field>
          )}
          <Field label="Nội dung">
            <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Chia sẻ ý kiến của bạn…" className="w-full rounded-lg bg-input-background border border-border p-3 text-[13.5px] focus:outline-none focus:border-[#6C63FF]/60 resize-none" />
          </Field>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleteId(null)} title="Xóa phản hồi"
        footer={<>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button icon={Trash2} onClick={() => { setList(list.filter((f) => f.id !== deleteId)); setDeleteId(null); }}>Xóa phản hồi</Button>
        </>}>
        {deleting && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Xóa phản hồi đã gửi ngày <span className="font-medium">{deleting.d}</span>?</p>
            <p className="text-[12.5px] text-muted-foreground line-clamp-2">"{deleting.c}"</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function PackageDropdown({ pkgId, onChange }: { pkgId: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const list = PACKAGES.filter((p) => p.status === "Đang kinh doanh");
  const selected = list.find((p) => p.id === pkgId);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const renderRow = (p: typeof list[number], inList: boolean) => {
    const perks = [
      p.type.includes("buổi") ? `${p.type} (theo lượt tập)` : `Tập không giới hạn trong ${p.type}`,
      p.vip ? "Phòng tắm VIP + tủ đồ riêng" : "Sử dụng toàn bộ khu vực tập luyện",
      p.trainer ? "Có Huấn luyện viên 1-kèm-1" : "Tự tập theo lịch cá nhân",
    ];
    return (
      <div className="flex items-start gap-3 w-full">
        <div className="size-10 rounded-lg bg-muted border border-border grid place-items-center shrink-0">
          <CreditCard className="size-4 text-[#4F46E5] dark:text-[#A8A2FF]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[11px] text-muted-foreground">{p.id}</span>
              <span className="font-display font-semibold text-[14px] truncate">{p.name}</span>
            </div>
            <div className="font-display font-bold text-[15px] whitespace-nowrap">{p.price.toLocaleString("vi-VN")} ₫</div>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge tone="sky">{p.type}</Badge>
            {p.vip && <Badge tone="amber">★ VIP</Badge>}
            {p.trainer && <Badge tone="violet">Có HLV</Badge>}
          </div>
          {inList && (
            <ul className="mt-2 space-y-1 text-[11.5px] text-muted-foreground">
              {perks.map((k) => (
                <li key={k} className="flex items-start gap-1.5">
                  <CheckCircle2 className="size-3 text-[#00C9A7] mt-0.5 shrink-0" /><span>{k}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className={cn("w-full min-h-12 rounded-lg border bg-input-background px-3 py-2 text-left transition flex items-center gap-2",
          open ? "border-[#6C63FF]" : "border-border hover:border-[#6C63FF]/40")}>
        <div className="flex-1 min-w-0">
          {selected ? renderRow(selected, false) : <span className="text-[13px] text-muted-foreground">— Chọn gói gia hạn —</span>}
        </div>
        <ChevronDown className={cn("size-4 text-muted-foreground transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-30 left-0 right-0 mt-2 rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
          <div className="max-h-[360px] overflow-y-auto py-1">
            {list.map((p) => {
              const active = p.id === pkgId;
              return (
                <button key={p.id} type="button"
                  onClick={() => { onChange(p.id); setOpen(false); }}
                  className={cn("w-full text-left px-3 py-3 border-b border-border/60 last:border-0 transition",
                    active ? "bg-[#6C63FF]/10" : "hover:bg-muted/60")}>
                  {renderRow(p, true)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Renew({ onBack, memberName }: { onBack?: () => void; memberName?: string }) {
  const [pkgId, setPkgId] = useState<string>("");
  const [selected, setSelected] = useState<string | null>(null);
  const [method, setMethod] = useState<"card" | "qr" | "cash">("card");
  const [pay, setPay] = useState<"card" | "qr" | "cash" | null>(null);
  const sub = memberName ? `Chọn gói tập cho học viên ${memberName}` : "Chọn gói phù hợp để tiếp tục hành trình của bạn";
  if (pay) return <Payment kind={pay} onBack={() => { setPay(null); setSelected(null); }} />;
  return (
    <div className="space-y-5">
      {onBack && (
        <button onClick={onBack} className="text-[12.5px] text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ChevronLeft className="size-4" /> Quay lại chi tiết học viên
        </button>
      )}
      <SectionTitle title="Gia hạn gói tập" sub={sub} />
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Badge tone="amber">Gói hiện tại</Badge>
            <h3 className="font-display text-[20px] mt-2">Elite VIP 6 tháng</h3>
            <div className="text-[12.5px] text-muted-foreground">Còn 172 ngày — Hết hạn 12/11/2026</div>
          </div>
          <Badge tone="emerald">Đang hoạt động</Badge>
        </div>
      </Card>
      <Card>
        <h3 className="font-display mb-4">Chọn gói gia hạn</h3>
        <Field label="Gói tập">
          <PackageDropdown pkgId={pkgId} onChange={setPkgId} />
        </Field>
        {pkgId && (
          <div className="mt-5 flex justify-end">
            <Button icon={ArrowRight} onClick={() => setSelected(pkgId)}>Tiếp tục với gói đã chọn</Button>
          </div>
        )}
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Thanh toán gói — ${PACKAGES.find((p) => p.id === selected)?.name ?? ""}`} wide
        footer={<>
          <Button variant="ghost" onClick={() => setSelected(null)}>Hủy</Button>
          <Button icon={ArrowRight} onClick={() => setPay(method)}>Tiến hành thanh toán</Button>
        </>}>
        {selected && (() => {
          const pkg = PACKAGES.find((p) => p.id === selected)!;
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/70">
                <div>
                  <div className="font-display font-semibold text-[16px]">{pkg.name}</div>
                  <div className="text-[12.5px] text-muted-foreground">{pkg.type}</div>
                </div>
                <div className="font-display font-bold text-[22px]">{pkg.price.toLocaleString("vi-VN")} ₫</div>
              </div>
              <Field label="Phương thức thanh toán">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: "card", l: "Thẻ NH", i: CreditCard },
                    { k: "qr",   l: "QR Code", i: QrCode },
                    { k: "cash", l: "Tiền mặt", i: Wallet },
                  ].map((p) => {
                    const active = method === p.k;
                    return (
                      <button key={p.k} type="button" onClick={() => setMethod(p.k as any)}
                        className={cn("h-11 rounded-lg border flex items-center justify-center gap-1.5 text-[13px] transition",
                          active ? "border-[#6C63FF] bg-[#6C63FF]/10 text-foreground font-medium ring-1 ring-[#6C63FF]/40"
                                 : "border-border text-muted-foreground hover:border-[#6C63FF]/40 hover:text-foreground")}>
                        <p.i className="size-4" /> {p.l}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

/* ── PT students ── */
function PtStudents({ onSelect }: { onSelect: (id: string) => void }) {
  const [list, setList] = useState<MemberRecord[]>(MEMBERS.slice(0, 4));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = list.filter((m) =>
    (statusFilter === "Tất cả" || m.status === statusFilter) &&
    (m.name.toLowerCase().includes(query.toLowerCase()) || m.code.toLowerCase().includes(query.toLowerCase()) || m.phone.includes(query))
  );
  const editing = editId ? list.find((m) => m.code === editId) : null;

  return (
    <div className="space-y-5">
      <SectionTitle title="Học viên của tôi" sub={`Bạn đang phụ trách ${list.length} học viên`} />
      <div className="flex flex-wrap items-center gap-3">
        <Input icon={Search} placeholder="Tìm theo tên, SĐT, mã HV…" className="max-w-md" value={query} onChange={(e: any) => setQuery(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-[#6C63FF]">
          <option value="Tất cả">Tất cả trạng thái</option>
          {MEMBER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <Card padded={false}>
        <DataTable
          head={["Mã HV", "Họ tên", "SĐT", "Gói tập", "Hạn / Buổi còn lại", "Trạng thái", ""]}
          rows={filtered.map((m) => [
            <span className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{m.code}</span>,
            <button onClick={() => onSelect(m.code)} className="font-medium hover:text-[#4F46E5] dark:text-[#A8A2FF]">{m.name}</button>,
            <span className="font-mono text-[12.5px]">{m.phone}</span>,
            <Badge tone="violet">{m.pkg}</Badge>,
            <span className="text-muted-foreground">{m.remain}</span>,
            <StatusPill value={m.status} />,
            <div className="flex items-center justify-end gap-0.5">
              <IconBtn icon={Eye} onClick={() => onSelect(m.code)} />
              <IconBtn icon={Pencil} onClick={() => setEditId(m.code)} />
            </div>,
          ])}
        />
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10 text-[13px]">Không có học viên nào khớp với bộ lọc</div>
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditId(null)} title={`Chỉnh sửa học viên — ${editing?.name ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditId(null)}>Hủy</Button><Button icon={CheckCircle2} onClick={() => setEditId(null)}>Lưu thay đổi</Button></>}>
        {editing && <MemberForm data={editing} disablePackage />}
      </Modal>
    </div>
  );
}

/* ───────────────────────────── Router ───────────────────────────── */


function StaffDetailWrapper({ staffs, refresh, onEdit }: { staffs: StaffRecord[]; refresh: () => void; onEdit: (code: string) => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  return <StaffDetail id={id!} staffs={staffs} refresh={refresh} onBack={() => navigate("/staff")} onEdit={onEdit} />;
}
function RoomDetailWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <RoomDetail id={id!} onBack={() => navigate("/rooms")} />;
}
function MemberDetailWrapper({ disablePackage, readonly }: { disablePackage?: boolean, readonly?: boolean }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const base = readonly ? "/students" : "/members";
  return <MemberDetail id={id!} onBack={() => navigate(base)} onRenew={() => navigate("/renew")} disablePackage={disablePackage} readonly={readonly} />;
}
function RenewWrapper({ role }: { role: Role }) {
  const navigate = useNavigate();
  return <Renew onBack={role === "staff" ? () => navigate("/members") : role === "trainer" ? () => navigate("/students") : undefined} />;
}
function ReportsWrapper() {
  const location = useLocation();
  const view = location.pathname.slice(1).replace(/\//g, ".");
  return <Reports view={view} />;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authed, setAuthed] = useState(() => localStorage.getItem("gymos_authed") === "true");
  const [role, setRole] = useState<Role>(() => (localStorage.getItem("gymos_role") as Role) || "owner");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const [editStaff, setEditStaff] = useState<string | null>(null);
  
  // Real backend staff data
  const [staffData, setStaffData] = useState<any[]>([]);
  const fetchStaffs = () => {
    fetch("http://localhost:5000/api/v1/staffs")
      .then(res => res.json())
      .then(data => {
        if (data.success) setStaffData(data.data);
      })
      .catch(console.error);
  };
  useEffect(() => {
    if (authed) fetchStaffs();
  }, [authed]);

  useEffect(() => {
    localStorage.setItem("gymos_authed", String(authed));
    localStorage.setItem("gymos_role", role);
  }, [authed, role]);

  const editingStaff = editStaff ? staffData.find((x) => x.code === editStaff) : null;

  const breadcrumb = useMemo(() => {
    const path = location.pathname;
    if (path === "/") return ["GymOS", "Trang chủ"];
    if (path.startsWith("/staff")) return ["Quản lý nhân sự", path.length > 7 ? "Chi tiết nhân sự" : "Danh sách nhân sự"];
    if (path.startsWith("/attendance")) return ["Quản lý nhân sự", "Chấm công nhân sự"];
    if (path.startsWith("/packages")) return ["Quản lý gói tập"];
    if (path.startsWith("/rooms")) return ["Quản lý phòng tập", path.length > 7 ? "Chi tiết phòng tập" : "Danh sách"];
    if (path.startsWith("/equipment/maintenance")) return ["Quản lý thiết bị", "Xử lý bảo trì"];
    if (path.startsWith("/equipment")) return ["Quản lý thiết bị", "Danh sách loại thiết bị"];
    if (path.startsWith("/feedback")) return ["Phản hồi hội viên"];
    if (path.startsWith("/reports/revenue")) return ["Báo cáo thống kê", "Doanh thu"];
    if (path.startsWith("/reports/members")) return ["Báo cáo thống kê", "Hội viên"];
    if (path.startsWith("/reports/staff")) return ["Báo cáo thống kê", "Nhân sự"];
    if (path.startsWith("/reports")) return ["Báo cáo thống kê", "Báo cáo chung"];
    if (path.startsWith("/members/new")) return ["Quản lý hội viên", "Thêm hội viên"];
    if (path.startsWith("/members")) return ["Quản lý hội viên", path.length > 9 ? "Chi tiết hội viên" : "Danh sách hội viên"];
    if (path.startsWith("/maintenance")) return ["Bảo trì thiết bị"];
    if (path.startsWith("/students")) return ["Học viên của tôi", path.length > 10 ? "Chi tiết học viên" : "Danh sách"];
    if (path.startsWith("/renew")) return ["Gia hạn gói tập"];
    if (path.startsWith("/history")) return ["Lịch sử tập luyện"];
    if (path.startsWith("/mpayments")) return ["Lịch sử thanh toán"];
    if (path.startsWith("/mfeedback")) return ["Phản hồi"];
    return ["GymOS"];
  }, [location.pathname]);

  if (!authed) return <div className={cn(theme === "dark" && "dark", "bg-background text-foreground")}><Login onEnter={(r) => { setRole(r); setAuthed(true); navigate("/"); }} theme={theme} onToggleTheme={toggleTheme} /></div>;

  return (
    <div className={cn(theme === "dark" && "dark", "min-h-screen flex bg-background text-foreground")}>
      <Sidebar role={role} theme={theme} onToggleTheme={toggleTheme} onLogout={() => { setAuthed(false); navigate("/"); }} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header role={role} breadcrumb={breadcrumb} onLogout={() => { setAuthed(false); navigate("/"); }} />
        <main className="flex-1 p-7 max-w-[1440px] w-full mx-auto">
          <Routes>
            <Route path="/" element={<HomeWidgets role={role} />} />
            
            {/* Owner routes */}
            {role === "owner" && <>
              <Route path="/staff" element={<StaffList staffs={staffData} refresh={fetchStaffs} onSelect={(id) => navigate("/staff/" + id)} onEdit={(code) => setEditStaff(code)} />} />
              <Route path="/staff/:id" element={<StaffDetailWrapper staffs={staffData} refresh={fetchStaffs} onEdit={(code) => setEditStaff(code)} />} />
              <Route path="/attendance" element={<Attendance staffs={staffData} />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/rooms" element={<Rooms onSelect={(id) => navigate("/rooms/" + id)} />} />
              <Route path="/rooms/:id" element={<RoomDetailWrapper />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/equipment/maintenance" element={<EquipmentMaintenance />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/reports/*" element={<ReportsWrapper />} />
            </>}

            {/* Staff routes */}
            {role === "staff" && <>
              <Route path="/members" element={<MembersList onSelect={(id) => navigate("/members/" + id)} onAdd={() => navigate("/members/new")} disablePackage />} />
              <Route path="/members/new" element={<NewMember onBack={() => navigate("/members")} />} />
              <Route path="/members/:id" element={<MemberDetailWrapper disablePackage />} />
              <Route path="/renew" element={<RenewWrapper role={role} />} />
              <Route path="/maintenance" element={<MaintenanceOwner />} />
              <Route path="/feedback" element={<Feedback />} />
            </>}

            {/* Trainer routes */}
            {role === "trainer" && <>
              <Route path="/students" element={<PtStudents onSelect={(id) => navigate("/students/" + id)} />} />
              <Route path="/students/:id" element={<MemberDetailWrapper disablePackage readonly />} />
              <Route path="/renew" element={<RenewWrapper role={role} />} />
            </>}

            {/* Member routes */}
            {role === "member" && <>
              <Route path="/renew" element={<RenewWrapper role={role} />} />
              <Route path="/history" element={<MemberHistory />} />
              <Route path="/mpayments" element={<MemberPayments />} />
              <Route path="/mfeedback" element={<MemberFeedback />} />
            </>}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="px-7 py-4 text-[11px] text-muted-foreground border-t border-border/60 flex justify-between">
          <span>© 2026 GymOS — ITSS Project</span>
          <span className="font-mono">v2.4.0 · build {new Date().getFullYear()}05</span>
        </footer>
      </div>

      <Modal
        open={!!editingStaff}
        onClose={() => setEditStaff(null)}
        title={`Sửa thông tin nhân sự — ${editingStaff?.name ?? ""}`}
        wide>
        {editingStaff && (
          <StaffForm 
            data={editingStaff} 
            onCancel={() => setEditStaff(null)}
            onSubmit={(data) => {
              fetch(`http://localhost:5000/api/v1/staffs/${editingStaff.code}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              }).then(res => res.json()).then(() => {
                fetchStaffs();
                setEditStaff(null);
              });
            }}
          />
        )}
      </Modal>
    </div>
  );
}