import { Search, ChevronLeft, ChevronRight, X, Target, FileText, ChevronDown, Trophy, Loader2, UserCheck, UserMinus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title as ChartTitle,
    Tooltip as ChartTooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ClassService, formatDisplayDate } from "@/services/classService";
import type { ClassStatsResponse, ClassChartDataResponse, StudentSearchResult, EnrolledStudent } from "@/services/classService";
import TeacherShell from "@/components/teacher/TeacherShell";
import CreateTaskModal from "@/components/CreateTaskModal";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, ChartTooltip, Legend, Filler);

// ── Chart config ──────────────────────────────────────────────────────────────

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    spanGaps: true,   // connect line across weeks with no data
    plugins: {
        legend: { display: false },
        tooltip: {
            enabled: true,
            backgroundColor: '#fff',
            titleColor: '#000',
            bodyColor: '#000',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
                title: (ctx: any) => `Tuần: ${ctx[0].label}`,
                label: (ctx: any) => ctx.raw !== null
                    ? [`Điểm trung bình: ${ctx.raw}`]
                    : ['Chưa có bài nộp'],
            },
        }
    },
    scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' as const }, color: '#9ca3af' } },
        y: {
            min: 4.0, max: 9.0,
            ticks: { stepSize: 0.5, font: { size: 10, weight: 'bold' as const }, color: '#9ca3af', callback: (v: any) => v.toFixed(1) },
            grid: { color: '#f3f4f6' }
        }
    }
};

const getChartData = (labels: string[], data: (number | null)[]) => ({
    labels,
    datasets: [{
        data,
        borderColor: '#1fb2aa',
        backgroundColor: 'rgba(31, 178, 170, 0.1)',
        fill: true, tension: 0.4,
        pointRadius: (ctx: any) => ctx.raw !== null ? 4 : 0,
        pointBackgroundColor: '#1fb2aa', pointBorderColor: '#fff', pointBorderWidth: 2,
    }]
});

const ChartCard = ({ title, tabs, activeMainTab, setActiveMainTab, headerExtra, labels, data, loading }: {
    title: string; tabs: string[]; activeMainTab: string;
    setActiveMainTab: (t: string) => void; headerExtra?: React.ReactNode;
    labels: string[]; data: (number | null)[]; loading: boolean;
}) => (
    <Card className="rounded-2xl border-gray-300 shadow-sm overflow-hidden h-full">
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-bold text-gray-900">{title}</h2>
                {headerExtra}
            </div>
            <div className="bg-gray-100 border border-gray-700 rounded-lg p-0.5 flex mb-6 h-9 items-center">
                {tabs.map((tab) => (
                    <button key={tab} onClick={() => setActiveMainTab(tab)}
                        className={`flex-1 text-xs leading-none h-7 font-bold rounded-md transition-all ${tab === activeMainTab ? 'bg-[#1fb2aa] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                        {tab}
                    </button>
                ))}
            </div>
            <div className="h-[200px] w-full relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 font-medium">
                        Đang tải biểu đồ...
                    </div>
                ) : data.every(v => v === null) ? (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 font-medium">
                        Chưa có dữ liệu
                    </div>
                ) : (
                    <Line options={chartOptions as any} data={getChartData(labels, data)} />
                )}
            </div>
        </CardContent>
    </Card>
);

// ── Types ─────────────────────────────────────────────────────────────────────

interface Student {
    id: string;
    name: string;
    email: string;
    overallScore: number;
    totalEssays: number;
    hasNewSubmissions: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// Hardcoded mock chart data (chart endpoints not yet implemented)
const overallDatasets: Record<string, number[]> = {
    'Task 1': [5.8, 6.2, 6.5, 6.8, 7.2, 7.1, 7.4],
    'Task 2': [5.5, 5.8, 6.1, 6.4, 6.9, 7.0, 7.2],
    'Virtual Exam': [5.2, 5.6, 6.0, 6.3, 6.7, 6.8, 7.0],
};
const criterionDatasets: Record<string, number[]> = {
    'TA': [5.8, 5.9, 6.3, 6.7, 7.1, 7.0, 7.2],
    'TR': [5.8, 5.9, 6.3, 6.7, 7.1, 7.0, 7.2],
    'LR': [6.0, 6.1, 6.4, 6.8, 7.0, 6.9, 7.1],
    'CC': [5.7, 5.8, 6.2, 6.6, 6.9, 6.8, 7.0],
    'GRA': [5.9, 6.0, 6.3, 6.7, 7.0, 6.9, 7.2],
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ClassProgress() {
    const params = useParams<{ id: string }>();
    const classId = Number(params.id);
    const [, setLocation] = useLocation();

    // ── Stats state (from API) ──────────────────────────────────────────────
    const [className, setClassName] = useState("Đang tải...");
    const [stats, setStats] = useState<ClassStatsResponse | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [chartData, setChartData] = useState<ClassChartDataResponse | null>(null);
    const [chartLoading, setChartLoading] = useState(true);

    // ── Students state (mock for now) ───────────────────────────────────────
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterNew, setFilterNew] = useState(false);

    // ── Add student modal ───────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<StudentSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Remove student confirm state ─────────────────────────────────────────
    const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [removeError, setRemoveError] = useState("");

    // ── Chart state ─────────────────────────────────────────────────────────
    const [chart1MainTab, setChart1MainTab] = useState('Task 1');
    const [chart2Task, setChart2Task] = useState('Task 1');
    const [chart2MainTab, setChart2MainTab] = useState('TA');

    // ── Create Task Modal state ─────────────────────────────────────────────
    const [isCreateOpen, setIsCreateTaskOpen] = useState(false);

    // ── Fetch class name + stats on mount ───────────────────────────────────
    useEffect(() => {
        if (!classId) return;

        const load = async () => {
            try {
                setStatsLoading(true);

                // Fetch class name (detail endpoint already exists)
                const detail = await ClassService.getClassDetail(classId);
                setClassName(detail.className);

                // Fetch all stats for the 3 cards
                const classStats = await ClassService.getClassStats(classId);
                setStats(classStats);

                // Fetch enrolled students for the table
                const enrolled = await ClassService.getEnrolledStudents(classId);
                setStudents(enrolled.map(s => ({
                    id: String(s.studentId),
                    name: s.displayName,
                    email: s.email,
                    overallScore: s.averageScore,
                    totalEssays: s.totalEssays,
                    hasNewSubmissions: false,
                })));
            } catch (err) {
                console.error('Failed to load class stats:', err);
                setClassName("Lớp học");
            } finally {
                setStatsLoading(false);
            }
        };

        load();

        // Fetch chart data separately so a slow chart query doesn't block the rest of the page
        const loadCharts = async () => {
            try {
                setChartLoading(true);
                const data = await ClassService.getChartData(classId);
                setChartData(data);
            } catch (err) {
                console.error('Failed to load chart data:', err);
            } finally {
                setChartLoading(false);
            }
        };

        loadCharts();
    }, [classId]);

    useEffect(() => {
        if (chart2Task === 'Task 2' && chart2MainTab === 'TA') setChart2MainTab('TR');
        else if (chart2Task === 'Task 1' && chart2MainTab === 'TR') setChart2MainTab('TA');
    }, [chart2Task]);

    const chart2Tabs = chart2Task === 'Task 1' ? ['TA', 'LR', 'CC', 'GRA'] : ['TR', 'LR', 'CC', 'GRA'];

    // ── Student helpers ─────────────────────────────────────────────────────
    const filteredStudents = students.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchSearch && (filterNew ? s.hasNewSubmissions : true);
    });

    // Debounced live search — only runs when a full email is entered
    const handleSearchChange = useCallback((value: string) => {
        setSearchInput(value);
        setEnrollError("");

        if (debounceRef.current) clearTimeout(debounceRef.current);

        const normalizedValue = value.trim();

        if (!EMAIL_REGEX.test(normalizedValue)) {
            setSearchResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                setIsSearching(true);
                const results = await ClassService.searchStudents(classId, normalizedValue);
                const exactEmailResults = results.filter(
                    (student) => student.email.toLowerCase() === normalizedValue.toLowerCase()
                );
                setSearchResults(exactEmailResults);
            } catch (err) {
                console.error("Student search failed:", err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 350);
    }, [classId]);

    const toggleStudent = (student: StudentSearchResult) => {
        if (student.alreadyEnrolled) return;  // can't select already-enrolled
        setSelectedStudents(prev =>
            prev.some(s => s.id === student.id)
                ? prev.filter(s => s.id !== student.id)
                : [...prev, student]
        );
    };

    const handleAddStudents = async () => {
        if (!EMAIL_REGEX.test(searchInput.trim())) {
            setEnrollError("Vui lòng nhập đầy đủ địa chỉ email trước khi thêm học viên.");
            return;
        }
        if (selectedStudents.length === 0) return;
        setIsEnrolling(true);
        setEnrollError("");
        try {
            const result = await ClassService.enrollStudents(classId, selectedStudents.map(s => s.id));

            // Optimistically add newly enrolled students to the local list
            const newStudents: Student[] = selectedStudents.map(s => ({
                id: String(s.id),
                name: s.displayName,
                email: s.email,
                overallScore: 0,
                totalEssays: 0,
                hasNewSubmissions: false,
            }));
            setStudents(prev => [...newStudents, ...prev]);

            // Reset and close
            setIsModalOpen(false);
            setSelectedStudents([]);
            setSearchInput("");
            setSearchResults([]);
        } catch (err: any) {
            setEnrollError(err.message || "Failed to add students. Please try again.");
        } finally {
            setIsEnrolling(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedStudents([]);
        setSearchInput("");
        setSearchResults([]);
        setEnrollError("");
        if (debounceRef.current) clearTimeout(debounceRef.current);
    };

    const openRemoveDialog = (student: Student, e: React.MouseEvent) => {
        e.stopPropagation();   // prevent row click navigating to student page
        setStudentToRemove(student);
        setRemoveError("");
        setIsRemoveDialogOpen(true);
    };

    const handleRemoveStudent = async () => {
        if (!studentToRemove) return;
        setIsRemoving(true);
        setRemoveError("");
        try {
            await ClassService.removeStudent(classId, Number(studentToRemove.id));

            // Close dialog immediately
            setIsRemoveDialogOpen(false);
            setStudentToRemove(null);

            // Re-fetch all affected state in parallel
            const [enrolled, classStats, charts] = await Promise.all([
                ClassService.getEnrolledStudents(classId),
                ClassService.getClassStats(classId),
                ClassService.getChartData(classId),
            ]);
            setStudents(enrolled.map(s => ({
                id: String(s.studentId),
                name: s.displayName,
                email: s.email,
                overallScore: s.averageScore,
                totalEssays: s.totalEssays,
                hasNewSubmissions: false,
            })));
            setStats(classStats);
            setChartData(charts);
        } catch (err: any) {
            setRemoveError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsRemoving(false);
        }
    };

    // ── Derived display values ──────────────────────────────────────────────
    const targetDisplay = stats ? stats.targetLevel.toFixed(1) : '—';
    const startDisplay = stats ? formatDisplayDate(stats.startDate) : '—';
    const endDisplay = stats ? formatDisplayDate(stats.endDate) : '—';
    const progressPct = (() => {
        if (!stats) return 0;
        if (stats.targetProgressPercent > 0) return stats.targetProgressPercent;
        const start = new Date(stats.startDate).getTime();
        const end = new Date(stats.endDate).getTime();
        const now = Date.now();
        if (end <= start) return 0;
        return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
    })();

    const totalWritings = stats?.totalWritings ?? 0;
    const totalTask1 = stats?.totalTask1 ?? 0;
    const totalTask2 = stats?.totalTask2 ?? 0;

    const avgScore = stats ? stats.classAverageScore.toFixed(1) : '—';
    const improvement = stats ? (stats.scoreImprovement >= 0 ? `+${stats.scoreImprovement.toFixed(1)}` : stats.scoreImprovement.toFixed(1)) : '—';
    const reachedTarget = stats?.studentsReachedTarget ?? 0;
    const totalStudents = stats?.totalStudents ?? 0;


    // ── Chart series selectors ───────────────────────────────────────────────
    const chartLabels = chartData?.labels ?? [];

    // Chart 1: overall class avg — driven by chart1MainTab
    const chart1Data: (number | null)[] = (() => {
        if (!chartData) return [];
        if (chart1MainTab === 'Task 1') return chartData.overall.task1;
        if (chart1MainTab === 'Task 2') return chartData.overall.task2;
        return chartData.overall.virtualExam;
    })();

    // Chart 2: criterion avg — driven by chart2Task + chart2MainTab
    const chart2Data: (number | null)[] = (() => {
        if (!chartData) return [];
        const series = chart2Task === 'Task 1' ? chartData.criteria.task1 : chartData.criteria.task2;
        if (chart2MainTab === 'TA' || chart2MainTab === 'TR') return series.taOrTr;
        if (chart2MainTab === 'LR') return series.lr;
        if (chart2MainTab === 'CC') return series.cc;
        if (chart2MainTab === 'GRA') return series.gra;
        return chartLabels.map(() => null);
    })();

    const normalizedSearchInput = searchInput.trim();
    const isValidSearchEmail = EMAIL_REGEX.test(normalizedSearchInput);

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <TeacherShell contentClassName="p-8 w-full">
            <CreateTaskModal open={isCreateOpen} onOpenChange={setIsCreateTaskOpen} />
            {/* Add Student Dialog */}
            <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
                <DialogContent className="sm:max-w-[500px] p-8 rounded-2xl border-none">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold text-gray-900">Thêm học viên</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Search input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900">Nhập email học viên</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Nhập đầy đủ địa chỉ email học viên..."
                                    className="h-12 bg-white border border-gray-200 rounded-xl pl-10 pr-4 text-gray-600 focus-visible:ring-1 focus-visible:ring-[#1fb2aa]"
                                    value={searchInput}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                                {isSearching && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1fb2aa] animate-spin" />
                                )}
                            </div>
                            {normalizedSearchInput.length > 0 && !isValidSearchEmail && (
                                <p className="text-xs text-amber-600 font-medium">
                                    Vui lòng nhập đầy đủ địa chỉ email để tìm và thêm học viên.
                                </p>
                            )}
                        </div>

                        {/* Search results dropdown */}
                        {searchResults.length > 0 && (
                            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                {searchResults.map(student => {
                                    const isSelected = selectedStudents.some(s => s.id === student.id);
                                    return (
                                        <div
                                            key={student.id}
                                            onClick={() => toggleStudent(student)}
                                            className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors
                                                ${student.alreadyEnrolled
                                                    ? "bg-gray-50 cursor-not-allowed opacity-60"
                                                    : isSelected
                                                        ? "bg-[#f0f9f9] cursor-pointer"
                                                        : "bg-white hover:bg-gray-50 cursor-pointer"
                                                }`}
                                        >
                                            {/* Avatar */}
                                            <div className="w-8 h-8 rounded-full bg-[#1fb2aa]/10 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-[#1fb2aa]">
                                                    {student.displayName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{student.displayName}</p>
                                                <p className="text-xs text-gray-400 truncate">{student.email}</p>
                                            </div>

                                            {/* Status badge */}
                                            {student.alreadyEnrolled ? (
                                                <span className="text-xs font-bold text-gray-400 whitespace-nowrap flex items-center gap-1">
                                                    <UserCheck className="h-3 w-3" /> Đã trong lớp
                                                </span>
                                            ) : isSelected ? (
                                                <div className="w-5 h-5 rounded-full bg-[#1fb2aa] flex items-center justify-center shrink-0">
                                                    <X className="h-3 w-3 text-white" />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* No results message */}
                        {isValidSearchEmail && !isSearching && searchResults.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-2">
                                Không tìm thấy học viên với địa chỉ email này
                            </p>
                        )}

                        {/* Selected students chips */}
                        {selectedStudents.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {selectedStudents.map(s => (
                                    <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 bg-[#f0f9f9] border border-[#1fb2aa]/20 rounded-full text-sm font-medium">
                                        <span className="text-[#0d7377]">{s.displayName}</span>
                                        <button onClick={() => toggleStudent(s)} className="text-gray-400 hover:text-[#1fb2aa]">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {enrollError && (
                            <p className="text-xs font-bold text-red-500">{enrollError}</p>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={closeModal}
                                className="h-11 px-6 rounded-xl border-gray-200 font-bold text-gray-500">
                                Hủy
                            </Button>
                            <Button
                                onClick={handleAddStudents}
                                disabled={selectedStudents.length === 0 || !isValidSearchEmail || isEnrolling}
                                className="bg-[#1fb2aa] hover:bg-[#1fb2aa]/90 text-white rounded-xl h-11 px-8 font-bold disabled:opacity-50 flex items-center gap-2"
                            >
                                {isEnrolling
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang thêm...</>
                                    : `Thêm ${selectedStudents.length > 0 ? `(${selectedStudents.length})` : ""}`
                                }
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="w-full space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">{className}</h1>
                    <div className="flex items-center gap-3">
                        {/* <Button
                            onClick={() => setIsCreateTaskOpen(true)}
                            variant="outline"
                            className="border-[#1fb2aa] text-[#1fb2aa] hover:bg-[#f0fdfa] rounded-lg h-11 px-6 font-bold text-sm shadow-sm"
                        >
                            Tạo bài tập
                        </Button> */}
                        <Button onClick={() => setIsModalOpen(true)}
                            className="bg-[#1fb2aa] hover:bg-[#1fb2aa]/90 text-white rounded-lg h-11 px-6 font-bold text-sm shadow-sm">
                            Thêm học viên
                        </Button>
                    </div>
                </div>

                {/* Top 3 Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1 — Target */}
                    <Card className="rounded-2xl border border-gray-200 shadow-md bg-[#f0fdfa]/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-[#1fb2aa] flex items-center justify-center text-white">
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg">Điểm mục tiêu</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-bold text-gray-500 tracking-wider">Mục tiêu</span>
                                    <span className="text-3xl font-bold text-[#1fb2aa]">
                                        {statsLoading ? '—' : targetDisplay}
                                    </span>
                                </div>
                                <Progress value={progressPct} className="h-2 bg-gray-200" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-2xl p-3 border border-gray-50 shadow-md">
                                    <p className="text-[12px] font-bold text-gray-500 mb-1 tracking-wider">Từ</p>
                                    <p className="text-xs font-bold text-[#1fb2aa]">
                                        {statsLoading ? '—' : startDisplay}
                                    </p>
                                </div>
                                <div className="bg-white rounded-2xl p-3 border border-gray-50 shadow-md">
                                    <p className="text-[12px] font-bold text-gray-500 mb-1 tracking-wider">Đến</p>
                                    <p className="text-xs font-bold text-[#1fb2aa]">
                                        {statsLoading ? '—' : endDisplay}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2 — Writing counts */}
                    <Card className="rounded-2xl border border-gray-200 shadow-md bg-[#f0fdfa]/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#1fb2aa] flex items-center justify-center text-white">
                                    <Trophy className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-gray-900 text-lg">Tổng số bài viết</span>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-50 flex flex-col items-center justify-center text-center">
                                <span className="text-4xl font-bold text-[#1fb2aa]">
                                    {statsLoading ? '—' : totalWritings}
                                </span>
                                <span className="text-[15px] font-bold text-gray-500 mt-2 tracking-wider">Tổng số bài viết</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-2xl p-3 border border-gray-50 shadow-md">
                                    <p className="text-[12px] font-bold text-gray-500 mb-1 tracking-wider">Task 1</p>
                                    <p className="text-sm font-bold text-[#1fb2aa]">
                                        {statsLoading ? '—' : `${totalTask1} bài`}
                                    </p>
                                </div>
                                <div className="bg-white rounded-2xl p-3 border border-gray-50 shadow-md">
                                    <p className="text-[12px] font-bold text-gray-500 mb-1 tracking-wider">Task 2</p>
                                    <p className="text-sm font-bold text-[#1fb2aa]">
                                        {statsLoading ? '—' : `${totalTask2} bài`}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3 — Performance overview */}
                    <Card className="rounded-2xl border border-gray-200 shadow-md bg-[#f0fdfa]/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#1fb2aa] flex items-center justify-center text-white">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-gray-900 text-lg">Tổng quan tiến độ</span>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-50 flex flex-col items-center justify-center text-center">
                                <span className="text-4xl font-bold text-[#1fb2aa]">
                                    {statsLoading ? '—' : avgScore}
                                </span>
                                <span className="text-[15px] font-bold text-gray-500 mt-2 tracking-wider">Điểm trung bình lớp</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-2xl p-3 border border-gray-50 shadow-md">
                                    <p className="text-[12px] font-bold text-gray-500 mb-1 tracking-wider">Mức điểm tăng thêm</p>
                                    <p className="text-sm font-bold text-[#1fb2aa]">
                                        {statsLoading ? '—' : improvement}
                                    </p>
                                </div>
                                <div className="bg-white rounded-2xl p-3 border border-gray-50 shadow-md">
                                    <p className="text-[12px] font-bold text-gray-500 mb-1 tracking-wider">Số học viên đạt aim</p>
                                    <p className="text-sm font-bold">
                                        <span className="text-gray-400">{statsLoading ? '—' : reachedTarget}</span>
                                        <span className="text-[#1fb2aa]">/{statsLoading ? '—' : totalStudents}</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ChartCard
                        title="Điểm trung bình cả lớp"
                        tabs={['Task 1', 'Task 2', 'Virtual Exam']}
                        activeMainTab={chart1MainTab}
                        setActiveMainTab={setChart1MainTab}
                        labels={chartLabels}
                        data={chart1Data}
                        loading={chartLoading}
                    />
                    <ChartCard
                        title="Điểm trung bình theo tiêu chí"
                        tabs={chart2Tabs}
                        activeMainTab={chart2MainTab}
                        setActiveMainTab={setChart2MainTab}
                        labels={chartLabels}
                        data={chart2Data}
                        loading={chartLoading}
                        headerExtra={
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-5 border-gray-400 text-xs font-bold gap-2">
                                        {chart2Task} <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32">
                                    <DropdownMenuItem onClick={() => setChart2Task('Task 1')} className="text-xs font-bold">Task 1</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setChart2Task('Task 2')} className="text-xs font-bold">Task 2</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        }
                    />
                </div>


                {/* Students Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-300">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Tìm bằng tên học viên hoặc email"
                                className="pl-10 bg-[#f8fafc] border-gray-200 rounded-lg h-10 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Lọc bài mới</span>
                            <Switch checked={filterNew} onCheckedChange={setFilterNew} className="data-[state=checked]:bg-[#1fb2aa]" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-white">
                                    <th className="w-8 px-4 py-4" />
                                    <th className="px-4 py-4 text-xs font-bold text-gray-900">Tên học viên</th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-900 text-left">Email</th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-900 text-center">Điểm trung bình</th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-900 text-center">Tổng bài viết</th>
                                    <th className="w-12 px-4 py-4" />
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400 font-medium italic">
                                            Chưa có học viên trong lớp
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id}
                                            className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                                            onClick={() => setLocation(`/student-pt/${student.id}?classId=${classId}&teacherEdit=1`)}>
                                            <td className="px-4 py-5 text-center">
                                                {student.hasNewSubmissions && (
                                                    <div className="w-2 h-2 rounded-full bg-red-500 mx-auto shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                                                )}
                                            </td>
                                            <td className="px-4 py-5 text-sm font-medium text-gray-900">
                                                <Link href={`/student-pt/${student.id}?classId=${classId}&teacherEdit=1`} className="hover:text-[#1fb2aa] transition-colors cursor-pointer">
                                                    {student.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-5 text-sm text-gray-500 text-left">{student.email}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600 text-center font-semibold">{student.overallScore}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600 text-center">{student.totalEssays}</td>
                                            <td className="px-4 py-5 text-center">
                                                <button
                                                    onClick={(e) => openRemoveDialog(student, e)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                    title="Xoá học viên khỏi lớp"
                                                >
                                                    <UserMinus className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Remove Student Confirm Dialog */}
                <Dialog open={isRemoveDialogOpen} onOpenChange={(open) => { if (!open) { setIsRemoveDialogOpen(false); setStudentToRemove(null); setRemoveError(""); } }}>
                    <DialogContent className="sm:max-w-[400px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                                <UserMinus className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xoá học viên?</h3>
                            <p className="text-gray-500 text-sm">
                                Bạn có chắc chắn muốn xoá <span className="font-bold text-gray-900">{studentToRemove?.name}</span> khỏi lớp học?
                                Học viên sẽ không còn xuất hiện trong danh sách lớp.
                            </p>
                            {removeError && (
                                <p className="text-xs font-bold text-red-500 mt-3">{removeError}</p>
                            )}
                        </div>
                        <div className="bg-gray-50 p-4 flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => { setIsRemoveDialogOpen(false); setStudentToRemove(null); setRemoveError(""); }}
                                disabled={isRemoving}
                                className="flex-1 font-bold text-gray-900 border border-gray-300 rounded-xl px-4 py-3 hover:bg-gray-100"
                            >
                                Huỷ
                            </Button>
                            <Button
                                onClick={handleRemoveStudent}
                                disabled={isRemoving}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl disabled:opacity-60"
                            >
                                {isRemoving ? "Đang xoá..." : "Xoá"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 pt-4 pb-8">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400"><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="secondary" className="h-8 w-8 text-sm font-medium bg-[#f0f9f9] text-[#1fb2aa]">1</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400"><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
        </TeacherShell>
    );
}

