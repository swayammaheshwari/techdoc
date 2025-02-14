import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import GenericPublicTableAutosuggest from '../genericPublicTableAutosuggest/genericPublicTableAutosuggest';
import { background } from '@/components/backgroundColor';
import { hexToRgb } from '@/components/common/utility';
import IconButton from '@/components/common/iconButton';
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from 'react-icons/md';
import './publicTable.scss';

function RenderTable(props) {
  const suggestions = useSelector((state) => state.publicEnv);

  function handleChange(index, value, key) {
    props?.handleValueChange(props?.type, index, value, key);
  }

  return (
    <React.Fragment>
      {props?.tableRows?.map((tableData, index) => {
        return (
          <tr>
            <td className={`public-table-col-checkbox p-2 ${props?.isCheckedVisible ? '' : 'checkbox-none'}`}>
              <input className='mt-2' type='checkbox' checked={tableData.checked == 'true' ? true : false} style={{ accentColor: props?.collectionTheme }} onClick={(event) => props?.handleCheckBoxClick(props?.type, index, event.target.checked, tableData.key)} />
            </td>
            <td width='40%' className='public-table-col p-2'>
              <div className='key-autosuggest-container'>
                <GenericPublicTableAutosuggest htmlValue={tableData.key} suggestions={suggestions} disable={true} placeholder='Enter Key' />
              </div>
            </td>
            <td width='60%' className='public-table-col p-2'>
              <div className='key-autosuggest-container'>
                {tableData?.type === 'file' ? (
                  <div className='selectFile d-flex align-items-center'>
                    <input name={index + '.type'} type='file' multiple onChange={(e) => handleChange(index, e.target.files, tableData?.key)} />
                  </div>
                ) : (
                  <GenericPublicTableAutosuggest htmlValue={tableData.value} suggestions={suggestions} handleChange={(value) => handleChange(index, value, tableData?.key)} placeholder='Enter Value' />
                )}
                {tableData?.description && <span className='mx-2 my-1 d-flex description-text'>{tableData.description}</span>}
              </div>
            </td>
          </tr>
        );
      })}
    </React.Fragment>
  );
}

export default function PublicTable(props) {
  const [showOptionalData, setShowOptionalData] = useState(false);
  const [tableContent, setTableContent] = useState({ required: [], optional: [] });

  useEffect(() => {
    filterRequiredAndOptionalData();
  }, [props?.publicTableContent]);

  function filterRequiredAndOptionalData() {
    let required = [],
      optional = [];
    props?.publicTableContent?.forEach((data) => {
      if (data?.optional === true) optional.push(data);
      else required.push(data);
    });
    setTableContent({ required, optional });
  }

  const handleOptional = () => setShowOptionalData(!showOptionalData);

  const getBtnTitle = () => {
    if (props?.type === 'headers') return 'Optional Headers';
    else if (props?.type === 'params') return 'Optional Parmas';
    else return 'Optional Body';
  };

  return (
    <div className='p-3 rounded public-table-container' style={{ backgroundImage: props?.themeShadedColor }}>
      <table className='w-100'>
        <thead>
          <tr className='my-3'>
            <td className='px-2 py-1'></td>
            <td className='px-2 py-1'>Name</td>
            <td className='px-2 py-1'>Value</td>
          </tr>
        </thead>
        <tbody>
          <RenderTable tableRows={tableContent.required} {...props} />
        </tbody>
      </table>
      {tableContent?.optional?.length != 0 && (
        <IconButton onClick={handleOptional} className='mt-2'>
          <div className='show-optional-btn text-secondary d-flex align-items-center fw-500'>
            <span>{getBtnTitle()}</span>
            {!showOptionalData ? <MdOutlineArrowDropDown size={20} /> : <MdOutlineArrowDropUp size={20} />}
          </div>
        </IconButton>
      )}
      <table className='w-100'>
        <tbody>{showOptionalData && <RenderTable tableRows={tableContent.optional} {...props} />}</tbody>
      </table>
    </div>
  );
}
