import { forwardRef } from 'react';

type InputFieldProps = {
  label: string;
  name: string;
  type?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, name, type = "text", error, ...rest }, ref) => {
    return (
      <div className="flex flex-col mb-4">
        <label className='dark:text-black' htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          className="p-2 border rounded dark:text-black />
"
          {...rest}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
