import React from 'react';
import {
  IconTargetArrow,
  IconRoute,
  IconRun,
  IconBallFootball,
  IconAward,
  IconAdjustments,
  IconSoccerField,
  IconBolt,
  IconSparkles,
  IconShield,
  IconTrophy,
  IconStar,
  IconChartBar,
  IconFlame,
  IconActivity,
  IconCrosshair,
  IconCircleCheck,
  IconCheck,
} from '@tabler/icons-react';
import { StatIconType } from '../types';

interface StatIconProps {
  name: StatIconType | string;
  size?: number | string;
  className?: string;
  color?: string;
  stroke?: number;
}

export const ICON_OPTIONS: { id: StatIconType; label: string }[] = [
  { id: 'target', label: 'Target / xA' },
  { id: 'route', label: 'Route / Key Passes' },
  { id: 'run', label: 'Run / Progressive Carries' },
  { id: 'football', label: 'Football / Shots' },
  { id: 'award', label: 'Award / Strengths' },
  { id: 'adjustments', label: 'Adjustments / Tools' },
  { id: 'tactics', label: 'Pitch / Tactics' },
  { id: 'bolt', label: 'Bolt / Electric Pace' },
  { id: 'sparkles', label: 'Sparkles / Skill' },
  { id: 'shield', label: 'Shield / Defending' },
  { id: 'trophy', label: 'Trophy / Impact' },
  { id: 'star', label: 'Star / Key Man' },
  { id: 'chart', label: 'Chart / Volume' },
  { id: 'flame', label: 'Flame / Momentum' },
  { id: 'heartbeat', label: 'Activity / Work Rate' },
];

export const StatIcon: React.FC<StatIconProps> = ({
  name,
  size = 24,
  className = '',
  color = 'currentColor',
  stroke = 2,
}) => {
  const iconProps = { size, className, color, stroke };

  switch (name) {
    case 'target':
      return <IconTargetArrow {...iconProps} />;
    case 'route':
      return <IconRoute {...iconProps} />;
    case 'run':
      return <IconRun {...iconProps} />;
    case 'football':
      return <IconBallFootball {...iconProps} />;
    case 'award':
      return <IconAward {...iconProps} />;
    case 'adjustments':
      return <IconAdjustments {...iconProps} />;
    case 'tactics':
      return <IconSoccerField {...iconProps} />;
    case 'bolt':
      return <IconBolt {...iconProps} />;
    case 'sparkles':
      return <IconSparkles {...iconProps} />;
    case 'shield':
      return <IconShield {...iconProps} />;
    case 'trophy':
      return <IconTrophy {...iconProps} />;
    case 'star':
      return <IconStar {...iconProps} />;
    case 'chart':
      return <IconChartBar {...iconProps} />;
    case 'flame':
      return <IconFlame {...iconProps} />;
    case 'heartbeat':
      return <IconActivity {...iconProps} />;
    default:
      return <IconTargetArrow {...iconProps} />;
  }
};
