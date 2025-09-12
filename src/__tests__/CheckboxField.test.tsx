import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useForm, FormProvider } from "react-hook-form";
import CheckboxField from "@/components/shared/CheckboxField";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/app/schemas/productSchema";



function TestForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const methods = useForm<{ tags?: string[] }>({
    resolver: zodResolver(productSchema.pick({ tags: true })),
    defaultValues: { tags: [] },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <CheckboxField
          label="Tags"
          name="tags"
          options={["Organic", "Eco-Friendly"]}
          register={methods.register}
          error={methods.formState.errors.tags?.message as string}
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

describe("CheckboxField", () => {
  it("renders label and options", () => {
    render(<TestForm onSubmit={jest.fn()} />);

    expect(screen.getByText("Tags")).toBeInTheDocument();
    expect(screen.getByLabelText("Organic")).toBeInTheDocument();
    expect(screen.getByLabelText("Eco-Friendly")).toBeInTheDocument();
  });

  it("checkboxes can be toggled", () => {
    render(<TestForm onSubmit={jest.fn()} />);

    const organic = screen.getByLabelText("Organic") as HTMLInputElement;
    expect(organic.checked).toBe(false);

    fireEvent.click(organic);
    expect(organic.checked).toBe(true);

    fireEvent.click(organic);
    expect(organic.checked).toBe(false);
  });

  it("shows error message when no tag selected and form is submitted", async () => {
    const handleSubmit = jest.fn();
    render(<TestForm onSubmit={handleSubmit} />);

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(handleSubmit).not.toHaveBeenCalled();
      expect(screen.getByText("At least one tag must be selected.")).toBeInTheDocument();
    });
  });

  it("submits successfully when at least one tag is selected", async () => {
    const handleSubmit = jest.fn();
    render(<TestForm onSubmit={handleSubmit} />);

    fireEvent.click(screen.getByLabelText("Organic"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ tags: ["Organic"] }, expect.anything());
    });
  });
});
