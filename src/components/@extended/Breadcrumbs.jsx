import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';

// project imports
import MainCard from 'components/MainCard';
import getMenuItems from 'menu-items';
import { useAuth } from 'contexts/AuthContext';

// assets
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import HomeFilled from '@ant-design/icons/HomeFilled';

export default function Breadcrumbs({
  card = false,
  custom = false,
  divider = false,
  heading,
  icon,
  icons,
  links,
  maxItems,
  rightAlign,
  separator,
  title = true,
  titleBottom = true,
  sx,
  ...others
}) {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  const navigation = useMemo(() => getMenuItems(user?.role), [user?.role]);

  const [main, setMain] = useState();
  const [item, setItem] = useState();

  const iconSX = {
    marginRight: theme.spacing(0.75),
    marginLeft: 0,
    width: '1rem',
    height: '1rem',
    color: theme.palette.secondary.main
  };

  let customLocation = location.pathname;

  // only used for component demo breadcrumbs
  if (customLocation.includes('/components-overview/breadcrumbs')) {
    customLocation = '/apps/customer/customer-card';
  }

  useEffect(() => {
    const menuItems = navigation?.items || [];

    const findActive = (menu) => {
      if (!menu) return null;

      // group with direct URL match
      if (menu.type === 'group' && menu.url === customLocation) {
        return { main: menu, item: menu };
      }

      // search children when not in custom mode
      if (!custom && Array.isArray(menu.children)) {
        for (const child of menu.children) {
          if (child.type === 'collapse') {
            if (child.url === customLocation) return { main: child, item: child };
            const nested = findActive(child);
            if (nested) return nested;
          }

          if (child.type === 'item' && child.url === customLocation) {
            return { main: menu, item: child };
          }
        }
      }

      return null;
    };

    let nextMain;
    let nextItem;

    for (const menu of menuItems) {
      if (menu?.type !== 'group') continue;
      const found = findActive(menu);
      if (found) {
        nextMain = found.main;
        nextItem = found.item;
        break;
      }
    }

    setMain(nextMain);
    setItem(nextItem);
  }, [custom, customLocation, navigation]);

  // NOTE: active menu is computed in the effect above; avoid calling setState during render loops.

  // item separator
  const SeparatorIcon = separator;
  const separatorIcon = separator ? <SeparatorIcon style={{ fontSize: '0.75rem', marginTop: 2 }} /> : '/';

  let mainContent;
  let itemContent;
  let breadcrumbContent = <Typography />;
  let itemTitle = '';
  let CollapseIcon;
  let ItemIcon;

  // collapse item
  if (main && main.type === 'collapse' && !main.breadcrumbs) {
    CollapseIcon = main.icon ? main.icon : ApartmentOutlined;
    mainContent = (
      <Typography
        {...(main.url && { component: Link, to: main.url })}
        variant={window.location.pathname === main.url ? 'subtitle1' : 'h6'}
        sx={{ textDecoration: 'none' }}
        color={window.location.pathname === main.url ? 'text.primary' : 'text.secondary'}
      >
        {icons && <CollapseIcon style={iconSX} />}
        {main?.title}
      </Typography>
    );

    if (!!custom) {
      breadcrumbContent = (
        <MainCard
          border={card}
          sx={card === false ? { mb: 3, bgcolor: 'inherit', backgroundImage: 'none', ...sx } : { mb: 3, ...sx }}
          {...others}
          content={card}
          shadow="none"
        >
          <Grid
            container
            direction={rightAlign ? 'row' : 'column'}
            justifyContent={rightAlign ? 'space-between' : 'flex-start'}
            alignItems={rightAlign ? 'center' : 'flex-start'}
            spacing={1}
          >
            <Grid>
              <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems || 8} separator={separatorIcon}>
                <Typography component={Link} to="/" color="text.secondary" variant="h6" sx={{ textDecoration: 'none' }}>
                  {icons && <HomeOutlined style={iconSX} />}
                  {icon && !icons && <HomeFilled style={{ ...iconSX, marginRight: 0 }} />}
                  {(!icon || icons) && 'Home'}
                </Typography>
                {mainContent}
              </MuiBreadcrumbs>
            </Grid>
            {title && titleBottom && (
              <Grid sx={{ mt: card === false ? 0.25 : 1 }}>
                <Typography variant="h2">{main.title}</Typography>
              </Grid>
            )}
          </Grid>
          {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
        </MainCard>
      );
    }
  }

  // items
  if ((item && item.type === 'item') || (item?.type === 'group' && item?.url) || custom) {
    itemTitle = item?.title;

    ItemIcon = item?.icon ? item.icon : ApartmentOutlined;
    itemContent = (
      <Typography variant="subtitle1" color="text.primary">
        {icons && <ItemIcon style={iconSX} />}
        {itemTitle}
      </Typography>
    );

    let tempContent = (
      <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems || 8} separator={separatorIcon}>
        <Typography component={Link} to="/" color="text.secondary" variant="h6" sx={{ textDecoration: 'none' }}>
          {icons && <HomeOutlined style={iconSX} />}
          {icon && !icons && <HomeFilled style={{ ...iconSX, marginRight: 0 }} />}
          {(!icon || icons) && 'Home'}
        </Typography>
        {mainContent}
        {itemContent}
      </MuiBreadcrumbs>
    );

    if (custom && links && links?.length > 0) {
      tempContent = (
        <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems || 8} separator={separatorIcon}>
          {links?.map((link, index) => {
            CollapseIcon = link.icon ? link.icon : ApartmentOutlined;

            return (
              <Typography
                key={index}
                {...(link.to && { component: Link, to: link.to })}
                variant={!link.to ? 'subtitle1' : 'h6'}
                sx={{ textDecoration: 'none' }}
                color={!link.to ? 'text.primary' : 'text.secondary'}
              >
                {link.icon && <CollapseIcon style={iconSX} />}
                {link.title}
              </Typography>
            );
          })}
        </MuiBreadcrumbs>
      );
    }

    // main
    if (item?.breadcrumbs !== false || custom) {
      breadcrumbContent = (
        <MainCard
          border={card}
          sx={card === false ? { mb: 3, bgcolor: 'inherit', backgroundImage: 'none', ...sx } : { mb: 3, ...sx }}
          {...others}
          content={card}
          shadow="none"
        >
          <Grid
            container
            direction={rightAlign ? 'row' : 'column'}
            justifyContent={rightAlign ? 'space-between' : 'flex-start'}
            alignItems={rightAlign ? 'center' : 'flex-start'}
            spacing={1}
          >
            {title && !titleBottom && (
              <Grid>
                <Typography variant="h2">{custom ? heading : item?.title}</Typography>
              </Grid>
            )}
            <Grid>{tempContent}</Grid>
            {title && titleBottom && (
              <Grid sx={{ mt: card === false ? 0.25 : 1 }}>
                <Typography variant="h2">{custom ? heading : item?.title}</Typography>
              </Grid>
            )}
          </Grid>
          {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
        </MainCard>
      );
    }
  }

  return breadcrumbContent;
}

Breadcrumbs.propTypes = {
  card: PropTypes.bool,
  custom: PropTypes.bool,
  divider: PropTypes.bool,
  heading: PropTypes.string,
  icon: PropTypes.bool,
  icons: PropTypes.bool,
  links: PropTypes.array,
  maxItems: PropTypes.number,
  rightAlign: PropTypes.bool,
  separator: PropTypes.any,
  title: PropTypes.bool,
  titleBottom: PropTypes.bool,
  sx: PropTypes.any,
  others: PropTypes.any
};
