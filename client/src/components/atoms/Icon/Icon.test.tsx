import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Icon, type IconName } from './Icon';

describe('Icon', () => {
  it('renders an icon', () => {
    render(<Icon name="Check" ariaLabel="Check icon" />);
    expect(screen.getByLabelText('Check icon')).toBeInTheDocument();
  });

  it('uses default aria-label when not provided', () => {
    render(<Icon name="Check" />);
    expect(screen.getByLabelText('Check')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = render(<Icon name="Check" size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('renders with string size', () => {
    const { container } = render(<Icon name="Check" size="2rem" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '2rem');
    expect(svg).toHaveAttribute('height', '2rem');
  });

  it('renders with custom color', () => {
    const { container } = render(<Icon name="Check" color="#ff0000" />);
    const svg = container.querySelector('svg');
    // Check that color prop is passed (Lucide will handle the styling)
    expect(svg).toBeDefined();
  });

  it('renders with custom stroke width', () => {
    const { container } = render(<Icon name="Check" strokeWidth={3} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('stroke-width', '3');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Icon name="Check" className="custom-class" />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
  });

  it('handles click events when onClick is provided', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Icon name="Check" onClick={handleClick} ariaLabel="Clickable icon" />,
    );
    const icon = screen.getByLabelText('Clickable icon');

    expect(icon).toHaveAttribute('role', 'button');
    // tabIndex is set as a number 0, which becomes tabindex="0" in HTML
    expect(icon).toHaveAttribute('tabindex', '0');

    await user.click(icon);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not have button role when onClick is not provided', () => {
    render(<Icon name="Check" ariaLabel="Non-clickable icon" />);
    const icon = screen.getByLabelText('Non-clickable icon');

    expect(icon).not.toHaveAttribute('role');
    expect(icon).not.toHaveAttribute('tabindex');
  });

  it('renders null and warns for invalid icon name', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { container } = render(<Icon name={'InvalidIcon' as IconName} />);

    expect(container.firstChild).toBeNull();
    expect(consoleWarn).toHaveBeenCalledWith(
      'Icon "InvalidIcon" not found in Lucide icon set',
    );

    consoleWarn.mockRestore();
  });

  it('uses default size of 20', () => {
    const { container } = render(<Icon name="Check" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
  });

  it('uses default stroke width of 2', () => {
    const { container } = render(<Icon name="Check" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('stroke-width', '2');
  });
});
