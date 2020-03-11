import React from "react";
import Chip from "@material-ui/core/Chip";
import { FunctionField } from "react-admin";
import { getTranslation } from "../../_tools/funcs";
import { translate } from "ra-core";
import get from 'lodash/get';

const TranslationChipField = translate(({ translate, ...props }) => {
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
