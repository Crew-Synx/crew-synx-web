import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  MessageSquare,
  BarChart3,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Download,
  Monitor,
  Smartphone,
  Apple,
} from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Project Management',
    description: 'Kanban boards, task tracking, and project timelines to keep your team on track.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Real-time chat, file sharing, and team channels for seamless communication.',
  },
  {
    icon: CalendarCheck,
    title: 'Attendance Tracking',
    description: 'Automated attendance with geo-fencing, shift management, and leave tracking.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Actionable insights with custom dashboards and exportable reports.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Granular permissions and roles to keep your data secure across teams.',
  },
  {
    icon: Zap,
    title: 'Integrations',
    description: 'Connect with tools you already use — Slack, Google Workspace, and more.',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Engineering Manager',
    company: 'TechFlow Inc.',
    avatar: 'SC',
    content: 'CrewSynx replaced three separate tools for us. The kanban boards and attendance tracking in one place is a game-changer.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Operations Director',
    company: 'BuildRight Co.',
    avatar: 'MJ',
    content: 'We reduced our team coordination overhead by 40%. The real-time features make remote work feel effortless.',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'HR Lead',
    company: 'GreenLeaf Solutions',
    avatar: 'PP',
    content: 'The attendance and leave management alone saved us hours every week. The analytics are the cherry on top.',
    rating: 5,
  },
];

const stats = [
  { value: '10,000+', label: 'Teams' },
  { value: '99.9%', label: 'Uptime' },
  { value: '50+', label: 'Countries' },
  { value: '4.9/5', label: 'Rating' },
];

export const metadata: Metadata = {
	title: 'CrewSynx — Modern Workforce Management',
	description: 'Manage your entire workforce — attendance, payroll, departments, and more — from one powerful platform.',
	openGraph: {
		title: 'CrewSynx — Modern Workforce Management',
		description: 'Manage your entire workforce from one powerful platform.',
		type: 'website',
	},
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Now with real-time collaboration
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your team&apos;s workspace,{' '}
              <span className="text-primary">all in one place</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              CrewSynx brings project management, team communication, attendance tracking, and analytics together so your team can focus on what matters.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/auth/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="#features">See How It Works</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Replace your scattered tools with one powerful platform designed for modern teams.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in minutes
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { step: '1', icon: Clock, title: 'Sign up in seconds', desc: 'Create your account and set up your organization with a few clicks.' },
              { step: '2', icon: Users, title: 'Invite your team', desc: 'Send invite links or codes. Your team joins instantly with role-based access.' },
              { step: '3', icon: CheckCircle2, title: 'Start collaborating', desc: 'Create projects, assign tasks, track attendance, and chat — all in one place.' },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by teams worldwide
            </h2>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.role}, {t.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section id="downloads" className="scroll-mt-16 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Downloads</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Get CrewSynx on your device
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Native apps for the best experience. More platforms coming soon.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl">
            <Card className="border-border/50 transition-shadow hover:shadow-md">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Apple className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">macOS</h3>
                <p className="mt-1 text-sm text-muted-foreground">macOS 12 Monterey or later</p>
                <Button className="mt-4 w-full" asChild>
                  <a href="https://pub-e1a3af3b0acd49b389d9ea16ce02de48.r2.dev/Downloads/macos/CrewSynx.dmg">
                    <Download className="mr-2 h-4 w-4" />
                    Download .dmg
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-border/50 border-dashed opacity-60">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                  <Monitor className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Windows</h3>
                <p className="mt-1 text-sm text-muted-foreground">Windows 10 or later</p>
                <Button className="mt-4 w-full" variant="outline" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
            <Card className="border-border/50 transition-shadow hover:shadow-md">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Smartphone className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Android</h3>
                <p className="mt-1 text-sm text-muted-foreground">Android 6.0 or later</p>
                <Button className="mt-4 w-full" asChild>
                  <a href="https://pub-e1a3af3b0acd49b389d9ea16ce02de48.r2.dev/Downloads/android/CrewSynx.apk">
                    <Download className="mr-2 h-4 w-4" />
                    Download .apk
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to bring your team together?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
              Join thousands of teams already using CrewSynx to streamline their workflow.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base" asChild>
                <Link href="/auth/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 border-primary-foreground/30 px-8 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
