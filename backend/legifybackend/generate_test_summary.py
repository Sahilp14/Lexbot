#!/usr/bin/env python3
"""
Run Django tests and produce a test summary file (JSON and plain text).

Place this file alongside `manage.py` and run:

    python generate_test_summary.py

It will run the project's test suite and write `test_summary.json` and
`test_summary.txt` in the same directory.
"""
import os
import sys
import time
import json
import traceback
import unittest

# Ensure the project directory (this file's directory) is on sys.path
PROJECT_DIR = os.path.dirname(__file__)
sys.path.insert(0, PROJECT_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legifybackend.settings')

try:
    import django
    from django.conf import settings
    from django.test.utils import get_runner
except Exception:
    print('Failed to import Django. Make sure your virtualenv is activated.')
    raise


def main():
    django.setup()

    TestRunnerClass = get_runner(settings)
    test_runner = TestRunnerClass()

    # Build test suite using Django's discovery
    suite = test_runner.build_suite(test_labels=None)

    start = time.time()
    # Use unittest.TextTestRunner to capture a TestResult object
    runner = unittest.TextTestRunner(stream=sys.stdout, verbosity=1)
    result = runner.run(suite)
    elapsed = time.time() - start

    # Collect summary information
    summary = {
        'testsRun': getattr(result, 'testsRun', 0),
        'failures': len(getattr(result, 'failures', [])),
        'errors': len(getattr(result, 'errors', [])),
        'skipped': len(getattr(result, 'skipped', [])),
        'expectedFailures': len(getattr(result, 'expectedFailures', [])),
        'unexpectedSuccesses': len(getattr(result, 'unexpectedSuccesses', [])),
        'time_seconds': elapsed,
        'failures_details': [],
        'errors_details': [],
        'skipped_details': [],
    }

    # failures and errors are lists of (testcase, traceback_str)
    for t, tb in getattr(result, 'failures', []):
        try:
            test_id = t.id()
        except Exception:
            test_id = str(t)
        summary['failures_details'].append({'test': test_id, 'traceback': tb})

    for t, tb in getattr(result, 'errors', []):
        try:
            test_id = t.id()
        except Exception:
            test_id = str(t)
        summary['errors_details'].append({'test': test_id, 'traceback': tb})

    for t, reason in getattr(result, 'skipped', []):
        try:
            test_id = t.id()
        except Exception:
            test_id = str(t)
        summary['skipped_details'].append({'test': test_id, 'reason': reason})

    # Write JSON and human-readable text summary files
    out_json = os.path.join(PROJECT_DIR, 'test_summary.json')
    out_txt = os.path.join(PROJECT_DIR, 'test_summary.txt')

    try:
        with open(out_json, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)

        with open(out_txt, 'w', encoding='utf-8') as f:
            f.write(f"Tests run: {summary['testsRun']}\n")
            f.write(f"Failures: {summary['failures']}\n")
            f.write(f"Errors: {summary['errors']}\n")
            f.write(f"Skipped: {summary['skipped']}\n")
            f.write(f"Expected failures: {summary['expectedFailures']}\n")
            f.write(f"Unexpected successes: {summary['unexpectedSuccesses']}\n")
            f.write(f"Time (s): {summary['time_seconds']:.3f}\n\n")

            if summary['failures_details']:
                f.write('Failures:\n')
                for d in summary['failures_details']:
                    f.write(f"- {d['test']}\n")
                    f.write(d['traceback'] + '\n')

            if summary['errors_details']:
                f.write('Errors:\n')
                for d in summary['errors_details']:
                    f.write(f"- {d['test']}\n")
                    f.write(d['traceback'] + '\n')

            if summary['skipped_details']:
                f.write('Skipped:\n')
                for d in summary['skipped_details']:
                    f.write(f"- {d['test']}: {d['reason']}\n")

        print(f'Wrote summaries: {out_json}, {out_txt}')
    except Exception:
        print('Failed to write summary files:')
        traceback.print_exc()


if __name__ == '__main__':
    main()
