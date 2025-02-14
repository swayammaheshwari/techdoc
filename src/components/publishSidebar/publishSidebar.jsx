import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { FaMinusSquare } from 'react-icons/fa';
import { MdArrowDropUp } from 'react-icons/md';
import { MdOutlineArrowDropDown } from 'react-icons/md';
import TreeView, { flattenTree } from 'react-accessible-treeview';
import { MdCheckBoxOutlineBlank } from 'react-icons/md';
import { IoIosCheckbox } from 'react-icons/io';
import { modifyCheckBoxDataToSend, modifyDataForBulkPublish } from '../common/utility';
import { bulkPublish } from './redux/bulkPublishAction';
import { toast } from 'react-toastify';
import { GrGraphQl } from 'react-icons/gr';
import Example from '../../../public/assets/icons/example.svg';
import './checkBoxTreeView.scss';
import './publishSidebar.scss';

const saveAsSidebarStyle = {
  position: 'fixed',
  background: '#F8F8F8',
  zIndex: '1050 ',
  top: '0px',
  right: '0px',
  height: '100vh',
  width: '500px',
  boxShadow: '-25px 25px 43px rgba(0, 0, 0, 0.07)',
};
const darkBackgroundStyle = {
  position: 'fixed',
  background: 'rgba(0, 0, 0, 0.4)',
  opacity: 1,
  zIndex: '1040',
  top: '0px',
  right: '0px',
  height: '100vh',
  width: '100vw',
};

function PublishSidebar(props) {
  const params = useParams();

  const dispatch = useDispatch();

  const { pages, collections } = useSelector((state) => {
    return {
      pages: state.pages,
      collections: state.collections,
    };
  });

  const [flattenData, setFlattenData] = useState([{ name: '', id: 0, children: [], parent: null }]);
  const [allSelectedIds, setAllSelectedIds] = useState([]);
  const [defaultExpandedIds, setDefaultExpandedIds] = useState([]);

  useEffect(() => {
    getModifiedData();
  }, [params.collectionId]);

  const getModifiedData = () => {
    const data1 = modifyDataForBulkPublish(collections, pages, params.collectionId);
    const data2 = flattenTree({ name: '', children: [{ ...data1 }] });
    setDefaultExpandedIds(getDefaultExpandedIds(data2));
    setFlattenData(data2);
  };

  const onSelect = (e) => {
    const setToArrayConvertedData = Array.from(e.treeState.selectedIds);
    setAllSelectedIds(setToArrayConvertedData);
  };

  const sendPublishRequest = () => {
    if (allSelectedIds?.length === 0) return toast.error('Please Select Something To Publish');
    const dataToPublish = new Set();
    let rootParentId = collections[params.collectionId]?.rootParentId || '';
    modifyCheckBoxDataToSend(flattenData, allSelectedIds, dataToPublish);
    dataToPublish.delete(1);
    const pageIds = Array.from(dataToPublish).map((id) => flattenData?.[id]?.metadata?.actualId);
    try {
      dispatch(bulkPublish(rootParentId, pageIds));
    } catch (error) {
      console.error(error);
      toast.error('Cannot Publish at this moment');
    }
  };

  const handleOnClick = (e, handleSelect) => {
    e.stopPropagation();
    handleSelect(e);
  };

  const getDefaultExpandedIds = (data) => {
    return data.map((data) => data.id);
  };

  const ArrowIcon = ({ isOpen }) => {
    return !isOpen ? <MdOutlineArrowDropDown color='gray' size={22} /> : <MdArrowDropUp color='gray' size={22} />;
  };

  const CheckBoxIcon = ({ variant, ...rest }) => {
    switch (variant) {
      case 'none':
        return <MdCheckBoxOutlineBlank {...rest} />;
      case 'all':
        return <IoIosCheckbox {...rest} color='var(--checkbox-color-primary)' />;
      case 'some':
        return <FaMinusSquare {...rest} />;
      default:
        return null;
    }
  };

  return (
    <div className={`p-4 h-100 ${props?.selectedTab === 5 ? '' : 'd-none'}`}>
      <div>
        <h3>Bulk Publish</h3>
        <p className='text-secondary'>Publish multiple documents at the same time with one click.</p>
      </div>
      <div className='d-flex justify-content-between align-items-center select-document-container mt-4'>
        <h5>Select Documents</h5>
        <button className='btn bg-primary text-white' onClick={sendPublishRequest}>
          Publish
        </button>
      </div>
      <div className='checkbox tree-view-container p-2 mt-1 d-flex justify-content-start align-items-start border rounded'>
        <TreeView
          data={flattenData || []}
          aria-label='Checkbox tree'
          multiSelect
          propagateSelect
          propagateSelectUpwards
          togglableSelect
          onSelect={onSelect}
          expandedIds={defaultExpandedIds}
          nodeRenderer={({ element, isBranch, isExpanded, isSelected, isHalfSelected, getNodeProps, level, handleSelect, handleExpand }) => {
            const requestType = element.metadata?.actualId ? pages?.[element.metadata?.actualId]?.requestType : null;
            return (
              <div {...getNodeProps({ onClick: handleExpand })} style={{ marginLeft: 20 * (level - 1), display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                <CheckBoxIcon className='checkbox-icon' onClick={(e) => handleOnClick(e, handleSelect)} variant={isHalfSelected ? 'some' : isSelected ? 'all' : 'none'} />
                <span className='name element-name text-secondary'>
                  {element.name}
                  {pages?.[element.metadata?.actualId]?.type === 5 ? (
                    <Example className='ml-2' />
                  ) : (
                    <>
                      {requestType && pages?.[element.metadata?.actualId]?.protocolType === 1 && (
                        <div className={`ml-2 ${requestType}-TAB`}>
                          <div className='endpoint-request-div'>{requestType}</div>
                        </div>
                      )}
                      {pages?.[element.metadata?.actualId]?.protocolType === 2 && <GrGraphQl className='ml-2 graphql-icon' size={14} />}
                    </>
                  )}
                </span>
                {isBranch && <ArrowIcon isOpen={isExpanded} />}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

export default React.memo(PublishSidebar);
