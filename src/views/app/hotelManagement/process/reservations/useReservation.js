import { request } from '@/helpers/core';
import React, { useEffect, useState } from 'react'
import { PATH_FILES } from '/src/helpers/pathFiles';

export const useReservation = ({setLoading}) => {
  const [dataRooms, setDataRooms] = useState([]);

  // paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 3;

  const fnGetData = (page=currentPage, searchText=search)=>{
    setDataRooms([]);
    setLoading(true);
    request.GET(`hotel/settings/rooms/paginate?page=${page}&limit=${pageSize}&q=${searchText}`, (resp)=>{
      const data = resp.data.map(item => {
        item.typeName = item?.typeData?.name || ""
        item.levelName = item?.levelData?.name || ""
        item.statusName = item?.statusData?.name || ""
        item.mealPlanName = item?.mealTypeData?.name || ""
        item.statusColor = item?.statusData?.color || ""
        return item
      });

      data.map(async (item) => {
        const nameImg = item?.roomPictures[0]?.name || "hotelroom.jpg";
        const imageUrl = `${PATH_FILES.GET.PICTURES}${nameImg}`;
        const imageObjectURL = await request.getFile(imageUrl);
        item.imageSrc = imageObjectURL
        setDataRooms((prev) => [...prev, item]);
      });
      const pageTotal = resp.pagination.totalPages;
      setTotalPages(pageTotal);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData(currentPage, search);
  }, [currentPage, search]);

  return (
    {
      dataRooms,
      totalPages,
      currentPage,
      typePagination: 2,
      setCurrentPage,
      setSearch
    }
  )
}
