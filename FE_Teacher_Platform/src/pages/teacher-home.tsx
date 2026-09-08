import { Plus, Edit2, Trash2, Info, Calendar, Search } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { format, addMonths } from "date-fns";
import { classService as ClassService, toISODate, mapToClassItem } from "../services/classService";
import TeacherShell from "../components/teacher/TeacherShell";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import Dialog from "../components/ui/Dialog";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Select from "../components/ui/Select";
import { Tooltip } from "../components/ui/Tooltip";
import type { ClassItem } from "../types/class";

const LEVEL_OPTIONS = [
  { value: "5.0", label: "5.0" },
  { value: "5.5", label: "5.5" },
  { value: "6.0", label: "6.0" },
  { value: "6.5", label: "6.5" },
  { value: "7.0", label: "7.0" },
  { value: "7.5+", label: "7.5+" },
];

const TARGET_OPTIONS = [
  { value: "5.0", label: "5.0" },
  { value: "5.5", label: "5.5" },
  { value: "6.0", label: "6.0" },
  { value: "6.5", label: "6.5" },
  { value: "7.0", label: "7.0" },
  { value: "7.5+", label: "7.5+" },
  { value: "8.0+", label: "8.0+" },
  { value: "8.5+", label: "8.5+" },
];

const emptyForm = () => ({
  name: "",
  level: "5.0",
  target: "6.0",
  description: "",
  startDate: format(new Date(), "yyyy-MM-dd"),
  endDate: format(addMonths(new Date(), 3), "yyyy-MM-dd"),
  sessions: "",
});

export default function TeacherHome() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [, setLocation] = useLocation();
  const [newClass, setNewClass] = useState(emptyForm());
  const [levelError, setLevelError] = useState("");
  const [nameError, setNameError] = useState("");
  const [sessionError, setSessionError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ── Load classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const data = await ClassService.getMyClasses();
        setClasses(data.map(mapToClassItem));
      } catch (error) {
        console.error("Failed to load classes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // ── Auto-update endDate when startDate changes (create mode only)
  useEffect(() => {
    if (!editingClass) {
      const start = new Date(newClass.startDate);
      if (!isNaN(start.getTime())) {
        setNewClass((prev) => ({
          ...prev,
          endDate: format(addMonths(start, 3), "yyyy-MM-dd"),
        }));
      }
    }
  }, [newClass.startDate, editingClass]);

  // ── Derived state
  const wordCount = newClass.description.trim() ? newClass.description.trim().split(/\s+/).length : 0;
  const isDescriptionValid = wordCount <= 100;
  const nameWordCount = newClass.name.trim() ? newClass.name.trim().split(/\s+/).length : 0;
  const isNameLengthValid = nameWordCount <= 30;
  const today = format(new Date(), "yyyy-MM-dd");
  const isFormValid =
    newClass.name.trim() !== "" &&
    newClass.level !== "" &&
    newClass.target !== "" &&
    newClass.startDate.trim() !== "" &&
    newClass.endDate.trim() !== "" &&
    newClass.sessions.trim() !== "" &&
    !levelError && !nameError && !sessionError && !startDateError && !endDateError;

  // ── Validation
  const validateBands = (level: string, target: string) => {
    const l = parseFloat(level);
    const t = parseFloat(target.replace("+", ""));
    if (t <= l) {
      setLevelError("Diem muc tieu khong the nho hon hoac bang trinh do hien tai");
    } else {
      setLevelError("");
    }
  };

  const validateName = (name: string) => {
    const words = name.trim() ? name.trim().split(/\s+/).length : 0;
    if (words > 30) { setNameError("Ten lop khong duoc vuot qua 30 tu"); return; }
    const exists = classes.some((c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== editingClass?.id);
    if (exists) { setNameError("Ten lop da ton tai"); } else { setNameError(""); }
  };

  const validateSessions = (val: string) => {
    if (val === "") { setSessionError(""); return; }
    if (val.includes(".") || val.includes(",")) { setSessionError("So buoi phai la so nguyen duong"); return; }
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) { setSessionError("So buoi phai la so nguyen duong (lon hon 0)"); } else { setSessionError(""); }
  };

  const validateStartDate = (val: string) => {
    if (!val) { setStartDateError("Vui long chon ngay bat dau"); return; }
    if (val < today) { setStartDateError("Ngay bat dau khong duoc la ngay trong qua khu"); } else { setStartDateError(""); }
    validateEndDate(newClass.endDate, val);
  };

  const validateEndDate = (val: string, startVal?: string) => {
    const start = startVal ?? newClass.startDate;
    if (!val) { setEndDateError("Vui long chon ngay ket thuc"); return; }
    if (val < today) { setEndDateError("Ngay ket thuc khong duoc la ngay trong qua khu"); }
    else if (val <= start) { setEndDateError("Ngay ket thuc phai sau ngay bat dau"); }
    else { setEndDateError(""); }
  };

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Handlers
  const closeDialog = () => {
    setIsClassDialogOpen(false);
    setEditingClass(null);
    setNewClass(emptyForm());
    setNameError(""); setLevelError(""); setSessionError("");
    setStartDateError(""); setEndDateError(""); setSaveError("");
  };

  const openCreateDialog = () => {
    setEditingClass(null);
    setNewClass(emptyForm());
    setNameError(""); setLevelError(""); setSessionError("");
    setStartDateError(""); setEndDateError(""); setSaveError("");
    setIsClassDialogOpen(true);
  };

  const openEditDialog = (cls: ClassItem) => {
    setEditingClass(cls);
    setNewClass({
      name: cls.name,
      level: cls.level,
      target: cls.target,
      description: cls.description,
      startDate: cls.startDate,
      endDate: cls.endDate,
      sessions: typeof cls.sessions === "number" ? cls.sessions.toString() : "",
    });
    setNameError(""); setLevelError(""); setSessionError("");
    setStartDateError(""); setEndDateError(""); setSaveError("");
    setIsClassDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setClassToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleCreateClass = async () => {
    if (!isFormValid || !isDescriptionValid || !isNameLengthValid) return;
    setSaveError("");
    setIsSubmitting(true);
    try {
      const numberOfLessons = newClass.sessions === "" ? 0 : parseInt(newClass.sessions, 10);
      const currentLevel = parseFloat(newClass.level);
      const targetLevel = parseFloat(newClass.target.replace("+", ""));
      const finalDescription =
        newClass.description.trim() !== ""
          ? newClass.description
          : `Lop hoc IELTS muc tieu ${newClass.target}, giao trinh chuyen sau ve Writing.`;

      if (editingClass) {
        const updated = await ClassService.updateClass(Number(editingClass.id), {
          className: newClass.name,
          description: finalDescription,
          startDate: toISODate(newClass.startDate),
          endDate: toISODate(newClass.endDate),
          numberOfLessons,
          currentLevel,
          targetLevel,
        });
        setClasses((prev) => prev.map((c) => (c.id === editingClass.id ? mapToClassItem(updated) : c)));
      } else {
        const created = await ClassService.createClass({
          className: newClass.name,
          description: finalDescription,
          startDate: toISODate(newClass.startDate),
          endDate: toISODate(newClass.endDate),
          numberOfLessons,
          currentLevel,
          targetLevel,
        });
        setClasses((prev) => [mapToClassItem(created), ...prev]);
      }
      closeDialog();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Luu that bai");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!classToDelete) return;
    try {
      await ClassService.deleteClass(Number(classToDelete));
      setClasses((prev) => prev.filter((c) => c.id !== classToDelete));
      setIsDeleteConfirmOpen(false);
      setClassToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <TeacherShell contentClassName="p-10 overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-display text-3xl font-bold text-[#0f172a] mb-2 tracking-tight">Lớp học</h2>
              <p className="text-[#64748b] font-medium text-sm">Quản lý các lớp học IELTS của bạn</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full max-w-6xl mx-auto">
            <div className="relative flex-1">
              <input
                placeholder="Tim kiem lop hoc..."
                className="h-11 pl-11 w-full bg-white border border-[#e2e8f0] rounded-lg text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#183a68]/20 focus:border-[#183a68] font-medium transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]">
                <Search className="h-4 w-4" />
              </div>
            </div>
            <Button onClick={openCreateDialog} className="h-11 px-6 whitespace-nowrap flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tao lop moi
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-9 w-9 border-3 border-[#183a68] border-t-transparent" />
          </div>
        )}

        {/* Class Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr max-w-6xl mx-auto">
            {filteredClasses.map((cls) => (
              <div key={cls.id} className="block cursor-pointer" onClick={() => setLocation(`/teacher/class-progress/${cls.id}`)}>
                <Card className="group relative border border-[#e2e8f0] hover:border-[#183a68] transition-colors duration-200 rounded-lg bg-white h-full flex flex-col overflow-visible">
                  <CardContent className="p-5 flex flex-col h-full overflow-visible">
                    {/* Badges */}
                    <div className="flex items-start mb-3 px-0.5">
                      <div className="flex gap-2">
                        <div className="bg-[#fef3d6] border border-[#fde68a] px-2 py-0.5 rounded-[4px] inline-flex items-center gap-1.5 text-xs font-semibold">
                          <span className="text-[11px] font-bold text-[#b45309] uppercase tracking-wider">Trinh do</span>
                          <span className="font-bold text-[#92400e]">{cls.level}</span>
                        </div>
                        <div className="bg-[#eaf2fd] border border-[#c6dcfa] px-2 py-0.5 rounded-[4px] inline-flex items-center gap-1.5 text-xs font-semibold">
                          <span className="text-[11px] font-bold text-[#183a68] uppercase tracking-wider">Muc tieu</span>
                          <span className="font-bold text-[#183a68]">{cls.target}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex gap-1.5 items-center mb-3 text-xs font-medium text-[#64748b] bg-[#f8fafc] w-fit px-2.5 py-0.5 rounded-[4px] border border-[#e2e8f0]">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(cls.startDate), "dd/MM/yyyy")} –{" "}
                        {format(new Date(cls.endDate), "dd/MM/yyyy")}
                      </span>
                    </div>

                    {/* Name */}
                    <Tooltip content={`Ten: ${cls.name}`}>
                      <h3 className="text-lg font-bold text-[#0f172a] mb-2 group-hover:text-[#183a68] transition-colors cursor-pointer leading-snug line-clamp-2">
                        {cls.name}
                      </h3>
                    </Tooltip>

                    {/* Description */}
                    <Tooltip content={`Mo ta: ${cls.description}`}>
                      <p className="text-xs text-[#64748b] leading-relaxed mb-5 line-clamp-3 font-normal flex-grow cursor-default overflow-hidden">
                        {cls.description}
                      </p>
                    </Tooltip>

                    {/* Stats */}
                    <div className="flex flex-col gap-2 mb-5 mt-auto pt-3 border-t border-[#e2e8f0]/60">
                      <div className="flex items-center gap-1.5 text-[#64748b]">
                        <Plus className="h-4 w-4" />
                        <span className="text-xs font-semibold text-[#475569]">{cls.students} hoc vien</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#64748b]">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs font-semibold text-[#475569]">
                          {typeof cls.sessions === "number"
                            ? `${cls.sessions} buoi`
                            : cls.sessions === "Chua thiet lap so buoi"
                            ? <span className="text-[#94a3b8] font-normal italic">{cls.sessions}</span>
                            : <span className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-[#183a68]" />{cls.sessions}</span>}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 border-t border-[#e2e8f0] pt-4 mt-auto">
                      <Button
                        variant="outline"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditDialog(cls); }}
                        className="flex-1 h-9 flex items-center justify-center gap-1.5 text-[#0f172a] hover:text-[#183a68] hover:bg-[#eaf2fd] rounded-lg border border-[#e2e8f0] text-xs font-semibold transition-colors px-3"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Sua
                      </Button>
                      <Button
                        variant="outline"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmDelete(cls.id); }}
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-[#e2e8f0] hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Add New Class Card */}
            <div
              onClick={openCreateDialog}
              className="group border border-dashed border-[#cbd5e1] rounded-lg flex flex-col items-center justify-center p-8 hover:border-[#183a68] hover:bg-white transition-colors duration-200 cursor-pointer h-full min-h-[380px]"
            >
              <div className="h-11 w-11 rounded-lg bg-[#eaf2fd] flex items-center justify-center text-[#183a68] mb-3 group-hover:bg-[#183a68] group-hover:text-white transition-colors duration-200">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider group-hover:text-[#183a68] transition-colors duration-200">
                Tao lop moi
              </span>
            </div>
          </div>
        )}

        {/* Create/Edit Class Dialog */}
        <Dialog
          open={isClassDialogOpen}
          onClose={closeDialog}
          title={editingClass ? "Cap nhat lop hoc" : "Tao lop hoc moi"}
          maxWidth="max-w-xl"
        >
          <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Ten lop hoc <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="VD: Lop IELTS Sang T2-T4-T6"
                className={`w-full h-10 bg-white border rounded-lg px-3 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#183a68]/20 focus:border-[#183a68] transition-all ${nameError ? "border-red-500" : "border-[#e2e8f0]"}`}
                value={newClass.name}
                onChange={(e) => { setNewClass((p) => ({ ...p, name: e.target.value })); validateName(e.target.value); }}
                onBlur={(e) => { if (e.target.value.trim() === "") setNameError("Ten lop hoc khong duoc de trong"); }}
              />
              {nameError && <p className="text-xs font-bold text-red-500">{nameError}</p>}
            </div>

            {/* Level + Target */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Trinh do hien tai <span className="text-red-500">*</span></label>
                <Select
                  value={newClass.level}
                  onChange={(val) => { setNewClass((p) => ({ ...p, level: val })); validateBands(val, newClass.target); }}
                  options={LEVEL_OPTIONS}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Muc tieu <span className="text-red-500">*</span></label>
                <Select
                  value={newClass.target}
                  onChange={(val) => { setNewClass((p) => ({ ...p, target: val })); validateBands(newClass.level, val); }}
                  options={TARGET_OPTIONS}
                />
              </div>
            </div>
            {levelError && <p className="text-xs font-bold text-red-500">{levelError}</p>}

            {/* Dates + Sessions */}
            <div className="grid grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">Ngay bat dau</label>
                <Input
                  type="date"
                  min={today}
                  error={startDateError}
                  value={newClass.startDate}
                  onChange={(e) => { setNewClass((p) => ({ ...p, startDate: e.target.value })); validateStartDate(e.target.value); }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">Ngay ket thuc</label>
                <Input
                  type="date"
                  min={newClass.startDate || today}
                  error={endDateError}
                  value={newClass.endDate}
                  onChange={(e) => { setNewClass((p) => ({ ...p, endDate: e.target.value })); validateEndDate(e.target.value); }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">So buoi <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  min="0"
                  placeholder="VD: 24"
                  error={sessionError}
                  value={newClass.sessions}
                  onKeyDown={(e) => { if (e.key === "-" || e.key === "e" || e.key === ".") e.preventDefault(); }}
                  onChange={(e) => { setNewClass((p) => ({ ...p, sessions: e.target.value })); validateSessions(e.target.value); }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-900">Mo ta lop hoc</label>
                <span className={`text-[11px] font-bold ${isDescriptionValid ? "text-gray-400" : "text-red-500"}`}>
                  {wordCount}/100 tu
                </span>
              </div>
              <textarea
                placeholder="Nhap mo ta chi tiet ve lop hoc..."
                rows={4}
                className={`w-full bg-white border rounded-lg px-3 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#183a68]/20 focus:border-[#183a68] resize-none transition-all ${!isDescriptionValid ? "border-red-500" : "border-[#e2e8f0]"}`}
                value={newClass.description}
                onChange={(e) => setNewClass((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            {saveError && <p className="text-xs font-bold text-red-500 text-center">{saveError}</p>}
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
            <Button variant="outline" onClick={closeDialog} className="flex-1" disabled={isSubmitting}>
              Huy bo
            </Button>
            <Button
              onClick={handleCreateClass}
              disabled={!isFormValid || !isDescriptionValid || !isNameLengthValid || isSubmitting}
              isLoading={isSubmitting}
              className="flex-1"
            >
              {editingClass ? "Cap nhat" : "Tao lop hoc"}
            </Button>
          </div>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          maxWidth="max-w-sm"
        >
          <div className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-[#0f172a] mb-1.5">Xoa lop hoc?</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">Hanh dong nay khong the hoan tac. Ban co chac chan muon xoa lop hoc nay?</p>
          </div>
          <div className="bg-[#f8fafc] p-3.5 flex gap-2.5 border-t border-[#e2e8f0]">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1">
              Huy
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Xoa
            </Button>
          </div>
        </Dialog>
      </div>
    </TeacherShell>
  );
}
