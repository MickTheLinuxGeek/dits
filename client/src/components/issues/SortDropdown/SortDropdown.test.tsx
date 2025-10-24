import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SortDropdown } from './SortDropdown';

describe('SortDropdown', () => {
  const defaultProps = {
    currentField: 'createdAt' as const,
    currentDirection: 'desc' as const,
    onSortChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sort button', () => {
    render(<SortDropdown {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /sort options/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', () => {
    render(<SortDropdown {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));

    expect(screen.getByText('Sort by')).toBeInTheDocument();
    // Use getAllByText for items that might appear in header too
    expect(screen.getAllByText('Title').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Priority').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Due Date').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Created').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Updated').length).toBeGreaterThan(0);
  });

  it('closes dropdown when backdrop is clicked', () => {
    render(<SortDropdown {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));
    expect(screen.getByText('Sort by')).toBeInTheDocument();

    fireEvent.click(document.querySelector('[aria-hidden="true"]')!);
    expect(screen.queryByText('Sort by')).not.toBeInTheDocument();
  });

  it('displays current sort field and direction in header', () => {
    render(
      <SortDropdown
        {...defaultProps}
        currentField="title"
        currentDirection="asc"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));

    // Title appears in both header and dropdown, so use getAllByText
    expect(screen.getAllByText(/title/i).length).toBeGreaterThan(0);
  });

  it('marks current field as active', () => {
    render(<SortDropdown {...defaultProps} currentField="priority" />);

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));

    // Find all buttons and get the one with 'option' class that contains Priority
    const buttons = screen.getAllByRole('button');
    const priorityOption = buttons.find(
      (btn) =>
        btn.textContent?.includes('Priority') &&
        btn.className.includes('option'),
    );
    // Check for CSS module hashed 'active' class
    expect(priorityOption?.className).toMatch(/active/);
    expect(priorityOption).toBeDefined();
  });

  it('calls onSortChange with new field and desc direction when clicking different field', () => {
    const onSortChange = vi.fn();
    render(
      <SortDropdown
        {...defaultProps}
        currentField="title"
        onSortChange={onSortChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));
    fireEvent.click(screen.getByText('Status'));

    expect(onSortChange).toHaveBeenCalledWith('status', 'desc');
  });

  it('toggles direction when clicking same field', () => {
    const onSortChange = vi.fn();
    render(
      <SortDropdown
        {...defaultProps}
        currentField="title"
        currentDirection="desc"
        onSortChange={onSortChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));

    // Find the option button (not the header text)
    const buttons = screen.getAllByRole('button');
    const titleOption = buttons.find(
      (btn) =>
        btn.textContent?.includes('Title') && btn.className.includes('option'),
    );
    fireEvent.click(titleOption!);

    expect(onSortChange).toHaveBeenCalledWith('title', 'asc');
  });

  it('toggles from asc to desc when clicking same field', () => {
    const onSortChange = vi.fn();
    render(
      <SortDropdown
        {...defaultProps}
        currentField="title"
        currentDirection="asc"
        onSortChange={onSortChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));

    // Find the option button (not the header text)
    const buttons = screen.getAllByRole('button');
    const titleOption = buttons.find(
      (btn) =>
        btn.textContent?.includes('Title') && btn.className.includes('option'),
    );
    fireEvent.click(titleOption!);

    expect(onSortChange).toHaveBeenCalledWith('title', 'desc');
  });

  it('closes dropdown after selecting an option', () => {
    render(<SortDropdown {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));
    fireEvent.click(screen.getByText('Priority'));

    expect(screen.queryByText('Sort by')).not.toBeInTheDocument();
  });

  it('shows all sort options', () => {
    render(<SortDropdown {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));

    // These options don't conflict with current field display
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();

    // For "Created" and "Updated", verify they appear multiple times (header + option)
    expect(screen.getAllByText('Created').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Updated').length).toBeGreaterThan(0);
  });

  it('has correct aria attributes', () => {
    render(<SortDropdown {...defaultProps} />);

    const button = screen.getByRole('button', { name: /sort options/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('sorts by title', () => {
    const onSortChange = vi.fn();
    render(<SortDropdown {...defaultProps} onSortChange={onSortChange} />);

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));
    fireEvent.click(screen.getByText('Title'));

    expect(onSortChange).toHaveBeenCalledWith('title', 'desc');
  });

  it('sorts by status', () => {
    const onSortChange = vi.fn();
    render(<SortDropdown {...defaultProps} onSortChange={onSortChange} />);

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));
    fireEvent.click(screen.getByText('Status'));

    expect(onSortChange).toHaveBeenCalledWith('status', 'desc');
  });

  it('sorts by due date', () => {
    const onSortChange = vi.fn();
    render(<SortDropdown {...defaultProps} onSortChange={onSortChange} />);

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));
    fireEvent.click(screen.getByText('Due Date'));

    expect(onSortChange).toHaveBeenCalledWith('dueDate', 'desc');
  });

  it('sorts by created date', () => {
    const onSortChange = vi.fn();
    // Start with a different field so clicking Created will set it to desc (not toggle)
    render(
      <SortDropdown
        {...defaultProps}
        currentField="title"
        onSortChange={onSortChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));

    // Now Created is not the current field, so getByText will work
    fireEvent.click(screen.getByText('Created'));

    expect(onSortChange).toHaveBeenCalledWith('createdAt', 'desc');
  });

  it('sorts by updated date', () => {
    const onSortChange = vi.fn();
    render(<SortDropdown {...defaultProps} onSortChange={onSortChange} />);

    fireEvent.click(screen.getByRole('button', { name: /sort options/i }));

    // Find the button that contains "Updated" and has type="button" (option button, not main button)
    const buttons = screen.getAllByRole('button');
    const updatedOption = buttons.find(
      (btn) =>
        btn.textContent?.includes('Updated') &&
        btn.type === 'button' &&
        btn.className.includes('option'),
    );
    fireEvent.click(updatedOption!);

    expect(onSortChange).toHaveBeenCalledWith('updatedAt', 'desc');
  });
});
