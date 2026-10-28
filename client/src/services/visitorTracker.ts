export interface MemberVisit {
  id: string;
  name: string;
  email: string;
  role: string;
  timestamp: string;
  formattedTime: string;
  status: 'ONLINE' | 'COMPLETED';
  ip: string;
  device: string;
  page: string;
}

export interface VisitorStats {
  totalVisits: number;
  memberVisitsCount: number;
  uniqueVisitorsCount: number;
  activeNow: number;
  todayVisits: number;
  recentMemberVisits: MemberVisit[];
  visitsByRole: {
    admin: number;
    customer: number;
    guest: number;
  };
}

const STORAGE_KEY_TOTAL = 'autoengine_total_visits';
const STORAGE_KEY_LOGS = 'autoengine_member_visits_log';
const STORAGE_KEY_SESSION = 'autoengine_session_visited';

const INITIAL_BASE_VISITS = 1842;

const INITIAL_SEED_MEMBERS: MemberVisit[] = [
  {
    id: 'vis-1',
    name: 'Admin',
    email: 'admin@autoengine.io',
    role: 'ADMIN',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    formattedTime: '12 mins ago',
    status: 'ONLINE',
    ip: '192.168.1.100',
    device: 'Desktop (macOS / Chrome)',
    page: 'Projects & Engineering Hub',
  },
  {
    id: 'vis-2',
    name: 'Alex Morgan',
    email: 'alex.morgan@mobility.tech',
    role: 'CUSTOMER',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    formattedTime: '45 mins ago',
    status: 'ONLINE',
    ip: '172.56.21.88',
    device: 'Mobile (iOS / Safari)',
    page: '3D Studio Configurator',
  },
  {
    id: 'vis-3',
    name: 'Sophia Laurent',
    email: 'sophia@alpine-dynamics.com',
    role: 'CUSTOMER',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    formattedTime: '2 hours ago',
    status: 'COMPLETED',
    ip: '82.165.197.1',
    device: 'Desktop (Windows / Edge)',
    page: 'Digital Twin Telemetry',
  },
  {
    id: 'vis-4',
    name: 'David Chen',
    email: 'd.chen@apex-auto.com',
    role: 'CUSTOMER',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    formattedTime: '4 hours ago',
    status: 'COMPLETED',
    ip: '104.28.19.4',
    device: 'Desktop (macOS / Firefox)',
    page: 'Platform Overview',
  },
  {
    id: 'vis-5',
    name: 'Admin',
    email: 'admin@autoengine.io',
    role: 'ADMIN',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    formattedTime: '6 hours ago',
    status: 'COMPLETED',
    ip: '192.168.1.100',
    device: 'Desktop (macOS / Chrome)',
    page: 'Database Architecture',
  },
];

export const visitorTracker = {
  // Track whenever any visitor opens the application
  trackSiteVisit: (): number => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TOTAL);
      let count = stored ? parseInt(stored, 10) : INITIAL_BASE_VISITS;
      if (isNaN(count)) count = INITIAL_BASE_VISITS;

      // Increment on session start
      if (!sessionStorage.getItem(STORAGE_KEY_SESSION)) {
        count += 1;
        sessionStorage.setItem(STORAGE_KEY_SESSION, 'true');
        localStorage.setItem(STORAGE_KEY_TOTAL, count.toString());
      }
      return count;
    } catch {
      return INITIAL_BASE_VISITS;
    }
  },

  // Record a member's visit when they log in
  trackMemberLogin: (user: { firstName?: string; lastName?: string; email?: string; role?: string }): void => {
    try {
      const storedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      const logs: MemberVisit[] = storedLogs ? JSON.parse(storedLogs) : INITIAL_SEED_MEMBERS;

      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || (user.role === 'ADMIN' ? 'Admin' : 'Customer');
      const role = (user.role || 'CUSTOMER').toUpperCase();

      const newVisit: MemberVisit = {
        id: 'vis-' + Date.now(),
        name: fullName,
        email: user.email || (role === 'ADMIN' ? 'admin@autoengine.io' : 'customer@autoengine.io'),
        role,
        timestamp: new Date().toISOString(),
        formattedTime: 'Just now',
        status: 'ONLINE',
        ip: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
        device: 'Desktop (Browser)',
        page: role === 'ADMIN' ? 'Projects & Engineering Hub' : 'Platform & 3D Studio',
      };

      const updated = [newVisit, ...logs.slice(0, 49)];
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));

      // Also ensure total visits increments
      const totalStored = localStorage.getItem(STORAGE_KEY_TOTAL);
      const totalCount = totalStored ? parseInt(totalStored, 10) + 1 : INITIAL_BASE_VISITS + 1;
      localStorage.setItem(STORAGE_KEY_TOTAL, totalCount.toString());
    } catch (e) {
      console.warn('Failed to record member visit:', e);
    }
  },

  // Simulate a visitor (for live testing in Hub)
  simulateVisitor: (role: 'CUSTOMER' | 'GUEST' = 'CUSTOMER'): void => {
    try {
      const storedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      const logs: MemberVisit[] = storedLogs ? JSON.parse(storedLogs) : INITIAL_SEED_MEMBERS;

      const randomNames = ['Liam Taylor', 'Olivia Kim', 'Noah Davis', 'Emma Wilson', 'Lucas Martin'];
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];

      const newVisit: MemberVisit = {
        id: 'vis-' + Date.now(),
        name: role === 'CUSTOMER' ? randomName : 'Guest Visitor',
        email: role === 'CUSTOMER' ? `${randomName.toLowerCase().replace(' ', '.')}@example.com` : 'guest@session.io',
        role,
        timestamp: new Date().toISOString(),
        formattedTime: 'Just now',
        status: 'ONLINE',
        ip: '10.0.' + Math.floor(Math.random() * 50) + '.' + Math.floor(Math.random() * 200),
        device: Math.random() > 0.5 ? 'Desktop (Chrome)' : 'Mobile (Safari)',
        page: 'Vehicle Studio & Specs',
      };

      const updated = [newVisit, ...logs.slice(0, 49)];
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));

      const totalStored = localStorage.getItem(STORAGE_KEY_TOTAL);
      const totalCount = totalStored ? parseInt(totalStored, 10) + 1 : INITIAL_BASE_VISITS + 1;
      localStorage.setItem(STORAGE_KEY_TOTAL, totalCount.toString());
    } catch (e) {
      console.warn('Failed to simulate visitor:', e);
    }
  },

  // Get complete analytics statistics
  getVisitorStats: (): VisitorStats => {
    try {
      const totalStored = localStorage.getItem(STORAGE_KEY_TOTAL);
      const totalVisits = totalStored ? parseInt(totalStored, 10) : INITIAL_BASE_VISITS;

      const storedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      const logs: MemberVisit[] = storedLogs ? JSON.parse(storedLogs) : INITIAL_SEED_MEMBERS;

      const adminVisits = logs.filter((l) => l.role === 'ADMIN').length;
      const customerVisits = logs.filter((l) => l.role === 'CUSTOMER').length;
      const uniqueEmails = new Set(logs.map((l) => l.email)).size;

      return {
        totalVisits: Math.max(totalVisits, INITIAL_BASE_VISITS),
        memberVisitsCount: logs.length,
        uniqueVisitorsCount: uniqueEmails + 320,
        activeNow: Math.floor(Math.random() * 4) + 6,
        todayVisits: Math.floor(totalVisits * 0.08) + 14,
        recentMemberVisits: logs,
        visitsByRole: {
          admin: adminVisits + 42,
          customer: customerVisits + 198,
          guest: Math.max(totalVisits - (adminVisits + customerVisits + 240), 120),
        },
      };
    } catch {
      return {
        totalVisits: INITIAL_BASE_VISITS,
        memberVisitsCount: INITIAL_SEED_MEMBERS.length,
        uniqueVisitorsCount: 325,
        activeNow: 8,
        todayVisits: 142,
        recentMemberVisits: INITIAL_SEED_MEMBERS,
        visitsByRole: {
          admin: 45,
          customer: 210,
          guest: 1587,
        },
      };
    }
  },
};

export default visitorTracker;
