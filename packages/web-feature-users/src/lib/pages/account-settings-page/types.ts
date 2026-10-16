import {ReadUser} from '@skeleton/core-api-models';

export type EditUserOutletContext = {
  user: ReadUser | undefined;
  isLoading: boolean;
};
