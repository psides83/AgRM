import TextField from '@mui/material/TextField';

// Use slots so the theme's htmlInput defaults merge with Autocomplete's input ref and handlers.
const AutocompleteTextField = ({ params, ...props }) => {
  const { InputLabelProps, InputProps, inputProps, ...textFieldProps } = params;

  return (
    <TextField
      {...textFieldProps}
      {...props}
      slotProps={{ inputLabel: InputLabelProps, input: InputProps, htmlInput: inputProps }}
    />
  );
};

export default AutocompleteTextField;
