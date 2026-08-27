import { useState, useEffect } from 'react';
import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';
import { Tooltip } from 'reactstrap';
import { getCurrentColor, setCurrentColor, applyTheme } from '@Helpers/Utils';

const TopnavDarkSwitch = () => {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    const color = getCurrentColor();
    setSwitchChecked(color.indexOf('dark') > -1);
  }, []);

  const changeMode = async () => {
    let color = getCurrentColor();

    if (color.indexOf('dark') > -1) {
      color = color.replace('dark', 'light');
    } else if (color.indexOf('light') > -1) {
      color = color.replace('light', 'dark');
    }
    setCurrentColor(color);
    setSwitchChecked(color.indexOf('dark') > -1);
    await applyTheme(color);
  };

  return (
    <div className="d-none d-md-inline-flex align-items-center me-3 dark-switch-wrapper" id="tooltip_switch">
      <i className={`bi bi-sun-fill dark-switch-icon ${!switchChecked ? 'active' : ''}`} />
      <Switch
        className="custom-switch custom-switch-primary custom-switch-small mx-2"
        checked={switchChecked}
        onChange={changeMode}
      />
      <i className={`bi bi-moon-stars-fill dark-switch-icon ${switchChecked ? 'active' : ''}`} />
      <Tooltip
        placement="left"
        isOpen={tooltipOpen}
        target="tooltip_switch"
        toggle={() => setTooltipOpen(!tooltipOpen)}
      >
        Dark Mode
      </Tooltip>
    </div>
  );
};
export default TopnavDarkSwitch;
