//TranslationSelectArray.jsx
import React from 'react';
import get from 'lodash/get';
import { getTranslation } from '../../_tools/funcs';
import { SelectArrayInput } from 'ra-ui-materialui/lib/input';
import { translate } from "ra-core"
import {MODEL_FIELDS} from "../../_constants/index"

const TranslationSelectArray = translate(({ translate, record,  ...props }) => {
    return (
        <SelectArrayInput {...props}
              optionText={(record) => {
                return getTranslation(translate, get(record, MODEL_FIELDS.LABEL));
              }
            }
        />
    );
});

export default TranslationSelectArray
