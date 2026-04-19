#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

REQUIRED = [
    'project-intake.md',
    'artifact-manifest.json',
    'architecture/c4-context.mmd',
    'architecture/c4-container.mmd',
    'code/pseudocode-ledger.md',
    'contracts/io-contracts.json',
    'execution/work-orders.md',
    'verify/verification-plan.md',
    'release/handoff.md',
]


def main() -> int:
    parser = argparse.ArgumentParser(description='Validate a scaffolded packet.')
    parser.add_argument('packet_dir')
    args = parser.parse_args()
    root = Path(args.packet_dir)
    missing = [rel for rel in REQUIRED if not (root / rel).exists()]
    if missing:
        for rel in missing:
            print(f'MISSING: {rel}')
        return 1
    print('OK')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
