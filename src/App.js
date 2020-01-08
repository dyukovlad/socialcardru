import React, { Component } from "react";
import Breadcrumbs from "./components/Breadcrumbs/Breabcrumbs";

import Banner from "./components/Banner/Banner";
import FirstStep from "./components/FirstStep/FirstStep";
import SecondStep from "./components/SecondStep/SecondStep";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isStep: true,
      data: [],
      card: ""
    };
  }

  handleChangeInput = value => {
    this.setState({
      data: value.data,
      isStep: false,
      card: value.card
    });
  };

  render() {
    const { isStep, data, card } = this.state;
    return (
      <div className="container">
        <main>
          <Breadcrumbs />
          <form name="sender">
            <input type="hidden" name="Shop_IDP" value="" />
            <input type="hidden" name="Order_IDP" value="" />
            <input type="hidden" name="Subtotal_P" value="" />
            <input type="hidden" name="URL_RETURN" value="" />
            <input type="hidden" name="IData" value="" disabled />
            <input type="hidden" name="Lifetime" value="300" />
            <input type="hidden" name="Customer_IDP" value="" disabled />
            <input type="hidden" name="Signature" value="" />

            {isStep ? (
              <FirstStep onChangeInput={this.handleChangeInput} />
            ) : (
              <SecondStep data={data} card={card} />
            )}
          </form>
          <Banner />
        </main>
      </div>
    );
  }
}

export default App;
