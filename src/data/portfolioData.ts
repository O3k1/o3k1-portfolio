export interface ProjectEntry {
  id: string;
  index: string;
  code: string;
  title: string;
  subtitle: string;
  year: string;
  category: 'EDGE AI' | 'SECURITY' | 'THREAT MODELLING';
  status: string;
  marginNote: string;
  summary: string;
  architectureNotes: string[];
  stack: string[];
  metrics: { label: string; value: string }[];
  liveUrl?: string;
  repoUrl?: string;
  asciiDiagram: string;
}

export interface ExperienceEntry {
  id: string;
  index: string;
  role: string;
  organisation: string;
  period: string;
  tag: string;
  summary: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  shortName: string;
  degree: string;
  period: string;
  distinction?: string;
}

export interface DossierEntry {
  id: string;
  entryNumber: string;
  category: string;
  title: string;
  marginAnnotation: string;
  summary: string;
  details: string;
  tags: string[];
}

export const SELECTED_PROJECTS: ProjectEntry[] = [
  {
    id: 'feedback-sieve-cfpmi',
    index: '01',
    code: 'PROJ-2026-EDGE',
    title: 'The Feedback Sieve — Serverless AI Feedback Aggregator (cfpmi)',
    subtitle: 'Stateful Product Feedback Analysis Pipeline on Cloudflare Workers',
    year: '2026',
    category: 'EDGE AI',
    status: 'LIVE DEPLOYMENT',
    marginNote: 'Durable async workflow -> Llama 3.1 8B -> D1 SQL',
    summary:
      'Built a stateful product feedback analysis pipeline on Cloudflare Workers (TypeScript), orchestrating asynchronous processing via Cloudflare Workflows (FEEDBACK_WORKFLOW), running sentiment analysis and summarisation with Workers AI (@cf/meta/llama-3.1-8b-instruct), and persisting structured insights in a serverless Cloudflare D1 SQL database.',
    architectureNotes: [
      'Ingests raw product feedback payloads at the edge via TypeScript Worker endpoints and dispatches durable jobs into FEEDBACK_WORKFLOW.',
      'Executes structured sentiment classification, topic clustering, and concise summarisation using Workers AI (@cf/meta/llama-3.1-8b-instruct).',
      'Persists normalised insights, priority tags, and audit timestamps into Cloudflare D1 SQL for deterministic querying and prioritisation.'
    ],
    stack: [
      'TypeScript',
      'Cloudflare Workers',
      'Cloudflare Workflows',
      'Workers AI (Llama 3.1 8B)',
      'Cloudflare D1 SQL'
    ],
    metrics: [
      { label: 'ORCHESTRATION', value: 'FEEDBACK_WORKFLOW' },
      { label: 'INFERENCE MODEL', value: 'Llama 3.1 8B' },
      { label: 'PERSISTENCE', value: 'D1 SQL' }
    ],
    liveUrl: 'https://cfpmi.akinobse.workers.dev/',
    repoUrl: 'https://github.com/O3k1/cfpmi',
    asciiDiagram: `[Client Feedback] ---> [CF Worker API] ---> ( FEEDBACK_WORKFLOW )
                                                     |
                                                     v
[Cloudflare D1 SQL] <--- [Structured JSON] <--- [Workers AI: @cf/meta/llama-3.1-8b-instruct]`
  },
  {
    id: 'enterprise-iam-siem',
    index: '02',
    code: 'PROJ-2025-DISS',
    title: 'Enterprise Identity & SIEM Lab (BEng Honours Dissertation)',
    subtitle: 'Virtualised Zero-Trust Identity Broker & Telemetry Architecture',
    year: '2025',
    category: 'SECURITY',
    status: 'FIRST-CLASS HONOURS',
    marginNote: 'Centralised OIDC auth + real-time Wazuh correlation',
    summary:
      'Architected and deployed a multi-VM virtualised security environment integrating Keycloak identity and access management, Apache2 OpenID Connect (OIDC) authentication, and Wazuh real-time host and network intrusion monitoring.',
    architectureNotes: [
      'Configured Apache2 reverse-proxy nodes with mod_auth_openidc enforcing Keycloak OIDC token validation prior to upstream application access.',
      'Deployed Wazuh agents across virtualised endpoints to stream authentication events, file integrity telemetry, and anomaly alerts to a central SIEM manager.',
      'Validated end-to-end detection coverage against simulated credential stuffing, unauthorised privilege escalation, and lateral movement scenarios.'
    ],
    stack: [
      'Keycloak IAM',
      'Apache2 / OIDC',
      'Wazuh SIEM',
      'Multi-VM Virtualisation',
      'Linux Security'
    ],
    metrics: [
      { label: 'IDENTITY PROTOCOL', value: 'OIDC / OAuth 2.0' },
      { label: 'TELEMETRY', value: 'Wazuh SIEM' },
      { label: 'AWARD', value: '1st Class Hons' }
    ],
    asciiDiagram: `[User Request] ---> [Apache2 + mod_auth_openidc] <==OIDC==> [Keycloak IdP]
                             |                                     |
                             +--------> [Wazuh Agent Logs] <-------+
                                                |
                                                v
                                     [Wazuh SIEM Manager]`
  },
  {
    id: 'leo-satellite-pasta',
    index: '03',
    code: 'PROJ-2026-SPACE',
    title: 'LEO Satellite Digital Twin Threat Model — SpaceHawk',
    subtitle: 'PASTA Threat Modelling for Orbital Health Monitoring Infrastructure',
    year: '2026',
    category: 'THREAT MODELLING',
    status: 'GLOBAL CHALLENGE LAB 2026',
    marginNote: 'SpaceHawk PASTA DFD · SPARTA & OWASP boundaries',
    summary:
      'Designed a formal PASTA threat model and digital twin security framework for Low Earth Orbit (LEO) satellite health monitoring during the Imperial College London Global Challenge Lab 2026.',
    architectureNotes: [
      'Applied the seven-stage Process for Attack Simulation and Threat Analysis (PASTA) across space-to-ground CCSDS/SPP telemetry ingestion, SpaceHawk integration brokers, and the Basilisk digital twin engine.',
      'Enforced SPARTA trust boundaries (EX-0014.03 external ingestion, REC-0005 internal isolation) alongside tamper-evident cryptographic audit trails for regulators and insurers.',
      'Isolated operator Three.js visualisation streams behind an OWASP Top 10 Client UI boundary fed by TimescaleDB / Redis time-series storage.'
    ],
    stack: [
      'PASTA Methodology',
      'SPARTA Framework',
      'NATS / Apache Kafka',
      'Basilisk Orbit Sim',
      'TimescaleDB / Redis'
    ],
    metrics: [
      { label: 'METHODOLOGY', value: '7-Stage PASTA' },
      { label: 'TRUST BOUNDARIES', value: 'TB1 – TB4' },
      { label: 'COHORT', value: 'Imperial GCL 2026' }
    ],
    asciiDiagram: `+-------------------------------------------+   +--------------------------------------------+
| EE1: Satellite Vendor (CCSDS/SPP Packets) |   | EE2: SSA Providers / External Data         |
+-------------------------------------------+   |      (Debris & Ephemeris)                  |
                     |                          +--------------------------------------------+
                     |                                                |
=====================+================================================+=======================
  TB1: External Ingestion Boundary (SPARTA EX-0014.03)
=====================+================================================+=======================
                     |                                                |
                     v                                                v
        +---------------------------------------------------------------------------+
        | P1: Software APIs & Public-Facing Ingestion Boundary                      |
        +---------------------------------------------------------------------------+
                                              |
                                 (Normalised Telemetry)
                                              v
        +---------------------------------------------------------------------------+
        | P2: SpaceHawk Secured Data & Integration Layer                            |
        |     (NATS / Apache Kafka, Multi-Tenant Access Control)                    |
        +---------------------------------------------------------------------------+
               |                              |                              |
===============+==============================+==============================+================
  TB2: Internal Isolation Boundary (SPARTA REC-0005)
===============+==============================+==============================+================
               |                              |                              |
               v                              v                              v
+-----------------------------+  [TB3: Digital Twin Boundary]  +-----------------------------+
| P3: Operational Dashboard   |               |                | P5: Tamper-Evident Logs     |
|     (WebSockets & REST      |               v                |     - Activity Registry     |
|      Gateway)               |  +--------------------------+  |     - Posture Check Logs    |
+-----------------------------+  | P4: Digital Twin Engine  |  |     - Cryptographic         |
                                 |  +- 4.1 Sat Physics /    |  |       Signature             |
                                 |  |      Orbit [Basilisk] |  +-----------------------------+
                                 |  +- 4.2 Sat State        |                |
                                 |  |      Estimation /     |   (Signed Compliance Trails)
                                 |  |      Prediction       |                |
                                 |  +- 4.3 ML / Analytic    |                v
                                 |         Data             |  +-----------------------------+
                                 +--------------------------+  | EE4: Regulators & Insurers  |
                                              |                |      (Immutable Audit       |
                                              v                |       Metrics)              |
                                 +--------------------------+  +-----------------------------+
                                 | DS1: Time-Series Storage |
                                 |      (TimescaleDB /      |
                                 |       Redis)             |
                                 +--------------------------+
                                              |
==============================================+===============================================
  TB4: Client UI Boundary (OWASP Top 10)
==============================================+===============================================
                                              |
                                              v
                                 +--------------------------+
                                 | EE3: Operators &         |
                                 |      Analysts            |
                                 |      (Low-latency        |
                                 |       Three.js Renders)  |
                                 +--------------------------+`
  }
];

export const EXPERIENCE_ENTRIES: ExperienceEntry[] = [
  {
    id: 'ukipo-examiner',
    index: '01',
    role: 'Associate Patent Examiner (Computing & Telecommunications)',
    organisation: 'UK Intellectual Property Office',
    period: 'Sept 2026 – Present',
    tag: 'CURRENT ROLE',
    summary:
      'Examining patent applications across computing and telecoms domains, assessing technical novelty, inventive step, and prior art.'
  },
  {
    id: 'jpmc-code-for-good',
    index: '02',
    role: '1st Place Hackathon Team Lead',
    organisation: 'JPMorganChase Code for Good',
    period: 'Hackathon Winner',
    tag: 'LEADERSHIP',
    summary:
      'Led a seven-member engineering team and liaised directly with non-profit stakeholders and subject-matter experts to translate operational requirements into a winning technical prototype under strict hackathon constraints.'
  },
  {
    id: 'uws-society-officer',
    index: '03',
    role: 'School Officer & Cyber Security Society Founder',
    organisation: 'University of the West of Scotland',
    period: 'Academic Leadership',
    tag: 'FOUNDER & OFFICER',
    summary:
      'Founded the UWS Cyber Security Society, edited its inaugural newsletter, and represented student interests across the School of Computing, Engineering and Physical Sciences.'
  }
];

export const EDUCATION_ENTRIES: EducationEntry[] = [
  {
    id: 'ucl-steapp',
    institution: 'University College London (UCL)',
    shortName: 'UCL STEaPP',
    degree: 'MSc in Science, Technology, Engineering & Public Policy (Part-time)',
    period: '2026 – 2028'
  },
  {
    id: 'uws-beng',
    institution: 'University of the West of Scotland',
    shortName: 'UWS',
    degree: 'BEng (Hons) Cyber Security',
    period: 'Graduated',
    distinction: 'First-Class Honours & Level 8 Court Medal'
  }
];

export const DOSSIER_ENTRIES: DossierEntry[] = [
  {
    id: 'ai-safety-evals',
    entryNumber: 'DOSSIER № 01',
    category: 'UCL STEaPP POLICY BRIEF',
    title: 'AI Pre-Deployment Safety Evaluations (UCL STEaPP Policy Brief)',
    marginAnnotation: 'bridging technical evals & statutory oversight',
    summary:
      'Policy brief and reflective governance assessment analysing technical evaluation frameworks and regulatory interventions for frontier AI pre-deployment testing.',
    details:
      'Evaluates the institutional limits of voluntary pre-deployment capability audits, examining how verifiable model evaluation protocols, threshold triggers, and independent third-party access can be translated into enforceable public policy instruments.',
    tags: ['AI GOVERNANCE', 'PRE-DEPLOYMENT EVALS', 'UCL STEAPP']
  },
  {
    id: 'cloudflare-dx-log',
    entryNumber: 'DOSSIER № 02',
    category: 'PRODUCT FRICTION LOG',
    title: 'Cloudflare Developer Experience Friction Log',
    marginAnnotation: 'cli-to-ide gaps & windows onboarding friction',
    summary:
      'Product management teardown identifying CLI-to-IDE transition gaps, MCP configuration barriers, C3 terminal UI rendering bugs, and Windows ExecutionPolicy onboarding friction.',
    details:
      'Documented chronological developer-journey bottlenecks encountered while shipping edge AI workflows on Windows and TypeScript toolchains—pairing concrete reproduction notes with actionable DX prioritisation recommendations.',
    tags: ['DEVELOPER EXPERIENCE', 'PRODUCT TEARDOWN', 'MCP & CLI']
  },
  {
    id: 'sentinelone-ctfs',
    entryNumber: 'DOSSIER № 03',
    category: 'CTFS & MENTORSHIP',
    title: 'SentinelOne CTFs',
    marginAnnotation: 'threat hunting + brightside mentorship',
    summary:
      'Solo competitor in SentinelOne Capture The Flag and threat-hunting challenges, alongside STEM and academic mentorship via Brightside.',
    details:
      'Participated solo in SentinelOne Capture The Flag and ThreatOps challenges focused on endpoint telemetry investigation and threat hunting, alongside structured STEM and academic mentoring via Brightside.',
    tags: ['SENTINELONE CTF', 'THREAT HUNTING', 'BRIGHTSIDE MENTOR']
  }
];
