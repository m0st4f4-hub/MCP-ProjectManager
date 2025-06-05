import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDisplayName, mapStatusToStatusID } from '../utils';
import { getAllStatusIds } from '../statusUtils';
import { TaskStatus } from '@/types/task';

describe('Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatDisplayName', () => {
    it('should format names with underscores correctly', () => {
      expect(formatDisplayName('my_project_name')).toBe('My Project Name');
    });

    it('should format names with hyphens correctly', () => {
      expect(formatDisplayName('another-agent-name')).toBe('Another Agent Name');
    });

    it('should handle single words', () => {
      expect(formatDisplayName('SingleWord')).toBe('Singleword');
    });

    it('should handle names with leading/trailing spaces', () => {
      expect(formatDisplayName('  leading space  ')).toBe('Leading Space');
    });

    it('should handle mixed delimiters', () => {
      expect(formatDisplayName('mixed_test-name')).toBe('Mixed Test Name');
    });

    it('should handle null and undefined values', () => {
      expect(formatDisplayName(null)).toBe('Unnamed');
      expect(formatDisplayName(undefined)).toBe('Unnamed');
    });

    it('should handle empty strings', () => {
      expect(formatDisplayName('')).toBe('Unnamed');
      expect(formatDisplayName('   ')).toBe('Unnamed');
    });

    it('should handle special characters', () => {
      expect(formatDisplayName('test_with_123')).toBe('Test With 123');
    });
  });

  describe('mapStatusToStatusID', () => {
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should map common display names correctly', () => {
      expect(mapStatusToStatusID('to do')).toBe('TO_DO');
      expect(mapStatusToStatusID('todo')).toBe('TO_DO');
      expect(mapStatusToStatusID('in progress')).toBe('IN_PROGRESS');
      expect(mapStatusToStatusID('blocked')).toBe('BLOCKED');
      expect(mapStatusToStatusID('completed')).toBe('COMPLETED');
      expect(mapStatusToStatusID('failed')).toBe('FAILED');
      expect(mapStatusToStatusID('verification failed')).toBe('VERIFICATION_FAILED');
    });

    it('should handle case insensitive mapping', () => {
      expect(mapStatusToStatusID('TO DO')).toBe('TO_DO');
      expect(mapStatusToStatusID('In Progress')).toBe('IN_PROGRESS');
      expect(mapStatusToStatusID('BLOCKED')).toBe('BLOCKED');
      expect(mapStatusToStatusID('Completed')).toBe('COMPLETED');
    });

    it('should handle null and undefined values', () => {
      expect(mapStatusToStatusID(null)).toBe('TO_DO');
      expect(mapStatusToStatusID(undefined)).toBe('TO_DO');
    });

    it('should handle empty strings', () => {
      expect(mapStatusToStatusID('')).toBe('TO_DO');
      expect(mapStatusToStatusID('   ')).toBe('TO_DO');
    });

    it('should warn for unknown status values', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      mapStatusToStatusID('unknown_status');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown status value: "unknown_status"')
      );
    });

    it('should handle direct StatusID format', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      expect(mapStatusToStatusID('TO_DO')).toBe('TO_DO');
      expect(mapStatusToStatusID('IN_PROGRESS')).toBe('IN_PROGRESS');
      expect(mapStatusToStatusID('BLOCKED')).toBe('BLOCKED');
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle non-string values gracefully', () => {
      // @ts-expect-error - testing runtime behavior with invalid types
      expect(mapStatusToStatusID(123)).toBe('TO_DO');
      // @ts-expect-error - testing runtime behavior with invalid types
      expect(mapStatusToStatusID({})).toBe('TO_DO');
    });
  });

  describe('getAllStatusIds', () => {
    it('returns the same enum values as TaskStatusEnum', () => {
      const result = getAllStatusIds();
      const enumIds = Object.keys(TaskStatus);
      const filtered = result.filter((id) => enumIds.includes(id));
      expect(filtered.length).toBe(enumIds.length);
      enumIds.forEach((id) => {
        expect(result).toContain(id);
      });
    });
  });
});
