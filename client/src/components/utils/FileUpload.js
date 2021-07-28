import React, { useState } from "react";
import Dropzone from "react-dropzone";
import { Icon } from "antd";
import axios from "axios";
function FileUpload(props) {
  const [Images, setImages] = useState([]);
  const dropHandler = (files) => {
    let formData = new FormData();

    const config = {
      // 어떠한 파일인지에 대한 content-type정의 백엔드에서 받을때 에러없이 받을 수 있게함
      header: { "content-type": "multipart/form-data" },
    };

    formData.append("file", files[0]);
    axios.post("/api/product/image", formData, config).then((resp) => {
      if (resp.data.success) {
        console.log(resp.data);
        setImages([...Images, resp.data.filePath]);
        console.log("set이미지후" + Images);
        props.refreshFunction([...Images, resp.data.filePath]);
      } else {
        alert("파일저장 실패");
      }
    });
  };

  const deleteHandler = (image) => {
    const currentIndex = Images.indexOf(image);

    let newImages = [...Images];
    newImages.splice(currentIndex, 1);

    setImages(newImages);

    props.refreshFunction([...Images], newImages);
  };
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Dropzone onDrop={dropHandler}>
        {({ getRootProps, getInputProps }) => (
          <div
            style={{
              width: 300,
              height: 240,
              display: "flex",
              border: "1px solid lightgray",
              alignItems: "center",
              justifyContent: "center",
            }}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <Icon type="plus" style={{ fontSize: "3rem" }} />
          </div>
        )}
      </Dropzone>

      <div
        style={{
          display: "flex",
          width: "350px",
          height: "260px",
          overflowX: "scroll",
        }}
      >
        {Images.map((image, index) => (
          <div onClick={() => deleteHandler(image)} key={index}>
            <img
              style={{ minWidth: "300px", width: "300px", height: "240px" }}
              src={`http://localhost:5000/${image}`}
            ></img>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileUpload;
