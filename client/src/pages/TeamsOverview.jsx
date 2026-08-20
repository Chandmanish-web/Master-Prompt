import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, ClipboardList } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { getTeams } from '../redux/teamSlice';
import { getTeamTasks } from '../redux/taskSlice';

const TeamsOverview = () => {
  const dispatch = useDispatch();
  const { items: teams, loading: teamsLoading, error: teamsError } = useSelector((state) => state.teams);
  const { teamTasks, loading: tasksLoading, error: tasksError } = useSelector((state) => state.tasks);
  const loading = teamsLoading || tasksLoading;
  const error = teamsError || tasksError;

  useEffect(() => {
    dispatch(getTeams());
    dispatch(getTeamTasks());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-3xl bg-cyan-950 p-8 text-white shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Team workspace</p>
          <h1 className="mt-2 text-3xl font-semibold">Teams and assigned work</h1>
          <p className="mt-3 text-cyan-100">Live teams and tasks loaded from the WorkTrack database.</p>
        </div>
        {error && <p className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
        {loading && <LoadingSpinner label="Loading teams and tasks..." />}
        {!loading && !teams.length && <EmptyState icon={<Users />} title="No teams found" description="Run the development seed to create teams and assigned work." />}
        {!loading && teams.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => {
              const tasks = teamTasks.filter((task) => task.teamId?._id === team._id || task.teamId === team._id);
              return (
                <article key={team._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div><h2 className="text-lg font-semibold text-slate-900">{team.name}</h2><p className="mt-1 text-sm text-slate-500">{team.description}</p></div>
                    <Users className="h-5 w-5 text-cyan-600" />
                  </div>
                  <p className="mt-4 text-xs text-slate-500">Manager: {team.manager?.name || 'Unassigned'} · {team.members?.length || 0} members</p>
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><ClipboardList className="h-4 w-4" /> Assigned tasks</p>
                    {tasks.length ? tasks.map((task) => <div key={task._id} className="rounded-lg bg-slate-50 p-3 text-sm"><p className="font-medium text-slate-800">{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.assignedTo?.name || 'Employee'} · {task.status}</p></div>) : <p className="text-sm text-slate-400">No tasks assigned.</p>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default TeamsOverview;
