// project import
import { getMenuGroups } from './dashboard';

// ==============================|| MENU ITEMS ||============================== //
export const getMenuItems = (role) => ({ items: getMenuGroups(role) });

export default getMenuItems;
