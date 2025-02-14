import React, { useEffect, useRef, useState } from 'react';
import AutoSuggest from 'env-autosuggest';
import { restoreCaretPosition, getCaretPosition } from '../../../utilities/caretUtility';

export default function GenericPublicTableAutosuggest(props) {
  const genericPublicAutoSuggestRef = useRef(null);

  const [htmlData, sethtmlData] = useState(props?.htmlValue);

  useEffect(() => {
    sethtmlData(props?.htmlValue);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (document.activeElement !== genericPublicAutoSuggestRef?.current) sethtmlData(props?.htmlValue || '');
    }, 0);
  }, [props?.htmlValue]);

  const handleValueChange = () => {
    const caretPosition = getCaretPosition(genericPublicAutoSuggestRef.current);
    const value = genericPublicAutoSuggestRef?.current?.innerHTML === '<br>' ? '' : genericPublicAutoSuggestRef?.current?.innerHTML;
    props?.handleChange(value);
    setTimeout(() => restoreCaretPosition(genericPublicAutoSuggestRef.current, caretPosition), 0);
  };

  return <AutoSuggest contentEditableDivRef={genericPublicAutoSuggestRef} suggestions={props?.suggestions} handleValueChange={handleValueChange} initial={htmlData} disable={props?.disable} placeholder={props?.placeholder || ''} />;
}
