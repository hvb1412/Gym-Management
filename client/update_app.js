import fs from 'fs';

const filePath = 'src/app/App.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add imports
content = content.replace(
  'import { createPortal } from "react-dom";',
  'import { createPortal } from "react-dom";\nimport { Routes, Route, useNavigate, useLocation, Navigate, useParams } from "react-router";'
);

// 2. Modify Sidebar
content = content.replace(
  'function Sidebar({ role, view, setView, theme, onToggleTheme, onLogout }: { role: Role; view: string; setView: (v: string) => void; theme: "light" | "dark"; onToggleTheme: () => void; onLogout: () => void }) {',
  'function Sidebar({ role, theme, onToggleTheme, onLogout }: { role: Role; theme: "light" | "dark"; onToggleTheme: () => void; onLogout: () => void }) {\n  const location = useLocation();\n  const navigate = useNavigate();\n  const view = location.pathname === "/" ? "home" : location.pathname.slice(1).replace(/\\//g, ".");'
);
content = content.replace(
  'onClick={() => { item.children ? setOpen(isOpen ? null : item.id) : setView(item.id); }}',
  'onClick={() => { item.children ? setOpen(isOpen ? null : item.id) : navigate(item.id === "home" ? "/" : "/" + item.id.replace(/\\./g, "/")); }}'
);
content = content.replace(
  'onClick={() => setView(c.id)}',
  'onClick={() => navigate("/" + c.id.replace(/\\./g, "/"))}'
);

// 3. Modify HomeWidgets
// Add useNavigate to HomeWidgets, change setView
content = content.replace(
  'function HomeWidgets({ role, setView }: { role: Role; setView: (v: string) => void }) {',
  'function HomeWidgets({ role }: { role: Role }) {\n  const navigate = useNavigate();\n  const setView = (v: string) => navigate(v === "home" ? "/" : "/" + v.replace(/\\./g, "/"));'
);

// 4. Create wrappers for detail components that read params
const wrappers = `
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
  const view = location.pathname.slice(1).replace(/\\//g, ".");
  return <Reports view={view} />;
}
`;

// Insert wrappers before export default function App()
content = content.replace(
  'export default function App() {',
  wrappers + '\nexport default function App() {'
);

// 5. Modify App Component
const appReplacement = `export default function App() {
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
        title={\`Sửa thông tin nhân sự — \${editingStaff?.name ?? ""}\`}
        wide>
        {editingStaff && (
          <StaffForm 
            data={editingStaff} 
            onCancel={() => setEditStaff(null)}
            onSubmit={(data) => {
              fetch(\`http://localhost:5000/api/v1/staffs/\${editingStaff.code}\`, {
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
}`;

const oldAppStart = content.indexOf('export default function App() {');
content = content.substring(0, oldAppStart) + appReplacement;

fs.writeFileSync(filePath, content, 'utf-8');
console.log('App.tsx updated successfully');
