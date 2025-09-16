import { forwardRef } from 'react';

type SelectFieldProps = {
  label: string;
  options: string[];
  name?: string;   // artık optional
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, name, error, ...rest }, ref) => {
    const fallbackName = name || label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className="flex flex-col">
        <label className="dark:text-black" htmlFor={fallbackName}>
          {label}
        </label>
        <select
          className="bg-stone-200 border dark:text-black"
          id={fallbackName}
          name={fallbackName}
          ref={ref}
          {...rest}
        >
          <option value="">Choose</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

export default SelectField;
