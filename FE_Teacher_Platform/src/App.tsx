import { Switch, Route, useLocation } from 'wouter';
import { useEffect } from 'react';
import { useAuth } from './hooks/use-auth';
import { ToastProvider } from './components/ui/Toast';

// Pages
import LoginPage from './pages/login';
import TeacherHome from './pages/teacher-home';
import GradingCenter from './pages/grading-center';
import ClassProgress from './pages/class-progress';
import TeacherFeedbackPage from './pages/teacher-feedback';
import AssignmentManagement from './pages/assignment-management';
import AssignmentDetail from './pages/assignment-detail';
import TeacherStudentProgressPage from './pages/teacher-student-progress';

function RedirectToLogin() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/login', { replace: true });
  }, [setLocation]);
  return null;
}

function TeacherOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setLocation('/login', { replace: true });
      return;
    }
    const isTeacher = (user?.role || '').toLowerCase() === 'teacher';
    if (!isTeacher) {
      setLocation('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, setLocation, user]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;
  if ((user?.role || '').toLowerCase() !== 'teacher') return null;

  return <>{children}</>;
}

function Router() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const role = (user?.role || '').toLowerCase();
    if (role === 'teacher' && location === '/') {
      setLocation('/teacher', { replace: true });
    }
    if (location === '/' && !isAuthenticated) {
      setLocation('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, location, setLocation, user]);

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />

      <Route path="/teacher">
        <TeacherOnlyRoute>
          <TeacherHome />
        </TeacherOnlyRoute>
      </Route>

      <Route path="/teacher/grading-center">
        <TeacherOnlyRoute>
          <GradingCenter />
        </TeacherOnlyRoute>
      </Route>

      <Route path="/teacher/class-progress/:id">
        <TeacherOnlyRoute>
          <ClassProgress />
        </TeacherOnlyRoute>
      </Route>

      <Route path="/teacher/feedback/:taskHistoryId">
        <TeacherOnlyRoute>
          <TeacherFeedbackPage />
        </TeacherOnlyRoute>
      </Route>

      <Route path="/teacher/assignment-management">
        <TeacherOnlyRoute>
          <AssignmentManagement />
        </TeacherOnlyRoute>
      </Route>

      <Route path="/teacher/assignment-management/:assignmentId">
        <TeacherOnlyRoute>
          <AssignmentDetail />
        </TeacherOnlyRoute>
      </Route>

      <Route path="/student-pt/:studentId?">
        <TeacherOnlyRoute>
          <TeacherStudentProgressPage />
        </TeacherOnlyRoute>
      </Route>

      {/* Default redirect */}
      <Route component={RedirectToLogin} />
    </Switch>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Router />
    </ToastProvider>
  );
}
