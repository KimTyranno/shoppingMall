import React from "react";
import { Carousel } from "antd";
function ImageSlider(props) {
  return (
    <div>
      <Carousel autoplay>
        {props.images.map((image, idx) => (
          <div key={idx}>
            <img
              style={{ width: "100%", maxHeight: "150px" }}
              src={`http://localhost:5000/${image}`}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default ImageSlider;
