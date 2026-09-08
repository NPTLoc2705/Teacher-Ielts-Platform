import React from 'react';
import { useParams, useLocation } from 'wouter';
import { X } from 'lucide-react';
import FeedbackNavBar from '../components/teacher/feedback/FeedbackNavBar';
import ScoreCard from '../components/teacher/feedback/ScoreCard';
import AssessmentCard from '../components/teacher/feedback/AssessmentCard';
import EssayViewer from '../components/teacher/feedback/EssayViewer';
import FeedbackSection from '../components/teacher/feedback/FeedbackSection';
import ConfirmationModal from '../components/teacher/feedback/ConfirmationModal';
import DeleteConfirmationModal from '../components/teacher/feedback/DeleteConfirmationModal';
import { useTeacherFeedback } from '../components/teacher/feedback/useTeacherFeedback';
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    const mo = (d.getMonth() + 1).toString().padStart(2, '0');
    const yy = d.getFullYear();
    return `${hh}:${mm} ${dd}/${mo}/${yy}`;
  } catch {
    return iso;
  }
}

const TeacherFeedbackPage: React.FC = () => {
  const params = useParams<{ taskHistoryId: string }>();
  const [, setLocation] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const classId = Number(searchParams.get('classId') ?? '0');
  const gradingMode = (searchParams.get('gradingMode') ?? 'ai') as 'ai' | 'self';
  const source = searchParams.get('source') ?? '';
  const isVirtualExamMode = searchParams.get('taskType') === 'virtual-exam';
  const [activeVirtualTask, setActiveVirtualTask] = React.useState<'task1' | 'task2'>('task1');
  const taskHistoryId = Number(params.taskHistoryId ?? '0');

  const hook = useTeacherFeedback({
    classId,
    taskHistoryId,
    gradingMode,
    taskTypeOverride: isVirtualExamMode ? activeVirtualTask : undefined,
  });

  const handleBack = () => {
    const dest =
      source === 'grading-center'
        ? `/teacher/grading-center${classId ? `?classId=${classId}` : ''}`
        : '/teacher';
    setLocation(dest);
  };

  if (hook.isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-slate-500 text-sm">Äang táº£i dá»¯ liá»‡u...</p>
      </div>
    );
  }

  if (hook.error || !hook.data) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-red-500 text-sm">{hook.error ?? 'KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u.'}</p>
      </div>
    );
  }

  const { data } = hook;
  const virtualExamSummary = hook.virtualExamSummary;

  const renderTaskSwitcher = () => {
    if (!isVirtualExamMode) return null;

    return (
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="grid w-full grid-cols-2 bg-white border border-[#e2e8f0] rounded-lg p-1 shadow-none">
          <button
            onClick={() => setActiveVirtualTask('task1')}
            className={`py-3 rounded-md font-semibold transition-colors ${activeVirtualTask === 'task1' ? 'bg-[#183a68] text-white shadow-none' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}
          >
            Task 1
          </button>
          <button
            onClick={() => setActiveVirtualTask('task2')}
            className={`py-3 rounded-md font-semibold transition-colors ${activeVirtualTask === 'task2' ? 'bg-[#183a68] text-white shadow-none' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}
          >
            Task 2
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f1f3fc] pb-32">
      <FeedbackNavBar onBack={handleBack} backLabel="Trá»Ÿ láº¡i" />
      {renderTaskSwitcher()}

      {/* Sticky student info bar */}
      <div className="sticky top-[72px] z-30 mb-8 -mx-4 px-4 py-2 bg-[#f1f3fc] border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-none border border-[#e2e8f0] p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium text-sm">Tên học viên:</span>
              <span className="text-[#183a68] font-bold text-sm">{data.studentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium text-sm">Lớp:</span>
              <span className="text-[#183a68] font-bold text-sm">{data.className}</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium text-sm">NgÃ y ná»™p:</span>
              <span className="text-slate-700 font-semibold text-sm">{formatDate(data.submittedAt)}</span>
            </div>
            {/* <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium text-sm">HÃ¬nh thá»©c:</span>
              <span className="text-slate-700 font-semibold text-sm">BÃ i táº­p</span>
            </div> */}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-none border border-[#e2e8f0] p-6 md:p-10">
          {isVirtualExamMode && virtualExamSummary ? (
            <div className="border border-[#e2e8f0] rounded-lg p-6 md:p-8 mb-10 bg-[#f8fafc]">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-center mb-8 text-[#0f172a] tracking-tight">
                Virtual Exam Review
              </h1>
              <div className="flex flex-col items-center gap-6">
                <div className="text-5xl md:text-6xl font-bold text-[#183a68] leading-none">
                  {virtualExamSummary.overallScore}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                  <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 text-center shadow-none">
                    <div className="text-sm font-semibold text-slate-600">Task 1</div>
                    <div className="text-2xl font-bold text-[#1fb2aa] mt-1">{virtualExamSummary.task1Score}</div>
                  </div>
                  <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 text-center shadow-none">
                    <div className="text-sm font-semibold text-slate-600">Task 2</div>
                    <div className="text-2xl font-bold text-[#1fb2aa] mt-1">{virtualExamSummary.task2Score}</div>
                  </div>
                  <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 text-center shadow-none">
                    <div className="text-sm font-semibold text-slate-600">Total Time</div>
                    <div className="text-2xl font-bold text-[#1fb2aa] mt-1">{virtualExamSummary.completionTimeMinutes}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <h1 className="font-display text-2xl md:text-3xl font-bold text-center mb-10 text-[#0f172a] tracking-tight">
              Your essay has been evaluated based on the IELTS {data.taskType === 'task1' ? 'Task 1' : 'Task 2'} criteria!
            </h1>
          )}

          {/* Score + Assessment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ScoreCard
              scores={hook.scores}
              overallBand={hook.overallBand}
              onScoreUpdate={hook.handleScoreUpdate}
              isEditable={hook.isEditMode}
            />
            <AssessmentCard
              assessment={hook.overallAssessment}
              wordCount={data.wordCount}
              completionTimeSeconds={data.completionTimeSeconds}
              onAssessmentChange={hook.handleAssessmentUpdate}
              isEditable={hook.isEditMode}
              fontSizeLevel={hook.fontSizeLevel}
            />
          </div>

          {/* Task prompt */}
          <div className="bg-teal-50 border border-[#1fb2aa]/30 rounded-xl p-6 mb-12">
            <h3 className="text-[#1fb2aa] font-bold text-sm mb-2 uppercase tracking-wide">
              IELTS Writing {data.taskType === 'task1' ? 'Task 1' : 'Task 2'}:
            </h3>
            <p className="text-sm text-slate-700 italic leading-relaxed">
              {data.question || data.essayText.substring(0, 200)}
              {!data.question && data.essayText.length > 200 ? '...' : ''}
            </p>
            {data.imageUrl ? (
              <div className="mt-4">
                <img
                  src={data.imageUrl}
                  alt="Task 1 prompt"
                  className="w-full max-w-3xl rounded-lg border border-slate-200 bg-white"
                  loading="lazy"
                />
              </div>
            ) : null}
          </div>

          {/* Font size controls */}
          <div className="mb-6 flex items-center justify-start gap-3 p-1">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Điều chỉnh cỡ chữ:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => hook.handleFontSizeChange(-1)}
                disabled={hook.fontSizeLevel <= -2}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all border ${
                  hook.fontSizeLevel <= -2
                    ? 'bg-slate-50 border-[#e2e8f0] text-slate-300 cursor-not-allowed'
                    : 'bg-white border-[#e2e8f0] text-slate-600 hover:border-[#183a68] hover:text-[#183a68] shadow-none'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => hook.handleFontSizeChange(1)}
                disabled={hook.fontSizeLevel >= 2}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all border ${
                  hook.fontSizeLevel >= 2
                    ? 'bg-slate-50 border-[#e2e8f0] text-slate-300 cursor-not-allowed'
                    : 'bg-white border-[#e2e8f0] text-slate-600 hover:border-[#183a68] hover:text-[#183a68] shadow-none'
                }`}
              >
                A+
              </button>
            </div>
          </div>

          {/* Essay + Detailed feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12 items-stretch">
            <div className="lg:col-span-3">
              <EssayViewer
                essayText={data.essayText}
                feedbackItems={hook.feedbackItems}
                selectedId={hook.selectedId}
                onSelectItem={hook.setSelectedId}
                onTextSelection={hook.handleAddNewFeedback}
                onEdit={hook.handleEditRequest}
                onDelete={hook.handleDeleteRequest}
                fontSizeLevel={hook.fontSizeLevel}
                activeFilters={hook.selectedFilters}
                isEditMode={hook.isEditMode}
                recentId={hook.recentId}
              />
            </div>
            <div className="lg:col-span-2">
              <FeedbackSection
                viewMode="detailed"
                taskType={data.taskType}
                items={hook.feedbackItems}
                editingId={hook.editingId}
                selectedId={hook.selectedId}
                recentId={hook.recentId}
                isEditMode={hook.isEditMode}
                isBulkEditing={hook.isBulkEditing}
                selectedFilters={hook.selectedFilters}
                fontSizeLevel={hook.fontSizeLevel}
                onSelectItem={hook.setSelectedId}
                onEditRequest={hook.handleEditRequest}
                onDeleteRequest={hook.handleDeleteRequest}
                onUpdateFeedback={hook.handleUpdateFeedback}
                onBulkUpdateFeedback={hook.handleBulkUpdateFeedback}
                onCancelNew={hook.handleCancelNew}
                onAddGeneralFeedback={hook.handleAddGeneralFeedback}
                setEditingId={hook.setEditingId}
                setIsBulkEditing={hook.setIsBulkEditing}
                setSelectedFilters={hook.setSelectedFilters}
              />
            </div>
          </div>

          {/* Per-criterion assessment breakdown */}
          <div className="mt-12 border-t border-slate-100 pt-12">
            <FeedbackSection
              viewMode="assessment"
              taskType={data.taskType}
              items={hook.feedbackItems}
              editingId={hook.editingId}
              selectedId={hook.selectedId}
              recentId={hook.recentId}
              isEditMode={hook.isEditMode}
              isBulkEditing={hook.isBulkEditing}
              selectedFilters={hook.selectedFilters}
              fontSizeLevel={hook.fontSizeLevel}
              onSelectItem={hook.setSelectedId}
              onEditRequest={hook.handleEditRequest}
              onDeleteRequest={hook.handleDeleteRequest}
              onUpdateFeedback={hook.handleUpdateFeedback}
              onBulkUpdateFeedback={hook.handleBulkUpdateFeedback}
              onCancelNew={hook.handleCancelNew}
              onAddGeneralFeedback={hook.handleAddGeneralFeedback}
              setEditingId={hook.setEditingId}
              setIsBulkEditing={hook.setIsBulkEditing}
              setSelectedFilters={hook.setSelectedFilters}
              scores={hook.scores}
              criteria={hook.criteria}
              onScoreUpdate={hook.handleScoreUpdate}
              onStrengthsUpdate={hook.handleStrengthsUpdate}
              onImprovementsUpdate={hook.handleImprovementsUpdate}
              onIssuesUpdate={hook.handleIssuesUpdate}
            />
          </div>

          {/* Submit buttons */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 border-t border-slate-100 pt-10">
            {/* <button
              onClick={() => hook.openConfirmationModal('prev')}
              className="px-8 py-4 rounded-xl border-2 border-[#1fb2aa] text-[#1fb2aa] hover:bg-teal-50 font-bold text-lg transition-all"
            >
              Gá»­i &amp; BÃ i trÆ°á»›c Ä‘Ã³
            </button> */}
            <button
              onClick={() =>
                void hook.handleSubmission({
                  aiFeedbackRating: 0,
                  teacherConfidenceRating: 0,
                })
              }
              className="px-16 py-3.5 rounded-lg bg-[#183a68] text-white hover:bg-[#122c50] font-bold text-lg shadow-none transition-all"
            >
              Hoàn thành
            </button>
          </div>
        </div>
      </main>

      {/* Sticky bottom control bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center bg-white border border-[#e2e8f0] shadow-none rounded-lg px-5 py-2.5 group">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                hook.isEditMode
                  ? 'bg-amber-500'
                  : 'bg-[#183a68]'
              }`}
            />
            <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
              Bạn đang ở chế độ{' '}
              <span className={hook.isEditMode ? 'text-amber-600 font-bold' : 'text-[#183a68] font-bold'}>
                {hook.isEditMode ? 'chỉnh sửa' : 'xem'}
              </span>
            </span>
          </div>
          <div className="h-5 w-px bg-slate-200 group-hover:bg-slate-300 transition-colors" />
          <div className="flex items-center gap-2">
            {!hook.isEditMode ? (
              <button
                onClick={() => hook.setIsEditMode(true)}
                className="px-4 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-all whitespace-nowrap shadow-none"
              >
                Sửa
              </button>
            ) : (
              <button
                onClick={() => hook.setIsEditMode(false)}
                className="px-4 py-1.5 rounded-md bg-[#183a68] text-white hover:bg-[#122c50] font-bold text-xs shadow-none transition-all whitespace-nowrap"
              >
                Lưu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={hook.isConfirmationModalOpen}
        gradingMode={gradingMode}
        onClose={hook.closeConfirmationModal}
        onSubmit={hook.handleSubmission}
        isSaving={hook.isSaving}
        submitMode={hook.confirmationMode}
      />
      <DeleteConfirmationModal
        isOpen={!!hook.deletingId}
        onConfirm={hook.confirmDelete}
        onCancel={hook.cancelDelete}
      />

      {/* Toast */}
      {hook.toast.visible && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white px-6 py-3 rounded-lg shadow-none flex items-center gap-3 border border-slate-700 pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-[#1fb2aa]" />
          <p className="text-sm font-medium">{hook.toast.message}</p>
          <button
            onClick={() =>
              // close by triggering a re-render; toast auto-hides anyway
              hook.setIsEditMode(hook.isEditMode)
            }
            className="ml-2 hover:text-slate-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherFeedbackPage;

