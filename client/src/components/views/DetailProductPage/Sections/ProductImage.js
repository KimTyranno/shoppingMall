import React from "react";
import { useState, useEffect } from "react";
import ImageGallery from "react-image-gallery";
function ProductImage(props) {
  const [Images, setImages] = useState([]);
  useEffect(() => {
    if (props.detail.images && props.detail.images.length > 0) {
      let images = [];
      props.detail.images.map((item) => {
        images.push({
          original: `http://localhost:5000/${item}`,
          thumbnail: `http://localhost:5000/${item}`,
        });
      });
      setImages(images);
    }
    // useEffect는 렌더링이 되고난 후, 실행이 되는데
    // props.detail은 비동기로 가져오고 있기때문에 (DetailProductPage.js에서 axois로) 처음 렌더링때는 아무것도 없다.
    // 근데 아래와 같이 useEffect(()=> {} , [props.detail] ) 라고 써주면
    // props.detail이 바뀔때 한번 더 렌더링 하라는뜻이 되므로 사진이 정상적으로 나온다.
  }, [props.detail]);
  return (
    <div>
      <ImageGallery items={Images}></ImageGallery>
    </div>
  );
}

export default ProductImage;
