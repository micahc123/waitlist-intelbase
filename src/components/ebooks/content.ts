export type Block =
  | { kind: "p"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "code"; text: string };

export type Chapter = {
  title: string;
  lede?: string;
  blocks: Block[];
};

export type EbookDoc = {
  intro: string;
  chapters: Chapter[];
};

const socialAdsPlaybook: EbookDoc = {
  intro:
    "A pragmatic, end-to-end playbook for turning one operator into an entire social media department. We'll wire OpenClaw and Higgsfield into a content factory, then use the claude-ads skill to plan, audit, and scale paid campaigns — all on a desk that fits on a kitchen table.",
  chapters: [
    {
      title: "Why this stack, and why now",
      lede: "If you're still running social by hand in 2026, you're burning the most expensive fuel on the planet: your attention.",
      blocks: [
        {
          kind: "p",
          text:
            "The stack in this book is the one we keep coming back to after shipping for over a hundred clients. It's small enough to understand in a week, powerful enough to replace a three-person content team, and cheap enough to run on a single Mac Mini or a $20/month VPS.",
        },
        {
          kind: "p",
          text:
            "The core tools — OpenClaw for agentic reasoning and execution, Higgsfield for short-form video generation, and the claude-ads skill for paid media — are each best-in-class in 2026. But the real leverage is in how they compose. When the same system writes your hooks, renders your videos, schedules your posts, and audits your ad account every morning, the unit economics of a one-person brand start to look strange. In a good way.",
        },
        { kind: "h3", text: "Who this is for" },
        {
          kind: "ul",
          items: [
            "Founders who need to ship 30 days of content by next week",
            "Agencies tired of paying video editors $4k/month to reskin TikToks",
            "Operators running a brand inside a bigger business, with a tiny budget",
            "Consultants who want to productise social and sell the same setup to every client",
          ],
        },
        { kind: "h3", text: "What you'll walk away with" },
        {
          kind: "ul",
          items: [
            "A working OpenClaw deployment that can research, write, and post for you",
            "A Higgsfield prompt library with the exact scaffolds we use for ads, hooks, and B-roll",
            "A claude-ads routine that audits, plans, and tests your campaigns weekly",
            "An n8n blueprint that ties all three into a nightly publishing loop",
          ],
        },
      ],
    },
    {
      title: "Setting up OpenClaw as the brain",
      lede: "OpenClaw is the switchboard. Every thought, every post, every decision passes through it.",
      blocks: [
        {
          kind: "p",
          text:
            "OpenClaw is not a chatbot. It's an agentic runtime with tools, memory, and the ability to spawn sub-agents for parallel work. For a social team, that means you can describe the week you want — \"four long-form videos, twenty shorts, five paid ads across two accounts\" — and watch the thing decompose that into work orders by itself.",
        },
        { kind: "h3", text: "The install" },
        {
          kind: "ol",
          items: [
            "Provision your host (Mac Mini, Hetzner CX22, or your favourite cloud)",
            "Run the one-line installer from openclaw.dev/install",
            "Give it API keys for: Anthropic, OpenAI (optional), your CMS, and your ad networks",
            "Enable the higgsfield and claude-ads skills (we'll configure both below)",
            "Confirm you can chat with it via the web UI or CLI",
          ],
        },
        { kind: "h3", text: "Memory and context" },
        {
          kind: "p",
          text:
            "Give OpenClaw a dedicated project folder and let it write to a `memory/` directory. This is where brand voice, past posts, do-not-say lists, and performance notes live. Future runs read from this folder first — so the agent improves the longer you use it.",
        },
        {
          kind: "code",
          text:
            "# openclaw.config.yaml\nworkspace: /srv/brands/acme\nmemory:\n  path: /srv/brands/acme/memory\n  writable: true\nskills:\n  - higgsfield\n  - claude-ads\n  - n8n-bridge\n",
        },
        { kind: "h3", text: "The first brief" },
        {
          kind: "p",
          text:
            "Start every new brand with a single onboarding conversation. Feed OpenClaw your brand guide, three reference accounts you admire, and your last 90 days of analytics. Ask it to write a one-page voice doc, then edit the doc by hand. That doc becomes the north star for every prompt that follows.",
        },
      ],
    },
    {
      title: "Higgsfield: from prompt to publishable video",
      lede: "Higgsfield turned 'ad-quality video' into a text prompt. Here's how to prompt it like a director.",
      blocks: [
        {
          kind: "p",
          text:
            "Most failed Higgsfield outputs come from prompts that read like an English teacher wrote them — adjectives stacked on adjectives, no camera language, no shot list. Directors don't write that way. They describe a frame, the motion inside it, and how the light falls.",
        },
        { kind: "h3", text: "The four-part prompt scaffold" },
        {
          kind: "ol",
          items: [
            "Subject and action — one concrete sentence, present tense",
            "Camera language — lens, angle, movement (e.g. 35mm, low angle, slow push in)",
            "Lighting and mood — practical sources, time of day, colour temperature",
            "Style anchor — a single film, photographer, or director reference per shot",
          ],
        },
        { kind: "h3", text: "A prompt that actually ships" },
        {
          kind: "code",
          text:
            "A runner tying their shoes on a wet Tokyo sidewalk at 5:42am.\n35mm, low angle, slow push-in that settles on the laces as they tighten.\nStreetlamp practicals kick amber onto puddles; a cyan hum from a vending machine.\nStyle anchor: early Wong Kar-wai, shot by Christopher Doyle.\n",
        },
        {
          kind: "p",
          text:
            "That single prompt produces a shot that would have cost four figures and a two-day shoot three years ago. Save every winning prompt into a `higgsfield/library/` folder with the final render attached. OpenClaw will read that library when it writes future ads.",
        },
        { kind: "h3", text: "Hooks, not trailers" },
        {
          kind: "p",
          text:
            "For short-form, the first 1.3 seconds are 80% of the fight. Generate three competing hooks for every ad — a visual hook, a verbal hook, and a motion hook — then let your test budget decide. We've seen 9x differences in CPM from swapping the first frame alone.",
        },
      ],
    },
    {
      title: "The content factory loop",
      lede: "You don't need more ideas. You need a pipeline that converts them into 30 posts a week without you noticing.",
      blocks: [
        { kind: "h3", text: "The five-stage pipeline" },
        {
          kind: "ol",
          items: [
            "Research — OpenClaw scrapes top-performing posts in your niche every morning",
            "Ideate — it clusters the research into 10–15 hooks aligned to your voice doc",
            "Script — each hook becomes a 90-word script with a visual brief",
            "Render — Higgsfield turns the visual brief into clips; captions burn in automatically",
            "Publish — n8n schedules across TikTok, IG, YouTube Shorts, and LinkedIn",
          ],
        },
        { kind: "h3", text: "The nightly run" },
        {
          kind: "p",
          text:
            "We run the pipeline at 03:00 local time. By the time you open your laptop, you have 10–15 drafts sitting in a Notion queue, each with a thumbnail, caption, and hashtag set. Your only job is to thumbs-up or kill. Average human time: eleven minutes a day.",
        },
        {
          kind: "code",
          text:
            "# n8n nightly.yaml (abbreviated)\ntrigger: cron 0 3 * * *\nsteps:\n  - call: openclaw.research\n    with: { niche: brand.niche, window: 24h }\n  - call: openclaw.ideate\n    with: { count: 12, voice: brand.voice_doc }\n  - forEach: idea\n    do:\n      - call: openclaw.script\n      - call: higgsfield.render\n      - call: notion.draft\n",
        },
      ],
    },
    {
      title: "claude-ads: running paid like a senior media buyer",
      lede: "The claude-ads skill brings 250+ audit checks, a grading rubric, and industry-specific playbooks into one command surface.",
      blocks: [
        {
          kind: "p",
          text:
            "Great creative is necessary but not sufficient. Most failing ad accounts are not failing because the creative is weak — they're failing because the structure, tracking, or bidding logic has a leak. The claude-ads skill is a systematic way to find those leaks and fix them.",
        },
        { kind: "h3", text: "Installing claude-ads" },
        {
          kind: "p",
          text:
            "The skill is distributed as a Claude Code plugin. Install it once on the same machine that runs your OpenClaw instance so the two can share context about your accounts.",
        },
        {
          kind: "code",
          text:
            "# one-liner install\ncurl -fsSL https://raw.githubusercontent.com/AgriciDaniel/claude-ads/main/install.sh | bash\n\n# or inside Claude Code\n/plugin install claude-ads@agricidaniel-claude-ads\n",
        },
        { kind: "h3", text: "The command surface you'll actually use" },
        {
          kind: "ul",
          items: [
            "/ads audit — spawns six parallel sub-agents for a full account health score",
            "/ads [platform] — deep dive on Google, Meta, LinkedIn, TikTok, Microsoft, or Apple",
            "/ads creative — cross-platform creative quality assessment",
            "/ads plan [type] — industry templates (SaaS, ecom, B2B, local service, mobile)",
            "/ads math — CPA, ROAS, break-even, and LTV:CAC modelling",
            "/ads test — A/B design with sample-size and significance calculators",
            "/ads report — turns the last audit into a client-ready PDF",
          ],
        },
        { kind: "h3", text: "The weekly rhythm" },
        {
          kind: "p",
          text:
            "Mondays: /ads audit on every account you manage. Fix anything that grades D or F before lunch. Wednesdays: /ads creative to check for fatigue and diversification — rotate in new Higgsfield renders for anything with fatigue score above 7. Fridays: /ads test to design next week's experiments. This rhythm alone has moved CPA down 18–40% on almost every account we've applied it to.",
        },
        {
          kind: "quote",
          text:
            "We ran the first /ads audit on a client and it flagged a broad-match group with no smart bidding burning $11k/month. That one recommendation paid for the engagement.",
        },
      ],
    },
    {
      title: "The grading rubric, demystified",
      lede: "claude-ads gives every account a score between 0 and 100. Here's how to read it, and what to fix first.",
      blocks: [
        { kind: "h3", text: "The A–F scale" },
        {
          kind: "ul",
          items: [
            "A (90–100) — minor optimisations; you're in the top decile",
            "B (75–89) — a handful of worthwhile improvements; nothing on fire",
            "C (60–74) — notable issues; investigate tracking and structure",
            "D (40–59) — significant problems; expect real wasted spend",
            "F (below 40) — urgent; pause spend until the hard rules pass",
          ],
        },
        { kind: "h3", text: "The non-negotiables" },
        {
          kind: "p",
          text:
            "Five hard rules short-circuit everything else. Until these pass, any optimisation work is guesswork. The skill enforces them as gates — it won't recommend scaling budgets until they're green.",
        },
        {
          kind: "ol",
          items: [
            "No broad match without smart bidding attached",
            "No ad set running at CPA > 3x target; pause immediately",
            "Meta ad sets must have ≥ 5x CPA in daily budget to exit the learning phase",
            "Pixel/CAPI on Meta, GA4/GTAG on Google — both verified server-side",
            "Special Ad Category compliance for housing, credit, employment",
          ],
        },
        { kind: "h3", text: "How to triage an F grade" },
        {
          kind: "p",
          text:
            "Start with the tracking layer. Nine times out of ten a failing account is feeding the algorithm garbage conversions. Use /ads audit's \"tracking\" section as a checklist, fix duplicates and CAPI gaps, wait 72 hours for conversion volume to stabilise, then re-audit before touching anything else.",
        },
      ],
    },
    {
      title: "Industry plans that convert",
      lede: "The /ads plan command ships with templates for SaaS, ecom, B2B, local service, mobile, and regulated verticals.",
      blocks: [
        { kind: "h3", text: "SaaS — trial and demo focused" },
        {
          kind: "p",
          text:
            "Platform mix: Google Search + LinkedIn Sponsored Content. Creative: founder-led, POV camera, 15–30s. KPIs: trial-start CPA under 0.4× ACV, SQL CPA under ACV. Use /ads plan saas to scaffold the whole structure in minutes.",
        },
        { kind: "h3", text: "Ecommerce — feed-driven" },
        {
          kind: "p",
          text:
            "Platform mix: Meta Advantage+ Shopping + Google Performance Max + TikTok Shop where available. Feed hygiene is the hidden lever — the skill's feed-audit sub-agent will catch 80% of the issues that starve your Shopping campaigns of reach.",
        },
        { kind: "h3", text: "B2B enterprise — ABM" },
        {
          kind: "p",
          text:
            "LinkedIn Account-Based, Google branded search, and carefully scoped Meta retargeting. Pipeline metrics trump last-click. Pair with /ads math to model the LTV:CAC needed to make the channel viable.",
        },
        { kind: "h3", text: "Local service — conversion pressure" },
        {
          kind: "p",
          text:
            "Google Local Services Ads, branded search, Maps, and call-only extensions. Track calls with dynamic numbers and kill any click-to-call ad set that doesn't hit under $25 CPA in a 14-day window.",
        },
      ],
    },
    {
      title: "Closing the loop: creative ↔ audit ↔ refresh",
      lede: "The compounding gain is the loop. Higgsfield generates. claude-ads measures. OpenClaw decides what to render next.",
      blocks: [
        {
          kind: "p",
          text:
            "Most teams stop at 'we made ads and ran them'. The Intelbase loop closes the feedback line: every /ads audit output is parsed and fed back to OpenClaw, which adjusts the brief for the next Higgsfield render. After three weeks the agent has learned what your account actually rewards.",
        },
        { kind: "h3", text: "The wiring" },
        {
          kind: "ol",
          items: [
            "Audit runs Monday morning; output saved to ops/audits/YYYY-MM-DD.md",
            "OpenClaw reads the latest audit before every creative brief",
            "Any tag marked 'fatigue' or 'diversity-low' triggers a Higgsfield render job that afternoon",
            "New creatives auto-upload to the ad platform behind a small test budget",
            "Results re-enter the pipeline at the next audit",
          ],
        },
        {
          kind: "code",
          text:
            "# openclaw_creative_brief.prompt\nRead ops/audits/latest.md.\nPull any ad set tagged fatigue>7 or diversity-low.\nFor each, propose THREE replacement hooks:\n  - One visual hook (new first frame)\n  - One verbal hook (new opening line)\n  - One motion hook (new camera move)\nConstraint: preserve brand voice from memory/voice.md.\nOutput a Higgsfield-ready brief per hook.\n",
        },
        { kind: "h3", text: "Compounding over 90 days" },
        {
          kind: "p",
          text:
            "You don't feel the loop in week one. In week four you start noticing CPAs drifting down. By week twelve you're producing more creative per week than most agencies produce in a quarter, and your account audits are mostly green. That's when you stop calling it 'content' and start calling it a system.",
        },
      ],
    },
    {
      title: "Selling this as a service",
      lede: "Same stack, new logo, $3–5k/month retainer. Here's the productised offer we've taught dozens of consultants.",
      blocks: [
        { kind: "h3", text: "The pitch" },
        {
          kind: "p",
          text:
            "\"I'll build you a social media department that runs itself, and a paid media layer audited weekly by a system that used to cost you a senior media buyer. You'll ship 20–30 pieces of content a week and your CPA will drop. Fixed fee. No retainers after month one unless you want one.\"",
        },
        { kind: "h3", text: "Packaging" },
        {
          kind: "ul",
          items: [
            "Setup fee ($2.5k) — install OpenClaw, wire Higgsfield, deploy claude-ads",
            "Month 1 retainer ($3k) — weekly audits, creative briefs, and hand-off",
            "Optional ops retainer ($1.5k/month) — we keep running the loop for them",
          ],
        },
        { kind: "h3", text: "Proof" },
        {
          kind: "p",
          text:
            "On the sales call, run /ads audit live against a public ad library example in their niche. In eight minutes you'll produce a scored report nobody in their procurement chain has ever seen. That single demo closes most calls.",
        },
      ],
    },
    {
      title: "Appendix: the prompt library",
      blocks: [
        {
          kind: "p",
          text:
            "Keep every winning prompt. Tag by brand, platform, and result. This appendix is your starter pack — fork it, break it, make it your own.",
        },
        { kind: "h3", text: "Hook generation" },
        {
          kind: "code",
          text:
            "You are a short-form scriptwriter in the style described in memory/voice.md.\nGenerate 12 hooks for a product that {{description}}.\nConstraints:\n  - First line must be < 7 words\n  - No emojis, no hashtags, no 'Did you know'\n  - Two visual, two verbal, two pattern-break, two contrarian, four founder-story\nReturn as JSON: { hooks: [{ type, text, first_frame_direction }] }\n",
        },
        { kind: "h3", text: "Higgsfield prompt writer" },
        {
          kind: "code",
          text:
            "Convert the following script into a shot list ready for Higgsfield.\nFor each shot:\n  1. One-sentence subject and action, present tense\n  2. Camera language (lens, angle, movement)\n  3. Lighting and colour palette\n  4. One style anchor (film, photographer, director)\nOutput exactly 1 shot per 2.5 seconds of runtime.\n",
        },
        { kind: "h3", text: "Weekly audit briefing" },
        {
          kind: "code",
          text:
            "Read ops/audits/latest.md.\nProduce:\n  - A 5-bullet TL;DR for a non-technical founder\n  - The top 3 fixes ranked by estimated $ impact\n  - A budget re-allocation proposal if any campaign is graded D or F\nTone: direct, numbers-first, no jargon without translation.\n",
        },
      ],
    },
  ],
};

const aiAutomationPlaybook: EbookDoc = {
  intro:
    "A practitioner's guide to automating a real business with Claude Code. We'll cover the fundamentals — agents, sub-agents, skills, hooks, MCP — then build the automations our clients actually pay for: lead capture, CRM sync, cold email, support, reporting, and OpenClaw-as-the-brain. Every prompt in this book is something you can paste into a project today.",
  chapters: [
    {
      title: "What Claude Code actually is",
      lede: "Not a chat window. A programmable, tool-using, file-editing colleague that lives in your terminal.",
      blocks: [
        {
          kind: "p",
          text:
            "Claude Code is what happens when you stop treating an LLM as a text box and start treating it as a runtime. You give it a project directory, a set of tools, and a goal. It reads your code, edits files, runs your tests, talks to your APIs, and hands you back a diff. The right mental model is an intern with a photographic memory, an obsessive eye for detail, and access to every tool on your laptop.",
        },
        {
          kind: "p",
          text:
            "For automation work this changes the economics. The thing you used to hire a contractor to build is now something you describe in a markdown file and ship by Friday. The rest of this book is about doing that well.",
        },
        { kind: "h3", text: "Five primitives you need to know" },
        {
          kind: "ul",
          items: [
            "Agents — a Claude instance scoped to a goal, with tools and a working directory",
            "Sub-agents — child agents spawned for parallel work (research, code review, testing)",
            "Skills — reusable playbooks that show up as slash commands",
            "Hooks — shell commands that run automatically on events (on-stop, pre-tool, post-commit)",
            "MCP — the protocol that lets Claude talk to external systems (databases, APIs, inboxes)",
          ],
        },
        {
          kind: "quote",
          text:
            "If you remember nothing else, remember this: skills are your product, hooks are your ops, and MCP is your integration layer.",
        },
      ],
    },
    {
      title: "Setting up a workspace that doesn't fight you",
      lede: "Most Claude Code frustration comes from a bad first day. These defaults save you from 90% of it.",
      blocks: [
        { kind: "h3", text: "Project skeleton" },
        {
          kind: "code",
          text:
            "project/\n  CLAUDE.md          # the system prompt the agent reads on every run\n  AGENTS.md          # conventions & house rules (imported by CLAUDE.md)\n  .claude/\n    settings.json    # permissions, hooks, model choice\n    skills/          # project-specific skills\n    agents/          # sub-agent definitions\n  src/               # your actual code\n  .env.local         # secrets — never commit\n",
        },
        { kind: "h3", text: "CLAUDE.md: the house rules file" },
        {
          kind: "p",
            text:
            "Your CLAUDE.md is the single most important file in the project. It's what the agent reads before every task. Keep it short, direct, and loaded with the constraints you keep having to re-explain. Two lines of house rules save you thirty turns of back-and-forth.",
        },
        {
          kind: "code",
          text:
            "# CLAUDE.md\n\n@AGENTS.md\n\n## Stack\n- Next.js 16, React 19, Tailwind v4\n- Supabase for DB + auth, Stripe for payments\n- Vercel for hosting\n\n## House rules\n- Use `rg` (Grep tool), never `grep`\n- Run `pnpm typecheck` before declaring done\n- Default to server components; only mark client when needed\n- All DB writes go through /src/lib/db/ — never raw SQL in routes\n",
        },
        { kind: "h3", text: "settings.json: the permission layer" },
        {
          kind: "p",
          text:
            "Lock down destructive commands. Allow the safe ones. The goal is to say yes once to things the agent will do a hundred times, and no once to things a hallucination could turn into `rm -rf`.",
        },
        {
          kind: "code",
          text:
            "{\n  \"permissions\": {\n    \"allow\": [\n      \"Bash(pnpm *)\",\n      \"Bash(git status)\",\n      \"Bash(git diff*)\",\n      \"Bash(git log*)\"\n    ],\n    \"deny\": [\n      \"Bash(rm -rf *)\",\n      \"Bash(git push --force*)\",\n      \"Bash(git reset --hard*)\"\n    ]\n  }\n}\n",
        },
      ],
    },
    {
      title: "The 6-phase delivery loop",
      lede: "The loop that took our average delivery time from three days to 47 minutes.",
      blocks: [
        {
          kind: "p",
          text:
            "Every automation we ship follows the same loop. It's boring on purpose — boring loops produce reliable software. Skip a phase and you'll pay for it in review.",
        },
        {
          kind: "ol",
          items: [
            "Research — spawn a research sub-agent, dump findings into RESEARCH.md",
            "Plan — turn research into a PLAN.md with tasks, files touched, acceptance criteria",
            "Review plan — a second agent audits the plan goal-backwards before execution",
            "Execute — primary agent implements task-by-task with atomic commits",
            "Verify — a verifier sub-agent re-reads the diff, runs tests, checks the plan",
            "Ship — commit, push, tag. Write a one-paragraph changelog for the client.",
          ],
        },
        { kind: "h3", text: "Why sub-agents for research and verify?" },
        {
          kind: "p",
            text:
            "Context hygiene. The agent doing the work should not be the agent judging the work. Sub-agents run in isolated contexts, read the plan cold, and catch the drift the primary agent can't see from the inside. This one pattern is worth more than any prompt engineering trick in this book.",
        },
        { kind: "h3", text: "The loop, as a skill" },
        {
          kind: "code",
          text:
            "# .claude/skills/delivery-loop/SKILL.md\n\nWhen asked to build a feature, follow this loop:\n\n1. Research: launch a sub-agent with subagent_type=Explore,\n   prompt = the feature request, ask for RESEARCH.md.\n2. Plan: read RESEARCH.md, write PLAN.md with:\n   - tasks (atomic, file-level)\n   - dependencies between tasks\n   - acceptance criteria\n3. Review the plan: launch a second sub-agent with\n   subagent_type=Plan, have it critique PLAN.md goal-backwards.\n4. Execute: implement task-by-task, commit after each task.\n5. Verify: launch a verifier sub-agent; block on its report.\n6. Ship: git push, write a changelog.\n",
        },
      ],
    },
    {
      title: "Sub-agent orchestration",
      lede: "The real unlock of Claude Code is not one agent — it's many agents, scoped, running in parallel.",
      blocks: [
        { kind: "h3", text: "Three sub-agents every project needs" },
        {
          kind: "ul",
          items: [
            "Explorer — fast, read-only; answers 'where does X live' and 'how does Y work'",
            "Planner — turns a request into a task-by-task plan without touching code",
            "Verifier — reads diffs and tests them against the plan, reports green/red",
          ],
        },
        { kind: "h3", text: "Defining an explorer sub-agent" },
        {
          kind: "code",
          text:
            "---\nname: explorer\ndescription: Fast codebase exploration. Returns file paths and symbol references, not long prose.\ntools: Read, Grep, Glob\nmodel: haiku\n---\n\nYou are a read-only codebase explorer. Answer the question\nin <= 8 bullets, each a file path + a one-line summary.\nDo not propose changes. Do not write code.\n",
        },
        { kind: "h3", text: "Running many in parallel" },
        {
          kind: "p",
          text:
            "When work decomposes into independent slices — three features, four migrations, five integrations — launch them in one message so they run concurrently. A batch of six Explorer sub-agents finishes in about the time one would take. Latency becomes a user-experience lever.",
        },
        {
          kind: "code",
          text:
            "# Parallel audit example (pseudocode of what you tell the main agent)\n\nLaunch 4 sub-agents in the SAME message:\n  1. explorer: where does auth happen?\n  2. explorer: how are webhooks validated?\n  3. explorer: where are rate limits enforced?\n  4. explorer: what tests cover the billing flow?\n\nSynthesize the 4 reports into a single AUDIT.md.\n",
        },
      ],
    },
    {
      title: "Skills: the reusable playbooks",
      lede: "If you type it twice, turn it into a skill. If you type it five times, turn it into a skill with hooks.",
      blocks: [
        {
          kind: "p",
          text:
            "A skill is a markdown file with a name, a description, and a body. Claude Code surfaces it as a slash command and invokes it by name. The description is what the agent reads when deciding whether to use the skill — write it like a help string, not a changelog.",
        },
        { kind: "h3", text: "Anatomy of a skill" },
        {
          kind: "code",
          text:
            "---\nname: ship-feature\ndescription: Use when the user asks to build, add, or ship a new feature. Follows the 6-phase delivery loop.\n---\n\nFollow these steps exactly:\n\n1. Run /research on the feature request\n2. Produce PLAN.md\n3. Have the Plan agent review it\n4. Execute task-by-task, committing each\n5. Run /verify to confirm\n6. Open a pull request with the changelog\n",
        },
        { kind: "h3", text: "Ten skills every business should have" },
        {
          kind: "ul",
          items: [
            "/ship-feature — the delivery loop as one command",
            "/hotfix — branch, fix, test, PR, done — for urgent prod issues",
            "/review — structured PR review against your house rules",
            "/refactor-safe — rename with grep-and-verify, not find-and-replace",
            "/add-env — add an env var and update .env.example in one step",
            "/migrate — Supabase migration with up/down and a sanity query",
            "/seed — deterministic test data for local dev",
            "/ship-copy — write microcopy in your brand voice, not GPT's",
            "/incident — capture, triage, postmortem in one flow",
            "/weekly — auto-generate a team digest from commits and tickets",
          ],
        },
        {
          kind: "quote",
          text:
            "Think of skills as your company's institutional memory. Every skill is one more thing new engineers — and your agent — don't have to learn by osmosis.",
        },
      ],
    },
    {
      title: "Hooks: automating the agent itself",
      lede: "Hooks are shell commands the harness runs on events — before a tool call, after a file write, on session stop.",
      blocks: [
        { kind: "h3", text: "Events you can hook" },
        {
          kind: "ul",
          items: [
            "PreToolUse — intercept before a tool call; can block it",
            "PostToolUse — react after a tool call succeeds",
            "UserPromptSubmit — runs on every message the user sends",
            "Stop — runs when the agent finishes a turn",
            "PreCompact — runs right before the context gets compacted",
          ],
        },
        { kind: "h3", text: "Example: auto-format on every write" },
        {
          kind: "code",
          text:
            "{\n  \"hooks\": {\n    \"PostToolUse\": [\n      {\n        \"matcher\": \"Edit|Write\",\n        \"command\": \"pnpm prettier --write $CLAUDE_FILE\"\n      }\n    ]\n  }\n}\n",
        },
        { kind: "h3", text: "Example: block destructive git commands" },
        {
          kind: "code",
          text:
            "{\n  \"hooks\": {\n    \"PreToolUse\": [\n      {\n        \"matcher\": \"Bash\",\n        \"command\": \"node .claude/hooks/deny-destructive.js\"\n      }\n    ]\n  }\n}\n",
        },
        { kind: "h3", text: "Example: Slack-notify on stop" },
        {
          kind: "code",
          text:
            "{\n  \"hooks\": {\n    \"Stop\": [\n      {\n        \"command\": \"curl -X POST $SLACK_WEBHOOK -d '{\\\"text\\\":\\\"Claude finished a turn on \\'$PWD\\'\\\"}'\"\n      }\n    ]\n  }\n}\n",
        },
      ],
    },
    {
      title: "MCP: the integration layer",
      lede: "Model Context Protocol is how your agent talks to the rest of your stack without you writing a single adapter.",
      blocks: [
        {
          kind: "p",
          text:
            "MCP servers expose tools, resources, and prompts to Claude Code over a standard protocol. Install one and the agent gains a new capability — talking to Supabase, reading your Gmail, querying your ad accounts, whatever. Ten minutes of config is often all it takes.",
        },
        { kind: "h3", text: "MCP servers worth wiring up on day one" },
        {
          kind: "ul",
          items: [
            "supabase-mcp — schema, queries, migrations, RLS policies",
            "stripe-mcp — invoices, subscriptions, refunds, checkout",
            "gmail-mcp — read, label, draft, send",
            "linear-mcp — tickets, projects, cycles",
            "postgres-mcp — any Postgres DB, not just Supabase",
            "fs-mcp — scoped filesystem access outside the project dir",
            "notion-mcp — pages, databases, comments",
          ],
        },
        { kind: "h3", text: "Configuring MCP" },
        {
          kind: "code",
          text:
            "# .claude/settings.json\n{\n  \"mcpServers\": {\n    \"supabase\": {\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@supabase/mcp-server\"],\n      \"env\": { \"SUPABASE_ACCESS_TOKEN\": \"${SUPABASE_TOKEN}\" }\n    },\n    \"stripe\": {\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@stripe/mcp-server\"],\n      \"env\": { \"STRIPE_SECRET_KEY\": \"${STRIPE_SECRET_KEY}\" }\n    }\n  }\n}\n",
        },
      ],
    },
    {
      title: "Lead automation",
      lede: "A lead that hits your site at 2am should be qualified, routed, and followed up before you wake up.",
      blocks: [
        { kind: "h3", text: "The minimum viable lead machine" },
        {
          kind: "ol",
          items: [
            "Form submits to a Next.js route that writes to Supabase",
            "A Supabase trigger posts the row to n8n",
            "n8n enriches via Clearbit / Apollo, scores in Claude, labels high/med/low",
            "High-score leads get a personalised reply inside 90 seconds",
            "Medium go into a 5-touch nurture sequence",
            "Low get a friendly holding reply and a nudge back in 30 days",
          ],
        },
        { kind: "h3", text: "The qualify + reply prompt" },
        {
          kind: "code",
          text:
            "You are the sales triage function for {{company}}.\n\nInputs:\n  - lead: a JSON row from our inbound form\n  - enrichment: a JSON object from Clearbit (may be empty)\n  - ICP: the paragraph below describing our ideal customer\n\nTasks:\n  1. Score fit 0-100 using ONLY the provided ICP\n  2. Score intent 0-100 using the lead's message\n  3. Pick a bucket: HIGH (fit>=70 and intent>=60), MEDIUM, or LOW\n  4. Draft a reply in the voice of {{founder_name}} that:\n     - greets by first name\n     - references one specific thing from their message\n     - proposes the next step appropriate to the bucket\n     - is under 90 words\n\nReturn JSON: { fit, intent, bucket, reply }.\n",
        },
        { kind: "h3", text: "Where businesses leak leads" },
        {
          kind: "ul",
          items: [
            "No immediate auto-reply (people judge you by response speed)",
            "One-size-fits-all template (nuke it; personalise or don't send)",
            "No routing rules (every lead to the same inbox = none get read)",
            "No reactivation of old closed-lost (gold in the archive)",
            "No feedback loop from CRM outcome back into the scorer",
          ],
        },
      ],
    },
    {
      title: "CRM automation",
      lede: "The best CRM is the one your reps don't have to update. Claude Code can be that layer.",
      blocks: [
        { kind: "h3", text: "Auto-logging calls, emails, and meetings" },
        {
          kind: "p",
          text:
            "Connect Gmail, Google Calendar, and your meeting transcripts via MCP. A scheduled agent reads the last 24 hours, extracts entities (company, deal value, next step), and writes updates to HubSpot or Salesforce. Sales reps stop writing notes. Managers start getting real data.",
        },
        { kind: "h3", text: "The nightly CRM-sync prompt" },
        {
          kind: "code",
          text:
            "For every calendar event in the last 24h where attendees include an external domain:\n\n  1. Find the matching deal in HubSpot (by company domain)\n  2. If no deal, skip and log a 'no-deal-found' event\n  3. Fetch the meeting transcript (via the Meeting MCP)\n  4. Summarise in 5 bullets: what was discussed, objections, next step, decision-maker, blockers\n  5. Update the deal note. Move the stage if the transcript clearly indicates it.\n  6. Write a Slack DM to the deal owner if a next step is owed in <= 48h\n\nNever hallucinate a stage move. If unsure, flag for human review.\n",
        },
        { kind: "h3", text: "Deal hygiene, automated" },
        {
          kind: "ul",
          items: [
            "Flag deals stuck in a stage > 2x median time",
            "Auto-close deals with no activity in 60 days after a warning email",
            "Detect duplicate companies (fuzzy match domain + name)",
            "Generate a weekly pipeline review doc from the data, pre-filled",
          ],
        },
      ],
    },
    {
      title: "Email & cold outreach automation",
      lede: "The only thing worse than not doing cold outreach is doing it badly. Claude Code lets you do it well at scale.",
      blocks: [
        { kind: "h3", text: "The three layers of a good cold system" },
        {
          kind: "ol",
          items: [
            "Targeting — a prompt that reads a LinkedIn URL and decides if they're in ICP",
            "Personalisation — a prompt that writes the first line from the prospect's last 90 days",
            "Deliverability — warm-up, domain hygiene, pacing, unsubscribe compliance",
          ],
        },
        { kind: "h3", text: "The first-line writer" },
        {
          kind: "code",
          text:
            "You are a cold email ghostwriter. Given a prospect's recent activity\n(job title, last post, last podcast appearance, company news) write\nONE opening sentence that:\n  - sounds like something a human who follows them would say\n  - references a specific concrete detail, not a generic compliment\n  - is under 18 words\n  - does not start with 'I' and does not use the word 'impressive'\n\nReturn only the sentence, no quotes, no preamble.\n",
        },
        { kind: "h3", text: "The send loop" },
        {
          kind: "ol",
          items: [
            "Pull today's batch from Supabase (state = 'queued')",
            "For each: call the first-line writer, render the template, send",
            "Mark as 'sent', store message-id for thread tracking",
            "A separate loop reads replies via Gmail MCP and classifies intent",
            "Positive replies trigger a calendar invite; negatives remove from sequence",
          ],
        },
        {
          kind: "quote",
          text:
            "Volume is a tax on doing it badly. A well-personalised 50/day outperforms a templated 500/day every week of the year.",
        },
      ],
    },
    {
      title: "OpenClaw for businesses, driven by Claude Code",
      lede: "Claude Code is your DevOps. OpenClaw is your product. The two talk to each other constantly.",
      blocks: [
        {
          kind: "p",
          text:
            "Claude Code and OpenClaw overlap intentionally. Claude Code is where you author, test, and deploy automations. OpenClaw is the always-on runtime those automations execute inside, with persistent memory, scheduled triggers, and tool access. Think of Claude Code as the factory, and OpenClaw as the delivery fleet.",
        },
        { kind: "h3", text: "Provisioning the host" },
        {
          kind: "ol",
          items: [
            "Pick a host: Mac Mini (~$600 one-time) or Hetzner CX22 (~$6/mo)",
            "Install Docker, Node 22, and git",
            "Clone the intelbase openclaw-starter repo",
            "Run the bootstrap: `./bin/bootstrap` — installs OpenClaw, wires a systemd service",
            "Open port 443 only through a Cloudflare tunnel; never expose the raw port",
          ],
        },
        { kind: "h3", text: "Connecting Claude Code to OpenClaw" },
        {
          kind: "p",
          text:
            "We ship OpenClaw with an MCP server. Install it in your Claude Code workspace and your local agent can read OpenClaw's memory, push new skills to the runtime, and inspect the job queue — all from the same terminal where you edit code.",
        },
        {
          kind: "code",
          text:
            "# .claude/settings.json\n\"mcpServers\": {\n  \"openclaw\": {\n    \"command\": \"npx\",\n    \"args\": [\"-y\", \"@openclaw/mcp\"],\n    \"env\": {\n      \"OPENCLAW_URL\": \"https://ops.yourdomain.com\",\n      \"OPENCLAW_TOKEN\": \"${OPENCLAW_TOKEN}\"\n    }\n  }\n}\n",
        },
        { kind: "h3", text: "The daily rhythm" },
        {
          kind: "ul",
          items: [
            "Morning: OpenClaw runs its nightly jobs (lead triage, CRM sync, audit reports)",
            "Midday: you open Claude Code, review logs, ship new skills via /push-skill",
            "Evening: OpenClaw sends you a digest of what ran, what failed, what needs human review",
          ],
        },
      ],
    },
    {
      title: "All the automations, in one table",
      lede: "A non-exhaustive menu of what businesses actually pay us to automate.",
      blocks: [
        { kind: "h3", text: "Revenue" },
        {
          kind: "ul",
          items: [
            "Inbound lead triage and auto-reply",
            "Cold outreach sequences (personalised)",
            "Meeting scheduler that routes by product / geo / rep",
            "Proposal and quote generation from a deal context",
            "Contract drafting from a playbook",
            "Invoice reminders that actually get read",
          ],
        },
        { kind: "h3", text: "Operations" },
        {
          kind: "ul",
          items: [
            "Ticket triage with auto-tagging, priority, assignment",
            "Internal knowledge base with RAG across Notion / Drive / Slack",
            "Onboarding flows that provision accounts, send creds, schedule first-week calls",
            "Inventory reorder triggers",
            "Expense report extraction from emailed receipts",
          ],
        },
        { kind: "h3", text: "Marketing" },
        {
          kind: "ul",
          items: [
            "Content factory (hooks, scripts, rendering, scheduling)",
            "SEO-briefs generated from search-console drops",
            "Ad account nightly audits with the claude-ads skill",
            "Newsletter drafts from this week's commits, tickets, and calls",
            "Review collection and response (with human approval)",
          ],
        },
        { kind: "h3", text: "Finance" },
        {
          kind: "ul",
          items: [
            "Cash-flow digest every Monday",
            "Runway alerts when burn exceeds threshold",
            "Category anomaly detection across expenses",
            "Weekly MRR / NDR dashboards pulled from Stripe",
            "Dunning flow for failed payments",
          ],
        },
      ],
    },
    {
      title: "Case studies",
      lede: "Three small files in a repo, three businesses that got five figures of margin back.",
      blocks: [
        { kind: "h3", text: "Case 1 — an agency saved $9k/month" },
        {
          kind: "p",
          text:
            "A 7-person agency was paying a VA $9k/month to write weekly client recap emails. We built a /weekly-recap skill that reads the last 7 days of Slack, Linear, and commits, produces a draft for each client, and posts it to a review channel. Final human edit time: 12 minutes per client per week. VA role eliminated in month two.",
        },
        { kind: "h3", text: "Case 2 — a SaaS cut churn 23%" },
        {
          kind: "p",
          text:
            "Their onboarding was six emails over fourteen days, identical for every account. We swapped it for an OpenClaw job that reads the first-week usage data and writes one personalised email per account on day 3, 7, and 12. Activation-to-paid conversion moved from 19% to 28% in a quarter.",
        },
        { kind: "h3", text: "Case 3 — a local home-services business cloned itself" },
        {
          kind: "p",
          text:
            "Owner had 110 unread leads sitting in a form inbox. We built a 40-line skill that replies inside 2 minutes, books estimate slots on his calendar, and texts him the confirmed appointments. Booked revenue in month one: +$38k. The whole build took an afternoon.",
        },
      ],
    },
    {
      title: "Appendix — the prompt & skill library",
      blocks: [
        {
          kind: "p",
          text:
            "Every prompt in this appendix is something we've shipped in production. Copy, paste, change the variables, and you have 80% of a working system.",
        },
        { kind: "h3", text: "Prompt — universal research sub-agent" },
        {
          kind: "code",
          text:
            "You are the Research phase of our delivery loop.\n\nGoal: {{user_request}}\n\nReturn a single file, RESEARCH.md, with:\n  - Problem (one paragraph, no fluff)\n  - Constraints (list)\n  - Existing code that matters (paths + 1-line summaries)\n  - 3 candidate approaches with pros/cons\n  - A recommendation and why\n\nDo NOT write any production code. Do NOT edit files outside\ndocs/ or a scratch dir. Finish under 25 tool calls.\n",
        },
        { kind: "h3", text: "Prompt — verifier sub-agent" },
        {
          kind: "code",
          text:
            "You are the Verify phase. You did not see the plan or the code\nbeing written. Read them cold.\n\nInputs: PLAN.md, the latest git diff, the test output.\n\nProduce VERIFY.md with:\n  - Goal restated in one sentence\n  - For each task in PLAN.md: done / partial / missing\n  - Any regressions (things working before now broken)\n  - Three questions the author should have asked\n\nReturn a final verdict: GREEN, YELLOW, or RED.\nIf RED, block the ship.\n",
        },
        { kind: "h3", text: "Prompt — weekly client digest" },
        {
          kind: "code",
          text:
            "You are writing a client-facing weekly digest.\n\nInputs (already fetched for you):\n  - commits this week, grouped by repo\n  - linear tickets closed\n  - notable support tickets\n  - revenue metrics delta\n\nTone: confident, specific, no jargon.\n\nStructure: 5 bullets of wins, 2 bullets of 'what's next',\nand one section 'things we need from you' if relevant.\n\nHard limit: 180 words. No em-dashes.\n",
        },
        { kind: "h3", text: "Skill — /hotfix" },
        {
          kind: "code",
          text:
            "---\nname: hotfix\ndescription: Use for urgent production bugs. Branch, fix, test, PR, in one flow.\n---\n\n1. Create branch hotfix/<short-slug> off main\n2. Identify the minimum diff that fixes the reported issue\n3. Add or modify one test that would have caught it\n4. Run the full test suite; block on failure\n5. git commit -m \"hotfix: <subject>\"\n6. git push, open a PR titled [HOTFIX] <subject>, mark as urgent\n7. Post the PR link to #eng-urgent in Slack\n",
        },
        { kind: "h3", text: "Skill — /weekly" },
        {
          kind: "code",
          text:
            "---\nname: weekly\ndescription: Generate the weekly digest for clients and internal team.\n---\n\n1. Pull commits, tickets, support touches for the last 7 days\n2. Run the 'weekly client digest' prompt per client\n3. Write drafts to docs/digests/<client>/<yyyy-mm-dd>.md\n4. Post to the #client-{client} Slack channel as draft\n5. Wait for thumbs-up reaction before sending to client email\n",
        },
        { kind: "h3", text: "Skill — /refactor-safe" },
        {
          kind: "code",
          text:
            "---\nname: refactor-safe\ndescription: Rename or move symbols with grep-and-verify, never blind find-and-replace.\n---\n\n1. For the target symbol, run Grep across the repo\n2. Produce a preview list: every file + line that will change\n3. Ask for confirmation\n4. Apply edits file-by-file\n5. Run typecheck and tests; block on failure\n6. Commit in small, coherent chunks (max 10 files per commit)\n",
        },
      ],
    },
  ],
};

const websiteBuildersPlaybook: EbookDoc = {
  intro:
    "A focused playbook for shipping premium websites in a day — with 21st.dev and Claude Code doing most of the typing, the ui-ux-pro-max skill keeping the design honest, and Vercel + Supabase making deployment a single command. As a bonus, the final chapter hands you our cold-outreach system: a Vercel + Supabase worker that sends personalised emails to local businesses with a free, working prototype attached.",
  chapters: [
    {
      title: "Why this stack wins in 2026",
      lede: "21st.dev gives you the components. Claude Code gives you the labour. ui-ux-pro-max keeps you from making a generic AI-looking site.",
      blocks: [
        {
          kind: "p",
          text:
            "Every web stack has a ceiling. Bootstrap had one. jQuery had one. Even shadcn/ui has one without a taste layer on top. The combination in this book is designed to raise your ceiling on three axes at once: speed of build, quality of output, and cost of iteration.",
        },
        {
          kind: "ul",
          items: [
            "21st.dev — a curated library of production-grade, copyable components. Paste, adapt, ship.",
            "Claude Code — your typist, refactorer, test writer, and deployer, all in one terminal",
            "ui-ux-pro-max — a design-taste skill that reviews your work against premium standards",
            "Vercel — zero-config deploys, global edge, previews per branch",
            "Supabase — auth, DB, storage, edge functions, and row-level security in ten minutes",
          ],
        },
        {
          kind: "quote",
          text:
            "One person with this stack can out-ship a five-person agency from 2022. The bottleneck is no longer code — it's taste.",
        },
      ],
    },
    {
      title: "Day zero: the starter",
      lede: "Spend 45 minutes on the starter and you'll save 45 days of plumbing across the next ten client builds.",
      blocks: [
        { kind: "h3", text: "The stack contract" },
        {
          kind: "ul",
          items: [
            "Next.js 16 with the App Router, Tailwind v4, TypeScript strict",
            "@supabase/ssr for auth, RLS enforced on every table",
            "Stripe for payments where needed, webhooks behind signed handlers",
            "Posthog for analytics, never Google Analytics as a default",
            "A single `lib/` directory: db, auth, email, analytics, ai",
          ],
        },
        { kind: "h3", text: "The one-liner" },
        {
          kind: "code",
          text:
            "npx create-intelbase@latest my-site\ncd my-site\npnpm i\npnpm dev\n",
        },
        {
          kind: "p",
          text:
            "The starter bundles a working Vercel + Supabase config, a CLAUDE.md wired up to ui-ux-pro-max and 21st.dev, and a `/brief` skill that you invoke to collect a client brief and turn it into a sitemap + content plan in one go.",
        },
      ],
    },
    {
      title: "Designing with 21st.dev",
      lede: "Treat 21st.dev like a prop warehouse, not a set. You adapt every piece.",
      blocks: [
        {
          kind: "p",
          text:
            "The failure mode with component libraries is the 'stock photo effect' — a site that immediately reads as templated. Avoid it by never using a 21st.dev component verbatim. Copy it, adapt the typography, re-space it, change the accent, swap the imagery, and only then is it yours.",
        },
        { kind: "h3", text: "The 3-pass method" },
        {
          kind: "ol",
          items: [
            "Import the component pristine",
            "Pass 1 — retune spacing, line-height, border radius to match your brand",
            "Pass 2 — swap typography tokens; never use default fonts",
            "Pass 3 — invoke ui-ux-pro-max and apply its feedback line by line",
          ],
        },
        { kind: "h3", text: "Claude Code prompt for adapting components" },
        {
          kind: "code",
          text:
            "Read the 21st.dev component at {{path}}.\n\nAdapt it to our brand tokens defined in src/styles/tokens.css.\n\nConstraints:\n  - Use CSS vars for color, never hex directly\n  - Keep interactive states (hover, focus, active) — never drop them\n  - Preserve accessibility attrs (aria-*, role)\n  - Replace any generic copy with our voice (see memory/voice.md)\n  - Do not add extra abstractions; this is a leaf component\n\nThen run ui-ux-pro-max on the final file and apply its fixes.\n",
        },
      ],
    },
    {
      title: "ui-ux-pro-max: your taste gate",
      lede: "The skill that prevents the generic AI-looking site. Run it on every page before you ship.",
      blocks: [
        {
          kind: "p",
          text:
            "ui-ux-pro-max is a design-intelligence skill installed as a Claude Code plugin. It reviews a page or component against explicit heuristics — typographic rhythm, color discipline, spacing systems, motion — and returns a prioritised fix list. Used well, it turns a site from 'clearly built with AI' into something that feels hand-crafted.",
        },
        { kind: "h3", text: "When to invoke it" },
        {
          kind: "ul",
          items: [
            "After any new page scaffold, before adding content",
            "Before calling a design 'done'",
            "On every pre-ship PR, as a hook (see below)",
            "When a client says 'it feels off but I can't say why'",
          ],
        },
        { kind: "h3", text: "Wiring it into a pre-ship hook" },
        {
          kind: "code",
          text:
            "{\n  \"hooks\": {\n    \"PreToolUse\": [\n      {\n        \"matcher\": \"Bash(git push*)\",\n        \"command\": \"claude run /ui-ux-pro-max audit --paths src/app\"\n      }\n    ]\n  }\n}\n",
        },
        { kind: "h3", text: "Reading its output" },
        {
          kind: "p",
          text:
            "The skill emits P0/P1/P2 issues. P0s block ship. P1s ship on the next iteration. P2s are ignored on first pass unless you are in 'polish' mode. Never argue with a P0 from this skill — it's right more often than you are.",
        },
      ],
    },
    {
      title: "The Claude Code workflow for sites",
      lede: "One long run, split into six short plays. A site goes from blank canvas to live URL in under a day.",
      blocks: [
        { kind: "h3", text: "The plays" },
        {
          kind: "ol",
          items: [
            "Brief — /brief collects sitemap, pages, voice, references",
            "Scaffold — Claude creates routes, layouts, and empty components",
            "Content — copy generated from the brief, brand-voice-locked",
            "Design — adapt 21st.dev components, run ui-ux-pro-max per page",
            "Data — Supabase tables, RLS, seed data, server actions",
            "Ship — Vercel preview → approve → promote to prod",
          ],
        },
        { kind: "h3", text: "The /brief skill" },
        {
          kind: "code",
          text:
            "---\nname: brief\ndescription: Conversational intake for a new site. Produces docs/brief.md.\n---\n\nAsk the following questions one at a time. Do not batch.\n  1. Who is this for? (industry, target customer)\n  2. What do you want a visitor to do? (primary CTA)\n  3. Top 3 pages (beyond home)\n  4. Brand voice in 5 adjectives\n  5. 3 reference sites you admire and what specifically about each\n  6. Hard deadline?\n\nWhen answered, write docs/brief.md with a sitemap, a voice doc,\nand a day-by-day build plan.\n",
        },
      ],
    },
    {
      title: "Vercel: deploys that don't wake you up",
      lede: "Zero-config deploys, preview URLs on every branch, rollbacks in one click.",
      blocks: [
        {
          kind: "ol",
          items: [
            "Run `vercel link` once in the project directory",
            "Push to main — auto-deploys to prod",
            "Push to any branch — auto-preview URL, shareable immediately",
            "Add env vars via `vercel env add` or the dashboard",
            "Roll back via `vercel rollback <deployment-id>` if needed",
          ],
        },
        { kind: "h3", text: "Edge vs Node runtimes" },
        {
          kind: "p",
          text:
            "Default to Node. Use Edge only for a route that is latency-critical, reads no filesystem, and has no heavy deps. Most 'Edge by default' setups cost you more in integration pain than they buy in latency. This book's rule: boring until proven otherwise.",
        },
        { kind: "h3", text: "Cron jobs" },
        {
          kind: "code",
          text:
            "// vercel.json\n{\n  \"crons\": [\n    { \"path\": \"/api/cron/send-outreach\", \"schedule\": \"0 13 * * 1-5\" },\n    { \"path\": \"/api/cron/nightly-digest\", \"schedule\": \"0 4 * * *\" }\n  ]\n}\n",
        },
      ],
    },
    {
      title: "Supabase: the whole backend, in an afternoon",
      lede: "Auth, DB, storage, edge functions, RLS. Nine out of ten client sites need nothing else.",
      blocks: [
        { kind: "h3", text: "The six-table starter" },
        {
          kind: "ul",
          items: [
            "profiles — 1:1 with auth.users, public-readable",
            "leads — inbound form submissions",
            "campaigns — outreach sequences",
            "prospects — businesses we're contacting",
            "messages — what we sent / received / classification",
            "events — generic event log, append-only",
          ],
        },
        { kind: "h3", text: "RLS you actually want" },
        {
          kind: "code",
          text:
            "-- profiles: users can read their own row only\nalter table profiles enable row level security;\n\ncreate policy \"read own profile\"\n  on profiles for select\n  using (auth.uid() = id);\n\ncreate policy \"update own profile\"\n  on profiles for update\n  using (auth.uid() = id);\n\n-- leads: anyone can insert, only owners can read\ncreate policy \"insert leads\" on leads for insert with check (true);\ncreate policy \"owners read leads\" on leads for select\n  using (auth.uid() = owner_id);\n",
        },
        { kind: "h3", text: "Server actions that stay honest" },
        {
          kind: "p",
          text:
            "Use `@supabase/ssr` on the server, never the service-role key in a browser. Every write goes through a server action that re-validates the row against RLS before committing. If your app is one leaked anon key away from a breach, it's not an app, it's a draft.",
        },
      ],
    },
    {
      title: "Bonus — the automated outreach engine",
      lede: "A Vercel + Supabase worker that cold-emails local businesses with a personalised preview site attached. This is the chapter readers flip to first.",
      blocks: [
        {
          kind: "p",
          text:
            "This is the system we use to book meetings for our web-design service, and the one you can fork to book meetings for yours. The mechanics are small. The effect is not.",
        },
        { kind: "h3", text: "What it does, in order" },
        {
          kind: "ol",
          items: [
            "Pulls local businesses from Google Maps in a chosen niche and geography",
            "Scrapes their site and screenshots it",
            "Generates a 'before / after' mini-site preview on Vercel — a real working URL",
            "Writes a personalised cold email mentioning one concrete issue on their site",
            "Sends it, tracks opens, and replies via Supabase",
            "When they click the preview, you get a Slack ping and a booking link in their inbox",
          ],
        },
        { kind: "h3", text: "Architecture" },
        {
          kind: "code",
          text:
            "Supabase:\n  prospects(id, name, domain, industry, city, preview_url, status)\n  sends(id, prospect_id, subject, body, sent_at, opened_at, replied_at)\n\nVercel:\n  /api/cron/collect-prospects  — scrape Google Maps via Serper API\n  /api/cron/generate-previews  — for each prospect, call Claude + deploy preview\n  /api/cron/send-outreach      — send N personalised emails per day\n  /api/webhook/reply           — inbound email handler\n  /[prospect]/preview           — the dynamic preview site\n",
        },
        { kind: "h3", text: "The free, copy-paste prompt" },
        {
          kind: "p",
          text:
            "This is the exact prompt that writes the email. It's yours. Paste it into any Claude Code project and it will run as a skill the moment your prospects table has rows.",
        },
        {
          kind: "code",
          text:
            "---\nname: outreach-email\ndescription: Writes one personalised cold email to a local business with a free preview site attached.\n---\n\nInputs (provided as JSON):\n  prospect: { name, domain, industry, city, preview_url }\n  senderIdentity: { firstName, lastName, company, role, signature_url }\n  siteFindings: an array of specific issues Claude found on their current site\n\nTask: write a cold email that a human would not immediately delete.\n\nHard rules:\n  - Subject line under 40 characters, no emojis, no all-caps\n  - First sentence references something concrete and local — their\n    actual business, not a generic compliment\n  - Second sentence mentions one SPECIFIC issue from siteFindings\n    (name the file or section, not 'your site could be better')\n  - Third sentence offers the preview URL with a soft frame:\n    'I rebuilt the homepage as a thought-experiment — 30 seconds, no login'\n  - Close with a low-stakes CTA: 'reply \"send it\" if you want the rest'\n  - Under 95 words total. No em-dashes. No 'I hope this finds you well.'\n  - Sign off as {{senderIdentity.firstName}} — first name only\n\nReturn JSON: { subject, body_text }.\n",
        },
        { kind: "h3", text: "The site-findings generator" },
        {
          kind: "code",
          text:
            "---\nname: site-findings\ndescription: Scrape a prospect's site and list concrete, credible issues.\n---\n\nGiven the HTML of {{prospect.domain}}:\n\nReturn an array of 5 items. For each:\n  - the URL or section on their site\n  - the issue in plain language (no jargon)\n  - why it costs them money (one clause)\n\nRules:\n  - Be specific enough that a skeptical founder can't dismiss it\n  - Never invent issues — only things you can verify from the HTML\n  - Prefer performance, accessibility, and copy-clarity issues over\n    aesthetic ones (aesthetic is subjective; the others are not)\n",
        },
        { kind: "h3", text: "The Vercel worker" },
        {
          kind: "code",
          text:
            "// app/api/cron/send-outreach/route.ts\nimport { createClient } from '@supabase/supabase-js'\nimport { sendEmail } from '@/lib/email'\nimport { writeEmail } from '@/lib/ai'\n\nexport async function GET() {\n  const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!)\n\n  const { data: prospects } = await supa\n    .from('prospects')\n    .select('*')\n    .eq('status', 'ready')\n    .limit(30)\n\n  for (const p of prospects ?? []) {\n    const { subject, body_text } = await writeEmail(p)\n    await sendEmail({ to: p.contact_email, subject, text: body_text })\n    await supa.from('sends').insert({ prospect_id: p.id, subject, body: body_text, sent_at: new Date() })\n    await supa.from('prospects').update({ status: 'contacted' }).eq('id', p.id)\n  }\n\n  return Response.json({ sent: prospects?.length ?? 0 })\n}\n",
        },
        { kind: "h3", text: "Deliverability, or why most people fail" },
        {
          kind: "ul",
          items: [
            "Use a dedicated sending domain (not your main), warm it for 2 weeks",
            "SPF, DKIM, DMARC on all sending domains — no exceptions",
            "Stay under 50 sends/day per inbox until you see consistent open-rate",
            "Rotate 3 inboxes minimum if you want to hit 100/day sustainably",
            "One-click unsubscribe in the footer — legally required, and it helps reputation",
            "Never include tracking pixels or link shorteners; use a plain-text style email",
          ],
        },
        {
          kind: "quote",
          text:
            "A cold email that mentions the second section of their About page beats one that flatters them every time. Specificity is the whole game.",
        },
      ],
    },
    {
      title: "Selling this as a service",
      lede: "The productised offer we've taught to dozens of freelancers. $2–5k per site, ten-day turnaround, margins above 80%.",
      blocks: [
        { kind: "h3", text: "The pitch" },
        {
          kind: "p",
          text:
            "\"A premium, conversion-tuned site in ten business days. Built on the same stack Vercel uses for their own marketing pages. If it doesn't out-perform your current site's lead rate in 60 days, you get a full refund.\"",
        },
        { kind: "h3", text: "Packaging" },
        {
          kind: "ul",
          items: [
            "Essential — $2,000. Landing page + contact form + analytics.",
            "Plus — $3,500. 5 pages, CMS, booking integration.",
            "Pro — $5,000. 10 pages, CMS, Supabase-backed app features.",
            "Care plan — $400/mo. Ongoing edits, copy, hosting.",
          ],
        },
        { kind: "h3", text: "How to close" },
        {
          kind: "p",
          text:
            "Open the live preview you built for them. That's it. Nothing in your pitch competes with the feeling of seeing their own logo on a site that looks five times better than their current one. Most sales calls close in under seven minutes.",
        },
      ],
    },
    {
      title: "Appendix — prompts, skills, and the checklist",
      blocks: [
        { kind: "h3", text: "Pre-ship checklist" },
        {
          kind: "ul",
          items: [
            "Lighthouse performance >= 90 on mobile (not desktop — mobile)",
            "All images < 200kb, served as AVIF or WebP with fallback",
            "No layout shift on first paint (CLS < 0.05)",
            "Contrast ratios pass WCAG AA on every text block",
            "Focus ring visible on every interactive element",
            "404 and 500 pages that match the brand, not the framework default",
            "No console errors in production build",
            "Analytics firing; one test event visible in dashboard",
            "robots.txt, sitemap.xml, favicon, and og-image — all present",
            "A real human read the copy out loud. Twice.",
          ],
        },
        { kind: "h3", text: "Prompt — voice doc generator" },
        {
          kind: "code",
          text:
            "Given these 3 reference sites and 5 adjectives for our brand voice,\nproduce a voice doc with:\n  - Three 'we sound like' lines (concrete verbs, not adjectives)\n  - Three 'we don't sound like' lines with examples\n  - A do / don't vocabulary list\n  - Two paragraphs of our about-us, in voice\n\nReferences: {{site1, site2, site3}}\nAdjectives: {{voiceAdjectives}}\n",
        },
        { kind: "h3", text: "Skill — /ship-site" },
        {
          kind: "code",
          text:
            "---\nname: ship-site\ndescription: Full pre-ship gate. Runs Lighthouse, ui-ux-pro-max, typecheck, and deploys a preview.\n---\n\n1. Run pnpm typecheck; block on failure\n2. Run pnpm build; block on failure\n3. Run /ui-ux-pro-max audit; block on P0s\n4. Run Lighthouse on mobile; block if performance < 90\n5. vercel --prebuilt; capture preview URL\n6. Post preview URL to #client-{slug} Slack\n7. Wait for approval reaction before promoting to prod\n",
        },
      ],
    },
  ],
};

export const ebookContent: Record<string, EbookDoc> = {
  "social-ads-playbook": socialAdsPlaybook,
  "ai-automation-playbook": aiAutomationPlaybook,
  "website-builders-playbook": websiteBuildersPlaybook,
};
