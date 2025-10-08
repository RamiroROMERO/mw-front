/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import { NavLink, useNavigate, useLocation, useParams, useLoaderData } from 'react-router-dom';
import { Nav, NavItem, Collapse } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import classnames from 'classnames';
import { setContainerClassnames, addContainerClassname, changeDefaultClassnames, changeSelectedMenuHasSubItems } from '@Redux/actions';
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

  // let enableBankMenu =  false, enableContabMenu = false, enableFixedAssetsMenu = false, enableHospitalMenu = false, 
  //   enableInventoryMenu = false, enableInvoiceMenu = false, enableLabMenu = false enableLoansMenu = false, 
  //   enableRRHHMenu = false, enableTaxMenu = false
  // if(companyData && companyData.id){
  //   enableBankMenu =  companyData
  //   enableContabMenu = false, enableFixedAssetsMenu = false, enableHospitalMenu = false, 
  //   enableInventoryMenu = false, enableInvoiceMenu = false, enableLabMenu = false enableLoansMenu = false, 
  //   enableRRHHMenu = false, enableTaxMenu = false
  // }
  // return menuItems;
}

class Sidebar extends Component {

  menuItems = []

  constructor(props) {
    super(props);
    this.state = {
      selectedParentMenu: '',
      viewingParentMenu: '',
      collapsedMenus: [],
    };
    this.menuItems = fnValidMenuItems(menuTesting);
  }

  // eslint-disable-next-line react/sort-comp
  handleWindowResize = (event) => {
    if (event && !event.isTrusted) {
      return;
    }
    const { containerClassnames } = this.props;
    const nextClasses = this.getMenuClassesForResize(containerClassnames);
    // eslint-disable-next-line react/destructuring-assignment
    this.props.setContainerClassnames(
      0,
      nextClasses.join(' '),
      // eslint-disable-next-line react/destructuring-assignment
      this.props.selectedMenuHasSubItems
    );
  };

  handleDocumentClick = (e) => {
    const container = this.getContainer();
    let isMenuClick = false;
    if (
      e.target &&
      e.target.classList &&
      (e.target.classList.contains('menu-button') ||
        e.target.classList.contains('menu-button-mobile'))
    ) {
      isMenuClick = true;
    } else if (
      e.target.parentElement &&
      e.target.parentElement.classList &&
      (e.target.parentElement.classList.contains('menu-button') ||
        e.target.parentElement.classList.contains('menu-button-mobile'))
    ) {
      isMenuClick = true;
    } else if (
      e.target.parentElement &&
      e.target.parentElement.parentElement &&
      e.target.parentElement.parentElement.classList &&
      (e.target.parentElement.parentElement.classList.contains('menu-button') ||
        e.target.parentElement.parentElement.classList.contains(
          'menu-button-mobile'
        ))
    ) {
      isMenuClick = true;
    }
    if (container.contains(e.target) || container === e.target || isMenuClick) {
      return;
    }
    this.setState({
      viewingParentMenu: '',
    });
    this.toggle();
  };

  getMenuClassesForResize = (classes) => {
    const { menuHiddenBreakpoint, subHiddenBreakpoint } = this.props;
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

  getContainer = () => {
    // eslint-disable-next-line react/no-find-dom-node
    return ReactDOM.findDOMNode(this);
  };

  toggle = () => {
    const hasSubItems = this.getIsHasSubItem();
    // eslint-disable-next-line react/destructuring-assignment
    this.props.changeSelectedMenuHasSubItems(hasSubItems);
    const { containerClassnames, menuClickCount } = this.props;
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
      // eslint-disable-next-line react/destructuring-assignment
      this.props.setContainerClassnames(
        clickIndex,
        containerClassnames,
        hasSubItems
      );
    }
  };

  handleProps = () => {
    // this.addEvents();
  };

  addEvents = () => {
    ['click', 'touchstart', 'touchend'].forEach((event) =>
      document.addEventListener(event, this.handleDocumentClick, true)
    );
  };

  removeEvents = () => {
    ['click', 'touchstart', 'touchend'].forEach((event) =>
      document.removeEventListener(event, this.handleDocumentClick, true)
    );
  };

  setSelectedLiActive = (callback) => {
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
      selectedlink.parentElement.classList.add('active');
      this.setState(
        {
          selectedParentMenu:
            selectedlink.parentElement.parentElement.getAttribute(
              'data-parent'
            ),
        },
        callback
      );
    } else {
      const selectedParentNoSubItem = document.querySelector(
        '.main-menu  li a.active'
      );
      if (selectedParentNoSubItem != null) {
        this.setState(
          {
            selectedParentMenu:
              selectedParentNoSubItem.getAttribute('data-flag'),
          },
          callback
        );
        // eslint-disable-next-line react/destructuring-assignment
      } else if (this.state.selectedParentMenu === '') {
        this.setState(
          {
            selectedParentMenu: this.menuItems[0].id,
          },
          callback
        );
      }
    }
  };

  setHasSubItemStatus = () => {
    const hasSubmenu = this.getIsHasSubItem();
    // eslint-disable-next-line react/destructuring-assignment
    this.props.changeSelectedMenuHasSubItems(hasSubmenu);
    this.toggle();
  };

  getIsHasSubItem = () => {
    const { selectedParentMenu } = this.state;
    const menuItem = this.menuItems.find((x) => x.id === selectedParentMenu);
    if (menuItem)
      return !!(menuItem && menuItem.subs && menuItem.subs.length > 0);
    return false;
  };

  // eslint-disable-next-line react/sort-comp
  componentDidUpdate(prevProps) {
    // eslint-disable-next-line react/destructuring-assignment
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.setSelectedLiActive(this.setHasSubItemStatus);

      window.scrollTo(0, 0);
    }
    this.handleProps();
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
    this.handleWindowResize();
    this.handleProps();
    this.setSelectedLiActive(this.setHasSubItemStatus);
  }

  componentWillUnmount() {
    // this.removeEvents();
    window.removeEventListener('resize', this.handleWindowResize);
  }

  openSubMenu = (e, menuItem) => {
    const selectedParent = menuItem.id;
    const hasSubMenu = menuItem.subs && menuItem.subs.length > 0;
    // eslint-disable-next-line react/destructuring-assignment
    this.props.changeSelectedMenuHasSubItems(hasSubMenu);
    if (!hasSubMenu) {
      this.setState({
        viewingParentMenu: selectedParent,
        selectedParentMenu: selectedParent,
      });
      this.toggle();
    } else {
      e.preventDefault();

      const { containerClassnames, menuClickCount } = this.props;
      const currentClasses = containerClassnames
        ? containerClassnames.split(' ').filter((x) => x !== '')
        : '';

      if (!currentClasses.includes('menu-mobile')) {
        if (
          currentClasses.includes('menu-sub-hidden') &&
          (menuClickCount === 2 || menuClickCount === 0)
        ) {
          // eslint-disable-next-line react/destructuring-assignment
          this.props.setContainerClassnames(3, containerClassnames, hasSubMenu);
        } else if (
          currentClasses.includes('menu-hidden') &&
          (menuClickCount === 1 || menuClickCount === 3)
        ) {
          // eslint-disable-next-line react/destructuring-assignment
          this.props.setContainerClassnames(2, containerClassnames, hasSubMenu);
        } else if (
          currentClasses.includes('menu-default') &&
          !currentClasses.includes('menu-sub-hidden') &&
          (menuClickCount === 1 || menuClickCount === 3)
        ) {
          // eslint-disable-next-line react/destructuring-assignment
          this.props.setContainerClassnames(0, containerClassnames, hasSubMenu);
        }
      } else {
        // eslint-disable-next-line react/destructuring-assignment
        this.props.addContainerClassname(
          'sub-show-temporary',
          containerClassnames
        );
      }
      this.setState({
        viewingParentMenu: selectedParent,
      });
    }
  };

  toggleMenuCollapse = (e, menuKey) => {
    e.preventDefault();

    const { collapsedMenus } = this.state;
    if (collapsedMenus.indexOf(menuKey) > -1) {
      this.setState({
        collapsedMenus: collapsedMenus.filter((x) => x !== menuKey),
      });
    } else {
      collapsedMenus.push(menuKey);
      this.setState({
        collapsedMenus,
      });
    }
    return false;
  };

  // eslint-disable-next-line no-shadow
  filteredList = (menuItems) => {
    const { currentUser } = this.props;
    if (currentUser) {
      return menuItems.filter(
        (x) => (x.roles && x.roles.includes(currentUser.role)) || !x.roles
      );
    }
    return menuItems;
  };

  render() {
    const { selectedParentMenu, viewingParentMenu, collapsedMenus } =
      this.state;
    return (
      <div className="sidebar">
        <div className="main-menu">
          <div className="scroll">
            <PerfectScrollbar
              options={{ suppressScrollX: true, wheelPropagation: false }}
            >
              <Nav vertical className="list-unstyled">
                {this.menuItems &&
                  this.filteredList(this.menuItems).map((item) => {
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
                            onClick={(e) => this.openSubMenu(e, item)}
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
              {this.menuItems &&
                this.filteredList(this.menuItems).map((item) => {
                  return (
                    <Nav
                      key={item.id}
                      className={classnames({
                        'd-block':
                          // eslint-disable-next-line react/destructuring-assignment
                          (this.state.selectedParentMenu === item.id &&
                            // eslint-disable-next-line react/destructuring-assignment
                            this.state.viewingParentMenu === '') ||
                          // eslint-disable-next-line react/destructuring-assignment
                          this.state.viewingParentMenu === item.id,
                      })}
                      data-parent={item.id}
                    >
                      {item.subs &&
                        this.filteredList(item.subs).map((sub, index) => {
                          return (
                            <NavItem
                              key={`${item.id}_${index}`}
                              className={`${sub.subs && sub.subs.length > 0
                                ? 'has-sub-item'
                                : ''
                                }`}
                            >
                              {/* eslint-disable-next-line no-nested-ternary */}
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
                                      this.toggleMenuCollapse(
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
                                      {this.filteredList(sub.subs).map(
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
  }
}

const mapStateToProps = ({ menu, authUser }) => {
  const {
    containerClassnames,
    subHiddenBreakpoint,
    menuHiddenBreakpoint,
    menuClickCount,
    selectedMenuHasSubItems,
  } = menu;

  const { currentUser } = authUser;
  return {
    containerClassnames,
    subHiddenBreakpoint,
    menuHiddenBreakpoint,
    menuClickCount,
    selectedMenuHasSubItems,
    currentUser,
  };
};

const withRouter = (Component) => {
  const ComponentWithRouterProp = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    return (
      <Component
        {...props}
        location={location}
        params={params}
        navigate={navigate}
      />
    );
  }
  return ComponentWithRouterProp;
}

export default withRouter(
  connect(mapStateToProps, {
    setContainerClassnames,
    addContainerClassname,
    changeDefaultClassnames,
    changeSelectedMenuHasSubItems,
  })(Sidebar)
);

// export default Sidebar;