import React from "react";
import { translate } from "ra-core";
import get from "lodash/get";
import { FunctionField } from "react-admin";
import { getTranslation } from "../../_tools/funcs";
//reference:  https://stackoverflow.com/questions/54366538/translate-textfield-value

const TranslationField = translate(({ translate, ...props }) => {
  return (
    <FunctionField {...props}
      render={(record, source) =>
        getTranslation(translate, get(record, source))
      }
    />
  );
});

export default TranslationField;