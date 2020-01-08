import React from "react";

import Img from "../../static/img/banner.jpg";

const Banner = () => {
  return (
    <div className="banner__img">
      <img src={Img} alt="Banner" />
    </div>
  );
};

export default Banner;
