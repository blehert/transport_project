import { Outlet } from 'react-router-dom';
import BurgerMenu from './SideBar'

const MainLayout = () => {
    return (
        <div className="layout-wrapper">
            <div className="layout-container">
                <BurgerMenu />
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;