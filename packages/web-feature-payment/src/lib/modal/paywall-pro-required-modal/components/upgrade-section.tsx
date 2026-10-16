import {useState} from 'react';
import {CheckIcon, ChevronDownIcon, ChevronUpIcon, XIcon} from 'lucide-react';
import {
  BadgeStatus,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  type PlanFeature,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
} from '@skeleton/web-components';
import {useTranslation} from '@skeleton/core-translations';

export type UpgradeSectionProps = {
  displayPrice: string | undefined;
  isAnnual: boolean;
  onAnnualChange: (value: boolean) => void;
  annualSavings: string | undefined;
  planOptions: { label: string; value: string }[];
  selectedProductId: string | undefined;
  onProductChange: (value: string) => void;
  features: PlanFeature[];
};

export function UpgradeSection({
  displayPrice,
  isAnnual,
  onAnnualChange,
  annualSavings,
  planOptions,
  selectedProductId,
  onProductChange,
  features,
}: UpgradeSectionProps) {
  const { t } = useTranslation();
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4 rounded-md border bg-muted p-3">
        <p className="font-heading text-lg font-semibold">{t('billing.paywall.upgrade')}</p>

        <div className="flex flex-col gap-4">
          <Separator />
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-end gap-0.5">
              <span className="font-heading text-4xl font-semibold tracking-[-1px]">
                {displayPrice ?? '—'}
              </span>
              <span className="text-sm text-muted-foreground">
                {t('billing.paywall.perMonth')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={isAnnual}
                onCheckedChange={onAnnualChange}
              />
              <div className="flex items-center gap-2.5 pt-[3px]">
                <span className="text-sm font-medium leading-none">{t('billing.paywall.annual')}</span>
                {annualSavings && (
                  <BadgeStatus variant="pricing">{annualSavings}</BadgeStatus>
                )}
              </div>
            </div>
          </div>
          <Separator />
        </div>

        {planOptions.length > 0 && (
          <Select
            value={selectedProductId}
            onValueChange={onProductChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('billing.paywall.selectPlan')} />
            </SelectTrigger>
            <SelectContent>
              {planOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Collapsible open={showAllFeatures} onOpenChange={setShowAllFeatures} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{t('billing.paywall.youWillUnlock')}</p>
          {features.length > 2 && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                {showAllFeatures ? t('billing.paywall.showLess') : t('billing.paywall.showMore')}
                {showAllFeatures ? (
                  <ChevronUpIcon className="size-4" />
                ) : (
                  <ChevronDownIcon className="size-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          )}
        </div>
        {features.slice(0, 2).map((feature, index) => (
          <FeatureRow key={index} feature={feature} />
        ))}
        <CollapsibleContent className="flex flex-col gap-3 overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          {features.slice(2).map((feature, index) => (
            <FeatureRow key={index} feature={feature} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}

function FeatureRow({ feature }: { feature: PlanFeature }) {
  const included = feature.included !== false;
  return (
    <div className="flex h-5 items-center gap-3">
      {included ? (
        <CheckIcon className="size-5 shrink-0 text-primary" />
      ) : (
        <XIcon className="size-5 shrink-0 text-muted-foreground" />
      )}
      <span className={`text-sm ${included ? 'text-muted-foreground' : 'text-muted-foreground line-through'}`}>
        {feature.name}
      </span>
    </div>
  );
}
