import React, { useState } from 'react'
import notification from '@Containers/ui/Notifications'
import { validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';

export const useHeader = ({setopenModalAddSchedule, setListWorkSchedules, setLoading, setCurrentItem}) => {
  const [projectId, setProjectId] = useState(0);

  const onProjectChange = e => {
    setProjectId(e.target.value);
    fnGetData(e.target.value);
  }

  const fnAddSchedule = () => {
    if(validInt(projectId)===0){
      notification('warning', 'msg.required.select.project', 'alert.warning.title');
      return;
    }
    setCurrentItem({});

    setopenModalAddSchedule(true);
  }

  const fnGetData = (id=projectId) => {
    setLoading(true);
    request.GET(`rrhh/process/workSchedulings?projectId=${id}&status=1`, (resp) => {
      const data = resp.data.map((item) => {
        item.idWorkSheduling = item.id
        item.title = `${item?.rrhhSchedule?.name || ''} - ${item?.rrhhWorkSchedulingType?.name || ''}`
        item.start = `${item.dateStart}T00:00:00`
        item.end = `${item.dateEnd}T11:59:59`
        item.color = item.typeId===1?(item?.rrhhSchedule?.color || ''):'#48494b'
        return item;
      });
      setListWorkSchedules(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  return (
    {
      projectId,
      onProjectChange,
      fnAddSchedule,
      fnGetData
    }
  )
}
