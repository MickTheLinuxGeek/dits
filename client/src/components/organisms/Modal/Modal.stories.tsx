import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Form } from '@/components/molecules/Form';
import React from 'react';

const meta: Meta<typeof Modal> = {
  title: 'Organisms/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible Modal component with proper focus management, backdrop, and accessibility features. Supports different sizes, custom content, and keyboard navigation.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Simple modal example
export const Default: Story = {
  render: function DefaultStory() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Default Modal"
        >
          <p>
            This is a simple modal with default settings. It includes a title,
            close button, and can be closed by clicking the backdrop or pressing
            Escape.
          </p>
          <p>
            The modal automatically manages focus and prevents body scrolling
            while open.
          </p>
        </Modal>
      </>
    );
  },
};

// Modal with custom footer
export const WithFooter: Story = {
  render: function WithFooterStory() {
    const [isOpen, setIsOpen] = React.useState(false);

    const footer = (
      <>
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button onClick={() => setIsOpen(false)}>Save Changes</Button>
      </>
    );

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal with Footer</Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal with Footer"
          footer={footer}
        >
          <p>This modal includes a custom footer with action buttons.</p>
        </Modal>
      </>
    );
  },
};

// Form modal example
export const FormModal: Story = {
  render: function FormModalStory() {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsOpen(false);
    };

    const footer = (
      <>
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" form="user-form">
          Create User
        </Button>
      </>
    );

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Create New User</Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Create New User"
          footer={footer}
          size="md"
        >
          <Form id="user-form" onSubmit={handleSubmit}>
            <Input
              label="First Name"
              placeholder="Enter first name"
              isRequired
              fullWidth
            />
            <Input
              label="Last Name"
              placeholder="Enter last name"
              isRequired
              fullWidth
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter email address"
              isRequired
              fullWidth
            />
          </Form>
        </Modal>
      </>
    );
  },
};

// Different sizes
export const Sizes: Story = {
  render: function SizesStory() {
    const [openModal, setOpenModal] = React.useState<string | null>(null);

    const sizes = [
      { key: 'sm', label: 'Small' },
      { key: 'md', label: 'Medium' },
      { key: 'lg', label: 'Large' },
      { key: 'xl', label: 'Extra Large' },
      { key: 'full', label: 'Full Screen' },
    ];

    return (
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {sizes.map(({ key, label }) => (
          <div key={key}>
            <Button onClick={() => setOpenModal(key)}>{label} Modal</Button>

            <Modal
              isOpen={openModal === key}
              onClose={() => setOpenModal(null)}
              title={`${label} Modal`}
              size={key as import('./Modal').ModalProps['size']}
            >
              <p>
                This is a {label.toLowerCase()} modal. The content area will
                adjust to the specified size.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </Modal>
          </div>
        ))}
      </div>
    );
  },
};

// Modal without close button
export const NoCloseButton: Story = {
  render: function NoCloseButtonStory() {
    const [isOpen, setIsOpen] = React.useState(false);

    const footer = <Button onClick={() => setIsOpen(false)}>Done</Button>;

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Open Modal (No Close Button)
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal without Close Button"
          showCloseButton={false}
          footer={footer}
        >
          <p>
            This modal doesn't have a close button in the header. You can still
            close it by clicking the backdrop or using the action button.
          </p>
        </Modal>
      </>
    );
  },
};

// Modal with custom close behavior
export const CustomCloseBehavior: Story = {
  render: function CustomCloseBehaviorStory() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Open Modal (Custom Close)
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Custom Close Behavior"
          closeOnBackdropClick={false}
          closeOnEscape={false}
          footer={<Button onClick={() => setIsOpen(false)}>Close Modal</Button>}
        >
          <p>
            This modal cannot be closed by clicking the backdrop or pressing
            Escape. You must use the close button or action button.
          </p>
        </Modal>
      </>
    );
  },
};
