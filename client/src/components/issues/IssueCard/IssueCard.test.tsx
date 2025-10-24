import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IssueCard } from './IssueCard';
import type { Issue } from '../../../mocks/types';
import styles from './IssueCard.module.css';

const mockIssue: Issue = {
  id: '1',
  title: 'Test Issue',
  description: 'This is a test issue description',
  status: 'Todo',
  priority: 'High',
  labels: [
    { id: 'label1', name: 'bug', color: 'bug' },
    { id: 'label2', name: 'feature', color: 'feature' },
  ],
  dueDate: new Date('2024-12-31'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
};

describe('IssueCard', () => {
  it('renders issue title', () => {
    render(<IssueCard issue={mockIssue} />);
    expect(screen.getByText('Test Issue')).toBeInTheDocument();
  });

  it('renders issue description', () => {
    render(<IssueCard issue={mockIssue} />);
    expect(
      screen.getByText('This is a test issue description'),
    ).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<IssueCard issue={mockIssue} />);
    expect(screen.getByText('Todo')).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    render(<IssueCard issue={mockIssue} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders labels', () => {
    render(<IssueCard issue={mockIssue} />);
    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('feature')).toBeInTheDocument();
  });

  it('shows more labels indicator when more than 3 labels', () => {
    const issueWithManyLabels: Issue = {
      ...mockIssue,
      labels: [
        { id: '1', name: 'bug', color: 'bug' },
        { id: '2', name: 'feature', color: 'feature' },
        { id: '3', name: 'enhancement', color: 'enhancement' },
        { id: '4', name: 'security', color: 'security' },
        { id: '5', name: 'database', color: 'database' },
      ],
    };

    render(<IssueCard issue={issueWithManyLabels} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders due date', () => {
    render(<IssueCard issue={mockIssue} />);
    // Due date rendering depends on current date, so just check it exists
    const dueDateElement = screen.getByText(/📅/);
    expect(dueDateElement).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<IssueCard issue={mockIssue} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(mockIssue);
  });

  it('calls onClick when Enter key is pressed', () => {
    const handleClick = vi.fn();
    render(<IssueCard issue={mockIssue} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledWith(mockIssue);
  });

  it('calls onClick when Space key is pressed', () => {
    const handleClick = vi.fn();
    render(<IssueCard issue={mockIssue} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledWith(mockIssue);
  });

  it('shows checkbox when showCheckbox is true', () => {
    render(<IssueCard issue={mockIssue} showCheckbox={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('hides checkbox when showCheckbox is false', () => {
    render(<IssueCard issue={mockIssue} showCheckbox={false} />);
    const checkbox = screen.queryByRole('checkbox');
    expect(checkbox).not.toBeInTheDocument();
  });

  it('checkbox is checked when isSelected is true', () => {
    render(
      <IssueCard issue={mockIssue} isSelected={true} showCheckbox={true} />,
    );
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('checkbox is unchecked when isSelected is false', () => {
    render(
      <IssueCard issue={mockIssue} isSelected={false} showCheckbox={true} />,
    );
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('calls onSelectionChange when checkbox is clicked', () => {
    const handleSelectionChange = vi.fn();
    render(
      <IssueCard
        issue={mockIssue}
        showCheckbox={true}
        onSelectionChange={handleSelectionChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(handleSelectionChange).toHaveBeenCalledWith('1', true);
  });

  it('applies selected style when isSelected is true', () => {
    const { container } = render(
      <IssueCard issue={mockIssue} isSelected={true} />,
    );
    const card = container.querySelector(`.${styles.card}`);
    expect(card).toHaveClass(styles.selected);
  });

  it('does not apply selected style when isSelected is false', () => {
    const { container } = render(
      <IssueCard issue={mockIssue} isSelected={false} />,
    );
    const card = container.querySelector(`.${styles.card}`);
    expect(card).not.toHaveClass(styles.selected);
  });

  it('renders without description', () => {
    const issueWithoutDescription: Issue = {
      ...mockIssue,
      description: undefined,
    };
    render(<IssueCard issue={issueWithoutDescription} />);
    expect(screen.getByText('Test Issue')).toBeInTheDocument();
  });

  it('renders without labels', () => {
    const issueWithoutLabels: Issue = {
      ...mockIssue,
      labels: [],
    };
    render(<IssueCard issue={issueWithoutLabels} />);
    expect(screen.getByText('Test Issue')).toBeInTheDocument();
  });

  it('renders without due date', () => {
    const issueWithoutDueDate: Issue = {
      ...mockIssue,
      dueDate: undefined,
    };
    render(<IssueCard issue={issueWithoutDueDate} />);
    expect(screen.getByText('Test Issue')).toBeInTheDocument();
    expect(screen.queryByText(/📅/)).not.toBeInTheDocument();
  });

  it('has priority indicator with correct aria-label', () => {
    render(<IssueCard issue={mockIssue} />);
    const indicator = screen.getByLabelText('Priority: High');
    expect(indicator).toBeInTheDocument();
  });

  it('checkbox click does not trigger card click', () => {
    const handleClick = vi.fn();
    const handleSelectionChange = vi.fn();

    render(
      <IssueCard
        issue={mockIssue}
        onClick={handleClick}
        showCheckbox={true}
        onSelectionChange={handleSelectionChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleSelectionChange).toHaveBeenCalled();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('handles today due date', () => {
    const issueWithTodayDate: Issue = {
      ...mockIssue,
      dueDate: new Date(),
    };
    render(<IssueCard issue={issueWithTodayDate} />);
    expect(screen.getByText(/Today/)).toBeInTheDocument();
  });

  it('handles tomorrow due date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const issueWithTomorrowDate: Issue = {
      ...mockIssue,
      dueDate: tomorrow,
    };
    render(<IssueCard issue={issueWithTomorrowDate} />);
    expect(screen.getByText(/Tomorrow/)).toBeInTheDocument();
  });

  it('handles overdue date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const issueWithOverdueDate: Issue = {
      ...mockIssue,
      dueDate: yesterday,
    };
    render(<IssueCard issue={issueWithOverdueDate} />);
    expect(screen.getByText(/overdue/)).toBeInTheDocument();
  });
});
