import type { Units } from '../state/types';

const KG_PER_LB = 0.45359237;

export function kgToDisplay(kg: number, units: Units): number {
  const value = units === 'kg' ? kg : kg / KG_PER_LB;
  return Math.round(value * 10) / 10;
}

export function displayToKg(value: number, units: Units): number {
  return units === 'kg' ? value : value * KG_PER_LB;
}

export function formatWeight(kg: number, units: Units): string {
  return `${kgToDisplay(kg, units).toFixed(1)} ${units === 'kg' ? 'kg' : 'lbs'}`;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / 2.54);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function formatHeight(cm: number, units: Units): string {
  if (units === 'kg') return `${Math.round(cm)} cm`;
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}′ ${inches}″`;
}

export function bmi(kg: number, heightCm: number): number {
  const m = heightCm / 100;
  return Math.round((kg / (m * m)) * 10) / 10;
}

export function bmiCategory(value: number): string {
  if (value < 18.5) return 'Underweight';
  if (value < 25) return 'Healthy weight';
  if (value < 30) return 'Overweight';
  return 'Obese';
}
