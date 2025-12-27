
import React from 'react';
import { GradeLetter } from './types';

export const GRADING_SCALE = [
  { min: 80, max: 100, letter: 'A' as GradeLetter, point: 4.00 },
  { min: 73, max: 79.99, letter: 'B+' as GradeLetter, point: 3.50 },
  { min: 67, max: 72.99, letter: 'B' as GradeLetter, point: 3.00 },
  { min: 61, max: 66.99, letter: 'C+' as GradeLetter, point: 2.50 },
  { min: 55, max: 60.99, letter: 'C' as GradeLetter, point: 2.00 },
  { min: 41, max: 54.99, letter: 'D' as GradeLetter, point: 1.00 },
  { min: 0, max: 40.99, letter: 'E' as GradeLetter, point: 0.00 },
];

export const getGradeFromScore = (score: number) => {
  return GRADING_SCALE.find(g => score >= g.min && score <= g.max) || GRADING_SCALE[4];
};

export const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const;

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const ICON_COLORS = {
  primary: '#4F46E5',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};
