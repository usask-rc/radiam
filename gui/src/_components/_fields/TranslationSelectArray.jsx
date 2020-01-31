//TranslationSelectArray.jsx
import React from 'react';
import get from 'lodash/get';
import { getTranslation } from '../../_tools/funcs';
import { SelectArrayInput } from 'ra-ui-materialui/lib/input';
import { translate } from "ra-core"
import {MODEL_FIELDS} from "../../_constants/index"

//TODO: this `record`.`label` is a bad hardcode and should be made more flexible as it depends on the API sending something named 'label'.
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
