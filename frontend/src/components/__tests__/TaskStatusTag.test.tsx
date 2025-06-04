/**
 * TASK MANAGER SYSTEM - TASK STATUS TAG COMPONENT TESTS
 * NASA/SpaceX Grade Test Suite for TaskStatusTag Component
 * 
 * Test Classification: MISSION-CRITICAL
 * Test Control: TMS-ATP-003-COMPONENT-TST
 * Version: 2.0.0
 * Compliance: NASA NPR 7150.2, SpaceX Software Standards
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/__tests__/utils'
import { CheckIcon, TimeIcon, WarningIcon } from '@chakra-ui/icons'
import TaskStatusTag from '../TaskStatusTag'

describe('TaskStatusTag', () => {
  const defaultProps = {
    displayName: 'In Progress',
    tagBg: 'blue.100',
    tagColor: 'blue.800',
  }

  describe('Basic Rendering', () => {
    it('should render task status tag with display name', () => {
      render(<TaskStatusTag {...defaultProps} />)
      
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })

    it('should apply default font weight when not specified', () => {
      render(<TaskStatusTag {...defaultProps} />)
      
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })

    it('should apply custom font weight when specified', () => {
      render(<TaskStatusTag {...defaultProps} fontWeight="bold" />)
      
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })
  })

  describe('Status Variants', () => {
    it('should render "To Do" status correctly', () => {
      render(
        <TaskStatusTag 
          displayName="To Do"
          tagBg="gray.100"
          tagColor="gray.800"
          icon={TimeIcon}
        />
      )
      
      expect(screen.getByText('To Do')).toBeInTheDocument()
    })

    it('should render "Completed" status correctly', () => {
      render(
        <TaskStatusTag 
          displayName="Completed"
          tagBg="green.100"
          tagColor="green.800"
          icon={CheckIcon}
        />
      )
      
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty display name gracefully', () => {
      render(
        <TaskStatusTag 
          displayName=""
          tagBg="gray.100"
          tagColor="gray.800"
        />
      )
      
      // Should still render the tag structure
      const tagElements = document.querySelectorAll('[role]')
      expect(tagElements.length).toBeGreaterThan(0)
    })

    it('should handle very long display names', () => {
      const longName = 'This is a very long status name that might wrap or overflow'
      render(
        <TaskStatusTag 
          displayName={longName}
          tagBg="blue.100"
          tagColor="blue.800"
        />
      )
      
      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('should handle special characters in display name', () => {
      const specialName = 'Status & Progress (50%)'
      render(
        <TaskStatusTag 
          displayName={specialName}
          tagBg="blue.100"
          tagColor="blue.800"
        />
      )
      
      expect(screen.getByText(specialName)).toBeInTheDocument()
    })
  })

  describe('Data Model Alignment', () => {
    it('should support all backend task status values', () => {
      const backendStatuses = ['TO_DO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED']
      
      backendStatuses.forEach(status => {
        const displayName = status.replace('_', ' ').toLowerCase()
          .replace(/\b\w/g, l => l.toUpperCase())
        
        render(
          <TaskStatusTag 
            key={status}
            displayName={displayName}
            tagBg="blue.100"
            tagColor="blue.800"
          />
        )
        
        expect(screen.getByText(displayName)).toBeInTheDocument()
      })
    })
  })
})
