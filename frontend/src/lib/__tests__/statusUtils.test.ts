import { describe, it, expect } from 'vitest';
import {
  getStatusAttributes,
  getDisplayableStatus,
  getAllStatusIds,
  StatusID,
} from '../statusUtils';

// --- Tests for getStatusAttributes ---

describe('getStatusAttributes', () => {
  it('returns attributes for a static StatusID', () => {
    const attrs = getStatusAttributes('TO_DO');
    expect(attrs).toBeDefined();
    expect(attrs?.id).toBe('To Do');
    expect(attrs?.displayName).toBe('To Do');
    expect(attrs?.category).toBe('todo');
  });

  it('returns attributes for a dynamic StatusID definition', () => {
    const attrs = getStatusAttributes('COMPLETED_HANDOFF');
    expect(attrs).toBeDefined();
    expect(attrs?.isDynamic).toBe(true);
    expect(attrs?.dynamicPartsExtractor).toEqual(
      /^COMPLETED_HANDOFF_TO_(([a-zA-Z0-9-]+(?:\s*,\s*[a-zA-Z0-9-]+)*))$/
    );
    expect(attrs?.dynamicDisplayNamePattern).toBe('Handoff to: {value}');
    expect(attrs?.id).toBe('Completed Handoff');
  });

  it('returns undefined for an unknown StatusID', () => {
    const attrs = getStatusAttributes('UNKNOWN_STATUS' as StatusID);
    expect(attrs).toBeUndefined();
  });
});

// --- Tests for getDisplayableStatus ---

describe('getDisplayableStatus', () => {
  const staticStatuses: StatusID[] = [
    'TO_DO',
    'IN_PROGRESS',
    'BLOCKED',
    'COMPLETED',
    'FAILED',
  ];
  staticStatuses.forEach((id) => {
    it(`returns display info for static status ${id}`, () => {
      const disp = getDisplayableStatus(id);
      const attrs = getStatusAttributes(id)!;
      expect(disp).toBeDefined();
      expect(disp?.displayName).toBe(attrs.displayName);
      expect(disp?.colorScheme).toBe(attrs.colorScheme);
      expect(disp?.icon).toBe(attrs.icon);
    });
  });

  it('parses dynamic COMPLETED_HANDOFF_TO_... status', () => {
    const disp = getDisplayableStatus('COMPLETED_HANDOFF_TO_task-123');
    expect(disp?.displayName).toBe('Handoff to: task-123');
  });

  it('falls back for unknown status strings', () => {
    const unknown = 'SOMETHING_NEW';
    const disp = getDisplayableStatus(unknown);
    expect(disp?.displayName).toBe('SOMETHING NEW');
    expect(disp?.colorScheme).toBe('gray');
  });
});

// --- Tests for getAllStatusIds ---

describe('getAllStatusIds', () => {
  it('returns every key from the status map', () => {
    const ids = getAllStatusIds();
    const expected: StatusID[] = [
      'TO_DO',
      'IN_PROGRESS',
      'BLOCKED',
      'COMPLETED',
      'CONTEXT_ACQUIRED',
      'PLANNING_COMPLETE',
      'EXECUTION_IN_PROGRESS',
      'PENDING_VERIFICATION',
      'VERIFICATION_COMPLETE',
      'VERIFICATION_FAILED',
      'COMPLETED_AWAITING_PROJECT_MANAGER',
      'COMPLETED_HANDOFF_TO_...',
      'FAILED',
      'IN_PROGRESS_AWAITING_SUBTASK',
      'PENDING_RECOVERY_ATTEMPT',
    ];

    expected.forEach((k) => expect(ids).toContain(k));
  });
});
