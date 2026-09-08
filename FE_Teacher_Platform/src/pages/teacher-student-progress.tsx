import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { ChevronLeft, User, BookOpen, Award, BarChart2, Calendar, Clock, CheckCircle } from 'lucide-react';
import TeacherShell from '../components/teacher/TeacherShell';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ClassService, type EnrolledStudent } from '../services/classService';

export default function TeacherStudentProgressPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ studentId?: string }>();
  const studentId = params.studentId ? parseInt(params.studentId, 10) : null;

  // Read search params
  const urlParams = new URLSearchParams(window.location.search);
  const classIdStr = urlParams.get('classId');
  const classId = classIdStr ? parseInt(classIdStr, 10) : null;

  const [student, setStudent] = useState<EnrolledStudent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!classId || !studentId) {
        setLoading(false);
        return;
      }
      try {
        const students = await ClassService.getEnrolledStudents(classId);
        const found = students.find((s) => s.studentId === studentId);
        if (found) setStudent(found);
      } catch (err) {
        console.error('Failed to load student details', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [classId, studentId]);

  return (
    <TeacherShell contentClassName="p-8 w-full">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              if (classId) {
                setLocation(`/teacher/class-progress/${classId}`);
              } else {
                setLocation('/teacher');
              }
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại lớp học
          </Button>
          <span className="text-sm font-semibold text-gray-500">
            Mã học viên: #{studentId || 'N/A'}
          </span>
        </div>

        {/* Student Profile Banner */}
        <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-[#eaf2fd] text-[#183a68] flex items-center justify-center font-bold text-2xl">
              {student?.displayName ? student.displayName.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-[#0f172a] tracking-tight">
                {student?.displayName || (loading ? 'Đang tải...' : 'Học viên')}
              </h1>
              <p className="text-sm text-gray-500">{student?.email || 'Chưa cập nhật email'}</p>
              {student?.enrolledAt && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Ngày tham gia: {new Date(student.enrolledAt).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-5 py-3 text-center min-w-[120px]">
              <span className="text-xs text-gray-500 font-medium block">Điểm trung bình</span>
              <span className="text-2xl font-black text-[#183a68]">
                {student?.averageScore !== undefined && student?.averageScore !== null
                  ? student.averageScore.toFixed(1)
                  : '--'}
              </span>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-5 py-3 text-center min-w-[120px]">
              <span className="text-xs text-gray-500 font-medium block">Số bài đã nộp</span>
              <span className="text-2xl font-black text-[#0f172a]">
                {student?.totalEssays ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Analytics & Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#1fb2aa]" /> Quá trình làm bài
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Học viên đã nộp <strong>{student?.totalEssays ?? 0}</strong> bài viết trong lớp học này.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                <Award className="h-4 w-4 text-[#1fb2aa]" /> Đánh giá năng lực
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Band điểm hiện tại đạt mức <strong>{student?.averageScore ? student.averageScore.toFixed(1) : 'Chưa có'}</strong>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                Đang học tập tích cực
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </TeacherShell>
  );
}
