export type ReportCategory =
  | 'illegal_dump'
  | 'air_pollution'
  | 'water_pollution'
  | 'broken_container'
  | 'noise_pollution'
  | 'other'

export type ReportStatus = 'submitted' | 'in_progress' | 'resolved' | 'archived'

export type UserLevel = 1 | 2 | 3

export interface Report {
  id: string
  title: string
  description: string
  category: ReportCategory
  status: ReportStatus
  district: string
  location: { lat: number; lng: number }
  imageUrl: string
  voteCount: number
  heatScore: number
  userId: string
  userName: string
  userLevel: UserLevel
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface User {
  id: string
  email: string
  displayName: string
  role: 'citizen' | 'admin'
  points: number
  level: UserLevel
  createdAt: string
  avatarUrl?: string
}

export interface StatusHistoryItem {
  id: string
  reportId: string
  oldStatus: ReportStatus
  newStatus: ReportStatus
  comment?: string
  changedBy: string
  changedAt: string
}

export const categoryLabels: Record<ReportCategory, string> = {
  illegal_dump: 'Нелегално сметище',
  air_pollution: 'Замърсен въздух',
  water_pollution: 'Замърсена вода',
  broken_container: 'Повреден контейнер',
  noise_pollution: 'Шумово замърсяване',
  other: 'Друго',
}

export const categoryIcons: Record<ReportCategory, string> = {
  illegal_dump: 'Trash2',
  air_pollution: 'Wind',
  water_pollution: 'Droplets',
  broken_container: 'Package',
  noise_pollution: 'Volume2',
  other: 'AlertTriangle',
}

export const statusLabels: Record<ReportStatus, string> = {
  submitted: 'Подаден',
  in_progress: 'В процес',
  resolved: 'Решен',
  archived: 'Архивиран',
}

export const levelLabels: Record<UserLevel, string> = {
  1: 'Наблюдател',
  2: 'Активист',
  3: 'Еко Шампион',
}

export const levelThresholds: Record<UserLevel, number> = {
  1: 0,
  2: 200,
  3: 500,
}

export const mockReports: Report[] = [
  {
    id: 'RPT-001',
    title: 'Нелегално сметище до бл. 47, Люлин',
    description: 'Голямо натрупване на строителни отпадъци и битови боклуци в зелената зона зад блок 47. Проблемът съществува от повече от месец и привлича гризачи.',
    category: 'illegal_dump',
    status: 'submitted',
    district: 'Люлин',
    location: { lat: 42.7186, lng: 23.2489 },
    imageUrl: '/placeholder-report-1.jpg',
    voteCount: 24,
    heatScore: 8.5,
    userId: 'USR-001',
    userName: 'Иван Петров',
    userLevel: 2,
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-15T10:30:00Z',
  },
  {
    id: 'RPT-002',
    title: 'Замърсен въздух около ТЕЦ Земляне',
    description: 'Постоянен дим и неприятна миризма от комините на ТЕЦ-а. Особено силно се усеща в сутрешните часове и през зимата.',
    category: 'air_pollution',
    status: 'in_progress',
    district: 'Надежда',
    location: { lat: 42.7354, lng: 23.3012 },
    imageUrl: '/placeholder-report-2.jpg',
    voteCount: 156,
    heatScore: 9.8,
    userId: 'USR-002',
    userName: 'Мария Георгиева',
    userLevel: 3,
    createdAt: '2024-03-10T08:15:00Z',
    updatedAt: '2024-03-18T14:20:00Z',
  },
  {
    id: 'RPT-003',
    title: 'Спукан тръбопровод, кв. Студентски',
    description: 'Изтичане на вода от главен тръбопровод на ъгъла на ул. Акад. Стефан Младенов и бул. 8-ми декември. Водата се разлива по улицата вече трети ден.',
    category: 'water_pollution',
    status: 'resolved',
    district: 'Студентски',
    location: { lat: 42.6511, lng: 23.3456 },
    imageUrl: '/placeholder-report-3.jpg',
    voteCount: 89,
    heatScore: 7.2,
    userId: 'USR-003',
    userName: 'Георги Димитров',
    userLevel: 2,
    createdAt: '2024-03-05T16:45:00Z',
    updatedAt: '2024-03-17T09:30:00Z',
    resolvedAt: '2024-03-17T09:30:00Z',
  },
  {
    id: 'RPT-004',
    title: 'Повреден контейнер, ул. Витоша',
    description: 'Жълтият контейнер за разделно събиране до бл. 12 е с откъснат капак и се препълва бързо. Отпадъците се разпиляват от вятъра.',
    category: 'broken_container',
    status: 'submitted',
    district: 'Витоша',
    location: { lat: 42.6634, lng: 23.2912 },
    imageUrl: '/placeholder-report-4.jpg',
    voteCount: 12,
    heatScore: 4.3,
    userId: 'USR-004',
    userName: 'Елена Стоянова',
    userLevel: 1,
    createdAt: '2024-03-18T11:20:00Z',
    updatedAt: '2024-03-18T11:20:00Z',
  },
  {
    id: 'RPT-005',
    title: 'Изхвърлени гуми в парка, Младост 1',
    description: 'Около 30 стари автомобилни гуми са изхвърлени в южния край на парка. Представляват опасност от пожар и замърсяване на почвата.',
    category: 'illegal_dump',
    status: 'in_progress',
    district: 'Младост',
    location: { lat: 42.6565, lng: 23.3789 },
    imageUrl: '/placeholder-report-5.jpg',
    voteCount: 67,
    heatScore: 7.8,
    userId: 'USR-001',
    userName: 'Иван Петров',
    userLevel: 2,
    createdAt: '2024-03-12T14:00:00Z',
    updatedAt: '2024-03-16T10:15:00Z',
  },
  {
    id: 'RPT-006',
    title: 'Замърсена река в Лозенец',
    description: 'Реката зад мол Парадайс има странен цвят и неприятна миризма. Вероятно има незаконно заустване на отпадни води.',
    category: 'water_pollution',
    status: 'submitted',
    district: 'Лозенец',
    location: { lat: 42.6612, lng: 23.3234 },
    imageUrl: '/placeholder-report-6.jpg',
    voteCount: 45,
    heatScore: 8.1,
    userId: 'USR-005',
    userName: 'Петър Николов',
    userLevel: 2,
    createdAt: '2024-03-17T09:45:00Z',
    updatedAt: '2024-03-17T09:45:00Z',
  },
  {
    id: 'RPT-007',
    title: 'Шум от строителен обект, Оборище',
    description: 'Строителен обект работи след 22:00ч, което нарушава нощната тишина. Проблемът се повтаря почти всяка вечер.',
    category: 'noise_pollution',
    status: 'archived',
    district: 'Оборище',
    location: { lat: 42.6987, lng: 23.3345 },
    imageUrl: '/placeholder-report-7.jpg',
    voteCount: 34,
    heatScore: 3.2,
    userId: 'USR-006',
    userName: 'Анна Василева',
    userLevel: 1,
    createdAt: '2024-02-20T22:30:00Z',
    updatedAt: '2024-03-01T16:00:00Z',
    resolvedAt: '2024-03-01T16:00:00Z',
  },
  {
    id: 'RPT-008',
    title: 'Препълнени контейнери, Красна поляна',
    description: 'Контейнерите на бул. Възкресение не са изпразвани от седмица. Боклукът се трупа около тях и създава хигиенен проблем.',
    category: 'broken_container',
    status: 'submitted',
    district: 'Красна поляна',
    location: { lat: 42.7156, lng: 23.2845 },
    imageUrl: '/placeholder-report-8.jpg',
    voteCount: 78,
    heatScore: 8.9,
    userId: 'USR-007',
    userName: 'Димитър Костов',
    userLevel: 3,
    createdAt: '2024-03-19T07:00:00Z',
    updatedAt: '2024-03-19T07:00:00Z',
  },
]

export const mockUsers: User[] = [
  {
    id: 'USR-001',
    email: 'ivan.petrov@email.com',
    displayName: 'Иван Петров',
    role: 'citizen',
    points: 350,
    level: 2,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'USR-002',
    email: 'maria.georgieva@email.com',
    displayName: 'Мария Георгиева',
    role: 'citizen',
    points: 720,
    level: 3,
    createdAt: '2023-11-20T14:30:00Z',
  },
  {
    id: 'USR-003',
    email: 'georgi.dimitrov@email.com',
    displayName: 'Георги Димитров',
    role: 'citizen',
    points: 280,
    level: 2,
    createdAt: '2024-02-01T09:15:00Z',
  },
  {
    id: 'USR-ADMIN',
    email: 'admin@urbanpulse.bg',
    displayName: 'Администратор',
    role: 'admin',
    points: 0,
    level: 1,
    createdAt: '2023-10-01T00:00:00Z',
  },
]

export const mockCurrentUser: User = mockUsers[0]

export const mockStatusHistory: StatusHistoryItem[] = [
  {
    id: 'HST-001',
    reportId: 'RPT-002',
    oldStatus: 'submitted',
    newStatus: 'in_progress',
    comment: 'Сигналът е приет за разглеждане. Ще бъде извършена проверка на място.',
    changedBy: 'Администратор',
    changedAt: '2024-03-18T14:20:00Z',
  },
  {
    id: 'HST-002',
    reportId: 'RPT-003',
    oldStatus: 'submitted',
    newStatus: 'in_progress',
    comment: 'Екип е изпратен на място.',
    changedBy: 'Администратор',
    changedAt: '2024-03-10T11:00:00Z',
  },
  {
    id: 'HST-003',
    reportId: 'RPT-003',
    oldStatus: 'in_progress',
    newStatus: 'resolved',
    comment: 'Тръбопроводът е ремонтиран. Благодарим за сигнала!',
    changedBy: 'Администратор',
    changedAt: '2024-03-17T09:30:00Z',
  },
]

export const mockActivityFeed = [
  {
    id: 'ACT-001',
    type: 'report_submitted',
    message: 'Подадохте сигнал',
    points: 50,
    reportId: 'RPT-001',
    reportTitle: 'Нелегално сметище до бл. 47, Люлин',
    createdAt: '2024-03-15T10:30:00Z',
  },
  {
    id: 'ACT-002',
    type: 'report_resolved',
    message: 'Вашият сигнал беше решен',
    points: 100,
    reportId: 'RPT-003',
    reportTitle: 'Спукан тръбопровод, кв. Студентски',
    createdAt: '2024-03-17T09:30:00Z',
  },
  {
    id: 'ACT-003',
    type: 'vote_cast',
    message: 'Гласувахте за сигнал',
    points: 5,
    reportId: 'RPT-002',
    reportTitle: 'Замърсен въздух около ТЕЦ Земляне',
    createdAt: '2024-03-16T15:00:00Z',
  },
  {
    id: 'ACT-004',
    type: 'vote_cast',
    message: 'Гласувахте за сигнал',
    points: 5,
    reportId: 'RPT-005',
    reportTitle: 'Изхвърлени гуми в парка, Младост 1',
    createdAt: '2024-03-14T11:20:00Z',
  },
]

// Dashboard statistics
export const mockDashboardStats = {
  totalActiveReports: 6,
  resolvedThisMonth: 2,
  resolvedPercentage: 25,
  avgResolutionTime: 7,
  newReportsToday: 1,
  trendUp: true,
}

export const mockReportsByCategory = [
  { category: 'illegal_dump', count: 2, percentage: 25 },
  { category: 'air_pollution', count: 1, percentage: 12.5 },
  { category: 'water_pollution', count: 2, percentage: 25 },
  { category: 'broken_container', count: 2, percentage: 25 },
  { category: 'noise_pollution', count: 1, percentage: 12.5 },
]

export const mockMonthlyTrend = [
  { month: 'Окт', reports: 12, resolved: 8 },
  { month: 'Ное', reports: 18, resolved: 14 },
  { month: 'Дек', reports: 15, resolved: 12 },
  { month: 'Яну', reports: 22, resolved: 16 },
  { month: 'Фев', reports: 28, resolved: 20 },
  { month: 'Мар', reports: 24, resolved: 18 },
]

export const mockTopDistricts = [
  { district: 'Младост', count: 45 },
  { district: 'Люлин', count: 38 },
  { district: 'Надежда', count: 32 },
  { district: 'Студентски', count: 28 },
  { district: 'Красна поляна', count: 24 },
]
