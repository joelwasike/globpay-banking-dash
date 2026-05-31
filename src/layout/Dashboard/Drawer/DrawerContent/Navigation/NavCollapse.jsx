import PropTypes from 'prop-types';
import { useLocation, matchPath } from 'react-router-dom';
import { useState, useEffect } from 'react';

// material-ui
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';

// project import
import NavItem from './NavItem';
import { useGetMenuMaster } from 'api/menu';

// assets
import DownOutlined from '@ant-design/icons/DownOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';

// ==============================|| NAVIGATION - COLLAPSE ||============================== //

export default function NavCollapse({ item, level = 0 }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const { pathname } = useLocation();

  const hasActiveChild = item.children?.some((child) =>
    matchPath({ path: child.url || child.link || '', end: false }, pathname)
  );
  const [open, setOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [hasActiveChild]);

  const Icon = item.icon || AppstoreOutlined;
  const itemIcon = <Icon style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} />;

  return (
    <>
      <ListItemButton
        disabled={item.disabled}
        onClick={() => drawerOpen && setOpen(!open)}
        sx={{
          pl: drawerOpen ? `${level * 28}px` : 1.5,
          py: 1,
          borderRadius: '8px',
          mb: 0.5,
          bgcolor: 'transparent',
          '&:hover': { bgcolor: 'transparent' }
        }}
      >
        <ListItemIcon sx={{ minWidth: 28, color: hasActiveChild ? 'primary.main' : 'text.secondary' }}>
          {itemIcon}
        </ListItemIcon>
        {drawerOpen && (
          <>
            <ListItemText
              primary={
                <Typography
                  variant="body1"
                  sx={{
                    color: hasActiveChild ? 'primary.main' : 'text.secondary',
                    fontWeight: hasActiveChild ? 700 : 400
                  }}
                >
                  {item.title}
                </Typography>
              }
            />
            {open ? <DownOutlined style={{ fontSize: 12 }} /> : <RightOutlined style={{ fontSize: 12 }} />}
          </>
        )}
      </ListItemButton>
      {drawerOpen && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 2.5 }}>
            {item.children?.map((child) => (
              <Box key={child.id} sx={{ position: 'relative' }}>
                <Box
                  sx={(theme) => ({
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: matchPath({ path: child.url || child.link || '', end: false }, pathname)
                      ? 'primary.main'
                      : 'grey.400',
                    ...theme.applyStyles('dark', {
                      bgcolor: matchPath({ path: child.url || child.link || '', end: false }, pathname)
                        ? 'primary.light'
                        : 'grey.600'
                    })
                  })}
                />
                <NavItem item={child} level={1} />
              </Box>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

NavCollapse.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number
};
