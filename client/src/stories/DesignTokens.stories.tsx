import type { Meta, StoryObj } from '@storybook/react';
import { colors, lightTheme, darkTheme } from '../styles/tokens';
import { spacing, borderRadius } from '../styles/spacing';
import { fontSizes, fontWeights } from '../styles/typography';

const meta = {
  title: 'Design System/Tokens',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Color palette showcase
 */
export const Colors: Story = {
  render: () => (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Color Palette</h2>

      {/* Primary Colors */}
      <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Primary (Blue)</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {Object.entries(colors.primary).map(([shade, color]) => (
          <div key={shade} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: color,
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            />
            <div style={{ fontSize: '12px', marginTop: '8px' }}>{shade}</div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>{color}</div>
          </div>
        ))}
      </div>

      {/* Gray Scale */}
      <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Gray Scale</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {Object.entries(colors.gray).map(([shade, color]) => (
          <div key={shade} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: color,
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            />
            <div style={{ fontSize: '12px', marginTop: '8px' }}>{shade}</div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>{color}</div>
          </div>
        ))}
      </div>

      {/* Semantic Colors */}
      <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Semantic Colors</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div>
          <h4>Success</h4>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.entries(colors.success)
              .slice(4, 7)
              .map(([shade, color]) => (
                <div
                  key={shade}
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: color,
                    borderRadius: '4px',
                  }}
                />
              ))}
          </div>
        </div>
        <div>
          <h4>Warning</h4>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.entries(colors.warning)
              .slice(4, 7)
              .map(([shade, color]) => (
                <div
                  key={shade}
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: color,
                    borderRadius: '4px',
                  }}
                />
              ))}
          </div>
        </div>
        <div>
          <h4>Error</h4>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.entries(colors.error)
              .slice(4, 7)
              .map(([shade, color]) => (
                <div
                  key={shade}
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: color,
                    borderRadius: '4px',
                  }}
                />
              ))}
          </div>
        </div>
        <div>
          <h4>Info</h4>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.entries(colors.info)
              .slice(4, 7)
              .map(([shade, color]) => (
                <div
                  key={shade}
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: color,
                    borderRadius: '4px',
                  }}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Spacing scale showcase
 */
export const Spacing: Story = {
  render: () => (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Spacing Scale (8pt Grid)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3, 4, 6, 8, 12, 16, 24].map((size) => (
          <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '60px', fontSize: '14px', fontWeight: 600 }}>
              {size} ({spacing[size as keyof typeof spacing]})
            </div>
            <div
              style={{
                width: spacing[size as keyof typeof spacing],
                height: '32px',
                backgroundColor: '#3b82f6',
                borderRadius: '4px',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  ),
};

/**
 * Border radius showcase
 */
export const BorderRadius: Story = {
  render: () => (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Border Radius</h2>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {Object.entries(borderRadius).map(([name, value]) => (
          <div key={name} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#3b82f6',
                borderRadius: value,
              }}
            />
            <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};

/**
 * Typography showcase
 */
export const Typography: Story = {
  render: () => (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Typography</h2>

      <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Font Sizes</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.entries(fontSizes).map(([name, size]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
            <div style={{ width: '80px', fontSize: '12px', color: '#6b7280' }}>
              {name} ({size})
            </div>
            <div style={{ fontSize: size }}>The quick brown fox jumps over the lazy dog</div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Font Weights</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.entries(fontWeights).map(([name, weight]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
            <div style={{ width: '80px', fontSize: '12px', color: '#6b7280' }}>
              {name} ({weight})
            </div>
            <div style={{ fontSize: '16px', fontWeight: weight }}>
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
