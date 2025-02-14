import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { updatePublicEnv } from '@/components/publishDocs/redux/publicEnvActions';
import { BsInfoCircleFill } from 'react-icons/bs';
import './publicEnv.scss';

export default function PublicEnv(props) {
  const dispatch = useDispatch();

  const { publicEnv } = useSelector((state) => {
    return {
      publicEnv: state.publicEnv,
    };
  });

  function handleInputChange(key, event) {
    dispatch(updatePublicEnv(key, event.target.value));
  }

  if (Object.keys(publicEnv || {})?.length === 0) return null;

  return (
    <div className='my-4'>
      <div className='d-flex justify-content-between align-items-center mb-2'>
        <h6 className='fw-500 inline-block'>Variables</h6>
        <OverlayTrigger placement='left' overlay={<Tooltip>{'Use variables in Input-fields and Editor like this {{variable_name}}'}</Tooltip>}>
          <BsInfoCircleFill className='mx-2' size={18} />
        </OverlayTrigger>
      </div>
      <div className='public-env-contanier' style={{ background: props?.themeShadedColor }}>
        <table className='table border rounded px-4 py-3'>
          <thead>
            <tr>
              <td className='py-1 px-2'>Name</td>
              <td className='py-1 px-2'>Value</td>
            </tr>
          </thead>
          <tbody>
            {Object.keys(publicEnv).map((key, Index) => {
              const env = publicEnv[key];
              if (env && typeof env.Checked !== 'undefined' && env.Checked) {
                return (
                  <tr key={Index}>
                    <td className='p-2'>
                      <input type='text' value={key} disabled className='form-control' />
                    </td>
                    <td className='p-2'>
                      <input type='text' value={env.currentValue} disabled={!env.IsEditable} onChange={(event) => handleInputChange(key, event)} className={`form-control ${!env.IsEditable && 'public-input-key text-grey'}`} />
                    </td>
                  </tr>
                );
              }
              return null;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
