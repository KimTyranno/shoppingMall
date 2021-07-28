import React from "react";
import { Input } from "antd";
import { useState } from "react";

const { Search } = Input;
function SearchFeature(props) {
  const [SearchTerm, setSearchTerm] = useState("");

  const searchHandler = (event) => {
    setSearchTerm(event.currentTarget.value);
    props.refreshFunction(event.currentTarget.value);
  };
  return (
    <div>
      <Search
        placeholder="input search text"
        style={{ width: 200 }}
        onChange={searchHandler}
        value={SearchTerm}
      />
    </div>
  );
}

export default SearchFeature;
