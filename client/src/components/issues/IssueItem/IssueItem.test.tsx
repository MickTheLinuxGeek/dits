import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IssueItem } from './IssueItem';
import type { Issue } from '../../../mocks/types';

const mockIssue: Issue = {
  id: 'TEST-123',
  title: 'Test Issue Title',
  status: 'Todo',
  priority: 'High',
  labels: [
    { id: 'lbl-1', name: 'bug', color: 'bug' },
    { id: 'lbl-2', name: 'feature', color: 'feature' },
  ],
  dueDate: new Date('2024-12-31'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
};

describe('IssueItem', () => {
  it('renders issue title', () => {
    render(<IssueItem issue={mockIssue} />);
    expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
  });

  it('renders issue ID', () => {
    render(<IssueItem issue={mockIssue} />);
    expect(screen.getByText('TEST-123')).toBeInTheDocument();
  });

  it('renders labels', () => {
    render(<IssueItem issue={mockIssue} />);
    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('feature')).toBeInTheDocument();
  });

  it('renders priority', () => {
    render(<IssueItem issue={mockIssue} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<IssueItem issue={mockIssue} />);
    expect(screen.getByText('Todo')).toBeInTheDocument();
  });

  it('renders checkbox', () => {
    render(<IssueItem issue={mockIssue} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('checkbox is unchecked for non-done issues', () => {
    render(<IssueItem issue={mockIssue} />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('checkbox is checked for done issues', () => {
    const doneIssue = { ...mockIssue, status: 'Done' as const };
    render(<IssueItem issue={doneIssue} />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('calls onToggleComplete when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    render(<IssueItem issue={mockIssue} onToggleComplete={handleToggle} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(handleToggle).toHaveBeenCalledWith('TEST-123');
  });

  it('applies completed style for done issues', () => {
    const doneIssue = { ...mockIssue, status: 'Done' as const };
    render(<IssueItem issue={doneIssue} />);
    const title = screen.getByText('Test Issue Title');
    expect(title).toBeInTheDocument();
  });

  it('renders without labels', () => {
    const issueWithoutLabels = { ...mockIssue, labels: [] };
    render(<IssueItem issue={issueWithoutLabels} />);
    expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
  });

  it('renders without due date', () => {
    const issueWithoutDueDate = { ...mockIssue, dueDate: undefined };
    render(<IssueItem issue={issueWithoutDueDate} />);
    expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
  });
});
