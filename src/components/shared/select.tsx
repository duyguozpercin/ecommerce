import { forwardRef } from 'react';

type SelectFieldProps = {
  label: string;
  options: string[];
  name: string;
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, name, error, ...rest }, ref) => (
    <div className="flex flex-col">
      <label htmlFor={name}>{label}</label>
      <select
        className="bg-stone-200 border" id={name}
        name={name}
        ref={ref}
        {...rest}>
        <option value="">Choose</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
    </div>
  )
)

SelectField.displayName = 'SelectField';

export default SelectField;