#!/usr/bin/env python3
"""
cc-inspect: Claude Code session analysis — zero LLM by default, opt-in two-pass AI.

Parses ~/.claude/projects/**/*.jsonl session logs and produces
markdown reports with date-range filtering and toggleable sections.

Pass 1 (opt-in): Haiku extracts structured facets per session (cached).
Pass 2 (opt-in): Sonnet/Opus synthesizes narrative insights across all facets.

Usage:
    cc-inspect                              # Last 30 days, all sections, no LLM
    cc-inspect --from 2026-03-01            # Date filter
    cc-inspect --sections tools,tokens      # Only specific sections
    cc-inspect --llm                        # Enable both LLM passes
    cc-inspect --extract-only               # Just extract facets (Haiku), cache them
    cc-inspect --synthesize-only            # Just synthesize from cached facets
    cc-inspect --extract-model claude-haiku-4-5-20251001
    cc-inspect --synthesis-model claude-sonnet-4-20250514
    cc-inspect --list-sections              # Show available sections
    cc-inspect -o report.md                 # Write to file
    cc-inspect --top 20                     # Top-N for ranked lists
    cc-inspect --project myapp              # Filter to project substring
    cc-inspect --json                       # Raw session data as JSON
"""

import argparse
import hashlib
import json
import os
import sys
import urllib.request
import urllib.error
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional


# ============================================================================
# Session data model
# ============================================================================

EXTENSION_TO_LANGUAGE = {
    ".ts": "TypeScript", ".tsx": "TypeScript",
    ".js": "JavaScript", ".jsx": "JavaScript",
    ".py": "Python", ".rb": "Ruby", ".go": "Go", ".rs": "Rust",
    ".java": "Java", ".kt": "Kotlin", ".swift": "Swift",
    ".c": "C", ".cpp": "C++", ".h": "C/C++",
    ".cs": "C#", ".php": "PHP", ".scala": "Scala",
    ".html": "HTML", ".css": "CSS", ".scss": "CSS",
    ".sql": "SQL", ".sh": "Shell", ".bash": "Shell",
    ".yml": "YAML", ".yaml": "YAML", ".toml": "TOML",
    ".json": "JSON", ".md": "Markdown", ".mdx": "Markdown",
    ".r": "R", ".jl": "Julia", ".lua": "Lua",
    ".zig": "Zig", ".nim": "Nim", ".ex": "Elixir",
    ".erl": "Erlang", ".hs": "Haskell", ".ml": "OCaml",
    ".vue": "Vue", ".svelte": "Svelte",
}


@dataclass
class SessionMeta:
    session_id: str
    project_path: str = ""
    start_time: str = ""
    end_time: str = ""
    duration_minutes: float = 0
    user_messages: int = 0
    assistant_messages: int = 0
    tool_counts: dict = field(default_factory=dict)
    tool_errors: int = 0
    tool_error_types: dict = field(default_factory=dict)
    languages: dict = field(default_factory=dict)
    files_touched: set = field(default_factory=set)
    git_commits: int = 0
    git_pushes: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0
    cache_creation_tokens: int = 0
    first_prompt: str = ""
    message_hours: list = field(default_factory=list)
    user_timestamps: list = field(default_factory=list)
    user_interruptions: int = 0
    uses_mcp: bool = False
    uses_task_agent: bool = False
    slash_commands: dict = field(default_factory=dict)
    models_used: dict = field(default_factory=dict)
    lines_added: int = 0
    lines_removed: int = 0
    is_coordinator: bool = False
    git_branch: str = ""
    entry_point: str = ""
    # Raw messages kept for LLM transcript formatting
    _raw_messages: list = field(default_factory=list, repr=False)


@dataclass
class SessionFacets:
    session_id: str
    underlying_goal: str = ""
    goal_categories: dict = field(default_factory=dict)
    outcome: str = ""
    user_satisfaction_counts: dict = field(default_factory=dict)
    claude_helpfulness: str = ""
    session_type: str = ""
    friction_counts: dict = field(default_factory=dict)
    friction_detail: str = ""
    primary_success: str = ""
    brief_summary: str = ""
    user_instructions_to_claude: list = field(default_factory=list)


# ============================================================================
# JSONL Parsing
# ============================================================================

def get_claude_home() -> Path:
    config_dir = os.environ.get("CLAUDE_CONFIG_DIR")
    if config_dir:
        return Path(config_dir)
    return Path.home() / ".claude"


def get_projects_dir() -> Path:
    return get_claude_home() / "projects"


def get_facets_dir() -> Path:
    d = get_claude_home() / "cc-inspect" / "facets"
    d.mkdir(parents=True, exist_ok=True)
    return d


def iter_session_files(projects_dir: Path):
    if not projects_dir.exists():
        return
    for project_dir in projects_dir.iterdir():
        if not project_dir.is_dir():
            continue
        for jsonl_file in project_dir.glob("*.jsonl"):
            yield project_dir.name, jsonl_file


def parse_session(path: Path) -> list[dict]:
    messages = []
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    msg = json.loads(line)
                    messages.append(msg)
                except json.JSONDecodeError:
                    continue
    except (OSError, PermissionError):
        pass
    return messages


def extract_tool_name(block: dict) -> Optional[str]:
    if block.get("type") == "tool_use":
        return block.get("name")
    return None


def extract_file_paths(block: dict) -> list[str]:
    paths = []
    inp = block.get("input", {})
    if not isinstance(inp, dict):
        return paths
    for key in ("file_path", "path", "filePath", "file"):
        val = inp.get(key)
        if isinstance(val, str) and val:
            paths.append(val)
    cmd = inp.get("command", "")
    if isinstance(cmd, str):
        for token in cmd.split():
            if "/" in token and not token.startswith("-"):
                if any(token.endswith(ext) for ext in EXTENSION_TO_LANGUAGE):
                    paths.append(token)
    return paths


def language_from_path(path: str) -> Optional[str]:
    ext = Path(path).suffix.lower()
    return EXTENSION_TO_LANGUAGE.get(ext)


def extract_session_meta(project_name: str, messages: list[dict], keep_raw: bool = False) -> Optional[SessionMeta]:
    if not messages:
        return None

    session_id = None
    for msg in messages[:5]:
        sid = msg.get("sessionId")
        if sid:
            session_id = sid
            break
    if not session_id:
        session_id = f"unknown-{hash(str(messages[0].get('timestamp', '')))}"

    meta = SessionMeta(session_id=session_id)
    meta.project_path = project_name
    if keep_raw:
        meta._raw_messages = messages

    timestamps = []
    user_ts = []

    for msg in messages:
        ts_str = msg.get("timestamp", "")
        msg_type = msg.get("type", "")

        ts = None
        if ts_str:
            try:
                ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                timestamps.append(ts)
            except (ValueError, TypeError):
                pass

        if not meta.entry_point and msg.get("entrypoint"):
            meta.entry_point = msg["entrypoint"]
        if msg.get("gitBranch"):
            meta.git_branch = msg["gitBranch"]

        if msg_type == "user":
            meta.user_messages += 1
            if ts:
                user_ts.append(ts)
                meta.message_hours.append(ts.hour)

            content = msg.get("message", {})
            if isinstance(content, dict):
                content = content.get("content", "")
            if isinstance(content, str) and not meta.first_prompt:
                meta.first_prompt = content[:200]
            elif isinstance(content, list) and not meta.first_prompt:
                for block in content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        meta.first_prompt = str(block.get("text", ""))[:200]
                        break

            if isinstance(content, str) and content.startswith("/"):
                cmd = content.split()[0] if content.split() else content
                meta.slash_commands[cmd] = meta.slash_commands.get(cmd, 0) + 1

        elif msg_type == "assistant":
            meta.assistant_messages += 1
            assistant_msg = msg.get("message", {})
            if isinstance(assistant_msg, dict):
                model = assistant_msg.get("model", "")
                if model:
                    meta.models_used[model] = meta.models_used.get(model, 0) + 1
                usage = assistant_msg.get("usage", {})
                if isinstance(usage, dict):
                    meta.input_tokens += usage.get("input_tokens", 0)
                    meta.output_tokens += usage.get("output_tokens", 0)
                    meta.cache_read_tokens += usage.get("cache_read_input_tokens", 0)
                    meta.cache_creation_tokens += usage.get("cache_creation_input_tokens", 0)

                content_blocks = assistant_msg.get("content", [])
                if isinstance(content_blocks, list):
                    for block in content_blocks:
                        if not isinstance(block, dict):
                            continue
                        tool_name = extract_tool_name(block)
                        if tool_name:
                            meta.tool_counts[tool_name] = meta.tool_counts.get(tool_name, 0) + 1
                            if tool_name.startswith("mcp__"):
                                meta.uses_mcp = True
                            if tool_name in ("Agent", "Task", "task"):
                                meta.uses_task_agent = True
                            inp = block.get("input", {})
                            if isinstance(inp, dict):
                                cmd = inp.get("command", "")
                                if isinstance(cmd, str):
                                    if "git commit" in cmd or "git -c" in cmd:
                                        meta.git_commits += 1
                                    if "git push" in cmd:
                                        meta.git_pushes += 1
                            for fp in extract_file_paths(block):
                                meta.files_touched.add(fp)
                                lang = language_from_path(fp)
                                if lang:
                                    meta.languages[lang] = meta.languages.get(lang, 0) + 1

        if msg_type == "user":
            content = msg.get("message", {})
            if isinstance(content, dict):
                content = content.get("content", [])
            if isinstance(content, list):
                for block in content:
                    if isinstance(block, dict) and block.get("type") == "tool_result":
                        if block.get("is_error"):
                            meta.tool_errors += 1
                            err_content = block.get("content", "")
                            if isinstance(err_content, list):
                                err_content = " ".join(
                                    b.get("text", "") for b in err_content if isinstance(b, dict)
                                )
                            err_str = str(err_content)[:200].lower()
                            if "permission" in err_str or "denied" in err_str:
                                cat = "Permission Denied"
                            elif "not found" in err_str or "no such file" in err_str:
                                cat = "Not Found"
                            elif "timeout" in err_str:
                                cat = "Timeout"
                            elif "command failed" in err_str or "exit code" in err_str:
                                cat = "Command Failed"
                            elif "syntax" in err_str or "parse" in err_str:
                                cat = "Syntax Error"
                            else:
                                cat = "Other"
                            meta.tool_error_types[cat] = meta.tool_error_types.get(cat, 0) + 1

    if timestamps:
        meta.start_time = timestamps[0].isoformat()
        meta.end_time = timestamps[-1].isoformat()
        meta.duration_minutes = (timestamps[-1] - timestamps[0]).total_seconds() / 60

    meta.user_timestamps = [t.isoformat() for t in user_ts]

    for i in range(1, len(user_ts)):
        delta = (user_ts[i] - user_ts[i - 1]).total_seconds()
        if delta < 3:
            meta.user_interruptions += 1

    return meta


# ============================================================================
# Date filtering
# ============================================================================

def parse_date(s: str) -> datetime:
    return datetime.strptime(s, "%Y-%m-%d").replace(tzinfo=timezone.utc)


def session_in_range(meta: SessionMeta, start: Optional[datetime], end: Optional[datetime]) -> bool:
    if not meta.start_time:
        return False
    try:
        session_start = datetime.fromisoformat(meta.start_time.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return False
    if start and session_start < start:
        return False
    if end and session_start > end:
        return False
    return True


# ============================================================================
# Multi-clauding detection
# ============================================================================

def detect_multi_clauding(sessions: list[SessionMeta]) -> dict:
    intervals = []
    for s in sessions:
        if s.start_time and s.end_time:
            try:
                t0 = datetime.fromisoformat(s.start_time.replace("Z", "+00:00"))
                t1 = datetime.fromisoformat(s.end_time.replace("Z", "+00:00"))
                intervals.append((t0, t1, s.session_id))
            except (ValueError, TypeError):
                continue
    intervals.sort(key=lambda x: x[0])
    overlap_events = 0
    sessions_involved = set()
    for i in range(len(intervals)):
        for j in range(i + 1, len(intervals)):
            if intervals[j][0] < intervals[i][1]:
                overlap_events += 1
                sessions_involved.add(intervals[i][2])
                sessions_involved.add(intervals[j][2])
            else:
                break
    return {"overlap_events": overlap_events, "sessions_involved": len(sessions_involved)}


# ============================================================================
# LLM API (zero dependencies — stdlib urllib only)
# ============================================================================

DEFAULT_EXTRACT_MODEL = "claude-haiku-4-5-20251001"
DEFAULT_SYNTHESIS_MODEL = "claude-sonnet-4-20250514"
API_URL = "https://api.anthropic.com/v1/messages"


def get_api_key() -> Optional[str]:
    """Resolve API key from env or Claude Code's config."""
    for var in ("ANTHROPIC_API_KEY", "API_KEY"):
        key = os.environ.get(var)
        if key:
            return key
    # Try Claude Code's stored key
    key_path = get_claude_home() / ".credentials"
    if key_path.exists():
        try:
            creds = json.loads(key_path.read_text())
            return creds.get("apiKey") or creds.get("claudeAiOauth", {}).get("accessToken")
        except (json.JSONDecodeError, OSError):
            pass
    return None


def call_api(
    prompt: str,
    model: str,
    api_key: str,
    system: str = "",
    max_tokens: int = 4096,
    temperature: float = 0.0,
) -> Optional[str]:
    """Call Anthropic Messages API. Returns text content or None."""
    body = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }
    if system:
        body["system"] = system
    if temperature > 0:
        body["temperature"] = temperature

    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            texts = []
            for block in result.get("content", []):
                if block.get("type") == "text":
                    texts.append(block["text"])
            return "\n".join(texts) if texts else None
    except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, TimeoutError) as e:
        print(f"  API error: {e}", file=sys.stderr)
        return None


# ============================================================================
# Pass 1: Facet extraction (Haiku, per-session, cached)
# ============================================================================

FACET_EXTRACTION_PROMPT = """Analyze this Claude Code session and extract structured facets.

GUIDELINES:
1. goal_categories: Count ONLY what the USER explicitly asked for.
   DO NOT count Claude's autonomous exploration or self-initiated work.
2. user_satisfaction_counts: Base ONLY on explicit user signals.
   "great!", "perfect!" → happy | "thanks", "looks good" → satisfied
   "ok, now let's..." → likely_satisfied | "that's not right" → dissatisfied
   "this is broken", "I give up" → frustrated
3. friction_counts: Be specific.
   misunderstood_request | wrong_approach | buggy_code | user_rejected_action | excessive_changes
4. user_instructions_to_claude: Capture any explicit standing instructions
   the user gave (e.g., "always run tests", "use TypeScript", "don't modify X").
5. If very short or just warmup, use warmup_minimal for goal_category.

SESSION:
{transcript}

RESPOND WITH ONLY A VALID JSON OBJECT:
{{
  "underlying_goal": "What the user fundamentally wanted to achieve",
  "goal_categories": {{"category_name": count}},
  "outcome": "fully_achieved|mostly_achieved|partially_achieved|not_achieved|unclear",
  "user_satisfaction_counts": {{"level": count}},
  "claude_helpfulness": "unhelpful|slightly_helpful|moderately_helpful|very_helpful|essential",
  "session_type": "single_task|multi_task|iterative_refinement|exploration|quick_question",
  "friction_counts": {{"type": count}},
  "friction_detail": "One sentence describing friction, or empty string",
  "primary_success": "none|fast_accurate_search|correct_code_edits|good_explanations|proactive_help|multi_file_changes|good_debugging",
  "brief_summary": "One sentence: what user wanted and whether they got it",
  "user_instructions_to_claude": ["instruction1", "instruction2"]
}}"""


def format_transcript(messages: list[dict], max_chars: int = 30000) -> str:
    """Format raw messages into a compact transcript for LLM consumption."""
    lines = []
    char_count = 0

    for msg in messages:
        msg_type = msg.get("type", "")

        if msg_type == "user":
            content = msg.get("message", {})
            if isinstance(content, dict):
                content = content.get("content", "")
            if isinstance(content, str):
                text = content[:500]
                lines.append(f"[User]: {text}")
            elif isinstance(content, list):
                for block in content:
                    if isinstance(block, dict):
                        if block.get("type") == "text":
                            lines.append(f"[User]: {str(block.get('text', ''))[:500]}")
                        elif block.get("type") == "tool_result":
                            if block.get("is_error"):
                                err = str(block.get("content", ""))[:200]
                                lines.append(f"[Tool Error]: {err}")

        elif msg_type == "assistant":
            assistant_msg = msg.get("message", {})
            if isinstance(assistant_msg, dict):
                for block in assistant_msg.get("content", []):
                    if not isinstance(block, dict):
                        continue
                    if block.get("type") == "text":
                        lines.append(f"[Assistant]: {str(block.get('text', ''))[:300]}")
                    elif block.get("type") == "tool_use":
                        name = block.get("name", "?")
                        inp = block.get("input", {})
                        # Show key input parameters compactly
                        if isinstance(inp, dict):
                            compact = {}
                            for k in ("command", "file_path", "path", "query", "regex"):
                                if k in inp:
                                    compact[k] = str(inp[k])[:120]
                            if compact:
                                lines.append(f"[Tool: {name}] {json.dumps(compact)}")
                            else:
                                lines.append(f"[Tool: {name}]")
                        else:
                            lines.append(f"[Tool: {name}]")

        char_count = sum(len(l) for l in lines)
        if char_count > max_chars:
            lines.append("[... transcript truncated ...]")
            break

    return "\n".join(lines)


def load_cached_facets(session_id: str) -> Optional[SessionFacets]:
    path = get_facets_dir() / f"{session_id}.json"
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text())
        return SessionFacets(session_id=session_id, **{
            k: v for k, v in data.items() if k != "session_id" and k in SessionFacets.__dataclass_fields__
        })
    except (json.JSONDecodeError, OSError, TypeError):
        return None


def save_facets(facets: SessionFacets):
    import dataclasses
    path = get_facets_dir() / f"{facets.session_id}.json"
    data = dataclasses.asdict(facets)
    path.write_text(json.dumps(data, indent=2))


def extract_facets_for_session(
    meta: SessionMeta,
    model: str,
    api_key: str,
) -> Optional[SessionFacets]:
    """Extract facets for one session. Returns None on failure."""
    # Check cache first
    cached = load_cached_facets(meta.session_id)
    if cached:
        return cached

    if not meta._raw_messages:
        return None

    transcript = format_transcript(meta._raw_messages)
    if len(transcript) < 50:
        return None

    prompt = FACET_EXTRACTION_PROMPT.format(transcript=transcript)
    response = call_api(prompt, model=model, api_key=api_key, max_tokens=2048)
    if not response:
        return None

    # Extract JSON from response
    import re
    json_match = re.search(r"\{[\s\S]*\}", response)
    if not json_match:
        return None

    try:
        parsed = json.loads(json_match.group())
    except json.JSONDecodeError:
        return None

    # Validate minimum fields
    if not isinstance(parsed.get("brief_summary"), str):
        return None

    facets = SessionFacets(
        session_id=meta.session_id,
        underlying_goal=parsed.get("underlying_goal", ""),
        goal_categories=parsed.get("goal_categories", {}),
        outcome=parsed.get("outcome", ""),
        user_satisfaction_counts=parsed.get("user_satisfaction_counts", {}),
        claude_helpfulness=parsed.get("claude_helpfulness", ""),
        session_type=parsed.get("session_type", ""),
        friction_counts=parsed.get("friction_counts", {}),
        friction_detail=parsed.get("friction_detail", ""),
        primary_success=parsed.get("primary_success", ""),
        brief_summary=parsed.get("brief_summary", ""),
        user_instructions_to_claude=parsed.get("user_instructions_to_claude", []),
    )
    save_facets(facets)
    return facets


def run_extraction_pass(
    sessions: list[SessionMeta],
    model: str,
    api_key: str,
    max_concurrent: int = 10,
    max_sessions: int = 100,
) -> dict[str, SessionFacets]:
    """Pass 1: Extract facets for all sessions using Haiku."""
    facets = {}

    # Load cached first
    to_extract = []
    for s in sessions[:max_sessions]:
        cached = load_cached_facets(s.session_id)
        if cached:
            facets[s.session_id] = cached
        elif s._raw_messages and s.user_messages >= 2:
            to_extract.append(s)

    cached_count = len(facets)
    if cached_count:
        print(f"  {cached_count} sessions already cached.", file=sys.stderr)

    if not to_extract:
        print(f"  Nothing new to extract.", file=sys.stderr)
        return facets

    print(f"  Extracting facets for {len(to_extract)} sessions with {model}...", file=sys.stderr)

    # Parallel extraction
    completed = 0
    failed = 0
    with ThreadPoolExecutor(max_workers=max_concurrent) as pool:
        futures = {
            pool.submit(extract_facets_for_session, s, model, api_key): s.session_id
            for s in to_extract
        }
        for future in as_completed(futures):
            sid = futures[future]
            try:
                result = future.result()
                if result:
                    facets[sid] = result
                    completed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"  Error extracting {sid[:12]}: {e}", file=sys.stderr)
                failed += 1

            # Progress
            total_done = completed + failed
            if total_done % 10 == 0 or total_done == len(to_extract):
                print(f"  [{total_done}/{len(to_extract)}] {completed} ok, {failed} failed", file=sys.stderr)

    return facets


# ============================================================================
# Pass 2: Synthesis (Sonnet/Opus, one call)
# ============================================================================

SYNTHESIS_PROMPT = """You are analyzing a developer's Claude Code usage patterns.
Below is quantitative data + qualitative facets extracted from their sessions.

Produce a markdown report with EXACTLY these sections (use ## headers):

## Interaction Style
2-3 paragraphs. How does this developer work with Claude? Do they give detailed specs
or iterate quickly? Do they interrupt often? Use second person ("you").

## What's Working Well
3-4 bullet points of impressive workflows or effective patterns. Be specific.

## Friction Points
3-4 bullet points of recurring issues. For each: what goes wrong, why it matters,
what to try differently. Reference specific patterns from the data.

## CLAUDE.md Suggestions
3-5 concrete lines to add to CLAUDE.md based on instructions the user repeats
across sessions. Format as fenced code blocks. Only suggest things with evidence
from multiple sessions.

## Suggestions
2-3 specific workflow improvements based on the data. Include concrete commands
or configurations to try.

Be direct. No filler. Reference specific numbers and patterns from the data.

DATA:
{data_context}

SESSION SUMMARIES:
{facet_summaries}

FRICTION DETAILS:
{friction_details}

USER INSTRUCTIONS TO CLAUDE:
{user_instructions}"""


def run_synthesis_pass(
    sessions: list[SessionMeta],
    facets: dict[str, SessionFacets],
    model: str,
    api_key: str,
) -> Optional[str]:
    """Pass 2: One synthesis call producing markdown."""
    if not facets:
        print("  No facets available for synthesis.", file=sys.stderr)
        return None

    # Build quantitative context
    total_messages = sum(s.user_messages + s.assistant_messages for s in sessions)
    total_duration = sum(s.duration_minutes for s in sessions)
    tool_totals = Counter()
    lang_totals = Counter()
    for s in sessions:
        tool_totals.update(s.tool_counts)
        lang_totals.update(s.languages)

    # Aggregate facet data
    goal_totals = Counter()
    outcome_totals = Counter()
    satisfaction_totals = Counter()
    friction_totals = Counter()
    helpfulness_totals = Counter()
    session_type_totals = Counter()
    for f in facets.values():
        for k, v in f.goal_categories.items():
            goal_totals[k] += v
        outcome_totals[f.outcome] += 1
        for k, v in f.user_satisfaction_counts.items():
            satisfaction_totals[k] += v
        for k, v in f.friction_counts.items():
            friction_totals[k] += v
        helpfulness_totals[f.claude_helpfulness] += 1
        session_type_totals[f.session_type] += 1

    data_context = json.dumps({
        "sessions": len(sessions),
        "analyzed_with_facets": len(facets),
        "total_messages": total_messages,
        "total_hours": round(total_duration / 60, 1),
        "git_commits": sum(s.git_commits for s in sessions),
        "top_tools": tool_totals.most_common(10),
        "languages": lang_totals.most_common(10),
        "goal_categories": goal_totals.most_common(10),
        "outcomes": dict(outcome_totals),
        "satisfaction": dict(satisfaction_totals),
        "friction_types": dict(friction_totals),
        "helpfulness": dict(helpfulness_totals),
        "session_types": dict(session_type_totals),
    }, indent=2)

    facet_summaries = "\n".join(
        f"- {f.brief_summary} ({f.outcome}, {f.claude_helpfulness})"
        for f in list(facets.values())[:50]
    )

    friction_details = "\n".join(
        f"- {f.friction_detail}"
        for f in facets.values()
        if f.friction_detail
    )[:3000] or "None"

    all_instructions = []
    for f in facets.values():
        all_instructions.extend(f.user_instructions_to_claude or [])
    user_instructions = "\n".join(f"- {i}" for i in all_instructions[:20]) or "None captured"

    prompt = SYNTHESIS_PROMPT.format(
        data_context=data_context,
        facet_summaries=facet_summaries,
        friction_details=friction_details,
        user_instructions=user_instructions,
    )

    print(f"  Running synthesis with {model}...", file=sys.stderr)
    return call_api(prompt, model=model, api_key=api_key, max_tokens=8192, temperature=0.3)


# ============================================================================
# Report sections (quantitative — no LLM)
# ============================================================================

def bar(count: int, max_count: int, width: int = 30) -> str:
    if max_count == 0:
        return ""
    filled = int(count / max_count * width)
    return "█" * filled + "░" * (width - filled)


def fmt_tokens(n: int) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.1f}K"
    return str(n)


def fmt_duration(minutes: float) -> str:
    if minutes >= 60:
        h = int(minutes // 60)
        m = int(minutes % 60)
        return f"{h}h {m}m"
    return f"{int(minutes)}m"


def section_summary(sessions: list[SessionMeta], top_n: int) -> str:
    total_messages = sum(s.user_messages + s.assistant_messages for s in sessions)
    total_duration = sum(s.duration_minutes for s in sessions)
    total_input = sum(s.input_tokens for s in sessions)
    total_output = sum(s.output_tokens for s in sessions)
    total_cache_read = sum(s.cache_read_tokens for s in sessions)
    total_commits = sum(s.git_commits for s in sessions)
    total_files = len(set().union(*(s.files_touched for s in sessions)))

    dates = sorted(s.start_time[:10] for s in sessions if s.start_time)
    unique_days = len(set(dates))
    date_range = f"{dates[0]} → {dates[-1]}" if dates else "unknown"

    eps = Counter()
    for s in sessions:
        eps[s.entry_point or "unknown"] += 1

    lines = [
        "## Summary\n",
        "| Metric | Value |",
        "|--------|-------|",
        f"| Sessions | {len(sessions)} |",
        f"| Date range | {date_range} |",
        f"| Active days | {unique_days} |",
        f"| Total messages | {total_messages:,} |",
        f"| Total duration | {fmt_duration(total_duration)} |",
        f"| Input tokens | {fmt_tokens(total_input)} |",
        f"| Output tokens | {fmt_tokens(total_output)} |",
        f"| Cache read tokens | {fmt_tokens(total_cache_read)} |",
        f"| Git commits | {total_commits} |",
        f"| Files touched | {total_files:,} |",
    ]

    if len(eps) > 1 or (eps and list(eps.keys()) != ["unknown"]):
        lines.append(f"| Entry points | {', '.join(f'{k}: {v}' for k, v in eps.most_common())} |")

    lines.append("")
    return "\n".join(lines)


def section_tools(sessions: list[SessionMeta], top_n: int) -> str:
    totals = Counter()
    for s in sessions:
        totals.update(s.tool_counts)
    if not totals:
        return "## Tools\n\nNo tool usage recorded.\n"
    max_count = totals.most_common(1)[0][1]
    lines = ["## Tools\n", "| Tool | Count | |", "|------|------:|---|"]
    for tool, count in totals.most_common(top_n):
        pct = count / sum(totals.values()) * 100
        lines.append(f"| {tool} | {count:,} | {bar(count, max_count, 20)} {pct:.0f}% |")
    if len(totals) > top_n:
        lines.append(f"\n*({len(totals) - top_n} more tools not shown)*")
    total_errors = sum(s.tool_errors for s in sessions)
    if total_errors:
        error_types = Counter()
        for s in sessions:
            error_types.update(s.tool_error_types)
        lines.append(f"\n### Tool Errors ({total_errors:,} total)\n")
        lines.append("| Category | Count |")
        lines.append("|----------|------:|")
        for cat, count in error_types.most_common():
            lines.append(f"| {cat} | {count:,} |")
    lines.append("")
    return "\n".join(lines)


def section_tokens(sessions: list[SessionMeta], top_n: int) -> str:
    lines = ["## Token Usage\n"]
    total_input = sum(s.input_tokens for s in sessions)
    total_output = sum(s.output_tokens for s in sessions)
    total_cache_read = sum(s.cache_read_tokens for s in sessions)
    total_cache_create = sum(s.cache_creation_tokens for s in sessions)
    total = total_input + total_output
    lines.append("| Category | Tokens | % |")
    lines.append("|----------|-------:|--:|")
    if total > 0:
        lines.append(f"| Input | {fmt_tokens(total_input)} | {total_input/total*100:.0f}% |")
        lines.append(f"| Output | {fmt_tokens(total_output)} | {total_output/total*100:.0f}% |")
    lines.append(f"| Cache reads | {fmt_tokens(total_cache_read)} | — |")
    lines.append(f"| Cache creation | {fmt_tokens(total_cache_create)} | — |")
    if sessions:
        session_totals = sorted([(s.input_tokens + s.output_tokens) for s in sessions], reverse=True)
        avg = sum(session_totals) / len(session_totals)
        median = session_totals[len(session_totals) // 2]
        lines.append(f"\n**Per-session:** avg {fmt_tokens(int(avg))}, median {fmt_tokens(median)}, max {fmt_tokens(session_totals[0])}")
    model_counts = Counter()
    for s in sessions:
        model_counts.update(s.models_used)
    if model_counts:
        lines.append("\n### By Model\n")
        lines.append("| Model | Responses |")
        lines.append("|-------|----------:|")
        for model, count in model_counts.most_common(top_n):
            lines.append(f"| `{model}` | {count:,} |")
    lines.append("")
    return "\n".join(lines)


def section_languages(sessions: list[SessionMeta], top_n: int) -> str:
    totals = Counter()
    for s in sessions:
        totals.update(s.languages)
    if not totals:
        return "## Languages\n\nNo language-specific files detected.\n"
    max_count = totals.most_common(1)[0][1]
    lines = ["## Languages\n", "| Language | File Touches | |", "|----------|------------:|---|"]
    for lang, count in totals.most_common(top_n):
        lines.append(f"| {lang} | {count:,} | {bar(count, max_count, 20)} |")
    lines.append("")
    return "\n".join(lines)


def section_projects(sessions: list[SessionMeta], top_n: int) -> str:
    project_sessions = defaultdict(list)
    for s in sessions:
        project_sessions[s.project_path].append(s)
    lines = ["## Projects\n", "| Project | Sessions | Messages | Duration | Tokens |",
             "|---------|--------:|---------:|---------:|-------:|"]
    sorted_projects = sorted(project_sessions.items(), key=lambda x: len(x[1]), reverse=True)
    for proj, proj_sessions in sorted_projects[:top_n]:
        n = len(proj_sessions)
        msgs = sum(s.user_messages + s.assistant_messages for s in proj_sessions)
        dur = sum(s.duration_minutes for s in proj_sessions)
        tok = sum(s.input_tokens + s.output_tokens for s in proj_sessions)
        display = proj[:40] + "…" if len(proj) > 40 else proj
        lines.append(f"| `{display}` | {n} | {msgs:,} | {fmt_duration(dur)} | {fmt_tokens(tok)} |")
    if len(project_sessions) > top_n:
        lines.append(f"\n*({len(project_sessions) - top_n} more projects)*")
    lines.append("")
    return "\n".join(lines)


def section_time(sessions: list[SessionMeta], top_n: int) -> str:
    lines = ["## Time Patterns\n"]
    hour_counts = Counter()
    for s in sessions:
        for h in s.message_hours:
            hour_counts[h] += 1
    if hour_counts:
        max_h = max(hour_counts.values())
        lines.append("### Messages by Hour\n")
        lines.append("```")
        for h in range(24):
            count = hour_counts.get(h, 0)
            bar_str = "█" * int(count / max(max_h, 1) * 40) if count else ""
            lines.append(f"  {h:02d}:00  {bar_str} {count}")
        lines.append("```\n")
    dow_counts = Counter()
    dow_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for s in sessions:
        if s.start_time:
            try:
                dt = datetime.fromisoformat(s.start_time.replace("Z", "+00:00"))
                dow_counts[dt.weekday()] += 1
            except (ValueError, TypeError):
                pass
    if dow_counts:
        lines.append("### Sessions by Day of Week\n")
        lines.append("| Day | Sessions |")
        lines.append("|-----|--------:|")
        for i in range(7):
            lines.append(f"| {dow_names[i]} | {dow_counts.get(i, 0)} |")
        lines.append("")
    durations = [s.duration_minutes for s in sessions if s.duration_minutes > 0]
    if durations:
        buckets = {"<5m": 0, "5-15m": 0, "15-30m": 0, "30m-1h": 0, "1-2h": 0, ">2h": 0}
        for d in durations:
            if d < 5: buckets["<5m"] += 1
            elif d < 15: buckets["5-15m"] += 1
            elif d < 30: buckets["15-30m"] += 1
            elif d < 60: buckets["30m-1h"] += 1
            elif d < 120: buckets["1-2h"] += 1
            else: buckets[">2h"] += 1
        lines.append("### Session Duration Distribution\n")
        lines.append("| Duration | Sessions |")
        lines.append("|----------|--------:|")
        for label, count in buckets.items():
            lines.append(f"| {label} | {count} |")
        lines.append("")
    return "\n".join(lines)


def section_git(sessions: list[SessionMeta], top_n: int) -> str:
    total_commits = sum(s.git_commits for s in sessions)
    total_pushes = sum(s.git_pushes for s in sessions)
    if total_commits == 0 and total_pushes == 0:
        return "## Git\n\nNo git operations detected.\n"
    lines = ["## Git\n", "| Metric | Count |", "|--------|------:|",
             f"| Commits | {total_commits} |", f"| Pushes | {total_pushes} |"]
    branches = Counter()
    for s in sessions:
        if s.git_branch:
            branches[s.git_branch] += 1
    if branches:
        lines.append(f"\n### Branches ({len(branches)} unique)\n")
        lines.append("| Branch | Sessions |")
        lines.append("|--------|--------:|")
        for branch, count in branches.most_common(top_n):
            lines.append(f"| `{branch}` | {count} |")
    lines.append("")
    return "\n".join(lines)


def section_friction(sessions: list[SessionMeta], top_n: int) -> str:
    lines = ["## Friction Indicators\n"]
    total_errors = sum(s.tool_errors for s in sessions)
    total_interruptions = sum(s.user_interruptions for s in sessions)
    lines.append("| Metric | Count |")
    lines.append("|--------|------:|")
    lines.append(f"| Tool errors | {total_errors:,} |")
    lines.append(f"| User interruptions (<3s gap) | {total_interruptions:,} |")
    error_sessions = [(s, s.tool_errors) for s in sessions if s.tool_errors > 2]
    error_sessions.sort(key=lambda x: x[1], reverse=True)
    if error_sessions:
        lines.append(f"\n### High-Error Sessions\n")
        lines.append("| Session | Errors | First Prompt |")
        lines.append("|---------|-------:|-------------|")
        for s, errs in error_sessions[:top_n]:
            prompt = s.first_prompt[:60].replace("|", "\\|").replace("\n", " ")
            lines.append(f"| `{s.session_id[:12]}…` | {errs} | {prompt} |")
    long_sessions = [(s, s.duration_minutes) for s in sessions if s.duration_minutes > 60]
    long_sessions.sort(key=lambda x: x[1], reverse=True)
    if long_sessions:
        lines.append(f"\n### Long Sessions (>1h)\n")
        lines.append("| Session | Duration | Messages | First Prompt |")
        lines.append("|---------|----------|----------|-------------|")
        for s, dur in long_sessions[:top_n]:
            prompt = s.first_prompt[:50].replace("|", "\\|").replace("\n", " ")
            msgs = s.user_messages + s.assistant_messages
            lines.append(f"| `{s.session_id[:12]}…` | {fmt_duration(dur)} | {msgs} | {prompt} |")
    lines.append("")
    return "\n".join(lines)


def section_commands(sessions: list[SessionMeta], top_n: int) -> str:
    totals = Counter()
    for s in sessions:
        totals.update(s.slash_commands)
    if not totals:
        return "## Slash Commands\n\nNo slash commands detected.\n"
    max_count = totals.most_common(1)[0][1]
    lines = ["## Slash Commands\n", "| Command | Count | |", "|---------|------:|---|"]
    for cmd, count in totals.most_common(top_n):
        lines.append(f"| `{cmd}` | {count:,} | {bar(count, max_count, 20)} |")
    lines.append("")
    return "\n".join(lines)


def section_multi(sessions: list[SessionMeta], top_n: int) -> str:
    result = detect_multi_clauding(sessions)
    lines = ["## Multi-Clauding\n"]
    if result["overlap_events"] == 0:
        lines.append("No overlapping sessions detected.\n")
    else:
        lines.append("| Metric | Value |")
        lines.append("|--------|------:|")
        lines.append(f"| Overlap events | {result['overlap_events']} |")
        lines.append(f"| Sessions involved | {result['sessions_involved']} |")
        lines.append("")
    return "\n".join(lines)


def section_mcp(sessions: list[SessionMeta], top_n: int) -> str:
    mcp_tools = Counter()
    mcp_sessions = 0
    for s in sessions:
        if s.uses_mcp:
            mcp_sessions += 1
        for tool, count in s.tool_counts.items():
            if tool.startswith("mcp__"):
                mcp_tools[tool] += count
    if not mcp_tools:
        return "## MCP\n\nNo MCP tool usage detected.\n"
    lines = [f"## MCP ({mcp_sessions} sessions)\n"]
    servers = defaultdict(Counter)
    for tool, count in mcp_tools.items():
        parts = tool.split("__")
        server = parts[1] if len(parts) > 2 else "unknown"
        tool_name = parts[2] if len(parts) > 2 else tool
        servers[server][tool_name] += count
    for server, tools in sorted(servers.items(), key=lambda x: -sum(x[1].values())):
        total = sum(tools.values())
        lines.append(f"\n### `{server}` ({total:,} calls)\n")
        lines.append("| Tool | Count |")
        lines.append("|------|------:|")
        for tool_name, count in tools.most_common(top_n):
            lines.append(f"| {tool_name} | {count:,} |")
    lines.append("")
    return "\n".join(lines)


def section_facets(sessions: list[SessionMeta], top_n: int, facets: dict[str, SessionFacets] = None) -> str:
    """Aggregated facet data (only available after --llm or --extract-only)."""
    if not facets:
        return "## Facets\n\n*Run with `--llm` or `--extract-only` to generate session facets.*\n"

    lines = ["## Facets\n"]
    lines.append(f"*{len(facets)} sessions analyzed with LLM.*\n")

    # Outcomes
    outcome_counts = Counter(f.outcome for f in facets.values())
    if outcome_counts:
        lines.append("### Outcomes\n")
        lines.append("| Outcome | Count |")
        lines.append("|---------|------:|")
        for outcome, count in outcome_counts.most_common():
            lines.append(f"| {outcome} | {count} |")
        lines.append("")

    # Satisfaction
    sat_counts = Counter()
    for f in facets.values():
        sat_counts.update(f.user_satisfaction_counts)
    if sat_counts:
        lines.append("### Satisfaction Signals\n")
        lines.append("| Level | Count |")
        lines.append("|-------|------:|")
        for level, count in sat_counts.most_common():
            lines.append(f"| {level} | {count} |")
        lines.append("")

    # Friction types
    friction_counts = Counter()
    for f in facets.values():
        friction_counts.update(f.friction_counts)
    if friction_counts:
        lines.append("### Friction Types\n")
        lines.append("| Type | Count |")
        lines.append("|------|------:|")
        for ftype, count in friction_counts.most_common():
            lines.append(f"| {ftype} | {count} |")
        lines.append("")

    # Goal categories
    goal_counts = Counter()
    for f in facets.values():
        goal_counts.update(f.goal_categories)
    if goal_counts:
        lines.append("### Goal Categories\n")
        lines.append("| Category | Count |")
        lines.append("|----------|------:|")
        for cat, count in goal_counts.most_common(top_n):
            lines.append(f"| {cat} | {count} |")
        lines.append("")

    # Helpfulness
    help_counts = Counter(f.claude_helpfulness for f in facets.values())
    if help_counts:
        lines.append("### Claude Helpfulness\n")
        lines.append("| Rating | Count |")
        lines.append("|--------|------:|")
        for rating, count in help_counts.most_common():
            lines.append(f"| {rating} | {count} |")
        lines.append("")

    # User instructions (deduplicated)
    all_instructions = []
    for f in facets.values():
        all_instructions.extend(f.user_instructions_to_claude or [])
    if all_instructions:
        # Simple dedup by normalized text
        seen = set()
        unique = []
        for inst in all_instructions:
            norm = inst.strip().lower()
            if norm not in seen:
                seen.add(norm)
                unique.append(inst)
        if unique:
            lines.append("### Repeated User Instructions\n")
            for inst in unique[:15]:
                lines.append(f"- {inst}")
            lines.append("")

    return "\n".join(lines)


# ============================================================================
# Section registry
# ============================================================================

SECTIONS = {
    "summary":  ("Summary stats",              section_summary),
    "tools":    ("Tool usage breakdown",        section_tools),
    "tokens":   ("Token consumption",           section_tokens),
    "langs":    ("Languages",                   section_languages),
    "projects": ("Project breakdown",           section_projects),
    "time":     ("Time patterns",               section_time),
    "git":      ("Git operations",              section_git),
    "friction": ("Friction indicators",         section_friction),
    "commands": ("Slash commands",              section_commands),
    "multi":    ("Multi-clauding detection",    section_multi),
    "mcp":      ("MCP server usage",            section_mcp),
    "facets":   ("LLM-extracted facets",        section_facets),
}

DEFAULT_SECTIONS = [k for k in SECTIONS if k != "facets"]


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Analyze Claude Code sessions. Zero LLM by default.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--from", dest="from_date", metavar="YYYY-MM-DD",
                        help="Start date (inclusive)")
    parser.add_argument("--to", dest="to_date", metavar="YYYY-MM-DD",
                        help="End date (inclusive, defaults to today)")
    parser.add_argument("--sections", "-s", metavar="LIST",
                        help=f"Comma-separated sections: {','.join(SECTIONS.keys())}")
    parser.add_argument("--list-sections", action="store_true",
                        help="List available sections and exit")
    parser.add_argument("--top", "-n", type=int, default=10,
                        help="Top-N for ranked lists (default: 10)")
    parser.add_argument("--project", "-p", metavar="SUBSTR",
                        help="Filter to project paths containing SUBSTR")
    parser.add_argument("--output", "-o", metavar="FILE",
                        help="Write to file instead of stdout")
    parser.add_argument("--claude-dir", metavar="DIR",
                        help="Override ~/.claude path")
    parser.add_argument("--min-messages", type=int, default=2,
                        help="Min user messages to include (default: 2)")
    parser.add_argument("--json", action="store_true",
                        help="Output raw session data as JSON")

    # LLM pipeline flags
    llm_group = parser.add_argument_group("LLM analysis (opt-in)")
    llm_group.add_argument("--llm", action="store_true",
                           help="Enable both extraction and synthesis passes")
    llm_group.add_argument("--extract-only", action="store_true",
                           help="Run only Pass 1 (facet extraction with Haiku)")
    llm_group.add_argument("--synthesize-only", action="store_true",
                           help="Run only Pass 2 (synthesis from cached facets)")
    llm_group.add_argument("--extract-model", default=DEFAULT_EXTRACT_MODEL,
                           help=f"Model for facet extraction (default: {DEFAULT_EXTRACT_MODEL})")
    llm_group.add_argument("--synthesis-model", default=DEFAULT_SYNTHESIS_MODEL,
                           help=f"Model for synthesis (default: {DEFAULT_SYNTHESIS_MODEL})")
    llm_group.add_argument("--api-key", metavar="KEY",
                           help="Anthropic API key (or set ANTHROPIC_API_KEY)")
    llm_group.add_argument("--max-extract", type=int, default=100,
                           help="Max sessions to extract facets for (default: 100)")
    llm_group.add_argument("--concurrency", type=int, default=10,
                           help="Parallel extraction threads (default: 10)")

    args = parser.parse_args()

    if args.list_sections:
        print("Available sections:\n")
        for key, (desc, _) in SECTIONS.items():
            llm_note = " (requires --llm)" if key == "facets" else ""
            print(f"  {key:12s}  {desc}{llm_note}")
        print(f"\nDefault: {','.join(DEFAULT_SECTIONS)}")
        return

    # Resolve LLM mode
    do_extract = args.llm or args.extract_only
    do_synthesize = args.llm or args.synthesize_only
    need_api = do_extract or do_synthesize

    api_key = None
    if need_api:
        api_key = args.api_key or get_api_key()
        if not api_key:
            print("Error: LLM analysis requires an API key.", file=sys.stderr)
            print("Set ANTHROPIC_API_KEY or use --api-key", file=sys.stderr)
            sys.exit(1)

    # Resolve sections
    if args.sections:
        requested = [s.strip() for s in args.sections.split(",")]
        for s in requested:
            if s not in SECTIONS:
                print(f"Unknown section: {s}", file=sys.stderr)
                print(f"Available: {', '.join(SECTIONS.keys())}", file=sys.stderr)
                sys.exit(1)
        sections = requested
    else:
        sections = list(DEFAULT_SECTIONS)
        if do_extract or do_synthesize:
            sections.append("facets")

    # Resolve dates
    start_date = parse_date(args.from_date) if args.from_date else None
    end_date = parse_date(args.to_date) + timedelta(days=1) if args.to_date else None
    if not start_date and not end_date:
        start_date = datetime.now(timezone.utc) - timedelta(days=30)

    # Find projects dir
    if args.claude_dir:
        projects_dir = Path(args.claude_dir) / "projects"
        # Override for facets cache too
        os.environ["CLAUDE_CONFIG_DIR"] = args.claude_dir
    else:
        projects_dir = get_projects_dir()

    if not projects_dir.exists():
        print(f"No projects directory found at {projects_dir}", file=sys.stderr)
        sys.exit(1)

    # Scan and parse
    keep_raw = do_extract  # Only keep raw messages if we need transcripts
    print(f"Scanning {projects_dir}...", file=sys.stderr)
    all_sessions: list[SessionMeta] = []
    files_scanned = 0

    for project_name, jsonl_path in iter_session_files(projects_dir):
        if args.project and args.project.lower() not in project_name.lower():
            continue
        files_scanned += 1
        messages = parse_session(jsonl_path)
        if not messages:
            continue
        meta = extract_session_meta(project_name, messages, keep_raw=keep_raw)
        if not meta:
            continue
        if not session_in_range(meta, start_date, end_date):
            continue
        if meta.user_messages < args.min_messages:
            continue
        all_sessions.append(meta)

    print(f"Found {len(all_sessions)} sessions from {files_scanned} files.", file=sys.stderr)

    if not all_sessions:
        print("No sessions matched the filters.", file=sys.stderr)
        sys.exit(0)

    all_sessions.sort(key=lambda s: s.start_time)

    # JSON output mode
    if args.json:
        import dataclasses
        def default(o):
            if isinstance(o, set):
                return list(o)
            if dataclasses.is_dataclass(o):
                d = dataclasses.asdict(o)
                d["files_touched"] = list(d.get("files_touched", []))
                d.pop("_raw_messages", None)
                return d
            return str(o)
        json.dump([s for s in all_sessions], sys.stdout, default=default, indent=2)
        return

    # --- LLM Pass 1: Extraction ---
    facets: dict[str, SessionFacets] = {}
    if do_extract:
        print("\n--- Pass 1: Facet Extraction ---", file=sys.stderr)
        facets = run_extraction_pass(
            all_sessions,
            model=args.extract_model,
            api_key=api_key,
            max_concurrent=args.concurrency,
            max_sessions=args.max_extract,
        )
        print(f"  Total facets: {len(facets)}", file=sys.stderr)
    elif do_synthesize:
        # Load existing cached facets for these sessions
        for s in all_sessions:
            cached = load_cached_facets(s.session_id)
            if cached:
                facets[s.session_id] = cached
        print(f"Loaded {len(facets)} cached facets.", file=sys.stderr)

    # --- Generate quantitative report ---
    report_lines = ["# Claude Code Inspection Report\n"]
    dates = sorted(s.start_time[:10] for s in all_sessions if s.start_time)
    if dates:
        report_lines.append(f"*{dates[0]} to {dates[-1]} · {len(all_sessions)} sessions*\n")

    for section_key in sections:
        _, section_fn = SECTIONS[section_key]
        if section_key == "facets":
            report_lines.append(section_facets(all_sessions, args.top, facets=facets))
        else:
            report_lines.append(section_fn(all_sessions, args.top))

    # --- LLM Pass 2: Synthesis ---
    if do_synthesize and facets:
        print("\n--- Pass 2: Synthesis ---", file=sys.stderr)
        synthesis = run_synthesis_pass(
            all_sessions, facets,
            model=args.synthesis_model,
            api_key=api_key,
        )
        if synthesis:
            report_lines.append("\n---\n")
            report_lines.append("# AI Insights\n")
            report_lines.append(f"*Extracted with `{args.extract_model}`, synthesized with `{args.synthesis_model}`*\n")
            report_lines.append(synthesis)
        else:
            report_lines.append("\n*Synthesis failed. Check API key and model availability.*\n")

    # Free raw messages before output
    for s in all_sessions:
        s._raw_messages = []

    report = "\n".join(report_lines)

    if args.output:
        Path(args.output).write_text(report, encoding="utf-8")
        print(f"\nReport written to {args.output}", file=sys.stderr)
    else:
        print(report)


if __name__ == "__main__":
    main()
