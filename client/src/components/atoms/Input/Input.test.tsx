import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';
import styles from './Input.module.css';

describe('Input', () => {
  it('renders input with default props', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders with required indicator', () => {
    render(<Input label="Email" isRequired />);
    const required = screen.getByLabelText('required');
    expect(required).toBeInTheDocument();
    expect(required).toHaveTextContent('*');
  });

  it('renders with helper text', () => {
    render(<Input helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Input error errorMessage="Email is required" />);
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent('Email is required');
  });

  it('does not show helper text when error message is present', () => {
    render(
      <Input helperText="Helper text" error errorMessage="Error message" />,
    );
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('applies error class when error is true', () => {
    render(<Input error />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(styles.error);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies the correct size classes', () => {
    const { rerender } = render(<Input size="sm" />);
    let input = screen.getByRole('textbox');
    expect(input).toHaveClass(styles.sm);

    rerender(<Input size="md" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveClass(styles.md);

    rerender(<Input size="lg" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveClass(styles.lg);
  });

  it('applies the correct variant classes', () => {
    const { rerender } = render(<Input variant="default" />);
    let input = screen.getByRole('textbox');
    expect(input).toHaveClass(styles.default);

    rerender(<Input variant="filled" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveClass(styles.filled);

    rerender(<Input variant="flushed" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveClass(styles.flushed);
  });

  it('disables input when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('disables input when isLoading is true', () => {
    render(<Input isLoading />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies fullWidth class', () => {
    render(<Input fullWidth />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(styles.fullWidth);
  });

  it('renders with left icon', () => {
    const { container } = render(<Input leftIcon="Mail" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(styles.hasLeftIcon);
    expect(container.querySelector(`.${styles.leftIcon}`)).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const { container } = render(<Input rightIcon="Eye" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(styles.hasRightIcon);
    expect(container.querySelector(`.${styles.rightIcon}`)).toBeInTheDocument();
  });

  it('shows loading icon instead of left icon when loading', () => {
    const { container } = render(<Input leftIcon="Mail" isLoading />);
    const loadingIcon = container.querySelector(`.${styles.loadingIcon}`);
    expect(loadingIcon).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'test@example.com');
    expect(input).toHaveValue('test@example.com');
  });

  it('links input to label with htmlFor', () => {
    render(<Input label="Email" id="email-input" />);
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('generates unique id when not provided', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input?.id).toMatch(/^input-/);
  });

  it('links error message with aria-describedby', () => {
    render(<Input error errorMessage="Error" id="test-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
  });

  it('links helper text with aria-describedby', () => {
    render(<Input helperText="Helper" id="test-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('passes through additional props', () => {
    render(<Input placeholder="Enter email" type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('sets required attribute when isRequired is true', () => {
    render(<Input isRequired />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });
});
