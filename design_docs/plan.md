# DITS Implementation Plan
## Developer Issue Tracking System - Solo Developer Focus

### Executive Summary

This document outlines the detailed implementation plan for DITS (Developer Issue Tracking System), a purpose-built issue tracker designed exclusively for individual software developers. The system addresses the "collaboration tax" imposed by team-oriented tools while providing deep integration with developer ecosystems.

### Project Overview

**Vision**: Create a "personal IDE for tasks" that combines the speed and focus of personal task managers with the deep developer integrations of professional tools.

**Core Principles**:
1. **Frictionless Capture** - Zero-friction issue creation from anywhere
2. **Optimized for Flow State** - Sub-100ms interactions, keyboard-first design
3. **Context is King** - Deep bidirectional Git integration
4. **User Owns Their Data** - Complete data portability and export

---

## 1. System Architecture

### 1.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Applications"
        WEB[Web App<br/>React/TypeScript]
        DESKTOP[Desktop Apps<br/>Native per Platform]
        MOBILE[Mobile Apps<br/>React Native]
        IDE[IDE Extensions<br/>VS Code, JetBrains]
    end
    
    subgraph "API Gateway"
        GATEWAY[API Gateway<br/>Rate Limiting, Auth]
    end
    
    subgraph "Core Services"
        AUTH[Auth Service<br/>JWT, OAuth2]
        ISSUE[Issue Service<br/>CRUD, Search]
        PROJECT[Project Service<br/>Organization]
        SYNC[Sync Service<br/>Real-time Updates]
        INTEGRATION[Integration Service<br/>Git Providers]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL<br/>Primary Data)]
        REDIS[(Redis<br/>Cache, Sessions)]
        SEARCH[(Elasticsearch<br/>Full-text Search)]
    end
    
    subgraph "External Services"
        GITHUB[GitHub API]
        GITLAB[GitLab API]
        BITBUCKET[Bitbucket API]
    end
    
    WEB --> GATEWAY
    DESKTOP --> GATEWAY
    MOBILE --> GATEWAY
    IDE --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> ISSUE
    GATEWAY --> PROJECT
    GATEWAY --> SYNC
    GATEWAY --> INTEGRATION
    
    AUTH --> POSTGRES
    AUTH --> REDIS
    ISSUE --> POSTGRES
    ISSUE --> SEARCH
    PROJECT --> POSTGRES
    SYNC --> REDIS
    
    INTEGRATION --> GITHUB
    INTEGRATION --> GITLAB
    INTEGRATION --> BITBUCKET
```

### 1.2 Technology Stack

**Backend Services**:
- **Language**: Node.js with TypeScript
- **Framework**: Express.js with Helmet, CORS
- **Database**: PostgreSQL 15+ (primary), Redis (cache/sessions)
- **Search**: Elasticsearch for full-text search
- **Authentication**: JWT with refresh tokens, OAuth2 for Git providers
- **Real-time**: WebSocket connections for live updates
- **API**: GraphQL with REST fallbacks

**Frontend Applications**:
- **Web**: React 18+ with TypeScript, Vite build system
- **Desktop**: 
  - macOS: Swift/SwiftUI
  - Windows: .NET MAUI/WPF
  - Linux: Electron (performance compromise acceptable for Linux)
- **Mobile**: React Native with platform-specific optimizations
- **IDE Extensions**: Platform-specific APIs (VS Code Extension API, JetBrains Plugin SDK)

**Infrastructure**:
- **Cloud Provider**: AWS (primary), with multi-region support
- **Container Orchestration**: Docker + Kubernetes
- **CDN**: CloudFront for static assets
- **Monitoring**: DataDog for APM, logging, and metrics
- **CI/CD**: GitHub Actions

---

## 2. Data Model Design

### 2.1 Core Entities

```mermaid
erDiagram
    User ||--o{ Project : owns
    User ||--o{ Area : owns
    User ||--o{ Issue : creates
    User ||--o{ Label : creates
    
    Project ||--o{ Issue : contains
    Area ||--o{ Issue : contains
    
    Issue ||--o{ Issue : "parent/child"
    Issue }o--o{ Label : tagged_with
    Issue ||--o{ IssueRelation : source
    Issue ||--o{ IssueRelation : target
    Issue ||--o{ GitIntegration : linked_to
    
    Project ||--o{ Workflow : has
    Workflow ||--o{ Status : contains
    Issue }o--|| Status : has_status
    
    User {
        uuid id PK
        string email UK
        string password_hash
        string name
        json preferences
        timestamp created_at
        timestamp updated_at
    }
    
    Project {
        uuid id PK
        uuid user_id FK
        string name
        text description
        string status
        date start_date
        date end_date
        json settings
        timestamp created_at
        timestamp updated_at
    }
    
    Area {
        uuid id PK
        uuid user_id FK
        string name
        text description
        string color
        json settings
        timestamp created_at
        timestamp updated_at
    }
    
    Issue {
        uuid id PK
        uuid user_id FK
        uuid project_id FK
        uuid area_id FK
        uuid parent_issue_id FK
        uuid status_id FK
        string title
        text description
        string priority
        date start_date
        date due_date
        json metadata
        timestamp created_at
        timestamp updated_at
    }
    
    Label {
        uuid id PK
        uuid user_id FK
        string name
        string color
        timestamp created_at
    }
    
    Status {
        uuid id PK
        uuid workflow_id FK
        string name
        string color
        int position
        boolean is_closed
        timestamp created_at
    }
    
    Workflow {
        uuid id PK
        uuid project_id FK
        string name
        json transitions
        timestamp created_at
        timestamp updated_at
    }
    
    GitIntegration {
        uuid id PK
        uuid issue_id FK
        string provider
        string repository
        string branch_name
        string pr_url
        string commit_hash
        json metadata
        timestamp created_at
        timestamp updated_at
    }
```

### 2.2 Database Schema Considerations

**Performance Optimizations**:
- Composite indexes on `(user_id, created_at)` for timeline queries
- Full-text search indexes on issue titles and descriptions
- Partial indexes for active issues (`WHERE status != 'closed'`)
- Connection pooling with read replicas for search-heavy operations

**Data Integrity**:
- Foreign key constraints with CASCADE deletes for user data
- Check constraints for priority levels and status transitions
- Unique constraints on user-scoped entities (project names, label names)

---

## 3. API Architecture

### 3.1 GraphQL Schema Design

**Core Types**:
```graphql
type User {
  id: ID!
  email: String!
  name: String!
  preferences: JSON
  projects: [Project!]!
  areas: [Area!]!
  issues: [Issue!]!
}

type Issue {
  id: ID!
  title: String!
  description: String
  priority: Priority!
  status: Status!
  project: Project
  area: Area
  labels: [Label!]!
  startDate: Date
  dueDate: Date
  parentIssue: Issue
  subIssues: [Issue!]!
  gitIntegrations: [GitIntegration!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Project {
  id: ID!
  name: String!
  description: String
  status: ProjectStatus!
  workflow: Workflow!
  issues: [Issue!]!
  startDate: Date
  endDate: Date
}

type Area {
  id: ID!
  name: String!
  description: String
  color: String!
  issues: [Issue!]!
}

enum Priority {
  NO_PRIORITY
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

**Key Mutations**:
```graphql
type Mutation {
  # Issue Management
  createIssue(input: CreateIssueInput!): Issue!
  updateIssue(id: ID!, input: UpdateIssueInput!): Issue!
  deleteIssue(id: ID!): Boolean!
  
  # Project Management
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  
  # Git Integration
  createBranch(issueId: ID!, branchName: String): GitIntegration!
  linkPullRequest(issueId: ID!, prUrl: String!): GitIntegration!
}
```

**Advanced Queries**:
```graphql
type Query {
  # Smart Views
  inbox: [Issue!]!
  today: [Issue!]!
  upcoming(days: Int = 7): [Issue!]!
  logbook(limit: Int = 50): [Issue!]!
  
  # Search & Filter
  searchIssues(
    query: String!
    filters: IssueFilters
    sort: IssueSort
    limit: Int = 20
    offset: Int = 0
  ): IssueSearchResult!
  
  # Analytics
  issueStats(projectId: ID, areaId: ID): IssueStats!
}
```

### 3.2 REST API Endpoints

**Core CRUD Operations** (for simpler integrations):
```
GET    /api/v1/issues              # List issues with filters
POST   /api/v1/issues              # Create issue
GET    /api/v1/issues/:id          # Get issue details
PUT    /api/v1/issues/:id          # Update issue
DELETE /api/v1/issues/:id          # Delete issue

GET    /api/v1/projects            # List projects
POST   /api/v1/projects            # Create project
GET    /api/v1/projects/:id        # Get project details
PUT    /api/v1/projects/:id        # Update project

# Git Integration
POST   /api/v1/issues/:id/branch   # Create branch from issue
POST   /api/v1/issues/:id/pr       # Link PR to issue

# Webhooks
POST   /api/v1/webhooks            # Create webhook
GET    /api/v1/webhooks            # List webhooks
DELETE /api/v1/webhooks/:id        # Delete webhook
```

### 3.3 Real-time Updates

**WebSocket Events**:
```typescript
interface WebSocketEvents {
  'issue:created': Issue;
  'issue:updated': Issue;
  'issue:deleted': { id: string };
  'issue:status_changed': { id: string; oldStatus: string; newStatus: string };
  'project:updated': Project;
  'git:branch_created': GitIntegration;
  'git:pr_linked': GitIntegration;
  'git:pr_merged': GitIntegration;
}
```

---

## 4. User Interface Design

### 4.1 Design System

**Visual Hierarchy**:
- **Primary Colors**: Deep blue (#1a365d) for focus, Green (#38a169) for success
- **Typography**: Inter font family for readability
- **Spacing**: 8px grid system for consistent layouts
- **Components**: Atomic design methodology with reusable components

**Responsive Breakpoints**:
- Mobile: 320px - 768px
- Tablet: 768px - 1024px  
- Desktop: 1024px+

### 4.2 Core Views

**Dashboard Layout**:
```mermaid
graph TB
    subgraph "Main Layout"
        SIDEBAR[Sidebar Navigation<br/>Projects, Areas, Smart Views]
        HEADER[Header<br/>Search, Command Palette, User Menu]
        MAIN[Main Content Area<br/>Dynamic View Container]
        QUICKADD[Quick Add Button<br/>Floating Action]
    end
    
    subgraph "View Types"
        LIST[List View<br/>Dense table with sorting]
        BOARD[Board View<br/>Kanban columns]
        CALENDAR[Calendar View<br/>Monthly/weekly grid]
    end
    
    MAIN --> LIST
    MAIN --> BOARD
    MAIN --> CALENDAR
```

**Issue Detail Modal**:
- Full-screen overlay on mobile, modal on desktop
- Rich text editor with Markdown preview
- Inline editing for all fields
- Git integration status panel
- Sub-task management interface

### 4.3 Keyboard Navigation

**Global Shortcuts**:
- `Cmd/Ctrl + K`: Command palette
- `C`: Create new issue
- `G + I`: Go to Inbox
- `G + T`: Go to Today
- `G + U`: Go to Upcoming
- `/`: Focus search

**List Navigation**:
- `J/K`: Move selection up/down
- `Enter`: Open selected issue
- `E`: Edit selected issue
- `L`: Add label to selected issue
- `P`: Set priority
- `D`: Set due date

### 4.4 Command Palette

**Command Categories**:
```typescript
interface Command {
  id: string;
  title: string;
  category: 'navigation' | 'action' | 'creation' | 'filter';
  shortcut?: string;
  icon?: string;
  action: () => void;
}

const commands: Command[] = [
  // Navigation
  { id: 'go-inbox', title: 'Go to Inbox', category: 'navigation', shortcut: 'g i' },
  { id: 'go-today', title: 'Go to Today', category: 'navigation', shortcut: 'g t' },
  
  // Creation
  { id: 'new-issue', title: 'Create New Issue', category: 'creation', shortcut: 'c' },
  { id: 'new-project', title: 'Create New Project', category: 'creation' },
  
  // Actions
  { id: 'change-status', title: 'Change Status', category: 'action' },
  { id: 'set-priority', title: 'Set Priority', category: 'action', shortcut: 'p' },
  
  // Filters
  { id: 'filter-high-priority', title: 'Show High Priority Issues', category: 'filter' },
  { id: 'filter-due-today', title: 'Show Issues Due Today', category: 'filter' }
];
```

---

## 5. Git Integration Architecture

### 5.1 Provider Abstraction

**Unified Interface**:
```typescript
interface GitProvider {
  name: 'github' | 'gitlab' | 'bitbucket';
  
  // Authentication
  authenticate(code: string): Promise<AccessToken>;
  refreshToken(refreshToken: string): Promise<AccessToken>;
  
  // Repository Operations
  listRepositories(): Promise<Repository[]>;
  createBranch(repo: string, branchName: string, baseBranch: string): Promise<Branch>;
  
  // Pull Request Operations
  createPullRequest(repo: string, branch: string, title: string, description: string): Promise<PullRequest>;
  getPullRequest(repo: string, prNumber: number): Promise<PullRequest>;
  
  // Webhook Management
  createWebhook(repo: string, url: string, events: string[]): Promise<Webhook>;
  deleteWebhook(repo: string, webhookId: string): Promise<void>;
}
```

### 5.2 Branch Naming Strategy

**Automatic Branch Generation**:
```typescript
function generateBranchName(issue: Issue): string {
  const prefix = issue.priority === 'URGENT' ? 'hotfix' : 
                 issue.labels.includes('bug') ? 'bugfix' : 'feature';
  
  const sanitizedTitle = issue.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
    
  return `${prefix}/${issue.id.substring(0, 8)}-${sanitizedTitle}`;
}

// Examples:
// feature/a1b2c3d4-implement-user-authentication
// bugfix/e5f6g7h8-fix-login-validation-error
// hotfix/i9j0k1l2-critical-security-patch
```

### 5.3 Webhook Processing

**Event Handling Pipeline**:
```mermaid
graph LR
    WEBHOOK[Git Provider Webhook] --> VALIDATE[Validate Signature]
    VALIDATE --> PARSE[Parse Event Data]
    PARSE --> MATCH[Match to Issue]
    MATCH --> UPDATE[Update Issue Status]
    UPDATE --> NOTIFY[Notify User]
    
    subgraph "Event Types"
        PR_OPENED[PR Opened]
        PR_MERGED[PR Merged]
        BRANCH_CREATED[Branch Created]
        COMMIT_PUSHED[Commit Pushed]
    end
```

**Automatic Status Transitions**:
- Branch created → Move to "In Progress"
- PR opened → Move to "In Review"  
- PR merged → Move to "Done"
- PR closed without merge → Move back to "To Do"

---

## 6. Desktop Application Architecture

### 6.1 Platform-Specific Implementations

**macOS (Swift/SwiftUI)**:
```swift
// Main App Structure
@main
struct DITSApp: App {
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
        .commands {
            DITSCommands()
        }
        
        MenuBarExtra("DITS", systemImage: "checkmark.circle") {
            QuickEntryView()
        }
    }
}

// Quick Entry from Menu Bar
struct QuickEntryView: View {
    @State private var title = ""
    @State private var description = ""
    
    var body: some View {
        VStack {
            TextField("Issue title", text: $title)
            TextEditor(text: $description)
            Button("Create Issue") {
                createIssue()
            }
        }
        .frame(width: 400, height: 200)
    }
}
```

**Windows (.NET MAUI/WPF)**:
```csharp
// Main Window
public partial class MainWindow : Window
{
    private readonly IssueService _issueService;
    private readonly HotKeyManager _hotKeyManager;
    
    public MainWindow()
    {
        InitializeComponent();
        RegisterGlobalHotKeys();
    }
    
    private void RegisterGlobalHotKeys()
    {
        // Ctrl+Alt+Space for quick entry
        _hotKeyManager.Register(ModifierKeys.Control | ModifierKeys.Alt, 
                               Key.Space, ShowQuickEntry);
    }
    
    private void ShowQuickEntry()
    {
        var quickEntry = new QuickEntryWindow();
        quickEntry.Show();
        quickEntry.Activate();
    }
}
```

### 6.2 Offline Synchronization

**Conflict Resolution Strategy**:
```typescript
interface SyncConflict {
  localVersion: Issue;
  remoteVersion: Issue;
  conflictFields: string[];
}

class ConflictResolver {
  resolve(conflict: SyncConflict): Issue {
    // Last-write-wins for most fields
    const resolved = { ...conflict.remoteVersion };
    
    // Special handling for description (merge if possible)
    if (conflict.conflictFields.includes('description')) {
      resolved.description = this.mergeDescriptions(
        conflict.localVersion.description,
        conflict.remoteVersion.description
      );
    }
    
    // Always preserve local status changes
    if (conflict.conflictFields.includes('status')) {
      resolved.status = conflict.localVersion.status;
    }
    
    return resolved;
  }
}
```

---

## 7. Mobile Application Strategy

### 7.1 React Native Architecture

**Core Features for Mobile**:
- Quick issue capture with camera integration
- Inbox management and triage
- Today view for daily planning
- Push notifications for important updates
- Offline reading and basic editing

**Navigation Structure**:
```typescript
// Bottom Tab Navigation
const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Inbox" component={InboxScreen} />
    <Tab.Screen name="Today" component={TodayScreen} />
    <Tab.Screen name="Capture" component={CaptureScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Quick Capture Screen
const CaptureScreen = () => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<string | null>(null);
  
  const captureImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="What needs to be done?"
        value={title}
        onChangeText={setTitle}
        style={styles.titleInput}
      />
      
      <TouchableOpacity onPress={captureImage} style={styles.cameraButton}>
        <Text>Add Screenshot</Text>
      </TouchableOpacity>
      
      {image && <Image source={{ uri: image }} style={styles.preview} />}
      
      <Button title="Create Issue" onPress={createIssue} />
    </View>
  );
};
```

### 7.2 Platform-Specific Optimizations

**iOS Integrations**:
- Shortcuts app integration for Siri voice capture
- Widget for Today view on home screen
- Share extension for capturing from other apps

**Android Integrations**:
- Quick Settings tile for instant capture
- Adaptive icon and notification channels
- Intent filters for sharing from other apps

---

## 8. IDE Extensions

### 8.1 VS Code Extension

**Core Features**:
```typescript
// Extension Entry Point
export function activate(context: vscode.ExtensionContext) {
  // Register commands
  const createIssueCommand = vscode.commands.registerCommand(
    'dits.createIssue',
    createIssueFromSelection
  );
  
  const showIssuesCommand = vscode.commands.registerCommand(
    'dits.showIssues',
    showIssuesPanel
  );
  
  // Register tree data provider for sidebar
  const issueProvider = new IssueTreeDataProvider();
  vscode.window.createTreeView('ditsIssues', {
    treeDataProvider: issueProvider
  });
  
  // Register status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  updateStatusBarWithCurrentIssue(statusBarItem);
  
  context.subscriptions.push(
    createIssueCommand,
    showIssuesCommand,
    statusBarItem
  );
}

// Create issue from selected code
async function createIssueFromSelection() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  
  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  const fileName = editor.document.fileName;
  const lineNumber = selection.start.line + 1;
  
  const issue = await vscode.window.showInputBox({
    prompt: 'Issue title',
    placeHolder: 'Describe the issue...'
  });
  
  if (issue) {
    await createIssue({
      title: issue,
      description: `File: ${fileName}\nLine: ${lineNumber}\n\n\`\`\`\n${selectedText}\n\`\`\``,
      labels: ['code-review']
    });
  }
}
```

**Sidebar Panel**:
```typescript
class IssueTreeDataProvider implements vscode.TreeDataProvider<Issue> {
  private _onDidChangeTreeData = new vscode.EventEmitter<Issue | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  
  getTreeItem(element: Issue): vscode.TreeItem {
    const item = new vscode.TreeItem(element.title);
    item.description = element.status;
    item.tooltip = element.description;
    item.command = {
      command: 'dits.openIssue',
      title: 'Open Issue',
      arguments: [element.id]
    };
    
    return item;
  }
  
  getChildren(element?: Issue): Thenable<Issue[]> {
    if (!element) {
      // Return root level issues (Today view)
      return this.getTodayIssues();
    }
    
    // Return sub-issues
    return this.getSubIssues(element.id);
  }
}
```

### 8.2 JetBrains Plugin

**Plugin Structure** (Kotlin):
```kotlin
// Plugin Main Class
class DITSPlugin : DumbAware {
    companion object {
        const val PLUGIN_ID = "com.dits.jetbrains"
    }
}

// Tool Window Factory
class IssueToolWindowFactory : ToolWindowFactory {
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val contentManager = toolWindow.contentManager
        val issuePanel = IssuePanel(project)
        val content = contentManager.factory.createContent(issuePanel, "Issues", false)
        contentManager.addContent(content)
    }
}

// Action for Creating Issues
class CreateIssueAction : AnAction("Create Issue from Selection") {
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val editor = e.getData(CommonDataKeys.EDITOR) ?: return
        
        val selectionModel = editor.selectionModel
        val selectedText = selectionModel.selectedText
        val document = editor.document
        val lineNumber = document.getLineNumber(selectionModel.selectionStart) + 1
        
        // Show create issue dialog
        val dialog = CreateIssueDialog(project, selectedText, lineNumber)
        if (dialog.showAndGet()) {
            // Create issue via API
            createIssueFromCode(dialog.getIssueData())
        }
    }
}
```

---

## 9. Security Implementation

### 9.1 Authentication & Authorization

**JWT Token Strategy**:
```typescript
interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

class AuthService {
  generateTokenPair(user: User): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
  }
  
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return this.generateAccessToken(user);
  }
}
```

**OAuth2 Integration**:
```typescript
class GitProviderAuth {
  async authenticateGitHub(code: string): Promise<GitHubToken> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    
    const data = await response.json();
    
    // Store encrypted token
    return this.encryptAndStoreToken(data.access_token, 'github');
  }
  
  private async encryptAndStoreToken(token: string, provider: string): Promise<GitHubToken> {
    const encrypted = await encrypt(token, process.env.ENCRYPTION_KEY!);
    
    return GitProviderToken.create({
      provider,
      encryptedToken: encrypted,
      userId: this.currentUser.id,
    });
  }
}
```

### 9.2 Data Encryption

**Encryption at Rest**:
```typescript
import { createCipher, createDecipher } from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  
  encrypt(text: string, key: string): string {
    const cipher = createCipher(this.algorithm, key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  decrypt(encryptedText: string, key: string): string {
    const decipher = createDecipher(this.algorithm, key);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

// Database field encryption
class EncryptedField {
  @BeforeInsert()
  @BeforeUpdate()
  encryptSensitiveData() {
    if (this.gitToken) {
      this.gitToken = encryptionService.encrypt(this.gitToken, process.env.ENCRYPTION_KEY!);
    }
  }
  
  @AfterLoad()
  decryptSensitiveData() {
    if (this.gitToken) {
      this.gitToken = encryptionService.decrypt(this.gitToken, process.env.ENCRYPTION_KEY!);
    }
  }
}
```

### 9.3 API Security

**Rate Limiting**:
```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Higher limits for Pro users
    return req.user?.tier === 'pro' ? 1000 : 100;
  },
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

const createIssueLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 issues per minute
  skipSuccessfulRequests: true,
});

app.use('/api/', apiLimiter);
app.use('/api/issues', createIssueLimiter);
```

**Input Validation**:
```typescript
import Joi from 'joi';

const createIssueSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(10000).optional(),
  priority: Joi.string().valid('NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT').required(),
  projectId: Joi.string().uuid().optional(),
  areaId: Joi.string().uuid().optional(),
  labels: Joi.array().items(Joi.string().uuid()).max(10).optional(),
  startDate: Date
  dueDate: Date
});

const validateInput = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
};
```

---

## 10. Testing Strategy

### 10.1 Testing Pyramid

**Unit Tests (70%)**:
```typescript
// Example: Issue Service Tests
describe('IssueService', () => {
  let issueService: IssueService;
  let mockRepository: jest.Mocked<IssueRepository>;
  
  beforeEach(() => {
    mockRepository = createMockRepository();
    issueService = new IssueService(mockRepository);
  });
  
  describe('createIssue', () => {
    it('should create issue with valid data', async () => {
      const issueData = {
        title: 'Test Issue',
        description: 'Test Description',
        priority: 'HIGH' as Priority,
        userId: 'user-123'
      };
      
      const expectedIssue = { id: 'issue-123', ...issueData };
      mockRepository.create.mockResolvedValue(expectedIssue);
      
      const result = await issueService.createIssue(issueData);
      
      expect(result).toEqual(expectedIssue);
      expect(mockRepository.create).toHaveBeenCalledWith(issueData);
    });
    
    it('should throw error for invalid priority', async () => {
      const issueData = {
        title: 'Test Issue',
        priority: 'INVALID' as Priority,
        userId: 'user-123'
      };
      
      await expect(issueService.createIssue(issueData))
        .rejects.toThrow('Invalid priority level');
    });
  });
});
```

**Integration Tests (20%)**:
```typescript
// Example: API Integration Tests
describe('Issues API', () => {
  let app: Express;
  let testDb: TestDatabase;
  let authToken: string;
  
  beforeAll(async () => {
    testDb = await setupTestDatabase();
    app = createTestApp(testDb);
    authToken = await createTestUser();
  });
  
  afterAll(async () => {
    await testDb.cleanup();
  });
  
  describe('POST /api/v1/issues', () => {
    it('should create issue with authentication', async () => {
      const issueData = {
        title: 'Integration Test Issue',
        description: 'Test Description',
        priority: 'MEDIUM'
      };
      
      const response = await request(app)
        .post('/api/v1/issues')
        .set('Authorization', `Bearer ${authToken}`)
        .send(issueData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        title: issueData.title,
        description: issueData.description,
        priority: issueData.priority
      });
      
      // Verify in database
      const savedIssue = await testDb.issues.findById(response.body.id);
      expect(savedIssue).toBeTruthy();
    });
  });
});
```

**End-to-End Tests (10%)**:
```typescript
// Example: Playwright E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Issue Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('should create and manage issue lifecycle', async ({ page }) => {
    // Create new issue
    await page.keyboard.press('c'); // Global shortcut
    await page.fill('[data-testid=issue-title]', 'E2E Test Issue');
    await page.fill('[data-testid=issue-description]', 'This is a test issue');
    await page.selectOption('[data-testid=priority-select]', 'HIGH');
    await page.click('[data-testid=create-issue-button]');
    
    // Verify issue appears in list
    await expect(page.locator('[data-testid=issue-list]')).toContainText('E2E Test Issue');
    
    // Update issue status
    await page.click('[data-testid=issue-item]:has-text("E2E Test Issue")');
    await page.selectOption('[data-testid=status-select]', 'IN_PROGRESS');
    await page.keyboard.press('Escape');
    
    // Verify status change
    await expect(page.locator('[data-testid=issue-item]:has-text("E2E Test Issue")')).toContainText('In Progress');
  });
  
  test('should use command palette for navigation', async ({ page }) => {
    await page.keyboard.press('Meta+k'); // Command palette
    await page.fill('[data-testid=command-input]', 'Go to Today');
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL('/today');
    await expect(page.locator('h1')).toContainText('Today');
  });
});
```

### 10.2 Performance Testing

**Load Testing with Artillery**:
```yaml
# artillery-config.yml
config:
  target: 'https://api.dits.dev'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  defaults:
    headers:
      Authorization: 'Bearer {{ $randomString() }}'

scenarios:
  - name: "Issue CRUD Operations"
    weight: 70
    flow:
      - post:
          url: "/api/v1/issues"
          json:
            title: "Load test issue {{ $randomString() }}"
            description: "Generated for load testing"
            priority: "MEDIUM"
      - get:
          url: "/api/v1/issues"
      - put:
          url: "/api/v1/issues/{{ id }}"
          json:
            status: "IN_PROGRESS"
  
  - name: "Search Operations"
    weight: 30
    flow:
      - get:
          url: "/api/v1/search"
          qs:
            q: "{{ $randomString() }}"
            limit: 20
```

**Performance Benchmarks**:
```typescript
// Performance test suite
describe('Performance Benchmarks', () => {
  test('API response times should be under 100ms', async () => {
    const startTime = Date.now();
    
    const response = await fetch('/api/v1/issues', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(100);
  });
  
  test('Search should handle 1000+ issues efficiently', async () => {
    // Create 1000 test issues
    await createTestIssues(1000);
    
    const startTime = Date.now();
    const response = await fetch('/api/v1/search?q=test&limit=50');
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(200);
    expect(response.status).toBe(200);
  });
});
```

---

## 11. Deployment & Infrastructure

### 11.1 AWS Infrastructure

**Infrastructure as Code (Terraform)**:
```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "dits-${var.environment}"
  cluster_version = "1.27"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  node_groups = {
    main = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 1
      
      instance_types = ["t3.medium"]
      
      k8s_labels = {
        Environment = var.environment
        Application = "dits"
      }
    }
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "dits-${var.environment}"
  
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "dits"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment != "production"
  
  tags = {
    Environment = var.environment
    Application = "dits"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "dits-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "dits-${var.environment}"
  description                = "Redis cluster for DITS"
  
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Environment = var.environment
    Application = "dits"
  }
}
```

### 11.2 Kubernetes Deployment

**Application Deployment**:
```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dits-api
  labels:
    app: dits-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dits-api
  template:
    metadata:
      labels:
        app: dits-api
    spec:
      containers:
      - name: api
        image: dits/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: dits-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: dits-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: dits-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: dits-api-service
spec:
  selector:
    app: dits-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dits-api-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.dits.dev
    secretName: dits-api-tls
  rules:
  - host: api.dits.dev
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: dits-api-service
            port:
              number: 80
```

### 11.3 CI/CD Pipeline

**GitHub Actions Workflow**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: dits_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:unit
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dits_test
        REDIS_URL: redis://localhost:6379
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dits_test
        REDIS_URL: redis://localhost:6379
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dits_test
        REDIS_URL: redis://localhost:6379

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=sha,prefix={{branch}}-
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Update kubeconfig
      run: aws eks update-kubeconfig --name dits-production
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/dits-api api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:main-${{ github.sha }}
        kubectl rollout status deployment/dits-api
```

### 11.4 Monitoring & Observability

**DataDog Configuration**:
```yaml
# datadog-values.yaml
datadog:
  apiKey: ${DATADOG_API_KEY}
  appKey: ${DATADOG_APP_KEY}
  
  logs:
    enabled: true
    containerCollectAll: true
  
  apm:
    enabled: true
    env: production
  
  processAgent:
    enabled: true
  
  systemProbe:
    enabled: true
  
  clusterAgent:
    enabled: true
    metricsProvider:
      enabled: true

agents:
  containers:
    agent:
      env:
        - name: DD_LOGS_INJECTION
          value: "true"
        - name: DD_RUNTIME_METRICS_ENABLED
          value: "true"
```

**Application Metrics**:
```typescript
// metrics.ts
import { createPrometheusMetrics } from '@prometheus/client';

export const metrics = {
  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
  }),
  
  issueOperations: new Counter({
    name: 'issue_operations_total',
    help: 'Total number of issue operations',
    labelNames: ['operation', 'status']
  }),
  
  activeUsers: new Gauge({
    name: 'active_users',
    help: 'Number of currently active users'
  }),
  
  gitIntegrationEvents: new Counter({
    name: 'git_integration_events_total',
    help: 'Total number of git integration events',
    labelNames: ['provider', 'event_type']
  })
};

// Middleware for request metrics
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    metrics.httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });
  
  next();
};
```

---

## 12. Development Timeline & Milestones

### 12.1 Phase 1: Foundation (Months 1-3)

**Month 1: Core Backend**
- [ ] Set up development environment and CI/CD
- [ ] Implement authentication service with JWT
- [ ] Design and implement database schema
- [ ] Create basic CRUD APIs for Issues, Projects, Areas
- [ ] Set up GraphQL endpoint with basic queries/mutations
- [ ] Implement basic search functionality

**Month 2: Web Application**
- [ ] Set up React application with TypeScript
- [ ] Implement authentication flow and protected routes
- [ ] Create core UI components and design system
- [ ] Build List View with sorting and filtering
- [ ] Implement issue creation and editing
- [ ] Add keyboard navigation and shortcuts

**Month 3: Core Features**
- [ ] Implement Board View (Kanban)
- [ ] Add Calendar View
- [ ] Build Command Palette functionality
- [ ] Implement Smart Views (Inbox, Today, Upcoming)
- [ ] Add real-time updates via WebSocket
- [ ] Create data export functionality

### 12.2 Phase 2: Integrations (Months 4-6)

**Month 4: Git Integration**
- [ ] Implement GitHub OAuth and API integration
- [ ] Add branch creation from issues
- [ ] Implement PR/MR linking and status tracking
- [ ] Set up webhook processing for Git events
- [ ] Add GitLab and Bitbucket support

**Month 5: Desktop Applications**
- [ ] Build macOS app with Swift/SwiftUI
- [ ] Implement Windows app with .NET MAUI
- [ ] Add global quick-entry functionality
- [ ] Implement offline synchronization
- [ ] Create Linux Electron app

**Month 6: IDE Extensions**
- [ ] Develop VS Code extension
- [ ] Implement JetBrains plugin
- [ ] Add contextual issue information
- [ ] Enable issue creation from code selection
- [ ] Integrate with Git branch workflows

### 12.3 Phase 3: Mobile & Polish (Months 7-9)

**Month 7: Mobile Applications**
- [ ] Build React Native app foundation
- [ ] Implement core mobile workflows
- [ ] Add camera integration for screenshots
- [ ] Create push notification system
- [ ] Optimize for offline usage

**Month 8: Advanced Features**
- [ ] Implement advanced search with query language
- [ ] Add workflow customization interface
- [ ] Create analytics and reporting features
- [ ] Implement webhook system for integrations
- [ ] Add time tracking capabilities

**Month 9: Performance & Security**
- [ ] Optimize database queries and indexing
- [ ] Implement comprehensive security audit
- [ ] Add rate limiting and DDoS protection
- [ ] Optimize mobile app performance
- [ ] Conduct penetration testing

### 12.4 Phase 4: Launch Preparation (Months 10-12)

**Month 10: Beta Testing**
- [ ] Launch closed beta with 50 developers
- [ ] Implement feedback collection system
- [ ] Fix critical bugs and usability issues
- [ ] Optimize onboarding experience
- [ ] Create comprehensive documentation

**Month 11: Production Readiness**
- [ ] Set up production infrastructure
- [ ] Implement monitoring and alerting
- [ ] Create backup and disaster recovery procedures
- [ ] Conduct load testing and optimization
- [ ] Prepare customer support systems

**Month 12: Public Launch**
- [ ] Launch public beta
- [ ] Implement billing and subscription system
- [ ] Create marketing website and materials
- [ ] Set up analytics and user tracking
- [ ] Launch Pro tier with advanced features

### 12.5 Success Metrics

**Technical Metrics**:
- API response times < 100ms (95th percentile)
- 99.9% uptime SLA
- Zero data loss incidents
- < 5 critical bugs per month post-launch

**User Metrics**:
- 1,000 active users within 3 months of launch
- 70% user retention after 30 days
- < 2 minutes time-to-first-value for new users
- 4.5+ star rating on app stores

**Business Metrics**:
- 10% conversion rate from free to Pro tier
- $50,000 MRR within 6 months of launch
- 50+ Git integrations connected per day
- 25% of users using IDE extensions

---

## 13. Risk Assessment & Mitigation

### 13.1 Technical Risks

**Risk: Performance degradation with large datasets**
- *Mitigation*: Implement pagination, indexing, and caching strategies early
- *Monitoring*: Set up performance alerts and regular load testing

**Risk: Real-time sync conflicts in offline mode**
- *Mitigation*: Implement robust conflict resolution with user-friendly merge UI
- *Testing*: Extensive offline scenario testing

**Risk: Git provider API rate limiting**
- *Mitigation*: Implement intelligent caching and request batching
- *Fallback*: Graceful degradation when rate limits are hit

### 13.2 Business Risks

**Risk: Low user adoption due to market saturation**
- *Mitigation*: Focus on unique value proposition (solo developer focus)
- *Strategy*: Target specific developer communities and pain points

**Risk: Competition from established players**
- *Mitigation*: Rapid iteration and feature development
- *Differentiation*: Maintain focus on individual developer experience

**Risk: Insufficient revenue from freemium model**
- *Mitigation*: Carefully balance free vs. Pro features
- *Analysis*: Regular conversion rate analysis and optimization

### 13.3 Security Risks

**Risk: Data breach or unauthorized access**
- *Mitigation*: Implement defense-in-depth security strategy
- *Compliance*: Regular security audits and penetration testing

**Risk: Git token compromise**
- *Mitigation*: Encrypt all tokens at rest and implement token rotation
- *Monitoring*: Anomaly detection for unusual API usage

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building DITS, a revolutionary issue tracker designed specifically for individual developers. The plan balances ambitious technical goals with practical implementation strategies, ensuring the final product delivers on the core promise of eliminating the "collaboration tax" while providing deep developer ecosystem integration.

The success of this project depends on maintaining relentless focus on the single-user experience, optimizing every interaction for speed and efficiency, and building deep, contextual integrations that make the tool feel like a natural extension of the developer's workflow.

By following this plan and adapting based on user feedback and market conditions, DITS can establish itself as the definitive productivity tool for solo developers, creating a new category in the productivity software market.

---

*This plan serves as a living document that should be updated regularly as development progresses and new insights are gained from user feedback and market validation.*