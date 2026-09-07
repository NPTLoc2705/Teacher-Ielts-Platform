import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, ImagePlus, Info } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/Dialog";

interface CreateTaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function InfoTooltip({ text }: { text: string }) {
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const ref = useRef<HTMLButtonElement>(null);

    const handleMouseEnter = () => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const rawLeft = rect.left + rect.width / 2;
            const tooltipWidth = 280;
            const adjustedLeft = Math.max(tooltipWidth / 2 + 8, Math.min(rawLeft, window.innerWidth - tooltipWidth / 2 - 8));
            setPos({ top: rect.top - 10, left: adjustedLeft });
        }
        setShow(true);
    };

    return (
        <>
            <button
                ref={ref}
                type="button"
                className="text-gray-400 hover:text-gray-500 shrink-0 focus:outline-none"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setShow(false)}
                tabIndex={-1}
            >
                <Info className="h-3.5 w-3.5" />
            </button>
            {show && createPortal(
                <div
                    className="fixed z-[9999] max-w-[280px] text-xs text-white bg-gray-800 rounded-xl px-3 py-2.5 leading-relaxed pointer-events-none shadow-xl"
                    style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}
                >
                    {text}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 top-full"
                        style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1f2937' }}
                    />
                </div>,
                document.body
            )}
        </>
    );
}

export default function CreateTaskModal({ open, onOpenChange }: CreateTaskModalProps) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const sevenDaysLaterStr = sevenDaysLater.toISOString().slice(0, 10);

    const [taskLoaiBai, setTaskLoaiBai] = useState<'Task 1' | 'Task 2' | 'Full Exam'>('Task 1');
    const [taskHinhThuc, setTaskHinhThuc] = useState<'Bài tập' | 'Bài thi'>('Bài tập');
    const [taskTab, setTaskTab] = useState<'tu-tao-de' | 'de-ngau-nhien'>('tu-tao-de');
    const [taskTenBaiTap, setTaskTenBaiTap] = useState('');
    const [taskDeBai, setTaskDeBai] = useState('');
    const [taskDeBaiTask2, setTaskDeBaiTask2] = useState('');
    const [taskLuuY, setTaskLuuY] = useState('');
    const [taskNgayMo, setTaskNgayMo] = useState(todayStr);
    const [taskGioMo, setTaskGioMo] = useState('20:00');
    const [taskHanNop, setTaskHanNop] = useState(sevenDaysLaterStr);
    const [taskGioHanNop, setTaskGioHanNop] = useState('23:00');
    const [taskDateError, setTaskDateError] = useState(false);
    const [_taskNgayMoPastError, setTaskNgayMoPastError] = useState(false);
    const [taskChoPhepNopMuon, setTaskChoPhepNopMuon] = useState(false);
    const [taskChoXemHuongDan, setTaskChoXemHuongDan] = useState(false);
    const [taskChoXemTruocDe, setTaskChoXemTruocDe] = useState(false);
    const [taskSelectedClasses, setTaskSelectedClasses] = useState<string[]>([]);
    const [taskClassDropdownOpen, setTaskClassDropdownOpen] = useState(false);
    const [taskLoaiBaiDropdownOpen, setTaskLoaiBaiDropdownOpen] = useState(false);
    const [taskHinhThucDropdownOpen, setTaskHinhThucDropdownOpen] = useState(false);
    const [taskThoiGianDropdownOpen, setTaskThoiGianDropdownOpen] = useState(false);
    const [taskImageFile, setTaskImageFile] = useState<File | null>(null);
    const [taskSelectedQuestionTypes, setTaskSelectedQuestionTypes] = useState<string[]>([]);
    const taskImageRef = useRef<HTMLInputElement>(null);

    const getDefaultDuration = (loaiBai: string) => {
        if (loaiBai === 'Task 1') return '20 phút';
        if (loaiBai === 'Task 2') return '40 phút';
        return '60 phút';
    };
    const [taskThoiGian, setTaskThoiGian] = useState('20 phút');

    useEffect(() => {
        setTaskThoiGian(getDefaultDuration(taskLoaiBai));
        setTaskSelectedQuestionTypes([]);
    }, [taskLoaiBai]);

    const isNgayMoPast = (() => {
        const dt = new Date(`${taskNgayMo}T${taskGioMo}`);
        return dt < new Date();
    })();

    const isDeNgauNhienValid = taskTab !== 'de-ngau-nhien' || taskSelectedQuestionTypes.length > 0;

    const isFormValid =
        taskTenBaiTap.trim().length > 0 &&
        taskSelectedClasses.length > 0 &&
        !taskDateError &&
        !isNgayMoPast &&
        isDeNgauNhienValid;

    const classOptionsReal = ['Lớp 2 - 4 - 6', 'Lớp luyện thi', 'Lớp 3 - 5 - 7'];
    const classOptions = [...classOptionsReal, 'Tất cả'];

    const toggleClass = (cls: string) => {
        if (cls === 'Tất cả') {
            setTaskSelectedClasses(prev =>
                prev.length === classOptionsReal.length ? [] : [...classOptionsReal]
            );
            return;
        }
        setTaskSelectedClasses(prev =>
            prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
        );
    };

    const task1QuestionTypes = ['Line Graph', 'Bar Chart', 'Pie Chart', 'Table', 'Map', 'Process Diagram', 'Multiple Graphs'];
    const task2QuestionTypes = ['Opinion', 'Discussion', 'Problem - Solution', 'Advantage - Disadvantage', 'Two-part Question'];

    const getQuestionTypes = () => {
        if (taskLoaiBai === 'Task 1') return { 'Task 1': task1QuestionTypes };
        if (taskLoaiBai === 'Task 2') return { 'Task 2': task2QuestionTypes };
        return { 'Task 1': task1QuestionTypes, 'Task 2': task2QuestionTypes };
    };

    const toggleQuestionType = (type: string) => {
        setTaskSelectedQuestionTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleHanNopChange = (value: string) => {
        setTaskHanNop(value);
        setTaskDateError(value < taskNgayMo);
    };

    const handleNgayMoChange = (value: string) => {
        setTaskNgayMo(value);
        setTaskDateError(taskHanNop < value);
    };

    const handleGioMoChange = (value: string) => {
        setTaskGioMo(value);
    };

    const thoiGianOptions = ['20 phút', '30 phút', '40 phút', '60 phút', 'Không giới hạn'];

    const resetForm = () => {
        setTaskTenBaiTap('');
        setTaskDeBai('');
        setTaskDeBaiTask2('');
        setTaskLuuY('');
        setTaskSelectedClasses([]);
        setTaskLoaiBai('Task 1');
        setTaskHinhThuc('Bài tập');
        setTaskTab('tu-tao-de');
        setTaskImageFile(null);
        setTaskSelectedQuestionTypes([]);
        setTaskDateError(false);
        setTaskNgayMoPastError(false);
        setTaskNgayMo(todayStr);
        setTaskHanNop(sevenDaysLaterStr);
        setTaskGioMo('20:00');
        setTaskGioHanNop('23:00');
        setTaskChoXemTruocDe(false);
        setTaskChoPhepNopMuon(false);
        setTaskChoXemHuongDan(false);
    };

    const handleCreateTask = () => {
        if (!isFormValid) return;
        onOpenChange(false);
        resetForm();
    };

    const handleClose = () => {
        onOpenChange(false);
        resetForm();
    };

    const showChoXemHuongDan = taskLoaiBai !== 'Full Exam';

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
            <DialogContent className="sm:max-w-[580px] p-0 rounded-2xl border-none overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
                <div className="px-8 pt-4 pb-3 border-b border-gray-100 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 text-center">Nội dung bài tập</h2>
                </div>

                <div className="overflow-y-auto flex-1 px-8 py-4 space-y-4 thin-scrollbar">

                    {/* Loại bài + Hình thức */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900">Loại bài</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => { setTaskLoaiBaiDropdownOpen(v => !v); setTaskHinhThucDropdownOpen(false); setTaskThoiGianDropdownOpen(false); setTaskClassDropdownOpen(false); }}
                                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white hover:border-[#1fb2aa] focus:outline-none focus:ring-1 focus:ring-[#1fb2aa] flex items-center justify-between"
                                >
                                    {taskLoaiBai} <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                                </button>
                                {taskLoaiBaiDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                                        {(['Task 1', 'Task 2', 'Full Exam'] as const).map(opt => (
                                            <div key={opt} onMouseDown={e => { e.preventDefault(); setTaskLoaiBai(opt); setTaskLoaiBaiDropdownOpen(false); }}
                                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${taskLoaiBai === opt ? 'bg-[#f0fdfa] text-[#1fb2aa] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900">Hình thức</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => { setTaskHinhThucDropdownOpen(v => !v); setTaskLoaiBaiDropdownOpen(false); setTaskThoiGianDropdownOpen(false); setTaskClassDropdownOpen(false); }}
                                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white hover:border-[#1fb2aa] focus:outline-none focus:ring-1 focus:ring-[#1fb2aa] flex items-center justify-between"
                                >
                                    {taskHinhThuc} <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                                </button>
                                {taskHinhThucDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                                        {(['Bài tập', 'Bài thi'] as const).map(opt => (
                                            <div key={opt} onMouseDown={e => { e.preventDefault(); setTaskHinhThuc(opt); setTaskHinhThucDropdownOpen(false); }}
                                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${taskHinhThuc === opt ? 'bg-[#f0fdfa] text-[#1fb2aa] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Áp dụng cho lớp */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-900">
                            Áp dụng cho lớp <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => { setTaskClassDropdownOpen(v => !v); setTaskLoaiBaiDropdownOpen(false); setTaskHinhThucDropdownOpen(false); setTaskThoiGianDropdownOpen(false); }}
                                    className="h-10 px-4 border border-gray-200 rounded-lg text-sm text-gray-500 bg-white hover:border-[#1fb2aa] focus:outline-none focus:ring-1 focus:ring-[#1fb2aa] flex items-center gap-2"
                                >
                                    Danh sách lớp <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                                {taskClassDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden min-w-[170px]">
                                        {classOptions.map(cls => {
                                            const isAllSelected = cls === 'Tất cả' && taskSelectedClasses.length === classOptionsReal.length;
                                            const isSelected = cls !== 'Tất cả' ? taskSelectedClasses.includes(cls) : isAllSelected;
                                            return (
                                                <div
                                                    key={cls}
                                                    onMouseDown={e => { e.preventDefault(); toggleClass(cls); }}
                                                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${isSelected ? 'bg-[#f0fdfa] text-[#1fb2aa] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    {cls}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            {taskSelectedClasses.map(cls => (
                                <div key={cls} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0fdfa] border border-[#1fb2aa]/30 rounded-full text-xs font-bold text-[#0d7377]">
                                    <span>{cls}</span>
                                    <button onClick={() => toggleClass(cls)} className="text-gray-400 hover:text-[#1fb2aa]"><X className="h-3 w-3" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setTaskTab('tu-tao-de')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg border transition-all ${taskTab === 'tu-tao-de' ? 'bg-[#1fb2aa] text-white border-[#1fb2aa]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#1fb2aa] hover:text-[#1fb2aa]'}`}
                        >
                            Tự tạo đề
                        </button>
                        <button
                            onClick={() => setTaskTab('de-ngau-nhien')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg border transition-all ${taskTab === 'de-ngau-nhien' ? 'bg-[#1fb2aa] text-white border-[#1fb2aa]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#1fb2aa] hover:text-[#1fb2aa]'}`}
                        >
                            Đề ngẫu nhiên
                        </button>
                    </div>

                    {/* TỰ TẠO ĐỀ */}
                    {taskTab === 'tu-tao-de' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-900">Tên <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Input
                                        value={taskTenBaiTap}
                                        onChange={e => setTaskTenBaiTap(e.target.value.slice(0, 100))}
                                        maxLength={100}
                                        placeholder="Nhập tên cho bài tập / bài thi được giao"
                                        className="h-10 border border-gray-200 rounded-lg px-3 pr-14 text-sm focus-visible:ring-1 focus-visible:ring-[#1fb2aa]"
                                    />
                                    <span className="absolute top-1/2 -translate-y-1/2 right-3 text-[11px] text-gray-400">{taskTenBaiTap.length}/100</span>
                                </div>
                            </div>

                            {(taskLoaiBai === 'Task 1' || taskLoaiBai === 'Full Exam') && (
                                <div className="space-y-3">
                                    {taskLoaiBai === 'Full Exam' && <p className="text-xs font-bold text-[#1fb2aa] uppercase tracking-wide">Task 1</p>}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-gray-900">Ảnh biểu đồ / bảng <span className="text-red-500">*</span></label>
                                        <div
                                            onClick={() => taskImageRef.current?.click()}
                                            className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#1fb2aa] hover:bg-[#f0fdfa]/40 transition-all"
                                        >
                                            {taskImageFile ? (
                                                <span className="text-sm text-[#1fb2aa] font-medium">{taskImageFile.name}</span>
                                            ) : (
                                                <>
                                                    <ImagePlus className="h-5 w-5 text-gray-300" />
                                                    <span className="text-xs text-gray-400">Nhấn để tải ảnh lên</span>
                                                </>
                                            )}
                                        </div>
                                        <input ref={taskImageRef} type="file" accept="image/*" className="hidden" onChange={e => setTaskImageFile(e.target.files?.[0] || null)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-gray-900">Đề bài <span className="text-red-500">*</span></label>
                                        <textarea
                                            value={taskDeBai}
                                            onChange={e => setTaskDeBai(e.target.value)}
                                            placeholder="Nhập nội dung đề"
                                            rows={3}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-[#1fb2aa] placeholder:text-gray-400"
                                        />
                                    </div>
                                    {/* Cho học viên xem trước đề — only shown here when Task 1 only */}
                                    {taskLoaiBai === 'Task 1' && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={taskChoXemTruocDe}
                                                onChange={e => setTaskChoXemTruocDe(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 accent-[#1fb2aa]"
                                            />
                                            <span className="text-sm text-gray-700">Cho học viên xem trước đề</span>
                                        </label>
                                    )}
                                </div>
                            )}

                            {(taskLoaiBai === 'Task 2' || taskLoaiBai === 'Full Exam') && (
                                <div className="space-y-3">
                                    {taskLoaiBai === 'Full Exam' && <p className="text-xs font-bold text-[#1fb2aa] uppercase tracking-wide">Task 2</p>}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-gray-900">Đề bài <span className="text-red-500">*</span></label>
                                        <textarea
                                            value={taskLoaiBai === 'Full Exam' ? taskDeBaiTask2 : taskDeBai}
                                            onChange={e => taskLoaiBai === 'Full Exam' ? setTaskDeBaiTask2(e.target.value) : setTaskDeBai(e.target.value)}
                                            placeholder="Nhập nội dung đề"
                                            rows={3}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-[#1fb2aa] placeholder:text-gray-400"
                                        />
                                    </div>
                                    {/* Cho học viên xem trước đề — after last Đề bài (Task 2 or Full Exam) */}
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={taskChoXemTruocDe}
                                            onChange={e => setTaskChoXemTruocDe(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 accent-[#1fb2aa]"
                                        />
                                        <span className="text-sm text-gray-700">Cho học viên xem trước đề</span>
                                    </label>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-900">Lưu ý cho học viên</label>
                                <textarea
                                    value={taskLuuY}
                                    onChange={e => setTaskLuuY(e.target.value)}
                                    placeholder={`Bạn có thể thêm lưu ý cho học viên trước khi làm bài.\nVí dụ "Chỉ cần viết Overview cho đề bài"`}
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-[#1fb2aa] placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    )}

                    {/* ĐỀ NGẪU NHIÊN */}
                    {taskTab === 'de-ngau-nhien' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-900">Tên <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Input
                                        value={taskTenBaiTap}
                                        onChange={e => setTaskTenBaiTap(e.target.value.slice(0, 100))}
                                        maxLength={100}
                                        placeholder="Nhập tên cho bài tập / bài thi được giao"
                                        className="h-10 border border-gray-200 rounded-lg px-3 pr-14 text-sm focus-visible:ring-1 focus-visible:ring-[#1fb2aa]"
                                    />
                                    <span className="absolute top-1/2 -translate-y-1/2 right-3 text-[11px] text-gray-400">{taskTenBaiTap.length}/100</span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400">Hệ thống sẽ tự động chọn đề ngẫu nhiên phù hợp với loại bài.</p>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-900">
                                    Chọn dạng đề bạn muốn <span className="text-red-500">*</span>
                                </label>
                                {taskSelectedQuestionTypes.length === 0 && (
                                    <p className="text-xs text-red-400 font-medium">Vui lòng chọn ít nhất một dạng đề.</p>
                                )}
                                {Object.entries(getQuestionTypes()).map(([section, types]) => (
                                    <div key={section} className="space-y-2">
                                        <p className="text-xs font-bold text-gray-500">{section}:</p>
                                        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                                            {types.map((type: string) => (
                                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={taskSelectedQuestionTypes.includes(type)}
                                                        onChange={() => toggleQuestionType(type)}
                                                        className="w-4 h-4 rounded border-gray-300 accent-[#1fb2aa] shrink-0"
                                                    />
                                                    <span className="text-sm text-gray-700">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cho học viên xem trước đề — below Chọn dạng đề, above Lưu ý */}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={taskChoXemTruocDe}
                                    onChange={e => setTaskChoXemTruocDe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 accent-[#1fb2aa]"
                                />
                                <span className="text-sm text-gray-700">Cho học viên xem trước đề</span>
                            </label>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-900">Lưu ý cho học viên</label>
                                <textarea
                                    value={taskLuuY}
                                    onChange={e => setTaskLuuY(e.target.value)}
                                    placeholder={`Bạn có thể thêm lưu ý cho học viên trước khi làm bài.\nVí dụ "Chỉ cần viết Overview cho đề bài"`}
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-[#1fb2aa] placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    )}

                    {/* Ngày mở */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-900">Ngày mở</label>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">Ngày</span>
                                <Input
                                    type="date"
                                    value={taskNgayMo}
                                    onChange={e => handleNgayMoChange(e.target.value)}
                                    className={`h-9 border rounded-lg px-3 text-sm focus-visible:ring-1 w-[150px] ${isNgayMoPast ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-200 focus-visible:ring-[#1fb2aa]'}`}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">Giờ</span>
                                <Input
                                    type="time"
                                    value={taskGioMo}
                                    onChange={e => handleGioMoChange(e.target.value)}
                                    className={`h-9 border rounded-lg px-3 text-sm focus-visible:ring-1 w-[110px] ${isNgayMoPast ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-200 focus-visible:ring-[#1fb2aa]'}`}
                                />
                            </div>
                        </div>
                        {isNgayMoPast && (
                            <p className="text-xs text-red-500 font-medium">Ngày mở không thể là thời điểm trong quá khứ.</p>
                        )}
                    </div>

                    {/* Hạn nộp */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-900">Hạn nộp</label>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">Ngày</span>
                                <Input
                                    type="date"
                                    value={taskHanNop}
                                    onChange={e => handleHanNopChange(e.target.value)}
                                    className={`h-9 border rounded-lg px-3 text-sm focus-visible:ring-1 w-[150px] ${taskDateError ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-200 focus-visible:ring-[#1fb2aa]'}`}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">Giờ</span>
                                <Input
                                    type="time"
                                    value={taskGioHanNop}
                                    onChange={e => setTaskGioHanNop(e.target.value)}
                                    className={`h-9 border rounded-lg px-3 text-sm focus-visible:ring-1 w-[110px] ${taskDateError ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-200 focus-visible:ring-[#1fb2aa]'}`}
                                />
                            </div>
                        </div>
                        {taskDateError && <p className="text-xs text-red-500 font-medium">Hạn nộp không thể trước ngày mở bài.</p>}
                    </div>

                    {/* Thời gian làm bài */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-900">Thời gian làm bài <span className="text-red-500">*</span></label>
                        <div className="relative w-fit">
                            <button
                                type="button"
                                onClick={() => { setTaskThoiGianDropdownOpen(v => !v); setTaskLoaiBaiDropdownOpen(false); setTaskHinhThucDropdownOpen(false); setTaskClassDropdownOpen(false); }}
                                className="h-10 px-4 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white hover:border-[#1fb2aa] focus:outline-none focus:ring-1 focus:ring-[#1fb2aa] flex items-center gap-3 min-w-[160px]"
                            >
                                {taskThoiGian} <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-auto" />
                            </button>
                            {taskThoiGianDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden min-w-[160px]">
                                    {thoiGianOptions.map(opt => (
                                        <div key={opt} onMouseDown={e => { e.preventDefault(); setTaskThoiGian(opt); setTaskThoiGianDropdownOpen(false); }}
                                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${taskThoiGian === opt ? 'bg-[#f0fdfa] text-[#1fb2aa] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={taskChoPhepNopMuon}
                                onChange={e => setTaskChoPhepNopMuon(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 accent-[#1fb2aa]"
                            />
                            <InfoTooltip text="Cho phép học viên nộp bài dù đã quá hạn nộp. Ví dụ Hạn nộp là 20:00 14/4/2026, học viên vẫn có thể nộp bài vào lúc 20:10 14/4/2026. Nếu không, hệ thống sẽ tự động nộp bài khi đến Hạn nộp." />
                            <span className="text-sm text-gray-700">Cho phép nộp muộn</span>
                        </label>

                        {showChoXemHuongDan && (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={taskChoXemHuongDan}
                                    onChange={e => setTaskChoXemHuongDan(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 accent-[#1fb2aa]"
                                />
                                <InfoTooltip text="Cho phép học viên xem ý tưởng và phân tích từ Writing Assistant. Chỉ áp dụng nếu loại bài là Task 1 hoặc Task 2." />
                                <span className="text-sm text-gray-700">Cho phép xem phân tích và gợi ý từ AI</span>
                            </label>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-gray-100 shrink-0 flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 h-11 rounded-xl font-bold border-gray-200 text-gray-600"
                        onClick={handleClose}
                    >
                        Huỷ
                    </Button>
                    <Button
                        className="flex-1 h-11 rounded-xl font-bold bg-[#1fb2aa] hover:bg-[#1fb2aa]/90 text-white disabled:opacity-50"
                        onClick={handleCreateTask}
                        disabled={!isFormValid}
                    >
                        Tạo
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
