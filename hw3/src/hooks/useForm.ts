import { useState, useCallback } from 'react';
import type { SearchMethod, FilterType, CourseType } from '../types';

// 表單狀態介面
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// 表單配置介面
interface FormConfig<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

// 通用表單 Hook
export function useForm<T extends Record<string, any>>(config: FormConfig<T>) {
  const [state, setState] = useState<FormState<T>>({
    values: config.initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true
  });

  // 更新欄位值
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [field]: value };
      const errors = config.validate ? config.validate(newValues) : {};
      const isValid = Object.keys(errors).length === 0;

      return {
        ...prev,
        values: newValues,
        errors,
        isValid
      };
    });
  }, [config]);

  // 更新多個欄位值
  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values };
      const errors = config.validate ? config.validate(newValues) : {};
      const isValid = Object.keys(errors).length === 0;

      return {
        ...prev,
        values: newValues,
        errors,
        isValid
      };
    });
  }, [config]);

  // 設置欄位錯誤
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }));
  }, []);

  // 清除欄位錯誤
  const clearFieldError = useCallback((field: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      return {
        ...prev,
        errors: newErrors
      };
    });
  }, []);

  // 標記欄位為已觸碰
  const setFieldTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched }
    }));
  }, []);

  // 重置表單
  const resetForm = useCallback(() => {
    setState({
      values: config.initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true
    });
  }, [config.initialValues]);

  // 提交表單
  const submitForm = useCallback(async () => {
    if (!config.onSubmit) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await config.onSubmit(state.values);
    } catch (error) {
      console.error('表單提交錯誤:', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [config.onSubmit, state.values]);

  // 獲取欄位屬性
  const getFieldProps = useCallback((field: keyof T) => ({
    value: state.values[field],
    error: !!state.errors[field],
    helperText: state.errors[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldValue(field, e.target.value);
      setFieldTouched(field);
    },
    onBlur: () => setFieldTouched(field)
  }), [state.values, state.errors, setFieldValue, setFieldTouched]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setFieldValue,
    setValues,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    resetForm,
    submitForm,
    getFieldProps
  };
}

// 搜尋表單專用 Hook
export function useSearchForm() {
  const form = useForm({
    initialValues: {
      searchMethod: 'courseName' as SearchMethod,
      keyword: '',
      timeFilter: 'unlimited' as FilterType,
      periodFilter: 'unlimited' as FilterType,
      addMethodFilter: 'unlimited' as FilterType,
      selectedWeekdays: [] as string[],
      selectedPeriods: [] as string[],
      selectedAddMethods: [] as string[],
      pageSize: 15
    },
    validate: (values) => {
      const errors: any = {};
      
      if (!values.keyword.trim()) {
        errors.keyword = '請輸入搜尋關鍵字';
      }
      
      if (values.keyword.length > 100) {
        errors.keyword = '搜尋關鍵字過長';
      }
      
      return errors;
    }
  });

  return form;
}

// 系所搜尋表單專用 Hook
export function useDepartmentSearchForm() {
  const form = useForm({
    initialValues: {
      college: '',
      department: '',
      requirementType: 'all' as CourseType,
      timeFilter: 'unlimited' as FilterType,
      periodFilter: 'unlimited' as FilterType,
      addMethodFilter: 'unlimited' as FilterType,
      selectedWeekdays: [] as string[],
      selectedPeriods: [] as string[],
      selectedAddMethods: [] as string[],
      pageSize: 15
    }
  });

  return form;
}
