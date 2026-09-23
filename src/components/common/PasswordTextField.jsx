import { useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import IconifyIcon from "components/base/IconifyIcon";

const PasswordTextField = ({ ref, slotProps, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handlePasswordVisibilty = (event) => {
    event.preventDefault();
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <TextField
      type={isPasswordVisible ? "text" : "password"}
      ref={ref}
      slotProps={{
        ...slotProps,
        htmlInput: {
          autoComplete: "new-password",
          "data-1p-ignore": "true",
          "data-bwignore": "true",
          "data-form-type": "other",
          "data-lpignore": "true",
          ...slotProps?.htmlInput,
        },
        input: {
          ...slotProps?.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handlePasswordVisibilty}>
                {isPasswordVisible ? (
                  <IconifyIcon icon="material-symbols-light:visibility-outline-rounded" />
                ) : (
                  <IconifyIcon icon="material-symbols-light:visibility-off-outline-rounded" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
};

export default PasswordTextField;
