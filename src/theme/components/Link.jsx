import Link from "next/link";
import RecordHoverPreview, {
  getPreviewRecord,
} from "components/sections/crm/shared/RecordHoverPreview";

export const LinkBehavior = ({ ref, href, onClick, ...props }) => {
  const handleClick = (event) => {
    if (href === "#!") event.preventDefault();
    onClick?.(event);
  };

  const link = (
    <Link
      ref={ref}
      {...props}
      href={href || "/"}
      onClick={handleClick}
      passHref
    ></Link>
  );
  const record = getPreviewRecord(href);

  return record ? (
    <RecordHoverPreview key={`${record.table}/${record.id}`} {...record}>
      {link}
    </RecordHoverPreview>
  ) : (
    link
  );
};

export const HashLinkBehavior = ({ ref, href, ...props }) => {
  return <Link ref={ref} {...props} href={href} passHref></Link>;
};

const MuiLink = {
  defaultProps: {
    component: LinkBehavior,
    underline: "hover",
  },
  styleOverrides: {
    underlineHover: () => ({
      position: "relative",
      backgroundImage: `linear-gradient(currentcolor, currentcolor)`,
      backgroundSize: "0% 1px",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left bottom",
      transition: "background-size 0.25s ease-in",
      "&:hover": {
        textDecoration: "none",
        backgroundSize: "100% 1px",
      },
    }),
  },
};

export default MuiLink;
