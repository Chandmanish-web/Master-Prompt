import { ArrowRight, ClipboardList, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const features = [
  {
    title: 'Attendance Tracking',
    description: 'Smart check-in, check-out, and attendance insights for every team member.',
    icon: ShieldCheck,
  },
  {
    title: 'Task Management',
    description: 'Assign, review, and prioritize work with clear team workflows.',
    icon: ClipboardList,
  },
  {
    title: 'Leave Management',
    description: 'Submit, approve, and track leave requests in one place.',
    icon: Sparkles,
  },
  {
    title: 'Team Chat',
    description: 'Keep conversations organized with fast team messaging.',
    icon: MessageCircle,
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-semibold tracking-tight text-slate-900">WorkTrack</Link>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <Link to="/about" className="transition hover:text-brand-600">About</Link>
            <Link to="/login" className="font-semibold text-brand-600 transition hover:text-brand-700">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_0.85fr] lg:items-center">
          <section className="space-y-8">
            <div className="space-y-3 text-slate-600">
              <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">Built for modern teams</span>
              <h1 className="text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">WorkTrack — Attendance & Work Management for Modern Teams</h1>
              <p className="max-w-2xl text-lg leading-8">Manage attendance, tasks, leave, and team communication from a polished workspace designed for growth-focused organizations.</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/login">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/about" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <section className="mt-24 grid gap-10 lg:grid-cols-[0.9fr_0.9fr]">
          <Card className="bg-slate-950 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Why WorkTrack?</p>
            <h2 className="mt-4 text-3xl font-semibold">One platform for team productivity, attendance, and leave.</h2>
            <p className="mt-4 max-w-xl text-slate-300">Take the guesswork out of daily operations with a dashboard built for managers, employees, and admins.</p>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-slate-900">WorkTrack Technologies</h3>
            <p className="mt-3 text-slate-600">We help teams stay aligned with modern attendance tracking, clear task workflows, and fast team communication.</p>
            <div className="mt-8 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Mission</p>
                <p className="mt-2 text-sm text-slate-600">Deliver polished workforce tools that simplify how organizations manage people and projects.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Meet the team</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Avery Chen</p>
                    <p className="mt-1 text-sm text-slate-500">CEO</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Jordan Patel</p>
                    <p className="mt-1 text-sm text-slate-500">Product Lead</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Mia Torres</p>
                    <p className="mt-1 text-sm text-slate-500">Customer Success</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-sm text-slate-500">
          <span>© 2026 WorkTrack Technologies</span>
          <span>Built by [Your Name]</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
