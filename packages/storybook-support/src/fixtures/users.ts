import {
  readUserSchema,
  type MfaEnrolment,
  type MfaRecoveryCodes,
  type MfaStatus,
  type User,
} from '@skeleton/core-api-models';
import { daysAgo, make, uuid } from './make';
import { connectedUser, WORKSPACE_ID } from './session';

export const makeUser = (n: number, overrides: Partial<User> = {}): User =>
  make(readUserSchema, {
    id: uuid(n, '0b000000'),
    status: 'ACTIVE',
    mfaEnabled: false,
    createdAt: daysAgo(n * 9),
    updatedAt: daysAgo(n),
    ...overrides,
  });

export const users: User[] = [
  connectedUser,
  makeUser(2, {
    firstName: 'Léa',
    lastName: 'Bernard',
    email: 'lea.bernard@acme.io',
    mfaEnabled: true,
    mfaEnabledAt: daysAgo(30),
    socialIdentifiers: { google: 'lea.bernard@acme.io' },
    localizationPreferences: { language: 'fr', timezone: 'Europe/Paris', dateFormat: 'dd/MM/yyyy' },
    notificationsPreferences: { channels: { products: true, news: false } },
  }),
  makeUser(3, {
    firstName: 'Hugo',
    lastName: 'Dubois',
    email: 'hugo@northwind.io',
    socialIdentifiers: { microsoft: 'hugo@northwind.io', linkedin: 'hugo-dubois' },
  }),
  makeUser(4, { firstName: 'Sarah', lastName: 'Cohen', email: 'sarah.cohen@globex.com', status: 'PENDING' }),
  makeUser(5, { firstName: 'Tom', lastName: 'Lefèvre', email: 'tom.lefevre@initech.fr' }),
  makeUser(6, { firstName: 'Inès', lastName: 'Moreau', email: 'ines@umbrella.co', status: 'INVITED' }),
  makeUser(7, { firstName: 'Paul', lastName: 'Girard', email: 'paul.girard@hooli.com', status: 'DELETED' }),
];

/** `GET /users/:id/mfa`: the second factor's state (off by default). */
export const mfaStatus = (overrides: Partial<MfaStatus> = {}): MfaStatus => ({
  enabled: false,
  enabledAt: null,
  recoveryCodesRemaining: 0,
  required: false,
  requiredBy: null,
  ...overrides,
});

export const mfaStatuses = {
  disabled: mfaStatus(),
  enabled: mfaStatus({ enabled: true, enabledAt: daysAgo(30), recoveryCodesRemaining: 8 }),
  /** Two codes left: the section warns to regenerate them. */
  lowRecoveryCodes: mfaStatus({ enabled: true, enabledAt: daysAgo(200), recoveryCodesRemaining: 2 }),
  /** Every code used: the warning turns destructive. */
  noRecoveryCodes: mfaStatus({ enabled: true, enabledAt: daysAgo(400), recoveryCodesRemaining: 0 }),
  /** Required by a workspace and not set up yet. */
  required: mfaStatus({
    required: true,
    requiredBy: { required: true, superAdmin: false, organizations: [{ id: WORKSPACE_ID, name: 'Acme' }] },
  }),
  /** Required and on: nothing can be disabled. */
  requiredEnabled: mfaStatus({
    enabled: true,
    enabledAt: daysAgo(12),
    recoveryCodesRemaining: 10,
    required: true,
    requiredBy: { required: true, superAdmin: true, organizations: [] },
  }),
} satisfies Record<string, MfaStatus>;

/** A QR-code-looking placeholder (a fixed pseudo-random 21×21 grid): enough for the set-up dialog. */
const qrCodePlaceholder = (() => {
  const size = 21;
  const finder = (x: number, y: number) =>
    [
      [0, 0],
      [size - 7, 0],
      [0, size - 7],
    ].some(([fx, fy]) => {
      const dx = x - fx;
      const dy = y - fy;
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
      return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    });
  const inFinderZone = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
  const cells: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const noise = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const on = inFinderZone(x, y) ? finder(x, y) : noise - Math.floor(noise) > 0.5;
      if (on) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${size + 4} ${size + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${size + 4}" height="${size + 4}" fill="#fff"/><g fill="#000">${cells.join('')}</g></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
})();

/** `POST /users/:id/mfa/totp`: the pending enrolment (the secret is shown once). */
export const mfaEnrolment: MfaEnrolment = {
  secret: 'JBSWY3DPEHPK3PXP',
  otpauthUri: 'otpauth://totp/Skeleton:camille.martin%40acme.io?secret=JBSWY3DPEHPK3PXP&issuer=Skeleton',
  qrCodeDataUrl: qrCodePlaceholder,
};

/** `POST /users/:id/mfa/totp/activate` and `/mfa/recovery-codes`: fresh single-use codes. */
export const mfaRecoveryCodes: MfaRecoveryCodes = {
  recoveryCodes: [
    'k7p2-9xqm',
    'a4fd-2n8w',
    'q9z3-m6tc',
    'h2rb-7vke',
    'w5yn-3dpa',
    'c8gu-4jxs',
    'n6tf-1qbz',
    'e3lm-8wrh',
    'r1vx-5kcd',
    'u7sj-6pye',
  ],
};
