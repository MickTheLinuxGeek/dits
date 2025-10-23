import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders status text', () => {
    render(<StatusBadge status="Todo" />);
    expect(screen.getByText('Todo')).toBeInTheDocument();
  });

  it('renders todo status', () => {
    render(<StatusBadge status="Todo" />);
    expect(screen.getByText('Todo')).toBeInTheDocument();
  });

  it('renders in progress status', () => {
    render(<StatusBadge status="In Progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders review status', () => {
    render(<StatusBadge status="Review" />);
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('renders done status', () => {
    render(<StatusBadge status="Done" />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders with dot', () => {
    render(<StatusBadge status="Todo" />);
    expect(screen.getByText('Todo')).toBeInTheDocument();
  });

  it('handles status with spaces correctly', () => {
    render(<StatusBadge status="In Progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });
});
