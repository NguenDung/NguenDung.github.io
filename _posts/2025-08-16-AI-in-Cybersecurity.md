---
layout: post-with-comments-with-comments
title: "AI in Cybersecurity: Benefits, Risks, and an Evidence-Based Playbook"
permalink: /posts/ai-in-cybersecurity-practical-guide/
tags: [ai, cybersecurity, blue-team, red-team, soc, threat-intel, detection, governance, mlops, llmops, rag, education]
description: "A deep, practice-driven and academically grounded guide to using AI in cybersecurity—capabilities, limitations, architectures, governance, evaluation, and safe workflows for learning and work."
excerpt_separator: <!--more-->
---

<!-- Scoped styles for THIS post only -->
<style>
/* Responsive video embeds (16:9) */
.embed-16x9 { position: relative; width: 100%; aspect-ratio: 16 / 9; }
.embed-16x9 iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

/* Tables + horizontal scroll */
.table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.md-table table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
.md-table th, .md-table td { padding: .6rem .8rem; border: 1px solid #e5e7eb; }
.md-table thead th { background: #f8fafc; text-align: left; }

/* Dark mode soften */
@media (prefers-color-scheme: dark) {
  .md-table th, .md-table td { border-color: rgba(255,255,255,.12); }
  .md-table thead th { background: rgba(255,255,255,.06); }
}

/* Lightweight callouts */
.callout { padding:.8rem 1rem; border-left:4px solid #6b7280; background:rgba(107,114,128,.08); margin:1rem 0; }
.callout.warn { border-color:#d97706; background:rgba(217,119,6,.08); }
.callout.ok { border-color:#059669; background:rgba(5,150,105,.08); }
.callout.info { border-color:#2563eb; background:rgba(37,99,235,.08); }

/* Optional subtle figure captions */
.figcap { font-size:.9rem; color:#6b7280; margin-top:.3rem; }

/* Anchor scroll offset for sticky headers */
h1[id], h2[id], h3[id], h4[id] { scroll-margin-top: 80px; }
</style>

Hello again — **SuiiKawaii** here. This long-form guide takes an **evidence-based** look at AI for cybersecurity: where it accelerates learners and defenders, where it fails, and how to deploy it with **technical controls, evaluation, and governance**. It’s both a rigorous reference and a hands-on handbook.

![ai]({{ '/assets/images/ai/ai.gif' | relative_url }})

**Reference video:**
<!-- Main video embed (high-level overview) -->
<div class="embed-16x9" markdown="0">
  <iframe src="https://www.youtube.com/embed/utcYsBKL7e8"
          title="How AI Can Accelerate Cybersecurity"
          allowfullscreen loading="lazy"></iframe>
</div>

**You will walk away with**
- A capability map of AI in security operations (SOC, TI, Detection, IR, GRC, AppSec/Cloud)
- Architectural patterns (RAG, guardrails) and LMMOps/MLOps basics
- A safety & governance spine (policy starter, data classes, redaction)
- Evaluation methodology (precision/recall/F1, drift checks, cost/coverage, retrieval metrics)
- Role-based workflows, prompts, and study paths (learning & work)
- Two detailed case studies and a pragmatic 30/60/90 rollout plan

If you are building foundational Linux + security skills, pair this with:
- <a href="/posts/mastering-linux-for-cybersecurity/" target="_blank" rel="noopener noreferrer">Mastering Linux for Cybersecurity</a>
- <a href="/posts/wsl-linux-starter/" target="_blank" rel="noopener noreferrer">Learn Linux with WSL</a>
- <a href="/posts/home-cyber-lab/" target="_blank" rel="noopener noreferrer">Build a Home Cybersecurity Lab</a>

## Table of Contents
- [1) Scope: What “AI” Means Here](#1-scope-what-ai-means-here)
- [2) Capability Map: Where AI Helps Most](#2-capability-map-where-ai-helps-most)
- [3) Learning vs. Work: How AI Changes the Curve](#3-learning-vs-work-how-ai-changes-the-curve)
- [4) Risk Model: How AI Fails (and Why)](#4-risk-model-how-ai-fails-and-why)
- [5) Data Classes, Redaction, and Minimization](#5-data-classes-redaction-and-minimization)
- [6) Architecture Patterns for Security Work](#6-architecture-patterns-for-security-work)
  - [6.1 Retrieval-Augmented Generation (RAG) done right](#61-retrieval-augmented-generation-rag-done-right)
  - [6.2 Guardrails and Output Controls](#62-guardrails-and-output-controls)
  - [6.3 Local vs. SaaS Models](#63-local-vs-saas-models)
- [7) LMMOps: Operating an AI Assistant in the SOC](#7-lmmops-operating-an-ai-assistant-in-the-soc)
- [8) Evaluation: Metrics and Experiment Design](#8-evaluation-metrics-and-experiment-design)
- [9) Role-by-Role Playbooks & Prompts](#9-role-by-role-playbooks--prompts)
  - [9.1 SOC](#91-soc)
  - [9.2 Threat Intelligence](#92-threat-intelligence)
  - [9.3 Detection Engineering](#93-detection-engineering)
  - [9.4 Incident Response](#94-incident-response)
  - [9.5 GRC & Policy](#95-grc--policy)
  - [9.6 AppSec & Cloud Security](#96-appsec--cloud-security)
- [10) Regulatory & Compliance Lens (NIST, ENISA, SAIF)](#10-regulatory--compliance-lens-nist-enisa-saif)
- [11) Security of AI Systems](#11-security-of-ai-systems)
- [12) When NOT to Use AI](#12-when-not-to-use-ai)
- [13) 30/60/90 Rollout Plan (Team or Lab)](#136090-rollout-plan-team-or-lab)
- [14) Case Studies](#14-case-studies)
  - [14.1 Phishing Triage End-to-End](#141-phishing-triage-end-to-end)
  - [14.2 Detection from Hypothesis → Sigma/KQL → Tests → Rollout](#142-detection-from-hypothesis--sigmakql--tests--rollout)
- [Appendix A: Redaction Helpers (Bash/Python)](#appendix-a-redaction-helpers-bashpython)
- [Appendix B: Thin RAG Pipeline Example (Python)](#appendix-b-thin-rag-pipeline-example-python)
- [Appendix C: Prompt Registry (YAML Example)](#appendix-c-prompt-registry-yaml-example)
- [Appendix D: One-Page AI Use Policy Starter](#appendix-d-one-page-ai-use-policy-starter)
- [Appendix E: Evaluation Checklist (One-Pager)](#appendix-e-evaluation-checklist-one-pager)
- [Appendix F: Traditional ML for SOC (Metrics & Baselines)](#appendix-f-traditional-ml-for-soc-metrics--baselines)
- [Further Reading & Videos](#further-reading--videos)

<!--more-->

---

<h2 id="1-scope-what-ai-means-here">1) Scope: What “AI” Means Here</h2>

We focus on **language-model–driven assistants** for security work (LLMs & tool-using agents) and supporting components:

- **LLM + Tools**: natural language → code/queries/config; integrates with retrieval, browsers, scripts.
- **Retrieval**: vector search over your own playbooks, detections, tickets, IR reports, policy.
- **Guardrails**: content filters, schema validation, policy enforcers.
- **Traditional ML**: anomaly detection, clustering, supervised classifiers for phishing/TTPs.

AI here is **assistive**, not autonomous. Human review and tests are non-negotiable.

---

<h2 id="2-capability-map-where-ai-helps-most">2) Capability Map: Where AI Helps Most</h2>

<div class="table-scroll md-table" markdown="1">

| Function | High-Value Tasks | Example Outputs | Constraints |
|---|---|---|---|
| **SOC** | Alert summarization, duplicate clustering, triage scaffolding | Executive summaries, IOC tables, validation queries | Must be grounded in alert facts; no auto-remediation |
| **Threat Intel** | OSINT digestion, campaign timelines, CVE diffs | One-page briefs with citations, TTP mappings | Cite sources; avoid hallucinated indicators |
| **Detection Eng.** | Draft Sigma/KQL/YARA, unit tests, FP analysis | Rule skeleton + test events | Validate on real telemetry; staged rollout |
| **IR** | Timeline reconstruction, artifact checklists | Structured IR reports | Keep PII out; chain-of-custody intact |
| **GRC** | Control mappings, policy scaffolds, audit prep | One-page policies, gap lists | Legal review mandatory |
| **AppSec/Cloud** | Config linting, IaC review, policy diffs | Remediation PRs, least-privilege policies | Require guardrails; never auto-merge |
| **Education** | Socratic explanations, quizzes, labs | 30/60/90 study plan | Use public/sanitized datasets only |

</div>

---

<h2 id="3-learning-vs-work-how-ai-changes-the-curve">3) Learning vs. Work: How AI Changes the Curve</h2>

<div class="table-scroll md-table" markdown="1">

| Dimension | Without AI | With AI (good practice) | With AI (bad practice) |
|---|---|---|---|
| **Skill acquisition** | Slow, linear | Faster iteration via Socratic feedback & micro-labs | Shallow copy-paste, fragile knowledge |
| **Reading volume** | High | Curated summaries + citations | Echoed misinformation |
| **Practice** | Manual labs, limited feedback | Auto-generated quizzes/tests; synthetic data | No hands-on; illusion of competence |
| **Work delivery** | Templates/manual drafts | Drafts + checklists + unit tests | Unreviewed outputs shipped |
| **Retention** | Medium | Better via spaced repetition, Socratic | Poor; no internalization |

</div>

**Guiding principle:** use AI to **compress uncreative overhead** (boilerplate, summarization, scaffolding), not to replace thinking, testing, or accountability.

---

<h2 id="4-risk-model-how-ai-fails-and-why">4) Risk Model: How AI Fails (and Why)</h2>

- **Hallucination** — plausible fiction  
- **Prompt Injection** — untrusted input subverts instructions  
- **Data Leakage** — secrets/PII pasted into external tools  
- **Over-automation** — unreviewed commands/queries  
- **Model/Content Drift** — outputs change; rules degrade  
- **Supply Chain** — unvetted models, poisoned corpora, malicious extensions

<!-- Inline video: prompt-injection case study -->
<div class="embed-16x9" markdown="0">
  <iframe src="https://www.youtube.com/embed/oql3ec-Ia4I"
          title="DEF CON — Prompt Injection in the Wild"
          allowfullscreen loading="lazy"></iframe>
</div>
<p class="figcap">Prompt injection is not theoretical. Build instruction firewalls and never auto-execute model output.</p>

<div class="callout warn">
Treat AI outputs as drafts. Require <strong>human-in-the-loop</strong> review, test in a lab first, and log prompts/outputs for auditability.
</div>

---

<h2 id="5-data-classes-redaction-and-minimization">5) Data Classes, Redaction, and Minimization</h2>

Before using any AI tool:

1. **Classify**: public / internal / confidential / regulated  
2. **Minimize**: paste only what’s necessary; replace tokens, IPs, emails, hostnames  
3. **Isolate**: prefer enterprise or self-hosted endpoints for non-public data  
4. **Retain evidence**: store prompts/outputs with case IDs and timestamps

Typical “safe-to-share”: public advisories, sanitized snippets, your own prompts, docs without secrets.

---

<h2 id="6-architecture-patterns-for-security-work">6) Architecture Patterns for Security Work</h2>

<h3 id="61-retrieval-augmented-generation-rag-done-right">6.1 Retrieval-Augmented Generation (RAG) done right</h3>

**Goal:** ground the model in your truth (playbooks, rule repos, IR reports) to cut hallucination.

Pipeline:
1. **Ingest** PDFs/MD/HTML → chunks (512–1000 tokens) with metadata (source, section)  
2. **Embed** chunks to vectors  
3. **Index** vectors (vector DB or FAISS)  
4. **Retrieve** top-k + rerank  
5. **Generate** with question + retrieved chunks  
6. **Constrain**: require citations to chunk IDs/URLs; no speculation outside evidence

**Retrieval metrics you should track**
- **Recall@k** (did we fetch gold chunks?), **MRR**, **nDCG**, **Coverage** (% queries with ≥1 good chunk)
- **Faithfulness** (does the answer cite retrieved evidence?) and **Attribution rate**

**Anti-patterns:** uncurated “all-of-Confluence”, >20 long chunks, answering beyond retrieved evidence.

<h3 id="62-guardrails-and-output-controls">6.2 Guardrails and Output Controls</h3>

- **Schema validation**: enforce JSON/YAML for rules/IOCs/checklists  
- **Policy filters**: block secrets (e.g., `AKIA…`), disallow destructive commands  
- **Instruction firewalls**: strip/escape untrusted inputs (defend prompt injection)  
- **Proof-of-Work**: demand test cases & negatives with every rule/query

<h3 id="63-local-vs-saas-models">6.3 Local vs. SaaS Models</h3>

<div class="table-scroll md-table" markdown="1">

| Aspect | Local/On-prem | SaaS/Hosted |
|---|---|---|
| Data residency | Full control | Vendor-dependent |
| Latency/cost | Predictable after setup | Opex; usage-driven |
| Capability | Good for narrow tasks | Often strongest models |
| Governance | End-to-end audit | Contracts/attestations |
| Maintenance | You own updates | Vendor upgrades |

</div>

Start hybrid: SaaS for public/sanitized tasks; local for sensitive retrieval and drafts.

---

<h2 id="7-lmmops-operating-an-ai-assistant-in-the-soc">7) LMMOps: Operating an AI Assistant in the SOC</h2>

- **Version pinning** (model/params), **prompt registry** (as code)  
- **Gold datasets** for triage & detection tasks  
- **Change control**: staged rollout; A/B vs. baseline  
- **Observability**: coverage, latency, retrieval hit-rate, guardrail triggers, error taxonomy  
- **Cost control**: cache embeddings/responses; batch; budget alerts

---

<h2 id="8-evaluation-metrics-and-experiment-design">8) Evaluation: Metrics and Experiment Design</h2>

**Metrics**: Precision, Recall, F1, Latency (p95), Cost (tokens/case), Coverage (% usable outputs), Drift (delta vs. baseline over time)

**Experiment design**
1. Define tasks (e.g., “triage note @SOC”, “Sigma skeleton @detect”)  
2. Build labeled datasets (public/sanitized; include negatives)  
3. Freeze prompts & model versions  
4. Run baseline (human/template)  
5. Compare AI-assisted vs. baseline on metrics + minutes saved  
6. Catalog failure modes; iterate

<div class="callout ok">
Never ship a detection from AI without test data. Require <strong>positive</strong>/<strong>negative</strong> examples, field checks, and staged rollout.
</div>

---

<h2 id="9-role-by-role-playbooks--prompts">9) Role-by-Role Playbooks &amp; Prompts</h2>

<h3 id="91-soc">9.1 SOC</h3>

**Batch triage**
```text
Role: SOC analyst. Summarize these alerts into a triage note:
- Exec summary (3–5 bullets)
- IOC table (IP/domain/hash)
- ATT&CK techniques (IDs only) from evidence
- Validation queries (KQL/Splunk) citing exact field names
Constraints: If a field is missing, say “unknown”. Do not invent indicators.
Input:
{{sanitized_alert_batch}}
````

**De-duplication**

```text
Cluster alerts by {hostname, user, TTP, timeframe ±2h}. Output clusters with rationale and a canonical incident title per cluster.
```

<h3 id="92-threat-intelligence">9.2 Threat Intelligence</h3>

**Campaign brief**

```text
Task: One-page brief:
- Who/What/So What
- TTPs (ATT&CK IDs)
- Affected platforms/products
- Detection hypotheses (plain English)
- 72h defender actions
Grounding: Use only these sources; cite URLs or section IDs.
Sources:
{{urls_or_pasted_excerpts}}
```

<h3 id="93-detection-engineering">9.3 Detection Engineering</h3>

**Hypothesis → rule + tests**

```text
Convert this hypothesis into: (1) Sigma YAML (logsource, selection, condition, FP notes), and (2) KQL.
Also output:
- 3 positive synthetic events
- 3 negative counterexamples
- Required fields and source
Do not invent field names. Ask if missing.
Hypothesis:
{{english_hypothesis}}
```

**Sanity checklist**

```text
Propose field-existence checks, rate limits, and edge cases that could cause false positives. Output as a review checklist.
```

<h3 id="94-incident-response">9.4 Incident Response</h3>

**IR report scaffold**

```text
Role: IR scribe. Turn these notes into a report:
- Executive summary
- Timeline (UTC)
- Impact
- Containment/eradication/recovery
- Lessons learned & action items
Cite note IDs in brackets. Neutral tone.
Input:
{{sanitized_notes}}
```

<h3 id="95-grc--policy">9.5 GRC &amp; Policy</h3>

**One-page policy**

```text
Draft an “AI Use in Security Operations” policy:
Purpose, Scope, Allowed/Forbidden Data, Process (classify→redact→prompt→review→log), Approved Tools, Logging & Retention, Review Cadence, Enforcement.
```

<h3 id="96-appsec--cloud-security">9.6 AppSec &amp; Cloud Security</h3>

**Least-privilege policy diff**

```text
Given current IAM policy JSON and a target least-privilege spec, propose a diff with justification and potential blast radius. Flag wildcard actions.
```

---

<h2 id="10-regulatory--compliance-lens-nist-enisa-saif">10) Regulatory &amp; Compliance Lens (NIST, ENISA, SAIF)</h2>

* **NIST AI RMF 1.0** — map program work to GOVERN / MAP / MEASURE / MANAGE <a href="https://www.nist.gov/video/introduction-nist-ai-risk-management-framework-ai-rmf-10-explainer-video" target="_blank" rel="noopener noreferrer">NIST explainer (video)</a>
* **ENISA** — AI & Cybersecurity research, FAICP practice framing <a href="https://www.enisa.europa.eu/publications/artificial-intelligence-and-cybersecurity-research" target="_blank" rel="noopener noreferrer">ENISA research</a> · <a href="https://www.faicp-framework.com/" target="_blank" rel="noopener noreferrer">FAICP overview</a>
* **Google Secure AI Framework (SAIF)** — pragmatic controls to align with existing SDLC/SecOps <a href="https://cloud.google.com/use-cases/secure-ai-framework" target="_blank" rel="noopener noreferrer">SAIF (overview)</a>

<div class="callout info">
If you already use ISO 27001/SOC 2: map AI controls to existing Annex A controls (asset mgmt, access control, secure development, logging). Keep a single control catalog.
</div>

---

<h2 id="11-security-of-ai-systems">11) Security of AI Systems</h2>

Threats to the assistant itself & mitigations:

* **Prompt Injection** → input sanitization, allowlists, retrieval isolation, tool-use gating
* **Data Poisoning** → doc signing, source allowlists, change review
* **Model/Plugin Supply Chain** → signature verification, SBOM, reproducible builds
* **Model Extraction** → rate limit, watermark, anomaly monitoring
* **Sensitive Outputs** → content filters for secrets/PII, deterministic schemas

---

<h2 id="12-when-not-to-use-ai">12) When NOT to Use AI</h2>

* Handling **sensitive incident data** on non-approved tools
* Auto-executing commands, queries, or playbooks
* Issuing legal/HR/contractual conclusions
* Generating exploit code or bypass techniques
* High-novelty events with scarce ground truth

---

<h2 id="136090-rollout-plan-team-or-lab">13) 30/60/90 Rollout Plan (Team or Lab)</h2>

<div class="table-scroll md-table" markdown="1">

| Phase       | Outcomes                 | Activities                                                                                          | Artifacts                                            |
| ----------- | ------------------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **30 days** | Policy & guardrails live | Approve tools; classify data; redaction helpers; pick 2 workflows (SOC triage, detection skeletons) | Policy 1-pager; prompt registry v0; gold datasets v0 |
| **60 days** | Evaluated pilot          | A/B test vs. baseline; add RAG for playbooks; start metrics (P/R/F1, latency, coverage, cost)       | Pilot report; failure-mode log; updated prompts      |
| **90 days** | Staged adoption          | Staged rollout; training; budget alerts; periodic drift checks                                      | SOPs; dashboards; retraining plan; review cadence    |

</div>

---

<h2 id="14-case-studies">14) Case Studies</h2>

<h3 id="141-phishing-triage-end-to-end">14.1 Phishing Triage End-to-End</h3>

**Goal:** reduce time-to-triage without increasing false positives.

**Inputs (sanitized):**

* Email headers/body (PII masked)
* URL artifacts (defanged)
* Existing IOC lists
* Mail gateway logs

**Workflow:**

1. **LLM Summarization** → extract sender, subject, indicators; label intent (spoofing, credential harvest).
2. **IOC Table** → URLs/domains/ips/hashes with source and confidence.
3. **Detection Hypotheses** → plain English (e.g., “new domain + brand terms + short-lived landing page”).
4. **Validation Queries** → generate KQL/Splunk searches citing fields.
5. **Decision Aid** → risk score with rationale + recommended actions.

**Prompt (drop-in):**

```text
Role: SOC analyst (email security).
Task: Summarize this suspected phishing message. Output:
- 5-bullet executive summary
- IOC table (type,value,first_seen,source,confidence)
- Likely technique (ATT&CK ID) if explicitly supported
- KQL to find siblings in the last 48h (cite exact field names)
Constraints:
- Use only facts from the input; if unknown, say so.
Input:
{{sanitized_email + headers + gateway_snippets}}
```

**Checks before action:**

* Links resolve to known brand impersonation patterns?
* Domain age & reputation?
* Mailbox telemetry for the recipient cohort?
* Manual verification for high-risk accounts.

**KPIs:** median triage time ↓, precision\@top-K, % cases with complete IOC tables.

---

<h3 id="142-detection-from-hypothesis--sigmakql--tests--rollout">14.2 Detection from Hypothesis → Sigma/KQL → Tests → Rollout</h3>

**Hypothesis (English):**
“Alert when `powershell.exe` launches with `-enc` or `-encodedcommand` and network connections follow within 30s from the same PID.”

**LLM Output (expected skeletons):**

* Sigma rule (logsource: Windows process creation + network events)
* KQL with **field existence checks** and **join on PID + time window**
* **3 positive** and **3 negative** synthetic examples
* False-positive notes (admin tools, EDR scripts)

**Sanity Review Checklist:**

* Fields present in your telemetry? (e.g., `ProcessCommandLine`, `InitiatingProcessId`, `RemoteUrl`)
* Time window tuned to infra? (10–60s)
* Rate limits / suppression?
* Known FP sources whitelisted?

**Rollout:** lab test → canary → staged (5–25–100%) → monitor P/R/F1 and alert volume → adjust.

---

<h2 id="appendix-a-redaction-helpers-bashpython">Appendix A: Redaction Helpers (Bash/Python)</h2>

### Bash (sed) — quick masking

```bash
# Mask IPv4 -> 10.0.0.X
sed -E 's/\b([0-9]{1,3}\.){3}[0-9]{1,3}\b/10.0.0.X/g' input.log > redacted.log

# Mask emails -> uX@example.local
sed -E 's/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/uX@example.local/g' -i redacted.log

# Mask hostnames ending in corp/local/internal -> host-XXX
sed -E 's/\b([a-zA-Z0-9-]+)\.(corp|local|internal)\b/host-XXX/g' -i redacted.log
```

### Python — structured redaction with a keeplist

```python
import re, sys, json
keep = set(json.loads(sys.argv[1])) if len(sys.argv) > 1 else set()
text = sys.stdin.read()

def repl_ip(m): return m.group(0) if m.group(0) in keep else "10.0.0.X"
def repl_email(m): return m.group(0) if m.group(0) in keep else "uX@example.local"

text = re.sub(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', repl_ip, text)
text = re.sub(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', repl_email, text)
sys.stdout.write(text)
```

Usage:

```bash
python redact.py '["192.0.2.10","admin@example.com"]' < raw.txt > redacted.txt
```

---

<h2 id="appendix-b-thin-rag-pipeline-example-python">Appendix B: Thin RAG Pipeline Example (Python)</h2>

> Minimal demo with local embeddings and a simple retriever to ground an LLM. Replace `emit()` with your model call; enforce schemas in production.

```python
# rag_min.py
from pathlib import Path
import re
from typing import List, Dict

def chunk(text: str, min_len=300, max_len=1000) -> List[str]:
    paras = [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]
    chunks, buf = [], ""
    for p in paras:
        if len(buf) + len(p) < max_len:
            buf += ("\n\n" if buf else "") + p
        else:
            if len(buf) >= min_len: chunks.append(buf)
            buf = p
    if buf: chunks.append(buf)
    return chunks

def embed(texts: List[str]) -> List[List[float]]:
    # Placeholder embedding: replace with a real model
    return [[(hash(t) % 1000)/1000.0 for _ in range(384)] for t in texts]

def cos(a, b):
    num = sum(x*y for x,y in zip(a,b))
    den = (sum(x*x for x in a)**0.5) * (sum(y*y for y in b)**0.5)
    return num/den if den else 0.0

class Index:
    def __init__(self): self.docs, self.vecs = [], []
    def add(self, doc: Dict): self.docs.append(doc); self.vecs.append(doc["vec"])
    def search(self, qvec, k=4):
        sims = [(i, cos(v, qvec)) for i, v in enumerate(self.vecs)]
        sims.sort(key=lambda x: x[1], reverse=True)
        return [self.docs[i] for i,_ in sims[:k]]

def build_index(paths) -> Index:
    idx = Index()
    for p in paths:
        text = Path(p).read_text(encoding="utf-8", errors="ignore")
        for j, c in enumerate(chunk(text)):
            idx.add({"id": f"{Path(p).name}#{j}", "text": c, "source": str(p), "vec": embed([c])[0]})
    return idx

def emit(question: str, contexts):
    cited = "; ".join(c["id"] for c in contexts)
    return f"ANSWER (grounded on: {cited}):\n- {question}\n- See cited sections."

if __name__ == "__main__":
    corpus = ["playbooks.md","detections.md","ir_report.md"]
    idx = build_index([p for p in corpus if Path(p).exists()])
    question = "Outline containment steps for ransomware on a Windows domain."
    qvec = embed([question])[0]
    top = idx.search(qvec, k=4)
    print(emit(question, top))
```

**Retrieval metrics (toy)**

```python
# Precision@k and MRR for a labeled set of queries -> gold chunk IDs
def precision_at_k(retrieved, gold, k=5):
    return sum(1 for x in retrieved[:k] if x in gold) / k

def mrr(retrieved, gold):
    for i, x in enumerate(retrieved, 1):
        if x in gold: return 1.0 / i
    return 0.0
```

---

<h2 id="appendix-c-prompt-registry-yaml-example">Appendix C: Prompt Registry (YAML Example)</h2>

```yaml
id: soc_triage_v1
owner: secops@suiikawaii.local
model: pinned-model@vX.Y
params: {temperature: 0.2, top_p: 0.9}
inputs:
  - sanitized_alert_batch
guards:
  - schema: triage_note_schema.json
  - no_secrets: true
  - cite_sources: true
prompt: |
  Role: SOC analyst...
  (full prompt from section 9.1)
tests:
  - name: covers_iocs
    input: tests/alerts_sample_01.json
    asserts:
      - path: $.iocs[*].value
        op: exists
  - name: no_guessing
    input: tests/alerts_sample_missing_fields.json
    asserts:
      - path: $.fields_missing
        op: equals
        value: true
changelog:
  - 2025-08-15: initial version
```

---

<h2 id="appendix-d-one-page-ai-use-policy-starter">Appendix D: One-Page AI Use Policy Starter</h2>

```
Title: AI Use in Security Operations
Scope: SOC, TI, Detection Engineering, IR, GRC.

Allowed Data:
- Public advisories, sanitized logs, internal docs without secrets.
Forbidden Data:
- Customer PII, auth secrets, proprietary source, unredacted IR notes.

Process:
1) Classify data → redact/minimize → prompt.
2) Require citations for factual claims.
3) No auto-execution; human review + lab test first.
4) Log prompts/outputs with model+version; retain for audit.
5) Quarterly review of allowed tools, retention, and guardrails.

Approved Tools:
- Enterprise/self-hosted AI with logging and retention controls.
- Public tools only for public/sanitized data.

Enforcement:
- Violations trigger incident handling and access review.
```

---

<h2 id="appendix-e-evaluation-checklist-one-pager">Appendix E: Evaluation Checklist (One-Pager)</h2>

* **Task Definition** — problem, owner, success criteria
* **Dataset** — representative, labeled, sanitized; includes negatives
* **Baselines** — human/template; compare fairly
* **Metrics** — P/R/F1, latency, cost, coverage, retrieval metrics
* **Change Control** — versioned prompts/models; staged rollout; rollback
* **Observability** — logs, error taxonomy, retrieval hit-rate, guardrails
* **Safety** — redaction, no secrets, compliance approvals
* **Sign-off** — named reviewer; re-evaluation cadence

---

<h2 id="appendix-f-traditional-ml-for-soc-metrics--baselines">Appendix F: Traditional ML for SOC (Metrics &amp; Baselines)</h2>

<div class="table-scroll md-table" markdown="1">

| Scenario                      | Good Baselines                        | Key Metrics              | Notes                                         |
| ----------------------------- | ------------------------------------- | ------------------------ | --------------------------------------------- |
| Anomaly detection (auth)      | Isolation Forest, LOF, robust z-score | PR-AUC, alert rate       | Beware base-rate fallacy; evaluate per entity |
| Binary classification (phish) | Logistic Regression, Linear SVM       | Precision\@K, Recall, F1 | Start linear → add features → then deep       |
| Clustering (alert dedup)      | KMeans/DBSCAN                         | Silhouette, spot-check   | Preprocess before LLM summarization           |

</div>

**Python snippets (toy)**

```python
# Isolation Forest on login features
from sklearn.ensemble import IsolationForest
from sklearn.metrics import average_precision_score
X, y = ..., ...
clf = IsolationForest(contamination=0.01, random_state=42).fit(X)
scores = -clf.score_samples(X)
ap = average_precision_score(y, scores)
print(f"PR-AUC: {ap:.3f}")
```

```python
# Precision@K for ranked anomalies
import numpy as np
K = 100
idx = np.argsort(scores)[::-1][:K]
prec_at_k = (y[idx] == 1).mean()
print(f"Precision@{K}: {prec_at_k:.2%}")
```

---

<h2 id="further-reading--videos">Further Reading &amp; Videos</h2>

**Frameworks & official resources**

* NIST AI RMF overview (explainer): <a href="https://www.nist.gov/video/introduction-nist-ai-risk-management-framework-ai-rmf-10-explainer-video" target="_blank" rel="noopener noreferrer">nist.gov/video/introduction-nist-ai-risk-management-framework</a>
* Google Secure AI Framework (SAIF): <a href="https://cloud.google.com/use-cases/secure-ai-framework" target="_blank" rel="noopener noreferrer">cloud.google.com/use-cases/secure-ai-framework</a>
* ENISA — AI & Cybersecurity Research: <a href="https://www.enisa.europa.eu/publications/artificial-intelligence-and-cybersecurity-research" target="_blank" rel="noopener noreferrer">enisa.europa.eu/publications/artificial-intelligence-and-cybersecurity-research</a>
* ENISA — FAICP (overview): <a href="https://www.faicp-framework.com/" target="_blank" rel="noopener noreferrer">faicp-framework.com</a>

**Talks & videos (curated)**

* <a href="https://www.youtube.com/watch?v=GJMevKox_Q8" target="_blank" rel="noopener noreferrer">AI in cybersecurity: Pros and cons explained</a> — balanced overview for execs and newcomers
* <a href="https://www.youtube.com/watch?v=xOQW_qMZdlc&list=PLdw2bVqUvsk3C_IFblL7yXXlqY8HBOu6h&index=1" target="_blank" rel="noopener noreferrer">AI Model Penetration: Testing LLMs for Prompt Injection & Jailbreaks</a> — hands-on risks and test ideas
* <a href="https://www.youtube.com/watch?v=i-Cy3SDxLzM" target="_blank" rel="noopener noreferrer">AI is coming for YOUR cyber job</a> — career discussion; pair with our 30/60/90 plan
* <a href="https://www.youtube.com/watch?v=qVET1vD3NtQ" target="_blank" rel="noopener noreferrer">Cybersecurity in the age of AI — TEDx (Adi Irani)</a> — high-level narrative and ethics
* <a href="https://www.youtube.com/watch?v=eUY9i1CWmUg" target="_blank" rel="noopener noreferrer">RAG Patterns (InfoQ)</a> — retrieval do’s and don’ts
* <a href="https://www.youtube.com/watch?v=rhVKGkCVRiE" target="_blank" rel="noopener noreferrer">RAG LLMs Are Not Safe</a> — safety pitfalls & countermeasures
* <a href="https://www.youtube.com/watch?v=utcYsBKL7e8" target="_blank" rel="noopener noreferrer">How AI Can Accelerate Cybersecurity</a> — the talk we embedded up top
* <a href="https://www.youtube.com/watch?v=3D6gaawXwfk" target="_blank" rel="noopener noreferrer">Using AI to become a Hacker</a> — entertaining; keep a policy lens
* <a href="https://www.youtube.com/watch?v=meWsngooexo" target="_blank" rel="noopener noreferrer">How ChatGPT Transformed Me into a God-Tier Hacker!</a> — mindset debate, not for process

**Keep learning**

* <a href="/posts/mastering-linux-for-cybersecurity/" target="_blank" rel="noopener noreferrer">Mastering Linux for Cybersecurity</a>
* <a href="/posts/home-cyber-lab/" target="_blank" rel="noopener noreferrer">Build a Home Cybersecurity Lab</a>
* <a href="/posts/wsl-linux-starter/" target="_blank" rel="noopener noreferrer">Learn Linux with WSL</a>

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})