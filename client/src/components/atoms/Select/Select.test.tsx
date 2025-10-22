import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';
import styles from './Select.module.css';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
];

describe('Select', () => {
  it('renders select with options', () => {
    render(<Select options={mockOptions} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Option 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Option 2' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Option 3' }),
    ).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select options={mockOptions} label="Choose option" />);
    expect(screen.getByLabelText('Choose option')).toBeInTheDocument();
  });

  it('renders with required indicator', () => {
    render(<Select options={mockOptions} label="Choose option" isRequired />);
    const required = screen.getByLabelText('required');
    expect(required).toBeInTheDocument();
    expect(required).toHaveTextContent('*');
  });

  it('renders with helper text', () => {
    render(
      <Select options={mockOptions} helperText="Please select an option" />,
    );
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(
      <Select
        options={mockOptions}
        error
        errorMessage="Selection is required"
      />,
    );
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent('Selection is required');
  });

  it('does not show helper text when error message is present', () => {
    render(
      <Select
        options={mockOptions}
        helperText="Helper"
        error
        errorMessage="Error"
      />,
    );
    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('applies error class when error is true', () => {
    render(<Select options={mockOptions} error />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass(styles.error);
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies the correct size classes', () => {
    const { rerender } = render(<Select options={mockOptions} size="sm" />);
    let select = screen.getByRole('combobox');
    expect(select).toHaveClass(styles.sm);

    rerender(<Select options={mockOptions} size="md" />);
    select = screen.getByRole('combobox');
    expect(select).toHaveClass(styles.md);

    rerender(<Select options={mockOptions} size="lg" />);
    select = screen.getByRole('combobox');
    expect(select).toHaveClass(styles.lg);
  });

  it('disables select when disabled prop is true', () => {
    render(<Select options={mockOptions} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('applies fullWidth class', () => {
    render(<Select options={mockOptions} fullWidth />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass(styles.fullWidth);
  });

  it('disables specific options', () => {
    render(<Select options={mockOptions} />);
    const disabledOption = screen.getByRole('option', {
      name: 'Option 3',
    }) as HTMLOptionElement;
    expect(disabledOption.disabled).toBe(true);
  });

  it('handles value change', async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);
    const select = screen.getByRole('combobox');

    await user.selectOptions(select, 'option2');
    expect(select).toHaveValue('option2');
  });

  it('links select to label with htmlFor', () => {
    render(<Select options={mockOptions} label="Select" id="select-input" />);
    const label = screen.getByText('Select');
    expect(label).toHaveAttribute('for', 'select-input');
  });

  it('generates unique id when not provided', () => {
    const { container } = render(<Select options={mockOptions} />);
    const select = container.querySelector('select');
    expect(select?.id).toMatch(/^select-/);
  });

  it('links error message with aria-describedby', () => {
    render(
      <Select
        options={mockOptions}
        error
        errorMessage="Error"
        id="test-select"
      />,
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-describedby', 'test-select-error');
  });

  it('links helper text with aria-describedby', () => {
    render(
      <Select options={mockOptions} helperText="Helper" id="test-select" />,
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-describedby', 'test-select-helper');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Select options={mockOptions} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it('applies custom className', () => {
    render(<Select options={mockOptions} className="custom-select" />);
    expect(screen.getByRole('combobox')).toHaveClass('custom-select');
  });

  it('passes through additional props', () => {
    render(
      <Select
        options={mockOptions}
        name="mySelect"
        data-testid="test-select"
      />,
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('name', 'mySelect');
    expect(select).toHaveAttribute('data-testid', 'test-select');
  });

  it('sets required attribute when isRequired is true', () => {
    render(<Select options={mockOptions} isRequired />);
    expect(screen.getByRole('combobox')).toBeRequired();
  });

  it('renders chevron icon', () => {
    const { container } = render(<Select options={mockOptions} />);
    const chevron = container.querySelector(`.${styles.chevronIcon}`);
    expect(chevron).toBeInTheDocument();
  });

  it('renders empty list correctly', () => {
    render(<Select options={[]} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select.children).toHaveLength(0);
  });

  it('uses default values', () => {
    render(<Select options={mockOptions} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass(styles.md);
  });
});
