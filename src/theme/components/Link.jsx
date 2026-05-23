import Link from 'next/link';

export const LinkBehavior = ({ ref, href, onClick, ...props }) => {
  const handleClick = (event) => {
    if (href === '#!') event.preventDefault();
    onClick?.(event);
  };

  return <Link ref={ref} {...props} href={href || '/'} onClick={handleClick} passHref></Link>;
};

export const HashLinkBehavior = ({ ref, href, ...props }) => {
  return <Link ref={ref} {...props} href={href} passHref></Link>;
};

const MuiLink = {
  defaultProps: {
    component: LinkBehavior,
    underline: 'hover',
  },
  styleOverrides: {
    underlineHover: () => ({
      position: 'relative',
      backgroundImage: `linear-gradient(currentcolor, currentcolor)`,
      backgroundSize: '0% 1px',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'left bottom',
      transition: 'background-size 0.25s ease-in',
      '&:hover': {
        textDecoration: 'none',
        backgroundSize: '100% 1px',
      },
    }),
  },
};

export default MuiLink;
