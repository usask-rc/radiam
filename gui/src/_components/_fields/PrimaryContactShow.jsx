import React from "react";
import {MODEL_FIELDS} from "../../_constants/index";


export const PrimaryContactShow = ({ record }) => {
  if ( record.first_name || record.lastname ) {
      return <span>{record.first_name} {record.last_name} ({record[MODEL_FIELDS.USERNAME]})</span>;
  } else {
      return <span>{record[MODEL_FIELDS.USERNAME]}</span>;
  }
};

