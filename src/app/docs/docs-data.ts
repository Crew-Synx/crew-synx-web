export type DocsSection = {
	id: string;
	title: string;
	summary: string;
	paragraphs?: string[];
	bullets?: string[];
	placeholder?: {
		type: "image" | "video";
		title: string;
		instructions: string;
		tall?: boolean;
	};
};

export type DocsModule = {
	slug: string;
	title: string;
	category: "Overview" | "Getting Started" | "Operations" | "Governance";
	description: string;
	sections: DocsSection[];
};

export const DOCS_MODULES: DocsModule[] = [
	{
		slug: "overview",
		title: "Welcome to CrewSynx",
		category: "Overview",
		description:
			"Start here to understand core concepts, the platform structure, and where each feature fits.",
		sections: [
			{
				id: "platform-overview",
				title: "Platform overview",
				summary: "CrewSynx is a unified workspace for workforce operations and delivery execution.",
				paragraphs: [
					"Use CrewSynx to manage teams, projects, attendance, communication, and operational reporting in one place.",
					"Each organization can configure its own policies, roles, workflows, and integrations while keeping secure data boundaries.",
				],
				placeholder: {
					type: "video",
					title: "Video Placeholder: CrewSynx platform walkthrough",
					instructions:
						"Record a 90-120 second landscape demo of dashboard navigation, quick actions, and workspace switching.",
					tall: true,
				},
			},
			{
				id: "core-concepts",
				title: "Core concepts",
				summary: "Understand the building blocks before setup.",
				bullets: [
					"Workspace: A dedicated environment for your organization configuration and data.",
					"Roles and access: Permission-based access control for admins, managers, and members.",
					"Modules: Project management, attendance, chat, analytics, and integrations.",
					"Audit trail: Key changes and approvals remain trackable for governance.",
				],
			},
			{
				id: "a-to-z-index",
				title: "A to Z product map",
				summary: "High-level index of what users can do across the platform.",
				bullets: [
					"A: Attendance, approvals, and availability planning.",
					"P: Projects, priorities, ownership, and progress tracking.",
					"R: Reports and analytics for leadership visibility.",
					"W: Workflow automations and operational handoffs.",
				],
			},
		],
	},
	{
		slug: "getting-started",
		title: "Getting Started",
		category: "Getting Started",
		description:
			"Set up your workspace, teams, and role model using a production-ready rollout sequence.",
		sections: [
			{
				id: "quick-start",
				title: "Quick start checklist",
				summary: "Follow this sequence for first-time deployment.",
				bullets: [
					"Create workspace and configure timezone and business calendar.",
					"Invite admins and managers before broad member invitations.",
					"Import employees and map them to teams and reporting lines.",
					"Configure project workflows, attendance rules, and notifications.",
					"Connect integrations and validate one end-to-end test flow.",
				],
			},
			{
				id: "workspace-setup",
				title: "Workspace setup",
				summary: "Define organizational defaults that shape daily operations.",
				paragraphs: [
					"Configure company profile, holidays, leave categories, and shift templates.",
					"Set policy defaults for attendance exceptions, approvals, and escalation windows.",
				],
				placeholder: {
					type: "image",
					title: "Image Placeholder: Workspace settings",
					instructions:
						"Capture the workspace settings page showing timezone, business week, and holiday rules.",
				},
			},
			{
				id: "users-and-roles",
				title: "Users and roles",
				summary: "Use role-driven access for secure and scalable team operations.",
				bullets: [
					"Owner: Full governance, billing, and security authority.",
					"Admin: Platform setup, module controls, and integration management.",
					"Manager: Team operations, approvals, and progress oversight.",
					"Member: Day-to-day execution, check-ins, tasks, and collaboration.",
				],
				placeholder: {
					type: "video",
					title: "Video Placeholder: Role assignment",
					instructions:
						"Record role creation, permission toggles, and assigning a user to the role with save confirmation.",
				},
			},
		],
	},
	{
		slug: "projects-and-tasks",
		title: "Projects and Tasks",
		category: "Operations",
		description:
			"Plan, execute, and monitor delivery with flexible boards, priorities, and sprint workflows.",
		sections: [
			{
				id: "planning",
				title: "Planning and backlog",
				summary: "Create a structured backlog and sequence priorities by sprint or milestone.",
				bullets: [
					"Define issue types, priorities, and service-level categories.",
					"Plan sprint scope using team capacity and dependency mapping.",
					"Move scoped work into execution boards with clear ownership.",
				],
			},
			{
				id: "execution",
				title: "Execution and tracking",
				summary: "Track progress through configurable states and delivery checkpoints.",
				bullets: [
					"Assign task owners, due dates, and definition-of-done requirements.",
					"Track blockers with explicit escalation and SLA visibility.",
					"Use list, board, and timeline views for different audiences.",
				],
				placeholder: {
					type: "image",
					title: "Image Placeholder: Kanban board",
					instructions:
						"Capture a board with at least four columns and cards showing assignee, due date, and priority.",
				},
			},
		],
	},
	{
		slug: "attendance",
		title: "Attendance",
		category: "Operations",
		description:
			"Manage attendance operations with policy controls, approvals, and exportable summaries.",
		sections: [
			{
				id: "checkin-workflow",
				title: "Check-in workflow",
				summary: "Handle check-ins, check-outs, late arrivals, and exception requests.",
				bullets: [
					"Configure shift templates and attendance windows.",
					"Enable manager approvals for manual adjustments.",
					"Track shortfall and overtime against policy rules.",
				],
			},
			{
				id: "attendance-reporting",
				title: "Attendance reporting",
				summary: "Generate payroll and compliance ready summaries.",
				bullets: [
					"Export monthly attendance data by team, department, or user.",
					"Review exception history and policy override events.",
					"Monitor attendance trends from analytics dashboards.",
				],
				placeholder: {
					type: "video",
					title: "Video Placeholder: Attendance lifecycle",
					instructions:
						"Record check-in, exception request, approval, and monthly export in one concise flow.",
				},
			},
		],
	},
	{
		slug: "communication",
		title: "Chat and Notifications",
		category: "Operations",
		description:
			"Keep distributed teams aligned with real-time communication and actionable alerts.",
		sections: [
			{
				id: "chat",
				title: "Team chat",
				summary: "Use channels and direct messaging for fast coordination.",
				bullets: [
					"Project-specific channels for focused communication.",
					"Mentions and threaded context for clarity.",
					"Unread indicators and message recency tracking.",
				],
			},
			{
				id: "notifications",
				title: "Notification controls",
				summary: "Deliver updates to the right people at the right time.",
				bullets: [
					"Role-aware alerts across project and attendance events.",
					"In-app and external channel routing support.",
					"Priority handling for urgent operational events.",
				],
			},
		],
	},
	{
		slug: "analytics",
		title: "Analytics and Reporting",
		category: "Operations",
		description:
			"Turn operational data into measurable insight for managers and leadership teams.",
		sections: [
			{
				id: "kpi-dashboards",
				title: "KPI dashboards",
				summary: "Monitor throughput, attendance, and utilization in one place.",
				bullets: [
					"Team velocity and issue completion trend lines.",
					"Attendance compliance and exception volume charts.",
					"Capacity and utilization views by team and department.",
				],
			},
			{
				id: "exports",
				title: "Exports and reviews",
				summary: "Share periodic reports with operational and executive stakeholders.",
				bullets: [
					"CSV exports for audit and external analysis.",
					"Monthly review packages for leadership updates.",
					"Role-based visibility for sensitive metrics.",
				],
				placeholder: {
					type: "image",
					title: "Image Placeholder: Analytics dashboard",
					instructions:
						"Capture one dashboard with attendance trend, throughput chart, and team utilization card visible.",
				},
			},
		],
	},
	{
		slug: "integrations",
		title: "Integrations",
		category: "Operations",
		description:
			"Connect CrewSynx with your external ecosystem to reduce context switching.",
		sections: [
			{
				id: "available-integrations",
				title: "Available integrations",
				summary: "Connect planning, messaging, and identity systems.",
				bullets: [
					"Google Calendar for event synchronization.",
					"Slack for communication and activity routing.",
					"Webhooks for custom platform automation.",
					"Single Sign-On for centralized identity control.",
				],
			},
			{
				id: "integration-setup",
				title: "Integration setup",
				summary: "Activate integrations from settings and validate with test events.",
				paragraphs: [
					"Use scoped credentials and restrict access to integration administrators.",
					"Run one test event per integration and confirm downstream behavior before rollout.",
				],
			},
		],
	},
	{
		slug: "security-and-admin",
		title: "Security and Admin",
		category: "Governance",
		description:
			"Manage security posture, access controls, and operational governance from one place.",
		sections: [
			{
				id: "security-controls",
				title: "Security controls",
				summary: "Apply enterprise-grade identity and data handling safeguards.",
				bullets: [
					"Role-based authorization with least-privilege defaults.",
					"Session and authentication hardening support.",
					"Audit trails for policy changes and high-impact actions.",
				],
			},
			{
				id: "admin-controls",
				title: "Admin controls",
				summary: "Centralize policies, defaults, and support operations.",
				bullets: [
					"Configure platform settings and approval thresholds.",
					"Manage notification templates and escalation rules.",
					"Review troubleshooting guidance before support escalation.",
				],
				placeholder: {
					type: "image",
					title: "Image Placeholder: Admin control center",
					instructions:
						"Capture settings panels with policy defaults, notifications, and audit log entry list.",
				},
			},
			{
				id: "support",
				title: "Support",
				summary: "Contact the support team when your workspace needs help.",
				bullets: [
					"Support email: support@crewsynx.com",
					"In-app help center from the top navigation.",
					"Priority ticketing available to workspace admins.",
				],
			},
		],
	},
];

export const DOCS_MODULE_MAP = new Map(DOCS_MODULES.map((module) => [module.slug, module]));

export const DOCS_GROUPS = [
	{
		title: "Overview",
		slugs: ["overview"],
	},
	{
		title: "Getting Started",
		slugs: ["getting-started"],
	},
	{
		title: "Operations",
		slugs: [
			"projects-and-tasks",
			"attendance",
			"communication",
			"analytics",
			"integrations",
		],
	},
	{
		title: "Governance",
		slugs: ["security-and-admin"],
	},
] as const;
