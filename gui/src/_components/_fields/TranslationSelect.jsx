//Translationselect.jsx
import React from 'react';
import { SelectInput } from 'react-admin';
import { translate } from "ra-core"
import { getTranslation } from '../../_tools/funcs';

const TranslationSelect = translate(({ translate, ...props }) => {
  return (
    <SelectInput {...props}
      optionText={(record) => {
        return getTranslation(translate, record.label)
      }
      } />
  );
});

export default TranslationSelect


