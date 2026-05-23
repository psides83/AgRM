import { Tree, TreeNode } from 'react-organizational-chart';
import { Box, useTheme } from '@mui/material';

export function OrganizationalChart({
  data,
  renderNode,
  lineHeight = '24px',
  lineWidth = '2px',
  lineColor,
  lineStyle = 'solid',
  lineBorderRadius = '12px',
  sx,
  ...props
}) {
  const { vars } = useTheme();

  const renderTree = (node) => {
    return (
      <TreeNode key={node.id} className="tree-node" label={renderNode(node)}>
        {node.children?.map((child) => renderTree(child))}
      </TreeNode>
    );
  };

  return (
    <Box
      sx={[
        {
          overflowX: 'auto',
          py: 3,
          direction: ({ direction }) => (direction === 'rtl' ? 'rtl' : 'ltr'),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Tree
        lineHeight={lineHeight}
        lineWidth={lineWidth}
        lineColor={lineColor || vars.palette.divider}
        lineStyle={lineStyle}
        lineBorderRadius={lineBorderRadius}
        label={renderNode(data)}
        {...props}
      >
        {data.children?.map((child) => renderTree(child))}
      </Tree>
    </Box>
  );
}
