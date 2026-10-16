import * as React from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { useTranslation } from '@skeleton/core-translations';

type CopyButtonProps = {
  value: string;
  toastMessage?: string;
  className?: string;
};

export const CopyButton = ({
  value,
  toastMessage,
  className,
}: CopyButtonProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(toastMessage ?? t('components.copyButton.copied'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={className}
    >
      {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      <span className="sr-only">{t('components.copyButton.copy')}</span>
    </Button>
  );
};
