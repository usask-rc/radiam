import React from "react";
import { Chip } from "@material-ui/core";
import { FunctionField } from "react-admin";
import { getTranslation } from "../../_tools/funcs";
import { translate } from "ra-core";
import get from 'lodash/get';

//reference:  https://stackoverflow.com/questions/54366538/translate-textfield-value
const TranslationChipField = translate(({ translate, ...props }) => {
  //TODO: chipfields should go to their associated values' show pages if the user has access to said pages.
  const { hasCreate, hasEdit, hasList, hasShow, locale, resource, basePath, onClick, ...rest } = props
  return (
    <FunctionField {...rest}
      render={(record) =>
        record.label ?
          <Chip label={getTranslation(translate, get(rest, 'record.label'))} />
          : <Chip label="en.loading" />
      }
    />
  )
}
);

export default TranslationChipField;
