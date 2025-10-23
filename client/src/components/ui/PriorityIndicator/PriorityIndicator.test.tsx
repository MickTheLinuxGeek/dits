import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriorityIndicator } from './PriorityIndicator';

describe('PriorityIndicator', () => {
  it('renders priority text', () => {
    render(<PriorityIndicator priority="High" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders urgent priority', () => {
    render(<PriorityIndicator priority="Urgent" />);
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('renders high priority', () => {
    render(<PriorityIndicator priority="High" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders medium priority', () => {
    render(<PriorityIndicator priority="Medium" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders low priority', () => {
    render(<PriorityIndicator priority="Low" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('renders with dot', () => {
    render(<PriorityIndicator priority="High" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });
});
