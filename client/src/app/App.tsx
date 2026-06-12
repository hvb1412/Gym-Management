import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from "react-router";
import { toast } from "sonner";
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
  owner: { name: "Chủ phòng tập", person: "Nguyễn Quang Huy", initials: "QH", tone: "from-violet-500 to-indigo-600" },
  staff: { name: "Nhân viên quản lý", person: "Trần Mỹ Linh", initials: "ML", tone: "from-emerald-400 to-teal-600" },
  trainer: { name: "Huấn luyện viên", person: "Lê Đức Mạnh", initials: "ĐM", tone: "from-amber-400 to-orange-600" },
  member: { name: "Hội viên", person: "Phạm Khánh An", initials: "KA", tone: "from-sky-400 to-cyan-600" },
};

const ACCOUNTS: { role: Role; email: string; password: string }[] = [
  { role: "owner", email: "owner@gymos.vn", password: "owner@123" },
  { role: "staff", email: "staff@gymos.vn", password: "staff@123" },
  { role: "trainer", email: "trainer@gymos.vn", password: "trainer@123" },
  { role: "member", email: "member@gymos.vn", password: "member@123" },
];

type Nav = { id: string; label: string; icon: any; children?: { id: string; label: string }[] };

const NAV: Record<Role, Nav[]> = {
  owner: [
    { id: "home", label: "Trang chủ", icon: Home },
    {
      id: "staff", label: "Quản lý nhân sự", icon: Users, children: [
        { id: "staff", label: "Danh sách nhân sự" },
        { id: "attendance", label: "Chấm công nhân sự" },
      ]
    },
    { id: "packages", label: "Quản lý gói tập", icon: LayoutGrid },
    { id: "rooms", label: "Quản lý phòng tập", icon: Building2 },
    {
      id: "equipment", label: "Quản lý thiết bị", icon: Dumbbell, children: [
        { id: "equipment", label: "Danh sách loại thiết bị" },
        { id: "equipment.maintenance", label: "Xử lý bảo trì" },
      ]
    },
    { id: "feedback", label: "Phản hồi hội viên", icon: MessageSquare },
    {
      id: "reports", label: "Báo cáo thống kê", icon: BarChart3, children: [
        { id: "reports", label: "Báo cáo chung" },
        { id: "reports.revenue", label: "Thống kê doanh thu" },
        { id: "reports.members", label: "Thống kê hội viên" },
        { id: "reports.staff", label: "Thống kê nhân sự" },
      ]
    },
  ],
  staff: [
    { id: "home", label: "Trang chủ", icon: Home },
    {
      id: "members", label: "Quản lý hội viên", icon: Users, children: [
        { id: "members", label: "Danh sách hội viên" },
        { id: "feedback", label: "Phản hồi hội viên" },
      ]
    },
    { id: "maintenance", label: "Bảo trì thiết bị", icon: Wrench },
  ],
  trainer: [
    { id: "home", label: "Trang chủ", icon: Home },
    { id: "students", label: "Quản lý học viên", icon: Users },
  ],
  member: [
    { id: "home", label: "Trang chủ", icon: Home },
    { id: "renew", label: "Gia hạn gói tập", icon: CreditCard },
    { id: "history", label: "Lịch sử tập luyện", icon: CalIcon },
    { id: "mpayments", label: "Lịch sử thanh toán", icon: Receipt },
    { id: "mfeedback", label: "Phản hồi", icon: MessageSquare },
  ],
};

const STAFF: any[] = [];

const PACKAGES: any[] = [];

const ROOMS: any[] = [];

const EQUIPMENT_TYPES: any[] = [];

const EQUIPMENT_ITEMS: any[] = [];

const MAINTENANCE: any[] = [];

const FEEDBACK: any[] = [];

const MEMBERS: any[] = [];

const REVENUE: any[] = [];
const NEW_MEMBERS: any[] = [];
const PKG_BREAKDOWN: any[] = [];

/* ───────────────────────────── Primitives ───────────────────────────── */

const cn = (...x: (string | false | undefined)[]) => x.filter(Boolean).join(" ");

function Badge({ tone = "default", children }: { tone?: "default" | "violet" | "emerald" | "amber" | "red" | "sky" | "gray"; children: React.ReactNode }) {
  const map: Record<string, string> = {
    default: "bg-muted text-foreground/80 border-border",
    violet: "bg-[#6C63FF]/12 text-[#3F36C9] border-[#6C63FF]/40 dark:bg-[#6C63FF]/15 dark:text-[#A8A2FF] dark:border-[#6C63FF]/30",
    emerald: "bg-[#00C9A7]/20 text-[#005E4F] border-[#00C9A7]/50 dark:bg-[#00C9A7]/15 dark:text-[#5FE6CB] dark:border-[#00C9A7]/30",
    amber: "bg-[#FFB547]/25 text-[#6B3500] border-[#FFB547]/60 dark:bg-[#FFB547]/15 dark:text-[#FFD89B] dark:border-[#FFB547]/30",
    red: "bg-[#FF5C5C]/15 text-[#991B1B] border-[#FF5C5C]/50 dark:bg-[#FF5C5C]/15 dark:text-[#FFA0A0] dark:border-[#FF5C5C]/30",
    sky: "bg-sky-400/20 text-sky-900 border-sky-400/50 dark:bg-sky-400/15 dark:text-sky-300 dark:border-sky-400/30",
    gray: "bg-muted text-muted-foreground border-border",
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
    primary: "bg-[#6C63FF] hover:bg-[#7A72FF] text-white shadow-[0_8px_24px_-12px_rgba(108,99,255,0.8)]",
    secondary: "bg-[#00C9A7] hover:bg-[#13d9b7] text-[#07120F]",
    outline: "border border-border hover:border-border text-foreground bg-muted/40",
    ghost: "hover:bg-accent text-foreground/80",
    danger: "bg-[#FF5C5C] hover:bg-[#ff7575] text-white",
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

function Input({ icon: Icon, placeholder, type = "text", className, value, onChange, ...rest }: any) {
  const controlled = onChange !== undefined;
  return (
    <div className={cn("relative", className)}>
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground stroke-[1.75]" />}
      <input type={type} {...(controlled ? { value: value ?? "", onChange } : { defaultValue: value })} placeholder={placeholder} {...rest} className={cn(
        "w-full h-10 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground/60",
        "focus:outline-none focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/15 transition px-3",
        Icon && "pl-9"
      )} />
    </div>
  );
}

function SearchableSelect({ options, value, onChange, placeholder = "Chọn...", disabled, className, defaultValue }: any) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (val: string) => {
    if (!isControlled) setInternalValue(val);
    if (onChange) onChange({ target: { value: val } } as any);
    setOpen(false);
    setSearch("");
  };

  const selected = options.find((o: any) => o.value == currentValue);
  const filtered = options.filter((o: any) => String(o.label).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button type="button" disabled={disabled} onClick={() => setOpen(!open)}
        className={cn("w-full h-10 flex items-center justify-between rounded-lg border border-border bg-input-background px-3 text-[13px] text-foreground outline-none transition", open ? "border-[#6C63FF] ring-2 ring-[#6C63FF]/15" : "", disabled && "opacity-50 cursor-not-allowed")}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className="size-4 text-muted-foreground shrink-0" />
      </button>
      
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 flex flex-col rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
          <div className="bg-popover p-1 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Tìm kiếm..." 
                className="w-full h-8 bg-muted/50 rounded-md border-none pl-7 pr-3 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#6C63FF]"
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-[12.5px] text-muted-foreground">Không tìm thấy kết quả</div>
            ) : (
              filtered.map((o: any) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => handleChange(o.value)}
                  className={cn("w-full flex items-center justify-between px-2.5 py-2 text-[13px] rounded-md text-left transition hover:bg-accent hover:text-foreground", currentValue == o.value && "bg-accent/60 text-foreground font-medium")}
                >
                  <span className="truncate">{o.label}</span>
                  {currentValue == o.value && <CheckCircle2 className="size-3.5 text-[#6C63FF]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
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

function Sidebar({ role, user, theme, onToggleTheme, onLogout }: { role: Role; user?: any; theme: "light" | "dark"; onToggleTheme: () => void; onLogout: () => void }) {
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
        <div className={cn("size-8 rounded-lg grid place-items-center text-white text-[12px] font-semibold bg-gradient-to-br", (ROLE_META[role] || ROLE_META["member"]).tone)}>
          {user?.name ? user.name.split(" ").map((n: string) => n[0]).slice(-2).join("").toUpperCase() : (ROLE_META[role] || ROLE_META["member"]).initials}
        </div>
        <div className="flex-1 text-left leading-tight min-w-0">
          <div className="text-[12.5px] font-medium truncate">{user?.name || (ROLE_META[role] || ROLE_META["member"]).person}</div>
          <div className="text-[10.5px] text-muted-foreground truncate">{(ROLE_META[role] || ROLE_META["member"]).name}</div>
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

function Header({ role, user, breadcrumb, onLogout }: { role: Role; user?: any; breadcrumb: string[]; onLogout: () => void }) {
  const meta = ROLE_META[role] || ROLE_META["member"];
  const personName = user?.name || meta.person;
  const firstName = personName.split(" ").pop();
  const initials = personName.split(" ").map((n: string) => n[0]).slice(-2).join("").toUpperCase();

  const [open, setOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [cf, setCf] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNw, setShowNw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const mismatch = nw.length > 0 && cf.length > 0 && nw !== cf;
  const rules = [
    { id: "len", label: "Tối thiểu 8 ký tự", ok: nw.length >= 8 },
    { id: "case", label: "Có chữ hoa và chữ thường", ok: /[a-z]/.test(nw) && /[A-Z]/.test(nw) },
    { id: "num", label: "Có ít nhất 1 chữ số", ok: /\d/.test(nw) },
    { id: "sym", label: "Có ký tự đặc biệt (!@#…)", ok: /[^A-Za-z0-9]/.test(nw) },
    { id: "diff", label: "Khác mật khẩu hiện tại", ok: nw.length > 0 && nw !== cur },
  ];
  const score = rules.filter((r) => r.ok).length;
  const strengthLabel = nw.length === 0 ? "" : score <= 2 ? "Yếu" : score === 3 ? "Trung bình" : score === 4 ? "Khá mạnh" : "Mạnh";
  const strengthTone = score <= 2 ? "bg-[#FF5C5C]" : score === 3 ? "bg-[#FFB547]" : score === 4 ? "bg-sky-500" : "bg-[#00C9A7]";
  const canSubmit = cur.length > 0 && rules.every((r) => r.ok) && nw === cf && !pwSubmitting;
  const [saved, setSaved] = useState(false);
  const resetForm = () => { setCur(""); setNw(""); setCf(""); setSaved(false); setPwError(null); setPwSubmitting(false); setShowCur(false); setShowNw(false); setShowCf(false); };
  const handleChangePassword = async () => {
    if (!canSubmit) return;
    setPwSubmitting(true);
    setPwError(null);
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("gymos_token")}` },
        body: JSON.stringify({ oldPassword: cur, newPassword: nw }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPwError(data.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.");
        setPwSubmitting(false);
        return;
      }
      setSaved(true);
      setPwSubmitting(false);
    } catch {
      setPwError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      setPwSubmitting(false);
    }
  };
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
            <div className={cn("size-8 rounded-lg grid place-items-center text-white text-[12px] font-semibold bg-gradient-to-br", meta.tone)}>
              {initials}
            </div>
            <div className="leading-tight text-left">
              <div className="text-[12.5px] font-medium">Xin chào, {firstName}</div>
              <div className="text-[10.5px] text-muted-foreground">{meta.name}</div>
            </div>
            <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 rounded-xl bg-popover border border-border shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-border/60 flex items-center gap-2.5">
                  <div className={cn("size-9 rounded-lg grid place-items-center text-white text-[12px] font-semibold bg-gradient-to-br", meta.tone)}>
                    {initials}
                  </div>
                  <div className="leading-tight">
                    <div className="text-[12.5px] font-medium">{personName}</div>
                    <div className="text-[10.5px] text-muted-foreground">{meta.name}</div>
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
            <Button icon={CheckCircle2} disabled={!canSubmit || pwSubmitting}
              onClick={handleChangePassword}>{pwSubmitting ? "Đang lưu…" : "Lưu thay đổi"}</Button>
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
              { label: "Mật khẩu mới", v: nw, set: setNw, show: showNw, toggle: () => setShowNw(!showNw), key: "nw" },
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
            {pwError && (
              <div className="text-[12px] text-[#991B1B] dark:text-[#FFA0A0] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FF5C5C]/10 border border-[#FF5C5C]/30">
                <AlertTriangle className="size-3.5" /> {pwError}
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

function Login({ onEnter, theme, onToggleTheme }: { onEnter: (role: Role, user?: any) => void; theme: "light" | "dark"; onToggleTheme: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.");
        setLoading(false);
        return;
      }
      const rawRole = data.data.user.role;
      const normalizedRole = rawRole === "manager" ? "staff" : rawRole === "pt" ? "trainer" : rawRole;
      localStorage.setItem("gymos_token", data.data.token);
      localStorage.setItem("gymos_user", JSON.stringify(data.data.user));
      onEnter(normalizedRole, data.data.user);
    } catch (err) {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      setLoading(false);
    }
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
            <Button className="w-full h-11 justify-center" disabled={loading} onClick={submit} icon={ArrowRight}>{loading ? "Đang xử lý..." : "Đăng nhập"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeWidgets({ role, user }: { role: Role; user?: any }) {
  const navigate = useNavigate();
  const setView = (v: string) => navigate(v === "home" ? "/" : "/" + v.replace(/\./g, "/"));
  
  const [memberStats, setMemberStats] = useState<any>(null);
  const [trainerStats, setTrainerStats] = useState<any>(null);
  const [ownerStats, setOwnerStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem("gymos_token");
    if (role === "member") {
      fetch("http://localhost:5000/api/v1/workout-logs/summary", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMemberStats(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    } else if (role === "trainer") {
      fetch("http://localhost:5000/api/v1/members/my-students/stats", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrainerStats(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    } else {
      fetch("http://localhost:5000/api/v1/reports/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOwnerStats(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    }
  }, [role]);

  const widgets: Record<Role, { icon: any; title: string; desc: string; view: string; tone: string }[]> = {
    owner: [
      { icon: Users, title: "Quản lý nhân sự", desc: "Danh sách, chấm công, đánh giá nhân sự", view: "staff", tone: "from-[#6C63FF]/20 to-transparent" },
      { icon: LayoutGrid, title: "Quản lý gói tập", desc: "Thiết kế và quản lý gói dịch vụ", view: "packages", tone: "from-[#00C9A7]/20 to-transparent" },
      { icon: Building2, title: "Quản lý phòng tập", desc: "Các khu vực và thiết bị trong phòng", view: "rooms", tone: "from-[#FFB547]/20 to-transparent" },
      { icon: Dumbbell, title: "Quản lý thiết bị", desc: "Theo dõi loại, lịch sử bảo trì", view: "equipment", tone: "from-[#FF5C5C]/20 to-transparent" },
      { icon: MessageSquare, title: "Phản hồi hội viên", desc: "Xử lý phản hồi và yêu cầu hỗ trợ", view: "feedback", tone: "from-sky-500/20 to-transparent" },
      { icon: BarChart3, title: "Báo cáo thống kê", desc: "Doanh thu, hội viên, nhân sự", view: "reports", tone: "from-violet-500/20 to-transparent" },
    ],
    staff: [
      { icon: Users, title: "Danh sách hội viên", desc: "Tra cứu, sửa, gia hạn hội viên", view: "members", tone: "from-[#6C63FF]/20 to-transparent" },
      { icon: UserPlus, title: "Thêm hội viên", desc: "Tạo hội viên mới + thanh toán", view: "members.new", tone: "from-[#00C9A7]/20 to-transparent" },
      { icon: MessageSquare, title: "Phản hồi hội viên", desc: "Tiếp nhận và phản hồi yêu cầu", view: "feedback", tone: "from-[#FFB547]/20 to-transparent" },
      { icon: Wrench, title: "Bảo trì thiết bị", desc: "Gửi và theo dõi yêu cầu bảo trì", view: "maintenance", tone: "from-[#FF5C5C]/20 to-transparent" },
    ],
    trainer: [
      { icon: Users, title: "Học viên của tôi", desc: "Xem và quản lý danh sách học viên", view: "students", tone: "from-[#FFB547]/20 to-transparent" },
      { icon: CreditCard, title: "Gia hạn gói tập", desc: "Gia hạn gói tập cho học viên", view: "renew", tone: "from-[#6C63FF]/20 to-transparent" },
    ],
    member: [
      { icon: CreditCard, title: "Gia hạn gói tập", desc: "Đăng ký hoặc gia hạn gói hiện tại", view: "renew", tone: "from-[#6C63FF]/20 to-transparent" },
      { icon: CalIcon, title: "Lịch sử tập luyện", desc: "Xem lại các buổi tập đã check in", view: "history", tone: "from-[#00C9A7]/20 to-transparent" },
      { icon: Receipt, title: "Lịch sử thanh toán", desc: "Kiểm tra các hóa đơn và biên lai", view: "mpayments", tone: "from-sky-500/20 to-transparent" },
      { icon: MessageSquare, title: "Gửi phản hồi", desc: "Đóng góp ý kiến cho phòng tập", view: "mfeedback", tone: "from-[#FFB547]/20 to-transparent" },
    ],
  };

  const stats = useMemo(() => {
    if (role === "member") {
      if (loading) return [
        { icon: Dumbbell, label: "Buổi tập còn lại", value: "...", tone: "violet" },
        { icon: Activity, label: "Tổng số buổi tập", value: "...", tone: "emerald" },
        { icon: TrendingUp, label: "Chuỗi tập liên tiếp", value: "...", tone: "amber" }
      ];
      return [
        { icon: Dumbbell, label: "Buổi tập còn lại", value: memberStats?.activePlan?.SubscriptionPackage?.packageType === "time" ? "Không giới hạn" : (memberStats?.activePlan?.remainingSessions ?? 0), tone: "violet" },
        { icon: Activity, label: "Tổng số buổi tập", value: memberStats?.totalSessions ?? 0, tone: "emerald" },
        { icon: TrendingUp, label: "Chuỗi tập liên tiếp", value: `${memberStats?.streak ?? 0} ngày`, tone: "amber" }
      ];
    }
    if (role === "trainer") {
      if (loading) return [
        { icon: Users, label: "Tổng học viên", value: "...", tone: "violet" },
        { icon: CheckCircle2, label: "Đang hoạt động", value: "...", tone: "emerald" },
        { icon: AlertTriangle, label: "Sắp hết hạn", value: "...", tone: "amber" }
      ];
      return [
        { icon: Users, label: "Tổng học viên", value: trainerStats?.totalStudents ?? 0, tone: "violet" },
        { icon: CheckCircle2, label: "Đang hoạt động", value: trainerStats?.activeStudents ?? 0, tone: "emerald" },
        { icon: AlertTriangle, label: "Sắp hết hạn", value: trainerStats?.expiringSoon ?? 0, tone: "amber" },
      ];
    }
    
    if (role === "staff") {
      if (loading) return [
        { icon: Activity, label: "Check in hôm nay", value: "...", tone: "emerald" },
        { icon: MessageSquare, label: "Phản hồi chờ xử lý", value: "...", tone: "violet" },
        { icon: Wrench, label: "Yêu cầu bảo trì mở", value: "...", tone: "amber" },
      ];
      return [
        { icon: Activity, label: "Check in hôm nay", value: ownerStats?.checkInCount ?? 0, tone: "emerald" },
        { icon: MessageSquare, label: "Phản hồi chờ xử lý", value: ownerStats?.pendingFeedbackCount ?? 0, tone: "violet" },
        { icon: Wrench, label: "Yêu cầu bảo trì mở", value: ownerStats?.openMaintenanceCount ?? 0, tone: "amber" },
      ];
    }
    
    if (loading) return [
      { icon: Activity, label: "Check in hôm nay", value: "...", tone: "emerald" },
      { icon: TrendingUp, label: "Doanh thu hôm nay", value: "...", tone: "violet" },
      { icon: Wrench, label: "Yêu cầu bảo trì mở", value: "...", tone: "amber" },
    ];
    
    return [
      { icon: Activity, label: "Check in hôm nay", value: ownerStats?.checkInCount ?? 0, tone: "emerald" },
      { icon: TrendingUp, label: "Doanh thu hôm nay", value: ownerStats?.todayRevenue ?? "0", tone: "violet" },
      { icon: Wrench, label: "Yêu cầu bảo trì mở", value: ownerStats?.openMaintenanceCount ?? 0, tone: "amber" },
    ];
  }, [role, memberStats, trainerStats, ownerStats, loading]);

  const me = ROLE_META[role] || ROLE_META["member"];
  const personName = user?.name || me.person;
  const firstName = personName.split(" ").pop();
  
  // Format current date in Vietnamese
  const today = new Date();
  const dateStr = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(today);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/30 p-8">
        <div className="relative space-y-6">
          <div className="space-y-3">
            <Badge tone="violet">{me.name}</Badge>
            <h1 className="font-display text-[32px] font-bold tracking-tight leading-tight">
              Xin chào, {firstName} 👋
            </h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Hôm nay là <span className="text-foreground">{dateStr}</span>. Chúc bạn một ngày {role === "member" ? "tập luyện năng suất" : "làm việc hiệu quả"} tại GymOS.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.map((s) => (
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

function StaffForm({ data, onSubmit, onCancel, loading }: { data?: StaffRecord; onSubmit?: (data: any) => void; onCancel?: () => void; loading?: boolean }) {
  const isEdit = !!data;
  const [formData, setFormData] = useState({
    code: "",
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

  const validate = () => {
    if (formData.name.trim().length < 2) {
      toast.error("Họ tên phải có ít nhất 2 ký tự");
      return false;
    }
    if (!/^[a-zA-Z\s\u00C0-\u1EF9]+$/i.test(formData.name.trim())) {
      toast.error("Họ tên không hợp lệ (chỉ chứa chữ cái)");
      return false;
    }
    if (new Date(formData.dateOfBirth) > new Date()) {
      toast.error("Ngày sinh không thể là ngày trong tương lai");
      return false;
    }
    if (!/^0\d{9}$/.test(formData.phone.trim())) {
      toast.error("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0");
      return false;
    }
    return true;
  };

  const needsAccount = true;

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (validate()) onSubmit?.(formData); }} className="grid grid-cols-2 gap-4">
      {isEdit ? (
        <Field label="Mã nhân sự">
          <Input value={data!.code} readOnly className="bg-muted opacity-70" />
        </Field>
      ) : (
        <Field label="Mã nhân sự" hint="Để trống để hệ thống tự tạo mã">
          <Input placeholder="VD: NS1001" value={formData.code} onChange={(e: any) => handleChange("code", e.target.value)} />
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
        <SearchableSelect
          value={formData.role}
          onChange={(e: any) => handleChange("role", e.target.value)}
          options={[
            { value: "Nhân viên quản lý", label: "Nhân viên quản lý" },
            { value: "Huấn luyện viên", label: "Huấn luyện viên" },
            { value: "Chủ phòng tập", label: "Chủ phòng tập" },
          ]}
        />
      </Field>
      {needsAccount && (
        <>
          <Field label={<>Email đăng nhập<Req /></>}>
            <Input icon={Mail} type="email" placeholder="email@gymos.vn" autoComplete="new-password" value={formData.email} onChange={(e: any) => handleChange("email", e.target.value)} required={!isEdit} />
          </Field>
          <Field label={<>{isEdit ? "Đặt lại mật khẩu" : "Mật khẩu"}</>} hint={isEdit ? "Để trống nếu không đổi" : "Mặc định 123456 nếu để trống"}>
            <Input icon={Lock} type="password" placeholder="••••••••" autoComplete="new-password" value={formData.password} onChange={(e: any) => handleChange("password", e.target.value)} />
          </Field>
        </>
      )}
      {isEdit && (
        <Field label={<>Trạng thái<Req /></>}>
          <SearchableSelect
            value={formData.status}
            onChange={(e: any) => handleChange("status", e.target.value)}
            options={[
              { value: "Đang làm", label: "Đang làm" },
              { value: "Nghỉ phép", label: "Nghỉ phép" },
              { value: "Đã thôi việc", label: "Đã thôi việc" },
              { value: "Đã vô hiệu hóa", label: "Đã vô hiệu hóa" },
            ]}
          />
        </Field>
      )}

      {/* Footer actions built into form */}
      <div className="col-span-2 flex items-center justify-end gap-2 pt-4 mt-2 border-t border-border">
        <Button variant="ghost" type="button" onClick={onCancel}>Hủy</Button>
        <Button icon={CheckCircle2} type="submit" disabled={loading}>{loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Lưu nhân sự"}</Button>
      </div>
    </form>
  );
}

/* ── Staff list ── */
function StaffList({ staffs, refresh, onSelect, onEdit = () => { } }: { staffs: StaffRecord[]; refresh: () => void; onSelect: (id: string) => void; onEdit?: (code: string) => void }) {
  const [modal, setModal] = useState<"new" | "del" | null>(null);
  const [delTarget, setDelTarget] = useState<StaffRecord | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"Tất cả" | "Nhân viên quản lý" | "Huấn luyện viên">("Tất cả");
  const [page, setPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 6;

  const activeStaffs = staffs.filter((s) => s.status !== "Đã vô hiệu hóa");

  const filtered = activeStaffs.filter((s) => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""));
    const matchR = roleFilter === "Tất cả" || s.role === roleFilter;
    return matchQ && matchR;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-5">
      <SectionTitle title="Danh sách nhân sự" sub={`Hiển thị ${filtered.length} / ${activeStaffs.length} nhân sự`} actions={
        <>
          <Button icon={Plus} onClick={() => setModal("new")}>Thêm nhân sự</Button>
        </>
      } />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-md flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
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
            <button key={c} onClick={() => { setRoleFilter(c); setPage(1); }} className={cn(
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
            <Button variant="outline" className="mt-4" onClick={() => { setQuery(""); setRoleFilter("Tất cả"); setPage(1); }}>Xóa bộ lọc</Button>
          </div>
        ) : (
          <>
            <DataTable
              head={["Mã NS", "Họ tên", "Role", "Email", "SĐT", "Ngày vào", "Trạng thái", ""]}
              rows={paginated.map((s) => [
                <span className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{s.code}</span>,
                <button onClick={() => onSelect(s.code)} className="flex items-center gap-2.5 text-left hover:text-[#4F46E5] dark:text-[#A8A2FF]">
                  <div className="size-7 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#3F39C7] grid place-items-center text-[10.5px] text-white font-semibold">
                    {s.name.split(" ").slice(-2).map(n => n[0]).join("")}
                  </div>
                  <span className="font-medium">{s.name}</span>
                </button>,
                <Badge tone={s.role.includes("Chủ") ? "violet" : s.role.includes("Nhân") ? "emerald" : s.role.includes("Huấn") ? "amber" : "sky"}>{s.role}</Badge>,
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
            <Pagination total={filtered.length} page={page} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal open={modal === "new"} onClose={() => setModal(null)} title="Thêm nhân sự mới" wide>
        <StaffForm
          onCancel={() => setModal(null)}
          loading={isSubmitting}
          onSubmit={async (data) => {
            setIsSubmitting(true);
            try {
              const res = await fetch("http://localhost:5000/api/v1/staffs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              const resData = await res.json();
              if (resData.success) {
                toast.success("Thêm nhân sự thành công");
                refresh();
                setModal(null);
              } else {
                toast.error(resData.message || "Lỗi khi thêm nhân sự");
              }
            } catch (e) {
              toast.error("Lỗi kết nối máy chủ");
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      </Modal>

      <Modal open={modal === "del"} onClose={() => setModal(null)} title="Xác nhận xóa"
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Hủy</Button><Button variant="danger" icon={Trash2} disabled={isSubmitting} onClick={async () => {
          if (delTarget) {
            setIsSubmitting(true);
            try {
              const res = await fetch(`http://localhost:5000/api/v1/staffs/${delTarget.code}`, { method: "DELETE" });
              const resData = await res.json();
              if (resData.success) {
                toast.success("Xóa nhân sự thành công");
                refresh();
                setModal(null);
              } else {
                toast.error(resData.message || "Lỗi khi xóa nhân sự");
              }
            } catch {
              toast.error("Lỗi kết nối máy chủ");
            } finally {
              setIsSubmitting(false);
            }
          }
        }}>{isSubmitting ? "Đang xóa..." : "Xác nhận xóa"}</Button></>}>
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

function Pagination({ total = 32, page = 1, pageSize = 6, onPageChange }: { total?: number; page?: number; pageSize?: number; onPageChange?: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-5 py-4 text-[12.5px] text-muted-foreground">
      <div>Hiển thị {start}–{end} trên {total} kết quả</div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange?.(page - 1)}
          disabled={page === 1}
          className="size-8 grid place-items-center rounded-md text-[12.5px] hover:bg-accent border border-border disabled:opacity-50 disabled:cursor-not-allowed"
        >‹</button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange?.(p)}
            className={cn("size-8 grid place-items-center rounded-md text-[12.5px]",
              p === page ? "bg-[#6C63FF] text-white border-transparent" : "hover:bg-accent border border-border")}
          >{p}</button>
        ))}
        <button
          onClick={() => onPageChange?.(page + 1)}
          disabled={page === totalPages}
          className="size-8 grid place-items-center rounded-md text-[12.5px] hover:bg-accent border border-border disabled:opacity-50 disabled:cursor-not-allowed"
        >›</button>
      </div>
    </div>
  );
}

/* ── Staff Detail ── */
function StaffDetail({ id, staffs, refresh, onBack, onEdit = () => { } }: { id: string; staffs: StaffRecord[]; refresh: () => void; onBack: () => void; onEdit?: (code: string) => void }) {
  const s = staffs.find((x) => x.code === id);
  if (!s) return <div className="text-center p-10 text-muted-foreground">Không tìm thấy nhân viên.</div>;
  const [delOpen, setDelOpen] = useState(false);
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOffset = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const monthNames = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const [days, setDays] = useState<string[]>([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/v1/staffs/${id}/attendance?month=${calMonth + 1}&year=${calYear}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          const logs = res.data;
          const newDays = Array(daysInMonth).fill("");

          const now = new Date();
          const isCurrentMonth = now.getMonth() === calMonth && now.getFullYear() === calYear;
          const isPastMonth = calYear < now.getFullYear() || (calYear === now.getFullYear() && calMonth < now.getMonth());
          const maxDayToCheck = isPastMonth ? daysInMonth : (isCurrentMonth ? now.getDate() : 0);

          let startDayToCheck = 0;
          if (s && s.join && s.join !== "Chưa cập nhật") {
            const [d, m, y] = s.join.split("/");
            const joinY = Number(y);
            const joinM = Number(m) - 1;
            const joinD = Number(d);
            if (calYear < joinY || (calYear === joinY && calMonth < joinM)) {
              startDayToCheck = daysInMonth;
            } else if (calYear === joinY && calMonth === joinM) {
              startDayToCheck = joinD - 1;
            }
          }

          for (let i = startDayToCheck; i < maxDayToCheck; i++) {
            newDays[i] = "absent";
          }

          logs.forEach((log: any) => {
            const date = new Date(log.workDate);
            const dayIndex = date.getDate() - 1;
            const dayOfWeek = date.getDay();

            let isLate = false;
            if (log.checkInTime) {
              const [hours, minutes] = log.checkInTime.split(':').map(Number);
              const timeInMinutes = hours * 60 + minutes;

              let limitMinutes = 8 * 60; // 08:00 for Sat, Sun
              if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                limitMinutes = 6 * 60 + 30; // 06:30 for Mon-Fri
              }

              if (timeInMinutes > limitMinutes) {
                isLate = true;
              }
            }

            newDays[dayIndex] = isLate ? "late" : "ok";
          });

          setDays(newDays);
        }
      });
  }, [id, calMonth, calYear, daysInMonth, s]);

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
              ["Email", s.email || "Chưa cập nhật", Mail],
              ["Số điện thoại", s.phone || "Chưa cập nhật", Phone],
              ["Ngày sinh", s.dateOfBirth ? s.dateOfBirth.split("-").reverse().join("/") : "Chưa cập nhật", CalIcon],
              ["Địa chỉ", s.address || "Chưa cập nhật", Building2],
              ["Ngày vào làm", s.join || "Chưa cập nhật", ShieldCheck],
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
              { k: "Đi chưa đủ giờ", v: lateCount, tone: "amber" },
              { k: "Vắng", v: absentCount, tone: "red" },
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
  const [recent, setRecent] = useState<{ code: string; name: string; time: string; kind: "in" | "out" }[]>([]);

  const fetchRecent = () => {
    fetch("http://localhost:5000/api/v1/staff-work-logs/today", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("gymos_token")}` }
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          const logs: { code: string; name: string; time: string; kind: "in" | "out" }[] = [];
          res.data.forEach((log: any) => {
            if (log.checkOutTime) {
              logs.push({ code: log.Staff.staffCode, name: log.Staff.staffName, time: log.checkOutTime.substring(0, 5), kind: "out" });
            }
            if (log.checkInTime) {
              logs.push({ code: log.Staff.staffCode, name: log.Staff.staffName, time: log.checkInTime.substring(0, 5), kind: "in" });
            }
          });
          // Sort descending
          logs.sort((a, b) => b.time.localeCompare(a.time));
          setRecent(logs);
        }
      });
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const suggestions = query.trim().length === 0
    ? []
    : staffs.filter((s) =>
      (s.status === "Đang làm" || s.status === "Nghỉ phép") &&
      (s.code.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 6);

  const doCheck = async (s: StaffRecord) => {
    const last = recent.find((r) => r.code === s.code);
    const isCheckingOut = last?.kind === "in";
    const url = isCheckingOut
      ? "http://localhost:5000/api/v1/staff-work-logs/check-out"
      : "http://localhost:5000/api/v1/staff-work-logs/check-in";
    const method = isCheckingOut ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("gymos_token")}`
        },
        body: JSON.stringify({ code: s.code })
      });
      const data = await res.json();
      if (data.success) {
        fetchRecent();
        setPicked(null); setQuery("");
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ");
    }
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
                        <Badge tone={s.role.includes("Chủ") ? "violet" : s.role.includes("Nhân") ? "emerald" : s.role.includes("Huấn") ? "amber" : "sky"}>{s.role}</Badge>
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
                  { d: "Thứ 7", in: "08:00", out: "20:00" },
                  { d: "Chủ Nhật", in: "08:00", out: "12:00" },
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
  const [code, setCode] = useState((data as any)?.code ?? "");
  const [name, setName] = useState(data?.name ?? "");
  const numMatch = data?.type.match(/\d+/)?.[0] ?? "";
  const [num, setNum] = useState(numMatch);

  const initialUnit = data ? (data.type.includes("tháng") ? "month" : data.type.includes("tuần") ? "week" : data.type.includes("ngày") ? "day" : "month") : "month";
  const [unit, setUnit] = useState(initialUnit);

  const [price, setPrice] = useState(data ? data.price.toLocaleString("vi-VN") : "");
  const [vip, setVip] = useState(data?.vip ?? false);
  const [trainer, setTrainer] = useState(data?.trainer ?? false);
  const [status, setStatus] = useState(data?.status ?? "Đang kinh doanh");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !num || !price) return;
    const finalType = pkgType === "session" ? `${num} buổi` : `${num} ${unit === "month" ? "tháng" : unit === "week" ? "tuần" : "ngày"}`;
    onSubmit(e, {
      code,
      name,
      type: finalType,
      vip,
      trainer,
      price: parseInt(price.replace(/\D/g, "") || "0"),
      status
    } as any);
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
        <Field label={<>Mã gói<Req /></>}>
          <Input placeholder="VD: GP-001" value={code} onChange={(e: any) => setCode(e.target.value)} required />
        </Field>
        <Field label={<>Tên gói tập<Req /></>}>
          <Input placeholder={pkgType === "session" ? "VD: Gym Pro 24 buổi" : "VD: Gym Pro 6 tháng"} value={name} onChange={(e: any) => setName(e.target.value)} required />
        </Field>
        {pkgType === "session" ? (
          <Field label={<>Số buổi<Req /></>}><Input placeholder="VD: 24" type="text" inputMode="numeric" value={num} onChange={(e: any) => setNum(e.target.value.replace(/\D/g, ""))} required /></Field>
        ) : (
          <Field label={<>Thời hạn<Req /></>}>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input placeholder="VD: 6" type="text" inputMode="numeric" value={num} onChange={(e: any) => setNum(e.target.value.replace(/\D/g, ""))} required />
              <SearchableSelect
                value={unit}
                onChange={(e: any) => setUnit(e.target.value)}
                options={[
                  { value: "month", label: "Tháng" },
                  { value: "week", label: "Tuần" },
                  { value: "day", label: "Ngày" },
                ]}
              />
            </div>
          </Field>
        )}
        <Field label={<>Giá (VND)<Req /></>}><Input placeholder="VD: 2.400.000" value={price} onChange={(e: any) => {
          const raw = e.target.value.replace(/\D/g, "");
          setPrice(raw ? parseInt(raw, 10).toLocaleString("vi-VN") : "");
        }} required /></Field>
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
            else t = `${d.duration || 0} ${d.durationUnit || "tháng"}`;
            return {
              id: d.packageId,
              code: d.packageCode || "",
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPackageCode = (p: any) => p.code || `PKG-${p.id.split('-')[0].toUpperCase()}`;
  const filtered = list.filter((p) => {
    const displayCode = getPackageCode(p);
    return (statusFilter === "Tất cả" || p.status === statusFilter) &&
      (typeFilter === "Tất cả" || (typeFilter === "session" ? /buổi/i.test(p.type) : !/buổi/i.test(p.type))) &&
      (!filterVip || p.vip) &&
      (!filterTrainer || p.trainer) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) || displayCode.toLowerCase().includes(query.toLowerCase()));
  });
  const viewing = viewId ? list.find((p) => p.id === viewId) : null;
  const editing = editId ? list.find((p) => p.id === editId) : null;
  const deleting = deleteId ? list.find((p) => p.id === deleteId) : null;

  const handleAdd = async (e: React.FormEvent, data: Omit<PackageRecord, "id">) => {
    setIsSubmitting(true);
    const isSession = data.type.includes("buổi");
    const num = parseInt(data.type.replace(/\D/g, "") || "0");
    let durationUnit = "tháng";
    if (!isSession) {
      if (data.type.includes("tuần")) durationUnit = "tuần";
      else if (data.type.includes("ngày")) durationUnit = "ngày";
    }
    const payload = {
      packageCode: (data as any).code || "",
      packageName: data.name,
      packageType: isSession ? "session" : "duration",
      numberOfWorkout: isSession ? num : null,
      duration: !isSession ? num : null,
      durationUnit: !isSession ? durationUnit : null,
      vipIncluded: data.vip,
      trainerIncluded: data.trainer,
      price: data.price,
      status: data.status
    };
    try {
      const res = await fetch("http://localhost:5000/api/v1/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success("Thêm gói tập thành công");
        fetchPackages();
        setOpen(false);
      } else {
        toast.error(resData.message || "Lỗi khi thêm gói tập");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent, data: Omit<PackageRecord, "id">) => {
    if (!editId) return;
    setIsSubmitting(true);
    const isSession = data.type.includes("buổi");
    const num = parseInt(data.type.replace(/\D/g, "") || "0");
    let durationUnit = "tháng";
    if (!isSession) {
      if (data.type.includes("tuần")) durationUnit = "tuần";
      else if (data.type.includes("ngày")) durationUnit = "ngày";
    }
    const payload = {
      packageCode: (data as any).code || "",
      packageName: data.name,
      packageType: isSession ? "session" : "duration",
      numberOfWorkout: isSession ? num : null,
      duration: !isSession ? num : null,
      durationUnit: !isSession ? durationUnit : null,
      vipIncluded: data.vip,
      trainerIncluded: data.trainer,
      price: data.price,
      status: data.status
    };
    try {
      const res = await fetch(`http://localhost:5000/api/v1/packages/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success("Cập nhật gói tập thành công");
        fetchPackages();
        setEditId(null);
      } else {
        toast.error(resData.message || "Lỗi khi cập nhật");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/packages/${deleteId}`, {
        method: "DELETE"
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success("Xóa gói tập thành công");
        fetchPackages();
        setDeleteId(null);
      } else {
        toast.error(resData.message || "Lỗi khi xóa gói tập");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Quản lý gói tập" sub={`${list.length} gói dịch vụ — ${list.filter(p => p.status === "Đang kinh doanh").length} đang kinh doanh`}
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Thêm gói tập</Button>} />
      <div className="flex flex-wrap items-center gap-3">
        <Input icon={Search} placeholder="Tìm theo tên gói…" className="max-w-xs" value={query} onChange={(e: any) => setQuery(e.target.value)} />
        <SearchableSelect
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="w-[180px]"
          options={[
            { value: "Tất cả", label: "Tất cả trạng thái" },
            { value: "Đang kinh doanh", label: "Đang kinh doanh" },
            { value: "Ngừng kinh doanh", label: "Ngừng kinh doanh" },
          ]}
        />
        <SearchableSelect
          value={typeFilter}
          onChange={(e: any) => setTypeFilter(e.target.value)}
          className="w-[180px]"
          options={[
            { value: "Tất cả", label: "Tất cả loại" },
            { value: "session", label: "Theo số buổi" },
            { value: "duration", label: "Theo thời gian" },
          ]}
        />
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
                    <div className="font-mono text-[11px] text-muted-foreground" title={p.id}>{getPackageCode(p)}</div>
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
                <div className="font-mono text-[11px] text-muted-foreground" title={p.id}>{getPackageCode(p)}</div>
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
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button><Button type="submit" form="add-pkg-form" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : "Lưu gói tập"}</Button></>}>
        <PackageForm formId="add-pkg-form" onSubmit={handleAdd} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditId(null)} title={`Chỉnh sửa gói — ${editing?.name ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditId(null)}>Hủy</Button><Button type="submit" form="edit-pkg-form" icon={CheckCircle2} disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}</Button></>}>
        {editing && <PackageForm formId="edit-pkg-form" data={editing} onSubmit={handleEdit} />}
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewId(null)} title={`Chi tiết gói — ${viewing?.name ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setViewId(null)}>Đóng</Button><Button icon={Pencil} onClick={() => { const id = viewing!.id; setViewId(null); setEditId(id); }}>Chỉnh sửa</Button></>}>
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 rounded-xl bg-muted/40 border border-border/70">
              <div>
                <div className="font-mono text-[11px] text-muted-foreground" title={viewing.id}>{getPackageCode(viewing)}</div>
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
                ["Mã gói", `PKG-${viewing.id.split('-')[0].toUpperCase()}`],
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
            <p className="text-[14px]">Bạn có chắc chắn muốn xóa gói <span className="font-medium">{deleting.name}</span> ({getPackageCode(deleting)})?</p>
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

function RoomForm({ data, onSubmit, formId }: { data?: RoomRecord, onSubmit: (e: React.FormEvent, data: Omit<RoomRecord, "id"> & { code: string }) => void, formId?: string }) {
  const [code, setCode] = useState(data?.code ?? "");
  const [name, setName] = useState(data?.name ?? "");
  const [type, setType] = useState(data?.type ?? "Gym");
  const [status, setStatus] = useState(data?.status ?? "Hoạt động");

  return (
    <form id={formId} onSubmit={(e) => { e.preventDefault(); onSubmit(e, { code, name, type, status } as any); }}>
      <div className="grid grid-cols-2 gap-4">
        <Field label={<>Mã phòng<Req /></>}><Input placeholder="VD: PT06" value={code} onChange={(e: any) => setCode(e.target.value)} required /></Field>
        <Field label={<>Tên phòng<Req /></>}><Input placeholder="VD: Sảnh Gym B" value={name} onChange={(e: any) => setName(e.target.value)} required /></Field>
        <Field label={<>Loại phòng<Req /></>}>
          <SearchableSelect
            value={type}
            onChange={(e: any) => setType(e.target.value)}
            options={ROOM_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </Field>
        <Field label={<>Trạng thái<Req /></>}>
          <SearchableSelect
            value={status}
            onChange={(e: any) => setStatus(e.target.value)}
            options={ROOM_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </Field>
      </div>
    </form>
  );
}

function Rooms({ onSelect }: { onSelect?: (id: string) => void }) {
  const [list, setList] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);

  const fetchRooms = () => {
    Promise.all([
      fetch("http://localhost:5000/api/v1/rooms").then(res => res.json()),
      fetch("http://localhost:5000/api/v1/equipments").then(res => res.json()).catch(() => [])
    ]).then(([roomsRes, equipmentsRes]) => {
      if (Array.isArray(roomsRes)) {
        setList(roomsRes.map((r: any) => ({
          id: r.roomId,
          code: r.roomCode || `RM-${r.roomId.split('-')[0].toUpperCase()}`,
          name: r.roomName,
          type: r.roomType || "Gym",
          status: r.operatingStatus === "active" ? "Hoạt động" : (r.operatingStatus === "maintenance" ? "Bảo trì" : "Tạm đóng"),
          createdAt: r.createdAt || new Date().toISOString(),
        })));
      }
      if (Array.isArray(equipmentsRes)) {
        setEquipments(equipmentsRes);
      }
    });
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Tất cả");
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOrder = {
    "Hoạt động": 1,
    "Bảo trì": 2,
    "Tạm đóng": 3
  };

  const filtered = list.filter((r) =>
    (typeFilter === "Tất cả" || r.type === typeFilter) &&
    (statusFilter === "Tất cả" || r.status === statusFilter) &&
    (r.name.toLowerCase().includes(query.toLowerCase()) || r.code.toLowerCase().includes(query.toLowerCase()))
  ).sort((a, b) => {
    const diff = (statusOrder[a.status as keyof typeof statusOrder] || 99) - (statusOrder[b.status as keyof typeof statusOrder] || 99);
    if (diff !== 0) return diff;
    if (a.status === "Hoạt động") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });
  const editing = editId ? list.find((r) => r.id === editId) : null;
  const deleting = deleteId ? list.find((r) => r.id === deleteId) : null;
  const totalDevices = equipments.length;

  const mapStatusToBackend = (s: string) => s === "Hoạt động" ? "active" : (s === "Bảo trì" ? "maintenance" : "inactive");

  const handleAdd = async (e: React.FormEvent, data: any) => {
    if (!data.code?.trim() || !data.name?.trim() || !data.type || !data.status) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    if (list.some((r) => r.code.toLowerCase() === data.code.trim().toLowerCase())) {
      toast.error("Mã phòng đã tồn tại");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/v1/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: data.code, roomName: data.name, roomType: data.type, operatingStatus: mapStatusToBackend(data.status) })
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success("Thêm phòng tập thành công");
        fetchRooms();
        setOpen(false);
      } else {
        toast.error(resData.message || "Lỗi khi thêm phòng tập");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent, data: any) => {
    if (!data.code?.trim() || !data.name?.trim() || !data.type || !data.status) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    if (list.some((r) => r.id !== editId && r.code.toLowerCase() === data.code.trim().toLowerCase())) {
      toast.error("Mã phòng đã tồn tại");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/rooms/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: data.code, roomName: data.name, roomType: data.type, operatingStatus: mapStatusToBackend(data.status) })
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success("Cập nhật phòng tập thành công");
        fetchRooms();
        setEditId(null);
      } else {
        toast.error(resData.message || "Lỗi khi cập nhật");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/rooms/${deleteId}`, {
        method: "DELETE"
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success("Xóa phòng tập thành công");
        fetchRooms();
        setDeleteId(null);
      } else {
        toast.error(resData.message || "Lỗi khi xóa phòng tập");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Quản lý phòng tập" sub={`${list.length} khu vực, tổng ${totalDevices} thiết bị đang vận hành`}
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Thêm phòng tập</Button>} />
      <div className="flex flex-wrap items-center gap-3">
        <Input icon={Search} placeholder="Tìm theo tên hoặc mã phòng…" className="max-w-md" value={query} onChange={(e: any) => setQuery(e.target.value)} />
        <SearchableSelect
          value={typeFilter}
          onChange={(e: any) => setTypeFilter(e.target.value)}
          className="w-[180px]"
          options={[
            { value: "Tất cả", label: "Tất cả loại phòng" },
            ...ROOM_TYPES.map((t) => ({ value: t, label: t }))
          ]}
        />
        <SearchableSelect
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="w-[180px]"
          options={[
            { value: "Tất cả", label: "Tất cả trạng thái" },
            ...ROOM_STATUSES.map((s) => ({ value: s, label: s }))
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((r) => {
          const deviceCount = equipments.filter((e: any) => e.roomId === r.id || e.Room?.roomId === r.id).length;
          return (
            <Card key={r.id} className="group hover:border-[#6C63FF]/40 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-muted border border-border grid place-items-center">
                    <Building2 className="size-5 text-[#4F46E5] dark:text-[#A8A2FF]" />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] text-muted-foreground" title={r.id}>{r.code}</div>
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
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button><Button type="submit" form="add-room-form" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : "Lưu phòng tập"}</Button></>}>
        <RoomForm formId="add-room-form" onSubmit={handleAdd} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditId(null)} title={`Chỉnh sửa phòng — ${editing?.name ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditId(null)}>Hủy</Button><Button type="submit" form="edit-room-form" icon={CheckCircle2} disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}</Button></>}>
        {editing && <RoomForm formId="edit-room-form" data={editing} onSubmit={handleEdit} />}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleteId(null)} title="Xóa phòng tập"
        footer={<>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button icon={Trash2} disabled={isSubmitting} onClick={handleDelete}>{isSubmitting ? "Đang xóa..." : "Xóa phòng"}</Button>
        </>}>
        {deleting && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Bạn có chắc chắn muốn xóa phòng <span className="font-medium">{deleting.name}</span> ({deleting.code})?</p>
            <p className="text-[12.5px] text-muted-foreground">Hành động này sẽ chuyển trạng thái phòng tập và các thiết bị thuộc phòng này sang trạng thái "Đã vô hiệu hóa" và không thể hoàn tác từ giao diện. Hãy đảm bảo các thiết bị cần giữ lại đã được chuyển sang khu vực khác trước khi xóa.</p>
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
        <SearchableSelect
          defaultValue={data?.typeId ?? EQUIPMENT_TYPES[0].id}
          options={EQUIPMENT_TYPES.map((t) => ({ value: t.id, label: t.name }))}
        />
      </Field>
      <Field label={<>Mã thiết bị<Req /></>}><Input placeholder="VD: TB-602" value={data?.code} /></Field>
      <Field label={<>Vị trí trong phòng<Req /></>}><Input placeholder="VD: Hàng 2 — Slot 5" value={data?.pos} /></Field>
      <Field label={<>Tình trạng<Req /></>}>
        <SearchableSelect
          defaultValue={data?.status ?? "Hoạt động"}
          options={["Hoạt động", "Đang bảo trì", "Tạm ngưng"].map((s) => ({ value: s, label: s }))}
        />
      </Field>
    </div>
  );
}

type RoomDevice = { code: string; typeId: string; pos: string; status: string };

function RoomDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [room, setRoom] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      fetch("http://localhost:5000/api/v1/rooms").then(r => r.json()),
      fetch("http://localhost:5000/api/v1/equipments").then(r => r.json()).catch(() => []),
      fetch("http://localhost:5000/api/v1/equipment-types").then(r => r.json()).catch(() => []),
    ]).then(([roomsRes, equipmentsRes, typesRes]) => {
      if (Array.isArray(roomsRes)) setAllRooms(roomsRes);
      const found = Array.isArray(roomsRes) ? roomsRes.find((r: any) => r.roomId === id) : null;
      if (found) {
        setRoom({
          id: found.roomId,
          code: found.roomCode || `RM-${found.roomId.split('-')[0].toUpperCase()}`,
          name: found.roomName,
          type: found.roomType || "Gym",
          status: found.operatingStatus === "active" ? "Hoạt động" : found.operatingStatus === "maintenance" ? "Bảo trì" : "Tạm đóng",
          rawStatus: found.operatingStatus,
        });
      }
      if (Array.isArray(equipmentsRes)) {
        const roomDevices = equipmentsRes.filter((e: any) => e.roomId === id || e.Room?.roomId === id);
        setDevices(roomDevices.map((e: any, i: number) => ({
          equipmentId: e.equipmentId,
          code: e.equipmentCode || `TB-${e.equipmentId?.split('-')[0]?.toUpperCase()}`,
          typeName: e.EquipmentType?.equipmentName || "—",
          typeId: e.equipmentTypeId,
          pos: e.position || `Hàng ${Math.floor(i / 4) + 1} — Slot ${(i % 4) + 1}`,
          purchaseDate: e.purchaseDate ? new Date(e.purchaseDate).toLocaleDateString("en-GB") : "—",
          status: e.usageStatus === "active" || e.usageStatus === "Hoạt động" ? "Hoạt động"
            : e.usageStatus === "maintenance" || e.usageStatus === "Đang bảo trì" ? "Đang bảo trì"
              : e.usageStatus || "Hoạt động",
          rawStatus: e.usageStatus,
        })));
      }
      if (Array.isArray(typesRes)) setEquipmentTypes(typesRes);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, [id]);

  const [editRoom, setEditRoom] = useState(false);
  const [delRoom, setDelRoom] = useState(false);
  const [addDev, setAddDev] = useState(false);
  const [editDev, setEditDev] = useState<any | null>(null);
  const [delDev, setDelDev] = useState<any | null>(null);

  // Add device form state
  const [newDev, setNewDev] = useState({ typeId: "", code: "", pos: "", status: "Hoạt động" });

  const mapStatusToBackend = (s: string) => s === "Hoạt động" ? "active" : s === "Bảo trì" ? "maintenance" : "inactive";

  const handleEditRoom = (e: React.FormEvent, data: any) => {
    e.preventDefault();
    if (!data.code?.trim() || !data.name?.trim() || !data.type || !data.status) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    if (allRooms.some((r) => r.roomId !== id && (r.roomCode || `RM-${r.roomId.split('-')[0].toUpperCase()}`).toLowerCase() === data.code.trim().toLowerCase())) {
      toast.error("Mã phòng đã tồn tại");
      return;
    }
    fetch(`http://localhost:5000/api/v1/rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomCode: data.code, roomName: data.name, roomType: data.type, operatingStatus: mapStatusToBackend(data.status) })
    }).then(() => { fetchData(); setEditRoom(false); });
  };

  const handleDeleteRoom = () => {
    fetch(`http://localhost:5000/api/v1/rooms/${id}`, { method: "DELETE" })
      .then(() => { setDelRoom(false); onBack(); });
  };

  const handleAddDevice = () => {
    if (!newDev.typeId || !newDev.code) return;
    fetch("http://localhost:5000/api/v1/equipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        equipmentCode: newDev.code,
        equipmentTypeId: newDev.typeId,
        roomId: id,
        position: newDev.pos,
        usageStatus: newDev.status,
        isActive: true,
      })
    }).then(() => { fetchData(); setAddDev(false); setNewDev({ typeId: "", code: "", pos: "", status: "Hoạt động" }); });
  };

  const handleEditDevice = () => {
    if (!editDev) return;
    fetch(`http://localhost:5000/api/v1/equipments/${editDev.equipmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usageStatus: editDev.status, position: editDev.pos })
    }).then(() => { fetchData(); setEditDev(null); });
  };

  const handleDeleteDevice = () => {
    if (!delDev) return;
    fetch(`http://localhost:5000/api/v1/equipments/${delDev.equipmentId}`, { method: "DELETE" })
      .then(() => { fetchData(); setDelDev(null); });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">
      <div className="size-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin mr-3" />
      Đang tải thông tin phòng…
    </div>
  );
  if (!room) return <div className="text-center py-20 text-muted-foreground">Không tìm thấy phòng tập.</div>;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-[12.5px] text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ChevronRight className="size-3.5 rotate-180" /> Quay lại danh sách phòng tập
      </button>

      {/* Room header card */}
      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-xl bg-muted border border-border grid place-items-center">
              <Building2 className="size-6 text-[#4F46E5] dark:text-[#A8A2FF]" />
            </div>
            <div>
              <div className="font-mono text-[11px] text-muted-foreground">{room.code}</div>
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
            ["Mã phòng", room.code],
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

      {/* Devices in room */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display">Thiết bị trong phòng này</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">{devices.length} thiết bị đang được vận hành tại khu vực này.</p>
          </div>
          <Button icon={Plus} onClick={() => setAddDev(true)}>Thêm thiết bị vào phòng</Button>
        </div>

        <DataTable
          head={["Mã TB", "Tên loại", "Vị trí", "Ngày mua", "Trạng thái", "Hành động"]}
          rows={devices.map((d) => [
            <span key="c" className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{d.code}</span>,
            d.typeName,
            <span key="p" className="text-muted-foreground">{d.pos}</span>,
            <span key="dt" className="text-muted-foreground">{d.purchaseDate}</span>,
            <StatusPill key="s" value={d.status} />,
            <div key="a" className="flex items-center gap-1 justify-end">
              <IconBtn icon={Pencil} onClick={() => setEditDev({ ...d })} />
              <IconBtn icon={Trash2} tone="danger" onClick={() => setDelDev(d)} />
            </div>,
          ])}
        />
        {devices.length === 0 && (
          <div className="text-center text-muted-foreground py-8 text-[13px]">Chưa có thiết bị nào trong phòng này.</div>
        )}
      </Card>

      {/* ── Edit Room Modal ── */}
      <Modal open={editRoom} onClose={() => setEditRoom(false)} title={`Chỉnh sửa phòng — ${room.name}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditRoom(false)}>Hủy</Button><Button type="submit" form="room-detail-edit-form" icon={CheckCircle2}>Lưu thay đổi</Button></>}>
        <RoomForm formId="room-detail-edit-form" data={room} onSubmit={handleEditRoom} />
      </Modal>

      {/* ── Delete Room Modal ── */}
      <Modal open={delRoom} onClose={() => setDelRoom(false)} title="Xóa phòng tập"
        footer={<><Button variant="ghost" onClick={() => setDelRoom(false)}>Hủy</Button><Button icon={Trash2} onClick={handleDeleteRoom}>Xóa phòng</Button></>}>
        <div className="space-y-3">
          <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
          <p className="text-[14px]">Bạn có chắc chắn muốn xóa phòng <span className="font-medium">{room.name}</span> ({room.code})?</p>
          <p className="text-[12.5px] text-muted-foreground">{devices.length} thiết bị thuộc phòng này sẽ bị vô hiệu hóa. Hành động không thể hoàn tác từ giao diện.</p>
        </div>
      </Modal>

      {/* ── Add Device Modal ── */}
      <Modal open={addDev} onClose={() => setAddDev(false)} title="Thêm thiết bị vào phòng" wide
        footer={<><Button variant="ghost" onClick={() => setAddDev(false)}>Hủy</Button><Button icon={CheckCircle2} onClick={handleAddDevice}>Thêm thiết bị</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label={<>Loại thiết bị<Req /></>}>
            <SearchableSelect
              value={newDev.typeId}
              onChange={(e: any) => setNewDev({ ...newDev, typeId: e.target.value })}
              options={[
                { value: "", label: "-- Chọn loại thiết bị --" },
                ...equipmentTypes.map((t: any) => ({ value: t.equipmentTypeId, label: t.equipmentName }))
              ]}
            />
          </Field>
          <Field label={<>Mã thiết bị<Req /></>}><Input placeholder="VD: TB-602" value={newDev.code} onChange={(e: any) => setNewDev({ ...newDev, code: e.target.value })} /></Field>
          <Field label={<>Vị trí trong phòng</>}><Input placeholder="VD: Hàng 2 — Slot 5" value={newDev.pos} onChange={(e: any) => setNewDev({ ...newDev, pos: e.target.value })} /></Field>
          <Field label={<>Tình trạng<Req /></>}>
            <SearchableSelect
              value={newDev.status}
              onChange={(e: any) => setNewDev({ ...newDev, status: e.target.value })}
              options={["Hoạt động", "Đang bảo trì", "Tạm ngưng"].map((s) => ({ value: s, label: s }))}
            />
          </Field>
        </div>
      </Modal>

      {/* ── Edit Device Modal ── */}
      <Modal open={!!editDev} onClose={() => setEditDev(null)} title={`Chỉnh sửa thiết bị — ${editDev?.code ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditDev(null)}>Hủy</Button><Button icon={CheckCircle2} onClick={handleEditDevice}>Lưu thay đổi</Button></>}>
        {editDev && (
          <div className="grid grid-cols-2 gap-4">
            <Field label={<>Mã thiết bị</>}><Input value={editDev.code} readOnly /></Field>
            <Field label={<>Tên loại thiết bị</>}><Input value={editDev.typeName} readOnly /></Field>
            <Field label={<>Vị trí trong phòng</>}><Input placeholder="VD: Hàng 2 — Slot 5" value={editDev.pos} onChange={(e: any) => setEditDev({ ...editDev, pos: e.target.value })} /></Field>
            <Field label={<>Tình trạng<Req /></>}>
              <SearchableSelect
                value={editDev.status}
                onChange={(e: any) => setEditDev({ ...editDev, status: e.target.value })}
                options={["Hoạt động", "Đang bảo trì", "Tạm ngưng"].map((s) => ({ value: s, label: s }))}
              />
            </Field>
            <Field label={<>Ngày mua</>}><Input value={editDev.purchaseDate} readOnly /></Field>
          </div>
        )}
      </Modal>

      {/* ── Delete Device Modal ── */}
      <Modal open={!!delDev} onClose={() => setDelDev(null)} title="Xóa thiết bị khỏi phòng"
        footer={<><Button variant="ghost" onClick={() => setDelDev(null)}>Hủy</Button><Button icon={Trash2} onClick={handleDeleteDevice}>Xóa thiết bị</Button></>}>
        {delDev && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Bạn có chắc chắn muốn xóa thiết bị <span className="font-mono">{delDev.code}</span> ({delDev.typeName}) khỏi phòng <span className="font-medium">{room.name}</span>?</p>
            <p className="text-[12.5px] text-muted-foreground">Thiết bị sẽ bị vô hiệu hóa và không còn xuất hiện trong danh sách. Hành động không thể hoàn tác từ giao diện.</p>
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
        <SearchableSelect
          value={data?.category || "Cardio"}
          onChange={(e: any) => onChange({ ...data, category: e.target.value as any })}
          options={EQUIPMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
      </Field>
      <Field label={<>Hãng / Nhà sản xuất<Req /></>}><Input placeholder="VD: Matrix" value={data?.brand || ""} onChange={(e: any) => onChange({ ...data, brand: e.target.value })} /></Field>
      <Field label={<>Bảo hành (tháng)<Req /></>}><Input placeholder="VD: 24" type="text" inputMode="numeric" value={data?.warranty?.toString() || ""} onChange={(e: any) => { const raw = e.target.value.replace(/\D/g, ""); onChange({ ...data, warranty: raw ? parseInt(raw, 10) : 0 }) }} /></Field>
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
        <SearchableSelect
          value={data?.room || rooms[0]?.name}
          onChange={(e: any) => onChange({ ...data, room: e.target.value })}
          options={rooms.map((r) => ({ value: r.name, label: r.name }))}
        />
      </Field>
      <Field label={<>Ngày mua<Req /></>}><Input type="date" placeholder="DD/MM/YYYY" value={data?.purchased || ""} onChange={(e: any) => onChange({ ...data, purchased: e.target.value })} /></Field>
      <Field label={<>Trạng thái<Req /></>}>
        <SearchableSelect
          value={data?.status || "Hoạt động"}
          onChange={(e: any) => onChange({ ...data, status: e.target.value })}
          options={[
            { value: "Hoạt động", label: "Hoạt động" },
            { value: "Đang bảo trì", label: "Đang bảo trì" },
            { value: "Ngừng sử dụng", label: "Ngừng sử dụng" },
          ]}
        />
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
      if (Array.isArray(typesRes)) setTypes(typesRes.map((t: any) => ({ id: t.typeId, code: t.typeCode || "", name: t.equipmentName, category: t.category, brand: t.brand, warranty: t.warrantyDuration, desc: t.description })));
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddType = async () => {
    if (!typeForm.code?.trim() || !typeForm.name?.trim() || !typeForm.category || !typeForm.brand?.trim() || typeForm.warranty === undefined || typeForm.warranty === null || typeForm.warranty.toString().trim() === "" || !typeForm.desc?.trim()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/v1/equipment-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typeCode: typeForm.code, equipmentName: typeForm.name, category: typeForm.category, brand: typeForm.brand, warrantyDuration: typeForm.warranty, description: typeForm.desc })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Thêm loại thiết bị thành công");
        fetchEquipmentsData();
        setAddType(false);
      } else {
        toast.error(data.message || "Lỗi khi thêm loại thiết bị");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditType = async () => {
    if (!typeForm.code?.trim() || !typeForm.name?.trim() || !typeForm.category || !typeForm.brand?.trim() || typeForm.warranty === undefined || typeForm.warranty === null || typeForm.warranty.toString().trim() === "" || !typeForm.desc?.trim()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/equipment-types/${editTypeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typeCode: typeForm.code, equipmentName: typeForm.name, category: typeForm.category, brand: typeForm.brand, warrantyDuration: typeForm.warranty, description: typeForm.desc })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Cập nhật loại thiết bị thành công");
        fetchEquipmentsData();
        setEditTypeId(null);
      } else {
        toast.error(data.message || "Lỗi khi cập nhật");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteType = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/equipment-types/${deleteTypeId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Xóa loại thiết bị thành công");
        fetchEquipmentsData();
        setDeleteTypeId(null);
      } else {
        toast.error(data.message || "Lỗi khi xóa");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = async () => {
    if (!itemForm.code?.trim() || !itemForm.purchased?.trim()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    setIsSubmitting(true);
    try {
      const rId = rooms.find(r => r.name === (itemForm.room || rooms[0]?.name))?.id;
      const res = await fetch("http://localhost:5000/api/v1/equipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentCode: itemForm.code, typeId: addItemForType, roomId: rId, importDate: itemForm.purchased, usageStatus: itemForm.status || "Hoạt động" })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Thêm thiết bị thành công");
        fetchEquipmentsData();
        setAddItemForType(null);
      } else {
        toast.error(data.message || "Lỗi khi thêm thiết bị");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = async () => {
    if (!itemForm.code?.trim() || !itemForm.purchased?.trim()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    setIsSubmitting(true);
    try {
      const target = items.find(i => i.code === editItemCode);
      const rId = rooms.find(r => r.name === (itemForm.room || target?.room))?.id;
      const res = await fetch(`http://localhost:5000/api/v1/equipments/${target?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentCode: itemForm.code, roomId: rId, importDate: itemForm.purchased, usageStatus: itemForm.status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Cập nhật thiết bị thành công");
        fetchEquipmentsData();
        setEditItemCode(null);
      } else {
        toast.error(data.message || "Lỗi khi cập nhật");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    setIsSubmitting(true);
    try {
      const target = items.find(i => i.code === deleteItemCode);
      const res = await fetch(`http://localhost:5000/api/v1/equipments/${target?.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Xóa thiết bị thành công");
        fetchEquipmentsData();
        setDeleteItemCode(null);
      } else {
        toast.error(data.message || "Lỗi khi xóa");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <SearchableSelect
          value={catFilter}
          onChange={(e: any) => setCatFilter(e.target.value)}
          className="w-[180px]"
          options={[
            { value: "Tất cả", label: "Tất cả phân loại" },
            ...EQUIPMENT_CATEGORIES.map((c) => ({ value: c, label: c }))
          ]}
        />
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
        footer={<><Button variant="ghost" onClick={() => setAddType(false)}>Hủy</Button><Button disabled={isSubmitting} onClick={handleAddType}>{isSubmitting ? "Đang lưu..." : "Lưu loại thiết bị"}</Button></>}>
        <EquipmentTypeForm data={typeForm} onChange={setTypeForm} />
      </Modal>
      <Modal open={!!editingType} onClose={() => setEditTypeId(null)} title={`Chỉnh sửa loại — ${editingType?.name ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditTypeId(null)}>Hủy</Button><Button icon={CheckCircle2} disabled={isSubmitting} onClick={handleEditType}>{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}</Button></>}>
        {editingType && <EquipmentTypeForm data={typeForm} onChange={setTypeForm} />}
      </Modal>
      <Modal open={!!deletingType} onClose={() => setDeleteTypeId(null)} title="Xóa loại thiết bị"
        footer={<><Button variant="ghost" onClick={() => setDeleteTypeId(null)}>Hủy</Button>
          <Button icon={Trash2} disabled={isSubmitting} onClick={handleDeleteType}>{isSubmitting ? "Đang xóa..." : "Xóa loại"}</Button></>}>
        {deletingType && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Bạn có chắc chắn muốn xóa loại <span className="font-medium">{deletingType.name}</span> ({deletingType.code || deletingType.id})?</p>
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
                  <div className="font-mono text-[11px] text-muted-foreground">{viewingType.code || viewingType.id}</div>
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
                <Button icon={Plus} onClick={() => { setItemForm({ room: rooms[0]?.name ?? "", status: "Hoạt động" }); setAddItemForType(viewingType.id); }}>Thêm thiết bị</Button>
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
        footer={<><Button variant="ghost" onClick={() => setAddItemForType(null)}>Hủy</Button><Button disabled={isSubmitting} onClick={handleAddItem}>{isSubmitting ? "Đang lưu..." : "Lưu thiết bị"}</Button></>}>
        <EquipmentItemForm data={itemForm} onChange={setItemForm} roomList={rooms} />
      </Modal>
      <Modal open={!!editingItem} onClose={() => setEditItemCode(null)} title={`Chỉnh sửa thiết bị — ${editingItem?.code ?? ""}`} wide
        footer={<><Button variant="ghost" onClick={() => setEditItemCode(null)}>Hủy</Button><Button icon={CheckCircle2} disabled={isSubmitting} onClick={handleEditItem}>{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}</Button></>}>
        {editingItem && <EquipmentItemForm data={itemForm} onChange={setItemForm} roomList={rooms} />}
      </Modal>
      <Modal open={!!deletingItem} onClose={() => setDeleteItemCode(null)} title="Xóa thiết bị"
        footer={<><Button variant="ghost" onClick={() => setDeleteItemCode(null)}>Hủy</Button>
          <Button icon={Trash2} disabled={isSubmitting} onClick={handleDeleteItem}>{isSubmitting ? "Đang xóa..." : "Xóa thiết bị"}</Button></>}>
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMaintenance = async (code: string) => {
    const report = maintList.find(m => m.code === code);
    if (!report) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/equipment-reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolveStatus: "Đang xử lý" })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Bảo trì thiết bị thành công");
        fetchReports(); setViewId(null);
      } else {
        toast.error(data.message || "Lỗi cập nhật trạng thái");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (code: string) => {
    const report = maintList.find(m => m.code === code);
    if (!report) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/equipment-reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolveStatus: "Đã xử lý" })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Hoàn thành bảo trì thành công");
        fetchReports(); setViewId(null);
      } else {
        toast.error(data.message || "Lỗi cập nhật trạng thái");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const target = maintList.find(m => m.code === deleteMaint);
    if (!target) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/equipment-reports/${target.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Xóa yêu cầu thành công");
        fetchReports(); setDeleteMaint(null);
      } else {
        toast.error(data.message || "Lỗi khi xóa");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Xử lý bảo trì" sub="Theo dõi và cập nhật trạng thái yêu cầu bảo trì thiết bị" />
      <div className="grid grid-cols-4 gap-3">
        {[
          { k: "Chờ xử lý", v: maintList.filter((m) => m.status === "Chờ xử lý").length, tone: "amber" },
          { k: "Đang xử lý", v: maintList.filter((m) => m.status === "Đang xử lý").length, tone: "sky" },
          { k: "Đã xử lý", v: maintList.filter((m) => m.status === "Đã xử lý").length, tone: "emerald" },
          { k: "Tổng yêu cầu", v: maintList.length, tone: "violet" },
        ].map((s: any) => (
          <Card key={s.k}>
            <div className="text-[11px] uppercase text-muted-foreground tracking-wider">{s.k}</div>
            <div className="font-display font-bold text-[28px] mt-1">{s.v}</div>
            <Badge tone={s.tone}>Tháng này</Badge>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SearchableSelect
          value={maintStatus}
          onChange={(e: any) => setMaintStatus(e.target.value)}
          className="w-[180px]"
          options={[
            { value: "Tất cả", label: "Tất cả trạng thái" },
            { value: "Chờ xử lý", label: "Chờ xử lý" },
            { value: "Đang xử lý", label: "Đang xử lý" },
            { value: "Đã xử lý", label: "Đã xử lý" },
          ]}
        />
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
            <Button icon={ShieldCheck} disabled={isSubmitting} onClick={() => handleMaintenance(viewing.code)}>{isSubmitting ? "Đang xử lý..." : "Bảo trì thiết bị"}</Button>
          )}
          {viewing?.status === "Đang xử lý" && (
            <Button icon={CheckCircle2} disabled={isSubmitting} onClick={() => handleComplete(viewing.code)}>{isSubmitting ? "Đang hoàn thành..." : "Hoàn thành bảo trì"}</Button>
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
          <Button icon={Trash2} disabled={isSubmitting} onClick={handleDelete}>{isSubmitting ? "Đang xóa..." : "Xóa yêu cầu"}</Button></>}>
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!addForm.equipmentId && items.length === 0) {
      toast.error("Vui lòng chọn thiết bị");
      return;
    }
    if (!addForm.date) {
      toast.error("Vui lòng chọn ngày báo");
      return;
    }
    const d = new Date(addForm.date);
    if (isNaN(d.getTime())) {
      toast.error("Ngày báo sai định dạng");
      return;
    }
    if (!addForm.desc || !addForm.desc.trim()) {
      toast.error("Vui lòng nhập mô tả lỗi");
      return;
    }

    setIsSubmitting(true);
    const currentUser = JSON.parse(localStorage.getItem("gymos_user") || "{}");
    const reporterName = currentUser.name || "Nhân viên";

    try {
      const res = await fetch("http://localhost:5000/api/v1/equipment-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentId: addForm.equipmentId || items[0]?.id, reportDate: addForm.date, errorDescription: addForm.desc, reporterName, resolveStatus: "Chờ xử lý" })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Thêm yêu cầu thành công");
        fetchReports(); setAddOpen(false); setAddForm({});
      } else {
        toast.error(data.message || "Lỗi khi thêm yêu cầu");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/equipment-reports/${viewing?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolveStatus: "Hoàn thành" })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Kết thúc bảo trì thành công");
        fetchReports(); setViewId(null);
      } else {
        toast.error(data.message || "Lỗi cập nhật trạng thái");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/equipment-reports/${deleting?.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Xóa yêu cầu thành công");
        fetchReports(); setDeleteId(null);
      } else {
        toast.error(data.message || "Lỗi khi xóa yêu cầu");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Thiết bị đang bảo trì" sub="Quy trình 2 bước: Owner đánh dấu hết bảo trì → Staff xác nhận gỡ"
        actions={<Button icon={Plus} onClick={() => setAddOpen(true)}>Thêm yêu cầu bảo trì</Button>} />
      <div className="grid grid-cols-4 gap-3">
        {[
          { k: "Chờ xử lý", v: list.filter((m) => m.status === "Chờ xử lý").length, tone: "amber" },
          { k: "Đang xử lý", v: list.filter((m) => m.status === "Đang xử lý").length, tone: "sky" },
          { k: "Đã xử lý", v: list.filter((m) => m.status === "Đã xử lý").length, tone: "emerald" },
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
        <SearchableSelect
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="w-[180px]"
          options={[
            { value: "Tất cả", label: "Tất cả trạng thái" },
            { value: "Chờ xử lý", label: "Chờ xử lý" },
            { value: "Đang xử lý", label: "Đang xử lý" },
            { value: "Đã xử lý", label: "Đã xử lý" },
          ]}
        />
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

      <Modal open={addOpen} onClose={() => { setAddOpen(false); setAddForm({}); }} title="Thêm yêu cầu bảo trì" wide
        footer={<>
          <Button variant="ghost" onClick={() => { setAddOpen(false); setAddForm({}); }}>Hủy</Button>
          <Button icon={CheckCircle2} disabled={isSubmitting} onClick={handleAdd}>{isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}</Button>
        </>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label={<>Chọn thiết bị<Req /></>}>
              <SearchableSelect
                value={addForm.equipmentId || items[0]?.id}
                onChange={(e: any) => setAddForm({ ...addForm, equipmentId: e.target.value })}
                options={items.map((i) => ({ value: i.id, label: i.code + " — " + i.room }))}
              />
            </Field>
          </div>
          <Field label={<>Ngày báo<Req /></>}><Input type="date" value={addForm.date || ""} onChange={(e: any) => setAddForm({ ...addForm, date: e.target.value })} /></Field>
          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground px-3 py-2.5 rounded-lg bg-muted/40 border border-border/60">
              <span>Người báo:</span>
              <span className="font-medium text-foreground">{JSON.parse(localStorage.getItem("gymos_user") || "{}").name || "Nhân viên"}</span>
              <Badge tone="sky">Tự động</Badge>
            </div>
          </div>
          <div className="col-span-2">
            <Field label={<>Mô tả lỗi<Req /></>}>
              <textarea value={addForm.desc || ""} onChange={e => setAddForm({ ...addForm, desc: e.target.value })} rows={4} placeholder="Mô tả hiện tượng, mức độ hư hỏng…" className="w-full rounded-lg bg-input-background border border-border p-3 text-[13.5px] focus:outline-none focus:border-[#6C63FF]/60 resize-none" />
            </Field>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewId(null)} title="Chi tiết yêu cầu bảo trì" wide
        footer={<>
          <Button variant="ghost" onClick={() => setViewId(null)}>Đóng</Button>
          {viewing?.status === "Đã xử lý" && (
            <Button icon={CheckCircle2} disabled={isSubmitting} onClick={handleComplete}>{isSubmitting ? "Đang kết thúc..." : "Kết thúc bảo trì"}</Button>
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
          <Button icon={Trash2} disabled={isSubmitting} onClick={handleDelete}>{isSubmitting ? "Đang xóa..." : "Xóa yêu cầu"}</Button>
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
type FeedbackItem = {
  feedbackId: string;
  feedbackType: string;
  feedbackContent: string;
  answerContent: string | null;
  feedbackDate: string;
  answerDate: string | null;
  Member?: { memberName: string; phoneNumber: string; Account?: { email: string } };
  Answerer?: { staffName: string } | null;
};

function Feedback() {
  const [list, setList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [typeFilter, setTypeFilter] = useState<string>("Tất cả");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // Reply modal state
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  // View detail modal
  const [viewId, setViewId] = useState<string | null>(null);

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const token = localStorage.getItem("gymos_token");

  const fetchFeedbacks = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/v1/feedbacks", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) setList(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const getStatus = (f: FeedbackItem) => f.answerContent ? "Đã phản hồi" : "Chờ xử lý";

  const filtered = list.filter(f => {
    const status = getStatus(f);
    const matchStatus = statusFilter === "Tất cả" || status === statusFilter;
    const matchType = typeFilter === "Tất cả" || (f.feedbackType || "Khác") === typeFilter;
    const q = query.toLowerCase();
    const matchQuery = !q ||
      (f.Member?.memberName || "").toLowerCase().includes(q) ||
      (f.feedbackContent || "").toLowerCase().includes(q) ||
      f.feedbackId.toLowerCase().includes(q);
    return matchStatus && matchType && matchQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pending = list.filter(f => !f.answerContent).length;
  const answered = list.length - pending;

  const replyingItem = replyId ? list.find(f => f.feedbackId === replyId) : null;
  const viewingItem = viewId ? list.find(f => f.feedbackId === viewId) : null;
  const deletingItem = deleteId ? list.find(f => f.feedbackId === deleteId) : null;

  const doReply = async () => {
    if (!replyId || !replyText.trim()) return;
    setReplySending(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/feedbacks/${replyId}/answer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answerContent: replyText.trim() })
      });
      const data = await res.json();
      if (data.success) {
        fetchFeedbacks();
        setReplyId(null);
        setReplyText("");
      } else {
        toast.error(data.message || "Lỗi khi gửi phản hồi");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setReplySending(false);
    }
  };

  const doDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/feedbacks/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchFeedbacks();
        setDeleteId(null);
      } else {
        toast.error(data.message || "Lỗi khi xóa");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setDeleting(false);
    }
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const shortId = (id: string) => id.substring(0, 8).toUpperCase();

  const typeCounts: Record<string, number> = {};
  list.forEach(f => {
    const t = f.feedbackType || "Khác";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Phản hồi hội viên"
        sub={`${list.length} phản hồi — ${pending} đang chờ xử lý — ${answered} đã phản hồi`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tổng phản hồi", v: list.length, tone: "violet", icon: MessageSquare },
          { label: "Chờ xử lý", v: pending, tone: "amber", icon: AlertTriangle },
          { label: "Đã phản hồi", v: answered, tone: "emerald", icon: CheckCircle2 },
          { label: "Loại phổ biến", v: Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0] || "—", tone: "sky", icon: Filter },
        ].map((s: any) => (
          <Card key={s.label}>
            <div className="flex items-start justify-between">
              <div className={cn("size-9 rounded-xl grid place-items-center",
                s.tone === "violet" && "bg-[#6C63FF]/15 text-[#4F46E5] dark:text-[#A8A2FF]",
                s.tone === "amber" && "bg-[#FFB547]/15 text-[#A66A00] dark:text-[#FFD89B]",
                s.tone === "emerald" && "bg-[#00C9A7]/15 text-[#00866F] dark:text-[#5FE6CB]",
                s.tone === "sky" && "bg-sky-400/15 text-sky-700 dark:text-sky-300"
              )}>
                <s.icon className="size-4 stroke-[1.75]" />
              </div>
            </div>
            <div className="text-[11px] uppercase text-muted-foreground tracking-wider mt-3">{s.label}</div>
            <div className="font-display font-bold text-[22px] mt-0.5">{s.v}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên HV, nội dung…"
            className="w-full h-10 rounded-lg bg-input-background border border-border pl-9 pr-3 text-[13.5px] focus:outline-none focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/15 transition"
          />
        </div>
        <SearchableSelect
          value={statusFilter}
          onChange={(e: any) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-[180px]"
          options={[
            { value: "Tất cả", label: "Tất cả trạng thái" },
            { value: "Chờ xử lý", label: "Chờ xử lý" },
            { value: "Đã phản hồi", label: "Đã phản hồi" }
          ]}
        />
        <div className="flex items-center gap-2">
          {(["Tất cả", ...Object.keys(typeCounts)]).filter((v, i, a) => a.indexOf(v) === i).map((c) => (
            <button key={c} onClick={() => { setTypeFilter(c); setPage(1); }} className={cn(
              "h-9 px-3 rounded-lg text-[12.5px] border transition",
              typeFilter === c
                ? "bg-[#6C63FF]/15 border-[#6C63FF]/40 text-[#6C63FF] dark:text-[#A8A2FF]"
                : "border-border text-muted-foreground hover:text-foreground hover:border-[#6C63FF]/30"
            )}>{c}</button>
          ))}
        </div>
      </div>

      <Card padded={false}>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <div className="size-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin mr-3" />
            Đang tải dữ liệu…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="size-12 rounded-2xl bg-muted/60 border border-border grid place-items-center mx-auto">
              <MessageSquare className="size-5 text-muted-foreground" />
            </div>
            <h3 className="font-display mt-4">Không có phản hồi nào</h3>
            <p className="text-[13px] text-muted-foreground mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
            {(query || statusFilter !== "Tất cả" || typeFilter !== "Tất cả") && (
              <Button variant="outline" className="mt-4" onClick={() => { setQuery(""); setStatusFilter("Tất cả"); setTypeFilter("Tất cả"); setPage(1); }}>Xóa bộ lọc</Button>
            )}
          </div>
        ) : (
          <>
            <DataTable
              head={["Mã PH", "Hội viên", "Loại", "Nội dung", "Ngày tạo", "Trạng thái", ""]}
              rows={paginated.map((f) => {
                const status = getStatus(f);
                return [
                  <button onClick={() => setViewId(f.feedbackId)} className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF] hover:underline">{shortId(f.feedbackId)}</button>,
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-gradient-to-br from-sky-400 to-cyan-600 grid place-items-center text-[9px] text-white font-semibold">
                      {(f.Member?.memberName || "?").split(" ").slice(-2).map(n => n[0]).join("")}
                    </div>
                    <span className="font-medium">{f.Member?.memberName || "Ẩn danh"}</span>
                  </div>,
                  <Badge tone={f.feedbackType === "Thiết bị" ? "amber" : f.feedbackType === "Dịch vụ" ? "violet" : "sky"}>{f.feedbackType || "Khác"}</Badge>,
                  <span className="text-muted-foreground line-clamp-1 max-w-xs">{f.feedbackContent}</span>,
                  fmtDate(f.feedbackDate),
                  <StatusPill value={status} />,
                  <div className="flex items-center justify-end gap-0.5">
                    <IconBtn icon={Eye} onClick={() => setViewId(f.feedbackId)} />
                    {status !== "Đã phản hồi" && (
                      <IconBtn icon={MessageSquare} onClick={() => { setReplyId(f.feedbackId); setReplyText(""); }} />
                    )}
                    <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteId(f.feedbackId)} />
                  </div>,
                ];
              })}
            />
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/60">
                <span className="text-[12.5px] text-muted-foreground">
                  Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} phản hồi
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="h-8 px-3 rounded-lg border border-border text-[12.5px] disabled:opacity-40 hover:bg-muted/60 transition">
                    ‹ Trước
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={cn("h-8 w-8 rounded-lg border text-[12.5px] transition",
                          p === page ? "bg-[#6C63FF] border-[#6C63FF] text-white" : "border-border hover:bg-muted/60"
                        )}>{p}</button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="h-8 px-3 rounded-lg border border-border text-[12.5px] disabled:opacity-40 hover:bg-muted/60 transition">
                    Sau ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal open={!!viewingItem} onClose={() => setViewId(null)} title="Chi tiết phản hồi" wide
        footer={<>
          {!viewingItem?.answerContent && (
            <Button icon={MessageSquare} onClick={() => { setViewId(null); setReplyId(viewingItem!.feedbackId); setReplyText(""); }}>Trả lời</Button>
          )}
          <Button variant="ghost" onClick={() => setViewId(null)}>Đóng</Button>
        </>}>
        {viewingItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13.5px]">
              {[
                ["Mã phản hồi", <span className="font-mono text-[#4F46E5] dark:text-[#A8A2FF]">{shortId(viewingItem.feedbackId)}</span>],
                ["Hội viên", <span className="font-medium">{viewingItem.Member?.memberName || "Ẩn danh"}</span>],
                ["Loại phản hồi", <Badge tone="amber">{viewingItem.feedbackType || "Khác"}</Badge>],
                ["Ngày gửi", fmtDate(viewingItem.feedbackDate)],
                ["Trạng thái", <StatusPill value={getStatus(viewingItem)} />],
                ...(viewingItem.Answerer ? [["Người trả lời", viewingItem.Answerer.staffName]] : []),
                ...(viewingItem.answerDate ? [["Ngày trả lời", fmtDate(viewingItem.answerDate)]] : []),
              ].map(([k, v]: any) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Nội dung phản hồi</span>
              <p className="mt-1 text-[13.5px] bg-muted/40 rounded-lg p-3 border border-border/60 leading-relaxed">{viewingItem.feedbackContent}</p>
            </div>
            {viewingItem.answerContent && (
              <div className="ml-4 pl-4 border-l-2 border-[#00C9A7]/40 bg-[#00C9A7]/[0.04] rounded-r-lg py-3 pr-3">
                <div className="text-[11px] text-[#00866F] dark:text-[#5FE6CB] font-medium">Trả lời từ quản lý{viewingItem.Answerer ? ` — ${viewingItem.Answerer.staffName}` : ""}</div>
                <p className="text-[13.5px] mt-1 leading-relaxed">{viewingItem.answerContent}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!replyId && !viewId} onClose={() => { setReplyId(null); setReplyText(""); }} title="Trả lời phản hồi" wide
        footer={<>
          <Button variant="ghost" onClick={() => { setReplyId(null); setReplyText(""); }}>Hủy</Button>
          <Button icon={CheckCircle2}
            disabled={!replyText.trim() || replySending}
            onClick={doReply}>
            {replySending ? "Đang gửi…" : "Gửi phản hồi"}
          </Button>
        </>}>
        {replyingItem && (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/60 border border-border/70 p-4">
              <div className="flex items-center gap-2 flex-wrap text-[12px] text-muted-foreground">
                <span className="font-mono text-[#4F46E5] dark:text-[#A8A2FF]">{shortId(replyingItem.feedbackId)}</span>
                <span>·</span>
                <span className="font-medium">{replyingItem.Member?.memberName || "Ẩn danh"}</span>
                <span>·</span>
                <span>{fmtDate(replyingItem.feedbackDate)}</span>
                <Badge tone={replyingItem.feedbackType === "Thiết bị" ? "amber" : "sky"}>{replyingItem.feedbackType || "Khác"}</Badge>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed">{replyingItem.feedbackContent}</p>
            </div>
            <Field label={<>Nội dung trả lời <span className="text-[#FF5C5C]">*</span></>}>
              <textarea
                rows={5}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Cảm ơn bạn đã phản hồi. Chúng tôi đã ghi nhận ý kiến của bạn và sẽ…"
                className="w-full rounded-lg bg-input-background border border-border p-3 text-[13.5px] focus:outline-none focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/15 resize-none transition"
              />
            </Field>
            <div className="text-[11.5px] text-muted-foreground">{replyText.length} ký tự</div>
          </div>
        )}
      </Modal>

      <Modal open={!!deletingItem} onClose={() => setDeleteId(null)} title="Xóa phản hồi"
        footer={<>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="danger" icon={Trash2}
            disabled={deleting}
            onClick={doDelete}>
            {deleting ? "Đang xóa…" : "Xóa phản hồi"}
          </Button>
        </>}>
        {deletingItem && (
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-[#FF5C5C]/15 grid place-items-center text-[#B91C1C] dark:text-[#FFA0A0] shrink-0"><Trash2 className="size-5" /></div>
            <div>
              <p className="text-[14px]">Xóa phản hồi của <span className="font-semibold">{deletingItem.Member?.memberName || "hội viên"}</span>?</p>
              <p className="text-[12.5px] text-muted-foreground mt-1 line-clamp-2">"{deletingItem.feedbackContent}"</p>
              <p className="text-[12px] text-muted-foreground mt-2">Hành động này không thể hoàn tác.</p>
            </div>
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
  const [revenue, setRevenue] = useState(0);
  const [revenueByMonth, setRevenueByMonth] = useState<{ m: string; v: number }[]>([]);
  const [newMembers, setNewMembers] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [membersByMonth, setMembersByMonth] = useState<{ m: string; v: number }[]>([]);
  const [staffCount, setStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("gymos_token");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:5000/api/v1/reports/stats", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()),
      fetch("http://localhost:5000/api/v1/staffs").then(r => r.json()),
    ]).then(([statsRes, staffRes]) => {
      if (statsRes.success) {
        setRevenue(statsRes.data.revenue.total || 0);
        setRevenueByMonth(statsRes.data.revenue.byMonth || []);
        setNewMembers(statsRes.data.members.newThisMonth || 0);
        setTotalMembers(statsRes.data.members.total || 0);
        setMembersByMonth(statsRes.data.members.byMonth || []);
      }
      if (staffRes.success) {
        setStaffCount(staffRes.data.length || 0);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SectionTitle title="Báo cáo chung" sub="Tổng quan hiệu suất vận hành"
        actions={<><Button variant="outline" icon={CalIcon}>{new Date().toLocaleDateString("en-GB")}</Button><Button icon={FileBarChart}>Xuất báo cáo</Button></>} />
      <div className="grid grid-cols-4 gap-4">
        {[
          { k: "Doanh thu", v: loading ? "…" : `${(revenue / 1000000).toFixed(1)} tr`, icon: Wallet, tone: "violet" },
          { k: "Hội viên mới", v: loading ? "…" : newMembers, icon: UserPlus, tone: "emerald" },
          { k: "Tổng hội viên", v: loading ? "…" : totalMembers.toLocaleString("vi-VN"), icon: Users, tone: "amber" },
          { k: "Nhân sự", v: loading ? "…" : staffCount, icon: ShieldCheck, tone: "sky" },
        ].map((s: any) => (
          <Card key={s.k}>
            <div className="flex items-start justify-between">
              <div className={cn("size-10 rounded-xl grid place-items-center",
                s.tone === "violet" && "bg-[#6C63FF]/15 text-[#4F46E5] dark:text-[#A8A2FF]",
                s.tone === "emerald" && "bg-[#00C9A7]/15 text-[#00866F] dark:text-[#5FE6CB]",
                s.tone === "amber" && "bg-[#FFB547]/15 text-[#A66A00] dark:text-[#FFD89B]",
                s.tone === "sky" && "bg-sky-400/15 text-sky-700 dark:text-sky-300"
              )}>
                <s.icon className="size-5 stroke-[1.75]" />
              </div>
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
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="size-2 rounded-full bg-[#6C63FF]" />Doanh thu</span>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="size-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin mr-3" />
                Đang tải…
              </div>
            ) : (
              <ResponsiveContainer>
                <AreaChart data={revenueByMonth}>
                  <defs>
                    <linearGradient id="grad-rev-ov" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} interval={0} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} width={36} />
                  <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} formatter={(v: any) => [`${v} triệu`, "DT"]} />
                  <Area type="monotone" dataKey="v" stroke="#6C63FF" strokeWidth={2.5} fill="url(#grad-rev-ov)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-display">Hội viên đăng ký mới</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Theo tháng</p>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="size-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={membersByMonth}>
                  <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} interval={0} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} width={36} />
                  <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} />
                  <Bar dataKey="v" fill="#00C9A7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

function RevenueReport() {
  const [txns, setTxns] = useState<any[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<{ m: string; v: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"month" | "year">("month");
  const token = localStorage.getItem("gymos_token");

  const fetchRevenue = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/v1/reports/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setRevenueByMonth(res.data.revenue.byMonth || []);
          setTotalRevenue(res.data.revenue.total || 0);
          setTxns(res.data.revenue.transactions || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRevenue(); }, []);

  const maxV = revenueByMonth.length > 0 ? Math.max(...revenueByMonth.map(d => d.v)) : 0;
  const yMax = Math.ceil(maxV * 1.2 / 5) * 5 || 10;
  const ticks = [0, Math.round(yMax * 0.25), Math.round(yMax * 0.5), Math.round(yMax * 0.75), yMax];

  return (
    <>
      <SectionTitle
        title="Thống kê doanh thu"
        sub="Phân tích doanh thu theo thời gian thực từ hệ thống"
        actions={<Button icon={FileBarChart}>Xuất báo cáo</Button>}
      />

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-[11px] uppercase text-muted-foreground tracking-wider">Tổng doanh thu</div>
          <div className="font-display font-bold text-[28px] mt-1">
            {loading ? "…" : `${(totalRevenue / 1_000_000).toFixed(1)} tr`}
          </div>
          <Badge tone="violet">6 tháng gần nhất</Badge>
        </Card>
        <Card>
          <div className="text-[11px] uppercase text-muted-foreground tracking-wider">Đỉnh cao</div>
          <div className="font-display font-bold text-[28px] mt-1">{loading ? "…" : `${maxV} tr`}</div>
          <Badge tone="emerald">{revenueByMonth.find(d => d.v === maxV)?.m || "—"}</Badge>
        </Card>
        <Card>
          <div className="text-[11px] uppercase text-muted-foreground tracking-wider">Trung bình/tháng</div>
          <div className="font-display font-bold text-[28px] mt-1">
            {loading || revenueByMonth.length === 0 ? "…" : `${Math.round(revenueByMonth.reduce((s, d) => s + d.v, 0) / revenueByMonth.length)} tr`}
          </div>
          <Badge tone="sky">{revenueByMonth.length} tháng</Badge>
        </Card>
      </div>

      <Card>
        <h3 className="font-display mb-4">Biểu đồ doanh thu — 6 tháng gần nhất (triệu VND)</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="size-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin mr-3" />
            Đang tải dữ liệu…
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} interval={0} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} width={40} domain={[0, yMax]} ticks={ticks} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} formatter={(v: any) => [`${v} triệu`, "Doanh thu"]} />
                <Area type="monotone" dataKey="v" stroke="#6C63FF" strokeWidth={2.5} fill="url(#grad-revenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card padded={false}>
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <h3 className="font-display">Giao dịch gần nhất</h3>
          <Badge tone="violet">{txns.length} giao dịch</Badge>
        </div>
        {loading ? (
          <div className="py-10 text-center text-muted-foreground text-[13px]">Đang tải…</div>
        ) : txns.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-[13px]">Chưa có giao dịch nào</div>
        ) : (
          <DataTable
            head={["Hội viên", "Gói tập", "Số tiền", "Phương thức", "Ngày"]}
            rows={txns.map((t) => [
              <span className="font-medium">{t.member}</span>,
              <Badge tone="violet">{t.pkg}</Badge>,
              <span className="font-mono font-semibold">{t.amount.toLocaleString("vi-VN")} ₫</span>,
              <Badge tone={t.method === "cash" ? "amber" : t.method === "transfer" ? "emerald" : "sky"}>{t.method}</Badge>,
              t.date,
            ])}
          />
        )}
      </Card>
    </>
  );
}



function MembersReport() {
  const [membersByMonth, setMembersByMonth] = useState<{ m: string; v: number }[]>([]);
  const [pkgBreakdown, setPkgBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [newMembers, setNewMembers] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("gymos_token");
  const PIE_COLORS = ["#6C63FF", "#00C9A7", "#FFB547", "#FF5C5C", "#64B5F6", "#A78BFA"];

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/v1/reports/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setMembersByMonth(res.data.members.byMonth || []);
          setPkgBreakdown(res.data.members.pkgBreakdown || []);
          setNewMembers(res.data.members.newThisMonth || 0);
          setTotalMembers(res.data.members.total || 0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const maxMembers = membersByMonth.length > 0 ? Math.max(...membersByMonth.map(d => d.v)) : 10;
  const yMax = Math.ceil(maxMembers * 1.2) || 10;

  return (
    <>
      <SectionTitle
        title="Thống kê hội viên"
        sub="Cơ cấu và tăng trưởng hội viên theo thời gian"
        actions={<Button icon={FileBarChart}>Xuất báo cáo</Button>}
      />
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-[11px] uppercase text-muted-foreground tracking-wider">Hội viên mới tháng này</div>
          <div className="font-display font-bold text-[28px] mt-1">{loading ? "…" : newMembers}</div>
          <Badge tone="emerald">6 tháng gần nhất</Badge>
        </Card>
        <Card>
          <div className="text-[11px] uppercase text-muted-foreground tracking-wider">Tổng hội viên</div>
          <div className="font-display font-bold text-[28px] mt-1">{loading ? "…" : totalMembers.toLocaleString("vi-VN")}</div>
          <Badge tone="violet">Hệ thống</Badge>
        </Card>
        <Card>
          <div className="text-[11px] uppercase text-muted-foreground tracking-wider">Tỷ lệ tăng trưởng</div>
          <div className="font-display font-bold text-[28px] mt-1">
            {loading || totalMembers === 0 ? "…" : `${((newMembers / totalMembers) * 100).toFixed(1)}%`}
          </div>
          <Badge tone="amber">Tháng hiện tại</Badge>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <h3 className="font-display mb-4">Hội viên đăng ký mới — 6 tháng gần nhất</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="size-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin mr-3" />
              Đang tải…
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={membersByMonth}>
                  <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} interval={0} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} width={36} domain={[0, yMax]} />
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} formatter={(v: any) => [v, "Hội viên mới"]} />
                  <Bar dataKey="v" fill="#6C63FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-display mb-2">Phân bổ theo gói tập</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center"><div className="size-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" /></div>
          ) : pkgBreakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-[13px]">Chưa có dữ liệu</div>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pkgBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {pkgBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} formatter={(v: any) => [`${v}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {pkgBreakdown.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-[12.5px]">
                    <span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{p.name}</span>
                    <span className="font-mono text-muted-foreground">{p.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}

function StaffReport() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selMonth, setSelMonth] = useState(() => new Date().getMonth() + 1);
  const [selYear, setSelYear] = useState(() => new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, { ok: number; late: number; absent: number }>>({});

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/staffs")
      .then(r => r.json())
      .then(res => { if (res.success) setStaffList(res.data); });
  }, []);

  useEffect(() => {
    if (staffList.length === 0) return;
    setLoading(true);
    const fetchAll = staffList.slice(0, 8).map(s =>
      fetch(`http://localhost:5000/api/v1/staffs/${s.code}/attendance?month=${selMonth}&year=${selYear}`)
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            const now = new Date();
            const isCurrentMonth = now.getMonth() + 1 === selMonth && now.getFullYear() === selYear;
            const isPastMonth = selYear < now.getFullYear() || (selYear === now.getFullYear() && selMonth < now.getMonth() + 1);
            const daysInMonth = new Date(selYear, selMonth, 0).getDate();
            const maxDay = isPastMonth ? daysInMonth : (isCurrentMonth ? now.getDate() : 0);
            let ok = 0, late = 0;
            res.data.forEach((log: any) => {
              if (log.checkInTime) {
                const [h, m] = log.checkInTime.split(':').map(Number);
                const dow = new Date(log.workDate).getDay();
                const limit = (dow >= 1 && dow <= 5) ? 6 * 60 + 30 : 8 * 60;
                if (h * 60 + m > limit) late++; else ok++;
              } else ok++;
            });
            return { code: s.code, ok, late, absent: Math.max(0, maxDay - res.data.length) };
          }
          return { code: s.code, ok: 0, late: 0, absent: 0 };
        })
    );
    Promise.all(fetchAll).then(results => {
      const map: Record<string, any> = {};
      results.forEach(r => { map[r.code] = r; });
      setAttendanceData(map);
      setLoading(false);
    });
  }, [staffList, selMonth, selYear]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [2024, 2025, 2026];
  const activeStaff = staffList.filter(s => s.status === "Đang làm" || s.status === "Nghỉ phép");
  const totalOk = Object.values(attendanceData).reduce((s, a) => s + a.ok, 0);
  const totalLate = Object.values(attendanceData).reduce((s, a) => s + a.late, 0);
  const totalAbsent = Object.values(attendanceData).reduce((s, a) => s + a.absent, 0);
  const daysInMonth = new Date(selYear, selMonth, 0).getDate();
  const chartData = staffList.slice(0, 6).map(s => {
    const a = attendanceData[s.code] || { ok: 0, late: 0, absent: 0 };
    return { name: s.name.split(" ").pop(), ok: a.ok, late: a.late, absent: a.absent };
  });

  return (
    <>
      <SectionTitle
        title="Thống kê nhân sự"
        sub={`Hiệu suất chấm công ${staffList.slice(0, 8).length} nhân sự — Tháng ${String(selMonth).padStart(2, "0")}/${selYear}`}
        actions={
          <div className="flex items-center gap-2">
            <SearchableSelect
              value={selMonth}
              onChange={(e: any) => setSelMonth(Number(e.target.value))}
              className="w-28"
              options={months.map(m => ({ value: m, label: "Tháng " + m }))}
            />
            <SearchableSelect
              value={selYear}
              onChange={(e: any) => setSelYear(Number(e.target.value))}
              className="w-28"
              options={years.map(y => ({ value: y, label: String(y) }))}
            />
            <Button icon={FileBarChart}>Xuất báo cáo</Button>
          </div>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tổng nhân sự", v: staffList.length, sub: `${activeStaff.length} đang làm việc`, color: "bg-[#6C63FF]/15 text-[#4F46E5]" },
          { label: "Ngày đúng giờ", v: totalOk, sub: `${daysInMonth} ngày/tháng`, color: "bg-[#00C9A7]/15 text-[#00866F]" },
          { label: "Đi chưa đủ giờ", v: totalLate, sub: "Cộng dồn", color: "bg-[#FFB547]/15 text-[#A66A00]" },
          { label: "Tổng ngày vắng", v: totalAbsent, sub: "Cộng dồn", color: "bg-[#FF5C5C]/15 text-[#B91C1C]" },
        ].map((s: any) => (
          <Card key={s.label}>
            <div className={cn("size-9 rounded-xl grid place-items-center mb-3", s.color)}>
              <Users className="size-4 stroke-[1.75]" />
            </div>
            <div className="text-[11px] uppercase text-muted-foreground tracking-wider">{s.label}</div>
            <div className="font-display font-bold text-[26px] mt-1">
              {loading ? <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : s.v}
            </div>
            <div className="text-[11.5px] text-muted-foreground mt-1">{s.sub}</div>
          </Card>
        ))}
      </div>
      {chartData.length > 0 && (
        <Card>
          <h3 className="font-display mb-4">Biểu đồ chấm công — {String(selMonth).padStart(2, "0")}/{selYear}</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} width={36} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} />
                <Bar dataKey="ok" name="Đúng giờ" fill="#00C9A7" stackId="a" />
                <Bar dataKey="late" name="Chưa đủ giờ" fill="#FFB547" stackId="a" />
                <Bar dataKey="absent" name="Vắng" fill="#FF5C5C" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 mt-3 text-[11.5px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#00C9A7]" />Đúng giờ</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#FFB547]" />Chưa đủ giờ</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#FF5C5C]" />Vắng</span>
          </div>
        </Card>
      )}
      <Card padded={false}>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="size-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin mr-3" />
            Đang tải dữ liệu chấm công…
          </div>
        ) : (
          <DataTable
            head={["Nhân sự", "Chức vụ", "Đúng giờ", "Chưa đủ giờ", "Vắng", "Hiệu suất", ""]}
            rows={staffList.slice(0, 8).map((s) => {
              const a = attendanceData[s.code] || { ok: 0, late: 0, absent: 0 };
              const total = a.ok + a.late + a.absent;
              const perf = total > 0 ? Math.round(((a.ok + a.late * 0.5) / total) * 100) : 0;
              return [
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#3F39C7] grid place-items-center text-[10px] text-white font-semibold">
                    {s.name.split(" ").slice(-2).map((n: string) => n[0]).join("")}
                  </div>
                  <span className="font-medium">{s.name}</span>
                </div>,
                <Badge tone={s.role?.includes("Huấn") ? "amber" : "sky"}>{s.role}</Badge>,
                <span className="font-mono text-[#00866F] dark:text-[#5FE6CB]">{a.ok}</span>,
                <span className="font-mono text-[#A66A00] dark:text-[#FFD89B]">{a.late}</span>,
                <span className="font-mono text-[#B91C1C] dark:text-[#FFA0A0]">{a.absent}</span>,
                <div className="flex items-center gap-2 max-w-[160px]">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#00C9A7] transition-all" style={{ width: `${perf}%` }} />
                  </div>
                  <span className="font-mono text-[12px] text-muted-foreground">{perf}%</span>
                </div>,
                <IconBtn icon={Eye} onClick={() => { }} />,
              ];
            })}
          />
        )}
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
      <Field label={<>Email<Req /></>}><Input icon={Mail} type="email" placeholder="email@example.com" /></Field>
      <Field label={<>Gói tập<Req /></>}>
        <SearchableSelect
          disabled={disablePackage}
          defaultValue={data?.pkg ?? PACKAGES[0].name}
          options={PACKAGES.map((p) => ({ value: p.name, label: p.name }))}
        />
        {disablePackage && <p className="text-[11px] text-muted-foreground/70 mt-1">Dùng chức năng "Gia hạn gói tập" để thay đổi</p>}
      </Field>
      <Field label={<>Hạn / Số buổi còn lại<Req /></>}>
        <input disabled={disablePackage} defaultValue={data?.remain ?? ""} placeholder="VD: 32 ngày hoặc 14 buổi"
          className={cn("w-full h-10 rounded-lg bg-input-background border border-border px-3 text-[13.5px] focus:outline-none focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/15 transition",
            disablePackage && "opacity-50 cursor-not-allowed")} />
        {disablePackage && <p className="text-[11px] text-muted-foreground/70 mt-1">Dùng chức năng "Gia hạn gói tập" để thay đổi</p>}
      </Field>
      <Field label={<>Trạng thái<Req /></>}>
        <SearchableSelect
          defaultValue={data?.status ?? "Đang hoạt động"}
          options={MEMBER_STATUSES.map((s) => ({ value: s, label: s }))}
        />
      </Field>
      <Field label={<>Ngày sinh<Req /></>}><Input type="date" /></Field>
      <div className="col-span-2"><Field label={<>Địa chỉ<Req /></>}><Input placeholder="Số nhà, đường, quận, thành phố" /></Field></div>
    </div>
  );
}

const getDiffDays = (expireDate: any) => {
  if (!expireDate) return null;
  const expire = new Date(expireDate);
  expire.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = expire.getTime() - today.getTime();
  return Math.round(diff / 86400000);
};

const getExpireDate = (plan: any) => {
  if (!plan) return null;
  const pkg = plan.SubscriptionPackage;
  if (plan.startDate) {
    const start = new Date(plan.startDate);
    if (pkg?.packageType === "session" && pkg?.numberOfWorkout) {
      // Gói session: startDate + numberOfWorkout ngày
      start.setDate(start.getDate() + pkg.numberOfWorkout);
      return start;
    }
    if (pkg?.duration) {
      const unit = (pkg.durationUnit || "").toLowerCase();
      if (unit === "ngày" || unit === "day" || unit === "days") start.setDate(start.getDate() + pkg.duration);
      else if (unit === "tuần" || unit === "week" || unit === "weeks") start.setDate(start.getDate() + pkg.duration * 7);
      else if (unit === "năm" || unit === "year" || unit === "years") start.setFullYear(start.getFullYear() + pkg.duration);
      else start.setMonth(start.getMonth() + pkg.duration);
      return start;
    }
  }
  return plan.expireDate ? new Date(plan.expireDate) : null;
};

function MembersList({ onSelect, onAdd, readonly, disablePackage }: { onSelect: (id: string) => void; onAdd: () => void; readonly?: boolean; disablePackage?: boolean }) {
  const [list, setList] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const PAGE_SIZE = 6;

  const token = localStorage.getItem("gymos_token");
  const headers: any = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const computeStatus = (plan: any): string => {
    if (!plan) return "Chưa có gói";
    const expire = getExpireDate(plan);
    if (!expire) return "Đang hoạt động";
    const diffDays = getDiffDays(expire) ?? 0;
    if (diffDays < 0) return "Đã hết hạn";
    if (diffDays <= 14) return "Sắp hết hạn";
    return "Đang hoạt động";
  };

  const formatRemain = (plan: any): string => {
    if (!plan) return "—";
    if (plan.SubscriptionPackage?.packageType === "session") return `${plan.remainingSessions ?? 0} buổi`;
    const expire = getExpireDate(plan);
    if (expire) return expire.toLocaleDateString("en-GB");
    return "—";
  };

  const fetchMembers = () => {
    const params = query.trim() ? `?search=${encodeURIComponent(query.trim())}` : "";
    fetch(`http://localhost:5000/api/v1/members${params}`, { headers })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setList(res.data.members.map((m: any) => ({
            id: m.memberId,
            code: m.memberId.substring(0, 8).toUpperCase(),
            name: m.memberName,
            phone: m.phoneNumber || "Chưa có",
            pkg: m.activePlan?.SubscriptionPackage?.packageName ?? "Chưa có gói",
            remain: formatRemain(m.activePlan),
            status: computeStatus(m.activePlan),
            raw: m,
          })));
          setPage(1);
        }
      });
  };

  useEffect(() => { fetchMembers(); }, []);

  const filtered = list.filter((m) =>
    (statusFilter === "Tất cả" || m.status === statusFilter) &&
    (m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.code.toLowerCase().includes(query.toLowerCase()) ||
      m.phone.includes(query))
  );

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const editingMember = editId ? list.find((m) => m.id === editId) : null;
  const deletingMember = deleteId ? list.find((m) => m.id === deleteId) : null;
  const activeCount = list.filter((m) => m.status === "Đang hoạt động").length;

  const openEdit = (m: any) => {
    setEditId(m.id);
    setEditForm({
      memberName: m.raw.memberName,
      phoneNumber: m.raw.phoneNumber || "",
      dateOfBirth: m.raw.dateOfBirth || "",
      gender: m.raw.gender || "",
      occupation: m.raw.occupation || "",
    });
  };

  const handleEditSave = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const r = await fetch(`http://localhost:5000/api/v1/members/${editId}`, {
        method: "PUT", headers,
        body: JSON.stringify(editForm),
      });
      const res = await r.json();
      if (res.success) {
        toast.success("Cập nhật hội viên thành công");
        setEditId(null);
        fetchMembers();
      } else {
        toast.error(res.message || "Lỗi khi cập nhật hội viên");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const r = await fetch(`http://localhost:5000/api/v1/members/${deleteId}`, { method: "DELETE", headers });
      const res = await r.json();
      if (res.success) {
        toast.success("Xóa hội viên thành công");
        setDeleteId(null);
        fetchMembers();
      } else {
        toast.error(res.message || "Lỗi khi xóa hội viên");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Danh sách hội viên" sub={`${list.length} hội viên hiển thị — ${activeCount} đang hoạt động`}
        actions={<Button icon={UserPlus} onClick={onAdd}>Thêm hội viên</Button>} />
      <div className="flex flex-wrap items-center gap-3">
        <Input icon={Search} placeholder="Tìm theo tên, SĐT, mã HV…" className="max-w-md" value={query}
          onChange={(e: any) => setQuery(e.target.value)} />
        <SearchableSelect
          value={statusFilter}
          onChange={(e: any) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-[180px]"
          options={[
            { value: "Tất cả", label: "Tất cả trạng thái" },
            ...MEMBER_STATUSES.map((s) => ({ value: s, label: s })),
            { value: "Chưa có gói", label: "Chưa có gói" }
          ]}
        />
      </div>
      <Card padded={false}>
        <DataTable
          head={["Mã HV", "Họ tên", "SĐT", "Gói tập", "Hạn / Số buổi còn lại", "Trạng thái", ""]}
          rows={paginated.map((m) => [
            <span className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{m.code}</span>,
            <button onClick={() => onSelect(m.id)} className="flex items-center gap-2.5 text-left hover:text-[#4F46E5] dark:text-[#A8A2FF]">
              <div className="size-7 rounded-full bg-gradient-to-br from-sky-400 to-cyan-600 grid place-items-center text-[10.5px] text-white font-semibold">
                {m.name.split(" ").slice(-2).map((n: string) => n[0]).join("")}
              </div>
              <span className="font-medium">{m.name}</span>
            </button>,
            <span className="font-mono text-[12.5px]">{m.phone}</span>,
            m.pkg === "Chưa có gói"
              ? <span className="text-muted-foreground text-[12px]">Chưa có gói</span>
              : <Badge tone="violet">{m.pkg}</Badge>,
            <span className="text-muted-foreground">{m.remain}</span>,
            <StatusPill value={m.status} />,
            <div className="flex items-center justify-end gap-0.5">
              <IconBtn icon={Eye} onClick={() => onSelect(m.id)} />
              <IconBtn icon={Pencil} onClick={() => openEdit(m)} />
              {!readonly && <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteId(m.id)} />}
            </div>,
          ])}
        />
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10 text-[13px]">Không có hội viên nào khớp với bộ lọc</div>
        )}
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </Card>

      {/* Modal sửa hội viên */}
      <Modal open={!!editingMember} onClose={() => setEditId(null)} title={`Chỉnh sửa hội viên — ${editingMember?.name ?? ""}`} wide
        footer={<>
          <Button variant="ghost" onClick={() => setEditId(null)}>Hủy</Button>
          <Button icon={CheckCircle2} disabled={saving} onClick={handleEditSave}>
            {saving ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
        </>}>
        {editingMember && (
          <div className="grid grid-cols-2 gap-4">
            <Field label={<>Họ và tên<Req /></>}>
              <Input placeholder="Nguyễn Văn A" value={editForm.memberName} onChange={(e: any) => setEditForm((f: any) => ({ ...f, memberName: e.target.value }))} />
            </Field>
            <Field label={<>Số điện thoại<Req /></>}>
              <Input icon={Phone} placeholder="09xx xxx xxx" value={editForm.phoneNumber} onChange={(e: any) => setEditForm((f: any) => ({ ...f, phoneNumber: e.target.value }))} />
            </Field>
            <Field label="Ngày sinh">
              <Input type="date" value={editForm.dateOfBirth} onChange={(e: any) => setEditForm((f: any) => ({ ...f, dateOfBirth: e.target.value }))} />
            </Field>
            <Field label="Giới tính">
              <SearchableSelect
                value={editForm.gender}
                onChange={(e: any) => setEditForm((f: any) => ({ ...f, gender: e.target.value }))}
                options={[
                  { value: "", label: "Chưa chọn" },
                  { value: "male", label: "Nam" },
                  { value: "female", label: "Nữ" },
                  { value: "other", label: "Khác" }
                ]}
              />
            </Field>
            <div className="col-span-2">
              <Field label="Nghề nghiệp">
                <Input placeholder="VD: Kỹ sư phần mềm" value={editForm.occupation} onChange={(e: any) => setEditForm((f: any) => ({ ...f, occupation: e.target.value }))} />
              </Field>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal xóa hội viên */}
      <Modal open={!!deletingMember} onClose={() => setDeleteId(null)} title="Xóa hội viên"
        footer={<>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="danger" icon={Trash2} disabled={deleting} onClick={handleDelete}>
            {deleting ? "Đang xóa…" : "Xóa hội viên"}
          </Button>
        </>}>
        {deletingMember && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Xóa hội viên <span className="font-medium">{deletingMember.name}</span> ({deletingMember.code})?</p>
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
  const [step0Errors, setStep0Errors] = useState<Record<string, string>>({});
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  const [sellable, setSellable] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [pkgId, setPkgId] = useState("");
  const [trainerList, setTrainerList] = useState<any[]>([]);
  const [trainerId, setTrainerId] = useState("");

  const [formData, setFormData] = useState({
    memberName: "",
    dateOfBirth: "",
    gender: "male",
    job: "",
    phoneNumber: "",
    email: "",
    password: "",
    address: ""
  });
  const updateForm = (k: string, v: any) => {
    setFormData(prev => ({ ...prev, [k]: v }));
    if (step0Errors[k]) setStep0Errors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  const validateStep0 = () => {
    const errs: Record<string, string> = {};
    if (!formData.memberName.trim()) errs.memberName = "Vui lòng nhập họ và tên";
    else if (formData.memberName.trim().length < 2) errs.memberName = "Họ tên phải có ít nhất 2 ký tự";
    else if (!/^[a-zA-Z\s\u00C0-\u1EF9]+$/i.test(formData.memberName.trim())) errs.memberName = "Họ tên chỉ được chứa chữ cái";
    if (!formData.dateOfBirth) errs.dateOfBirth = "Vui lòng chọn ngày sinh";
    else if (new Date(formData.dateOfBirth) > new Date()) errs.dateOfBirth = "Ngày sinh không được ở tương lai";
    if (!formData.phoneNumber.trim()) errs.phoneNumber = "Vui lòng nhập số điện thoại";
    else if (!/^0\d{9}$/.test(formData.phoneNumber.trim())) errs.phoneNumber = "Số điện thoại gồm 10 số và bắt đầu bằng 0";
    if (!formData.email.trim()) errs.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errs.email = "Email không hợp lệ";
    if (!formData.password) errs.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 6) errs.password = "Mật khẩu tối thiểu 6 ký tự";
    setStep0Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!pkgId) errs.pkgId = "Vui lòng chọn gói tập";
    const selectedPkg = sellable.find((p) => p.id === pkgId);
    if (selectedPkg?.trainer && !trainerId) errs.trainerId = "Gói này yêu cầu chọn huấn luyện viên";
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  };


  const token = localStorage.getItem("gymos_token");
  useEffect(() => {
    const headers: any = { Authorization: `Bearer ${token}` };
    fetch("http://localhost:5000/api/v1/packages")
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          const rawList = res.data.filter((d: any) => d.status === "Đang kinh doanh" || d.isActive);
          setPackages(rawList);
          const list = rawList.map((d: any) => ({
            id: d.packageId, name: d.packageName,
            type: d.packageType === "session" ? `${d.numberOfWorkout} buổi` : `${d.duration} ${d.durationUnit}`,
            price: Number(d.price), vip: d.vipIncluded, trainer: d.trainerIncluded
          }));
          setSellable(list);
          if (list.length > 0) setPkgId(list[0].id);
        }
      });
    fetch("http://localhost:5000/api/v1/staffs", { headers })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setTrainerList((res.data || []).filter((s: any) => s.role === "Huấn luyện viên" && s.status === "Đang làm"));
        }
      });
  }, []);


  const pkg = sellable.find((p) => p.id === pkgId);
  if (pay && pkg) return <Payment kind={pay} formData={formData} pkgId={pkgId} pkg={pkg} trainerId={trainerId} onBack={() => setPay(null)} onComplete={onBack} />;
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
            <Field label={<>Họ và tên<Req /></>}>
              <Input placeholder="Nguyễn Văn A" value={formData.memberName} onChange={(e: any) => updateForm("memberName", e.target.value)} className={step0Errors.memberName ? "border-red-400" : ""} />
              {step0Errors.memberName && <p className="text-[11px] text-red-500 mt-1">{step0Errors.memberName}</p>}
            </Field>
            <Field label={<>Ngày sinh<Req /></>}>
              <Input type="date" value={formData.dateOfBirth} onChange={(e: any) => updateForm("dateOfBirth", e.target.value)} className={step0Errors.dateOfBirth ? "border-red-400" : ""} />
              {step0Errors.dateOfBirth && <p className="text-[11px] text-red-500 mt-1">{step0Errors.dateOfBirth}</p>}
            </Field>
            <Field label={<>Giới tính<Req /></>}>
              <div className="flex gap-2">{[
                { l: "Nam", v: "male" },
                { l: "Nữ", v: "female" },
                { l: "Khác", v: "other" }
              ].map((g) => (
                <button key={g.v} onClick={() => updateForm("gender", g.v)} className={cn("h-10 flex-1 rounded-lg border text-[13px]", formData.gender === g.v ? "border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF] dark:text-[#A8A2FF]" : "border-border text-muted-foreground")}>{g.l}</button>
              ))}</div>
            </Field>
            <Field label={<>Nghề nghiệp</>}><Input placeholder="VD: Kỹ sư phần mềm" value={formData.job} onChange={(e: any) => updateForm("job", e.target.value)} /></Field>
            <Field label={<>Số điện thoại<Req /></>}>
              <Input icon={Phone} placeholder="09xx xxx xxx" value={formData.phoneNumber} onChange={(e: any) => updateForm("phoneNumber", e.target.value)} className={step0Errors.phoneNumber ? "border-red-400" : ""} />
              {step0Errors.phoneNumber && <p className="text-[11px] text-red-500 mt-1">{step0Errors.phoneNumber}</p>}
            </Field>
            <Field label={<>Email<Req /></>}>
              <Input icon={Mail} type="email" placeholder="email@example.com" autoComplete="new-password" value={formData.email} onChange={(e: any) => updateForm("email", e.target.value)} className={step0Errors.email ? "border-red-400" : ""} />
              {step0Errors.email && <p className="text-[11px] text-red-500 mt-1">{step0Errors.email}</p>}
            </Field>
            <Field label={<>Mật khẩu đăng nhập<Req /></>}>
              <Input icon={Lock} type="password" placeholder="••••••••" autoComplete="new-password" value={formData.password} onChange={(e: any) => updateForm("password", e.target.value)} className={step0Errors.password ? "border-red-400" : ""} />
              {step0Errors.password && <p className="text-[11px] text-red-500 mt-1">{step0Errors.password}</p>}
            </Field>
            <div className="col-span-2"><Field label={<>Địa chỉ</>}><Input placeholder="Số nhà, đường, quận, thành phố" value={formData.address} onChange={(e: any) => updateForm("address", e.target.value)} /></Field></div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost">Hủy</Button>
            <Button icon={ArrowRight} disabled={isCheckingDuplicate} onClick={async () => {
              if (!validateStep0()) return;
              setIsCheckingDuplicate(true);
              try {
                const res = await fetch("http://localhost:5000/api/v1/members/check-duplicate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                  body: JSON.stringify({ email: formData.email, phoneNumber: formData.phoneNumber })
                });
                const data = await res.json();
                if (data.data?.isDuplicate) {
                  toast.error(data.data.message);
                } else {
                  setStep(1);
                }
              } catch {
                toast.error("Lỗi kết nối kiểm tra trùng lặp");
              } finally {
                setIsCheckingDuplicate(false);
              }
            }}>
              {isCheckingDuplicate ? "Đang kiểm tra..." : "Tiếp tục"}
            </Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <>
          <Card>
            <h3 className="font-display mb-4">Chọn gói tập</h3>
            <Field label="Gói tập">
              <PackageDropdown pkgId={pkgId} onChange={(id) => { setPkgId(id); setTrainerId(""); setStep1Errors({}); }} packages={packages} />
            </Field>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {pkg?.trainer && (
                <Field label={<>Huấn luyện viên<Req /></>} hint="Bắt buộc khi gói có Trainer">
                  <TrainerDropdown trainerId={trainerId} onChange={(id) => { setTrainerId(id); if (step1Errors.trainerId) setStep1Errors(prev => { const n = { ...prev }; delete n.trainerId; return n; }); }} trainers={trainerList} error={!!step1Errors.trainerId} />
                  {step1Errors.trainerId && <p className="text-[11px] text-[#FF5C5C] mt-1">{step1Errors.trainerId}</p>}
                </Field>
              )}
              <Field label="Phương thức thanh toán">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: "card", l: "Thẻ NH", i: CreditCard },
                    { k: "qr", l: "QR Code", i: QrCode },
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
            <Button icon={ArrowRight} onClick={() => { if (validateStep1()) setPay(method); }}>Tiến hành thanh toán bằng {method === "card" ? "Thẻ NH" : method === "qr" ? "QR Code" : "Tiền mặt"}</Button>
          </div>
        </>
      )}
    </div>
  );
}

function Payment({ kind, formData, pkgId, pkg, trainerId = "", onBack, onComplete, mode = "new", memberId }: { kind: "card" | "qr" | "cash"; formData?: any; pkgId: string; pkg: any; trainerId?: string; onBack: () => void; onComplete?: () => void; mode?: "new" | "renew"; memberId?: string }) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const TOTAL = 300;
  const [remain, setRemain] = useState(TOTAL);
  const [qrKey, setQrKey] = useState(0);

  const [cashGivenStr, setCashGivenStr] = useState("");
  const cashGiven = parseInt(cashGivenStr.replace(/\D/g, "")) || 0;
  const change = Math.max(0, cashGiven - pkg.price);
  const isCashInsufficient = kind === "cash" && cashGiven < pkg.price;

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
              <Field label="Số tiền cần thu"><Input value={`${pkg.price.toLocaleString("vi-VN")} ₫`} readOnly /></Field>
              <Field label="Khách đưa">
                <Input 
                  placeholder="VD: 3000000" 
                  value={cashGivenStr} 
                  onChange={(e: any) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setCashGivenStr(val ? parseInt(val).toString() : "");
                  }} 
                />
              </Field>
              <div className="rounded-xl border border-[#00C9A7]/30 bg-[#00C9A7]/10 p-4 flex items-center justify-between">
                <span className="text-[13px] text-[#00866F] dark:text-[#5FE6CB]">Tiền thối khách</span>
                <span className="font-display font-bold text-[22px] text-[#00866F] dark:text-[#5FE6CB]">{change > 0 ? change.toLocaleString("vi-VN") : "0"} ₫</span>
              </div>
              {isCashInsufficient && cashGivenStr && (
                <p className="text-[12.5px] text-[#FF5C5C]">Số tiền khách đưa chưa đủ để thanh toán.</p>
              )}
            </div>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-display">Tóm tắt đơn hàng</h3>
          <div className="mt-4 space-y-3 text-[13px]">
            {[
              ["Gói tập", pkg.name],
              ["Hội viên", formData?.memberName || "Bạn"],
              ["Ngày bắt đầu", new Date().toLocaleDateString("en-GB")]
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex justify-between text-[12.5px] text-muted-foreground"><span>Tạm tính</span><span>{pkg.price.toLocaleString("vi-VN")} ₫</span></div>
            <div className="flex justify-between text-[12.5px] text-muted-foreground mt-1"><span>VAT</span><span>0 ₫</span></div>
            <div className="flex justify-between mt-3"><span className="font-display">Tổng thanh toán</span><span className="font-display font-bold text-[22px]">{pkg.price.toLocaleString("vi-VN")} ₫</span></div>
          </div>

          {error && <div className="mt-4 p-3 rounded-lg bg-[#FF5C5C]/15 border border-[#FF5C5C]/30 text-[12.5px] text-[#B91C1C] dark:text-[#FFA0A0]">{error}</div>}

          <Button
            className="w-full justify-center mt-5 h-11"
            icon={CheckCircle2}
            disabled={loading || isCashInsufficient}
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                const methodMap: Record<string, string> = { card: "card", qr: "transfer", cash: "cash" };
                if (mode === "renew") {
                  const rRes = await fetch("http://localhost:5000/api/v1/subscriptions/renew", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${localStorage.getItem("gymos_token")}`
                    },
                    body: JSON.stringify({
                      packageId: pkgId,
                      paymentMethod: methodMap[kind] || "cash",
                      ...(memberId ? { memberId } : {}),
                      ...(trainerId ? { trainerId } : {})
                    })
                  });
                  const rData = await rRes.json();
                  if (!rData.success) throw new Error(rData.message || "Lỗi gia hạn gói tập");

                  setDone(true);
                  return;
                }

                // 1. Create Member
                const mRes = await fetch("http://localhost:5000/api/v1/members", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("gymos_token")}`
                  },
                  body: JSON.stringify({
                    email: formData.email,
                    password: formData.password || "gymos123456",
                    memberName: formData.memberName,
                    phoneNumber: formData.phoneNumber,
                    dateOfBirth: formData.dateOfBirth || undefined,
                    gender: formData.gender
                  })
                });
                const mData = await mRes.json();
                if (!mData.success) throw new Error(mData.message || "Lỗi tạo hội viên");

                const newMemberId = mData.data.member.memberId;

                // 2. Create Subscription
                const sRes = await fetch("http://localhost:5000/api/v1/subscriptions", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("gymos_token")}`
                  },
                  body: JSON.stringify({
                    memberId: newMemberId,
                    packageId: pkgId,
                    ...(trainerId ? { trainerId } : {})
                  })
                });
                const sData = await sRes.json();
                if (!sData.success) throw new Error(sData.message || "Lỗi tạo subscription");

                const subId = sData.data.subscription.planId || sData.data.subscription.subscriptionId;

                // 3. Process Payment
                const pRes = await fetch(`http://localhost:5000/api/v1/subscriptions/${subId}/pay`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("gymos_token")}`
                  },
                  body: JSON.stringify({
                    paymentMethod: methodMap[kind] || "cash"
                  })
                });
                const pData = await pRes.json();
                if (!pData.success) throw new Error(pData.message || "Lỗi thanh toán");

                setDone(true);
              } catch (err: any) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}>
            {loading ? "Đang xử lý..." : "Xác nhận & Hoàn tất"}
          </Button>
        </Card>
      </div>

      <Modal open={done} onClose={() => setDone(false)} title="Đăng ký & Thanh toán thành công"
        footer={<Button icon={ArrowRight} onClick={() => { setDone(false); onComplete?.(); }}>Quay về danh sách</Button>}>
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
  const [member, setMember] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [delDayIdx, setDelDayIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingMember, setDeletingMember] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [todayLog, setTodayLog] = useState<any>(null);

  const token = localStorage.getItem("gymos_token");
  const headers: any = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchMember = () => {
    fetch(`http://localhost:5000/api/v1/members/${id}`, { headers })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setMember(res.data.member);
          setEditForm({
            memberName: res.data.member.memberName,
            phoneNumber: res.data.member.phoneNumber || "",
            dateOfBirth: res.data.member.dateOfBirth || "",
            gender: res.data.member.gender || "",
            occupation: res.data.member.occupation || "",
          });
        }
      });
  };

  const fetchLogs = () => {
    fetch(`http://localhost:5000/api/v1/members/${id}/workout-logs`, { headers })
      .then(r => r.json())
      .then(res => { if (res.success) setLogs(res.data.logs); });
  };

  const fetchPayments = () => {
    fetch(`http://localhost:5000/api/v1/members/${id}/payments`, { headers })
      .then(r => r.json())
      .then(res => { if (res.success) setPayments(res.data.plans); });
  };

  const fetchTodayLog = () => {
    fetch(`http://localhost:5000/api/v1/workout-logs/member/${id}/today`, { headers })
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setTodayLog(res.data);
        } else {
          setTodayLog(null);
        }
      });
  };

  useEffect(() => {
    if (!id) return;
    fetchMember();
    fetchLogs();
    fetchPayments();
    fetchTodayLog();
  }, [id]);

  const handleCheckInOut = () => {
    if (todayLog) {
      if (todayLog.endTime) {
        toast.info("Hội viên đã check out hôm nay.");
        return;
      }
      fetch(`http://localhost:5000/api/v1/workout-logs/${todayLog.workoutId}/checkout`, {
        method: "PATCH", headers
      }).then(r => r.json()).then(res => {
        if (res.success) {
          fetchTodayLog();
          fetchLogs();
          toast.success("Check out thành công!");
        } else {
          toast.error(res.message);
        }
      });
    } else {
      fetch(`http://localhost:5000/api/v1/workout-logs`, {
        method: "POST", headers,
        body: JSON.stringify({ memberId: id })
      }).then(r => r.json()).then(res => {
        if (res.success) {
          fetchTodayLog();
          fetchLogs();
          fetchMember();
          toast.success("Check in thành công!");
        } else {
          toast.error(res.message);
        }
      });
    }
  };

  const handleSave = async () => {
    if (!editForm.memberName?.trim()) return toast.error("Vui lòng nhập họ và tên");
    if (!/^[a-zA-Z\s\u00C0-\u1EF9]+$/i.test(editForm.memberName.trim())) return toast.error("Họ tên chỉ được chứa chữ cái");
    if (editForm.dateOfBirth && new Date(editForm.dateOfBirth) > new Date()) return toast.error("Ngày sinh không được ở tương lai");
    if (!editForm.phoneNumber?.trim()) return toast.error("Vui lòng nhập số điện thoại");
    if (!/^0\d{9}$/.test(editForm.phoneNumber.trim())) return toast.error("Số điện thoại gồm 10 số và bắt đầu bằng 0");

    setSaving(true);
    try {
      const r = await fetch(`http://localhost:5000/api/v1/members/${id}`, {
        method: "PUT", headers,
        body: JSON.stringify(editForm),
      });
      const res = await r.json();
      if (res.success) {
        toast.success("Cập nhật hội viên thành công");
        setEdit(false);
        fetchMember();
      } else {
        toast.error(res.message || "Lỗi khi cập nhật");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeletingMember(true);
    try {
      const r = await fetch(`http://localhost:5000/api/v1/members/${id}`, { method: "DELETE", headers });
      const res = await r.json();
      if (res.success) {
        toast.success("Xóa hội viên thành công");
        setDel(false);
        onDeleted?.();
        onBack();
      } else {
        toast.error(res.message || "Lỗi khi xóa hội viên");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setDeletingMember(false);
    }
  };

  if (!member) return <div className="text-muted-foreground text-[13px] py-10 text-center">Đang tải...</div>;

  const plan = member.activePlan;
  const pkg = plan?.SubscriptionPackage;

  const expireDate = getExpireDate(plan);

  const diffDays = getDiffDays(expireDate);

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-[12.5px] text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ChevronLeft className="size-3.5" /> Quay lại danh sách hội viên
      </button>

      <Card>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex items-center gap-4 flex-1">
            <div className="size-20 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-600 grid place-items-center text-white font-display text-[24px] font-bold">
              {member.memberName.split(" ").slice(-2).map((n: string) => n[0]).join("")}
            </div>
            <div>
              <div className="font-mono text-[12px] text-muted-foreground">{member.memberId.substring(0, 8).toUpperCase()}</div>
              <h2 className="font-display text-[22px] mt-0.5">{member.memberName}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[12.5px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{member.phoneNumber || "Chưa có"}</span>
                <span className="flex items-center gap-1.5"><Mail className="size-3.5" />{member.Account?.email || "Chưa có"}</span>
                {member.dateOfBirth && <span className="flex items-center gap-1.5"><CalIcon className="size-3.5" />{new Date(member.dateOfBirth).toLocaleDateString("en-GB")}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!readonly && <Button variant="outline" icon={Pencil} onClick={() => setEdit(true)}>Sửa</Button>}
            {!readonly && <Button variant="danger" icon={Trash2} onClick={() => setDel(true)}>Xóa</Button>}
            {onRenew && <Button variant="outline" icon={CreditCard} onClick={onRenew}>Gia hạn gói</Button>}
            <Button 
              variant={todayLog ? (todayLog.endTime ? "outline" : "danger") : "secondary"} 
              icon={todayLog && !todayLog.endTime ? LogOut : CheckCircle2} 
              onClick={handleCheckInOut}
              disabled={!!(todayLog && todayLog.endTime)}
            >
              {todayLog ? (todayLog.endTime ? "Đã check out" : "Check out hôm nay") : "Check in hôm nay"}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl bg-gradient-to-br from-[#6C63FF]/10 to-transparent border border-[#6C63FF]/20 p-4">
            <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground mb-2">Gói tập</div>
            <div className="font-display font-semibold text-[16px]">{pkg?.packageName ?? "Chưa có gói"}</div>
            {plan?.startDate && <div className="text-[12px] text-muted-foreground mt-1">Bắt đầu {new Date(plan.startDate).toLocaleDateString("en-GB")}</div>}
          </div>
          <div className="rounded-xl bg-muted/40 border border-border/70 p-4">
            {pkg?.packageType === "session" ? <>
              <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">Hạn sử dụng</div>
              {expireDate ? <>
                <div className="font-display font-bold text-[20px] mt-1">{expireDate.toLocaleDateString("en-GB")}</div>
                <div className={cn("text-[12px]", diffDays! > 14 ? "text-[#00866F] dark:text-[#5FE6CB]" : "text-[#FF5C5C]")}>
                  {diffDays! >= 0 ? `Còn ${diffDays} ngày` : "Đã hết hạn"}
                </div>
              </> : <div className="font-display font-bold text-[20px] mt-1 text-muted-foreground">—</div>}
            </> : <>
              <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">Hạn sử dụng</div>
              {expireDate ? <>
                <div className="font-display font-bold text-[20px] mt-1">{expireDate.toLocaleDateString("en-GB")}</div>
                <div className={cn("text-[12px]", diffDays! > 14 ? "text-[#00866F] dark:text-[#5FE6CB]" : "text-[#FF5C5C]")}>
                  {diffDays! >= 0 ? `Còn ${diffDays} ngày` : "Đã hết hạn"}
                </div>
              </> : <div className="font-display font-bold text-[20px] mt-1 text-muted-foreground">—</div>}
            </>}
          </div>
          <div className="rounded-xl bg-muted/40 border border-border/70 p-4">
            <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">Số buổi đã tập</div>
            <div className="font-display font-bold text-[20px] mt-1">{logs.length}</div>
            <div className="text-[12px] text-muted-foreground">Tổng buổi ghi nhận</div>
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
          <>
            <DataTable
              head={["Ngày", "Giờ vào", "Thời lượng", "PT phụ trách", ""]}
              rows={logs.map((d, idx) => [
                new Date(d.workoutDate).toLocaleDateString("en-GB"),
                d.startTime?.slice(0, 5) || "—",
                d.duration ? `${d.duration} phút` : "—",
                <span className="text-muted-foreground">{d.Recorder?.staffName || "—"}</span>,
                !readonly && <IconBtn icon={Trash2} tone="danger" onClick={() => setDelDayIdx(idx)} />,
              ])}
            />
            {logs.length === 0 && <div className="text-center text-muted-foreground py-10 text-[13px]">Chưa có buổi tập nào được ghi nhận</div>}
          </>
        )}

        {tab === 1 && (
          <>
            <DataTable
              head={["Ngày", "Gói tập", "Phương thức", "Số tiền", "Trạng thái"]}
              rows={payments.filter(p => p.Bill).map((p) => [
                p.Bill?.paymentDate ? new Date(p.Bill.paymentDate).toLocaleDateString("en-GB") : "—",
                <span>{p.SubscriptionPackage?.packageName || "—"}</span>,
                <Badge tone={p.Bill?.paymentMethod === "card" ? "violet" : p.Bill?.paymentMethod === "qr" ? "sky" : "amber"}>
                  {p.Bill?.paymentMethod === "card" ? "Thẻ NH" : p.Bill?.paymentMethod === "qr" ? "QR Code" : "Tiền mặt"}
                </Badge>,
                <span className="font-display font-semibold">{Number(p.Bill?.amount || 0).toLocaleString("vi-VN")} ₫</span>,
                <StatusPill value="Thành công" />,
              ])}
            />
            {payments.filter(p => p.Bill).length === 0 && <div className="text-center text-muted-foreground py-10 text-[13px]">Chưa có giao dịch nào</div>}
          </>
        )}

        {tab === 2 && (
          <div className="p-5">
            <div className="text-center text-muted-foreground py-6 text-[13px]">Xem phản hồi tại mục Phản hồi hội viên</div>
          </div>
        )}
      </Card>

      {/* Modal sửa */}
      <Modal open={edit} onClose={() => setEdit(false)} title={`Chỉnh sửa — ${member.memberName}`} wide
        footer={<>
          <Button variant="ghost" onClick={() => setEdit(false)}>Hủy</Button>
          <Button icon={CheckCircle2} disabled={saving} onClick={handleSave}>
            {saving ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
        </>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label={<>Họ và tên<Req /></>}>
            <Input placeholder="Nguyễn Văn A" value={editForm.memberName} onChange={(e: any) => setEditForm((f: any) => ({ ...f, memberName: e.target.value }))} />
          </Field>
          <Field label={<>Số điện thoại<Req /></>}>
            <Input icon={Phone} placeholder="09xx xxx xxx" value={editForm.phoneNumber} onChange={(e: any) => setEditForm((f: any) => ({ ...f, phoneNumber: e.target.value }))} />
          </Field>
          <Field label="Ngày sinh">
            <Input type="date" value={editForm.dateOfBirth} onChange={(e: any) => setEditForm((f: any) => ({ ...f, dateOfBirth: e.target.value }))} />
          </Field>
          <Field label="Giới tính">
              <SearchableSelect
                value={editForm.gender}
                onChange={(e: any) => setEditForm((f: any) => ({ ...f, gender: e.target.value }))}
                options={[
                  { value: "", label: "Chưa chọn" },
                  { value: "male", label: "Nam" },
                  { value: "female", label: "Nữ" },
                  { value: "other", label: "Khác" }
                ]}
              />
          </Field>
          <div className="col-span-2">
            <Field label="Nghề nghiệp">
              <Input placeholder="VD: Kỹ sư phần mềm" value={editForm.occupation} onChange={(e: any) => setEditForm((f: any) => ({ ...f, occupation: e.target.value }))} />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Modal xóa */}
      <Modal open={del} onClose={() => setDel(false)} title="Xóa hội viên"
        footer={<>
          <Button variant="ghost" onClick={() => setDel(false)}>Hủy</Button>
          <Button variant="danger" icon={Trash2} disabled={deletingMember} onClick={handleDelete}>
            {deletingMember ? "Đang xóa…" : "Xóa hội viên"}
          </Button>
        </>}>
        <div className="space-y-3">
          <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
          <p className="text-[14px]">Xóa hội viên <span className="font-medium">{member.memberName}</span>?</p>
          <p className="text-[12.5px] text-muted-foreground">Toàn bộ lịch sử tập luyện, thanh toán và phản hồi sẽ bị xóa khỏi hệ thống.</p>
        </div>
      </Modal>

      {/* Modal xóa buổi tập */}
      <Modal open={delDayIdx !== null} onClose={() => setDelDayIdx(null)} title="Xóa buổi tập"
        footer={<>
          <Button variant="ghost" onClick={() => setDelDayIdx(null)}>Hủy</Button>
          <Button variant="danger" icon={Trash2} onClick={() => { setLogs(logs.filter((_, i) => i !== delDayIdx)); setDelDayIdx(null); }}>Xóa</Button>
        </>}>
        {delDayIdx !== null && logs[delDayIdx] && (
          <div className="space-y-3">
            <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
            <p className="text-[14px]">Xóa buổi tập ngày <span className="font-medium">{new Date(logs[delDayIdx].workoutDate).toLocaleDateString("en-GB")}</span>?</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Member views ── */
function MemberHistory() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMonth, setViewMonth] = useState<{ year: number; month: number }>(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const token = localStorage.getItem("gymos_token");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/v1/workout-logs/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSummary(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ── helpers ── */
  const fmtTime = (t: string | null | undefined) => {
    if (!t) return "—";
    return t.slice(0, 5);
  };

  const fmtDuration = (mins: number | null | undefined) => {
    if (!mins) return "—";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}g ${m}p` : `${m}p`;
  };

  const fmtDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB");
  };

  /* ── calendar ── */
  const { year, month } = viewMonth;
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  // convert so Mon=0
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const workoutDates = new Set(
    (summary?.workoutLogs ?? [])
      .filter((l: any) => {
        const d = new Date(l.workoutDate);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((l: any) => new Date(l.workoutDate).getDate())
  );

  const monthName = new Date(year, month, 1).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () =>
    setViewMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  const nextMonth = () =>
    setViewMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );

  const monthCount = workoutDates.size;

  /* ── active plan display ── */
  const plan = summary?.activePlan ?? null;
  const pkg = plan?.SubscriptionPackage ?? null;
  const trainer = plan?.Trainer ?? null;
  const daysLeft = plan?.daysRemaining ?? null;

  /* ── pagination ── */
  const allLogs: any[] = summary?.workoutLogs ?? [];
  const totalPages = Math.ceil(allLogs.length / PAGE_SIZE);
  const pageLogs = allLogs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-5">
        <SectionTitle title="Lịch sử tập luyện" sub="Đang tải dữ liệu…" />
        <div className="flex items-center justify-center py-20 text-muted-foreground text-[13px]">
          <Activity className="size-5 mr-2 animate-pulse" /> Đang tải…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle title="Lịch sử tập luyện" sub="Theo dõi tiến độ của bạn trong tháng này" />

      {/* Subscription card */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            {plan ? (
              <>
                <div className="flex items-center gap-2">
                  {pkg?.vipIncluded && <Badge tone="amber">★ VIP</Badge>}
                  {pkg?.trainerIncluded && <Badge tone="violet">Có Trainer</Badge>}
                  {!plan && <Badge tone="gray">Chưa có gói</Badge>}
                </div>
                <h3 className="font-display text-[20px] mt-2">
                  {pkg?.packageName ?? "Gói tập"}
                </h3>
                <div className="text-[12.5px] text-muted-foreground mt-0.5">
                  {trainer ? `PT phụ trách: ${trainer.staffName} · ` : ""}
                  Bắt đầu {plan.startDate ? fmtDate(plan.startDate) : "—"}
                </div>
              </>
            ) : (
              <>
                <Badge tone="gray">Chưa có gói tập</Badge>
                <h3 className="font-display text-[20px] mt-2 text-muted-foreground">
                  Bạn chưa đăng ký gói tập nào
                </h3>
                <div className="text-[12.5px] text-muted-foreground">
                  Hãy gia hạn để tiếp tục tập luyện.
                </div>
              </>
            )}
          </div>
          {plan && (
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {daysLeft === 0 ? "Thời gian hết hạn" : "Hết hạn sau"}
              </div>
              <div className={cn(
                "font-display font-bold text-[28px]",
                daysLeft !== null && daysLeft <= 14
                  ? "text-[#FF5C5C]"
                  : "text-[#00866F] dark:text-[#5FE6CB]"
              )}>
                {daysLeft !== null ? (daysLeft === 0 ? "Hôm nay" : `${daysLeft} ngày`) : "—"}
              </div>
              {plan.expireDate && (
                <div className="text-[11px] text-muted-foreground">
                  Hạn: {fmtDate(plan.expireDate)}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Activity,
            label: "Tổng buổi tập",
            value: `${summary?.totalSessions ?? 0} buổi`,
            tone: "emerald",
          },
          {
            icon: TrendingUp,
            label: "Tháng này",
            value: `${monthCount} buổi`,
            tone: "violet",
          },
          {
            icon: Sparkles,
            label: "Chuỗi hiện tại",
            value: `${summary?.streak ?? 0} ngày 🔥`,
            tone: "amber",
          },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={cn("size-9 rounded-lg grid place-items-center",
                s.tone === "emerald" && "bg-[#00C9A7]/15 text-[#00866F] dark:text-[#5FE6CB]",
                s.tone === "violet" && "bg-[#6C63FF]/15 text-[#4F46E5] dark:text-[#A8A2FF]",
                s.tone === "amber" && "bg-[#FFB547]/15 text-[#A66A00] dark:text-[#FFD89B]")}>
                <s.icon className="size-4 stroke-[1.75]" />
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
                <div className="font-display font-bold text-[18px]">{s.value}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display capitalize">{monthName}</h3>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth}
                className="size-7 rounded-md hover:bg-accent grid place-items-center text-muted-foreground hover:text-foreground transition">
                <ChevronLeft className="size-4" />
              </button>
              <button onClick={nextMonth}
                className="size-7 rounded-md hover:bg-accent grid place-items-center text-muted-foreground hover:text-foreground transition">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {"T2 T3 T4 T5 T6 T7 CN".split(" ").map((d) => (
              <div key={d} className="text-[10px] text-muted-foreground py-1">{d}</div>
            ))}
            {Array.from({ length: startOffset }).map((_, i) => <div key={"pad" + i} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const today = new Date();
              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;
              const worked = workoutDates.has(day);
              return (
                <div key={day} className={cn(
                  "aspect-square rounded-lg grid place-items-center text-[11.5px] relative transition",
                  worked
                    ? "bg-[#00C9A7]/15 text-[#00866F] dark:text-[#5FE6CB] border border-[#00C9A7]/30"
                    : "bg-muted/40 text-muted-foreground border border-border/60",
                  isToday && "ring-2 ring-[#6C63FF]/60 ring-offset-1"
                )}>
                  {day}
                  {worked && (
                    <span className="absolute bottom-0.5 right-0.5 size-1 rounded-full bg-[#00C9A7]" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-[12px] text-muted-foreground">
            ✓ {monthCount} buổi tập trong tháng
            {(summary?.streak ?? 0) > 1 && ` — chuỗi ${summary.streak} ngày liên tiếp 🔥`}
          </div>
        </Card>

        {/* Session table */}
        <Card className="lg:col-span-3" padded={false}>
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h3 className="font-display">Buổi tập gần đây</h3>
            <span className="text-[12px] text-muted-foreground">
              {allLogs.length} buổi tổng cộng
            </span>
          </div>
          {allLogs.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 text-[13px]">
              Chưa có buổi tập nào được ghi nhận
            </div>
          ) : (
            <>
              <DataTable
                head={["Ngày", "Giờ vào", "Giờ ra", "Thời lượng", "Ghi chú"]}
                rows={pageLogs.map((l: any) => {
                  const startMin = l.startTime
                    ? parseInt(l.startTime.slice(0, 2)) * 60 + parseInt(l.startTime.slice(3, 5))
                    : 0;
                  const endMin = l.endTime
                    ? parseInt(l.endTime.slice(0, 2)) * 60 + parseInt(l.endTime.slice(3, 5))
                    : null;
                  const durMins = l.duration
                    ? l.duration
                    : endMin !== null
                      ? endMin - startMin
                      : null;
                  return [
                    fmtDate(l.workoutDate),
                    <span className="font-mono text-[12px]">{fmtTime(l.startTime)}</span>,
                    <span className="font-mono text-[12px]">{l.endTime ? fmtTime(l.endTime) : "—"}</span>,
                    durMins ? <Badge tone="emerald">{fmtDuration(durMins)}</Badge> : <span className="text-muted-foreground">—</span>,
                    <span className="text-muted-foreground text-[12px]">{l.notes || (l.Recorder ? l.Recorder.staffName : "—")}</span>,
                  ];
                })}
              />
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-3 border-t border-border/60">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="size-7 rounded-md border border-border grid place-items-center text-muted-foreground hover:bg-accent disabled:opacity-40 transition">
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <span className="text-[12px] text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="size-7 rounded-md border border-border grid place-items-center text-muted-foreground hover:bg-accent disabled:opacity-40 transition">
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function MemberPayments() {
  const [methodFilter, setMethodFilter] = useState<string>("Tất cả");
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/subscriptions/me", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("gymos_token")}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubscriptions(data.data.subscriptions || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const payments = useMemo(() => {
    return subscriptions
      .filter((plan: any) => plan.Bill) // Only plans with bills
      .map((plan: any) => {
        const d = new Date(plan.Bill.paymentDate);
        return {
          code: `PAY-${plan.Bill.billId.split("-")[0].toUpperCase()}`,
          rawDate: d,
          d: d.toLocaleDateString("en-GB"),
          desc: `Đăng ký ${plan.SubscriptionPackage?.packageName || "gói tập"}`,
          method: plan.Bill.paymentMethod || "Tiền mặt",
          amount: parseFloat(plan.Bill.amount),
          status: "Thành công"
        };
      })
      .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  }, [subscriptions]);

  const activePlan = useMemo(() => {
    const active = subscriptions.filter((p: any) => p.status === "active").sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    if (!active) return null;
    
    const daysLeft = Math.max(0, getDiffDays(active.expireDate) ?? 0);
    
    return {
      name: active.SubscriptionPackage?.packageName || "Gói tập",
      startDate: new Date(active.startDate).toLocaleDateString("en-GB"),
      expireDate: new Date(active.expireDate).toLocaleDateString("en-GB"),
      daysLeft
    };
  }, [subscriptions]);

  const filtered = payments.filter((p) => methodFilter === "Tất cả" || p.method === methodFilter);
  const total = payments.reduce((s, p) => s + p.amount, 0);
  const methodBadgeTone = (m: string) => m === "Thẻ NH" ? "violet" : m === "QR Code" ? "sky" : "amber";

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-5">
      <SectionTitle title="Lịch sử thanh toán" sub="Toàn bộ giao dịch gắn với tài khoản của bạn" />

      {/* Gói hiện tại */}
      {activePlan ? (
        <Card>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Badge tone="amber">★ Gói hiện tại</Badge>
              <h3 className="font-display text-[20px] mt-2">{activePlan.name}</h3>
              <div className="text-[12.5px] text-muted-foreground mt-0.5">
                Bắt đầu {activePlan.startDate} · Còn {activePlan.daysLeft} ngày — Hết hạn {activePlan.expireDate}
              </div>
            </div>
            <StatusPill value="Đang hoạt động" />
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-[14px] text-muted-foreground">Bạn chưa có gói tập nào đang hoạt động.</div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tổng chi tiêu", value: total.toLocaleString("vi-VN") + " ₫", tone: "violet" },
          { label: "Số giao dịch", value: payments.length + " giao dịch", tone: "sky" },
          { label: "Lần thanh toán gần nhất", value: payments.length > 0 ? payments[0].d : "Chưa có", tone: "emerald" },
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
            <span key="code" className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{p.code}</span>,
            p.d,
            <span key="desc" className="text-muted-foreground">{p.desc}</span>,
            <Badge key="badge" tone={methodBadgeTone(p.method) as any}>{p.method}</Badge>,
            <span key="amount" className="font-display font-semibold">{p.amount.toLocaleString("vi-VN")} ₫</span>,
            <StatusPill key="status" value={p.status} />,
          ])}
        />
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10 text-[13px]">Không có giao dịch nào cho phương thức "{methodFilter}"</div>
        )}
      </Card>
    </div>
  );
}

type MyFeedback = { feedbackId: string; feedbackDate: string; feedbackContent: string; answerContent: string | null; feedbackType: string; createdAt?: string };
function MemberFeedback() {
  const [list, setList] = useState<MyFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);

  const fetchFeedbacks = () => {
    fetch("http://localhost:5000/api/v1/feedbacks/me", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("gymos_token")}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setList(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeedbacks();
    fetch("http://localhost:5000/api/v1/staffs")
      .then(res => res.json())
      .then(data => { if (data.success) setStaffList(data.data); });
    fetch("http://localhost:5000/api/v1/equipments")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setEquipmentList(data); });
  }, []);

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [fbType, setFbType] = useState<"Thiết bị" | "Nhân viên">("Thiết bị");
  const [ref, setRef] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deleting = deleteId ? list.find((f) => f.feedbackId === deleteId) : null;

  const submit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);

    let finalContent = content.trim();
    if (ref) {
      const refType = fbType === "Thiết bị" ? "Thiết bị liên quan" : "Nhân viên liên quan";
      finalContent = `[${refType}: ${ref}]\n\n${finalContent}`;
    }

    try {
      const res = await fetch("http://localhost:5000/api/v1/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("gymos_token")}`
        },
        body: JSON.stringify({
          feedbackType: fbType,
          feedbackContent: finalContent
        })
      });
      if (res.ok) {
        setContent(""); setRef(""); setOpen(false);
        fetchFeedbacks();
        toast.success("Gửi phản hồi thành công");
      } else {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        toast.error(errorData.message || "Có lỗi xảy ra khi gửi phản hồi!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteFeedback = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/feedbacks/${deleteId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("gymos_token")}` }
      });
      if (res.ok) {
        setDeleteId(null);
        fetchFeedbacks();
        toast.success("Xóa phản hồi thành công");
      } else {
        const data = await res.json();
        toast.error(data.message || "Lỗi khi xóa phản hồi");
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Phản hồi của tôi" sub={loading ? "Đang tải..." : `${list.length} phản hồi — theo dõi tiến độ xử lý`}
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Tạo phản hồi mới</Button>} />
      <div className="space-y-3">
        {list.map((f) => {
          const d = f.feedbackDate ? new Date(f.feedbackDate).toLocaleDateString("en-GB") : "";
          const s = f.answerContent ? "Đã phản hồi" : "Chờ xử lý";
          return (
            <Card key={f.feedbackId}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <span>Bạn · {d}</span>
                    <Badge tone={f.feedbackType === "Thiết bị" ? "amber" : "sky"}>{f.feedbackType}</Badge>
                    <StatusPill value={s} />
                  </div>
                  <p className="mt-2 text-[14px] whitespace-pre-wrap">{f.feedbackContent}</p>
                  {f.answerContent && (
                    <div className="mt-3 ml-4 pl-4 border-l-2 border-[#00C9A7]/40 bg-[#00C9A7]/[0.04] rounded-r-lg py-2.5 pr-3">
                      <div className="text-[11px] text-[#00866F] dark:text-[#5FE6CB]">Trả lời từ quản lý</div>
                      <p className="text-[13px] mt-1 whitespace-pre-wrap">{f.answerContent}</p>
                    </div>
                  )}
                </div>
                {!f.answerContent && (
                  <IconBtn icon={Trash2} tone="danger" onClick={() => setDeleteId(f.feedbackId)} />
                )}
              </div>
            </Card>
          );
        })}
        {!loading && list.length === 0 && (
          <Card><div className="text-center text-muted-foreground py-6 text-[13px]">Bạn chưa gửi phản hồi nào</div></Card>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tạo phản hồi mới"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button><Button icon={ArrowRight} disabled={isSubmitting} onClick={submit}>{isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}</Button></>}>
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
              <SearchableSelect
                value={ref}
                onChange={(e: any) => setRef(e.target.value)}
                options={[
                  { value: "", label: "— Không chọn —" },
                  ...equipmentList.map((i) => ({ value: i.equipmentCode, label: `${i.equipmentCode} — ${i.Room?.roomName}` }))
                ]}
              />
            </Field>
          )}
          {fbType === "Nhân viên" && (
            <Field label="Nhân viên liên quan (tùy chọn)">
              <SearchableSelect
                value={ref}
                onChange={(e: any) => setRef(e.target.value)}
                options={[
                  { value: "", label: "— Không chọn —" },
                  ...staffList.map((s) => ({ value: s.code, label: `${s.code} — ${s.name} (${s.role})` }))
                ]}
              />
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
          <Button icon={Trash2} disabled={isSubmitting} onClick={deleteFeedback}>{isSubmitting ? "Đang xóa..." : "Xóa phản hồi"}</Button>
        </>}>
        {deleting && (() => {
          const d = deleting.feedbackDate ? new Date(deleting.feedbackDate).toLocaleDateString("en-GB") : "";
          return (
            <div className="space-y-3">
              <div className="size-12 rounded-full bg-[#FF5C5C]/15 grid place-items-center"><Trash2 className="size-5 text-[#FF5C5C]" /></div>
              <p className="text-[14px]">Xóa phản hồi đã gửi ngày <span className="font-medium">{d}</span>?</p>
              <p className="text-[12.5px] text-muted-foreground line-clamp-2">"{deleting.feedbackContent}"</p>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

function TrainerDropdown({ trainerId, onChange, trainers, error, readonly }: { trainerId: string; onChange: (id: string) => void; trainers: any[]; error?: boolean; readonly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const selected = trainers.find((t) => (t.staffId || t.code) === trainerId);
  const suggestions = query ? trainers.filter(t => (t.staffName || t.name || "").toLowerCase().includes(query.toLowerCase()) || (t.staffCode || t.code || "").toLowerCase().includes(query.toLowerCase())) : trainers;

  return (
    <div className="relative" ref={ref}>
      {!selected ? (
        <div className="relative">
          <Input disabled={readonly} icon={Search} placeholder="Gõ tên hoặc mã HLV…" value={query} onChange={(e: any) => { setQuery(e.target.value); setOpen(true); }} onClick={() => !readonly && setOpen(true)} className={error ? "border-[#FF5C5C]/60 focus:border-[#FF5C5C] focus:ring-[#FF5C5C]/15" : ""} />
          {open && (
            <div className="absolute z-30 left-0 right-0 mt-1.5 rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
               <div className="max-h-[300px] overflow-y-auto">
                 {suggestions.length > 0 ? suggestions.map(t => {
                   const id = t.staffId || t.code;
                   const name = t.staffName || t.name;
                   const code = t.staffCode || t.code || "Không có mã";
                   return (
                     <button key={id} type="button" onClick={() => { onChange(id); setQuery(""); setOpen(false); }} className="w-full text-left px-3 py-2.5 border-b border-border/60 last:border-0 hover:bg-muted/60 transition flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-muted border border-border grid place-items-center text-[10px] font-mono">{name.split(" ").slice(-2).map((n: string) => n[0]).join("")}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium truncate">{name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{code}</div>
                        </div>
                     </button>
                   );
                 }) : (
                   <div className="px-3 py-3 text-[12.5px] text-muted-foreground">Không tìm thấy HLV nào.</div>
                 )}
               </div>
            </div>
          )}
        </div>
      ) : (
        <div className={cn("rounded-xl border bg-[#6C63FF]/8 dark:bg-[#6C63FF]/10 p-2 flex items-center gap-3", error ? "border-[#FF5C5C]/60" : "border-[#6C63FF]/40")}>
          <div className="size-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#3F39C7] grid place-items-center text-white font-display font-semibold text-[11px]">
            {(selected.staffName || selected.name).split(" ").slice(-2).map((n: string) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[13px] font-medium truncate">{selected.staffName || selected.name}</div>
            <div className="text-[11px] text-muted-foreground font-mono">{selected.staffCode || selected.code || "Không có mã"}</div>
          </div>
          {!readonly && <button type="button" onClick={() => { onChange(""); setQuery(""); setOpen(true); }} className="size-7 rounded-md hover:bg-accent grid place-items-center"><X className="size-3.5" /></button>}
        </div>
      )}
    </div>
  );
}

function PackageDropdown({ pkgId, onChange, packages }: { pkgId: string; onChange: (id: string) => void; packages: any[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const selected = packages.find((p) => p.packageId === pkgId);
  const suggestions = query ? packages.filter(p => p.packageName?.toLowerCase().includes(query.toLowerCase()) || p.packageCode?.toLowerCase().includes(query.toLowerCase())) : packages;

  const renderRow = (p: any, inList: boolean) => {
    const isSession = p.packageType === "session";
    const durationLabel = isSession ? `${p.numberOfWorkout || 0} buổi` : `${p.duration || 0} ${p.durationUnit || "tháng"}`;
    const perks = [
      isSession ? `${durationLabel} (theo lượt tập)` : `Tập không giới hạn trong ${durationLabel}`,
      p.vipIncluded ? "Phòng tắm VIP + tủ đồ riêng" : "Sử dụng toàn bộ khu vực tập luyện",
      p.trainerIncluded ? "Có Huấn luyện viên 1-kèm-1" : "Tự tập theo lịch cá nhân",
    ];
    return (
      <div className="flex items-start gap-3 w-full">
        <div className="size-10 rounded-lg bg-muted border border-border grid place-items-center shrink-0">
          <CreditCard className="size-4 text-[#4F46E5] dark:text-[#A8A2FF]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[11px] text-muted-foreground">{p.packageCode}</span>
              <span className="font-display font-semibold text-[14px] truncate">{p.packageName}</span>
            </div>
            <div className="font-display font-bold text-[15px] whitespace-nowrap">{Number(p.price).toLocaleString("vi-VN")} ₫</div>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge tone="sky">{durationLabel}</Badge>
            {p.vipIncluded && <Badge tone="amber">★ VIP</Badge>}
            {p.trainerIncluded && <Badge tone="violet">Có HLV</Badge>}
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
      {!selected ? (
        <div className="relative">
          <Input icon={Search} placeholder="Gõ tên hoặc mã gói tập…" value={query} onChange={(e: any) => { setQuery(e.target.value); setOpen(true); }} onClick={() => setOpen(true)} />
          {open && (
            <div className="absolute z-30 left-0 right-0 mt-1.5 rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
               <div className="max-h-[360px] overflow-y-auto py-1">
                 {suggestions.length > 0 ? suggestions.map(p => (
                   <button key={p.packageId} type="button" onClick={() => { onChange(p.packageId); setQuery(""); setOpen(false); }} className="w-full text-left px-3 py-3 border-b border-border/60 last:border-0 hover:bg-muted/60 transition">
                     {renderRow(p, true)}
                   </button>
                 )) : (
                   <div className="px-3 py-3 text-[12.5px] text-muted-foreground">Không tìm thấy gói tập nào.</div>
                 )}
               </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-[#6C63FF]/40 bg-[#6C63FF]/8 dark:bg-[#6C63FF]/10 p-2 pr-3 flex items-start gap-3">
          <div className="flex-1 min-w-0 text-left">
            {renderRow(selected, false)}
          </div>
          <button type="button" onClick={() => { onChange(""); setQuery(""); setOpen(true); }} className="size-7 rounded-md hover:bg-[#6C63FF]/20 grid place-items-center mt-1"><X className="size-3.5" /></button>
        </div>
      )}
    </div>
  );
}

function Renew({ onBack, memberName, memberId }: { onBack?: () => void; memberName?: string; memberId?: string }) {
  const [pkgId, setPkgId] = useState<string>("");
  const [selected, setSelected] = useState<string | null>(null);
  const [method, setMethod] = useState<"card" | "qr" | "cash">("card");
  const [pay, setPay] = useState<"card" | "qr" | "cash" | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [trainerId, setTrainerId] = useState("");
  const [trainerList, setTrainerList] = useState<any[]>([]);
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("gymos_user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const isTrainer = currentUser.role === "pt" || currentUser.role === "trainer" || currentUser.role === "Huấn luyện viên";

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/packages")
      .then(res => res.json())
      .then(data => {
        if (data.success) setPackages(data.data.filter((p: any) => p.isActive));
      });

    fetch("http://localhost:5000/api/v1/staffs", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("gymos_token")}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const tList = (data.data || []).filter((s: any) => s.role === "Huấn luyện viên" && s.status === "Đang làm");
          setTrainerList(tList);
          if (isTrainer) {
            const me = tList.find((t: any) => t.userId === currentUser.id || t.userId === currentUser.userId || t.email === currentUser.email || t.staffName === currentUser.name);
            if (me) setTrainerId(me.staffId || me.code);
          }
        }
      });

    if (memberId) {
      fetch(`http://localhost:5000/api/v1/members/${memberId}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("gymos_token")}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.member) {
             setCurrentPlan(data.data.member.activePlan);
          }
        });
    } else {
      fetch("http://localhost:5000/api/v1/subscriptions/me", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("gymos_token")}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.subscriptions) {
            const active = data.data.subscriptions.filter((s: any) => s.status === "active").sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            if (active) setCurrentPlan(active);
          }
        });
    }
  }, []);

  const sub = memberName ? `Chọn gói tập cho học viên ${memberName}` : "Chọn gói phù hợp để tiếp tục hành trình của bạn";
  if (pay) {
    const pkg = packages.find((p) => p.packageId === selected);
    return <Payment memberId={memberId} kind={pay} mode="renew" pkgId={selected!} pkg={{ name: pkg?.packageName, price: Number(pkg?.price) || 0 }} trainerId={trainerId} onBack={() => { setPay(null); setSelected(null); setTrainerId(""); }} onComplete={() => {
      if (memberId && onBack) onBack();
      else navigate("/history");
    }} />;
  }

  const calDaysRemain = (expireDate: string) => {
    return Math.max(0, getDiffDays(expireDate) ?? 0);
  };

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
            {currentPlan ? (
              <>
                <h3 className="font-display text-[20px] mt-2">{currentPlan.SubscriptionPackage?.packageName || "Gói không xác định"}</h3>
                <div className="text-[12.5px] text-muted-foreground">Còn {calDaysRemain(currentPlan.expireDate)} ngày — Hết hạn {new Date(currentPlan.expireDate).toLocaleDateString("en-GB")}</div>
              </>
            ) : (
              <>
                <h3 className="font-display text-[20px] mt-2 text-muted-foreground">Chưa có gói tập</h3>
                <div className="text-[12.5px] text-muted-foreground">Bạn chưa đăng ký gói tập nào hoặc gói đã hết hạn.</div>
              </>
            )}
          </div>
          <Badge tone={currentPlan ? "emerald" : "zinc"}>{currentPlan ? "Đang hoạt động" : "Không có gói"}</Badge>
        </div>
      </Card>
      <Card>
        <h3 className="font-display mb-4">Chọn gói gia hạn</h3>
        <Field label="Gói tập">
          <PackageDropdown pkgId={pkgId} onChange={setPkgId} packages={packages} />
        </Field>
        {pkgId && (
          <div className="mt-5 flex justify-end">
            <Button icon={ArrowRight} onClick={() => setSelected(pkgId)}>Tiếp tục với gói đã chọn</Button>
          </div>
        )}
      </Card>

      <Modal open={!!selected} onClose={() => { setSelected(null); setTrainerId(""); }} title={`Thanh toán gói — ${packages.find((p) => p.packageId === selected)?.packageName ?? ""}`} wide
        footer={<>
          <Button variant="ghost" onClick={() => { setSelected(null); setTrainerId(""); }}>Hủy</Button>
          <Button icon={ArrowRight} onClick={() => {
            const pkg = packages.find((p) => p.packageId === selected);
            if (pkg?.trainerIncluded && !trainerId) {
              toast.error("Vui lòng chọn huấn luyện viên cho gói tập này");
              return;
            }
            setPay(method);
          }}>Tiến hành thanh toán</Button>
        </>}>
        {selected && (() => {
          const pkg = packages.find((p) => p.packageId === selected)!;
          const isSession = pkg.packageType === "session";
          const durationLabel = isSession ? `${pkg.numberOfWorkout || 0} buổi` : `${pkg.duration || 0} ${pkg.durationUnit || "tháng"}`;
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/70">
                <div>
                  <div className="font-display font-semibold text-[16px]">{pkg.packageName}</div>
                  <div className="text-[12.5px] text-muted-foreground">{durationLabel}</div>
                </div>
                <div className="font-display font-bold text-[22px]">{Number(pkg.price).toLocaleString("vi-VN")} ₫</div>
              </div>
              <Field label="Phương thức thanh toán">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: "card", l: "Thẻ NH", i: CreditCard },
                    { k: "qr", l: "QR Code", i: QrCode },
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
              {pkg.trainerIncluded && (
                <Field label="Huấn luyện viên">
                  <TrainerDropdown trainerId={trainerId} onChange={setTrainerId} trainers={trainerList} error={!trainerId} readonly={isTrainer} />
                </Field>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

/* ── PT students ── */
function PtStudents({ onSelect, title, sub }: { onSelect: (id: string) => void; title?: string; sub?: string }) {
  const [list, setList] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");

  const token = localStorage.getItem("gymos_token");
  const headers: any = { Authorization: `Bearer ${token}` };

  const computeStatus = (plan: any): string => {
    if (!plan) return "Chưa có gói";
    const expire = getExpireDate(plan);
    if (!expire) return "Đang hoạt động";
    const diff = getDiffDays(expire) ?? 0;
    if (diff < 0) return "Đã hết hạn";
    if (diff <= 14) return "Sắp hết hạn";
    return "Đang hoạt động";
  };

  const formatRemain = (plan: any): string => {
    if (!plan) return "—";
    const expire = getExpireDate(plan);
    if (expire) return expire.toLocaleDateString("en-GB");
    return "—";
  };

  const fetchStudents = () => {
    const params = query.trim() ? `?search=${encodeURIComponent(query.trim())}` : "";
    fetch(`http://localhost:5000/api/v1/members/my-students${params}`, { headers })
      .then(r => r.json())
      .then(res => {
        if (res.success) setList(res.data.members);
      });
  };

  useEffect(() => { fetchStudents(); }, [query]);

  const filtered = list.filter((m) =>
    statusFilter === "Tất cả" || computeStatus(m.activePlan) === statusFilter
  );

  return (
    <div className="space-y-5">
      <SectionTitle title={title || "Học viên của tôi"} sub={sub || `Bạn đang phụ trách ${list.length} học viên`} />
      <div className="flex flex-wrap items-center gap-3">
        <Input icon={Search} placeholder="Tìm theo tên, SĐT, mã HV…" className="max-w-md" value={query} onChange={(e: any) => setQuery(e.target.value)} />
        <SearchableSelect
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="w-[180px]"
          options={[
            { value: "Tất cả", label: "Tất cả trạng thái" },
            ...MEMBER_STATUSES.map((s) => ({ value: s, label: s }))
          ]}
        />
      </div>
      <Card padded={false}>
        <DataTable
          head={["Mã HV", "Họ tên", "SĐT", "Gói tập", "Hạn / Buổi còn lại", "Trạng thái", ""]}
          rows={filtered.map((m) => [
            <span className="font-mono text-[12px] text-[#4F46E5] dark:text-[#A8A2FF]">{m.memberId.substring(0, 8).toUpperCase()}</span>,
            <button onClick={() => onSelect(m.memberId)} className="font-medium hover:text-[#4F46E5] dark:text-[#A8A2FF]">{m.memberName}</button>,
            <span className="font-mono text-[12.5px]">{m.phoneNumber || "—"}</span>,
            <Badge tone="violet">{m.activePlan?.SubscriptionPackage?.packageName ?? "Chưa có gói"}</Badge>,
            <span className="text-muted-foreground">{formatRemain(m.activePlan)}</span>,
            <StatusPill value={computeStatus(m.activePlan)} />,
            <div className="flex items-center justify-end gap-0.5">
              <IconBtn icon={Eye} onClick={() => onSelect(m.memberId)} />
            </div>,
          ])}
        />
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10 text-[13px]">Không có học viên nào khớp với bộ lọc</div>
        )}
      </Card>
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
  return <MemberDetail id={id!} onBack={() => navigate(base)} onRenew={() => navigate("/renew?memberId=" + id)} disablePackage={disablePackage} readonly={readonly} />;
}
function RenewWrapper({ role }: { role: Role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const memberId = params.get("memberId") || undefined;

  if (role === "trainer" && !memberId) {
    return <PtStudents 
      onSelect={(id) => navigate(`/renew?memberId=${id}`)} 
      title="Chọn hội viên gia hạn" 
      sub="Vui lòng chọn một học viên để tiếp tục gia hạn gói tập" 
    />;
  }

  return <Renew memberId={memberId} onBack={role === "staff" ? () => navigate("/members") : role === "trainer" ? () => navigate("/students") : undefined} />;
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
  const [role, setRole] = useState<Role>(() => {
    let rawRole = localStorage.getItem("gymos_role");
    if (!rawRole || rawRole === "undefined" || rawRole === "null") rawRole = "member";
    return (rawRole as any) === "manager" ? "staff" : (rawRole as any) === "pt" ? "trainer" : (rawRole as Role);
  });
  const [user, setUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem("gymos_user");
      return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
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
  const [submittingEdit, setSubmittingEdit] = useState(false);
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

  const handleLogout = () => {
    setAuthed(false);
    setUser(null);
    localStorage.removeItem("gymos_authed");
    localStorage.removeItem("gymos_role");
    localStorage.removeItem("gymos_user");
    localStorage.removeItem("gymos_token");
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/login" element={
        !authed ? (
          <div className={cn(theme === "dark" && "dark", "bg-background text-foreground")}>
            <Login onEnter={(r, u) => { setRole(r); setUser(u); setAuthed(true); navigate("/"); }} theme={theme} onToggleTheme={toggleTheme} />
          </div>
        ) : (
          <Navigate to="/" replace />
        )
      } />
      <Route path="/*" element={
        authed ? (
          <div className={cn(theme === "dark" && "dark", "min-h-screen flex bg-background text-foreground")}>
            <Sidebar role={role} user={user} theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} />

            <div className="flex-1 min-w-0 flex flex-col">
              <Header role={role} user={user} breadcrumb={breadcrumb} onLogout={handleLogout} />
              <main className="flex-1 p-7 max-w-[1440px] w-full mx-auto">
                <Routes>
                  <Route path="/" element={<HomeWidgets role={role} user={user} />} />

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
                  loading={submittingEdit}
                  onCancel={() => setEditStaff(null)}
                  onSubmit={async (data) => {
                    setSubmittingEdit(true);
                    try {
                      const res = await fetch(`http://localhost:5000/api/v1/staffs/${editingStaff.code}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                      });
                      const resData = await res.json();
                      if (resData.success) {
                        toast.success("Cập nhật thông tin thành công");
                        fetchStaffs();
                        setEditStaff(null);
                      } else {
                        toast.error(resData.message || "Lỗi khi cập nhật");
                      }
                    } catch {
                      toast.error("Lỗi kết nối máy chủ");
                    } finally {
                      setSubmittingEdit(false);
                    }
                  }}
                />
              )}
            </Modal>
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
    </Routes>
  );
}