import { useEffect, useState } from 'react';
import { ModalDetails } from './ModalDetails';
import { request } from '@/helpers/core';
import { validFloat } from '@/helpers/Utils';

export const useContent = ({ setLoading }) => {

  const [productList, setProductList] = useState([]);
  const [currentItem, setCurrentItem] = useState({});
  const [showModalDetail, setShowModalDetail] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchValue, setSearhValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  const fnGetProducts = () => {
    setLoading(true);
    request.GET(`inventory/settings/products/dashboard?page=${currentPage}&limit=${pageSize}&q=${searchText}`, resp => {
      let { data, pagination } = resp;
      data = data.map(item => {
        let totalStock = 0;
        if (item.stock && item.stock.length > 0) {
          totalStock = item.stock.reduce((prev, curr) => {
            prev += validFloat(curr.stock);
            return prev;
          }, 0);
        }
        item.totalStock = totalStock;
        return item;
      });
      setTotalPages(pagination.totalPages || 1)
      setProductList(data);
      setLoading(false);
    }, err => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnViewDetail = (id) => {
    const item = productList.find(elem => elem.id === id);
    setCurrentItem(item || {});
    if (item && item.id) setShowModalDetail(true);
  }

  const fnViewPrices = (id) => {
    const item = productList.find(elem => elem.id === id);
    setCurrentItem(item || {});
  }

  const fnBtnSearch = () => {
    setCurrentPage(1);
    setSearhValue(searchText);
  }

  useEffect(() => {
    if (currentPage !== 0) fnGetProducts();
  }, [currentPage, searchValue]);

  const propsToModalDetail = {
    ModalContent: ModalDetails,
    title: "page.check.title.detalle",
    open: showModalDetail,
    setOpen: setShowModalDetail,
    maxWidth: 'md',
    data: {
      currentItem
    }
  }

  return {
    propsToModalDetail,
    fnBtnSearch,
    fnViewPrices,
    fnViewDetail,
    productList,
    currentItem,
    searchText,
    searchValue,
    setSearchText,
    setSearhValue,
    currentPage,
    setCurrentPage,
    totalPages
  }
}
