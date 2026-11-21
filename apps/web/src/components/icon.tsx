import { IconGithub } from 'nucleo-social-media';
import {
  IconBrightnessIncreaseOutline18,
  IconCheckOutline18,
  IconChevronDownOutline18,
  IconChevronUpOutline18,
  IconCircleInfoOutline18,
  IconCopyOutline18,
  IconEnvelopeOutline18,
  IconGearOutline18,
  IconLinkOutline18,
  IconMoonOutline18,
  IconPointerOutline18,
  IconUserOutline18,
  IconXmarkOutline18,
} from 'nucleo-ui-outline-18';
import type { IconProps } from 'nucleo-ui-outline-18';

import { cn } from '@/lib/utils';

const icons = {
  check: IconCheckOutline18,
  'chevron-down': IconChevronDownOutline18,
  'chevron-up': IconChevronUpOutline18,
  info: IconCircleInfoOutline18,
  copy: IconCopyOutline18,
  cursor: IconPointerOutline18,
  github: IconGithub,
  mail: IconEnvelopeOutline18,
  settings: IconGearOutline18,
  link: IconLinkOutline18,
  moon: IconMoonOutline18,
  sun: IconBrightnessIncreaseOutline18,
  user: IconUserOutline18,
  close: IconXmarkOutline18,
};

export type IconName = keyof typeof icons;

export function Icon({ name, className, strokeWidth, ...props }: IconProps & { name: IconName }) {
  const Component = icons[name];

  return (
    <Component
      className={cn('shrink-0', className)}
      size={18}
      aria-hidden="true"
      focusable="false"
      {...props}
      {...(strokeWidth === undefined ? {} : { strokeWidth })}
    />
  );
}
