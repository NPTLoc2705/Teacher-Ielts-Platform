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
        <div className="grid w-full grid-cols-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveVirtualTask('task1')}
            className={`py-3 rounded-md font-semibold transition-colors ${activeVirtualTask === 'task1' ? 'bg-[#1fb2aae6] text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}
          >
            Task 1
          </button>
          <button
            onClick={() => setActiveVirtualTask('task2')}
            className={`py-3 rounded-md font-semibold transition-colors ${activeVirtualTask === 'task2' ? 'bg-[#1fb2aae6] text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}
          >
            Task 2
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      <FeedbackNavBar onBack={handleBack} backLabel="Trá»Ÿ láº¡i" />
      {renderTaskSwitcher()}

      {/* Sticky student info bar */}
      <div className="sticky top-[72px] z-30 mb-8 -mx-4 px-4 py-2 bg-[#f8fafc]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-[#1fb2aa]/20 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium text-sm">TÃªn há»c viÃªn:</span>
              <span className="text-[#004d4d] font-bold text-sm">{data.studentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium text-sm">Lá»›p:</span>
              <span className="text-[#004d4d] font-bold text-sm">{data.className}</span>
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10">
          {isVirtualExamMode && virtualExamSummary ? (
            <div className="border border-slate-200 rounded-2xl p-6 md:p-8 mb-10 bg-slate-50/80">
              <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-800 leading-tight">
                Virtual Exam Review
              </h1>
              <div className="flex flex-col items-center gap-6">
                <div className="text-5xl md:text-6xl font-bold text-[#3bbdc0] leading-none">
                  {virtualExamSummary.overallScore}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <div className="text-sm font-semibold text-slate-600">Task 1</div>
                    <div className="text-2xl font-bold text-[#3bbdc0] mt-1">{virtualExamSummary.task1Score}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <div className="text-sm font-semibold text-slate-600">Task 2</div>
                    <div className="text-2xl font-bold text-[#3bbdc0] mt-1">{virtualExamSummary.task2Score}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <div className="text-sm font-semibold text-slate-600">Total Time</div>
                    <div className="text-2xl font-bold text-[#3bbdc0] mt-1">{virtualExamSummary.completionTimeMinutes}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-10 text-slate-800 leading-tight">
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
              Äiá»u chá»‰nh cá»¡ chá»¯:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => hook.handleFontSizeChange(-1)}
                disabled={hook.fontSizeLevel <= -2}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all border ${
                  hook.fontSizeLevel <= -2
                    ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-[#1fb2aa] hover:text-[#1fb2aa] shadow-sm active:scale-95'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => hook.handleFontSizeChange(1)}
                disabled={hook.fontSizeLevel >= 2}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all border ${
                  hook.fontSizeLevel >= 2
                    ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-[#1fb2aa] hover:text-[#1fb2aa] shadow-sm active:scale-95'
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
              className="px-16 py-4 rounded-xl bg-[#1fb2aa] text-white hover:bg-[#1a9b94] font-bold text-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all"
            >
              HoÃ n thÃ nh
            </button>
            {/* <button
              onClick={() => hook.openConfirmationModal('next')}
              className="px-8 py-4 rounded-xl border-2 border-[#1fb2aa] text-[#1fb2aa] hover:bg-teal-50 font-bold text-lg transition-all"
            >
              Gá»­i &amp; BÃ i káº¿ tiáº¿p
            </button> */}
          </div>
        </div>
      </main>

      {/* Sticky bottom control bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-full px-5 py-2.5 hover:shadow-2xl transition-shadow duration-300 group">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                hook.isEditMode
                  ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                  : 'bg-[#1fb2aa] shadow-[0_0_8px_rgba(31,178,170,0.5)]'
              }`}
            />
            <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
              Báº¡n Ä‘ang á»Ÿ cháº¿ Ä‘á»™{' '}
              <span className={hook.isEditMode ? 'text-amber-600 font-bold' : 'text-[#1fb2aa] font-bold'}>
                {hook.isEditMode ? 'chá»‰nh sá»­a' : 'xem'}
              </span>
            </span>
          </div>
          <div className="h-5 w-px bg-slate-200 group-hover:bg-slate-300 transition-colors" />
          <div className="flex items-center gap-2">
            {!hook.isEditMode ? (
              <button
                onClick={() => hook.setIsEditMode(true)}
                className="px-5 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-all active:scale-95 whitespace-nowrap shadow-sm"
              >
                Sá»­a
              </button>
            ) : (
              <button
                onClick={() => hook.setIsEditMode(false)}
                className="px-5 py-1.5 rounded-full bg-[#1fb2aa] text-white hover:bg-[#1a9b94] font-bold text-xs shadow-md transition-all active:scale-95 whitespace-nowrap"
              >
                LÆ°u
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
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-3 border border-slate-700/50 backdrop-blur-sm pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-[#1fb2aa] shadow-[0_0_8px_rgba(31,178,170,1)]" />
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

