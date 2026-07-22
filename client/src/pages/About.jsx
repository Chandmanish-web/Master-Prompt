import { Users, Flag, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">About WorkTrack</span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">WorkTrack Technologies</h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">We build polished attendance and work management tools that help teams stay productive, aligned, and accountable.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login"><Button>Sign in</Button></Link>
              <Link to="/" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Back to home</Link>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Flag className="h-6 w-6" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Our mission</h2>
                  <p className="mt-1 text-sm text-slate-600">Design work tools that reduce friction and provide clarity across teams.</p>
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Users className="h-6 w-6" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Meet the team</h2>
                  <p className="mt-1 text-sm text-slate-600">Avery, Jordan, and Mia are ready to support your next team rollout.</p>
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Briefcase className="h-6 w-6" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Built for growth</h2>
                  <p className="mt-1 text-sm text-slate-600">Support operations without sacrificing the experience for managers and employees.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
