import { Controller, useFormContext } from 'react-hook-form';
import NumberField from 'components/common/NumberField';

export default function WeightNumberField(props) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name="progressWeight.weight"
      render={({ field: { value, onChange } }) => (
        <NumberField value={value ?? 0} onChange={onChange} {...props} />
      )}
    />
  );
}
