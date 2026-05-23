import { Controller, useFormContext } from 'react-hook-form';
import SliderInput from 'components/common/SliderInput';

export default function CompletionSlider(props) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name="progressWeight.completion"
      render={({ field: { value, onChange, ...rest } }) => (
        <SliderInput value={value} onChange={onChange} {...rest} {...props} />
      )}
    />
  );
}
