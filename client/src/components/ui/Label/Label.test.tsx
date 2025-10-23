import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './Label';

describe('Label', () => {
  it('renders label with text', () => {
    render(<Label name="bug" color="bug" />);
    expect(screen.getByText('bug')).toBeInTheDocument();
  });

  it('renders with bug color', () => {
    render(<Label name="bug" color="bug" />);
    const label = screen.getByText('bug');
    expect(label).toBeInTheDocument();
  });

  it('renders with feature color', () => {
    render(<Label name="feature" color="feature" />);
    const label = screen.getByText('feature');
    expect(label).toBeInTheDocument();
  });

  it('renders with enhancement color', () => {
    render(<Label name="enhancement" color="enhancement" />);
    const label = screen.getByText('enhancement');
    expect(label).toBeInTheDocument();
  });

  it('renders with security color', () => {
    render(<Label name="security" color="security" />);
    const label = screen.getByText('security');
    expect(label).toBeInTheDocument();
  });

  it('renders with different label names', () => {
    const { rerender } = render(<Label name="Test Label" color="bug" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();

    rerender(<Label name="Another Label" color="feature" />);
    expect(screen.getByText('Another Label')).toBeInTheDocument();
  });
});
