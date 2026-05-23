import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Typography } from '@mui/material';

const EditableTypography = ({ fieldName, placeholder, hasError = false, ...typographyProps }) => {
  const { setValue, watch } = useFormContext();
  const value = watch(fieldName) || placeholder;
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    if (isEditing && elementRef.current) {
      elementRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(elementRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  return (
    <Typography
      ref={elementRef}
      contentEditable={true}
      suppressContentEditableWarning
      onFocus={() => setIsEditing(true)}
      onBlur={(e) => {
        const newValue = e.currentTarget.textContent || '';
        setValue(fieldName, newValue, { shouldValidate: true });
        setIsEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      sx={{
        cursor: 'text',
        borderRadius: 2,
        outline: 'none',
        bgcolor: (theme) => {
          if (hasError) return theme.vars.palette.error.lighter;
          if (isEditing) return theme.vars.palette.primary.lighter;
          return 'transparent';
        },
        boxShadow: ({ vars }) => {
          if (hasError) return `0 0 0 1px ${vars.palette.error.main}`;
          if (isEditing) return `0 0 0 1px ${vars.palette.primary.main}`;
          return 'none';
        },
        px: 2,
        py: 1,
        ...typographyProps.sx,
      }}
      {...typographyProps}
    >
      {value}
    </Typography>
  );
};

export default EditableTypography;
