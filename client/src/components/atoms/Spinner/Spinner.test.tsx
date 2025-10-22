import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';
import styles from './Spinner.module.css';

describe('Spinner', () => {
  it('renders spinner with default props', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders with custom label', () => {
    render(<Spinner label="Please wait" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Please wait',
    );
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('applies the correct size classes', () => {
    const { rerender } = render(<Spinner size="xs" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.xs);

    rerender(<Spinner size="sm" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.sm);

    rerender(<Spinner size="md" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.md);

    rerender(<Spinner size="lg" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.lg);

    rerender(<Spinner size="xl" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.xl);
  });

  it('applies the correct color classes', () => {
    const { rerender } = render(<Spinner color="primary" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.primary);

    rerender(<Spinner color="secondary" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.secondary);

    rerender(<Spinner color="white" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.white);

    rerender(<Spinner color="current" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.current);
  });

  it('applies the correct thickness classes', () => {
    const { rerender } = render(<Spinner thickness="thin" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.thin);

    rerender(<Spinner thickness="medium" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.medium);

    rerender(<Spinner thickness="thick" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.thick);
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-spinner" />);
    expect(screen.getByRole('status')).toHaveClass('custom-spinner');
  });

  it('renders with label text in wrapper', () => {
    const { container } = render(<Spinner label="Loading data" />);
    const wrapper = container.querySelector(`.${styles.wrapper}`);
    expect(wrapper).toBeInTheDocument();
    expect(screen.getByText('Loading data')).toBeInTheDocument();
  });

  it('uses default values', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(styles.md);
    expect(spinner).toHaveClass(styles.primary);
    expect(spinner).toHaveClass(styles.medium);
  });

  it('renders four ring elements', () => {
    const { container } = render(<Spinner />);
    const rings = container.querySelectorAll(`.${styles.ring}`);
    expect(rings).toHaveLength(4);
  });
});
