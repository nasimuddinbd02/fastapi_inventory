"""Small script to remove unused single-line imports from Python files.
- Skips wildcard imports and multi-line imports (parentheses or backslashes).
- Makes a backup of each file before editing (filename.bak).

Use cautiously and review changes.
"""
import ast
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {".venv", "venv", "__pycache__", "node_modules"}

def find_py_files(root):
    for p in root.rglob("*.py"):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        yield p

def is_simple_import_line(line):
    stripped = line.strip()
    if stripped.startswith("import ") or stripped.startswith("from "):
        # Reject wildcard and continuation
        if "*" in stripped:
            return False
        if stripped.endswith("\\"):
            return False
        if "(" in stripped and ")" not in stripped:
            return False
        return True
    return False

def analyze_file(path: Path):
    src = path.read_text(encoding="utf-8")
    try:
        tree = ast.parse(src)
    except Exception:
        return []

    # Collect imported names with their lineno and the textual import line
    imports = []
    for node in ast.iter_child_nodes(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                name = alias.asname or alias.name.split(".")[0]
                imports.append((name, node.lineno, src.splitlines()[node.lineno-1]))
        elif isinstance(node, ast.ImportFrom):
            if node.module is None:
                continue
            # skip wildcard
            if any(alias.name == "*" for alias in node.names):
                continue
            # we only handle simple single-line imports
            for alias in node.names:
                name = alias.asname or alias.name
                imports.append((name, node.lineno, src.splitlines()[node.lineno-1]))

    # collect used names
    used = set()
    class NameVisitor(ast.NodeVisitor):
        def visit_Name(self, n):
            used.add(n.id)
    NameVisitor().visit(tree)

    # find unused imports where name not in used
    unused = []
    for name, lineno, line in imports:
        if name not in used:
            # ensure line is simple single-line import
            if is_simple_import_line(line):
                unused.append((lineno, line))
    return unused


def apply_cleanup():
    changed_files = []
    for path in find_py_files(ROOT):
        unused = analyze_file(path)
        if not unused:
            continue
        lines = path.read_text(encoding="utf-8").splitlines()
        # backup
        bak = path.with_suffix(path.suffix + ".bak")
        bak.write_text("\n".join(lines), encoding="utf-8")
        # remove lines by lineno (1-based)
        to_remove = {ln for ln, _ in unused}
        new_lines = [l for i, l in enumerate(lines, start=1) if i not in to_remove]
        path.write_text("\n".join(new_lines), encoding="utf-8")
        changed_files.append((path, unused))
    return changed_files

if __name__ == "__main__":
    changed = apply_cleanup()
    if not changed:
        print("No unused single-line imports found.")
    else:
        for p, unused in changed:
            print(f"Cleaned {p}: removed {len(unused)} imports")