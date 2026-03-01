import React from 'react';
import { IconParkOutline } from '@icon-park/react';

// TabBar 图标
export const HomeIcon = ({ size = 24, color = '#7A7E83', active = false }) => (
  <IconParkOutline 
    icon="home" 
    size={size} 
    fill={active ? '#667eea' : color}
  />
);

export const AddIcon = ({ size = 24, color = '#7A7E83', active = false }) => (
  <IconParkOutline 
    icon="plus" 
    size={size} 
    fill={active ? '#667eea' : color}
  />
);

export const BadgeIcon = ({ size = 24, color = '#7A7E83', active = false }) => (
  <IconParkOutline 
    icon="medal" 
    size={size} 
    fill={active ? '#667eea' : color}
  />
);

// 页面功能图标
export const UserIcon = ({ size = 20, color = '#7A7E83' }) => (
  <IconParkOutline icon="user" size={size} fill={color} />
);

export const PasswordIcon = ({ size = 20, color = '#7A7E83' }) => (
  <IconParkOutline icon="lock" size={size} fill={color} />
);

export const TransportIcon = ({ size = 20, color = '#667eea' }) => (
  <IconParkOutline icon="car" size={size} fill={color} />
);

export const ElectricityIcon = ({ size = 20, color = '#52c41a' }) => (
  <IconParkOutline icon="electricity" size={size} fill={color} />
);

export const FoodIcon = ({ size = 20, color = '#faad14' }) => (
  <IconParkOutline icon="food" size={size} fill={color} />
);

export const ShoppingIcon = ({ size = 20, color = '#ff4d4f' }) => (
  <IconParkOutline icon="shopping-cart" size={size} fill={color} />
);

export const ChartIcon = ({ size = 20, color = '#7A7E83' }) => (
  <IconParkOutline icon="chart-bar" size={size} fill={color} />
);

export const TrophyIcon = ({ size = 20, color = '#7A7E83' }) => (
  <IconParkOutline icon="trophy" size={size} fill={color} />
);