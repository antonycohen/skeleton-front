import { User } from './models';
import { imageShape } from '../images';

export const mockUser: User = {
  id: '2684784-0000-0000-0000-000000000000',
  email: 'user@test.com',
  firstName: 'User',
  lastName: 'Test',
  status: 'ACTIVE',
  profileImage: imageShape,
  socialIdentifiers: null,
  mfaEnabled: false,
  mfaEnabledAt: null,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  localizationPreferences: null,
  notificationsPreferences: null,
};
