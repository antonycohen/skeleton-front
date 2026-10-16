import {useGetUserById} from '@skeleton/core-api';

export const useGetUserForAccountSettingsPage = (userId: string) => {
  const { data: user, isLoading } = useGetUserById({
    id: userId,
    fields: {
      id: null,
      firstName: null,
      lastName: null,
      email: null,
      notificationsPreferences: null,
      localizationPreferences: null,
      // socialIdentifiers tells the two-factor section whether a password may be absent
      socialIdentifiers: null,
      mfaEnabled: null,
      mfaEnabledAt: null,
      profileImage: {
        fields: {
          id: null,
          url: null,
        }
      },
    },
  });


  return { user, isLoading };
};
