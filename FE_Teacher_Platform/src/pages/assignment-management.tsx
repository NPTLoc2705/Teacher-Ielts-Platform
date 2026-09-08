import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight, Plus, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocation } from "wouter";
import CreateTaskModal from "@/components/CreateTaskModal";
import TeacherShell from "@/components/teacher/TeacherShell";

const PRIMARY = "#183A68";
const SECONDARY = "#FDB913";

interface Assignment {
    id: number;
    ngayTao: string;
    noiDung: string;
    subtitle: string;
    ngayMoTime: string;
    ngayMoDate: string;
    hanNopTime: string;
    hanNopDate: string;
    baiNop: number;
    totalBai: number;
    thoiGian: string;
    trangThai: "Đã kết thúc" | "Đang diễn ra" | "Chưa bắt đầu";
    lop: string;
    loaiBai: string;
    dangDe: string;
}

const allAssignments: Assignment[] = [
    {
        id: 1,
        ngayTao: "15/10/2026",
        noiDung: "Bài tập tuần 5.",
        subtitle: "Task 1 - Đề của bạn",
        ngayMoTime: "08:00",
        ngayMoDate: "16/10/2026",
        hanNopTime: "23:59",
        hanNopDate: "23/10/2026",
        baiNop: 28,
        totalBai: 30,
        thoiGian: "20 phút",
        trangThai: "Đã kết thúc",
        lop: "Lớp 2 - 4 - 6",
        loaiBai: "Bài tập",
        dangDe: "Task 1",
    },
    {
        id: 2,
        ngayTao: "22/10/2026",
        noiDung: "Kiểm tra cuối tháng 1",
        subtitle: "Full Exam - Đề ngẫu nhiên",
        ngayMoTime: "09:00",
        ngayMoDate: "23/10/2026",
        hanNopTime: "21:00",
        hanNopDate: "30/10/2026",
        baiNop: 30,
        totalBai: 30,
        thoiGian: "60 phút",
        trangThai: "Đã kết thúc",
        lop: "Lớp 3 - 5 - 7",
        loaiBai: "Bài thi",
        dangDe: "Full Exam",
    },
    {
        id: 3,
        ngayTao: "05/11/2026",
        noiDung: "Bài tập tuần 9",
        subtitle: "Task 2 - Đề của bạn",
        ngayMoTime: "14:00",
        ngayMoDate: "06/11/2026",
        hanNopTime: "18:00",
        hanNopDate: "13/11/2026",
        baiNop: 12,
        totalBai: 30,
        thoiGian: "40 phút",
        trangThai: "Đang diễn ra",
        lop: "Lớp 2 - 4 - 6",
        loaiBai: "Bài tập",
        dangDe: "Task 2",
    },
    {
        id: 4,
        ngayTao: "12/11/2026",
        noiDung: "Đánh giá trình độ giữa tháng",
        subtitle: "Task 1 - Đề ngẫu nhiên",
        ngayMoTime: "08:00",
        ngayMoDate: "15/11/2026",
        hanNopTime: "23:59",
        hanNopDate: "22/11/2026",
        baiNop: 0,
        totalBai: 30,
        thoiGian: "Không giới hạn",
        trangThai: "Chưa bắt đầu",
        lop: "Lớp 3 - 5 - 7",
        loaiBai: "Bài tập",
        dangDe: "Task 1",
    },
    {
        id: 5,
        ngayTao: "18/11/2026",
        noiDung: "Luyện tập dạng đề Opinion",
        subtitle: "Full Exam - Đề của bạn",
        ngayMoTime: "10:30",
        ngayMoDate: "19/11/2026",
        hanNopTime: "22:00",
        hanNopDate: "26/11/2026",
        baiNop: 15,
        totalBai: 30,
        thoiGian: "30 phút",
        trangThai: "Đang diễn ra",
        lop: "Lớp 2 - 4 - 6",
        loaiBai: "Bài thi",
        dangDe: "Full Exam",
    },
    {
        id: 6,
        ngayTao: "20/11/2026",
        noiDung: "Kiểm tra định kỳ W2",
        subtitle: "Task 1 - Đề của bạn",
        ngayMoTime: "09:00",
        ngayMoDate: "21/11/2026",
        hanNopTime: "23:59",
        hanNopDate: "28/11/2026",
        baiNop: 18,
        totalBai: 30,
        thoiGian: "30 phút",
        trangThai: "Đang diễn ra",
        lop: "Lớp 2 - 4 - 6",
        loaiBai: "Bài tập",
        dangDe: "Task 1",
    },
    {
        id: 7,
        ngayTao: "21/11/2026",
        noiDung: "Luyện tập Overview cho Advantage - Disadvantage",
        subtitle: "Task 2 - Đề của bạn",
        ngayMoTime: "10:00",
        ngayMoDate: "22/11/2026",
        hanNopTime: "22:00",
        hanNopDate: "29/11/2026",
        baiNop: 25,
        totalBai: 30,
        thoiGian: "40 phút",
        trangThai: "Đang diễn ra",
        lop: "Lớp 3 - 5 - 7",
        loaiBai: "Bài tập",
        dangDe: "Task 2",
    },
    {
        id: 8,
        ngayTao: "22/11/2026",
        noiDung: "Đánh giá cuối tháng 3",
        subtitle: "Full Exam - Đề ngẫu nhiên",
        ngayMoTime: "08:00",
        ngayMoDate: "23/11/2026",
        hanNopTime: "21:00",
        hanNopDate: "30/11/2026",
        baiNop: 30,
        totalBai: 30,
        thoiGian: "60 phút",
        trangThai: "Đã kết thúc",
        lop: "Lớp 2 - 4 - 6",
        loaiBai: "Bài thi",
        dangDe: "Full Exam",
    },
    {
        id: 9,
        ngayTao: "23/11/2026",
        noiDung: "Bài tập tuần 10",
        subtitle: "Task 1 - Đề ngẫu nhiên",
        ngayMoTime: "14:00",
        ngayMoDate: "24/11/2026",
        hanNopTime: "18:00",
        hanNopDate: "01/12/2026",
        baiNop: 10,
        totalBai: 30,
        thoiGian: "20 phút",
        trangThai: "Đang diễn ra",
        lop: "Lớp 3 - 5 - 7",
        loaiBai: "Bài tập",
        dangDe: "Task 1",
    },
    {
        id: 10,
        ngayTao: "24/11/2026",
        noiDung: "Bài tập tuần 1",
        subtitle: "Task 2 - Đề của bạn",
        ngayMoTime: "08:30",
        ngayMoDate: "25/11/2026",
        hanNopTime: "23:59",
        hanNopDate: "02/12/2026",
        baiNop: 0,
        totalBai: 30,
        thoiGian: "Không giới hạn",
        trangThai: "Chưa bắt đầu",
        lop: "Lớp 2 - 4 - 6",
        loaiBai: "Bài tập",
        dangDe: "Task 2",
    },
];

const PAGE_SIZE = 10;
const TOTAL_ITEMS = 145;

function FilterDropdown({ label, options, value, onChange }: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const display = value === "Tất cả" ? label : value;
    return (
        <div className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-2 h-9 px-4 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#183A68] hover:border-[#183A68] transition-colors"
                style={{ minWidth: 120 }}
            >
                {display}
                <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-none z-50 overflow-hidden min-w-[150px]">
                    {options.map(opt => (
                        <div
                            key={opt}
                            onMouseDown={e => { e.preventDefault(); onChange(opt); setOpen(false); }}
                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${value === opt ? 'bg-[#F1F5F9] text-[#183A68] font-bold' : 'text-[#64748B] hover:bg-[#f8fafc]'}`}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: Assignment["trangThai"] }) {
    const styles: Record<string, string> = {
        "Đã kết thúc": "text-[#EF4444] bg-[#FEF2F2] border border-[#FECACA]",
        "Đang diễn ra": "text-[#10B981] bg-[#ECFDF5] border border-[#A7F3D0]",
        "Chưa bắt đầu": "text-[#F59E0B] bg-[#FFFBEB] border border-[#FDE68A]",
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status]}`}>
            {status}
        </span>
    );
}

function ProgressBar({ value, total }: { value: number; total: number }) {
    const pct = total === 0 ? 0 : Math.round((value / total) * 100);
    let color = "#64748B";
    if (pct === 0) color = "#E2E8F0";
    else if (pct >= 80) color = "#10B981";
    else color = "#FDB913";

    return (
        <div>
            <span className="text-sm font-bold text-[#183A68] block mb-1">{value}/{total}</span>
            <div className="h-1.5 bg-[#F1F5F9] rounded-full w-24 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}

export default function AssignmentManagement() {
    const [, setLocation] = useLocation();
    const [search, setSearch] = useState("");
    const [timeFilter, setTimeFilter] = useState("7 ngày qua");
    const [sort, setSort] = useState("Mới nhất");
    const [filterLop, setFilterLop] = useState("Tất cả");
    const [filterLoaiBai, setFilterLoaiBai] = useState("Tất cả");
    const [filterDangDe, setFilterDangDe] = useState("Tất cả");
    const [filterTrangThai, setFilterTrangThai] = useState("Tất cả");
    const [page, setPage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const totalPages = Math.ceil(TOTAL_ITEMS / PAGE_SIZE);

    const [sortOpen, setSortOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);

    const filtered = useMemo(() => {
        let data = [...allAssignments];
        if (search.trim()) {
            data = data.filter(a => a.noiDung.toLowerCase().includes(search.toLowerCase()) || a.subtitle.toLowerCase().includes(search.toLowerCase()));
        }
        if (filterLop !== "Tất cả") data = data.filter(a => a.lop === filterLop);
        if (filterLoaiBai !== "Tất cả") data = data.filter(a => a.loaiBai === filterLoaiBai);
        if (filterDangDe !== "Tất cả") data = data.filter(a => a.dangDe === filterDangDe);
        if (filterTrangThai !== "Tất cả") data = data.filter(a => a.trangThai === filterTrangThai);
        if (sort === "Mới nhất") data = [...data].reverse();
        return data;
    }, [search, filterLop, filterLoaiBai, filterDangDe, filterTrangThai, sort]);

    return (
        <TeacherShell contentClassName="min-w-0 overflow-auto p-8">
            <div className="min-h-screen bg-[#f1f3fc] px-8 py-8 w-full">
                <CreateTaskModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />

                <h1 className="font-display text-3xl font-bold mb-5 tracking-tight text-[#183a68]">Quản lý bài tập</h1>

                {/* Search + Create button */}
                <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-none px-6 py-5 mb-5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                            <Input
                                placeholder="Tìm kiếm bài tập theo nội dung"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-11 h-11 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#183A68] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#183A68]"
                            />
                        </div>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center gap-2 h-11 px-6 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 shrink-0 shadow-none"
                            style={{ backgroundColor: PRIMARY }}
                        >
                            <Plus className="h-4 w-4" />
                            Tạo bài tập
                        </button>
                    </div>

                    {/* Filters row */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Time filter */}
                        <div className="relative">
                            <button
                                onClick={() => setTimeOpen(v => !v)}
                                className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-[#E2E8F0] text-[#183A68] bg-white hover:border-[#183A68] transition-colors"
                            >
                                {timeFilter}
                                <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" />
                            </button>
                            {timeOpen && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-none z-50 overflow-hidden min-w-[150px]">
                                    {["7 ngày qua", "30 ngày qua", "60 ngày qua", "90 ngày qua"].map(opt => (
                                        <div key={opt} onMouseDown={e => { e.preventDefault(); setTimeFilter(opt); setTimeOpen(false); }}
                                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${timeFilter === opt ? 'bg-[#F1F5F9] text-[#183A68] font-bold' : 'text-[#64748B] hover:bg-[#f8fafc]'}`}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <button
                                onClick={() => setSortOpen(v => !v)}
                                className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-[#64748B] bg-transparent hover:text-[#183A68] transition-colors"
                            >
                                {sort}
                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                            {sortOpen && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-none z-50 overflow-hidden min-w-[120px]">
                                    {["Mới nhất", "Cũ nhất"].map(opt => (
                                        <div key={opt} onMouseDown={e => { e.preventDefault(); setSort(opt); setSortOpen(false); }}
                                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${sort === opt ? 'bg-[#F1F5F9] text-[#183A68] font-bold' : 'text-[#64748B] hover:bg-[#f8fafc]'}`}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex-1" />

                        <FilterDropdown
                            label="Lớp"
                            options={["Tất cả", "Lớp 2 - 4 - 6", "Lớp 3 - 5 - 7"]}
                            value={filterLop}
                            onChange={setFilterLop}
                        />
                        <FilterDropdown
                            label="Loại bài tập"
                            options={["Tất cả", "Bài tập", "Bài thi"]}
                            value={filterLoaiBai}
                            onChange={setFilterLoaiBai}
                        />
                        <FilterDropdown
                            label="Dạng đề"
                            options={["Tất cả", "Task 1", "Task 2", "Full Exam"]}
                            value={filterDangDe}
                            onChange={setFilterDangDe}
                        />
                        <FilterDropdown
                            label="Trạng thái"
                            options={["Tất cả", "Đã kết thúc", "Đang diễn ra", "Chưa bắt đầu"]}
                            value={filterTrangThai}
                            onChange={setFilterTrangThai}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-none overflow-hidden mb-5">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#E2E8F0]">
                                <th className="px-6 py-4 text-xs font-bold text-[#64748B] tracking-wide whitespace-nowrap">Ngày Tạo</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#64748B] tracking-wide">Nội Dung</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#64748B] text-center tracking-wide whitespace-nowrap">Ngày Mở</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#64748B] text-center tracking-wide whitespace-nowrap">Hạn Nộp</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#64748B] text-center tracking-wide whitespace-nowrap">Bài Nộp</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#64748B] text-center tracking-wide whitespace-nowrap">Thời gian làm bài</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#64748B] text-center tracking-wide whitespace-nowrap">Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((a, i) => (
                                <tr
                                    key={a.id}
                                    className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#f8fafc] transition-colors cursor-pointer"
                                    onClick={() => {
                                        const isRandom = a.subtitle.includes("Đề ngẫu nhiên");
                                        const typeParam = isRandom ? "random" : "custom";
                                        setLocation(`/teacher/assignment-management/${a.id}?type=${typeParam}&task=${encodeURIComponent(a.dangDe)}`);
                                    }}
                                >
                                    <td className="px-6 py-5 text-sm text-[#64748B] whitespace-nowrap">{a.ngayTao}</td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-semibold text-[#183A68] leading-snug max-w-xs truncate">{a.noiDung}</p>
                                        <p className="text-xs text-[#64748B] mt-0.5">{a.subtitle}</p>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <p className="text-sm font-semibold text-[#183A68] text-center">{a.ngayMoTime}</p>
                                        <p className="text-xs text-[#64748B] text-center">{a.ngayMoDate}</p>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <p className="text-sm font-semibold text-[#183A68] text-center">{a.hanNopTime}</p>
                                        <p className="text-xs text-[#64748B] text-center">{a.hanNopDate}</p>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <ProgressBar value={a.baiNop} total={a.totalBai} />
                                    </td>
                                    <td className="px-6 py-5 text-sm text-[#64748B] text-center whitespace-nowrap">{a.thoiGian}</td>
                                    <td className="px-6 py-5 text-center">
                                        <StatusBadge status={a.trangThai} />
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#64748B]">Không tìm thấy bài tập nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col items-center gap-2 pb-8">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1.5 px-3 h-8 border border-[#E2E8F0] rounded-lg bg-white">
                            <span className="text-sm font-bold text-[#183A68]">{page}</span>
                            <span className="text-sm text-[#64748B]">/ {totalPages}</span>
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-xs font-semibold tracking-widest text-[#64748B] uppercase">
                        Hiển thị {Math.min(PAGE_SIZE, filtered.length)}/{TOTAL_ITEMS} bài tập
                    </p>
                </div>
            </div>
        </TeacherShell>
    );
}
