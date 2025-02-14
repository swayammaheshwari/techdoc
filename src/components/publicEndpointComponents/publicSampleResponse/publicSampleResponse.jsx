import React, { useState } from 'react';
import { Accordion, Card } from 'react-bootstrap';
import JSONPretty from 'react-json-pretty';
import { FaChevronDown } from 'react-icons/fa6';
import { GoDotFill } from 'react-icons/go';
import './publicSampleResponse.scss';

const statusDotsColorEnums = {
  warning: '#ffc107',
  danger: '#dc3545',
  success: 'green',
  info: '#17a2b8',
};

function RenderBody(props) {
  if (typeof props.body === 'object') {
    return <JSONPretty data={props.body} />;
  } else {
    if (!props?.body) return <pre>No Data Present!</pre>;
    try {
      const data = JSON.parse(props.body);
      return <JSONPretty data={data} />;
    } catch (err) {
      if (!props?.body) return <pre>No Data Present!</pre>;
      return <pre>{props.body}</pre>;
    }
  }
}

export default function PublicSampleResponse(props) {
  const [accordionState, setAccordionState] = useState(null);

  const handleAccordionClick = (index) => {
    setAccordionState((prevState) => {
      if (prevState === index) return null;
      return index;
    });
  };

  const selectColorBasedOnStatus = (status) => {
    const statusInNumber = parseInt(status, 10);
    if (statusInNumber === NaN || !statusInNumber) return statusDotsColorEnums.warning;
    if (statusInNumber > 100 && statusInNumber < 199) return statusDotsColorEnums.info;
    if (statusInNumber > 199 && statusInNumber < 300) return statusDotsColorEnums.success;
    if (statusInNumber > 299 && statusInNumber < 400) return statusDotsColorEnums.warning;
    if (statusInNumber > 399 && statusInNumber < 600) return statusDotsColorEnums.danger;
  };

  if (props?.sampleResponse && props?.sampleResponse?.length === 0) return null;

  return (
    <div className='my-4'>
      <h6 className='mb-2 fw-500'>Sample Responses</h6>
      <div className='border rounded'>
        {props?.sampleResponse?.map((sampleResponse, index) => {
          if (!sampleResponse?.status) return null;
          return (
            <div className={`accordion-main-container ${index === 0 ? 'first-response-border-none' : ''}`}>
              <button className='accordion-head cursor-pointer d-flex justify-content-between align-items-center p-3 rounded' onClick={() => handleAccordionClick(index)} style={{ background: props?.themeShadedColor }}>
                <div>
                  <div className='d-flex justify-content-start align-items-center'>
                    <GoDotFill size={16} color={selectColorBasedOnStatus(sampleResponse?.status)} />
                    <p className='mx-1 my-0 text-left'>{sampleResponse?.status}</p>
                  </div>
                  {sampleResponse?.title && <span className='sample-response-title text-secondary mx-1'>{sampleResponse?.title}</span>}
                </div>
                <FaChevronDown size={10} />
              </button>
              {accordionState === index && (
                <div className='accordion-body p-3'>
                  {sampleResponse?.description && (
                    <div className='my-2'>
                      <p className='mb-1 text-left text-secondary'>Description</p>
                      <div className='bg-white p-2 rounded border'>{sampleResponse?.description}</div>
                    </div>
                  )}
                  {sampleResponse?.data && (
                    <div className='response-body-container my-2'>
                      <p className='mb-1 text-left text-secondary'>Response Body</p>
                      <div className='bg-white p-2 rounded border'>
                        <RenderBody body={sampleResponse?.data} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
