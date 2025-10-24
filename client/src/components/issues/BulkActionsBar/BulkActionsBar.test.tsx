import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BulkActionsBar } from './BulkActionsBar';

describe('BulkActionsBar', () => {
  const defaultProps = {
    selectedCount: 3,
    onClearSelection: vi.fn(),
    onDelete: vi.fn(),
    onStatusChange: vi.fn(),
    onPriorityChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with selection count', () => {
    render(<BulkActionsBar {...defaultProps} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('issues selected')).toBeInTheDocument();
  });

  it('shows singular "issue" when count is 1', () => {
    render(<BulkActionsBar {...defaultProps} selectedCount={1} />);

    expect(screen.getByText('issue selected')).toBeInTheDocument();
  });

  it('calls onClearSelection when clear button is clicked', () => {
    const onClearSelection = vi.fn();
    render(
      <BulkActionsBar {...defaultProps} onClearSelection={onClearSelection} />,
    );

    fireEvent.click(screen.getByLabelText('Clear selection'));
    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it('opens status dropdown when clicked', () => {
    render(<BulkActionsBar {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /change status/i }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Todo' })).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'In Progress' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Review' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Done' })).toBeInTheDocument();
  });

  it('calls onStatusChange with correct status', () => {
    const onStatusChange = vi.fn();
    render(
      <BulkActionsBar {...defaultProps} onStatusChange={onStatusChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /change status/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'In Progress' }));

    expect(onStatusChange).toHaveBeenCalledWith('In Progress');
  });

  it('closes status dropdown after selecting option', () => {
    render(<BulkActionsBar {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /change status/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Todo' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens priority dropdown when clicked', () => {
    render(<BulkActionsBar {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /change priority/i }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /urgent/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /high/i })).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /medium/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /low/i })).toBeInTheDocument();
  });

  it('calls onPriorityChange with correct priority', () => {
    const onPriorityChange = vi.fn();
    render(
      <BulkActionsBar {...defaultProps} onPriorityChange={onPriorityChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /change priority/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /high/i }));

    expect(onPriorityChange).toHaveBeenCalledWith('High');
  });

  it('closes priority dropdown after selecting option', () => {
    render(<BulkActionsBar {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /change priority/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /urgent/i }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('shows delete confirmation on first delete click', () => {
    render(<BulkActionsBar {...defaultProps} />);

    fireEvent.click(
      screen.getByRole('button', { name: /delete selected issues/i }),
    );

    expect(screen.getByText(/delete 3 issues\?/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /confirm/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows singular "issue" in delete confirmation when count is 1', () => {
    render(<BulkActionsBar {...defaultProps} selectedCount={1} />);

    fireEvent.click(
      screen.getByRole('button', { name: /delete selected issues/i }),
    );

    expect(screen.getByText(/delete 1 issue\?/i)).toBeInTheDocument();
  });

  it('calls onDelete when confirming deletion', () => {
    const onDelete = vi.fn();
    render(<BulkActionsBar {...defaultProps} onDelete={onDelete} />);

    // First click shows confirmation
    fireEvent.click(
      screen.getByRole('button', { name: /delete selected issues/i }),
    );

    // Second click on Confirm button calls onDelete
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('hides confirmation when cancel is clicked', () => {
    render(<BulkActionsBar {...defaultProps} />);

    fireEvent.click(
      screen.getByRole('button', { name: /delete selected issues/i }),
    );
    expect(screen.getByText(/delete 3 issues\?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText(/delete 3 issues\?/i)).not.toBeInTheDocument();
  });

  it('does not call onDelete when cancel is clicked', () => {
    const onDelete = vi.fn();
    render(<BulkActionsBar {...defaultProps} onDelete={onDelete} />);

    fireEvent.click(
      screen.getByRole('button', { name: /delete selected issues/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('closes status dropdown when priority dropdown is opened', () => {
    render(<BulkActionsBar {...defaultProps} />);

    // Open status dropdown
    fireEvent.click(screen.getByRole('button', { name: /change status/i }));
    expect(screen.getByRole('menuitem', { name: 'Todo' })).toBeInTheDocument();

    // Open priority dropdown
    fireEvent.click(screen.getByRole('button', { name: /change priority/i }));

    // Status dropdown should be closed, priority dropdown should be open
    expect(
      screen.queryByRole('menuitem', { name: 'Todo' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /urgent/i }),
    ).toBeInTheDocument();
  });

  it('closes dropdowns when delete is clicked', () => {
    render(<BulkActionsBar {...defaultProps} />);

    // Open status dropdown
    fireEvent.click(screen.getByRole('button', { name: /change status/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // Click delete
    fireEvent.click(
      screen.getByRole('button', { name: /delete selected issues/i }),
    );

    // Dropdown should be closed, confirmation should show
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByText(/delete 3 issues\?/i)).toBeInTheDocument();
  });

  it('has correct aria attributes', () => {
    render(<BulkActionsBar {...defaultProps} />);

    const container = screen.getByRole('toolbar', { name: /bulk actions/i });
    expect(container).toBeInTheDocument();

    const statusButton = screen.getByRole('button', { name: /change status/i });
    expect(statusButton).toHaveAttribute('aria-expanded', 'false');
    expect(statusButton).toHaveAttribute('aria-haspopup', 'menu');

    fireEvent.click(statusButton);
    expect(statusButton).toHaveAttribute('aria-expanded', 'true');
  });
});
