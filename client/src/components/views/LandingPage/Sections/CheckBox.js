import React, { useState } from "react";
import { Collapse, Checkbox } from "antd";

const { Panel } = Collapse;
function CheckBox(props) {
  const [Checked, setChecked] = useState([]);
  const handleToggle = (val) => {
    // 누른것의 index를 구한뒤,
    // 전체 Checked된 State에서 현재 누른CheckBox에 이미 있으면 빼주고 State에 넣어줌
    const curIdx = Checked.indexOf(val);
    const newChecked = [...Checked];
    if (curIdx === -1) {
      newChecked.push(val);
    } else {
      newChecked.splice(curIdx, 1);
    }
    setChecked(newChecked);

    props.handleFilters(newChecked);
  };

  const renderCheckBoxLists = () =>
    props.list &&
    props.list.map((val, idx) => (
      // React.Fragment는 무슨용도일까?
      <React.Fragment key={idx}>
        <Checkbox
          onChange={() => handleToggle(val._id)}
          checked={Checked.indexOf(val._id) === -1 ? false : true}
        />
        <span>{val.name}</span>
      </React.Fragment>
    ));
  return (
    <div>
      <Collapse defaultActiveKey={["0"]}>
        <Panel header="Continents" key="1">
          {renderCheckBoxLists()}
        </Panel>
      </Collapse>
    </div>
  );
}

export default CheckBox;
