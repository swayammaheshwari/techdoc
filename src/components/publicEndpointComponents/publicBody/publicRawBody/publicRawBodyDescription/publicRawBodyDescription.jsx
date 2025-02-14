import React from 'react';
import { useSelector } from 'react-redux';
import { Badge } from 'react-bootstrap';
import './publicRawBodyDescription.scss';

export default function PublicRawBodyDescription(props) {
  const bodyWithDescription = useSelector((state) => state.publicStore?.publicEndpointData?.bodyDescription || {});

  const displayLegend = () => {
    const types = ['string', 'number', 'boolean', 'array', 'object'];
    return (
      <div className='d-flex flex-row-reverse mt-2'>
        {types.map((type, index) => (
          <small key={index} className='ml-3 text-small'>
            <Badge className={`body-desc-type ${type}`}>{type.charAt(0)}</Badge> <span className='text-capitalize'>{type}</span>
          </small>
        ))}
      </div>
    );
  };

  const renderType = (type) => (
    <Badge className={`body-desc-type ${type}`} style={{ cursor: 'default' }}>
      {type.charAt(0)}
    </Badge>
  );

  const renderItem = (parentPath, key, value) => {
    const path = parentPath ? `${parentPath}.${key}` : key;
    return (
      <div key={path} className='py-1'>
        {renderType(value.type)}
        <strong className='pl-1' style={{ cursor: 'default' }}>
          {key}
        </strong>
        <span>{value.description ? ` : ${value.description}` : ''}</span>
      </div>
    );
  };

  const renderObject = (parentPath, obj) => {
    return Object.entries(obj).map(([key, value]) => {
      const newPath = parentPath ? `${parentPath}.${key}` : key;
      if (['object', 'array'].includes(value.type)) {
        return (
          <div key={newPath} className='ml-2 pl-2' style={{ borderLeft: '1px solid rgb(0,0,0,0.1)' }}>
            <strong className='pl-1' style={{ cursor: 'default' }}>
              {value.type === 'object' ? <Badge className='body-desc-type object'>O</Badge> : null}
              {value.type === 'array' ? <Badge className='body-desc-type array'>A</Badge> : null}
              {key}
            </strong>
            {value.type === 'object' ? renderObject(newPath, value.value) : null}
            {value.type === 'array' ? renderArray(newPath, value.value) : null}
          </div>
        );
      } else {
        return renderItem(newPath, key, value);
      }
    });
  };

  const renderArray = (parentPath, arr) => {
    return arr.map((item, index) => {
      const newPath = `${parentPath}[${index}]`;
      if (['object', 'array'].includes(item.type)) {
        return (
          <div key={newPath} className='ml-2 pl-2' style={{ borderLeft: '1px solid rgb(0,0,0,0.1)' }}>
            <strong className='pl-1' style={{ cursor: 'default' }}>
              {item.type === 'object' ? <Badge className='body-desc-type object'>O</Badge> : null}
              {item.type === 'array' ? <Badge className='body-desc-type array'>A</Badge> : null} Item {index}
            </strong>
            {item.type === 'object' ? renderObject(newPath, item.value) : null}
            {item.type === 'array' ? renderArray(newPath, item.value) : null}
          </div>
        );
      } else {
        return renderItem(newPath, index.toString(), item);
      }
    });
  };

  return (
    <div className='border rounded body-description-container' style={{ background: props?.themeShadedColor }}>
      {renderObject('', bodyWithDescription)}
      {displayLegend()}
    </div>
  );
}
