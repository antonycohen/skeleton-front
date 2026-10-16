import React, { ReactNode } from 'react';
import { useGetAppConfiguration } from '@skeleton/core-api';
import { ReadAppConfiguration } from '@skeleton/core-api-models';

export interface ConfigContextValue {
  config: ReadAppConfiguration | undefined;
  isLoading: boolean;
}

export const ConfigContext = React.createContext<ConfigContextValue>({
  config: undefined,
  isLoading: false,
});

export interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider(props: ConfigProviderProps) {
  const { data, isLoading } = useGetAppConfiguration();

  return (
    <ConfigContext.Provider value={{ config: data, isLoading }}>
      {props.children}
    </ConfigContext.Provider>
  );
}

export default ConfigProvider;
