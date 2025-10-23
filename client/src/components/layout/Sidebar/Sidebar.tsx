import { SidebarSection } from '../SidebarSection/SidebarSection';
import { NavItem } from '../NavItem/NavItem';
import { mockProjects, mockAreas, mockNavigationCounts } from '../../../mocks';
import styles from './Sidebar.module.css';

/**
 * Main sidebar navigation component
 * Contains logo, Smart Views, Projects, and Areas sections
 */
export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>D</div>
        <span className={styles.logoText}>DITS</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {/* Smart Views Section */}
        <SidebarSection title="Smart Views">
          <NavItem
            to="/inbox"
            icon="📥"
            label="Inbox"
            count={mockNavigationCounts.inbox}
          />
          <NavItem
            to="/today"
            icon="📅"
            label="Today"
            count={mockNavigationCounts.today}
          />
          <NavItem
            to="/upcoming"
            icon="🔜"
            label="Upcoming"
            count={mockNavigationCounts.upcoming}
          />
          <NavItem
            to="/logbook"
            icon="📚"
            label="Logbook"
            count={mockNavigationCounts.logbook}
          />
        </SidebarSection>

        {/* Projects Section */}
        <SidebarSection title="Projects">
          {mockProjects.map((project) => (
            <NavItem
              key={project.id}
              to={`/projects/${project.id}`}
              icon={project.icon}
              label={project.name}
              count={project.issueCount}
            />
          ))}
        </SidebarSection>

        {/* Areas Section */}
        <SidebarSection title="Areas">
          {mockAreas.map((area) => (
            <NavItem
              key={area.id}
              to={`/areas/${area.id}`}
              icon={area.icon}
              label={area.name}
              count={area.issueCount}
            />
          ))}
        </SidebarSection>
      </nav>
    </aside>
  );
}
