import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavItem } from './NavItem';

// Helper to render with router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('NavItem', () => {
  it('renders label text', () => {
    renderWithRouter(<NavItem to="/inbox" label="Inbox" />);
    expect(screen.getByText('Inbox')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    renderWithRouter(<NavItem to="/inbox" icon="📥" label="Inbox" />);
    expect(screen.getByText('📥')).toBeInTheDocument();
  });

  it('renders count when provided', () => {
    renderWithRouter(<NavItem to="/inbox" label="Inbox" count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not render count when zero', () => {
    renderWithRouter(<NavItem to="/inbox" label="Inbox" count={0} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('does not render count when undefined', () => {
    renderWithRouter(<NavItem to="/inbox" label="Inbox" />);
    const navItem = screen.getByText('Inbox').closest('a');
    expect(navItem?.textContent).toBe('Inbox');
  });

  it('renders as a link with correct href', () => {
    renderWithRouter(<NavItem to="/inbox" label="Inbox" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/inbox');
  });

  it('renders all elements together', () => {
    renderWithRouter(
      <NavItem to="/inbox" icon="📥" label="Inbox" count={10} />,
    );
    expect(screen.getByText('📥')).toBeInTheDocument();
    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
