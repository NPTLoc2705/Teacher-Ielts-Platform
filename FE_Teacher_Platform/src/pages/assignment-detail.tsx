import TeacherShell from '@/components/teacher/TeacherShell';
import { useState, useMemo, useRef } from "react";
import { FileText, Clock, CheckSquare, BarChart2, Search, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowLeft, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useLocation, useSearch } from "wouter";

const PRIMARY = "#183A68";
const NEUTRAL_GREY = "#64748B";
const BORDER_GREY = "#E2E8F0";
const BG = "#f1f3fc";
const PRIMARY_CONTAINER = "#F1F5F9";
const SUCCESS = "#10B981";
const WARNING = "#F59E0B";
const GV_COLOR = "#17B26A";
const AI_COLOR = "#F79009";

interface Student {
    id: number;
    ten: string;
    de: string;
    ngayLamTime: string;
    ngayLamDate: string;
    thoiGianLam: string;
    diemGV: number | null;
    diemAI: number;
    trangThai: "Đúng giờ" | "Nộp muộn";
}

const allStudents: Student[] = [
    { id: 1, ten: "Nguyễn Văn Anh", de: "The line chart below shows the change in...", ngayLamTime: "08:29", ngayLamDate: "20/12/2026", thoiGianLam: "39:21", diemGV: null, diemAI: 7.0, trangThai: "Nộp muộn" },
    { id: 2, ten: "Lê Mỹ Tiên", de: "The line chart below shows the change in...", ngayLamTime: "08:30", ngayLamDate: "20/12/2026", thoiGianLam: "40:00", diemGV: 8.5, diemAI: 8.0, trangThai: "Đúng giờ" },
    { id: 3, ten: "Trần Minh Hưng", de: "The line chart below shows the change in...", ngayLamTime: "08:25", ngayLamDate: "20/12/2026", thoiGianLam: "38:05", diemGV: 7.5, diemAI: 7.0, trangThai: "Đúng giờ" },
    { id: 4, ten: "Phạm Thị Lan", de: "The line chart below shows the change in...", ngayLamTime: "09:15", ngayLamDate: "21/12/2026", thoiGianLam: "42:10", diemGV: null, diemAI: 8.0, trangThai: "Đúng giờ" },
    { id: 5, ten: "Đặng Văn Hùng", de: "The line chart below shows the change in...", ngayLamTime: "10:45", ngayLamDate: "21/12/2026", thoiGianLam: "35:45", diemGV: 6.5, diemAI: 6.0, trangThai: "Nộp muộn" },
    { id: 6, ten: "Hoàng Mỹ Linh", de: "The line chart below shows the change in...", ngayLamTime: "08:00", ngayLamDate: "20/12/2026", thoiGianLam: "41:20", diemGV: 9.0, diemAI: 8.5, trangThai: "Đúng giờ" },
    { id: 7, ten: "Vũ Hoàng Nam", de: "The line chart below shows the change in...", ngayLamTime: "21:30", ngayLamDate: "22/12/2026", thoiGianLam: "37:50", diemGV: null, diemAI: 7.0, trangThai: "Đúng giờ" },
    { id: 8, ten: "Bùi Kim Chi", de: "The line chart below shows the change in...", ngayLamTime: "14:20", ngayLamDate: "21/12/2026", thoiGianLam: "40:15", diemGV: 8.0, diemAI: 7.5, trangThai: "Đúng giờ" },
    { id: 9, ten: "Đỗ Mạnh Cường", de: "The line chart below shows the change in...", ngayLamTime: "09:05", ngayLamDate: "20/12/2026", thoiGianLam: "39:40", diemGV: 7.5, diemAI: 7.0, trangThai: "Đúng giờ" },
    { id: 10, ten: "Ngô Thị Hoa", de: "The line chart below shows the change in...", ngayLamTime: "11:00", ngayLamDate: "21/12/2026", thoiGianLam: "36:55", diemGV: null, diemAI: 6.0, trangThai: "Nộp muộn" },
    { id: 11, ten: "Lý Quốc Bảo", de: "The line chart below shows the change in...", ngayLamTime: "08:45", ngayLamDate: "20/12/2026", thoiGianLam: "41:10", diemGV: 7.5, diemAI: 7.0, trangThai: "Đúng giờ" },
    { id: 12, ten: "Đinh Thị Thu", de: "The line chart below shows the change in...", ngayLamTime: "09:30", ngayLamDate: "20/12/2026", thoiGianLam: "38:30", diemGV: 8.0, diemAI: 7.5, trangThai: "Đúng giờ" },
];

const PAGE_SIZE = 10;

function StatusBadge({ status }: { status: Student["trangThai"] }) {
    if (status === "Đúng giờ") {
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#ECFDF5", color: SUCCESS, border: `1px solid #A7F3D0` }}>
                Đúng giờ
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#FFFBEB", color: WARNING, border: `1px solid #FDE68A` }}>
            Nộp muộn
        </span>
    );
}

function ScoreCell({ diemGV, diemAI }: { diemGV: number | null; diemAI: number }) {
    const [show, setShow] = useState(false);

    return (
        <div
            className="relative inline-flex items-center justify-center cursor-default"
            style={{ gap: 10 }}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {/* GV score – fixed width so "–" aligns with "8.5" etc. */}
            <span
                className="text-sm font-semibold text-right"
                style={{ color: diemGV !== null ? GV_COLOR : "#A0A0AB", minWidth: "2.4rem", display: "inline-block" }}
            >
                {diemGV !== null ? diemGV.toFixed(1) : "–"}
            </span>

            {/* Dot separator */}
            <span
                style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: PRIMARY,
                    flexShrink: 0,
                }}
            />

            {/* AI score – fixed width */}
            <span
                className="text-sm font-semibold text-left"
                style={{ color: AI_COLOR, fontWeight: 400, minWidth: "2.4rem", display: "inline-block" }}
            >
                {diemAI.toFixed(1)}
            </span>

            {/* Tooltip */}
            {show && (
                <div
                    className="absolute z-50 bottom-full left-1/2 mb-2 w-48 rounded-lg shadow-none border border-[#e2e8f0] bg-white px-4 py-3 text-xs text-left pointer-events-none"
                    style={{ transform: "translateX(-50%)" }}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-gray-500">Điểm giáo viên</span>
                        <span className="font-bold" style={{ color: diemGV !== null ? GV_COLOR : "#A0A0AB" }}>
                            {diemGV !== null ? diemGV.toFixed(1) : "–"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-500">Điểm AI</span>
                        <span className="font-bold" style={{ color: AI_COLOR }}>{diemAI.toFixed(1)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function GradingModal({
    onClose,
    onSelect,
}: {
    onClose: () => void;
    onSelect: (method: "ai_edit" | "manual") => void;
}) {
    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-none w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between px-7 pt-7 pb-4">
                    <h3 className="text-base font-bold text-center flex-1 leading-snug" style={{ color: PRIMARY }}>
                        Bạn muốn chấm bài viết này theo hình thức nào?
                    </h3>
                    <button
                        onClick={onClose}
                        className="shrink-0 ml-3 -mt-1 h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ color: NEUTRAL_GREY }}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Warning */}
                <p className="px-7 pb-5 text-sm font-semibold text-center leading-relaxed" style={{ color: "#EF4444" }}>
                    Lưu ý: Bạn chỉ có thể lựa chọn 1 hình thức chấm. Sau khi chọn, bạn sẽ không thể thay đổi hoặc chọn thêm hình thức chấm khác cho bài viết này.
                </p>

                {/* Options */}
                <div className="px-7 pb-7 space-y-4">
                    {/* Sửa bài chấm của AI */}
                    <button
                        onClick={() => onSelect("ai_edit")}
                        className="w-full rounded-lg border-2 px-6 py-5 text-left transition-all active:scale-[0.99]"
                        style={{ borderColor: AI_COLOR }}
                    >
                        <p className="text-base font-bold mb-1.5 text-center" style={{ color: AI_COLOR }}>
                            Sửa bài chấm của AI
                        </p>
                        <p className="text-sm text-center leading-relaxed" style={{ color: NEUTRAL_GREY }}>
                            Bạn sẽ được xem bài chấm từ AI và sửa trực tiếp vào nội dung chấm.
                        </p>
                    </button>

                    {/* Tự chấm */}
                    <button
                        onClick={() => onSelect("manual")}
                        className="w-full rounded-lg border-2 px-6 py-5 text-left transition-all active:scale-[0.99]"
                        style={{ borderColor: GV_COLOR }}
                    >
                        <p className="text-base font-bold mb-1.5 text-center" style={{ color: GV_COLOR }}>
                            Tự chấm
                        </p>
                        <p className="text-sm text-center leading-relaxed" style={{ color: NEUTRAL_GREY }}>
                            Bạn sẽ tự chấm mà không xem kết quả từ AI, hình thức này giúp bạn không bị ảnh hưởng bởi ý kiến của AI.
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
}

const SECONDARY = "#FDB913";

const TASK1_TYPES = ["Line graph", "Table", "Pie chart"];
const TASK2_TYPES = ["Opinion", "Discussion", "Two-part question"];

function RandomDeSection({ taskType }: { taskType: string }) {
    const showTask1 = taskType === "Task 1" || taskType === "Full Exam";
    const showTask2 = taskType === "Task 2" || taskType === "Full Exam";

    return (
        <div className="mb-6">
            <h2 className="text-base font-bold mb-1" style={{ color: PRIMARY }}>Đề ngẫu nhiên</h2>
            <p className="text-sm mb-4" style={{ color: NEUTRAL_GREY }}>Các học viên trong lớp được nhận ngẫu nhiên các dạng đề mà bạn đã chọn</p>
            <div className="space-y-3">
                {showTask1 && (
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-bold w-16 shrink-0" style={{ color: PRIMARY }}>Task 1:</span>
                        <div className="flex items-center gap-6 flex-wrap">
                            {TASK1_TYPES.map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-default select-none">
                                    <input type="checkbox" checked disabled readOnly className="w-4 h-4 rounded border-gray-300 accent-[#183A68] cursor-default" />
                                    <span className="text-sm" style={{ color: NEUTRAL_GREY }}>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                {showTask2 && (
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-bold w-16 shrink-0" style={{ color: PRIMARY }}>Task 2:</span>
                        <div className="flex items-center gap-6 flex-wrap">
                            {TASK2_TYPES.map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-default select-none">
                                    <input type="checkbox" checked disabled readOnly className="w-4 h-4 rounded border-gray-300 accent-[#183A68] cursor-default" />
                                    <span className="text-sm" style={{ color: NEUTRAL_GREY }}>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AssignmentDetail() {
    const [, setLocation] = useLocation();
    const searchStr = useSearch();
    const params = new URLSearchParams(searchStr);
    const deType = params.get("type") ?? "custom";
    const taskType = params.get("task") ?? "Task 1";
    const luuY = params.get("luuY") ?? "";

    const [search, setSearch] = useState("");
    const [sortDesc, setSortDesc] = useState(true);
    const [filterStatus, setFilterStatus] = useState<"Tất cả" | "Đúng giờ" | "Nộp muộn">("Tất cả");
    const [statusDropOpen, setStatusDropOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [gradingStudent, setGradingStudent] = useState<Student | null>(null);

    const filtered = useMemo(() => {
        let data = [...allStudents];
        if (search.trim()) {
            data = data.filter(s => s.ten.toLowerCase().includes(search.toLowerCase()));
        }
        if (filterStatus !== "Tất cả") {
            data = data.filter(s => s.trangThai === filterStatus);
        }
        const score = (s: Student) => s.diemGV ?? s.diemAI;
        data = data.sort((a, b) => sortDesc ? score(b) - score(a) : score(a) - score(b));
        return data;
    }, [search, filterStatus, sortDesc]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
    const handleStatusFilter = (v: "Tất cả" | "Đúng giờ" | "Nộp muộn") => { setFilterStatus(v); setStatusDropOpen(false); setPage(1); };

    const handleRowClick = (s: Student) => {
        if (s.diemGV !== null) {
            setLocation("/feedback-improve");
        } else {
            setGradingStudent(s);
        }
    };

    const handleGradingSelect = (method: "ai_edit" | "manual") => {
        setGradingStudent(null);
        setLocation(`/feedback-improve?method=${method}`);
    };

    return (
        <div className="min-h-screen py-8 px-6" style={{ backgroundColor: BG }}>
            {gradingStudent && (
                <GradingModal
                    onClose={() => setGradingStudent(null)}
                    onSelect={handleGradingSelect}
                />
            )}

            <div className="max-w-5xl mx-auto">
                {/* Title row with nav buttons */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setLocation("/teacher/assignment-management")}
                        className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold border transition-colors hover:bg-[#F1F5F9]"
                        style={{ borderColor: BORDER_GREY, color: NEUTRAL_GREY }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Trở lại
                    </button>
                    <h1 className="font-display text-3xl font-bold tracking-tight" style={{ color: PRIMARY }}>Chi tiết kết quả</h1>
                    <button
                        onClick={() => setLocation("/class-progress")}
                        className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold border transition-colors hover:bg-[#F1F5F9]"
                        style={{ borderColor: BORDER_GREY, color: PRIMARY }}
                    >
                        Đến lớp
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Summary Card */}
                <div className="rounded-lg border mb-6 overflow-hidden" style={{ backgroundColor: "#fff", borderColor: BORDER_GREY }}>
                    <div className="px-6 py-4 border-b" style={{ borderColor: BORDER_GREY }}>
                        <span className="font-bold text-base" style={{ color: PRIMARY }}>Lớp: Sáng thứ 2 - 4 - 6</span>
                    </div>
                    <div className="grid grid-cols-4 divide-x px-2 py-5 divide-gray-200">
                        <div className="flex items-start gap-3 px-5">
                            <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: PRIMARY_CONTAINER }}>
                                <FileText className="h-5 w-5" style={{ color: PRIMARY }} />
                            </div>
                            <div>
                                <p className="text-xs font-medium mb-0.5" style={{ color: NEUTRAL_GREY }}>TÊN BÀI TẬP</p>
                                <p className="text-sm font-bold" style={{ color: PRIMARY }}>Bài tập tuần 10</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 px-5">
                            <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFFBEB" }}>
                                <Clock className="h-5 w-5" style={{ color: SECONDARY }} />
                            </div>
                            <div>
                                <p className="text-xs font-medium mb-0.5" style={{ color: NEUTRAL_GREY }}>THỜI GIAN</p>
                                <p className="text-sm font-bold leading-snug" style={{ color: PRIMARY }}>
                                    22:00 20/12/2026 –<br />22:00 23/12/2026
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 px-5">
                            <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: PRIMARY_CONTAINER }}>
                                <CheckSquare className="h-5 w-5" style={{ color: PRIMARY }} />
                            </div>
                            <div>
                                <p className="text-xs font-medium mb-0.5" style={{ color: NEUTRAL_GREY }}>BÀI NỘP</p>
                                <p className="text-sm font-bold" style={{ color: PRIMARY }}>28/30</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 px-5">
                            <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFFBEB" }}>
                                <BarChart2 className="h-5 w-5" style={{ color: SECONDARY }} />
                            </div>
                            <div>
                                <p className="text-xs font-medium mb-0.5" style={{ color: NEUTRAL_GREY }}>ĐIỂM TRUNG BÌNH</p>
                                <p className="text-sm font-bold" style={{ color: PRIMARY }}>7.6</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Đề section */}
                {deType === "random" ? (
                    <RandomDeSection taskType={taskType} />
                ) : (
                    <div className="mb-6">
                        <h2 className="text-base font-bold mb-3" style={{ color: PRIMARY }}>Đề của bạn</h2>
                        <div className="rounded-xl border p-5" style={{ backgroundColor: "#fff", borderColor: BORDER_GREY }}>
                            <p className="text-sm italic leading-relaxed" style={{ color: NEUTRAL_GREY }}>
                                "Task 2: In today's world of advanced science and technology, we still greatly value our artists such as musicians, painters and writers. What can arts tell us about life that science and technology cannot?"
                            </p>
                        </div>
                    </div>
                )}

                {/* Lưu ý cho học viên */}
                <div className="mb-6">
                    <h2 className="text-base font-bold mb-3" style={{ color: PRIMARY }}>Lưu ý cho học viên</h2>
                    <div className="rounded-xl border p-5" style={{ backgroundColor: "#fff", borderColor: BORDER_GREY }}>
                        {luuY.trim() ? (
                            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: NEUTRAL_GREY }}>{luuY}</p>
                        ) : (
                            <p className="text-sm italic" style={{ color: NEUTRAL_GREY }}>Bạn không tạo lưu ý nào.</p>
                        )}
                    </div>
                </div>

                {/* Main card: search + table */}
                <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "#fff", borderColor: BORDER_GREY }}>
                    {/* Search + action row */}
                    <div className="px-6 py-4 border-b flex items-center gap-4" style={{ borderColor: BORDER_GREY }}>
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: NEUTRAL_GREY }} />
                            <Input
                                placeholder="Tìm kiếm học viên..."
                                value={search}
                                onChange={e => handleSearchChange(e.target.value)}
                                className="pl-10 h-10 rounded-lg text-sm"
                                style={{ borderColor: BORDER_GREY, color: PRIMARY }}
                            />
                        </div>
                        <div className="flex-1" />
                        <button
                            onClick={() => setSortDesc(v => !v)}
                            className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium border transition-colors hover:bg-[#F1F5F9]"
                            style={{ borderColor: BORDER_GREY, color: NEUTRAL_GREY }}
                        >
                            {sortDesc ? "Điểm cao đến thấp" : "Điểm thấp đến cao"}
                            <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setStatusDropOpen(v => !v)}
                                className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium border transition-colors hover:bg-[#F1F5F9]"
                                style={{ borderColor: BORDER_GREY, color: NEUTRAL_GREY }}
                            >
                                {filterStatus === "Tất cả" ? "Trạng thái" : filterStatus}
                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                            {statusDropOpen && (
                                <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-none z-50 overflow-hidden min-w-[140px]" style={{ borderColor: BORDER_GREY }}>
                                    {(["Tất cả", "Đúng giờ", "Nộp muộn"] as const).map(opt => (
                                        <div
                                            key={opt}
                                            onMouseDown={e => { e.preventDefault(); handleStatusFilter(opt); }}
                                            className="px-4 py-2.5 text-sm cursor-pointer transition-colors"
                                            style={{
                                                color: filterStatus === opt ? PRIMARY : NEUTRAL_GREY,
                                                backgroundColor: filterStatus === opt ? PRIMARY_CONTAINER : "transparent",
                                                fontWeight: filterStatus === opt ? 700 : 400,
                                            }}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="px-6 pt-3 pb-1 flex justify-end gap-4">
                        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: NEUTRAL_GREY }}>
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: GV_COLOR }} />
                            Điểm giáo viên
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: NEUTRAL_GREY }}>
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: AI_COLOR }} />
                            Điểm AI
                        </span>
                    </div>

                    {/* Table */}
                    <table className="w-full text-left">
                        <thead>
                            <tr style={{ backgroundColor: PRIMARY_CONTAINER }}>
                                <th className="px-6 py-3.5 text-xs font-semibold" style={{ color: PRIMARY }}>Học viên</th>
                                <th className="px-6 py-3.5 text-xs font-semibold" style={{ color: PRIMARY }}>Đề</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-center" style={{ color: PRIMARY }}>Ngày làm</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-center" style={{ color: PRIMARY }}>Thời gian làm</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-center" style={{ color: PRIMARY }}>Điểm</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-center" style={{ color: PRIMARY }}>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map(s => (
                                <tr
                                    key={s.id}
                                    onClick={() => handleRowClick(s)}
                                    className="border-t transition-colors hover:bg-[#f8fafc] cursor-pointer"
                                    style={{ borderColor: BORDER_GREY }}
                                >
                                    <td className="px-6 py-5 text-sm font-semibold whitespace-nowrap" style={{ color: PRIMARY }}>{s.ten}</td>
                                    <td className="px-6 py-5 text-sm max-w-[200px] truncate" style={{ color: NEUTRAL_GREY }}>{s.de}</td>
                                    <td className="px-6 py-5 text-center whitespace-nowrap">
                                        <p className="text-sm font-semibold" style={{ color: PRIMARY }}>{s.ngayLamTime}</p>
                                        <p className="text-xs" style={{ color: NEUTRAL_GREY }}>{s.ngayLamDate}</p>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-center font-semibold" style={{ color: PRIMARY }}>{s.thoiGianLam}</td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                                            <ScoreCell diemGV={s.diemGV} diemAI={s.diemAI} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <StatusBadge status={s.trangThai} />
                                    </td>
                                </tr>
                            ))}
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: NEUTRAL_GREY }}>Không tìm thấy học viên nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t flex flex-col items-center gap-2" style={{ borderColor: BORDER_GREY }}>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(1)} disabled={page === 1} className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#F1F5F9] disabled:opacity-40" style={{ color: NEUTRAL_GREY }}>
                                <ChevronsLeft className="h-4 w-4" />
                            </button>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#F1F5F9] disabled:opacity-40" style={{ color: NEUTRAL_GREY }}>
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <div className="flex items-center gap-1.5 px-3 h-8 border rounded-lg" style={{ borderColor: BORDER_GREY }}>
                                <span className="text-sm font-bold" style={{ color: PRIMARY }}>{page}</span>
                                <span className="text-sm" style={{ color: NEUTRAL_GREY }}>/ {totalPages}</span>
                            </div>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#F1F5F9] disabled:opacity-40" style={{ color: NEUTRAL_GREY }}>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#F1F5F9] disabled:opacity-40" style={{ color: NEUTRAL_GREY }}>
                                <ChevronsRight className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: NEUTRAL_GREY }}>
                            Hiển thị {paginated.length}/{filtered.length} học viên
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
