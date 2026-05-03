#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from datetime import datetime, timezone


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')


def main() -> int:
    parser = argparse.ArgumentParser(description='Scaffold a diagram-driven analysis/migration packet.')
    parser.add_argument('--slug', required=True)
    parser.add_argument('--title', required=True)
    parser.add_argument('--mode', default='migration', choices=['analysis', 'migration', 'optimization', 'greenfield'])
    parser.add_argument('--out', required=True)
    args = parser.parse_args()

    out = Path(args.out) / args.slug
    out.mkdir(parents=True, exist_ok=True)

    for rel in [
        'architecture', 'behavior/sequence', 'behavior/state', 'code', 'contracts',
        'migration', 'execution', 'verify', 'evidence', 'release'
    ]:
        (out / rel).mkdir(parents=True, exist_ok=True)

    write(out / 'project-intake.md', f'# {args.title}\n\n## Objective\n\n## Scope\n\n## Constraints\n')
    manifest = {
        'project': {'name': args.title, 'slug': args.slug, 'mode': args.mode},
        'artifacts': [
            'project-intake.md',
            'architecture/c4-context.mmd',
            'architecture/c4-container.mmd',
            'code/pseudocode-ledger.md',
            'contracts/io-contracts.json',
            'execution/work-orders.md',
            'verify/verification-plan.md',
            'release/handoff.md'
        ],
        'generatedAt': datetime.now(timezone.utc).isoformat()
    }
    write(out / 'artifact-manifest.json', json.dumps(manifest, indent=2) + '\n')
    write(out / 'architecture' / 'c4-context.mmd', 'flowchart LR\n  user[User] --> system[System]\n')
    write(out / 'architecture' / 'c4-container.mmd', 'flowchart LR\n  web[Web] --> api[API] --> db[(DB)]\n')
    write(out / 'code' / 'pseudocode-ledger.md', '# Pseudocode Ledger\n')
    write(out / 'contracts' / 'io-contracts.json', '[]\n')
    write(out / 'execution' / 'work-orders.md', '# Work Orders\n')
    write(out / 'verify' / 'verification-plan.md', '# Verification Plan\n')
    write(out / 'release' / 'handoff.md', '# Handoff\n')
    print(out)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
