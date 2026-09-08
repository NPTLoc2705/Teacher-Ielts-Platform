import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Star, Trash2, ArrowDown, ArrowUp, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  format, addDays, differenceInDays, parseISO,
} from "date-fns";
import TeacherShell from "../components/teacher/TeacherShell";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Dialog from "../components/ui/Dialog";
import { classService as ClassService } from "../services/classService";
import type { ClassResponse } from "../types/class";

interface GradingItem {
  id: string;
  taskHistoryId: number;
  classId: number;
  user?: string;
  classGroup?: string;
  writingDate?: Date | null;
  topic?: string;
  taskType?: string;
  questionType?: string;
  status?: "Tu cham" | "Sua bai AI" | "Chua cham";
  aiScore?: number | null;
  yourScore?: number | string | null;
  isStarred: boolean;
}

const TIME_OPTIONS = [
  { value: "all", label: "Tat ca" },
  { value: "7days", label: "7 ngay qua" },
  { value: "30days", label: "30 ngay qua" },
  { value: "custom", label: "Chon khoang thoi gian" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Moi nhat" },
  { value: "oldest", label: "Cu nhat" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Hinh thuc (Tat ca)" },
  { value: "self", label: "Tu cham" },
  { value: "ai", label: "Sua bai AI" },
  { value: "none", label: "Chua cham" },
];

const TASK_TYPE_OPTIONS = [
  { value: "all", label: "Loai bai viet (Tat ca)" },
  { value: "task1", label: "Task 1" },
  { value: "task2", label: "Task 2" },
  { value: "virtual", label: "Virtual Exam" },
];

const ROWS_PER_PAGE = 5;

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-gray-300">&nbsp;</span>;
  const cfg =
    status === "Tu cham" ? "bg-emerald-50 text-emerald-600" :
    status === "Sua bai AI" ? "bg-orange-50 text-orange-600" :
    "bg-gray-50 text-gray-400";
  return (
    <span className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-bold ${cfg}`}>
      {status}
    </span>
  );
}

export default function GradingCenter() {
  const [, setLocation] = useLocation();
  const today = new Date();

  const [assignedData, setAssignedData] = useState<GradingItem[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassResponse[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGradingModeModalOpen, setIsGradingModeModalOpen] = useState(false);
  const [isConfirmReGradeOpen, setIsConfirmReGradeOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GradingItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [isStarredOnly, setIsStarredOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [taskTypeFilter, setTaskTypeFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "7days" | "30days" | "custom">("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [dateRangeError, setDateRangeError] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Load classes
  useEffect(() => {
    ClassService.getMyClasses()
      .then((classes) => {
        setAvailableClasses(classes);
        const params = new URLSearchParams(window.location.search);
        const classIdParam = Number(params.get("classId"));
        if (Number.isFinite(classIdParam) && classIdParam > 0) {
          const found = classes.find((c) => c.id === classIdParam);
          if (found) setClassFilter(found.id.toString());
        }
      })
      .catch(console.error);
  }, []);

  // Load grading rows
  useEffect(() => {
    const load = async () => {
      setIsLoadingRows(true);
      try {
        const res = await ClassService.getAllGradingItems({
          classId: classFilter !== "all" ? Number(classFilter) : undefined,
          timeFilter,
          customStart: customStart || undefined,
          customEnd: customEnd || undefined,
          isStarredOnly,
          taskTypeFilter,
          gradingModeFilter: statusFilter,
          sortOrder,
          page: currentPage,
          pageSize: ROWS_PER_PAGE,
        });
        const rows: GradingItem[] = (res.items as any[]).map((entry) => ({
          id: `history-${entry.taskHistoryId}`,
          taskHistoryId: entry.taskHistoryId,
          classId: entry.classId,
          user: entry.studentName,
          classGroup: entry.className,
          writingDate: entry.created ? new Date(entry.created) : null,
          topic: entry.topic ?? "",
          taskType: entry.taskType ?? "",
          questionType: entry.questionType ?? "",
          status: entry.gradingMode === "ai" ? "Sua bai AI" :
                  entry.gradingMode === "self" ? "Tu cham" : "Chua cham",
          aiScore: entry.aiScore,
          yourScore: entry.yourScore ?? null,
          isStarred: entry.isStarred,
        }));
        setAssignedData(rows);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.totalCount || 0);
      } catch (err) {
        console.error(err);
        setAssignedData([]);
        setTotalPages(1);
        setTotalCount(0);
      } finally {
        setIsLoadingRows(false);
      }
    };
    load();
  }, [classFilter, timeFilter, customStart, customEnd, isStarredOnly, taskTypeFilter, statusFilter, sortOrder, currentPage]);

  const maxEndDate = customStart
    ? format(addDays(parseISO(customStart), 90), "yyyy-MM-dd")
    : undefined;

  const handleCustomStartChange = (val: string) => {
    setCustomStart(val);
    setDateRangeError("");
    if (customEnd && val && differenceInDays(parseISO(customEnd), parseISO(val)) > 90) {
      setCustomEnd("");
      setDateRangeError("Khoang thoi gian toi da la 90 ngay.");
    }
  };

  const handleCustomEndChange = (val: string) => {
    setDateRangeError("");
    if (customStart && val && differenceInDays(parseISO(val), parseISO(customStart)) > 90) {
      setDateRangeError("Khoang thoi gian toi da la 90 ngay.");
      return;
    }
    setCustomEnd(val);
  };

  const toggleStar = async (item: GradingItem) => {
    const nextStar = !item.isStarred;
    setAssignedData((prev) => prev.map((r) => r.id === item.id ? { ...r, isStarred: nextStar } : r));
    try {
      await ClassService.toggleTeacherGradingStar(item.classId, item.taskHistoryId, nextStar);
    } catch {
      setAssignedData((prev) => prev.map((r) => r.id === item.id ? { ...r, isStarred: item.isStarred } : r));
    }
  };

  const handleDeleteClick = (id: string) => { setItemToDelete(id); setIsDeleteModalOpen(true); };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const item = assignedData.find((i) => i.id === itemToDelete);
    if (!item) return;
    try {
      await ClassService.hideGradingItem(item.classId, item.taskHistoryId);
      setAssignedData((prev) => prev.filter((i) => i.id !== itemToDelete));
      setTotalCount((p) => Math.max(0, p - 1));
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const navigateToFeedback = (item: GradingItem | null, mode?: string) => {
    if (!item) return;
    const effectiveMode = mode ?? (item.status === "Sua bai AI" ? "ai" : item.status === "Tu cham" ? "self" : undefined);
    const modeParam = effectiveMode ? `&gradingMode=${effectiveMode}` : "";
    const hasTeacherScore = item.yourScore != null && item.yourScore !== "" && item.yourScore !== 0;
    const teacherGradedParam = hasTeacherScore ? "&teacherGraded=1" : "";
    const normalizedTask = (item.taskType || "").toLowerCase();
    if (normalizedTask.includes("virtual")) {
      setLocation(`/teacher/feedback/${item.taskHistoryId}?classId=${item.classId}&gradingMode=${effectiveMode ?? "ai"}&source=grading-center&taskType=virtual-exam${teacherGradedParam}`);
      return;
    }
    const taskType = normalizedTask.includes("task 1") || normalizedTask.includes("task1") ? "task1" : "task2";
    setLocation(`/teacher/feedback/${item.taskHistoryId}?classId=${item.classId}${modeParam}&source=grading-center&taskType=${taskType}${teacherGradedParam}`);
  };

  const handleRowClick = (item: GradingItem) => {
    setSelectedItem(item);
    if (item.status === "Chua cham") {
      setIsGradingModeModalOpen(true);
    } else {
      navigateToFeedback(item);
    }
  };

  const handleSelectGradingMode = async (mode: "ai" | "self") => {
    if (!selectedItem) return;
    try {
      await ClassService.setGradingMode(selectedItem.taskHistoryId, mode);
      setAssignedData((prev) => prev.map((r) => r.id === selectedItem.id ? { ...r, status: mode === "ai" ? "Sua bai AI" as const : "Tu cham" as const } : r));
    } catch (err) {
      console.error(err);
    }
    setIsGradingModeModalOpen(false);
    navigateToFeedback(selectedItem, mode);
  };

  const classOptions = [
    { value: "all", label: "Lop (Tat ca)" },
    ...availableClasses.map((c) => ({ value: c.id.toString(), label: c.className })),
  ];

  return (
    <TeacherShell contentClassName="min-w-0 overflow-auto p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-center text-[#0f172a] mb-8 tracking-tight">
          Trung tâm chấm bài
        </h1>

        {/* Filter Bar */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Left: time + sort */}
            <div className="flex items-center gap-3">
              <Select
                value={timeFilter}
                onChange={(val) => {
                  setTimeFilter(val as any);
                  setDateRangeError("");
                  setCurrentPage(1);
                  if (val !== "custom") { setCustomStart(""); setCustomEnd(""); }
                }}
                options={TIME_OPTIONS}
                className="w-48"
              />
              <Select
                value={sortOrder}
                onChange={(val) => { setSortOrder(val as any); setCurrentPage(1); }}
                options={SORT_OPTIONS}
                className="w-36"
              />
            </div>

            {/* Right: class + status + type + starred */}
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={classFilter}
                onChange={(v) => { setClassFilter(v); setCurrentPage(1); }}
                options={classOptions}
                className="w-40"
              />
              <Select
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
                options={STATUS_OPTIONS}
                className="w-36"
              />
              <Select
                value={taskTypeFilter}
                onChange={(v) => { setTaskTypeFilter(v); setCurrentPage(1); }}
                options={TASK_TYPE_OPTIONS}
                className="w-40"
              />
              <Button
                variant={isStarredOnly ? "primary" : "outline"}
                onClick={() => { setIsStarredOnly(!isStarredOnly); setCurrentPage(1); }}
                className={`h-10 px-4 flex items-center gap-2 ${isStarredOnly ? "!bg-amber-50 !text-amber-600 !border-amber-200" : ""}`}
              >
                <Star className={`h-4 w-4 ${isStarredOnly ? "fill-current" : ""}`} />
                Da danh dau
              </Button>
            </div>
          </div>

          {/* Custom date range */}
          {timeFilter === "custom" && (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={customStart}
                max={format(today, "yyyy-MM-dd")}
                onChange={(e) => { handleCustomStartChange(e.target.value); setCurrentPage(1); }}
                className="h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#1fb2aa]"
              />
              <span className="text-gray-400 font-medium text-sm">→</span>
              <input
                type="date"
                value={customEnd}
                min={customStart || undefined}
                max={maxEndDate}
                disabled={!customStart}
                onChange={(e) => { handleCustomEndChange(e.target.value); setCurrentPage(1); }}
                className="h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#1fb2aa] disabled:opacity-40"
              />
              {dateRangeError && <p className="text-red-500 text-xs font-semibold">{dateRangeError}</p>}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#e2e8f0] p-6">
          <h2 className="text-xl font-bold text-[#0f172a] mb-6">Bài viết mới từ học viên</h2>
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  <th className="w-6 pb-3" />
                  <th className="w-28 pb-3 text-left font-bold text-[#0f172a] text-[13px]">
                    <div className="flex items-center gap-1.5">
                      Ngày viết
                      <button
                        onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                        className="text-gray-400 hover:text-[#183a68] transition-colors"
                      >
                        {sortOrder === "newest" ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </th>
                  <th className="w-36 pb-3 text-left font-bold text-[#0f172a] text-[13px]">Học viên</th>
                  <th className="pb-3 text-left font-bold text-[#0f172a] text-[13px]">Topic</th>
                  <th className="w-28 pb-3 text-center font-bold text-[#0f172a] text-[13px]">Hình thức</th>
                  <th className="w-28 pb-3 text-center font-bold text-[#0f172a] text-[13px]">Điểm của bạn</th>
                  <th className="w-24 pb-3 text-center font-bold text-[#0f172a] text-[13px]">Điểm AI</th>
                  <th className="w-24 pb-3 text-right font-bold text-[#0f172a] text-[13px]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {assignedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 py-12 text-sm font-medium">
                      {isLoadingRows ? "Dang tai du lieu..." : "Khong co bai viet nao trong khoang thoi gian nay."}
                    </td>
                  </tr>
                ) : (
                  assignedData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50/40 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(item)}
                    >
                      <td className="py-3 pr-0 align-middle">
                        {item.status === "Chua cham" && <div className="w-2 h-2 rounded-full bg-red-500" />}
                      </td>
                      <td className="py-3 align-middle text-gray-900 text-[14px] font-medium whitespace-nowrap">
                        {item.writingDate ? format(item.writingDate, "dd/MM/yyyy") : ""}
                      </td>
                      <td className="py-3 align-middle text-gray-900 text-[14px] break-words">
                        {item.user ?? ""}
                      </td>
                      <td className="py-3 align-middle">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className="text-[14px] text-gray-700 break-words leading-snug"
                            style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                            title={item.topic ?? ""}
                          >
                            {item.topic ?? ""}
                          </span>
                          <span className="text-[12px] text-gray-400 font-medium whitespace-nowrap">
                            {item.taskType && item.questionType ? `${item.taskType} – ${item.questionType}` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 align-middle text-center">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3 align-middle text-center">
                        {item.yourScore == null ? (
                          <span className="text-gray-300 font-bold text-[13px]">&nbsp;</span>
                        ) : (
                          <div className="inline-flex items-center justify-center px-3 rounded-full bg-[#1fb2aa] text-white font-bold text-[11px] min-w-[45px] h-6">
                            {typeof item.yourScore === "number" ? item.yourScore.toFixed(1) : item.yourScore}
                          </div>
                        )}
                      </td>
                      <td className="py-3 align-middle text-center">
                        {typeof item.aiScore === "number" ? (
                          <div className="inline-flex items-center justify-center px-3 rounded-full bg-teal-50 text-teal-600 font-bold text-[11px] min-w-[45px] h-6">
                            {item.aiScore.toFixed(1)}
                          </div>
                        ) : (
                          <span className="text-[13px] text-gray-300">&nbsp;</span>
                        )}
                      </td>
                      <td className="py-3 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleStar(item)}
                            className={`h-8 w-8 ${item.isStarred ? "text-amber-400 hover:text-amber-500" : "text-gray-300 hover:text-amber-400"}`}
                          >
                            <Star className={`h-4 w-4 ${item.isStarred ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(item.id); }}
                            className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 ml-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-4">
                <div className="text-sm text-gray-500">
                  Hien thi {((currentPage - 1) * ROWS_PER_PAGE) + 1}–{Math.min(currentPage * ROWS_PER_PAGE, totalCount)} trong so {totalCount} bai viet
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoadingRows}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-8 w-8 p-0"
                      disabled={isLoadingRows}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoadingRows}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Xac nhan an bai" maxWidth="max-w-sm">
        <div className="p-6 text-center">
          <p className="text-gray-500 font-medium mb-6">
            Ban co chac muon an bai viet nay khoi Trung tam cham bai khong?<br />
            Hanh dong nay se khong xoa du lieu cua hoc vien.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1">Huy</Button>
            <Button variant="danger" onClick={confirmDelete} className="flex-1">An bai</Button>
          </div>
        </div>
      </Dialog>

      {/* Grading Mode Modal */}
      <Dialog
        open={isGradingModeModalOpen}
        onClose={() => setIsGradingModeModalOpen(false)}
        title="Chon hinh thuc cham bai"
        maxWidth="max-w-md"
      >
        <div className="p-6 space-y-4">
          <p className="text-center text-red-600 font-bold text-sm">
            Luu y: Ban chi co the lua chon 1 hinh thuc cham. Sau khi chon, ban se khong the thay doi.
          </p>
          <button
            onClick={() => handleSelectGradingMode("ai")}
            className="w-full h-auto py-5 px-6 rounded-lg bg-white border-2 border-orange-300 hover:border-orange-600 transition-all flex flex-col items-center text-center gap-1"
          >
            <span className="text-lg font-bold text-orange-600">Sua bai cham cua AI</span>
            <span className="text-xs text-gray-700 leading-relaxed">Ban se duoc xem bai cham tu AI va sua truc tiep.</span>
          </button>
          <button
            onClick={() => handleSelectGradingMode("self")}
            className="w-full h-auto py-5 px-6 rounded-lg bg-white border-2 border-emerald-400 hover:border-emerald-600 transition-all flex flex-col items-center text-center gap-1"
          >
            <span className="text-lg font-bold text-emerald-600">Tu cham</span>
            <span className="text-xs text-gray-700 leading-relaxed">Ban se tu cham ma khong xem ket qua tu AI.</span>
          </button>
        </div>
      </Dialog>

      {/* Re-grade Confirmation Modal */}
      <Dialog
        open={isConfirmReGradeOpen}
        onClose={() => setIsConfirmReGradeOpen(false)}
        title="Cham lai bai viet?"
        maxWidth="max-w-sm"
      >
        <div className="p-6">
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setIsConfirmReGradeOpen(false)} className="flex-1">Khong</Button>
            <Button onClick={() => { setIsConfirmReGradeOpen(false); setIsGradingModeModalOpen(false); navigateToFeedback(selectedItem); }} className="flex-1">Co</Button>
          </div>
        </div>
      </Dialog>
    </TeacherShell>
  );
}
