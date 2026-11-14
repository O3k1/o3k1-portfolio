import React, { useState } from 'react';
import {
  ArrowUpRight,
  Terminal,
  ShieldCheck,
  Briefcase,
  Copy,
  Check,
  Compass,
  BookOpen,
  Mail,
  Github,
  Linkedin,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Globe,
} from 'lucide-react';
import { AsciiLollipop } from './components/AsciiLollipop';
import { WaxSealStamp } from './components/WaxSealStamp';
import {
  SELECTED_PROJECTS,
  EXPERIENCE_ENTRIES,
  EDUCATION_ENTRIES,
  DOSSIER_ENTRIES,
  ProjectEntry,
} from './data/portfolioData';

type CategoryFilter = 'ALL' | ProjectEntry['category'];

const EMAIL_ADDRESS = 'shollium@proton.me';

export function App() {
  // Deep-link filter and expanded schematic state in URL search params
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category')?.toUpperCase();
    if (cat === 'EDGE AI' || cat === 'SECURITY' || cat === 'THREAT MODELLING') {
      return cat;
    }
    return 'ALL';
  });

  const [expandedProject, setExpandedProject] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('schematic') || 'leo-satellite-pasta';
  });

  const [activeDossierId, setActiveDossierId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('dossier') || null;
  });

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [archivedToDisk, setArchivedToDisk] = useState(false);

  const syncQueryParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const queryString = params.toString();
    const nextUrl = queryString
      ? `${window.location.pathname}?${queryString}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
  };

  const handleSelectCategory = (category: CategoryFilter) => {
    setActiveCategory(category);
    syncQueryParam('category', category === 'ALL' ? null : category.toLowerCase());
  };

  const handleToggleSchematic = (projectId: string) => {
    const nextProject = expandedProject === projectId ? null : projectId;
    setExpandedProject(nextProject);
    syncQueryParam('schematic', nextProject);
  };

  const handleToggleDossier = (entryId: string) => {
    const nextDossier = activeDossierId === entryId ? null : entryId;
    setActiveDossierId(nextDossier);
    syncQueryParam('dossier', nextDossier);
  };

  const filteredProjects =
    activeCategory === 'ALL'
      ? SELECTED_PROJECTS
      : SELECTED_PROJECTS.filter((p) => p.category === activeCategory);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_ADDRESS);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    }
  };

  const handleDownloadArchiveSnapshot = async () => {
    // Collect active stylesheets so the exported HTML snapshot is self-contained
    let collectedCss = '';
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        collectedCss += rules.map((r) => r.cssText).join('\n') + '\n';
      } catch {
        // Skip cross-origin stylesheets (e.g. Google Fonts) that disallow cssRules reading
      }
    }

    // Attempt to inline the custom handwritten font as a data URI for offline fidelity
    let inlinedFontCss = '';
    try {
      const fontResp = await fetch('/fonts/Oo_font_mk1-Regular.ttf');
      if (fontResp.ok) {
        const buffer = await fontResp.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        inlinedFontCss = `@font-face { font-family: 'OoHandwriting'; src: url('data:font/ttf;base64,${base64}') format('truetype'); font-weight: 400; font-style: normal; font-display: swap; }`;
      }
    } catch {
      // Fallback gracefully if fetch is unavailable
    }

    const clonedDoc = document.documentElement.cloneNode(true) as HTMLElement;

    // Strip runtime scripts and Vite module preloads from the static snapshot
    clonedDoc.querySelectorAll('script').forEach((el) => el.remove());
    clonedDoc
      .querySelectorAll('link[rel="modulepreload"], link[rel="preload"]')
      .forEach((el) => el.remove());

    // Remove blank unscripted WebGL <canvas> elements while keeping the rendered ASCII <table>
    clonedDoc.querySelectorAll('.ascii-viewport-container canvas').forEach((el) => el.remove());

    const head = clonedDoc.querySelector('head');
    if (head) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-archive-snapshot', 'true');
      styleEl.textContent = `${collectedCss}\n${inlinedFontCss}`;
      head.appendChild(styleEl);
    }

    const snapshotHtml = `<!doctype html>\n${clonedDoc.outerHTML}`;
    const blob = new Blob([snapshotHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'o3k1-archive-snapshot.html';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setArchivedToDisk(true);
    setTimeout(() => setArchivedToDisk(false), 4500);
  };

  return (
    <div className="relative min-h-screen bg-paper text-ink selection:bg-ink selection:text-paper">
      {/* Subtle, non-distracting SVG noise/paper-grain overlay (opacity: 0.04) */}
      <svg
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.04]"
        aria-hidden="true"
      >
        <filter id="archival-paper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#archival-paper-grain)" />
      </svg>

      {/* Outer Architect's Ledger Frame */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="border border-ink bg-paper">
          {/* Top Archival Ledger Bar */}
          <header className="border-b border-ink">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink px-4 py-2 text-[11px] font-mono text-pencil bg-paper-warm/50 tabular-nums">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-ink">FOLIO // O3K1.COM</span>
                <span className="hidden sm:inline text-pencil">|</span>
                <span className="hidden sm:inline">DOC. REF: O3K1-ARCH-2026</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden md:inline">SHEET 01 OF 01 · SCALE 1:1</span>
                <span className="inline-flex items-center gap-1.5 text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-stamp-forest" aria-hidden="true" />
                  <span>ASSOCIATE PATENT EXAMINER // COMPUTING &amp; TELECOMS</span>
                </span>
              </div>
            </div>

            {/* Main Notebook Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4">
              <div className="flex items-baseline gap-3">
                <a
                  href="#top"
                  className="font-handwriting text-3xl sm:text-4xl text-ink tracking-wide hover:opacity-80 transition-opacity"
                >
                  Obashola
                </a>
                <span className="font-mono text-xs text-pencil uppercase tracking-widest">
                  [o3k1.com]
                </span>
              </div>

              <nav
                aria-label="Primary Notebook Sections"
                className="flex flex-wrap items-center gap-1 sm:gap-2"
              >
                <a
                  href="#projects"
                  className="border border-transparent hover:border-ink px-2.5 py-1 text-xs font-mono text-ink transition-colors tabular-nums"
                >
                  01. PROJECTS
                </a>
                <a
                  href="#experience"
                  className="border border-transparent hover:border-ink px-2.5 py-1 text-xs font-mono text-ink transition-colors tabular-nums"
                >
                  02. EXPERIENCE
                </a>
                <a
                  href="#dossier"
                  className="border border-transparent hover:border-ink px-2.5 py-1 text-xs font-mono text-ink transition-colors tabular-nums"
                >
                  03. DOSSIER
                </a>
                <a
                  href="#communications"
                  className="border border-ink bg-ink text-paper hover:bg-paper hover:text-ink px-3 py-1 text-xs font-mono transition-colors tabular-nums"
                >
                  04. COMMUNICATIONS
                </a>
              </nav>
            </div>
          </header>

          <main id="top">
            {/* =====================================================================
                HERO SECTION: Handwritten Name/Intro Accent + Interactive 3D ASCII Lollipop
            ===================================================================== */}
            <section
              aria-labelledby="hero-heading"
              className="grid grid-cols-1 lg:grid-cols-12 border-b border-ink"
            >
              {/* Left Column: Editorial & Handwritten Intro Accent */}
              <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-10 lg:border-r border-ink">
                <div>
                  {/* Margin index & handwritten note */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 border border-ink px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-ink bg-paper-warm">
                      <Compass className="h-3 w-3" aria-hidden="true" />
                      <span>ENGINEERING, CYBER SECURITY &amp; TECH POLICY NOTEBOOK</span>
                    </span>
                    <span className="font-handwriting text-xl text-pencil">
                      field edition — vol. IV
                    </span>
                  </div>

                  {/* Hero Headline: Handwritten Name/Intro Accent + Crisp Editorial Serif */}
                  <h1 id="hero-heading" className="mb-6">
                    <span className="block font-handwriting text-2xl sm:text-3xl text-pencil mb-2">
                      Hello, I&apos;m Obashola (o3k1.com) —
                    </span>
                    <span className="block font-serif text-3xl sm:text-4xl lg:text-[44px] font-medium text-ink leading-[1.12] tracking-tight">
                      Examining emerging tech, securing systems &amp; exploring tech policy.
                    </span>
                  </h1>

                  {/* Editorial Body Copy in Newsreader (British English) */}
                  <p className="font-serif text-lg sm:text-xl text-ink/90 leading-relaxed mb-4">
                    I work at the intersection of engineering and governance—examining computing and
                    telecommunications patents at the UK Intellectual Property Office whilst
                    studying a part-time MSc in Science, Technology, Engineering &amp; Public Policy
                    at UCL.
                  </p>

                  <p className="font-serif text-base sm:text-lg text-pencil leading-relaxed mb-8">
                    Outside of IP and policy, I build virtualised security architectures, edge AI
                    pipelines, and threat models for emerging infrastructure.
                  </p>

                  {/* Three Core Pillars Spec Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 border border-ink bg-paper-warm/40 mb-8">
                    <div className="p-3 border-b sm:border-b-0 sm:border-r border-ink">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-pencil mb-1">
                        DOMAIN 01
                      </div>
                      <div className="font-mono text-xs font-medium text-ink">
                        Cyber Security &amp; Systems
                      </div>
                    </div>
                    <div className="p-3 border-b sm:border-b-0 sm:border-r border-ink">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-pencil mb-1">
                        DOMAIN 02
                      </div>
                      <div className="font-mono text-xs font-medium text-ink">
                        Computing &amp; Telecoms IP
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-pencil mb-1">
                        DOMAIN 03
                      </div>
                      <div className="font-mono text-xs font-medium text-ink">
                        Tech Policy &amp; Governance
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row of Hero Left Column: CTAs & Handwritten Signature */}
                <div className="pt-4 border-t border-ink/30 flex flex-wrap items-end justify-between gap-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="#projects"
                      className="inline-flex items-center gap-2 border border-ink bg-ink text-paper hover:bg-paper hover:text-ink px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors"
                    >
                      <span>INSPECT PROJECTS</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                    <a
                      href="#communications"
                      className="inline-flex items-center gap-2 border border-ink bg-paper text-ink hover:bg-paper-warm px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors"
                    >
                      <span>COMMUNICATIONS</span>
                    </a>
                  </div>

                  {/* Handwritten Signature Block */}
                  <div className="text-right">
                    <div className="font-handwriting text-3xl text-ink leading-none">— O.O</div>
                    <div className="font-mono text-[10px] text-pencil tracking-widest uppercase mt-1">
                      COMPUTING &amp; TELECOMS · O3K1.COM
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive 3D ASCII Lollipop Specimen */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-paper-warm/25 border-t lg:border-t-0 border-ink">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="font-serif text-xl font-medium text-ink tracking-tight">
                    Interactive Specimen Study
                  </span>
                  <span className="font-mono text-[11px] text-pencil tabular-nums">
                    [PLATE № 01]
                  </span>
                </div>

                <AsciiLollipop />

                {/* Handwritten Margin Footnote under the 3D Specimen */}
                <div className="mt-4 flex items-start justify-between gap-4 border-t border-ink/30 pt-3">
                  <p className="font-handwriting text-lg text-pencil leading-snug">
                    * Note: Real-time 3D swirled lollipop geometry rasterised into pure ink ASCII
                    glyphs (@ # * + : .). Grab with your cursor and flick to test inertia damping.
                  </p>
                  <span className="font-mono text-[10px] text-pencil uppercase tracking-wider shrink-0 tabular-nums">
                    60 FPS
                  </span>
                </div>
              </div>
            </section>

            {/* =====================================================================
                SECTION 01: COMPLETED TECHNICAL PROJECTS
            ===================================================================== */}
            <section
              id="projects"
              aria-labelledby="projects-heading"
              className="border-b border-ink p-6 sm:p-8 lg:p-10"
            >
              {/* Section Header with Editorial Serif Heading & Category Filter */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-ink">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-pencil uppercase tracking-widest mb-1.5 tabular-nums">
                    <Terminal className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
                    <span>SECTION 01 // COMPLETED TECHNICAL WORK</span>
                  </div>
                  <h2
                    id="projects-heading"
                    className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-ink"
                  >
                    Selected Engineering &amp; Security Projects
                  </h2>
                </div>

                {/* Filter Tabs */}
                <div
                  role="tablist"
                  aria-label="Filter projects by discipline"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {(['ALL', 'EDGE AI', 'SECURITY', 'THREAT MODELLING'] as CategoryFilter[]).map(
                    (category) => {
                      const isSelected = activeCategory === category;
                      return (
                        <button
                          key={category}
                          role="tab"
                          type="button"
                          aria-selected={isSelected}
                          onClick={() => handleSelectCategory(category)}
                          className={`border border-ink px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                            isSelected
                              ? 'bg-ink text-paper'
                              : 'bg-paper text-ink hover:bg-paper-warm'
                          }`}
                        >
                          {category}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Project Blueprint Plates */}
              <div className="mt-8 space-y-8">
                {filteredProjects.map((project) => {
                  const isSchematicOpen = expandedProject === project.id;
                  return (
                    <article
                      key={project.id}
                      className="border border-ink bg-paper transition-colors"
                    >
                      {/* Top Blueprint Metadata Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink bg-paper-warm/60 px-4 py-2 text-xs font-mono tabular-nums">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-ink">
                            PLATE {project.index} // {project.code}
                          </span>
                          <span className="text-pencil">|</span>
                          <span className="text-pencil">{project.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="border border-ink/50 bg-paper px-2 py-0.5 text-[11px] text-ink">
                            {project.status}
                          </span>
                          <span className="text-pencil">{project.year}</span>
                        </div>
                      </div>

                      {/* Main Blueprint Content Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12">
                        {/* Left 8 Columns: Title, Narrative, Architecture Notes */}
                        <div className="lg:col-span-8 p-5 sm:p-6 lg:border-r border-ink">
                          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                            <h3 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                              {project.title}
                            </h3>
                          </div>

                          <p className="font-mono text-xs text-pencil uppercase tracking-wider mb-4">
                            {project.subtitle}
                          </p>

                          <p className="font-serif text-base sm:text-lg text-ink/90 leading-relaxed mb-5">
                            {project.summary}
                          </p>

                          {/* Key Architectural Notes List */}
                          <div className="space-y-2 mb-6">
                            <div className="font-mono text-[11px] uppercase tracking-wider text-pencil">
                              SYSTEM ARCHITECTURE &amp; IMPLEMENTATION:
                            </div>
                            <ul className="space-y-1.5 font-serif text-sm sm:text-base text-ink/85">
                              {project.architectureNotes.map((note, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                  <span className="font-mono text-xs text-pencil mt-1 tabular-nums">
                                    [{i + 1}]
                                  </span>
                                  <span>{note}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Stack Tags */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-2">
                            {project.stack.map((tech) => (
                              <span
                                key={tech}
                                className="border border-ink/60 bg-paper-warm/50 px-2.5 py-0.5 font-mono text-[11px] text-ink"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Right 4 Columns: Handwritten Margin Note, Technical Profile & Actions */}
                        <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between bg-paper-warm/20 border-t lg:border-t-0 border-ink">
                          <div>
                            {/* Handwritten Margin Annotation Box */}
                            <div className="border-l-2 border-ink pl-3 py-1 mb-6">
                              <span className="block font-mono text-[10px] uppercase tracking-widest text-pencil">
                                MARGIN ANNOTATION //
                              </span>
                              <p className="font-handwriting text-2xl text-ink leading-snug mt-0.5">
                                &ldquo;{project.marginNote}&rdquo;
                              </p>
                            </div>

                            {/* Technical Specifications Table */}
                            <div className="border border-ink bg-paper mb-6">
                              <div className="border-b border-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-pencil bg-paper-warm/50">
                                TECHNICAL PROFILE
                              </div>
                              <div className="divide-y divide-ink/30">
                                {project.metrics.map((m) => (
                                  <div
                                    key={m.label}
                                    className="flex items-center justify-between gap-2 px-3 py-2 font-mono text-xs tabular-nums"
                                  >
                                    <span className="text-pencil">{m.label}</span>
                                    <span className="font-semibold text-ink text-right">
                                      {m.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Action Links & Schematic Toggle */}
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => handleToggleSchematic(project.id)}
                              aria-expanded={isSchematicOpen}
                              className="w-full flex items-center justify-between border border-ink bg-paper hover:bg-paper-warm px-3 py-2 text-xs font-mono text-ink transition-colors"
                            >
                              <span>
                                {isSchematicOpen
                                  ? 'HIDE ASCII SCHEMATIC'
                                  : 'VIEW ASCII SCHEMATIC'}
                              </span>
                              {isSchematicOpen ? (
                                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                              )}
                            </button>

                            {(project.liveUrl || project.repoUrl) && (
                              <div className="flex flex-wrap items-center gap-2">
                                {project.liveUrl && (
                                  <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 border border-ink bg-ink text-paper hover:bg-paper hover:text-ink px-3 py-2 text-xs font-mono transition-colors"
                                  >
                                    <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>LIVE DEPLOYMENT</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                  </a>
                                )}
                                {project.repoUrl && (
                                  <a
                                    href={project.repoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 border border-ink bg-paper hover:bg-paper-warm px-3 py-2 text-xs font-mono text-ink transition-colors"
                                  >
                                    <Github className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>SOURCE REPO</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Collapsible ASCII Architecture Schematic / DFD Drawer */}
                      {isSchematicOpen && (
                        <div className="border-t border-ink bg-paper-warm/40 p-4 sm:p-5">
                          <div className="flex items-center justify-between mb-2 font-mono text-[11px] text-pencil">
                            <span>DATAFLOW &amp; TRUST BOUNDARY SCHEMATIC ({project.code})</span>
                            <span>PLAIN-TEXT DIAGRAM</span>
                          </div>
                          <pre className="overflow-x-auto border border-ink bg-paper p-4 font-mono text-xs leading-relaxed text-ink">
                            {project.asciiDiagram}
                          </pre>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            {/* =====================================================================
                SECTION 02 & 03: EXPERIENCE & DOSSIER (2-COLUMN NOTEBOOK SPREAD)
            ===================================================================== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-ink">
              {/* Left 6 Columns: 02. EXPERIENCE (Roles, Leadership & Education) */}
              <div
                id="experience"
                aria-labelledby="experience-heading"
                className="lg:col-span-6 p-6 sm:p-8 lg:p-10 lg:border-r border-ink"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-xs text-pencil uppercase tracking-widest tabular-nums">
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
                    <span>SECTION 02 // ROLES, LEADERSHIP &amp; EDUCATION</span>
                  </span>
                  <span>RECORD: 2026</span>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-2 pb-5 border-b border-ink">
                  <h2
                    id="experience-heading"
                    className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-ink"
                  >
                    Experience &amp; Education
                  </h2>
                  <span className="font-handwriting text-xl text-pencil">
                    chronological ledger
                  </span>
                </div>

                {/* Roles & Leadership Entries */}
                <div className="divide-y divide-ink">
                  {EXPERIENCE_ENTRIES.map((exp) => (
                    <article key={exp.id} className="py-5 first:pt-6">
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-pencil mb-1.5 tabular-nums">
                        <span className="font-semibold text-ink">
                          ROLE {exp.index} // {exp.organisation.toUpperCase()}
                        </span>
                        <span className="border border-ink/50 bg-paper-warm/50 px-2 py-0.5 text-[10px] text-ink">
                          {exp.period}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink mb-2">
                        {exp.role}
                      </h3>

                      <p className="font-serif text-base text-pencil leading-relaxed">
                        {exp.summary}
                      </p>
                    </article>
                  ))}
                </div>

                {/* Education Sub-Ledger */}
                <div className="mt-4 pt-6 border-t border-ink">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-pencil mb-4">
                    <GraduationCap className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
                    <span>ACADEMIC EDUCATION //</span>
                  </div>

                  <div className="space-y-3">
                    {EDUCATION_ENTRIES.map((edu) => (
                      <div
                        key={edu.id}
                        className="border border-ink bg-paper-warm/30 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-pencil mb-1 tabular-nums">
                          <span className="font-semibold text-ink uppercase">
                            {edu.institution}
                          </span>
                          <span>{edu.period}</span>
                        </div>
                        <div className="font-serif text-lg font-medium text-ink">
                          {edu.degree}
                        </div>
                        {edu.distinction && (
                          <div className="mt-1.5 font-mono text-xs text-ink">
                            DISTINCTION: {edu.distinction}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 6 Columns: 03. DOSSIER (Tech Policy Papers, CTFs & Community) */}
              <div
                id="dossier"
                aria-labelledby="dossier-heading"
                className="lg:col-span-6 p-6 sm:p-8 lg:p-10 bg-paper-warm/30 border-t lg:border-t-0 border-ink flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 font-mono text-xs text-pencil uppercase tracking-widest mb-1.5 tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
                      <span>SECTION 03 // TECH POLICY, CTFS &amp; COMMUNITY</span>
                    </span>
                    <span>INDEX: 2026</span>
                  </div>

                  <div className="flex flex-wrap items-baseline justify-between gap-2 pb-5 border-b border-ink">
                    <h2
                      id="dossier-heading"
                      className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-ink"
                    >
                      Archival Dossier
                    </h2>
                    <span className="font-handwriting text-xl text-pencil">
                      policy briefs &amp; field notes
                    </span>
                  </div>

                  <div className="divide-y divide-ink">
                    {DOSSIER_ENTRIES.map((entry) => {
                      const isExpanded = activeDossierId === entry.id;
                      return (
                        <article key={entry.id} className="py-5 first:pt-6">
                          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-pencil mb-2 tabular-nums">
                            <span className="font-semibold text-ink">{entry.entryNumber}</span>
                            <span className="border border-ink/50 bg-paper px-1.5 py-0.5 text-[10px] text-ink">
                              {entry.category}
                            </span>
                          </div>

                          <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink mb-2">
                            {entry.title}
                          </h3>

                          {/* Handwritten margin comment */}
                          <div className="mb-3 inline-flex items-center gap-2 bg-paper px-2.5 py-0.5 border border-ink/40">
                            <span className="font-mono text-[10px] uppercase text-pencil">
                              MARGIN:
                            </span>
                            <span className="font-handwriting text-lg text-ink">
                              &ldquo;{entry.marginAnnotation}&rdquo;
                            </span>
                          </div>

                          <p className="font-serif text-base text-pencil leading-relaxed mb-3">
                            {entry.summary}
                          </p>

                          {isExpanded && (
                            <div className="notebook-ruled border border-ink bg-paper p-4 mb-4 font-serif text-sm sm:text-base text-ink leading-8">
                              <p>{entry.details}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {entry.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="font-mono text-[10px] text-pencil border border-ink/30 bg-paper px-2 py-0.5"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleDossier(entry.id)}
                              className="font-mono text-xs text-ink underline underline-offset-4 hover:text-pencil transition-colors"
                            >
                              {isExpanded ? 'COLLAPSE NOTE [-]' : 'READ NOTE [+]'}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                {/* Archival Stamp & Signature Block */}
                <div className="mt-6 border border-ink bg-paper p-4">
                  <div className="flex items-center justify-between border-b border-ink/40 pb-2 mb-3 font-mono text-[11px] text-pencil tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
                      <span>VERIFICATION STAMP</span>
                    </span>
                    <span>REV. 2026.11</span>
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-pencil">
                        EXAMINED &amp; SIGNED BY:
                      </div>
                      <div className="mt-1 flex items-baseline gap-2.5">
                        <span className="font-handwriting text-3xl text-ink leading-none">
                          — O.O
                        </span>
                        <span className="font-mono text-xs text-pencil">· O3K1.COM</span>
                      </div>
                    </div>
                    <div className="border border-stamp-red text-stamp-red px-2 py-1 font-mono text-[10px] uppercase tracking-widest rotate-[-3deg]">
                      ARCHIVAL COPY
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================================
                SECTION 04: COMMUNICATIONS & WAX SEAL DOWNLOAD STAMP
            ===================================================================== */}
            <section
              id="communications"
              aria-labelledby="communications-heading"
              className="p-6 sm:p-8 lg:p-10 bg-paper"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6">
                  <div className="flex items-center gap-2 font-mono text-xs text-pencil uppercase tracking-widest mb-1.5 tabular-nums">
                    <Mail className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
                    <span>SECTION 04 // 04. COMMUNICATIONS</span>
                  </div>
                  <h2
                    id="communications-heading"
                    className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-ink mb-3"
                  >
                    Communications
                  </h2>
                  <p className="font-serif text-base sm:text-lg text-pencil leading-relaxed mb-6">
                    For computing and telecoms IP dialogue, cyber security systems, tech policy
                    research, or engineering collaboration, get in touch directly via email or the
                    links alongside.
                  </p>

                  {/* Custom SVG Wax Seal Download Stamp */}
                  <div className="pt-1">
                    <WaxSealStamp
                      onClick={handleDownloadArchiveSnapshot}
                      archived={archivedToDisk}
                    />
                    <p className="mt-3 font-mono text-[11px] text-pencil">
                      Press the wax seal to export a self-contained HTML snapshot
                      (o3k1-archive-snapshot.html).
                    </p>
                  </div>
                </div>

                {/* Right 6 Columns: Ledger Communications Table */}
                <div className="lg:col-span-6 border border-ink bg-paper-warm/30">
                  {/* Direct Email Correspondence Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink p-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-pencil">
                        DIRECT EMAIL CORRESPONDENCE
                      </div>
                      <a
                        href={`mailto:${EMAIL_ADDRESS}`}
                        className="font-mono text-base sm:text-lg font-medium text-ink hover:underline underline-offset-4"
                      >
                        {EMAIL_ADDRESS}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1.5 border border-ink bg-paper hover:bg-ink hover:text-paper px-3 py-1.5 text-xs font-mono text-ink transition-colors"
                      aria-label={`Copy email address ${EMAIL_ADDRESS}`}
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>COPY ADDRESS</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* External Index Links: GitHub, LinkedIn, o3k1.com */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ink">
                    <a
                      href="https://github.com/O3k1"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 font-mono text-xs text-ink hover:bg-ink hover:text-paper transition-colors"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Github className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>GITHUB</span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/obasholaobisesan/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 font-mono text-xs text-ink hover:bg-ink hover:text-paper transition-colors"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>LINKEDIN</span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                    <a
                      href="https://o3k1.com"
                      className="flex items-center justify-between p-4 font-mono text-xs text-ink hover:bg-ink hover:text-paper transition-colors"
                    >
                      <span>O3K1.COM</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Archival Colophon Footer */}
          <footer className="border-t border-ink bg-paper-warm/60 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-pencil tabular-nums">
            <div className="flex flex-wrap items-center gap-3">
              <span>© 2026 OBASHOLA (O3K1.COM) · ALL RIGHTS RESERVED</span>
              <span className="font-handwriting text-xl text-ink leading-none">— O.O</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span>TYPESET IN NEWSREADER, JETBRAINS MONO &amp; OOHANDWRITING</span>
              <span className="hidden sm:inline">·</span>
              <span>PAPER STOCK #F6F3EC / INK #1C1B18</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
