import {forwardRef} from 'react';

type SelectFieldProps = {
  label: string;
  option: string;
  name?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLSelectElement>;