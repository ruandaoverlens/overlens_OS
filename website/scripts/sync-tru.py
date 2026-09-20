"""Regenera TRU/<sistema>/ a partir de website/content/<sistema>/.

A fonte canonica e `website/content/`, que carrega o frontmatter YAML lido
pelo site, pela command palette e pelo indice de IA. `TRU/` e o espelho local
sem frontmatter. Este script reescreve TRU a partir de content, remove orfaos
e reporta o que mudou.

Uso (a partir da raiz do repo):
    python website/scripts/sync-tru.py          # aplica
    python website/scripts/sync-tru.py --check  # so reporta, nao escreve
"""

import io
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONTENT = os.path.join(ROOT, "website", "content")
TRU = os.path.join(ROOT, "TRU")

# Arquivos soltos na raiz de TRU/ que nao vem de content/ e nao devem ser removidos.
KEEP_AT_TRU_ROOT = {"changes.md", "[AUDITORIA] Base de Conhecimento.md"}


def strip_frontmatter(text):
    """Remove o bloco YAML inicial delimitado por ---, se houver."""
    if not text.startswith("---"):
        return text
    end = text.find("\n---", 3)
    if end == -1:
        return text
    return text[end + 4:].lstrip("\n")


def walk_md(base):
    for dirpath, _dirnames, filenames in os.walk(base):
        for name in filenames:
            if name.endswith(".md"):
                full = os.path.join(dirpath, name)
                yield os.path.relpath(full, base).replace(os.sep, "/")


def main():
    check_only = "--check" in sys.argv

    if not os.path.isdir(CONTENT):
        print("nao encontrei", CONTENT)
        return 1

    created, updated, unchanged, removed = [], [], [], []

    content_files = sorted(walk_md(CONTENT))
    for rel in content_files:
        src = os.path.join(CONTENT, rel.replace("/", os.sep))
        dst = os.path.join(TRU, rel.replace("/", os.sep))
        body = strip_frontmatter(io.open(src, encoding="utf-8").read())

        if os.path.exists(dst):
            current = io.open(dst, encoding="utf-8").read()
            if current == body:
                unchanged.append(rel)
                continue
            updated.append(rel)
        else:
            created.append(rel)

        if not check_only:
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            with io.open(dst, "w", encoding="utf-8", newline="") as handle:
                handle.write(body)

    # Orfaos: existem em TRU e nao em content.
    known = set(content_files)
    for rel in sorted(walk_md(TRU)):
        if rel in known:
            continue
        if "/" not in rel and rel in KEEP_AT_TRU_ROOT:
            continue
        removed.append(rel)
        if not check_only:
            os.remove(os.path.join(TRU, rel.replace("/", os.sep)))

    # Diretorios vazios deixados para tras.
    if not check_only:
        for dirpath, dirnames, filenames in os.walk(TRU, topdown=False):
            if not dirnames and not filenames and dirpath != TRU:
                os.rmdir(dirpath)

    label = "seriam " if check_only else ""
    print("criados:    %s%d" % (label, len(created)))
    for rel in created:
        print("   +", rel)
    print("atualizados:%s%d" % (" " + label if check_only else " ", len(updated)))
    for rel in updated:
        print("   ~", rel)
    print("removidos:  %s%d" % (label, len(removed)))
    for rel in removed:
        print("   -", rel)
    print("iguais:      %d" % len(unchanged))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
