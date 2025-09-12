import { forwardRef } from 'react';

type InputFieldProps = {
  label: string;
  name?: string;   // artık optional
  type?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, name, type = "text", error, ...rest }, ref) => {
    const fallbackName = name || label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className="flex flex-col mb-4">
        <label className="dark:text-black" htmlFor={fallbackName}>
          {label}
        </label>
        <input
          id={fallbackName}
          name={fallbackName}
          type={type}
          ref={ref}
          className="p-2 border rounded dark:text-black"
          {...rest}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
