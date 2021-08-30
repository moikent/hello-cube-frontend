import logo from "./logo.svg";
import "./App.css";
import CubeTry from "./pages/cubetry";
import Table from "./pages/cubetwo";
import Barchart from "./pages/cubethree";
import LineChart from "./pages/cubefour";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}

      <div className="row">
        <div className="col-md-6 my-4" style={{ height: "300px" }} >
          <div className="display-7 my-4">Customer who rented the most film</div>
          <Barchart />
        </div>
        <div className="col-md-6 my-4" style={{ height: "300px" }} >
          <div className="display-7 my-4">Actor who has the most film</div>
          <Table />
        </div>
        <div className="col-md-6 my-4" style={{ height: "300px" }} >
          <div className="display-7 my-4">Actor who has the most film</div>
          <LineChart />
        </div>
      </div>
    </div>
  );
}

export default App;
