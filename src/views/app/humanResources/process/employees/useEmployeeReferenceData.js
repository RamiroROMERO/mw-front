import { useEffect, useState } from 'react';
import { request } from '@Helpers/core';

// Extraído de useEmployees.js: las listas de referencia (departamentos,
// municipios, áreas, puestos, horarios, clientes, proyectos, jefes
// inmediatos) que alimentan los selects del formulario de empleado. Mismo
// fetch/mapeo de siempre, solo separado del resto de la lógica de guardado.
//
// fnGetProjects y fnGetAreaManager se exponen porque useEmployees.js
// necesita poder volver a llamarlas (ej. fnGetAreaManager se dispara de
// nuevo después de guardar un empleado).
export const useEmployeeReferenceData = ({ setLoading }) => {
  const [listDepartments, setListDepartments] = useState([]);
  const [listMunicipality, setListMunicipality] = useState([]);
  const [listAreas, setListAreas] = useState([]);
  const [listJobPositions, setListJobPositions] = useState([]);
  const [listImmediateBoss, setListImmediateBoss] = useState([]);
  const [listSchedules, setListSchedules] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [listProjects, setListProjects] = useState([]);

  const fnGetAreaManager = () => {
    setLoading(true);
    request.GET('rrhh/process/employees/findSL?areaManager=1', (resp) => {
      const immediateBoss = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`,
        }
      });
      setListImmediateBoss(immediateBoss);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnGetProjects = () => {
    setLoading(true);
    request.GET('rrhh/process/projects', (resp) => {
      const projectsList = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.code}| ${item.name}`,
          value: item.id,
          customerId: item.customerId,
          code: item.code,
          corre: item.corre
        }
      });
      setListProjects(projectsList);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/locateDeptos/getSL', (resp) => {
      const deptos = resp.data.map((item) => {
        return {
          value: item.code,
          label: item.name
        }
      });
      setListDepartments(deptos);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('admin/locateMunic/getSL', (resp) => {
      const munic = resp.data.map((item) => {
        return {
          value: item.id,
          code: item.code,
          label: item.name,
          codeDepto: item.codeDepto
        }
      });
      setListMunicipality(munic);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('admin/areas/getSl?useRrhh=1', (resp) => {
      const areas = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListAreas(areas);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('rrhh/settings/jobPositions', (resp) => {
      const positions = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListJobPositions(positions);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('rrhhSchedules', (resp) => {
      const schedules = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListSchedules(schedules);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('billing/settings/customers?status=1', (resp) => {
      const customers = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
          value: item.id,
          rtn: item.rtn,
          name: item.nomcli
        }
      });
      setListCustomers(customers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    fnGetProjects();

    fnGetAreaManager();
  }, []);

  return {
    listDepartments,
    listMunicipality,
    listAreas,
    listJobPositions,
    listImmediateBoss,
    listSchedules,
    listCustomers,
    listProjects,
    fnGetProjects,
    fnGetAreaManager
  };
};
