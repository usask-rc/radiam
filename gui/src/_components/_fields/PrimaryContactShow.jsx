import React from "react";
import * as Constants from "../../_constants/index";

export const PrimaryContactShow = ({ record }) => {
  if ( record.first_name || record.lastname ) {
      return <span>{record.first_name} {record.last_name} ({record[Constants.model_fields.USERNAME]})</span>;
  } else {
      return <span>{record[Constants.model_fields.USERNAME]}</span>;
  }
};

