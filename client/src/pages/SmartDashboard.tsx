import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line,
} from "recharts";
import {
  Activity, AlertTriangle, CheckCircle, Database, RefreshCw, ArrowUpRight,
  TrendingUp, TrendingDown, Factory, Eye, Clock, ChevronLeft, ChevronRight,
  Search, Save, Trash2, Printer, FileSpreadsheet, Download, LogIn, LogOut,
  Coffee, Target, Shield, Zap, Bell, User, BarChart2, Plus,
  ShoppingCart, FileText, Truck, CreditCard, RotateCcw
} from "lucide-react";
import SmartFactoryWrapper from "@/components/SmartFactoryWrapper";

/* ─────────────────── 타입 ─────────────────── */
type Stats = {
  total: number; ng: number; ok: number;
  distribution: { type: string; count: number }[];
  trend: { time: string; result: string }[];
};

/* ─────────────────── 정적 샘플 데이터 ─────────────────── */
const productionData = [
  { time: "08:00", target: 100, actual: 92,  defect: 8  },
  { time: "09:00", target: 100, actual: 98,  defect: 3  },
  { time: "10:00", target: 100, actual: 105, defect: 2  },
  { time: "11:00", target: 100, actual: 88,  defect: 12 },
  { time: "12:00", target: 100, actual: 95,  defect: 5  },
  { time: "13:00", target: 100, actual: 102, defect: 4  },
  { time: "14:00", target: 100, actual: 97,  defect: 7  },
  { time: "15:00", target: 100, actual: 110, defect: 1  },
  { time: "16:00", target: 100, actual: 93,  defect: 9  },
];
const processData = [
  { name: "조립라인A", 생산량: 245, 목표: 260, 불량: 12 },
  { name: "조립라인B", 생산량: 189, 목표: 200, 불량:  8 },
  { name: "도장라인",  생산량: 312, 목표: 300, 불량: 15 },
  { name: "검사라인",  생산량: 178, 목표: 180, 불량:  3 },
  { name: "포장라인",  생산량: 290, 목표: 280, 불량:  6 },
];
const announcements = [
  "📢 2026년 3월 품질 목표: 불량률 1% 이하 달성을 위해 전 라인 점검 실시",
  "🔧 4월 1일 설비 정기점검 예정 — 조립라인A 일시 중단",
  "🏆 2월 우수 품질 달성 — 포장라인 팀 수상",
  "📋 3월 14일 ISO 9001 내부 감사 예정",
];
const bulletins = [
  { id: 1, date: "03/14", title: "3월 생산계획 배포 완료", tag: "공지", color: "blue"  },
  { id: 2, date: "03/13", title: "불량 유형별 대응 매뉴얼 업데이트", tag: "자료", color: "green" },
  { id: 3, date: "03/12", title: "스마트팩토리 실습 일정 안내",     tag: "일정", color: "purple" },
  { id: 4, date: "03/11", title: "AI 비전 시스템 정확도 98.2% 달성",  tag: "성과", color: "orange" },
  { id: 5, date: "03/10", title: "3분기 품질지표 결과 보고서",        tag: "보고", color: "red"  },
];
const CHART_COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6"];
const DONUT_OK_NG  = [
  { name: "양품 (OK)", value: 84 },
  { name: "불량 (NG)", value: 16 },
];
const DONUT_COLORS = ["#10b981", "#ef4444"];

/* ─────────────────── 미니 캘린더 ─────────────────── */
function MiniCalendar() {
  const [cur, setCur] = useState(new Date());
  const today = new Date();
  const y = cur.getFullYear(), m = cur.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const highlighted = [3, 7, 14, 21, 24];
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="text-xs select-none">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setCur(new Date(y, m - 1))} className="p-0.5 hover:bg-slate-100 rounded transition-colors">
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
        </button>
        <span className="font-bold text-slate-700">{y}년 {m + 1}월</span>
        <button onClick={() => setCur(new Date(y, m + 1))} className="p-0.5 hover:bg-slate-100 rounded transition-colors">
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center gap-y-0.5">
        {["일","월","화","수","목","금","토"].map((d) => (
          <div key={d} className={`py-0.5 font-semibold text-[10px] ${d==="일"?"text-red-400":d==="토"?"text-blue-400":"text-slate-400"}`}>{d}</div>
        ))}
        {days.map((day, i) => {
          const isToday = day===today.getDate() && m===today.getMonth() && y===today.getFullYear();
          const isSun = i % 7 === 0;
          const isSat = i % 7 === 6;
          const isHL  = day && highlighted.includes(day);
          return (
            <div key={i} className={`py-1 rounded-full mx-auto w-6 h-6 flex items-center justify-center cursor-pointer transition-all text-[11px] ${
              !day ? "" :
              isToday ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-300" :
              isHL    ? "bg-blue-100 text-blue-700 font-semibold" :
              isSun   ? "text-red-400 hover:bg-red-50" :
              isSat   ? "text-blue-400 hover:bg-blue-50" :
              "text-slate-600 hover:bg-slate-100"
            }`}>
              {day || ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────── 애니메이션 숫자 카운터 ─────────────────── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}{suffix}</>;
}

/* ─────────────────── 툴바 버튼 ─────────────────── */
function ToolBtn({ icon: Icon, label, variant = "default" }: { icon: React.ElementType; label: string; variant?: "default"|"primary"|"danger" }) {
  const cls = {
    default: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300",
    primary: "bg-blue-600 border border-blue-600 text-white hover:bg-blue-700",
    danger:  "bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200",
  }[variant];
  return (
    <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium shadow-sm transition-all active:scale-95 ${cls}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

/* ─────────────────── 메인 컴포넌트 ─────────────────── */
export default function SmartDashboard() {
  const queryClient = useQueryClient();
  const [annIdx, setAnnIdx] = useState(0);
  const [now, setNow] = useState(new Date());

  // 실시간 시계
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // 공지사항 자동 롤링
  useEffect(() => {
    const t = setInterval(() => setAnnIdx(i => (i + 1) % announcements.length), 4000);
    return () => clearInterval(t);
  }, []);

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/vision/stats"],
    refetchInterval: 5000,
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/seed", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vision/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vision/logs"] });
    },
  });

  const total   = stats?.total ?? 50;
  const ok      = stats?.ok    ?? 42;
  const ng      = stats?.ng    ?? 8;
  const rate    = total > 0 ? ((ok / total) * 100).toFixed(1) : "0";
  const ngRate  = total > 0 ? ((ng / total) * 100).toFixed(1) : "0";
  const topDefect = stats?.distribution?.[0]?.type ?? "Dent";

  const pieData = stats?.distribution?.length
    ? stats.distribution
    : [{ type: "Dent", count: 3 }, { type: "Scratch", count: 5 }, { type: "Stain", count: 2 }];

  const todayStr = now.toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric", weekday:"short" });
  const timeStr  = now.toLocaleTimeString("ko-KR", { hour:"2-digit", minute:"2-digit", second:"2-digit" });

  return (
    <SmartFactoryWrapper>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse2 {
          0%,100%{opacity:1} 50%{opacity:.4}
        }
        @keyframes slideLeft {
          from{transform:translateX(16px);opacity:0}
          to{transform:translateX(0);opacity:1}
        }
        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        @keyframes shimmerText {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .anim-up  { animation: fadeSlideUp .45s ease both; }
        .anim-in  { animation: fadeIn .5s ease both; }
        .anim-sl  { animation: slideLeft .4s ease both; }
        .live-dot { animation: pulse2 1.4s infinite; }
        .card-hover { transition: transform .2s, box-shadow .2s; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -4px rgba(0,0,0,.12); }
        .shimmer-text {
          background-size: 200% auto;
          animation: shimmerText 4s linear infinite;
        }
      `}</style>

      {/* ── 툴바 ── */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 p-2 bg-white rounded-xl border border-slate-200 shadow-sm anim-up" style={{animationDelay:".0s"}}>
        <ToolBtn icon={Search}        label="조회 (F5)"     />
        <ToolBtn icon={Plus}          label="신규 (F2)"     variant="primary" />
        <ToolBtn icon={Save}          label="저장 (F10)"    />
        <ToolBtn icon={Trash2}        label="삭제 (F4)"     variant="danger" />
        <div className="w-px h-5 bg-slate-200 mx-0.5" />
        <ToolBtn icon={Printer}       label="인쇄 (F9)"     />
        <ToolBtn icon={FileSpreadsheet} label="엑셀변환 (Ctrl+E)" />
        <ToolBtn icon={Download}      label="엑셀입력 (Ctrl+H)" />
      </div>

      {/* ── 사용자 정보 바 ── */}
      <div className="flex flex-wrap items-center gap-3 mb-3 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm anim-up" style={{animationDelay:".05s"}}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">관리자님</div>
            <div className="text-[10px] text-slate-400">사업장: 품질재단실습</div>
          </div>
        </div>
        <div className="h-5 w-px bg-slate-200" />
        <div className="flex gap-1.5">
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 transition-colors active:scale-95">
            <LogIn className="w-3 h-3" /> 출근
          </button>
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold hover:bg-red-100 transition-colors active:scale-95">
            <LogOut className="w-3 h-3" /> 퇴근
          </button>
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold hover:bg-amber-100 transition-colors active:scale-95">
            <Coffee className="w-3 h-3" /> 휴가
          </button>
        </div>
        <div className="h-5 w-px bg-slate-200" />
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <input type="date" defaultValue="2025-12-14" className="border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-600 focus:outline-none focus:border-blue-400" />
          <span className="text-slate-300">~</span>
          <input type="date" defaultValue="2026-03-14" className="border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-600 focus:outline-none focus:border-blue-400" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-700">{todayStr}</div>
            <div className="text-[11px] font-mono text-blue-600 font-bold">{timeStr}</div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            <span className="text-[10px] font-bold text-blue-600">LIVE</span>
          </div>
        </div>
      </div>

      {/* ── KPI 카드 5개 ── */}
      <div className="grid grid-cols-5 gap-3 mb-3">
        {[
          { id: 1, title: "ORDER 현황", val1: 3574, val2: 21255489, icon: ShoppingCart, bg: "from-[#F0F7FF] to-[#E0F0FF]/50", numColor: "from-blue-500 to-indigo-500", subColor: "text-blue-400" },
          { id: 2, title: "수출 신고 현황", val1: 0, val2: 0, icon: FileText, bg: "from-[#F4FAF6] to-[#E6F5EA]/50", numColor: "from-emerald-400 to-green-500", subColor: "text-emerald-500" },
          { id: 3, title: "납품 현황", val1: 0, val2: 0, icon: Truck, bg: "from-[#FFFDF0] to-[#FFF8D6]/50", numColor: "from-amber-400 to-orange-500", subColor: "text-amber-500" },
          { id: 4, title: "매출 마감 현황", val1: 11334, val2: 6487173, icon: CreditCard, bg: "from-[#F9F5FF] to-[#F3EBFF]/50", numColor: "from-purple-500 to-fuchsia-500", subColor: "text-purple-400" },
          { id: 5, title: "반입 현황", val1: 0, val2: 0, icon: RotateCcw, bg: "from-[#FFF5F7] to-[#FFEBF0]/50", numColor: "from-rose-400 to-pink-500", subColor: "text-rose-400" },
        ].map((kpi, i) => (
          <div key={i} className="anim-up card-hover flex flex-col h-[180px]" style={{animationDelay:`${0.1 + i * 0.05}s`}}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full relative">
               {/* Header (White background, moving animation, gradient text) */}
               <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2 bg-white z-10 shrink-0 relative overflow-hidden">
                  <div className="w-[22px] h-[22px] rounded-full bg-blue-50 text-blue-600 text-[11px] font-black flex items-center justify-center shrink-0 z-10 shadow-sm border border-blue-100">
                    {kpi.id}
                  </div>
                  <span className="text-[13px] font-bold shimmer-text bg-gradient-to-r from-slate-800 via-slate-400 to-slate-800 bg-clip-text text-transparent z-10">
                    {kpi.title}
                  </span>
                  {/* Moving shine animation over header */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-[shine_3s_infinite]" />
               </div>
               
               {/* Body (Faint gradient background) */}
               <div className={`flex-1 bg-gradient-to-b ${kpi.bg} p-4 flex flex-col items-center justify-center relative overflow-hidden`}>
                  {/* Big Number */}
                  <div className={`text-[32px] leading-none font-black shimmer-text bg-gradient-to-r ${kpi.numColor} bg-clip-text text-transparent z-10`}>
                    <AnimatedNumber value={kpi.val1} />
                  </div>
                  
                  {/* Divider */}
                  <div className="w-12 h-px bg-slate-300/40 my-2 z-10" />
                  
                  {/* Sub Number */}
                  <div className={`text-[14px] font-bold ${kpi.subColor} z-10`}>
                    <AnimatedNumber value={kpi.val2} />
                  </div>
                  
                  {/* Background Icon */}
                  <kpi.icon className="absolute w-24 h-24 text-slate-900 opacity-[0.03] right-[-10px] bottom-[-10px] pointer-events-none transform -rotate-12" />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 차트 섹션 ── */}
      <div className="grid grid-cols-12 gap-3 mb-3">

        {/* 설비 생산 현황 (대형 영역 차트) */}
        <div className="col-span-12 lg:col-span-7 anim-up flex flex-col" style={{animationDelay:".35s"}}>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm card-hover overflow-hidden flex-1 flex flex-col">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 shrink-0" />
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="relative">
                  <div className="absolute -top-1 left-0 text-[32px] font-black text-slate-50 leading-none pointer-events-none select-none">생산현황</div>
                  <div className="relative">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-blue-500" /> 설비 생산 현황
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">시간대별 목표 vs 실적 vs 불량</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                  <span className="live-dot w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> 실시간
                </span>
              </div>
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={productionData} margin={{ top:4, right:8, left:-8, bottom:0 }}>
                  <defs>
                    <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #e2e8f0", fontSize:11, boxShadow:"0 4px 12px rgba(0,0,0,.08)" }} />
                  <Legend wrapperStyle={{ fontSize:10 }} />
                  <Area type="monotone" dataKey="target" fill="url(#gradTarget)" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" name="목표" dot={false} />
                  <Area type="monotone" dataKey="actual" fill="url(#gradActual)" stroke="#3b82f6" strokeWidth={2} name="실적" dot={{ r:3, fill:"#3b82f6" }} />
                  <Line type="monotone" dataKey="defect" stroke="#ef4444" strokeWidth={2} name="불량" dot={{ r:3, fill:"#ef4444" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 우측: 도넛 차트 + 캘린더 */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-3">

          {/* 품질 현황 도넛 */}
          <div className="anim-up" style={{animationDelay:".38s"}}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm card-hover overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
              <div className="p-4">
                <div className="relative mb-1">
                  <div className="absolute -top-1 left-0 text-[26px] font-black text-slate-50 leading-none pointer-events-none select-none">품질현황</div>
                  <h3 className="relative text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-500" /> 양품 / 불량 비율
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <ResponsiveContainer width={110} height={110}>
                    <PieChart>
                      <Pie data={DONUT_OK_NG} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270}>
                        {DONUT_OK_NG.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize:10, borderRadius:6 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />양품 (OK)</span>
                      <span className="text-[12px] font-bold text-emerald-600">{rate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{width:`${rate}%`}} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />불량 (NG)</span>
                      <span className="text-[12px] font-bold text-red-500">{ngRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-red-500 h-1.5 rounded-full transition-all" style={{width:`${ngRate}%`}} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 캘린더 */}
          <div className="anim-up flex-1 flex flex-col" style={{animationDelay:".41s"}}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm card-hover flex-1 flex flex-col">
              <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600 shrink-0" />
              <div className="p-4 flex-1 flex flex-col justify-center">
                <div className="relative mb-3">
                  <div className="absolute -top-1 left-0 text-[26px] font-black text-slate-50 leading-none pointer-events-none select-none">캘린더</div>
                  <h3 className="relative text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-500" /> 캘린더
                  </h3>
                </div>
                <MiniCalendar />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 하단 섹션: 공정 바차트 + 불량유형 파이 + 게시판 ── */}
      <div className="grid grid-cols-12 gap-3">

        {/* 공정 생산 현황 (가로 바차트) */}
        <div className="col-span-12 lg:col-span-5 anim-up" style={{animationDelay:".44s"}}>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm card-hover overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="p-4">
              <div className="relative mb-3">
                <div className="absolute -top-1 left-0 text-[26px] font-black text-slate-50 leading-none pointer-events-none select-none">공정현황</div>
                <h3 className="relative text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Factory className="w-4 h-4 text-amber-500" /> 공정 생산 현황
                </h3>
                <p className="text-[10px] text-slate-400">라인별 목표 vs 실적</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={processData} layout="vertical" margin={{ left:8, right:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize:10, fill:"#64748b" }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip contentStyle={{ borderRadius:8, fontSize:11, border:"1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize:10 }} />
                  <Bar dataKey="목표" fill="#e2e8f0" name="목표" radius={[0,3,3,0]} barSize={8} />
                  <Bar dataKey="생산량" fill="#f59e0b" name="실적" radius={[0,3,3,0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 불량 유형 파이차트 */}
        <div className="col-span-12 lg:col-span-3 anim-up" style={{animationDelay:".47s"}}>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm card-hover overflow-hidden h-full">
            <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
            <div className="p-4">
              <div className="relative mb-2">
                <div className="absolute -top-1 left-0 text-[22px] font-black text-slate-50 leading-none pointer-events-none select-none">불량유형</div>
                <h3 className="relative text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-500" /> 불량 유형 분석
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="count" nameKey="type"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0)*100).toFixed(0)}%`}
                    labelLine={true}>
                    {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius:8, fontSize:10, border:"1px solid #e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 게시판 */}
        <div className="col-span-12 lg:col-span-4 anim-up" style={{animationDelay:".5s"}}>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm card-hover overflow-hidden h-full">
            <div className="h-1 bg-gradient-to-r from-slate-600 to-slate-800" />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="relative">
                  <div className="absolute -top-1 left-0 text-[22px] font-black text-slate-50 leading-none pointer-events-none select-none">게시판</div>
                  <h3 className="relative text-sm font-bold text-slate-800">📋 게시판</h3>
                </div>
                <button className="text-[10px] text-blue-600 hover:underline font-semibold">+ 글쓰기</button>
              </div>
              <div className="space-y-1.5">
                {bulletins.map((b) => {
                  const tagCls: Record<string, string> = {
                    blue:   "bg-blue-100 text-blue-700",
                    green:  "bg-emerald-100 text-emerald-700",
                    purple: "bg-purple-100 text-purple-700",
                    orange: "bg-amber-100 text-amber-700",
                    red:    "bg-red-100 text-red-700",
                  };
                  return (
                    <div key={b.id} className="flex items-center gap-2 py-1.5 border-b border-slate-50 hover:bg-slate-50 rounded px-1 cursor-pointer transition-colors group">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${tagCls[b.color]}`}>{b.tag}</span>
                      <span className="text-[11px] text-slate-700 flex-1 truncate group-hover:text-blue-600 transition-colors">{b.title}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{b.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 하단 액션 바 ── */}
      <div className="flex items-center justify-between mt-3 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm anim-in" style={{animationDelay:".55s"}}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-xs font-medium text-slate-600 transition-all active:scale-95 disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5" />
            {seedMutation.isPending ? "생성 중..." : "데이터 리셋 (샘플생성)"}
          </button>
          <button
            onClick={() => queryClient.invalidateQueries()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium text-white shadow-sm transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 새로고침
          </button>
        </div>
        <div className="text-[10px] text-slate-400">
          마지막 업데이트: {now.toLocaleTimeString("ko-KR")} · 자동 새로고침 5초마다
        </div>
      </div>
    </SmartFactoryWrapper>
  );
}
