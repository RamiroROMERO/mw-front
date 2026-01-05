import React, { useEffect, useRef, useState } from 'react'
import { request } from '@Helpers/core';
import { useReactToPrint } from 'react-to-print';

export const useContentHR = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [listProjects, setListProjects] = useState([]);
  const [listTurns, setListTurns] = useState([]);
  const [listWorkShedules, setListWorkSchedules] = useState([]);
  const [openModalAddSchedule, setopenModalAddSchedule] = useState(false);

  const contentRef = useRef();
  const fnPrintSchedule = useReactToPrint({ contentRef });

  useEffect(() => {
    setLoading(true);
    request.GET('rrhh/process/projects', (resp) => {
      const projectsList = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.code}| ${item.name}`,
          value: item.id
        }
      });
      setListProjects(projectsList);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhhSchedules', (resp) => {
      const workShifts = resp.data.map((item) => {
        return {
          id: item.id,
          label: item.name,
          value: item.id
        }
      });
      setListTurns(workShifts);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }, []);

  return (
    {
      contentRef,
      fnPrintSchedule,
      currentItem,
      openModalAddSchedule,
      setopenModalAddSchedule,
      listProjects,
      listTurns,
      listWorkShedules,
      setListWorkSchedules,
      setCurrentItem
    }
  )
}
