import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterDropdown } from './FilterDropdown';

describe('FilterDropdown', () => {
  const mockOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  const defaultProps = {
    label: 'Status',
    value: 'all',
    options: mockOptions,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button with label and value', () => {
    render(<FilterDropdown {...defaultProps} />);

    expect(screen.getByRole('button')).toHaveTextContent('Status:');
    expect(screen.getByRole('button')).toHaveTextContent('All');
  });

  it('opens dropdown when trigger is clicked', () => {
    render(<FilterDropdown {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Completed' }),
    ).toBeInTheDocument();
  });

  it('closes dropdown when backdrop is clicked', () => {
    render(<FilterDropdown {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.click(document.querySelector('[aria-hidden="true"]')!);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('calls onChange with selected value', () => {
    const onChange = vi.fn();
    render(<FilterDropdown {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: 'Active' }));

    expect(onChange).toHaveBeenCalledWith('active');
  });

  it('closes dropdown after selecting an option', () => {
    render(<FilterDropdown {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: 'Active' }));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('marks current value as selected', () => {
    render(<FilterDropdown {...defaultProps} value="active" />);

    fireEvent.click(screen.getByRole('button'));

    const activeOption = screen.getByRole('option', { name: 'Active' });
    expect(activeOption).toHaveAttribute('aria-selected', 'true');
  });

  it('displays selected value label in trigger', () => {
    render(<FilterDropdown {...defaultProps} value="completed" />);

    expect(screen.getByRole('button')).toHaveTextContent('Completed');
  });

  it('has correct aria attributes', () => {
    render(<FilterDropdown {...defaultProps} />);

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
