import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';


const sidebarItems = [
    {
        display: 'Карта',
        icon: <img src="/map.png" alt="Карта" width={36} height={36} />,
        to: '/',
        section: ''
    },
    {
        display: 'Таблица ТС',
        icon: <img src="/table.png" alt="Таблица ТС" width={36} height={36} />,
        to: '/table_ts',
        section: 'table_ts'
    },
    {
        display: 'Таблица тахографов',
        icon: <img src="/table.png" alt="Таблица тахографов" width={36} height={36} />,
        to: '/table_th',
        section: 'table_th'
    },
]

const Sidebar = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const location = useLocation();

    // смена активного пункта меню
    useEffect(() => {
        const curPath = window.location.pathname.split('/')[1];
        const activeItem = sidebarItems.findIndex(item => item.section === curPath);
        setActiveIndex(curPath.length === 0 ? 0 : activeItem);
    }, [location]);

    return (
        <div className='sidebar'>
            <div className='sidebar__logo'>
                Меню
            </div>
            {sidebarItems.map((item, index) => {
                return <Link to={item.to} key={index}>
                    <div className={`sidebar__item ${activeIndex === index ? 'active' : ''}`}>
                        <div className="sidebar__icon">
                            {item.icon}
                        </div>
                        <div className="sidebar__text">
                            {item.display}
                        </div>
                    </div>
                </Link>
            })}
        </div>
    )
};

export default Sidebar;