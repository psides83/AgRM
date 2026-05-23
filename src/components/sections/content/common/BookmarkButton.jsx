import { useState } from 'react';
import { Button } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const BookmarkButton = ({
  sx,
  size = 'medium',
  color = 'neutral',
  variant = 'text',
  iconColor,
}) => {
  const [isBookMarked, setIsBookMarked] = useState(false);

  const handleBookmarkClick = () => {
    setIsBookMarked((prev) => !prev);
  };

  return (
    <Button
      shape="square"
      color={color}
      variant={variant}
      size={size}
      sx={{ ...sx }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleBookmarkClick();
      }}
    >
      <IconifyIcon
        icon={isBookMarked ? 'material-symbols:bookmark' : 'material-symbols:bookmark-outline'}
        sx={{
          fontSize: size === 'small' ? 18 : size === 'medium' ? 20 : 24,
          color: iconColor,
        }}
      />
    </Button>
  );
};

export default BookmarkButton;
