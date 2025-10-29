import { ValidationRule, FieldValue } from './types';

export const createValidationRules = <T extends FieldValue>(rules: ValidationRule<T>) => {
  const validators: Record<string, (value: T) => string | undefined> = {};

  if (rules.required) {
    validators.required = (value: T) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return 'This field is required';
      }
      return undefined;
    };
  }

  if (rules.minLength) {
    validators.minLength = (value: T) => {
      const stringValue = String(value);
      if (value && stringValue.length < rules.minLength!) {
        return `Must be at least ${rules.minLength} characters`;
      }
      return undefined;
    };
  }

  if (rules.maxLength) {
    validators.maxLength = (value: T) => {
      const stringValue = String(value);
      if (value && stringValue.length > rules.maxLength!) {
        return `Must be no more than ${rules.maxLength} characters`;
      }
      return undefined;
    };
  }

  if (rules.pattern) {
    validators.pattern = (value: T) => {
      const stringValue = String(value);
      if (value && !rules.pattern!.test(stringValue)) {
        return 'Invalid format';
      }
      return undefined;
    };
  }

  if (rules.custom) {
    validators.custom = rules.custom;
  }

  return validators;
};

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern = /^\+?[\d\s\-\(\)]+$/;
export const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
