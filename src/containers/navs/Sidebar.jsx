import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { Nav, NavItem, Collapse } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import classnames from 'classnames';
import { setContainerClassnames, addContainerClassname, changeSelectedMenuHasSubItems } from '@Redux/actions';
import IntlMessages from '@Helpers/IntlMessages';
import menuTesting from '@Constants/menu';

const fnValidMenuItems = (menuItems) => {

  const companyData = JSON.parse(localStorage.getItem('mw_current_company'));
  if (companyData) {
    const { enableBankMenu, enableContabMenu, enableFixedAssetsMenu, enableHospitalMenu, enableInventoryMenu, enableInvoiceMenu,
      enableLabMenu, enableLoansMenu, enableRRHHMenu, enableTaxMenu, enableHotelMenu } = companyData;
    if (!enableBankMenu) {
      menuItems = menuItems.filter(menu => menu.id !== 'banks');
    }
    if (!enableContabMenu) {
      menuItems = menuItems.filter(menu => menu.id !== 'accounting');
    }
    if (!enableHospitalMenu) {
      menuItems = menuItems.filter(menu => menu.id !== 'hospitalManagement');
    };

    if (!enableFixedAssetsMenu) {
      menuItems = menuItems.filter(menu => menu.id !== 'fixedAssets');
    };

    if (!enableInventoryMenu) {
      menuItems = menuItems.filter(menu => menu.id !== 'inventory');
    };

    if (!enableInvoiceMenu) {
      menuItems = menuItems.filter(menu => menu.id !== 'billing');
    };

    if (!enableFixedAssetsMenu) {
      menuItems = menuItems.filter(menu => menu.id !== 'fixedAssets');
    };
    if (!enableRRHHMenu) {
      menuItems = menuItems.filter(menu => menu.id !== 'humanResources');
    };

    if (!enableTaxMenu) {
      menuItems = menuItems.filter(menu => menu.id !== 'tax');
    };
    if (!enableLabMenu) {
      menuItems = menuItems.filter(menu => menu.id !== 'laboratory');
    };

    if (!enableLoansMenu) {
      menuItems = menuItems.filter(menu => menu.id !== 'loans');
    };

    if (!enableHotelMenu) {
      menuItems = menuItems.filter(menu => menu.id !== 'hotelManagement');
    };

    return menuItems;
  }

  menuItems = [];
  return menuItems
}

const getMenuClassesForResize = (classes, menuHiddenBreakpoint, subHiddenBreakpoint) => {
  let nextClasses = classes.split(' ').filter((x) => x !== '');
  const windowWidth = window.innerWidth;
  if (windowWidth < menuHiddenBreakpoint) {
    nextClasses.push('menu-mobile');
  } else if (windowWidth < subHiddenBreakpoint) {
    nextClasses = nextClasses.filter((x) => x !== 'menu-mobile');
    if (
      nextClasses.includes('menu-default') &&
      !nextClasses.includes('menu-sub-hidden')
    ) {
      nextClasses.push('menu-sub-hidden');
    }
  } else {
    nextClasses = nextClasses.filter((x) => x !== 'menu-mobile');
    if (
      nextClasses.includes('menu-default') &&
      nextClasses.includes('menu-sub-hidden')
    ) {
      nextClasses = nextClasses.filter((x) => x !== 'menu-sub-hidden');
    }
  }
  return nextClasses;
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const containerClassnames = useSelector((state) => state.menu.containerClassnames);
  const subHiddenBreakpoint = useSelector((state) => state.menu.subHiddenBreakpoint);
  const menuHiddenBreakpoint = useSelector((state) => state.menu.menuHiddenBreakpoint);
  const menuClickCount = useSelector((state) => state.menu.menuClickCount);
  const selectedMenuHasSubItems = useSelector((state) => state.menu.selectedMenuHasSubItems);
  const currentUser = useSelector((state) => state.authUser.currentUser);

  const menuItemsRef = useRef(null);
  if (menuItemsRef.current === null) {
    menuItemsRef.current = fnValidMenuItems(menuTesting);
  }
  const menuItems = menuItemsRef.current;

  const [selectedParentMenu, setSelectedParentMenu] = useState('');
  const [viewingParentMenu, setViewingParentMenu] = useState('');
  const [collapsedMenus, setCollapsedMenus] = useState([]);

  const getIsHasSubItem = useCallback((parentMenu) => {
    const menuItem = menuItems.find((x) => x.id === parentMenu);
    return !!(menuItem && menuItem.subs && menuItem.subs.length > 0);
  }, [menuItems]);

  const toggle = useCallback((hasSubItemsParam) => {
    const hasSubItems = hasSubItemsParam !== undefined ? hasSubItemsParam : getIsHasSubItem(selectedParentMenu);
    dispatch(changeSelectedMenuHasSubItems(hasSubItems));
    const currentClasses = containerClassnames
      ? containerClassnames.split(' ').filter((x) => x !== '')
      : '';
    let clickIndex = -1;

    if (!hasSubItems) {
      if (
        currentClasses.includes('menu-default') &&
        (menuClickCount % 4 === 0 || menuClickCount % 4 === 3)
      ) {
        clickIndex = 1;
      } else if (
        currentClasses.includes('menu-sub-hidden') &&
        (menuClickCount === 2 || menuClickCount === 3)
      ) {
        clickIndex = 0;
      } else if (
        currentClasses.includes('menu-hidden') ||
        currentClasses.includes('menu-mobile')
      ) {
        clickIndex = 0;
      }
    } else if (
      currentClasses.includes('menu-sub-hidden') &&
      menuClickCount === 3
    ) {
      clickIndex = 2;
    } else if (
      currentClasses.includes('menu-hidden') ||
      currentClasses.includes('menu-mobile')
    ) {
      clickIndex = 0;
    }
    if (clickIndex >= 0) {
      dispatch(setContainerClassnames(clickIndex, containerClassnames, hasSubItems));
    }
  }, [containerClassnames, menuClickCount, selectedParentMenu, getIsHasSubItem, dispatch]);

  const setHasSubItemStatus = useCallback((parentMenu) => {
    const hasSubmenu = getIsHasSubItem(parentMenu);
    dispatch(changeSelectedMenuHasSubItems(hasSubmenu));
    toggle(hasSubmenu);
  }, [getIsHasSubItem, toggle, dispatch]);

  const setSelectedLiActive = useCallback(() => {
    const oldli = document.querySelector('.sub-menu  li.active');
    if (oldli != null) {
      oldli.classList.remove('active');
    }

    const oldliSub = document.querySelector('.third-level-menu  li.active');
    if (oldliSub != null) {
      oldliSub.classList.remove('active');
    }

    /* set selected parent menu */
    const selectedSublink = document.querySelector(
      '.third-level-menu  a.active'
    );
    if (selectedSublink != null) {
      selectedSublink.parentElement.classList.add('active');
    }

    const selectedlink = document.querySelector('.sub-menu  a.active');
    if (selectedlink != null) {
      const newParentMenu = selectedlink.parentElement.parentElement.getAttribute('data-parent');
      setSelectedParentMenu(newParentMenu);
      setHasSubItemStatus(newParentMenu);
    } else {
      const selectedParentNoSubItem = document.querySelector(
        '.main-menu  li a.active'
      );
      if (selectedParentNoSubItem != null) {
        const newParentMenu = selectedParentNoSubItem.getAttribute('data-flag');
        setSelectedParentMenu(newParentMenu);
        setHasSubItemStatus(newParentMenu);
      } else if (selectedParentMenu === '') {
        const newParentMenu = menuItems[0].id;
        setSelectedParentMenu(newParentMenu);
        setHasSubItemStatus(newParentMenu);
      }
    }
  }, [selectedParentMenu, menuItems, setHasSubItemStatus]);

  const openSubMenu = useCallback((e, menuItem) => {
    const selectedParent = menuItem.id;
    const hasSubMenu = menuItem.subs && menuItem.subs.length > 0;
    dispatch(changeSelectedMenuHasSubItems(hasSubMenu));
    if (!hasSubMenu) {
      setViewingParentMenu(selectedParent);
      setSelectedParentMenu(selectedParent);
      toggle();
    } else {
      e.preventDefault();

      const currentClasses = containerClassnames
        ? containerClassnames.split(' ').filter((x) => x !== '')
        : '';

      if (!currentClasses.includes('menu-mobile')) {
        if (
          currentClasses.includes('menu-sub-hidden') &&
          (menuClickCount === 2 || menuClickCount === 0)
        ) {
          dispatch(setContainerClassnames(3, containerClassnames, hasSubMenu));
        } else if (
          currentClasses.includes('menu-hidden') &&
          (menuClickCount === 1 || menuClickCount === 3)
        ) {
          dispatch(setContainerClassnames(2, containerClassnames, hasSubMenu));
        } else if (
          currentClasses.includes('menu-default') &&
          !currentClasses.includes('menu-sub-hidden') &&
          (menuClickCount === 1 || menuClickCount === 3)
        ) {
          dispatch(setContainerClassnames(0, containerClassnames, hasSubMenu));
        }
      } else {
        dispatch(addContainerClassname('sub-show-temporary', containerClassnames));
      }
      setViewingParentMenu(selectedParent);
    }
  }, [containerClassnames, menuClickCount, dispatch, toggle]);

  const toggleMenuCollapse = useCallback((e, menuKey) => {
    e.preventDefault();
    setCollapsedMenus((prev) =>
      prev.indexOf(menuKey) > -1
        ? prev.filter((x) => x !== menuKey)
        : [...prev, menuKey]
    );
    return false;
  }, []);

  const filteredList = useCallback((items) => {
    if (currentUser) {
      return items.filter(
        (x) => (x.roles && x.roles.includes(currentUser.role)) || !x.roles
      );
    }
    return items;
  }, [currentUser]);

  const latestForResizeRef = useRef();
  latestForResizeRef.current = { containerClassnames, selectedMenuHasSubItems, menuHiddenBreakpoint, subHiddenBreakpoint };

  const handleWindowResize = useCallback((event) => {
    if (event && !event.isTrusted) {
      return;
    }
    const {
      containerClassnames: currentContainerClassnames,
      selectedMenuHasSubItems: currentSelectedMenuHasSubItems,
      menuHiddenBreakpoint: currentMenuHiddenBreakpoint,
      subHiddenBreakpoint: currentSubHiddenBreakpoint,
    } = latestForResizeRef.current;
    const nextClasses = getMenuClassesForResize(
      currentContainerClassnames,
      currentMenuHiddenBreakpoint,
      currentSubHiddenBreakpoint
    );
    dispatch(setContainerClassnames(0, nextClasses.join(' '), currentSelectedMenuHasSubItems));
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    handleWindowResize();
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [handleWindowResize]);

  const setSelectedLiActiveRef = useRef();
  setSelectedLiActiveRef.current = setSelectedLiActive;
  const isFirstPathnameEffect = useRef(true);

  useEffect(() => {
    setSelectedLiActiveRef.current();
    if (!isFirstPathnameEffect.current) {
      window.scrollTo(0, 0);
    }
    isFirstPathnameEffect.current = false;
  }, [pathname]);

  return (
    <div className="sidebar">
      <div className="main-menu">
        <div className="scroll">
          <PerfectScrollbar
            options={{ suppressScrollX: true, wheelPropagation: false }}
          >
            <Nav vertical className="list-unstyled">
              {menuItems &&
                filteredList(menuItems).map((item) => {
                  return (
                    <NavItem
                      key={item.id}
                      className={classnames({
                        active:
                          (selectedParentMenu === item.id &&
                            viewingParentMenu === '') ||
                          viewingParentMenu === item.id,
                      })}
                    >
                      {item.newWindow ? (
                        <a
                          href={item.to}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <i className={item.icon} />{' '}
                          <IntlMessages id={item.label} />
                        </a>
                      ) : (
                        <NavLink
                          to={item.to}
                          onClick={(e) => openSubMenu(e, item)}
                          data-flag={item.id}
                        >
                          <i className={item.icon} />{' '}
                          <IntlMessages id={item.label} />
                        </NavLink>
                      )}
                    </NavItem>
                  );
                })}
            </Nav>
          </PerfectScrollbar>
        </div>
      </div>

      <div className="sub-menu">
        <div className="scroll">
          <PerfectScrollbar
            options={{ suppressScrollX: true, wheelPropagation: false }}
          >
            {menuItems &&
              filteredList(menuItems).map((item) => {
                return (
                  <Nav
                    key={item.id}
                    className={classnames({
                      'd-block':
                        (selectedParentMenu === item.id &&
                          viewingParentMenu === '') ||
                        viewingParentMenu === item.id,
                    })}
                    data-parent={item.id}
                  >
                    {item.subs &&
                      filteredList(item.subs).map((sub, index) => {
                        return (
                          <NavItem
                            key={`${item.id}_${index}`}
                            className={`${sub.subs && sub.subs.length > 0
                              ? 'has-sub-item'
                              : ''
                              }`}
                          >
                            {sub.newWindow ? (
                              <a
                                href={sub.to}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                <i className={sub.icon} />{' '}
                                <IntlMessages id={sub.label} />
                              </a>
                            ) : sub.subs && sub.subs.length > 0 ? (
                              <>
                                <NavLink
                                  className={`rotate-arrow-icon opacity-50 ${collapsedMenus.indexOf(
                                    `${item.id}_${index}`
                                  ) === -1
                                    ? ''
                                    : 'collapsed'
                                    }`}
                                  to={sub.to}
                                  id={`${item.id}_${index}`}
                                  onClick={(e) =>
                                    toggleMenuCollapse(
                                      e,
                                      `${item.id}_${index}`
                                    )
                                  }
                                >
                                  <i className="simple-icon-arrow-down" />{' '}
                                  <IntlMessages id={sub.label} />
                                </NavLink>

                                <Collapse
                                  isOpen={
                                    collapsedMenus.indexOf(
                                      `${item.id}_${index}`
                                    ) === -1
                                  }
                                >
                                  <Nav className="third-level-menu">
                                    {filteredList(sub.subs).map(
                                      (thirdSub, thirdIndex) => {
                                        return (
                                          <NavItem
                                            key={`${item.id}_${index}_${thirdIndex}`}
                                          >
                                            {thirdSub.newWindow ? (
                                              <>
                                                <i
                                                  className={thirdSub.icon}
                                                />{' '}
                                                <a
                                                  href={thirdSub.to}
                                                  rel="noopener noreferrer"
                                                  target="_blank"
                                                >
                                                  <IntlMessages
                                                    id={thirdSub.label}
                                                  />
                                                </a>
                                              </>
                                            ) : (
                                              <>
                                                <i
                                                  className={thirdSub.icon}
                                                />{' '}
                                                <NavLink to={thirdSub.to}>
                                                  <IntlMessages
                                                    id={thirdSub.label}
                                                  />
                                                </NavLink>
                                              </>
                                            )}
                                          </NavItem>
                                        );
                                      }
                                    )}
                                  </Nav>
                                </Collapse>
                              </>
                            ) : (
                              <NavLink to={sub.to}>
                                <i className={sub.icon} />{' '}
                                <IntlMessages id={sub.label} />
                              </NavLink>
                            )}
                          </NavItem>
                        );
                      })}
                  </Nav>
                );
              })}
          </PerfectScrollbar>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
