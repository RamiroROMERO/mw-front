import React, { useEffect, useState } from 'react'
import { request } from '@Helpers/core';
import { IntlMessages } from '@Helpers/Utils';
import { PATH_FILES } from '/src/helpers/pathFiles';
import { Badge } from 'reactstrap';
import notification from '@Containers/ui/Notifications';

export const useRooms = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [openModalNew, setOpenModalNew] = useState(false);
  const [openModalViewRoom, setOpenModalViewRoom] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [listTypes, setListTypes] = useState([]);
  const [listLevels, setListLevels] = useState([]);
  const [listServices, setListServices] = useState([]);
  const [listStatus, setListStatus] = useState([]);
  const [listMealPlan, setListMealPlan] = useState([]);
  const [dataRoomServices, setDataRoomServices] = useState([]);
  const [dataRoomImages, setDataRoomImages] = useState([]);
  const [descriptionRoom, setDescriptionRoom] = useState("");

  // paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const fnNewDocument = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setCurrentItem({});
    setDataRoomServices([]);
    setDataRoomImages([]);
    setOpenModalNew(true);
  }

  const fnGetImgEmployee = async (nameImg) => {
    const imageUrl = `${PATH_FILES.GET.PICTURES}${nameImg}`;
    const imageObjectURL = await request.getFile(imageUrl);
    setDataRoomImages([{ id: 1, src: imageObjectURL }]);
  }

  const fnGetRoomImages = (item) => {
    const id = item.id;
    const description = `${item?.name || ""} ${item?.typeName || ""}`;
    setDescriptionRoom(description);
    setDataRoomImages([]);

    setLoading(true);
    request.GET(`hotel/settings/roomPictures?roomId=${id}`, (resp) => {
      const { data } = resp;

      if (data.length > 0) {
        data.map(async (item) => {
          const imageUrl = `${PATH_FILES.GET.PICTURES}${item.name}`;
          const imageObjectURL = await request.getFile(imageUrl);
          item.src = imageObjectURL
          setDataRoomImages((prev) => [...prev, item]);
        });
      } else {
        fnGetImgEmployee("hotelroom.jpg");
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetRoomServices = (id) => {
    setLoading(true);
    request.GET(`hotel/settings/roomServices?roomId=${id}`, (resp) => {
      const data = resp.data;
      setDataRoomServices(data);
      setOpenModalNew(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnEditDocument = (item) => {
    if (fnUpdate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    fnGetRoomImages(item);
    fnGetRoomServices(item.id);
    setCurrentItem(item);
  }

  const fnViewDocument = (item) => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    fnGetRoomImages(item);
    setOpenModalViewRoom(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.hotel.rooms"),
    columns: [
      { text: IntlMessages("table.column.name"), dataField: "name", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.type"), dataField: "typeName", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("table.column.level"), dataField: "levelName", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.rate"), dataField: "rate", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.capacity"), dataField: "capacity", headerStyle: { 'width': '10%' } },
      {
        text: IntlMessages("table.column.statusName"), dataField: "statusName", headerStyle: { 'width': '15%' },
        cell: ({ row }) => {
          return (<Badge
            color=''
            pill
            style={{ backgroundColor: row.original.statusData.color }}
          >
            {row.original.statusName}
          </Badge>);
        }
      },
    ],
    data: [],
    options: {
      columnActions: 'options',
      typePagination: 2,
      currentPage,
      totalPages: 0,
      setCurrentPage
    },
    actions: [{
      color: 'info',
      onClick: fnViewDocument,
      icon: 'eye'
    }, {
      color: 'warning',
      onClick: fnEditDocument,
      icon: 'pencil'
    }, {
      color: "primary",
      icon: "bi bi-plus",
      onClick: fnNewDocument,
      title: IntlMessages("button.new"),
      isFreeAction: true
    }],
  });

  const fnGetData = (page = currentPage, searchText = search) => {
    setLoading(true);
    request.GET(`hotel/settings/rooms/paginate?page=${page}&limit=${pageSize}&q=${searchText}`, (resp) => {
      const data = resp.data.map(item => {
        item.typeName = item?.typeData?.name || ""
        item.levelName = item?.levelData?.name || ""
        item.statusName = item?.statusData?.name || ""
        return item
      });
      const pageTotal = resp.pagination.totalPages;
      const tableData = {
        ...table, data, options: { totalPages: pageTotal, currentPage, setCurrentPage, typePagination: 2, setSearch }
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('hotel/settings/services', (resp) => {
      const services = resp.data.map((item) => {
        item.checked = false
        return item;
      });
      setListServices(services);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('hotel/settings/roomTypes', (resp) => {
      const roomTypes = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListTypes(roomTypes);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('hotel/settings/roomLevels', (resp) => {
      const roomLevels = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListLevels(roomLevels);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('hotel/settings/roomStatus', (resp) => {
      const roomStatus = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListStatus(roomStatus);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('hotel/settings/roomMealTypes', (resp) => {
      const roomMealTypes = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListMealPlan(roomMealTypes);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fnGetData(currentPage, search);
  }, [currentPage, search]);

  return (
    {
      table,
      currentItem,
      descriptionRoom,
      listLevels,
      listTypes,
      listServices,
      listStatus,
      listMealPlan,
      dataRoomServices,
      dataRoomImages,
      openModalNew,
      openModalViewRoom,
      setOpenModalNew,
      setOpenModalViewRoom,
      fnGetData,
      fnGetRoomImages
    }
  )
}
