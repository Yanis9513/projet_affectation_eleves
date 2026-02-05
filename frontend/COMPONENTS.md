# Documentation des Composants Frontend

## Vue d'ensemble

Ce document decrit les composants reutilisables disponibles dans l'application.

## Composants de Base

### Button
Bouton avec plusieurs variantes et tailles.

```jsx
import { Button } from '../components';

// Variantes: primary, secondary, outline, ghost, success, warning, danger
<Button variant="primary" size="md" loading={false} disabled={false}>
  Cliquer
</Button>
```

### Card
Container avec bordure et ombre.

```jsx
import { Card, CardHeader, CardBody, CardFooter } from '../components';

<Card>
  <CardHeader>Titre</CardHeader>
  <CardBody>Contenu</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>
```

### TextInput / TextArea
Champs de formulaire avec validation.

```jsx
import { TextInput, TextArea } from '../components';

<TextInput
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  helperText="Votre adresse email"
  icon={<MailIcon />}
/>
```

---

## Composants de Donnees

### StatsCard
Affiche une statistique avec icone et tendance.

```jsx
import { StatsCard } from '../components';

<StatsCard
  title="Total Etudiants"
  value={150}
  icon={<UsersIcon />}
  color="blue"
  trend={{ value: 12, isPositive: true }}
/>
```

### StatusBadge
Badge de statut predefini.

```jsx
import { StatusBadge } from '../components';

// Presets: success, warning, error, info, pending, neutral
// Ou utiliser status avec des valeurs predefinies
<StatusBadge status="active" />
<StatusBadge preset="success" text="Actif" />
```

### DataTable
Tableau avec recherche, tri et pagination.

```jsx
import { DataTable } from '../components';

const columns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'actions', label: 'Actions', render: (row) => <Button>Voir</Button> }
];

<DataTable
  data={students}
  columns={columns}
  searchable
  sortable
  paginated
  itemsPerPage={10}
/>
```

---

## Composants UI

### Avatar / AvatarGroup
Affichage d'avatars utilisateurs.

```jsx
import { Avatar, AvatarGroup } from '../components';

<Avatar name="Jean Dupont" size="md" />
<AvatarGroup users={users} max={4} />
```

### Badge
Etiquettes colorees.

```jsx
import { Badge, CountBadge, BadgeGroup } from '../components';

<Badge variant="primary">Nouveau</Badge>
<Badge variant="success" dot>En ligne</Badge>
<CountBadge count={5} />
```

### Tooltip
Infobulle au survol.

```jsx
import { Tooltip, InfoTooltip } from '../components';

<Tooltip content="Information detaillee" position="top">
  <Button>Survolez</Button>
</Tooltip>

<InfoTooltip content="Aide contextuelle" />
```

### ProgressBar
Barres de progression.

```jsx
import { ProgressBar, CircularProgress, StepProgress } from '../components';

<ProgressBar value={75} max={100} color="blue" showLabel />
<CircularProgress value={50} size={80} />
<StepProgress currentStep={2} totalSteps={4} labels={['Debut', 'Info', 'Confirm', 'Fin']} />
```

### Tabs
Systeme d'onglets.

```jsx
import { Tabs, TabsList, Tab, TabsContent, TabsUnderline } from '../components';

<Tabs defaultValue="tab1">
  <TabsList>
    <Tab value="tab1">Onglet 1</Tab>
    <Tab value="tab2">Onglet 2</Tab>
  </TabsList>
  <TabsContent value="tab1">Contenu 1</TabsContent>
  <TabsContent value="tab2">Contenu 2</TabsContent>
</Tabs>

// Version underline
<TabsUnderline 
  tabs={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]}
  value={activeTab}
  onChange={setActiveTab}
/>
```

### Dropdown / Select
Menus deroulants.

```jsx
import { Dropdown, DropdownItem, Select } from '../components';

<Dropdown 
  trigger={<Button>Menu</Button>}
  align="left"
>
  <DropdownItem onClick={action1}>Option 1</DropdownItem>
  <DropdownItem onClick={action2} danger>Supprimer</DropdownItem>
</Dropdown>

<Select
  value={selected}
  onChange={setSelected}
  options={[
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' }
  ]}
  placeholder="Choisir..."
/>
```

### SearchInput
Champ de recherche avec debounce.

```jsx
import { SearchInput, SearchBar } from '../components';

<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Rechercher..."
  debounceMs={300}
/>

<SearchBar
  value={search}
  onChange={setSearch}
  filters={[
    { value: 'all', label: 'Tous' },
    { value: 'active', label: 'Actifs' }
  ]}
  activeFilter={filter}
  onFilterChange={setFilter}
/>
```

---

## Composants d'Etat

### EmptyState
Affichage quand il n'y a pas de donnees.

```jsx
import { EmptyState, ErrorState } from '../components';

<EmptyState
  icon="projects"
  title="Aucun projet"
  description="Creez votre premier projet"
  action={() => navigate('/create')}
  actionLabel="Creer un projet"
/>

<ErrorState
  title="Erreur de chargement"
  message="Impossible de charger les donnees"
  onRetry={refetch}
/>
```

### Skeleton
Placeholders de chargement.

```jsx
import { Skeleton, CardSkeleton, TableSkeleton, ListSkeleton } from '../components';

<Skeleton variant="text" width="60%" />
<Skeleton variant="circle" width="40px" height="40px" />
<CardSkeleton />
<TableSkeleton rows={5} columns={4} />
<ListSkeleton items={5} />
```

### AlertBox
Alertes et notifications.

```jsx
import { AlertBox, Banner } from '../components';

<AlertBox type="success" title="Succes!">
  L'operation a reussi.
</AlertBox>

<Banner type="warning" dismissible>
  Attention: maintenance prevue ce soir.
</Banner>
```

---

## Hooks Personnalises

### useQuery / useMutation
Gestion des donnees avec cache.

```jsx
import { useProjects, useDeleteProject, useQuery } from '../hooks';

function Component() {
  const { data: projects, isLoading, error, refetch } = useProjects();
  const { mutate: deleteProject, isLoading: isDeleting } = useDeleteProject();
  
  // Hook generique
  const { data } = useQuery('customKey', () => api.fetchData());
}
```

### useLocalStorage
Persistance dans localStorage.

```jsx
import { useLocalStorage } from '../hooks';

const [theme, setTheme] = useLocalStorage('theme', 'light');
```

### useDebounce
Debounce de valeurs ou callbacks.

```jsx
import { useDebounce, useDebouncedCallback } from '../hooks';

const debouncedSearch = useDebounce(searchTerm, 300);
const debouncedFetch = useDebouncedCallback(fetchData, 500);
```

### useKeyboard
Raccourcis clavier.

```jsx
import { useKeyPress, useEscape, useKeyboardShortcuts } from '../hooks';

useKeyPress('k', () => openSearch(), { ctrl: true });
useEscape(() => closeModal());
useKeyboardShortcuts({
  'ctrl+s': save,
  'ctrl+z': undo,
});
```

---

## Utilitaires

### constants.js
Constantes et fonctions utilitaires.

```jsx
import { 
  translateProjectType, 
  getProjectTypeColor,
  formatDate,
  formatRelativeTime,
  getInitials,
  cn
} from '../utils/constants';

const label = translateProjectType('group_project'); // 'Projet de groupe'
const color = getProjectTypeColor('exchange_program'); // 'bg-purple-100 text-purple-700'
const date = formatDate(new Date()); // '15 janvier 2024'
const relative = formatRelativeTime(new Date()); // 'A l'instant'
const initials = getInitials('Jean Dupont'); // 'JD'
const classes = cn('base-class', isActive && 'active-class'); // 'base-class active-class'
```
