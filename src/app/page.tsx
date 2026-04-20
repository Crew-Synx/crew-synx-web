import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import {
  LayoutDashboard,
  MessageSquare,
  CalendarCheck,
  BarChart3,
  Shield,
  Zap,
  Key,
  Server,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Download,
  Monitor,
  Smartphone,
  Apple,
  Mail,
} from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Project Management',
    description:
      'Kanban boards, sprint planning, task assignments, and project timelines — everything your team needs to ship, in one place.',
  },
  {
    icon: MessageSquare,
    title: 'Team Chat & Channels',
    description:
      'Real-time messaging with threaded conversations, file sharing, and dedicated channels per project or department.',
  },
  {
    icon: CalendarCheck,
    title: 'Attendance Tracking',
    description:
      'Automated check-in/out, geo-fencing, shift scheduling, leave requests, and approval workflows.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description:
      'Custom dashboards, productivity insights, attendance summaries, and exportable reports built for decision-makers.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access Control',
    description:
      'Granular permission sets, custom roles, and organization-level isolation so every person sees only what they should.',
  },
  {
    icon: Zap,
    title: 'Integrations',
    description:
      'Connect the tools your team already uses. Need something specific? Request it — we build integrations on demand.',
  },
];

const differentiators = [
  {
    icon: Key,
    title: 'Lifetime License',
    description:
      'Buy a version once and own it forever. No monthly subscriptions, no annual renewals, no per-seat fees. Pay once, use indefinitely.',
  },
  {
    icon: Server,
    title: 'Deploy Anywhere',
    description:
      'Run CrewSynx on your own server, private cloud, or any VPS you choose. Your data never leaves your infrastructure.',
  },
  {
    icon: Wrench,
    title: 'Built Around Your Needs',
    description:
      "Need a feature that doesn't exist yet? Tell us. We build custom functionality and ship it as part of your licensed version.",
  },
];

export const metadata: Metadata = {
  title: 'CrewSynx — Workforce Management, Your Way',
  description:
    'CrewSynx is a self-hosted workforce platform. Buy a lifetime license, deploy on your own infrastructure, and use it forever — no recurring payments.',
  openGraph: {
    title: 'CrewSynx — Workforce Management, Your Way',
    description: 'Buy once. Deploy anywhere. Use forever. CrewSynx is not a subscription.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 sm:pt-36 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Early Access — Not Yet Publicly Released
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Workforce management{' '}
              <span className="text-primary">that&apos;s actually yours</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              CrewSynx combines project management, team chat, attendance tracking, and analytics
              into one self-hosted platform. Buy a license, deploy wherever you want, and use it
              forever — no recurring payments.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/pricing">
                  Get in Touch
                  <Mail className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Pricing is tailored to your team — contact us for a quote.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why We're Different ──────────────────────────────────── */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Why CrewSynx</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Not another SaaS subscription
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We believe software you depend on should belong to you — not rent you access month
              after month.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/50 bg-background p-8 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything your team needs, in one place
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Replace the stack of scattered tools with a single platform your team will actually
              want to use.
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

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple. Permanent. Yours.
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                icon: Mail,
                title: 'Contact us for pricing',
                desc: 'Tell us about your team size, deployment needs, and any custom features you require. We tailor a quote for you.',
              },
              {
                step: '2',
                icon: Key,
                title: 'Receive your license',
                desc: 'Once agreed, you receive a perpetual license for that version. No lock-in, no expiry, no usage limits.',
              },
              {
                step: '3',
                icon: CheckCircle2,
                title: 'Deploy and use forever',
                desc: 'Run CrewSynx on any server or cloud you choose. Invite your team and start collaborating — forever.',
              },
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

      {/* ── Downloads ────────────────────────────────────────────── */}
      <section id="downloads" className="scroll-mt-16 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Downloads</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Available on your platform
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Native client apps for the best experience. More platforms coming.
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

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to own your workforce platform?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
              Get in touch with us. Tell us what you need — team size, custom features, deployment
              preferences — and we&apos;ll put together a quote.
            </p>
            <div className="mt-8 flex justify-center">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base" asChild>
                <Link href="/pricing">
                  Contact Us for Pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
